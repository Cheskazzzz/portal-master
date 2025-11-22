# Fix Migration Error: "relation already exists"

## Quick Fix (Recommended)

**For development, just use `db:push` instead:**

```bash
pnpm db:push
```

This syncs your schema directly without migration files. Perfect for development!

---

## Alternative Solutions

### Option 2: Reset Database and Use Migrations

If you want to use migrations properly (clean slate):

```bash
# 1. Connect to your database and drop everything
# Using psql:
psql your_database_url -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# OR using a GUI tool like pgAdmin or DBeaver:
# Drop all tables: portal_audit_log, portal_session, portal_user, portal_role, portal_post

# 2. Generate migrations
pnpm db:generate

# 3. Run migrations
pnpm db:migrate
```

⚠️ **WARNING**: This will delete ALL data in your database!

---

### Option 3: Skip Migration Files (Keep Existing Tables)

If you want to keep your data and just sync the schema:

```bash
# Just use push - it will update existing tables
pnpm db:push
```

This is the safest option if you have data you want to keep.

---

## When to Use Each Command

| Command | When to Use |
|---------|-------------|
| `pnpm db:push` | **Development** - Directly syncs schema, ignores migrations |
| `pnpm db:generate` | Create migration files from schema changes |
| `pnpm db:migrate` | **Production** - Apply migration files in order |

---

## Recommendation

Since you're in development and already have tables:
1. ✅ Use `pnpm db:push` going forward
2. ✅ It will automatically sync any schema changes
3. ✅ No need to worry about migration conflicts

For production deployment later, you can:
1. Generate proper migrations: `pnpm db:generate`
2. Run them: `pnpm db:migrate`

