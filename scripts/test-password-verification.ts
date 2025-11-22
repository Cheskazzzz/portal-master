/**
 * Test password verification for a specific user
 */

import "./load-env";
import { db } from "../src/server/db";
import { users } from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../src/server/lib/auth";

async function testPassword() {
  const email = "ChefCurry@gmail.com";
  const password = "chefcurry2324";

  try {
    console.log(`Testing login for user: ${email}`);
    console.log(`Using password: ${password}`);

    // Get user from database
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
        plainPassword: users.plainPassword,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      console.log("❌ User not found");
      return;
    }

    const user = userResults[0]!;
    console.log(`Found user: ${user.name}`);
    console.log(`Plain password in DB: ${user.plainPassword}`);
    console.log(`Password hash in DB: ${user.passwordHash.substring(0, 20)}...`);

    // Test password verification
    const isValid = await verifyPassword(password, user.passwordHash);
    console.log(`Password "${password}" is ${isValid ? 'VALID' : 'INVALID'}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

testPassword();
