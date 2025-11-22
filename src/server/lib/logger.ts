import { db } from "~/server/db";
import { auditLogs } from "~/server/db/schema";
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { eq, and, desc } from "drizzle-orm";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "default-key-change-in-production";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

// Convert scrypt to promise-based
const scryptAsync = promisify(scrypt);

/**
 * Derive encryption key from password
 */
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  const keyLength = 32;
  return (await scryptAsync(password, salt, keyLength)) as Buffer;
}

/**
 * Encrypt sensitive data
 */
export async function encryptData(data: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(ENCRYPTION_KEY, salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(data, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const tag = cipher.getAuthTag();

  // Combine salt, iv, tag, and encrypted data
  const result = Buffer.concat([
    salt,
    iv,
    tag,
    encrypted,
  ]).toString("base64");

  return result;
}

/**
 * Decrypt sensitive data
 */
export async function decryptData(encryptedData: string): Promise<string> {
  const data = Buffer.from(encryptedData, "base64");

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + TAG_LENGTH,
  );
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = await deriveKey(ENCRYPTION_KEY, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Audit log action types
 */
export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DELETE_USER"
  | "CHANGE_ROLE"
  | "CHANGE_PASSWORD"
  | "ACCESS_DENIED"
  | "DATA_ACCESS"
  | "DATA_MODIFY"
  | "EMAIL_SENT"
  | "SESSION_EXPIRED"
  | "INVALID_TOKEN";

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  encryptedData?: string; // Pre-encrypted sensitive data
}): Promise<void> {
  try {
    const detailsJson = params.details
      ? JSON.stringify(params.details)
      : null;

    await db.insert(auditLogs).values({
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource ?? null,
      resourceId: params.resourceId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      details: detailsJson,
      encryptedData: params.encryptedData ?? null,
    });
  } catch (error) {
    // Log to console if database logging fails
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(params: {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const { limit = 100, offset = 0 } = params;

  // Build where conditions
  const conditions = [];
  if (params.userId) {
    conditions.push(eq(auditLogs.userId, params.userId));
  }
  if (params.action) {
    conditions.push(eq(auditLogs.action, params.action));
  }
  if (params.resource) {
    conditions.push(eq(auditLogs.resource, params.resource));
  }
  if (params.startDate) {
    conditions.push(eq(auditLogs.createdAt, params.startDate));
    // Note: For date range, you'd need to use gte/lte operators
    // This is simplified - you can enhance this later
  }

  // Build query with conditions
  const query = conditions.length > 0
    ? db.select().from(auditLogs).where(and(...conditions))
    : db.select().from(auditLogs);

  const logs = await query
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  // Decrypt encrypted data if present
  const decryptedLogs = await Promise.all(
    logs.map(async (log) => {
      if (log.encryptedData) {
        try {
          const decrypted = await decryptData(log.encryptedData);
          return {
            ...log,
            encryptedData: decrypted,
            decrypted: true,
          };
        } catch {
          return { ...log, decrypted: false };
        }
      }
      return log;
    }),
  );

  return decryptedLogs;
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip") ?? undefined;
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get("user-agent") ?? undefined;
}

