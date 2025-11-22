import { z } from "zod";

/**
 * Common validation schemas for input sanitization and validation
 */

// Email validation
export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(320, "Email is too long")
  .transform((val) => val.toLowerCase().trim());

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  );

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(256, "Name is too long")
  .transform((val) => val.trim().replace(/\s+/g, " "));

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Register schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Session token schema
export const sessionTokenSchema = z
  .string()
  .min(32, "Invalid session token")
  .max(256, "Invalid session token");

// User ID schema
export const userIdSchema = z.string().uuid("Invalid user ID");

// Role schema
export const roleSchema = z.enum(["ADMIN", "USER", "GUEST"]);

// Sanitize string input - remove dangerous characters
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent XSS
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

// Sanitize HTML input (basic)
export function sanitizeHtml(input: string): string {
  const dangerous = /<script|javascript:|on\w+\s*=/gi;
  return input.replace(dangerous, "");
}

// Validate and sanitize email
export function validateAndSanitizeEmail(email: unknown): string | null {
  try {
    return emailSchema.parse(email);
  } catch {
    return null;
  }
}

// Validate and sanitize name
export function validateAndSanitizeName(name: unknown): string | null {
  try {
    return nameSchema.parse(name);
  } catch {
    return null;
  }
}

// Validate and sanitize password
export function validateAndSanitizePassword(
  password: unknown,
): string | null {
  try {
    return passwordSchema.parse(password);
  } catch {
    return null;
  }
}


