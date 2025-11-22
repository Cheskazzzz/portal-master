import { cookies } from "next/headers";
import { validateSession, deleteSession as deleteDbSession } from "./auth";
import { createAuditLog, getClientIp, getUserAgent } from "./logger";


const SESSION_COOKIE_NAME = "portal_session";
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Set session cookie
 */
export async function setSessionCookie(
  sessionToken: string | null,
  options?: Partial<typeof SESSION_COOKIE_OPTIONS>,
): Promise<void> {
  const cookieStore = await cookies();

  if (!sessionToken) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return;
  }

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    ...SESSION_COOKIE_OPTIONS,
    ...options,
  });
}

/**
 * Get current session from cookie
 */
export async function getSession(request?: Request): Promise<{
  userId: string;
  roleId: number;
  email: string;
  name: string;
  sessionToken: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await validateSession(sessionToken);
    if (!session) {
      // Invalid or expired session - clear cookie
      await setSessionCookie(null);
      return null;
    }

    return {
      ...session,
      sessionToken,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request?: Request,
): Promise<{
  userId: string;
  roleId: number;
  email: string;
  name: string;
  sessionToken: string;
}> {
  const session = await getSession(request);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  allowedRoles: string[],
  request?: Request,
): Promise<{
  userId: string;
  roleId: number;
  email: string;
  name: string;
  sessionToken: string;
}> {
  const session = await requireAuth(request);

  const { hasRole, getRoleName } = await import("./auth");
  const roleName = await getRoleName(session.roleId);

  if (!roleName || !allowedRoles.includes(roleName)) {
    const ipAddress = request ? getClientIp(request) : undefined;
    const userAgent = request ? getUserAgent(request) : undefined;

    await createAuditLog({
      userId: session.userId,
      action: "ACCESS_DENIED",
      ipAddress,
      userAgent,
      details: {
        attemptedRole: roleName,
        requiredRoles: allowedRoles,
      },
    });

    throw new Error("Forbidden");
  }

  return session;
}

/**
 * Logout - delete session
 */
export async function logout(
  sessionToken: string,
  request?: Request,
): Promise<void> {
  const session = await validateSession(sessionToken);
  if (session) {
    const ipAddress = request ? getClientIp(request) : undefined;
    const userAgent = request ? getUserAgent(request) : undefined;

    await createAuditLog({
      userId: session.userId,
      action: "LOGOUT",
      ipAddress,
      userAgent,
    });
  }

  await deleteDbSession(sessionToken);
  await setSessionCookie(null);
}
