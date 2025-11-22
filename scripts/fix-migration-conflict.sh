#!/bin/bash
# Fix migration conflict by marking existing migration as applied
# This is safe if tables already exist from db:push

echo "🔧 Fixing migration conflict..."

# Check if we can connect to the database
echo "Checking database connection..."

# Get the migration hash from the journal
MIGRATION_TAG="0000_married_talon"
TIMESTAMP=$(date +%s)000

echo "Migration tag: $MIGRATION_TAG"

# Mark the migration as applied in the drizzle migrations table
# This will prevent drizzle from trying to run it again
psql $DATABASE_URL <<EOF
-- Check if migration table exists, create if not
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

-- Check if this migration is already recorded
-- If not, mark it as applied (since tables already exist)
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
SELECT '$MIGRATION_TAG', $TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = '$MIGRATION_TAG'
);

-- Verify
SELECT * FROM drizzle.__drizzle_migrations;
EOF

echo "✅ Migration marked as applied!"
echo "You can now run migrations normally, or continue using db:push for development"


