# Security Features Implementation

This document outlines the security features implemented in the portal application.

## ✅ Implemented Security Features

### 1. RBAC Authentication (Role-Based Access Control)

- **Database Schema**: Users, roles, and sessions are stored in PostgreSQL
- **Roles**: ADMIN, USER, GUEST
- **Session Management**: Secure HTTP-only cookies with expiration
- **Password Hashing**: bcrypt with 12 salt rounds

**Usage**:
```typescript
import { requireRole } from "~/server/lib/session";
const session = await requireRole(["ADMIN"], request);
```

### 2. Input Validation and Sanitization

- **Zod Schemas**: All inputs validated using Zod
- **Sanitization**: Functions to remove dangerous characters and prevent XSS
- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, number

**Validation Schemas**:
- `emailSchema`: Validates email format
- `passwordSchema`: Validates password strength
- `nameSchema`: Validates and sanitizes names
- `loginSchema` / `registerSchema`: Combined validation schemas

### 3. Prepared Statements

- **Drizzle ORM**: Automatically uses prepared statements for all database queries
- **SQL Injection Protection**: All queries are parameterized

### 4. Session Management and Secure Cookies

- **HTTP-Only Cookies**: Sessions stored in HTTP-only cookies (not accessible via JavaScript)
- **Secure Flag**: Enabled in production (HTTPS only)
- **SameSite**: Set to "lax" to prevent CSRF attacks
- **Session Timeout**: 7 days expiration
- **Automatic Cleanup**: Expired sessions are removed

**Session Flow**:
1. User logs in → Session created in database
2. Session token stored in HTTP-only cookie
3. Token validated on each request
4. Session expires after 7 days or on logout

### 5. Data Encryption and Audit Logs

- **AES-256-GCM Encryption**: Sensitive data encrypted before storage
- **Audit Logging**: All security-relevant actions logged
- **Admin Log Viewer**: Frontend page for admins to view logs (`/account/admin/logs`)

**Audit Log Actions**:
- LOGIN, LOGOUT, LOGIN_FAILED
- CREATE_USER, UPDATE_USER, DELETE_USER
- CHANGE_ROLE, CHANGE_PASSWORD
- ACCESS_DENIED, DATA_ACCESS, DATA_MODIFY
- EMAIL_SENT, SESSION_EXPIRED, INVALID_TOKEN

**Log Viewer**: Only accessible by ADMIN role

### 6. Email Capabilities (Nodemailer)

- **SMTP Configuration**: Configurable via environment variables
- **Email Types**:
  - Welcome emails (on registration)
  - Password reset emails
  - Notification emails
- **Audit Logging**: All emails logged in audit system

**Environment Variables**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@portal.com
SMTP_SECURE=false
```

### 7. HTTPS/SSL Configuration

- **Security Headers**: Added in `next.config.js`
  - Strict-Transport-Security (HSTS)
  - X-Frame-Options
  - X-Content-Type-Options
  - X-XSS-Protection
  - Referrer-Policy
  - Permissions-Policy

**Production Deployment**:
- Configure HTTPS at reverse proxy level (nginx, Cloudflare, etc.)
- SSL certificates managed by hosting provider
- For local development with HTTPS, use tools like `mkcert`

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/portal
ENCRYPTION_KEY=your-32-character-encryption-key-minimum
NODE_ENV=production

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@portal.com
SMTP_SECURE=false
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Database Migration

```bash
# Generate migration
pnpm db:generate

# Run migration
pnpm db:migrate

# Or push schema directly (development only)
pnpm db:push
```

### 4. Seed Admin User (Development Only)

```bash
# Using curl or Postman
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@portal.com", "password": "Admin123!", "name": "Admin"}'
```

**Default credentials** (if no body provided):
- Email: `admin@portal.com`
- Password: `Admin123!`

⚠️ **Important**: This endpoint is only available in development mode.

## 📁 File Structure

```
src/
├── server/
│   ├── db/
│   │   └── schema.ts          # Database schema (users, roles, sessions, audit logs)
│   ├── lib/
│   │   ├── auth.ts            # Authentication utilities (hashing, sessions)
│   │   ├── validation.ts      # Input validation and sanitization
│   │   ├── session.ts         # Session management
│   │   ├── logger.ts          # Audit logging and encryption
│   │   └── email.ts           # Email functionality
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # Login endpoint
│       │   ├── register/route.ts   # Registration endpoint
│       │   ├── logout/route.ts     # Logout endpoint
│       │   └── session/route.ts    # Session check endpoint
│       └── admin/
│           ├── logs/route.ts       # Audit logs endpoint (ADMIN only)
│           └── seed/route.ts       # Seed admin user (dev only)
└── app/
    └── account/
        ├── admin/
        │   └── logs/
        │       └── page.tsx        # Admin log viewer UI
        ├── login/
        │   └── page.tsx            # Login page
        └── register/
            └── page.tsx            # Registration page
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use environment variables in production
2. **Change default encryption key** - Generate a strong random key (32+ characters)
3. **Use strong passwords** - Enforced via validation schema
4. **HTTPS in production** - Always use HTTPS for secure cookie transmission
5. **Regular audits** - Review audit logs regularly
6. **Session cleanup** - Implement periodic cleanup of expired sessions
7. **Rate limiting** - Consider adding rate limiting for login attempts (future enhancement)

## 🚀 Production Checklist

- [ ] Change `ENCRYPTION_KEY` to a strong random value
- [ ] Configure SMTP settings for production
- [ ] Set up HTTPS/SSL certificates
- [ ] Review and adjust security headers in `next.config.js`
- [ ] Remove or secure `/api/admin/seed` endpoint
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Review audit logs regularly
- [ ] Keep dependencies updated

## 📝 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Check current session

### Admin (Requires ADMIN role)

- `GET /api/admin/logs` - Get audit logs
  - Query params: `userId`, `action`, `resource`, `limit`, `offset`
- `POST /api/admin/seed` - Seed admin user (dev only)

## 🐛 Troubleshooting

### Session not persisting
- Check cookie settings (HTTP-only, Secure, SameSite)
- Verify HTTPS is enabled in production
- Check browser console for cookie issues

### Email not sending
- Verify SMTP credentials in `.env`
- Check SMTP server logs
- Ensure firewall allows SMTP port

### Audit logs not showing
- Verify user has ADMIN role
- Check database connection
- Review server logs for errors

