import nodemailer from "nodemailer";
import { createAuditLog } from "./logger";

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true for 465, false for other ports
  auth: SMTP_USER && SMTP_PASS
    ? {
        user: SMTP_USER,
        pass: SMTP_PASS,
      }
    : undefined,
});

/**
 * Send an email
 */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { to, subject, html, text, from = SMTP_FROM } = params;

    // Validate email configuration
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP not configured. Email sending disabled.");
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    const mailOptions = {
      from: from || `Portal <${SMTP_FROM}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text: text ?? html?.replace(/<[^>]*>/g, ""), // Strip HTML if no text provided
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email sent
    await createAuditLog({
      userId: params.userId,
      action: "EMAIL_SENT",
      resource: "email",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: {
        to: Array.isArray(to) ? to : [to],
        subject,
        messageId: info.messageId,
      },
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await createAuditLog({
      userId: params.userId,
      action: "EMAIL_SENT",
      resource: "email",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: {
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        error: errorMessage,
      },
    });

    console.error("Email sending failed:", error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: "Welcome to Portal!",
    html: `
      <h1>Welcome, ${params.name}!</h1>
      <p>Thank you for registering with Portal. We're excited to have you on board!</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The Portal Team</p>
    `,
    text: `Welcome, ${params.name}! Thank you for registering with Portal.`,
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetToken: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/account/reset-password?token=${params.resetToken}`;

  return sendEmail({
    to: params.to,
    subject: "Password Reset Request",
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
    text: `Password Reset Request\n\nClick this link to reset your password: ${resetUrl}`,
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: params.subject,
    html: `<p>${params.message.replace(/\n/g, "<br>")}</p>`,
    text: params.message,
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}


