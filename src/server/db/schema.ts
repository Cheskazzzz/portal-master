// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator, text, timestamp, varchar, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `portal_${name}`);

// Posts table (existing)
export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

// Roles enum equivalent - using varchar with constraint
export const roles = createTable(
  "role",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 50 }).notNull().unique(),
    description: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [index("role_name_idx").on(t.name)],
);

// Users table with RBAC support
export const users = createTable(
  "user",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    email: d.varchar({ length: 320 }).notNull().unique(),
    passwordHash: d.text().notNull(), // bcrypt hash
    plainPassword: d.varchar({ length: 256 }), // For admin visibility only (security risk)
    roleId: d.integer().references(() => roles.id).notNull().default(2), // Default to user role
    emailVerified: d.boolean().default(false).notNull(),
    isActive: d.boolean().default(true).notNull(),
    lastLoginAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("user_email_idx").on(t.email),
    index("user_role_idx").on(t.roleId),
  ],
);

// Sessions table for secure session management
export const sessions = createTable(
  "session",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d.uuid().references(() => users.id, { onDelete: "cascade" }).notNull(),
    sessionToken: d.varchar({ length: 255 }).notNull().unique(),
    expiresAt: d.timestamp({ withTimezone: true }).notNull(),
    ipAddress: d.varchar({ length: 45 }), // IPv6 compatible
    userAgent: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [
    index("session_token_idx").on(t.sessionToken),
    index("session_user_idx").on(t.userId),
    index("session_expires_idx").on(t.expiresAt),
  ],
);

// Audit logs table for security monitoring
export const auditLogs = createTable(
  "audit_log",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d.uuid().references(() => users.id, { onDelete: "set null" }),
    action: d.varchar({ length: 100 }).notNull(), // e.g., "LOGIN", "LOGOUT", "CREATE_USER", "DELETE_USER"
    resource: d.varchar({ length: 100 }), // e.g., "user", "session", "appointment"
    resourceId: d.uuid(),
    ipAddress: d.varchar({ length: 45 }),
    userAgent: d.text(),
    details: d.text(), // JSON string for additional details
    encryptedData: d.text(), // For sensitive data encryption
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  }),
  (t) => [
    index("audit_user_idx").on(t.userId),
    index("audit_action_idx").on(t.action),
    index("audit_created_idx").on(t.createdAt),
  ],
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  sessions: many(sessions),
  auditLogs: many(auditLogs),
  appointments: many(appointments), // Add this line
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));


// Add this to your schema.ts file

// Appointments table
export const appointments = createTable(
  "appointment",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    userId: d.uuid().references(() => users.id, { onDelete: "cascade" }).notNull(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    appointmentDate: d.timestamp({ withTimezone: true }).notNull(),
    status: d.varchar({ length: 50 }).default('pending').notNull(), // pending, confirmed, cancelled, completed
    location: d.varchar({ length: 512 }),
    notes: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("appointment_user_idx").on(t.userId),
    index("appointment_date_idx").on(t.appointmentDate),
    index("appointment_status_idx").on(t.status),
  ],
);

// Add this to your relations section
export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));
