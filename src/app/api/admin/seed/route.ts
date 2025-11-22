import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users, roles } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { initializeRoles, hashPassword } from "~/server/lib/auth";

/**
 * Seed admin user - Only accessible in development or with proper authentication
 */
export async function POST(request: Request) {
  try {
    // In production, you should protect this endpoint with authentication
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 },
      );
    }

    // Initialize roles
    await initializeRoles();

    // Get ADMIN role
    const adminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "ADMIN"))
      .limit(1);

    if (adminRole.length === 0) {
      throw new Error("ADMIN role not found");
    }

    const body = await request.json().catch(() => ({}));
    const email = body.email || "admin@portal.com";
    const password = body.password || "Admin123!";
    const name = body.name || "Admin";

    // Check if admin already exists
    const existingAdmins = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingAdmins.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
        email,
      });
    }

    // Create admin user
    const passwordHash = await hashPassword(password);
    const newAdmin = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        roleId: adminRole[0]!.id,
        emailVerified: true,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newAdmin[0]!.id,
        email: newAdmin[0]!.email,
        name: newAdmin[0]!.name,
      },
      loginCredentials: {
        email,
        password,
      },
    });
  } catch (error) {
    console.error("Seed admin error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}


