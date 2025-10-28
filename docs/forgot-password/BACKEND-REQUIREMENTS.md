# Backend Requirements for Password Reset System

## Overview

This document provides detailed technical requirements for backend implementation of the password reset system.

---

## Required Endpoints

### 1. POST `/api/v1/auth/forgot-password`

#### Request

```typescript
interface ForgotPasswordRequest {
  email: string;  // User's email address
}
```

**Example:**
```json
{
  "email": "user@example.com"
}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

**Important:** Always return success message even if email doesn't exist (security best practice to prevent email enumeration)

**Rate Limited (429 Too Many Requests):**
```json
{
  "message": "Too many password reset requests. Please try again in 15 minutes."
}
```

**Server Error (500):**
```json
{
  "message": "An error occurred. Please try again later."
}
```

---

#### Implementation Steps

1. **Validate Input**
   ```javascript
   // Validate email format
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(email)) {
     return res.status(400).json({ message: "Invalid email format" });
   }
   ```

2. **Check Rate Limiting**
   ```javascript
   // Check if user has exceeded rate limit (3 requests per 15 minutes)
   const recentRequests = await getRateLimitCount(email);
   if (recentRequests >= 3) {
     return res.status(429).json({ 
       message: "Too many requests. Try again in 15 minutes" 
     });
   }
   ```

3. **Find User**
   ```javascript
   const user = await User.findOne({ email: email.toLowerCase() });
   
   // Return success even if user not found (security)
   if (!user) {
     return res.status(200).json({ 
       message: "If the email exists, a reset link has been sent" 
     });
   }
   ```

4. **Generate Reset Token**
   ```javascript
   // Option 1: JWT Token
   const resetToken = jwt.sign(
     { 
       userId: user._id,
       type: 'password-reset',
     },
     process.env.RESET_TOKEN_SECRET,
     { expiresIn: '1h' }
   );

   // Option 2: Random Token
   const crypto = require('crypto');
   const resetToken = crypto.randomBytes(32).toString('hex');
   const hashedToken = crypto
     .createHash('sha256')
     .update(resetToken)
     .digest('hex');
   ```

5. **Store Token**
   ```javascript
   // Option 1: Redis (Recommended for performance)
   await redis.setex(
     `reset:${hashedToken}`,
     3600, // 1 hour expiration
     user._id.toString()
   );

   // Option 2: Database
   await PasswordReset.create({
     userId: user._id,
     token: hashedToken,
     expiresAt: new Date(Date.now() + 3600000) // 1 hour
   });
   ```

6. **Send Email**
   ```javascript
   const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
   
   await sendEmail({
     to: user.email,
     subject: 'Reset Your HyperBuds Password',
     html: getPasswordResetEmailTemplate(resetUrl, user.name)
   });
   ```

7. **Increment Rate Limit Counter**
   ```javascript
   await incrementRateLimitCount(email);
   ```

8. **Log Event**
   ```javascript
   await AuditLog.create({
     userId: user._id,
     action: 'password_reset_requested',
     ipAddress: req.ip,
     timestamp: new Date()
   });
   ```

---

### 2. POST `/api/v1/auth/reset-password`

#### Request

```typescript
interface ResetPasswordRequest {
  token: string;      // Reset token from email link
  newPassword: string; // New password (validated on frontend)
}
```

**Example:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePassword123!"
}
```

#### Response

**Success (200 OK):**
```json
{
  "message": "Password reset successful"
}
```

**Invalid/Expired Token (400):**
```json
{
  "message": "Invalid or expired reset token"
}
```

**Token Already Used (400):**
```json
{
  "message": "This reset link has already been used. Please request a new one."
}
```

**Weak Password (400):**
```json
{
  "message": "Password does not meet security requirements"
}
```

---

#### Implementation Steps

1. **Validate Token**
   ```javascript
   // Option 1: JWT Validation
   try {
     const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
     
     if (decoded.type !== 'password-reset') {
       return res.status(400).json({ message: "Invalid token type" });
     }
     
     userId = decoded.userId;
   } catch (error) {
     return res.status(400).json({ 
       message: "Invalid or expired reset token" 
     });
   }

   // Option 2: Database/Redis Lookup
   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   const userId = await redis.get(`reset:${hashedToken}`);
   
   if (!userId) {
     return res.status(400).json({ 
       message: "Invalid or expired reset token" 
     });
   }
   ```

2. **Check Token Not Already Used** (Optional but recommended)
   ```javascript
   const usedToken = await UsedToken.findOne({ token: hashedToken });
   if (usedToken) {
     return res.status(400).json({ 
       message: "This reset link has already been used" 
     });
   }
   ```

3. **Validate New Password**
   ```javascript
   // Password requirements
   const minLength = 8;
   const hasUpperCase = /[A-Z]/.test(newPassword);
   const hasLowerCase = /[a-z]/.test(newPassword);
   const hasNumber = /[0-9]/.test(newPassword);
   const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);

   if (
     newPassword.length < minLength ||
     !hasUpperCase ||
     !hasLowerCase ||
     !hasNumber ||
     !hasSpecialChar
   ) {
     return res.status(400).json({ 
       message: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character" 
     });
   }
   ```

4. **Get User**
   ```javascript
   const user = await User.findById(userId);
   if (!user) {
     return res.status(400).json({ message: "User not found" });
   }
   ```

5. **Check Password History** (Optional)
   ```javascript
   // Prevent reusing last 5 passwords
   const passwordHistory = await PasswordHistory.find({ userId })
     .sort({ createdAt: -1 })
     .limit(5);

   for (const oldPassword of passwordHistory) {
     const isOldPassword = await bcrypt.compare(newPassword, oldPassword.hash);
     if (isOldPassword) {
       return res.status(400).json({ 
         message: "Cannot reuse recent passwords" 
       });
     }
   }
   ```

6. **Hash New Password**
   ```javascript
   const bcrypt = require('bcrypt');
   const saltRounds = 12; // Recommended: 10-12
   const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
   ```

7. **Update User Password**
   ```javascript
   user.password = hashedPassword;
   user.passwordChangedAt = new Date();
   await user.save();
   ```

8. **Invalidate Reset Token**
   ```javascript
   // Option 1: Redis
   await redis.del(`reset:${hashedToken}`);

   // Option 2: Database
   await PasswordReset.deleteOne({ token: hashedToken });

   // Mark token as used
   await UsedToken.create({ 
     token: hashedToken, 
     usedAt: new Date() 
   });
   ```

9. **Optional: Invalidate All Sessions**
   ```javascript
   // For added security, log out user from all devices
   await Session.deleteMany({ userId: user._id });
   await RefreshToken.deleteMany({ userId: user._id });
   ```

10. **Optional: Send Confirmation Email**
    ```javascript
    await sendEmail({
      to: user.email,
      subject: 'Your HyperBuds Password Was Changed',
      html: getPasswordChangedEmailTemplate(user.name)
    });
    ```

11. **Log Event**
    ```javascript
    await AuditLog.create({
      userId: user._id,
      action: 'password_reset_completed',
      ipAddress: req.ip,
      timestamp: new Date()
    });
    ```

---

## Database Schema

### Option 1: Using Redis (Recommended)

**Why Redis?**
- Fast lookups
- Automatic expiration
- Reduced database load
- Perfect for temporary data

**Schema:**
```
Key: reset:{hashedToken}
Value: userId
TTL: 3600 seconds (1 hour)
```

---

### Option 2: Using MongoDB/Database

```javascript
// PasswordReset Schema
const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
  }
});

// Used Tokens Schema (to prevent reuse)
const usedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  usedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Keep for 24 hours for audit
  }
});

// Password History Schema (optional)
const passwordHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7776000 // Keep for 90 days
  }
});
```

---

## Rate Limiting Implementation

### Using Redis

```javascript
async function checkRateLimit(email) {
  const key = `reset-rate:${email.toLowerCase()}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    // First request, set expiration
    await redis.expire(key, 900); // 15 minutes
  }
  
  if (count > 3) {
    return {
      allowed: false,
      remainingTime: await redis.ttl(key)
    };
  }
  
  return {
    allowed: true,
    remaining: 3 - count
  };
}
```

### Using In-Memory Store (Not recommended for production)

```javascript
const rateLimitStore = new Map();

function checkRateLimit(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const windowStart = now - 15 * 60 * 1000; // 15 minutes ago
  
  // Get or create entry
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  // Get attempts
  let attempts = rateLimitStore.get(key);
  
  // Remove old attempts
  attempts = attempts.filter(timestamp => timestamp > windowStart);
  
  // Check limit
  if (attempts.length >= 3) {
    return { allowed: false };
  }
  
  // Add current attempt
  attempts.push(now);
  rateLimitStore.set(key, attempts);
  
  return { allowed: true, remaining: 3 - attempts.length };
}
```

---

## Email Service Setup

### Using SendGrid

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendPasswordResetEmail(email, resetUrl, userName) {
  const msg = {
    to: email,
    from: 'noreply@hyperbuds.com', // Verified sender
    subject: 'Reset Your HyperBuds Password',
    html: getEmailTemplate(resetUrl, userName),
  };
  
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

### Using AWS SES

```javascript
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

async function sendPasswordResetEmail(email, resetUrl, userName) {
  const params = {
    Source: 'noreply@hyperbuds.com',
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Subject: {
        Data: 'Reset Your HyperBuds Password'
      },
      Body: {
        Html: {
          Data: getEmailTemplate(resetUrl, userName)
        }
      }
    }
  };
  
  try {
    await ses.sendEmail(params).promise();
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
```

---

## Security Checklist

### Token Security
- [ ] Tokens are cryptographically secure (JWT or crypto.randomBytes)
- [ ] Tokens expire after 1 hour
- [ ] Tokens are single-use (invalidated after use)
- [ ] Tokens are hashed before storage (if using random tokens)
- [ ] Token secret is strong and securely stored

### Password Security
- [ ] Passwords are hashed with bcrypt (cost factor 10-12)
- [ ] Minimum password requirements enforced
- [ ] Password strength validated
- [ ] Optional: Password history checked

### Rate Limiting
- [ ] Max 3 forgot password requests per 15 minutes per email
- [ ] Max 5 reset attempts per token
- [ ] IP-based rate limiting for additional security

### Email Security
- [ ] Using verified email service
- [ ] DKIM configured
- [ ] SPF configured
- [ ] No sensitive user data in emails
- [ ] Reset links use HTTPS only

### Additional Security
- [ ] All events logged for audit
- [ ] Timing attack prevention (constant-time responses)
- [ ] Success message same for existing/non-existing emails
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Optional: 2FA integration

---

## Testing Requirements

### Unit Tests

```javascript
describe('Password Reset', () => {
  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send reset email for valid email', async () => {
      // Test implementation
    });
    
    it('should return success for non-existent email', async () => {
      // Security test
    });
    
    it('should enforce rate limiting', async () => {
      // Rate limit test
    });
    
    it('should invalidate previous tokens', async () => {
      // Token management test
    });
  });
  
  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // Happy path test
    });
    
    it('should reject expired token', async () => {
      // Expiration test
    });
    
    it('should reject used token', async () => {
      // Single-use test
    });
    
    it('should enforce password requirements', async () => {
      // Validation test
    });
  });
});
```

---

## Performance Considerations

### Caching Strategy
- Use Redis for token storage (fast lookups)
- Cache rate limit counters
- Use database indexes on userId, token, expiresAt

### Email Queue
- Use message queue (RabbitMQ, Bull, etc.) for email sending
- Don't block response waiting for email
- Implement retry logic for failed emails

### Optimization Tips
- Use TTL/expiration for automatic cleanup
- Index frequently queried fields
- Batch email sending if possible
- Monitor email delivery rates

---

## Environment Variables Required

```env
# JWT
RESET_TOKEN_SECRET=your-256-bit-secret-here
RESET_TOKEN_EXPIRY=3600

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@hyperbuds.com

# Frontend
FRONTEND_URL=https://hyperbuds.com

# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RESET_RATE_LIMIT_WINDOW=900
RESET_RATE_LIMIT_MAX=3
```

---

## Integration Testing

Once backend is implemented, coordinate with frontend team for:

1. **End-to-end testing** of complete flow
2. **Error scenario testing** (expired tokens, invalid emails, etc.)
3. **Performance testing** (rate limiting, concurrent requests)
4. **Security testing** (penetration testing, token validation)

---

**Last Updated:** October 28, 2024  
**Status:** Specification Complete ✅ | Implementation Pending ⏳

