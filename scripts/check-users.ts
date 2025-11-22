/**
 * Check all users in the database
 */

import "./load-env";

import { db } from "../src/server/db";
import { users } from "../src/server/db/schema";

async function checkUsers() {
  try {
    console.log("=== USER ACCOUNTS DATABASE VIEW ===\n");

    const allUsers = await db
      .select({
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        plainPassword: users.plainPassword,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.createdAt);

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.roleId === 1 ? 'Admin' : 'User'}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`   Password: ${user.plainPassword || 'Not Set (Encrypted)'}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log("");
    });

  } catch (error) {
    console.error("Error querying users:", error);
  }
}

checkUsers();
