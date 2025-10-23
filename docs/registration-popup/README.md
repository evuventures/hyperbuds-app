# Email Verification Popup - Backend Implementation Guide

## 📋 Overview

This document describes the frontend implementation of the email verification popup and the backend requirements to support this feature.

## 🎯 Feature Summary

After a user successfully registers, a beautiful modal popup appears asking them to check their email for a verification link. This provides a better user experience than inline messages and guides users through the verification process.

---

## 🖼️ Frontend Implementation

### What We Built

**Component**: `src/components/auth/EmailVerificationModal.tsx`

**Features**:
- ✅ Animated modal with smooth transitions
- ✅ Displays user's email address
- ✅ "Go to Login" button (redirects to `/auth/signin`)
- ✅ "I'll verify later" button (closes modal)
- ✅ Close button (X) and backdrop click to close
- ✅ Prevents body scroll when open
- ✅ Light mode design matching auth pages
- ✅ Framer Motion animations
- ✅ Accessibility features (ARIA labels, keyboard support)

**Used In**: `src/components/auth/RegisterForm.tsx`

---

## 🔄 User Flow

### Current Implementation

1. **User fills registration form** (`/auth/register`)
   - Email address
   - Password (8-128 characters)

2. **User clicks "Sign Up"**

3. **Frontend sends POST request to backend**:
   ```
   POST /api/v1/auth/register
   ```

4. **Backend responds with success** (200 OK):
   - Frontend shows email verification modal
   - Modal displays user's email
   - User instructed to check email

5. **User has two options**:
   - Click "Go to Login" → Redirected to `/auth/signin`
   - Click "I'll verify later" → Modal closes, stay on registration page

6. **User checks email and clicks verification link**

7. **User returns to app and logs in**

---

## 🔧 Backend Requirements

### 1. Registration Endpoint

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Registration successful",
  "userId": "user-id-here"
}
```

**Note**: The success response triggers the popup modal on the frontend.

---

### 2. Email Sending

When registration is successful, the backend **MUST**:

1. **Create user account** (with `isVerified: false` or `emailVerified: false`)
2. **Generate verification token** (JWT or unique UUID)
3. **Send verification email** to the user

**Email Contents Should Include**:
- Welcome message
- Verification link (e.g., `https://yourapp.com/auth/verify-email?token={token}`)
- Link expiration time (recommended: 24 hours)
- Support contact if they didn't register

**Example Email Template**:
```html
Subject: Verify your email address

Hi there!

Thanks for signing up! Please verify your email address by clicking the link below:

[Verify Email Button/Link]
https://yourapp.com/auth/verify-email?token=abc123xyz

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The Team
```

---

### 3. Email Verification Endpoint

**Endpoint**: `GET /api/v1/auth/verify-email?token={token}`

**Query Parameters**:
- `token`: The verification token sent in the email

**Success Response** (200 OK):
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

**Error Responses**:

**Invalid/Expired Token** (400 Bad Request):
```json
{
  "message": "Invalid or expired verification token",
  "error": "INVALID_TOKEN"
}
```

**Already Verified** (200 OK):
```json
{
  "message": "Email already verified",
  "verified": true
}
```

---

### 4. Error Handling

**Registration Errors the Frontend Already Handles**:

**Duplicate Email** (409 Conflict):
```json
{
  "message": "This email is already in use. Please use a different one."
}
```

**Validation Error** (400 Bad Request):
```json
{
  "message": "Invalid email or password format"
}
```

**Server Error** (500 Internal Server Error):
```json
{
  "message": "An error occurred during registration"
}
```

---

## 📧 Email Service Requirements

### Recommended Email Service Providers

- **SendGrid** (most popular)
- **AWS SES** (Amazon Simple Email Service)
- **Mailgun**
- **Postmark**
- **Resend** (modern, developer-friendly)

### What Backend Needs to Configure

1. **SMTP Server** or **Email API credentials**
2. **From Email Address** (e.g., `noreply@yourapp.com`)
3. **Email Templates** (HTML + plain text fallback)
4. **Token Generation & Storage**:
   - Store token in database with expiration
   - Associate token with user ID
5. **Rate Limiting**:
   - Prevent spam registrations
   - Limit verification email resends

---

## 🔒 Security Considerations

### Token Security

1. **Use Secure Tokens**:
   - Random, cryptographically secure tokens (UUID v4 or JWT)
   - Minimum 32 characters length
   - One-time use only

2. **Token Expiration**:
   - Recommended: 24 hours
   - Delete expired tokens from database

3. **Token Storage**:
   - Hash tokens before storing in database
   - Store: `user_id`, `token_hash`, `created_at`, `expires_at`

4. **Prevent Token Reuse**:
   - Mark token as used after verification
   - Delete token after successful verification

### Rate Limiting

**Registration Endpoint**:
- 5 attempts per email per hour
- 10 attempts per IP per hour

**Email Resend** (if you add this feature):
- 1 email per 5 minutes per user
- Max 3 verification emails per day per user

---

## 🗄️ Database Schema Recommendations

### Users Table

Add email verification fields:

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL;
```

### Email Verification Tokens Table

Create a new table:

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

---

## 🧪 Testing Checklist

### Backend Tests Needed

- [ ] Registration creates user with `email_verified: false`
- [ ] Verification email is sent after registration
- [ ] Verification token is generated and stored
- [ ] Token expires after 24 hours
- [ ] Valid token verifies email successfully
- [ ] Invalid token returns 400 error
- [ ] Expired token returns 400 error
- [ ] Already verified user returns success
- [ ] Token can only be used once
- [ ] Rate limiting works for registration
- [ ] Duplicate email returns 409 error

### Integration Tests

- [ ] Full flow: Register → Receive email → Click link → Email verified
- [ ] User can login after email verification
- [ ] User cannot login before email verification (if you require it)
- [ ] Expired token shows proper error message
- [ ] Invalid token shows proper error message

---

## 📊 API Request/Response Examples

### Example 1: Successful Registration

**Request**:
```bash
curl -X POST https://api.yourapp.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response** (200 OK):
```json
{
  "message": "Registration successful",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**What Happens**:
1. ✅ User created in database
2. ✅ Verification email sent
3. ✅ Frontend shows popup modal

---

### Example 2: Email Already Exists

**Request**:
```bash
curl -X POST https://api.yourapp.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "SecurePass123!"
  }'
```

**Response** (409 Conflict):
```json
{
  "message": "This email is already in use. Please use a different one."
}
```

**What Happens**:
1. ❌ No user created
2. ❌ No email sent
3. ❌ Frontend shows error message (no popup)

---

### Example 3: Email Verification

**Request**:
```bash
curl -X GET "https://api.yourapp.com/api/v1/auth/verify-email?token=abc123xyz456"
```

**Response** (200 OK):
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

**What Happens**:
1. ✅ User's `email_verified` set to `true`
2. ✅ Token marked as used
3. ✅ User can now login

---

## 🚀 Optional Enhancements (Future)

### 1. Resend Verification Email

**Endpoint**: `POST /api/v1/auth/resend-verification`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Frontend**: Add a "Resend Email" button to the modal

---

### 2. Require Email Verification Before Login

**Login Endpoint**: Check `email_verified` before allowing login

**Response** (403 Forbidden):
```json
{
  "message": "Please verify your email before logging in",
  "error": "EMAIL_NOT_VERIFIED"
}
```

---

### 3. Email Verification Status Check

**Endpoint**: `GET /api/v1/auth/verification-status?email={email}`

**Use Case**: Check if email is verified without logging in

---

## 📞 Support & Questions

### Frontend Team Contact
- **Component Location**: `src/components/auth/EmailVerificationModal.tsx`
- **Integration**: `src/components/auth/RegisterForm.tsx`
- **Ready for Testing**: ✅ Yes

### What Frontend Needs from Backend
1. ✅ Successful registration (200 OK) triggers modal
2. ✅ Verification email sent to user
3. ✅ Verification link works and marks email as verified
4. ✅ Proper error responses (409 for duplicate, 400 for validation)

---

## 📅 Implementation Timeline

**Priority**: Medium-High

**Estimated Backend Work**:
- Email service setup: 2-4 hours
- Token generation/verification: 2-3 hours
- Database migrations: 1 hour
- Testing: 2-3 hours
- **Total**: ~1 day

---

## ✅ Success Criteria

- [ ] User registers successfully
- [ ] Verification email is sent within 1 minute
- [ ] Email contains valid verification link
- [ ] Clicking link verifies email
- [ ] User can login after verification
- [ ] Expired tokens are rejected
- [ ] Used tokens cannot be reused
- [ ] Duplicate emails return 409 error
- [ ] Frontend modal displays correctly

---

**Last Updated**: 2025-01-23  
**Frontend Status**: ✅ Complete  
**Backend Status**: ⏳ Pending Implementation

