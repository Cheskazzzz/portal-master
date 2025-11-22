import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { loginSchema, validateAndSanitizeEmail } from "~/server/lib/validation";
import { hashPassword, verifyPassword, createSession } from "~/server/lib/auth";
import { setSessionCookie } from "~/server/lib/session";
import {
  createAuditLog,
  getClientIp,
  getUserAgent,
} from "~/server/lib/logger";
import { sendWelcomeEmail } from "~/server/lib/email";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    // Validate and sanitize input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);

      await createAuditLog({
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        details: {
          reason: "validation_error",
          errors: validationResult.error.errors,
        },
      });

      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email (case-insensitive)
    const userResults = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    if (userResults.length === 0) {
      await createAuditLog({
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        details: {
          reason: "user_not_found",
          email,
        },
      });

      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = userResults[0]!;

    // Check if user is active
    if (!user.isActive) {
      await createAuditLog({
        userId: user.id,
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        details: {
          reason: "account_inactive",
        },
      });

      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 },
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      await createAuditLog({
        userId: user.id,
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        details: {
          reason: "invalid_password",
        },
      });

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Create session
    const sessionToken = await createSession(user.id, ipAddress, userAgent);

    // Set session cookie
    await setSessionCookie(sessionToken);

    // Log successful login
    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      ipAddress,
      userAgent,
      details: {
        email: user.email,
        roleId: user.roleId,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      },
    });
  } catch (error) {
    // Log full stack when available for better debugging in server logs
    if (error instanceof Error) {
      console.error("Login error:", error.stack);
    } else {
      console.error("Login error:", error);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
