import { NextResponse, NextRequest } from "next/server";
import { getSession } from "~/server/lib/session";
import { db } from "~/server/db";
import { users, auditLogs, roles } from "~/server/db/schema";
import { hashPassword, initializeRoles } from "~/server/lib/auth";
import { eq } from "drizzle-orm";
import { validateAndSanitizeEmail } from "~/server/lib/validation";

// GET - List all users (admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      plainPassword: users.plainPassword,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.createdAt);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email: rawEmail, password, roleId } = body;

    console.log("Creating user with data:", { name, rawEmail, roleId });

    if (!name || !rawEmail || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    // Validate and normalize email
    const email = validateAndSanitizeEmail(rawEmail);
    if (!email) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    // Ensure roles are initialized
    await initializeRoles();

    // Verify the role exists
    if (roleId) {
      const roleExists = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
      if (roleExists.length === 0) {
        return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash: hashedPassword,
      plainPassword: password, // Store plain password for admin visibility
      roleId: roleId ?? 2, // Default to user role
      emailVerified: true, // Auto-verify for admin-created users
      isActive: true,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      isActive: users.isActive,
      plainPassword: users.plainPassword,
      createdAt: users.createdAt,
    });

    console.log("User created successfully:", newUser[0]);

    // Log the action
    if (session.userId) {
      await db.insert(auditLogs).values({
        userId: session.userId,
        action: "CREATE_USER",
        resource: "user",
        resourceId: newUser[0].id,
        details: `Created user: ${email}`,
      });
    }

    return NextResponse.json({
      message: "User created successfully",
      user: newUser[0]
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, password, roleId, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate that user exists
    const existingUsers = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existingUsers.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const existingUser = existingUsers[0]!;

    // Update user
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle password update only if a new password is provided
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateData.passwordHash = hashedPassword;
      updateData.plainPassword = password; // Store plain password for admin visibility
    }

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        isActive: users.isActive,
        plainPassword: users.plainPassword,
      });

    // Log the action
    if (session.userId) {
      await db.insert(auditLogs).values({
        userId: session.userId,
        action: "UPDATE_USER",
        resource: "user",
        resourceId: id,
        details: `Updated user: ${id}`,
      });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser[0]
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.roleId !== 1) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === session.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    // Log the action
    if (session.userId) {
      await db.insert(auditLogs).values({
        userId: session.userId,
        action: "DELETE_USER",
        resource: "user",
        resourceId: userId,
        details: `Deleted user: ${userId}`,
      });
    }

    return NextResponse.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
