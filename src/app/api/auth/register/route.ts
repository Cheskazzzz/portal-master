import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users, roles } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "~/server/lib/validation";
import { hashPassword, createSession, initializeRoles } from "~/server/lib/auth";
import { setSessionCookie } from "~/server/lib/session";
import {
  createAuditLog,
  getClientIp,
  getUserAgent,
} from "~/server/lib/logger";
import { sendWelcomeEmail } from "~/server/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate and sanitize input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);

      await createAuditLog({
        action: "CREATE_USER",
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

    const { name, email, password } = validationResult.data;

    // Initialize roles if needed
    await initializeRoles();

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    if (existingUsers.length > 0) {
      await createAuditLog({
        action: "CREATE_USER",
        ipAddress,
        userAgent,
        details: {
          reason: "email_already_exists",
          email,
        },
      });

      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 },
      );
    }

    // Get default USER role
    const userRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "USER"))
      .limit(1);

    if (userRole.length === 0) {
      throw new Error("USER role not found. Please initialize roles.");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        roleId: userRole[0]!.id,
        emailVerified: false,
        isActive: true,
      })
      .returning();

    const user = newUser[0]!;

    // Create session
    const sessionToken = await createSession(user.id, ipAddress, userAgent);

    // Set session cookie
    await setSessionCookie(sessionToken);

    // Log user creation
    await createAuditLog({
      userId: user.id,
      action: "CREATE_USER",
      resource: "user",
      resourceId: user.id,
      ipAddress,
      userAgent,
      details: {
        email: user.email,
        roleId: user.roleId,
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      userId: user.id,
      ipAddress,
      userAgent,
    }).catch((error) => {
      console.error("Failed to send welcome email:", error);
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}


