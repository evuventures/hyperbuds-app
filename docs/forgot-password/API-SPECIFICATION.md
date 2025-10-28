# Password Reset API Specification

## Base URL
```
Development: http://localhost:4000/api/v1
Production: https://api.hyperbuds.com/api/v1
```

---

## Endpoints

### 1. Request Password Reset

Initiates the password reset process by sending a reset link to the user's email.

```
POST /auth/forgot-password
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |

#### Success Response
```
Status: 200 OK
Content-Type: application/json
```

```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### Error Responses

**Invalid Email Format**
```
Status: 400 Bad Request
```
```json
{
  "message": "Invalid email format"
}
```

**Rate Limit Exceeded**
```
Status: 429 Too Many Requests
```
```json
{
  "message": "Too many password reset requests. Please try again in 15 minutes."
}
```

**Server Error**
```
Status: 500 Internal Server Error
```
```json
{
  "message": "An error occurred. Please try again later."
}
```

#### Example Usage

**JavaScript/Fetch:**
```javascript
const response = await fetch('https://api.hyperbuds.com/api/v1/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
console.log(data.message);
```

**cURL:**
```bash
curl -X POST https://api.hyperbuds.com/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### Notes
- Always returns 200 OK, even if email doesn't exist (security best practice)
- Rate limited to 3 requests per 15 minutes per email
- Token expiration: 1 hour
- Email contains link: `https://hyperbuds.com/auth/reset-password?token={token}`

---

### 2. Reset Password

Resets the user's password using a valid reset token.

```
POST /auth/reset-password
```

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePassword123!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Reset token from email link |
| newPassword | string | Yes | New password (min 8 chars, with uppercase, lowercase, number, special char) |

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*, etc.)

#### Success Response
```
Status: 200 OK
Content-Type: application/json
```

```json
{
  "message": "Password reset successful"
}
```

#### Error Responses

**Invalid or Expired Token**
```
Status: 400 Bad Request
```
```json
{
  "message": "Invalid or expired reset token"
}
```

**Token Already Used**
```
Status: 400 Bad Request
```
```json
{
  "message": "This reset link has already been used. Please request a new one."
}
```

**Weak Password**
```
Status: 400 Bad Request
```
```json
{
  "message": "Password does not meet security requirements"
}
```

**User Not Found**
```
Status: 400 Bad Request
```
```json
{
  "message": "User not found"
}
```

**Server Error**
```
Status: 500 Internal Server Error
```
```json
{
  "message": "An error occurred. Please try again later."
}
```

#### Example Usage

**JavaScript/Fetch:**
```javascript
const response = await fetch('https://api.hyperbuds.com/api/v1/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    newPassword: 'NewSecurePassword123!'
  })
});

const data = await response.json();
if (response.ok) {
  console.log('Password reset successful!');
  // Redirect to login
} else {
  console.error(data.message);
}
```

**cURL:**
```bash
curl -X POST https://api.hyperbuds.com/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "newPassword": "NewSecurePassword123!"
  }'
```

#### Notes
- Token is single-use and invalidated after successful reset
- Token expires after 1 hour
- Password is hashed with bcrypt (cost factor 12)
- Optional: All user sessions are invalidated for security
- Optional: Confirmation email sent to user

---

## Rate Limiting

### Forgot Password Endpoint
- **Limit:** 3 requests per 15 minutes per email address
- **Headers:** None returned
- **Behavior:** Returns 429 status when limit exceeded

### Reset Password Endpoint
- **Limit:** 5 attempts per token
- **Headers:** None returned
- **Behavior:** Token invalidated after 5 failed attempts

### IP-Based Rate Limiting (Optional)
- **Limit:** 20 requests per minute per IP
- **Applies to:** Both endpoints

---

## Security Features

### Token Security
- ✅ Cryptographically secure tokens (JWT or crypto.randomBytes)
- ✅ Tokens expire after 1 hour
- ✅ Single-use tokens (invalidated after successful reset)
- ✅ Tokens hashed before storage (if using random tokens)
- ✅ Token secret is 256-bit minimum

### Password Security
- ✅ Passwords hashed with bcrypt (cost factor 10-12)
- ✅ Minimum password requirements enforced
- ✅ Password strength validated
- ✅ Optional: Password history check (prevent reuse)

### Email Security
- ✅ Reset links use HTTPS only
- ✅ Links contain no sensitive user data
- ✅ Email service is verified (DKIM, SPF)

### Response Security
- ✅ Generic success messages (prevent email enumeration)
- ✅ Consistent response times (prevent timing attacks)
- ✅ No stack traces in production errors
- ✅ CORS configured properly

---

## Error Codes Summary

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input, expired token, weak password |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error occurred |

---

## Frontend Integration

### Frontend URLs
- **Forgot Password Page:** `https://hyperbuds.com/auth/forgot-password`
- **Reset Password Page:** `https://hyperbuds.com/auth/reset-password?token={token}`

### Frontend Implementation
See `IMPLEMENTATION-SUMMARY.md` for complete frontend details.

---

## Email Template Variables

When sending password reset emails, use these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| {{USER_NAME}} | User's display name | "John Doe" |
| {{USER_EMAIL}} | User's email address | "john@example.com" |
| {{RESET_URL}} | Full reset URL with token | "https://hyperbuds.com/auth/reset-password?token=xyz" |
| {{EXPIRY_TIME}} | Token expiration time | "1 hour" |
| {{CURRENT_YEAR}} | Current year for footer | "2024" |

---

## Testing

### Testing Endpoints

Use these test scenarios:

#### Forgot Password Tests
```javascript
// Valid email
POST /auth/forgot-password
Body: { "email": "test@example.com" }
Expected: 200 OK

// Invalid email format
POST /auth/forgot-password
Body: { "email": "invalid-email" }
Expected: 400 Bad Request

// Rate limit exceeded (4th request in 15 min)
POST /auth/forgot-password
Body: { "email": "test@example.com" }
Expected: 429 Too Many Requests
```

#### Reset Password Tests
```javascript
// Valid reset
POST /auth/reset-password
Body: {
  "token": "valid-token-here",
  "newPassword": "SecurePass123!"
}
Expected: 200 OK

// Expired token
POST /auth/reset-password
Body: {
  "token": "expired-token-here",
  "newPassword": "SecurePass123!"
}
Expected: 400 Bad Request

// Weak password
POST /auth/reset-password
Body: {
  "token": "valid-token-here",
  "newPassword": "weak"
}
Expected: 400 Bad Request
```

---

## Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "HyperBuds Password Reset",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Forgot Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/auth/forgot-password",
          "host": ["{{BASE_URL}}"],
          "path": ["auth", "forgot-password"]
        }
      }
    },
    {
      "name": "Reset Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"token\": \"{{RESET_TOKEN}}\",\n  \"newPassword\": \"NewSecurePass123!\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/auth/reset-password",
          "host": ["{{BASE_URL}}"],
          "path": ["auth", "reset-password"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "https://api.hyperbuds.com/api/v1"
    },
    {
      "key": "RESET_TOKEN",
      "value": "your-test-token-here"
    }
  ]
}
```

---

## Changelog

### Version 1.0 (October 28, 2024)
- Initial API specification
- Two endpoints defined
- Security requirements documented
- Frontend integration complete

---

## Support

For API questions:
- **Backend Team:** See `BACKEND-REQUIREMENTS.md`
- **Frontend Team:** See `IMPLEMENTATION-SUMMARY.md`
- **Testing:** See main `README.md`

---

**API Version:** 1.0  
**Last Updated:** October 28, 2024  
**Status:** Specification Complete ✅ | Backend Implementation Pending ⏳

