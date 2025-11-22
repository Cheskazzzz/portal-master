/**
 * Migration script to add plainPassword column to users table
 * Run with: pnpm tsx scripts/add-plainpassword-migration.ts
 */

import "./load-env";
import { db } from "../src/server/db";
import { sql } from "drizzle-orm";

async function addPlainPasswordColumn() {
  try {
    console.log("Adding plainPassword column to users table...");

    // Add the column to the existing table
    await db.execute(sql`
      ALTER TABLE portal_user
      ADD COLUMN "plainPassword" varchar(256)
    `);

    console.log("✅ Migration completed successfully!");
    console.log("The plainPassword column has been added to the users table");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

addPlainPasswordColumn();
