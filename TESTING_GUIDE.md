# Security Features Testing Guide

This guide will help you test all the security features implemented in the portal application.

## 🚀 Prerequisites

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/portal
   ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
   NODE_ENV=development
   
   # Optional: Email configuration for testing email features
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@portal.com
   SMTP_SECURE=false
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start the database:**
   ```bash
   # Using the provided script
   ./start-database.sh
   
   # Or manually with Docker
   docker run -d \
     --name portal-postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=portal \
     -p 5432:5432 \
     postgres
   ```

4. **Run database migrations:**
   ```bash
   # Push schema directly (development)
   pnpm db:push
   
   # Or generate and run migrations
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Create admin user:**
   ```bash
   # Using the setup script
   pnpm setup:admin
   
   # Or via API (development only)
   curl -X POST http://localhost:3000/api/admin/seed \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@portal.com", "password": "Admin123!", "name": "Admin"}'
   ```

6. **Start the development server:**
   ```bash
   pnpm dev
   ```

The app will be running at `http://localhost:3000`

---

## ✅ Testing Checklist

### 1. RBAC Authentication (Role-Based Access Control)

#### Test 1.1: Register a new user
- **Action:** Go to `/account/register`
- **Input:**
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `Test123!` (must contain uppercase, lowercase, number)
- **Expected:**
  - ✅ User is created with default "USER" role
  - ✅ Redirected to `/account/appointments`
  - ✅ Welcome email sent (if SMTP configured)
  - ✅ Audit log entry created: `CREATE_USER`

**Verify:**
```bash
# Check session cookie (HTTP-only, should not be accessible via JavaScript)
# Open browser DevTools → Application → Cookies
# Look for: portal_session (HTTPOnly, Secure in production)
```

#### Test 1.2: Login with credentials
- **Action:** Go to `/account/login`
- **Input:**
  - Email: `test@example.com`
  - Password: `Test123!`
- **Expected:**
  - ✅ Successful login
  - ✅ HTTP-only session cookie set
  - ✅ Redirected to `/account/appointments`
  - ✅ Audit log entry: `LOGIN`

#### Test 1.3: Login with admin credentials
- **Action:** Go to `/account/login`
- **Input:**
  - Email: `admin@portal.com`
  - Password: `Admin123!` (or the password you set)
- **Expected:**
  - ✅ Successful login
  - ✅ Admin role detected
  - ✅ Can access `/account/admin` page
  - ✅ Can access `/account/admin/logs` page

#### Test 1.4: Access control - non-admin trying to access admin pages
- **Action:** While logged in as regular user (`test@example.com`)
- **Try to access:** `/account/admin/logs`
- **Expected:**
  - ✅ Redirected to login page or shown "Forbidden"
  - ✅ Audit log entry: `ACCESS_DENIED`

**Verify via API:**
```bash
# Try to access admin logs as regular user
curl -X GET http://localhost:3000/api/admin/logs \
  -H "Cookie: portal_session=YOUR_USER_SESSION_TOKEN"
# Expected: 403 Forbidden
```

#### Test 1.5: Logout
- **Action:** Click logout or go to `/account/logout`
- **Expected:**
  - ✅ Session cookie deleted
  - ✅ Session removed from database
  - ✅ Audit log entry: `LOGOUT`
  - ✅ Redirected to home page

**Verify:**
```bash
# Try to access protected route after logout
curl -X GET http://localhost:3000/api/auth/session
# Expected: {"user": null}
```

---

### 2. Input Validation and Sanitization

#### Test 2.1: Password validation - too short
- **Action:** Try to register with weak password
- **Input:**
  - Password: `short`
- **Expected:**
  - ✅ Validation error: "Password must be at least 8 characters"
  - ✅ Request rejected (400 Bad Request)

#### Test 2.2: Password validation - missing requirements
- **Action:** Try to register with password missing requirements
- **Input:**
  - Password: `alllowercase123` (missing uppercase)
  - Password: `ALLUPPERCASE123` (missing lowercase)
  - Password: `NoNumbers` (missing number)
- **Expected:**
  - ✅ Validation error about password requirements
  - ✅ Request rejected

#### Test 2.3: Email validation - invalid format
- **Action:** Try to register with invalid email
- **Input:**
  - Email: `notanemail`
- **Expected:**
  - ✅ Validation error: "Invalid email format"
  - ✅ Request rejected

#### Test 2.4: XSS prevention - script tags
- **Action:** Try to register with XSS attempt in name field
- **Input:**
  - Name: `<script>alert('XSS')</script>`
- **Expected:**
  - ✅ Script tags sanitized/removed
  - ✅ Sanitized name stored in database

**Verify via API:**
```bash
# Test with malicious input
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(1)</script>", "email": "xss@test.com", "password": "Test123!"}'
# Check database - script tags should be sanitized
```

#### Test 2.5: SQL injection prevention (handled by Drizzle)
- **Action:** Try to login with SQL injection attempt
- **Input:**
  - Email: `admin@portal.com' OR '1'='1`
- **Expected:**
  - ✅ No SQL injection possible
  - ✅ Treated as invalid email format or login fails
  - ✅ Prepared statements prevent SQL injection

---

### 3. Prepared Statements

**This is automatically handled by Drizzle ORM, but you can verify:**

#### Test 3.1: Verify prepared statements
- **Action:** All database queries use Drizzle ORM
- **Expected:**
  - ✅ All queries are parameterized
  - ✅ No raw SQL concatenation
  - ✅ SQL injection attempts fail safely

**Check code:**
- Look at `src/app/api/auth/login/route.ts` - uses `db.select().from(users).where(eq(users.email, email))`
- This automatically uses prepared statements

---

### 4. Session Management and Secure Cookies

#### Test 4.1: HTTP-only cookie
- **Action:** Login and check cookies in browser
- **Expected:**
  - ✅ Cookie `portal_session` is HTTP-only
  - ✅ Cannot access via `document.cookie` in browser console
  - ✅ Cookie only accessible via HTTP requests

**Verify:**
```javascript
// In browser console after login:
console.log(document.cookie);
// Expected: portal_session should NOT appear (HTTP-only)
```

#### Test 4.2: Secure flag (production)
- **Action:** Check cookie in production mode
- **Expected:**
  - ✅ Cookie has `Secure` flag (HTTPS only)
  - ✅ Cookie sent only over HTTPS connections

#### Test 4.3: Session timeout
- **Action:** Wait for session to expire (or manually expire in database)
- **Expected:**
  - ✅ Session expires after 7 days
  - ✅ Expired sessions rejected
  - ✅ User redirected to login

**Manual test:**
```sql
-- Update session expiry to test
UPDATE portal_session 
SET expires_at = NOW() - INTERVAL '1 day' 
WHERE session_token = 'YOUR_TOKEN';
```

#### Test 4.4: Session cleanup
- **Action:** Expired sessions should be cleaned up
- **Expected:**
  - ✅ Old sessions removed from database
  - ✅ Cleanup can be run manually or via cron

**Test cleanup:**
```bash
# Create a cleanup script or run manually
# Check sessions table - expired ones should be removed
```

#### Test 4.5: Same-site protection
- **Action:** Check cookie SameSite attribute
- **Expected:**
  - ✅ Cookie has `SameSite=Lax`
  - ✅ Prevents CSRF attacks

**Verify in browser DevTools:**
- Application → Cookies → portal_session
- Check SameSite column: should show "Lax"

---

### 5. Data Encryption and Logs

#### Test 5.1: View audit logs as admin
- **Action:** Login as admin and go to `/account/admin/logs`
- **Expected:**
  - ✅ See all audit log entries
  - ✅ See logs for: LOGIN, LOGOUT, CREATE_USER, etc.
  - ✅ Logs show IP address, user agent, timestamps

#### Test 5.2: Audit log filtering
- **Action:** Use filters on logs page
- **Test:**
  - Filter by action: `LOGIN`
  - Filter by resource: `user`
  - Change limit/offset
- **Expected:**
  - ✅ Filters work correctly
  - ✅ Pagination works

#### Test 5.3: Data encryption
- **Action:** Check if sensitive data is encrypted in logs
- **Expected:**
  - ✅ Encrypted data stored in `encryptedData` field
  - ✅ Can be decrypted when viewing (admin only)

**Verify:**
```sql
-- Check audit logs table
SELECT id, action, encrypted_data FROM portal_audit_log LIMIT 10;
-- encrypted_data should contain encrypted strings
```

#### Test 5.4: Log access restriction
- **Action:** Regular user tries to access `/api/admin/logs`
- **Expected:**
  - ✅ 403 Forbidden
  - ✅ Only ADMIN role can access
  - ✅ Access attempt logged: `ACCESS_DENIED`

**Test via API:**
```bash
# As regular user (get session token first)
curl -X GET http://localhost:3000/api/admin/logs \
  -H "Cookie: portal_session=REGULAR_USER_TOKEN"
# Expected: {"error": "Forbidden"}
```

#### Test 5.5: Verify all actions are logged
Perform these actions and check logs:
- ✅ Login → `LOGIN`
- ✅ Login failed → `LOGIN_FAILED`
- ✅ Logout → `LOGOUT`
- ✅ Register → `CREATE_USER`
- ✅ Access denied → `ACCESS_DENIED`
- ✅ Email sent → `EMAIL_SENT`

---

### 6. Email Capabilities

#### Test 6.1: Welcome email on registration
- **Action:** Register a new user
- **Expected:**
  - ✅ Welcome email sent (if SMTP configured)
  - ✅ Email logged in audit logs: `EMAIL_SENT`
  - ✅ Email contains user's name

**Setup Gmail SMTP (if needed):**
1. Enable 2FA on Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASS`

#### Test 6.2: Email logging
- **Action:** Check audit logs after email sent
- **Expected:**
  - ✅ Audit log entry with action: `EMAIL_SENT`
  - ✅ Details include: recipient, subject, messageId

**Verify:**
```bash
# Check audit logs
curl -X GET "http://localhost:3000/api/admin/logs?action=EMAIL_SENT" \
  -H "Cookie: portal_session=ADMIN_SESSION_TOKEN"
```

#### Test 6.3: Email without SMTP configuration
- **Action:** Register with SMTP not configured
- **Expected:**
  - ✅ Registration still succeeds
  - ✅ No email sent (gracefully handled)
  - ✅ Error logged but doesn't block registration

---

### 7. HTTPS/SSL Configuration

#### Test 7.1: Security headers (production)
- **Action:** Deploy to production and check response headers
- **Expected:**
  - ✅ `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - ✅ `X-Frame-Options: SAMEORIGIN`
  - ✅ `X-Content-Type-Options: nosniff`
  - ✅ `X-XSS-Protection: 1; mode=block`
  - ✅ `Referrer-Policy: origin-when-cross-origin`

**Test via curl:**
```bash
curl -I https://your-domain.com
# Check response headers
```

#### Test 7.2: Local HTTPS (optional)
For local HTTPS testing:
```bash
# Install mkcert
npm install -g mkcert
# Or: brew install mkcert (macOS) / choco install mkcert (Windows)

# Create local CA
mkcert -install

# Generate certificate
mkcert localhost 127.0.0.1 ::1

# Update next.config.js or use a reverse proxy like nginx
```

---

## 🧪 Quick Test Script

Create a test script to verify everything:

```bash
#!/bin/bash
# quick-test.sh

BASE_URL="http://localhost:3000"

echo "🧪 Testing Security Features..."

# 1. Test registration
echo "1. Testing registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "Test123!"}')

if echo "$REGISTER_RESPONSE" | grep -q "success"; then
  echo "✅ Registration successful"
else
  echo "❌ Registration failed"
  echo "$REGISTER_RESPONSE"
fi

# 2. Test login
echo "2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}' \
  -c cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
  echo "✅ Login successful"
  SESSION_TOKEN=$(grep -o 'portal_session[^;]*' cookies.txt | cut -d'=' -f2)
else
  echo "❌ Login failed"
  echo "$LOGIN_RESPONSE"
fi

# 3. Test session check
echo "3. Testing session..."
SESSION_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/session" \
  -b cookies.txt)

if echo "$SESSION_RESPONSE" | grep -q "user"; then
  echo "✅ Session valid"
else
  echo "❌ Session invalid"
fi

# 4. Test admin access (should fail for regular user)
echo "4. Testing admin access control..."
ADMIN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/logs" \
  -b cookies.txt)

if echo "$ADMIN_RESPONSE" | grep -q "Forbidden\|Unauthorized"; then
  echo "✅ Access control working (correctly denied)"
else
  echo "⚠️  Access control might not be working"
fi

# 5. Test logout
echo "5. Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -b cookies.txt)

if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
  echo "✅ Logout successful"
else
  echo "❌ Logout failed"
fi

# 6. Test validation
echo "6. Testing input validation..."
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "invalid-email", "password": "short"}')

if echo "$VALIDATION_RESPONSE" | grep -q "error\|Invalid"; then
  echo "✅ Input validation working"
else
  echo "❌ Input validation failed"
fi

echo "🧪 Testing complete!"
rm -f cookies.txt
```

---

## 📊 Verification Checklist

After testing, verify:

- [ ] ✅ Users can register with valid credentials
- [ ] ✅ Password validation enforces requirements
- [ ] ✅ Email validation works
- [ ] ✅ Login creates secure HTTP-only session cookie
- [ ] ✅ Admin users can access admin pages
- [ ] ✅ Regular users cannot access admin pages
- [ ] ✅ Logout destroys session
- [ ] ✅ Session expires after timeout
- [ ] ✅ All actions logged in audit log
- [ ] ✅ Admin can view audit logs
- [ ] ✅ Email sending works (if configured)
- [ ] ✅ Security headers present (in production)
- [ ] ✅ XSS attempts are sanitized
- [ ] ✅ SQL injection attempts fail

---

## 🐛 Troubleshooting

### Database connection issues
```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker logs portal-postgres
```

### Session not persisting
- Check if cookies are being set: Browser DevTools → Application → Cookies
- Verify cookie is HTTP-only (should not appear in `document.cookie`)
- Check browser settings (third-party cookies, etc.)

### Email not sending
- Verify SMTP credentials in `.env`
- Check firewall allows SMTP port (587/465)
- For Gmail, ensure app password is used (not regular password)

### Audit logs not showing
- Verify user has ADMIN role
- Check database for entries: `SELECT * FROM portal_audit_log ORDER BY created_at DESC LIMIT 10;`
- Check API response: `/api/admin/logs`

---

## 📝 Notes

- All tests should be run in development mode first
- Production testing requires HTTPS setup
- Some features (email) require external configuration
- Audit logs accumulate - consider implementing log rotation for production

