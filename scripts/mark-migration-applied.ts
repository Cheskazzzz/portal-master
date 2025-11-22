/**
 * Mark existing migration as applied since tables already exist
 * Run with: pnpm tsx scripts/mark-migration-applied.ts
 */

// IMPORTANT: Load .env FIRST before any other imports
import "./load-env";

import postgres from "postgres";

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables!");
  console.error("Please set DATABASE_URL in your .env file or environment.");
  process.exit(1);
}

async function markMigrationApplied() {
  const sql = postgres(DATABASE_URL!);

  try {
    console.log("🔧 Marking migration as applied...");

    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `;

    // Check if migration is already marked
    const existing = await sql`
      SELECT * FROM drizzle.__drizzle_migrations 
      WHERE hash = '0000_married_talon'
    `;

    if (existing.length > 0) {
      console.log("✅ Migration already marked as applied!");
      return;
    }

    // Mark migration as applied
    const timestamp = Date.now();
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES ('0000_married_talon', ${timestamp})
    `;

    console.log("✅ Migration marked as applied!");
    console.log("You can now run 'pnpm db:migrate' without errors.");
    
    // Verify
    const result = await sql`
      SELECT * FROM drizzle.__drizzle_migrations
    `;
    console.log("\n📋 Applied migrations:");
    result.forEach((m) => {
      console.log(`  - ${m.hash} (${new Date(Number(m.created_at)).toISOString()})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

markMigrationApplied()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
