/**
 * Debug script to check user status
 * Run with: pnpm tsx scripts/debug-user.ts IndianaPacers@yahoo.com
 */

import "./load-env";

import { db } from "../src/server/db";
import { users } from "../src/server/db/schema";
import { eq } from "drizzle-orm";

async function debugUser() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: pnpm tsx scripts/debug-user.ts <email>");
    process.exit(1);
  }

  try {
    console.log(`Checking user: ${email}`);

    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      console.log("❌ User not found");
      return;
    }

    const user = userResults[0]!;
    console.log("\n✅ User found:");
    console.log(`- ID: ${user.id}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role ID: ${user.roleId}`);
    console.log(`- Is Active: ${user.isActive}`);
    console.log(`- Email Verified: ${user.emailVerified}`);
    console.log(`- Created At: ${user.createdAt}`);
    console.log(`- Last Login: ${user.lastLoginAt || 'Never'}`);
    console.log(`- Password Hash: ${user.passwordHash ? 'Present (length: ' + user.passwordHash.length + ')' : 'MISSING!'}`);

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugUser();
