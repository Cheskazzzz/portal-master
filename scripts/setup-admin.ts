/**
 * Setup script to create an admin user in the database
 * Run with: pnpm tsx scripts/setup-admin.ts
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
// Drizzle ORM schema objects are properly typed, but the linter doesn't recognize them
// This is a false positive - the types are correct at runtime

// IMPORTANT: Load .env FIRST before any other imports
import "./load-env";

import { db } from "../src/server/db";
import { users, roles } from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { initializeRoles, hashPassword } from "../src/server/lib/auth";

async function setupAdmin() {
  try {
    console.log("Initializing roles...");
    await initializeRoles();

    console.log("Getting ADMIN role...");
    const adminRoleResult = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
      })
      .from(roles)
      .where(eq(roles.name, "ADMIN"))
      .limit(1);

    if (adminRoleResult.length === 0) {
      throw new Error("ADMIN role not found");
    }

    const email = process.env.ADMIN_EMAIL ?? "admin@portal.com";
    const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
    const name = process.env.ADMIN_NAME ?? "Admin";

    console.log(`Checking if admin user exists (email: ${email})...`);
    const existingAdmins = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingAdmins.length > 0) {
      console.log("Admin user already exists!");
      console.log("Email:", email);
      return;
    }

    console.log("Creating admin user...");
    const passwordHash = await hashPassword(password);
    const adminRoleId = adminRoleResult[0]?.id;
    if (!adminRoleId) {
      throw new Error("ADMIN role ID not found");
    }

    const newAdminResult = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        plainPassword: password, // Store plain password for admin visibility
        roleId: adminRoleId,
        emailVerified: true,
        isActive: true,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    const newAdmin = newAdminResult[0];
    if (!newAdmin) {
      throw new Error("Failed to create admin user");
    }

    console.log("\n✅ Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("User ID:", newAdmin.id);
    console.log("\n⚠️  Please change the default password after first login!");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error setting up admin:", errorMessage);
    console.error("Full error:", error);
    process.exit(1);
  }
}

setupAdmin()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Fatal error:", errorMessage);
    console.error("Full error:", error);
    process.exit(1);
  });
