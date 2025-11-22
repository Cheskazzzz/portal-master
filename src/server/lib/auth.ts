import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { users, sessions, roles } from "~/server/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes } from "crypto";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    userId,
    sessionToken,
    expiresAt,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });

  return sessionToken;
}

/**
 * Validate and get session information
 */
export async function validateSession(
  sessionToken: string,
): Promise<{ userId: string; roleId: number; email: string; name: string } | null> {
  try {
    const session = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
          roleId: users.roleId,
          isActive: users.isActive,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.sessionToken, sessionToken),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (session.length === 0 || !session[0]?.user.isActive) {
      return null;
    }

    const { user } = session[0]!;
    return {
      userId: user.id,
      roleId: user.roleId,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error("Error validating session:", error);
    return null;
  }
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
}

/**
 * Delete expired sessions
 */
export async function cleanupExpiredSessions(): Promise<void> {
  await db
    .delete(sessions)
    .where(gt(sessions.expiresAt, new Date()));
}

/**
 * Get role name by ID
 */
export async function getRoleName(roleId: number): Promise<string | null> {
  const role = await db
    .select({ name: roles.name })
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1);

  return role[0]?.name ?? null;
}

/**
 * Check if user has required role
 */
export async function hasRole(
  userId: string,
  requiredRoles: string[],
): Promise<boolean> {
  const user = await db
    .select({
      roleId: users.roleId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) return false;

  const roleName = await getRoleName(user[0]!.roleId);
  return roleName ? requiredRoles.includes(roleName) : false;
}

/**
 * Initialize default roles if they don't exist
 */
export async function initializeRoles(): Promise<void> {
  const existingRoles = await db.select().from(roles);
  const roleNames = existingRoles.map((r) => r.name);

  const defaultRoles = [
    { name: "ADMIN", description: "Administrator with full access" },
    { name: "USER", description: "Regular user" },
    { name: "GUEST", description: "Guest user with limited access" },
  ];

  for (const role of defaultRoles) {
    if (!roleNames.includes(role.name)) {
      await db.insert(roles).values(role);
    }
  }
}
