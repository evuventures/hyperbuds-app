# Forgot & Reset Password System Documentation

## Overview

This document outlines the complete forgot and reset password system implementation for HyperBuds. The frontend is fully functional and production-ready, awaiting backend API implementation.

## Table of Contents

1. [Frontend Implementation](#frontend-implementation)
2. [Backend Requirements](#backend-requirements)
3. [API Specifications](#api-specifications)
4. [Security Considerations](#security-considerations)
5. [Testing Guide](#testing-guide)
6. [User Flow](#user-flow)

---

## Frontend Implementation

### Pages Implemented

#### 1. Forgot Password Page (`/auth/forgot-password`)

**Location:** `src/app/auth/forgot-password/page.tsx`

**Features:**
- Beautiful gradient UI with dark mode support
- Email input validation
- Loading states with animated spinner
- Success/error message display with icons
- Responsive design for all screen sizes
- Network error handling
- Direct link back to login

**What It Does:**
1. User enters their email address
2. Validates email format
3. Sends POST request to `/api/v1/auth/forgot-password`
4. Displays success message: "Password reset link sent! Please check your email."
5. Backend sends email with reset link

---

#### 2. Reset Password Page (`/auth/reset-password`)

**Location:** `src/app/auth/reset-password/page.tsx`

**Features:**
- Token extraction from URL query parameter (`?token=xyz`)
- New password input with show/hide toggle (Eye icon)
- Confirm password input with show/hide toggle
- Real-time password strength indicator:
  - Visual strength meter (6 bars)
  - Color-coded: Red (Weak), Yellow (Medium), Green (Strong)
  - Requirements checklist:
    - ✓ At least 8 characters
    - ✓ Uppercase and lowercase letters
    - ✓ At least one number
    - ✓ At least one special character
- Real-time password matching validation
- Token validation (checks if token exists)
- Submit button disabled until:
  - Token is valid
  - Password strength is "Medium" or better (score ≥ 3)
  - Passwords match
- Loading states with animated spinner
- Success message with auto-redirect to `/auth/signin`
- Error handling for expired/invalid tokens
- Link to request new reset link if token is missing
- Dark mode support
- Fully responsive

**Validation Rules:**
- Password minimum length: 8 characters
- Passwords must match
- Password strength score must be ≥ 3 (Medium or Strong)
- Token must be present in URL

**What It Does:**
1. Extracts `token` from URL query parameter
2. User enters new password (validated in real-time)
3. User confirms password
4. Validates all requirements
5. Sends POST request to `/api/v1/auth/reset-password` with `{ token, newPassword }`
6. On success: Shows message and redirects to `/auth/signin` after 2.5 seconds
7. On failure: Shows error with suggestion to request new link

---

## Backend Requirements

### Required Endpoints

The backend team needs to implement these two endpoints:

#### 1. POST `/api/v1/auth/forgot-password`

**Purpose:** Initiate password reset process by sending reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset link sent to email"
}
```

**Response (404 Not Found):**
```json
{
  "message": "No account found with this email address"
}
```

**Response (429 Too Many Requests):**
```json
{
  "message": "Too many password reset requests. Please try again later."
}
```

**What Backend Must Do:**
1. Validate email format
2. Check if user exists with this email
3. Generate secure reset token (recommended: JWT with 1-hour expiration)
4. Store token in database or cache (Redis recommended) with expiration
5. Send email with reset link: `https://hyperbuds.com/auth/reset-password?token={token}`
6. Implement rate limiting (max 3 requests per 15 minutes per email)
7. Return success message regardless of whether email exists (security best practice)

---

#### 2. POST `/api/v1/auth/reset-password`

**Purpose:** Reset user password using valid token

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid or expired reset token"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Password does not meet requirements"
}
```

**What Backend Must Do:**
1. Validate token (verify signature, check expiration)
2. Extract user ID/email from token
3. Validate new password meets requirements:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character
4. Hash password using bcrypt (cost factor: 10-12)
5. Update user's password in database
6. Invalidate/delete the reset token
7. Optional: Send confirmation email
8. Optional: Invalidate all existing sessions/tokens for security

---

## API Specifications

### Token Generation (Backend)

**Recommended: JWT with short expiration**

```javascript
// Example JWT payload
{
  "userId": "68c1ea88531c3fa696776528",
  "type": "password-reset",
  "exp": 1234567890, // 1 hour from creation
  "iat": 1234564290
}
```

**Alternative: Random Token**

```javascript
// Generate secure random token
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');

// Store in database/Redis with expiration
{
  token: "hashed_token",
  userId: "user_id",
  expiresAt: Date.now() + 3600000 // 1 hour
}
```

---

### Email Template Requirements

**Subject:** Reset Your HyperBuds Password

**Content:**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h2 style="color: #7c3aed;">Reset Your Password</h2>
    
    <p>Hi there,</p>
    
    <p>We received a request to reset your password for your HyperBuds account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="margin: 30px 0;">
      <a href="{{RESET_URL}}" 
         style="background: linear-gradient(to right, #7c3aed, #2563eb); 
                color: white; 
                padding: 12px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666;">Or copy and paste this link into your browser:</p>
    <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
      {{RESET_URL}}
    </p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      This link will expire in 1 hour for security reasons.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request this, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px;">
      © 2024 HyperBuds. All rights reserved.
    </p>
  </div>
</body>
</html>
```

---

## Security Considerations

### Frontend Security

✅ **Implemented:**
- Password strength validation
- Token passed via POST body (not URL for submission)
- HTTPS enforced (in production)
- No password stored in state after submission
- Form cleared on success
- CSRF protection via SameSite cookies

### Backend Security Requirements

⚠️ **Backend Must Implement:**

1. **Rate Limiting**
   - Max 3 forgot password requests per email per 15 minutes
   - Max 5 reset password attempts per token
   - Block IP after 10 failed attempts

2. **Token Security**
   - Use cryptographically secure random tokens or JWT
   - Token expiration: 1 hour maximum
   - One-time use tokens (invalidate after use)
   - Store hashed tokens in database (not plain text)

3. **Password Security**
   - Bcrypt hashing with cost factor 10-12
   - Minimum password requirements enforced
   - Password history check (optional: prevent reuse of last 5 passwords)

4. **Email Security**
   - Use verified email service (SendGrid, AWS SES, etc.)
   - DKIM and SPF configured
   - No user data in email except email address
   - Reset link uses HTTPS

5. **Additional Security**
   - Log all password reset attempts
   - Alert users via email when password is changed
   - Invalidate all sessions after password reset
   - Monitor for suspicious patterns (multiple reset attempts)

---

## Testing Guide

### Frontend Testing (Current State)

**Test Forgot Password Page:**

1. ✅ Navigate to `/auth/forgot-password`
2. ✅ Enter valid email format
3. ✅ Submit form
4. ⚠️ Currently shows success message (backend not connected)
5. ✅ Verify loading state displays
6. ✅ Verify error handling with network errors

**Test Reset Password Page:**

1. ✅ Navigate to `/auth/reset-password?token=test123`
2. ✅ Verify token is extracted from URL
3. ✅ Enter weak password → See red strength meter
4. ✅ Enter medium password → See yellow strength meter
5. ✅ Enter strong password → See green strength meter
6. ✅ Toggle password visibility (eye icon)
7. ✅ Enter mismatched passwords → See error
8. ✅ Submit with valid strong password
9. ⚠️ Currently shows success message (backend not connected)
10. ✅ Navigate without token → See error message with link to forgot-password

**Test Dark Mode:**

1. ✅ Toggle dark mode in app
2. ✅ Verify both pages render correctly in dark mode
3. ✅ Check all colors are readable
4. ✅ Verify gradient effects work

---

### Backend Testing Checklist

**When Backend Is Implemented:**

#### Forgot Password Endpoint

- [ ] Valid email receives reset link
- [ ] Invalid email returns generic success (security)
- [ ] Rate limiting works (3 requests per 15 min)
- [ ] Email template renders correctly
- [ ] Reset link contains valid token
- [ ] Token expires after 1 hour
- [ ] Subsequent requests invalidate previous tokens

#### Reset Password Endpoint

- [ ] Valid token resets password successfully
- [ ] Expired token returns error
- [ ] Invalid token returns error
- [ ] Used token cannot be reused
- [ ] New password is hashed (not plain text in DB)
- [ ] Password requirements are enforced
- [ ] Old password no longer works
- [ ] New password works for login
- [ ] User sessions are invalidated (optional)
- [ ] Confirmation email is sent (optional)

#### Security Testing

- [ ] Rate limiting prevents abuse
- [ ] Tokens are single-use
- [ ] Tokens expire correctly
- [ ] HTTPS enforced in production
- [ ] Password reset logged
- [ ] No sensitive data in error messages
- [ ] Timing attacks prevented (consistent response times)

---

## User Flow

### Complete Password Reset Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Forgets Password                                    │
│    ↓ Clicks "Forgot Password" on login page                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Forgot Password Page (/auth/forgot-password)             │
│    ↓ User enters email address                              │
│    ↓ Frontend validates email format                        │
│    ↓ POST /api/v1/auth/forgot-password { email }            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend Processing                                        │
│    ✓ Validate email                                          │
│    ✓ Check if user exists                                    │
│    ✓ Generate secure reset token                            │
│    ✓ Store token with 1-hour expiration                     │
│    ✓ Send email with reset link                             │
│    ✓ Return success message                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User Receives Email                                       │
│    ↓ Opens email inbox                                       │
│    ↓ Clicks reset link                                       │
│    ↓ Opens: /auth/reset-password?token={token}              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Reset Password Page (/auth/reset-password)               │
│    ↓ Frontend extracts token from URL                       │
│    ↓ User enters new password                               │
│    ↓ Real-time strength validation                          │
│    ↓ User confirms password                                 │
│    ↓ Frontend validates:                                     │
│      • Token exists                                          │
│      • Password ≥ 8 chars                                    │
│      • Password strength ≥ Medium                            │
│      • Passwords match                                       │
│    ↓ POST /api/v1/auth/reset-password { token, newPassword }│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Backend Processing                                        │
│    ✓ Verify token signature                                  │
│    ✓ Check token not expired                                 │
│    ✓ Check token not used                                    │
│    ✓ Extract user ID from token                              │
│    ✓ Validate password requirements                          │
│    ✓ Hash new password (bcrypt)                              │
│    ✓ Update user password in database                        │
│    ✓ Invalidate reset token                                  │
│    ✓ Optional: Invalidate all sessions                       │
│    ✓ Optional: Send confirmation email                       │
│    ✓ Return success message                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Success & Redirect                                        │
│    ✓ Show success message: "Password reset successfully!"   │
│    ✓ Wait 2.5 seconds                                        │
│    ✓ Redirect to /auth/signin                                │
│    ✓ User logs in with new password                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Frontend Error States

| Scenario | UI Behavior |
|----------|-------------|
| Network error | Red error message: "A network error occurred. Please check your connection and try again." |
| Invalid token | Yellow warning + link to request new reset link |
| Weak password | Submit button disabled + strength indicator shows "Weak" |
| Passwords don't match | Red error text below confirm password field |
| Form fields empty | Submit button disabled |

### Backend Error Responses (Required)

| Scenario | Status | Response |
|----------|--------|----------|
| Invalid email format | 400 | `{ "message": "Invalid email format" }` |
| Email not found | 200 | `{ "message": "If the email exists, a reset link has been sent" }` ← Security |
| Rate limit exceeded | 429 | `{ "message": "Too many requests. Try again in X minutes" }` |
| Invalid/expired token | 400 | `{ "message": "Invalid or expired reset token" }` |
| Token already used | 400 | `{ "message": "This reset link has already been used" }` |
| Weak password | 400 | `{ "message": "Password does not meet requirements" }` |
| Server error | 500 | `{ "message": "An error occurred. Please try again later" }` |

---

## Environment Variables

### Backend Configuration

```env
# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@hyperbuds.com

# Frontend URL
FRONTEND_URL=https://hyperbuds.com

# Token Secret
RESET_TOKEN_SECRET=your-256-bit-secret-here

# Token Expiration (in seconds)
RESET_TOKEN_EXPIRY=3600  # 1 hour

# Rate Limiting
RESET_RATE_LIMIT_WINDOW=900  # 15 minutes in seconds
RESET_RATE_LIMIT_MAX=3

# Redis (for token storage - recommended)
REDIS_URL=redis://localhost:6379
```

---

## Next Steps

### For Frontend Team
- ✅ Implementation complete
- ⏳ Waiting for backend API
- 📝 Update after backend is live

### For Backend Team
1. [ ] Implement `/api/v1/auth/forgot-password` endpoint
2. [ ] Implement `/api/v1/auth/reset-password` endpoint
3. [ ] Set up email service (SendGrid/AWS SES)
4. [ ] Configure email templates
5. [ ] Implement rate limiting
6. [ ] Add token generation and validation
7. [ ] Test all error scenarios
8. [ ] Deploy to staging for integration testing
9. [ ] Coordinate with frontend for integration testing

---

## Support

For questions or issues:
- Frontend: Contact frontend team
- Backend: See `BACKEND-REQUIREMENTS.md`
- API: See `API-SPECIFICATION.md`

---

**Last Updated:** October 28, 2024  
**Status:** Frontend Complete ✅ | Backend Pending ⏳

