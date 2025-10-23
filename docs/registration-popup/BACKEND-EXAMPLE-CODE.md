# Email Verification - Backend Implementation Example

## 🎯 Quick Start Guide for Backend Team

This document provides ready-to-use code examples for implementing email verification.

---

## 📋 Implementation Checklist

- [ ] Install email service dependency
- [ ] Configure environment variables
- [ ] Create database migration for email verification
- [ ] Implement token generation utility
- [ ] Update registration endpoint
- [ ] Create email verification endpoint
- [ ] Set up email templates
- [ ] Add rate limiting
- [ ] Test end-to-end flow

---

## 🔧 Step 1: Environment Variables

Add to your `.env` file:

```bash
# Email Service (choose one)

# Option 1: SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourapp.com

# Option 2: AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_access_key
AWS_SES_SECRET_KEY=your_secret_key
AWS_SES_FROM_EMAIL=noreply@yourapp.com

# Option 3: SMTP (any provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@yourapp.com

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Token Settings
EMAIL_VERIFICATION_TOKEN_EXPIRY=24h
```

---

## 🗄️ Step 2: Database Migration

### SQL (PostgreSQL)

```sql
-- Add email verification columns to users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN email_verified_at TIMESTAMP NULL;

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

### Prisma Schema

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  emailVerified     Boolean   @default(false)
  emailVerifiedAt   DateTime?
  createdAt         DateTime  @default(now())
  
  verificationTokens EmailVerificationToken[]
}

model EmailVerificationToken {
  id        String    @id @default(uuid())
  userId    String
  token     String    @unique
  createdAt DateTime  @default(now())
  expiresAt DateTime
  usedAt    DateTime?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

---

## 📦 Step 3: Install Dependencies

### Node.js

```bash
# Email service (choose one)
npm install @sendgrid/mail          # SendGrid
npm install aws-sdk                 # AWS SES
npm install nodemailer              # SMTP

# Token generation
npm install uuid                    # For unique tokens
npm install crypto                  # Built-in Node.js (no install needed)

# Optional but recommended
npm install express-rate-limit      # Rate limiting
npm install joi                     # Validation
```

---

## 🔐 Step 4: Token Generation Utility

Create `utils/tokenGenerator.js`:

```javascript
const crypto = require('crypto');

/**
 * Generate a secure random token
 * @returns {string} 64-character hex token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token for secure storage
 * @param {string} token - Plain text token
 * @returns {string} Hashed token
 */
function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Get token expiration date
 * @param {number} hours - Hours until expiration
 * @returns {Date} Expiration date
 */
function getTokenExpiry(hours = 24) {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate;
}

module.exports = {
  generateVerificationToken,
  hashToken,
  getTokenExpiry
};
```

---

## 📧 Step 5: Email Service Setup

### Option 1: SendGrid

Create `services/emailService.js`:

```javascript
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Verify your email address',
    text: `Please verify your email by clicking this link: ${verificationUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #3b82f6 100%);
                   color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px;
                   font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome!</h1>
            <p>Thanks for joining us</p>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Your Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

module.exports = { sendVerificationEmail };
```

### Option 2: Nodemailer (SMTP)

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
  
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your email address',
    text: `Please verify your email by clicking this link: ${verificationUrl}`,
    html: `<!-- Same HTML as SendGrid example above -->`
  });

  console.log('✅ Verification email sent:', info.messageId);
  return { success: true };
}

module.exports = { sendVerificationEmail };
```

---

## 🔌 Step 6: Update Registration Endpoint

Create/Update `routes/auth.js`:

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const { generateVerificationToken, hashToken, getTokenExpiry } = require('../utils/tokenGenerator');
const { sendVerificationEmail } = require('../services/emailService');
const db = require('../db'); // Your database connection

const router = express.Router();

/**
 * POST /api/v1/auth/register
 * Register a new user and send verification email
 */
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message: 'Password must be between 8 and 128 characters'
      });
    }

    // 2. Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'This email is already in use. Please use a different one.'
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerified: false
      }
    });

    // 5. Generate verification token
    const token = generateVerificationToken();
    const tokenHash = hashToken(token);

    // 6. Store token in database
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt: getTokenExpiry(24) // 24 hours
      }
    });

    // 7. Send verification email (don't await - send async)
    sendVerificationEmail(user.email, token).catch(err => {
      console.error('Failed to send verification email:', err);
      // Don't fail registration if email fails
    });

    // 8. Return success
    return res.status(200).json({
      message: 'Registration successful',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      message: 'An error occurred during registration'
    });
  }
});

module.exports = router;
```

---

## ✅ Step 7: Email Verification Endpoint

Add to `routes/auth.js`:

```javascript
/**
 * GET /api/v1/auth/verify-email?token=xxx
 * Verify user's email address
 */
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    // 1. Validate token exists
    if (!token) {
      return res.status(400).json({
        message: 'Verification token is required',
        error: 'MISSING_TOKEN'
      });
    }

    // 2. Hash the token to match database
    const tokenHash = hashToken(token);

    // 3. Find token in database
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token: tokenHash },
      include: { user: true }
    });

    if (!verificationToken) {
      return res.status(400).json({
        message: 'Invalid or expired verification token',
        error: 'INVALID_TOKEN'
      });
    }

    // 4. Check if token is expired
    if (new Date() > verificationToken.expiresAt) {
      return res.status(400).json({
        message: 'Verification token has expired. Please request a new one.',
        error: 'EXPIRED_TOKEN'
      });
    }

    // 5. Check if token was already used
    if (verificationToken.usedAt) {
      return res.status(400).json({
        message: 'This verification link has already been used',
        error: 'TOKEN_ALREADY_USED'
      });
    }

    // 6. Check if email is already verified
    if (verificationToken.user.emailVerified) {
      return res.status(200).json({
        message: 'Email already verified',
        verified: true
      });
    }

    // 7. Update user's email verification status
    await db.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    // 8. Mark token as used
    await db.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: new Date() }
    });

    // 9. Return success
    return res.status(200).json({
      message: 'Email verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      message: 'An error occurred during email verification',
      error: 'SERVER_ERROR'
    });
  }
});
```

---

## 🚦 Step 8: Add Rate Limiting

Add to your main app file:

```javascript
const rateLimit = require('express-rate-limit');

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: {
    message: 'Too many registration attempts. Please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to registration endpoint
app.use('/api/v1/auth/register', registerLimiter);
```

---

## 🧹 Step 9: Cleanup Old Tokens (Cron Job)

Create `jobs/cleanupExpiredTokens.js`:

```javascript
const db = require('../db');

/**
 * Delete expired verification tokens
 * Run this daily via cron job
 */
async function cleanupExpiredTokens() {
  try {
    const result = await db.emailVerificationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`✅ Deleted ${result.count} expired tokens`);
    return result.count;
  } catch (error) {
    console.error('❌ Error cleaning up tokens:', error);
    throw error;
  }
}

// Run daily at 2 AM
// Using node-cron or similar
const cron = require('node-cron');
cron.schedule('0 2 * * *', cleanupExpiredTokens);

module.exports = { cleanupExpiredTokens };
```

---

## 🧪 Step 10: Testing

### Manual Test

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 200 OK
# Expected: Email sent to test@example.com

# 2. Check email and get token from link

# 3. Verify email
curl -X GET "http://localhost:5000/api/v1/auth/verify-email?token=YOUR_TOKEN_HERE"

# Expected: 200 OK with "Email verified successfully"

# 4. Try to verify again (should fail)
curl -X GET "http://localhost:5000/api/v1/auth/verify-email?token=YOUR_TOKEN_HERE"

# Expected: 400 with "Token already used"
```

### Automated Tests

```javascript
const request = require('supertest');
const app = require('../app');

describe('Email Verification Flow', () => {
  let verificationToken;

  test('should register user and send verification email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Registration successful');
    expect(response.body.userId).toBeDefined();

    // Get token from database for testing
    const token = await db.emailVerificationToken.findFirst({
      where: { user: { email: 'test@example.com' } }
    });
    verificationToken = token.token;
  });

  test('should verify email with valid token', async () => {
    const response = await request(app)
      .get(`/api/v1/auth/verify-email?token=${verificationToken}`);

    expect(response.status).toBe(200);
    expect(response.body.verified).toBe(true);
  });

  test('should reject duplicate email registration', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('already in use');
  });

  test('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/verify-email?token=invalid_token');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_TOKEN');
  });
});
```

---

## 📊 Step 11: Logging & Monitoring

```javascript
// Add logging to track verification metrics

// In registration endpoint:
console.log('📝 New registration:', {
  email: user.email,
  userId: user.id,
  timestamp: new Date()
});

// In verification endpoint:
console.log('✅ Email verified:', {
  userId: verificationToken.userId,
  email: verificationToken.user.email,
  verifiedAt: new Date(),
  timeSinceRegistration: new Date() - verificationToken.createdAt
});

// Track failed verifications:
console.log('❌ Verification failed:', {
  reason: error.message,
  token: tokenHash.substring(0, 10) + '...',
  timestamp: new Date()
});
```

---

## ✅ Final Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Email service tested (send test email)
- [ ] Registration creates user with `emailVerified: false`
- [ ] Verification email is sent
- [ ] Verification link format is correct
- [ ] Token expiration works (test after 24 hours)
- [ ] Rate limiting is enabled
- [ ] Error handling covers all cases
- [ ] Logging is in place
- [ ] Tests are passing
- [ ] Frontend popup shows after registration
- [ ] End-to-end flow tested
- [ ] Production email addresses configured
- [ ] Cron job for token cleanup is running

---

## 🚀 Deployment

**Environment-specific URLs**:

```bash
# Development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Staging
FRONTEND_URL=https://staging.yourapp.com
BACKEND_URL=https://api-staging.yourapp.com

# Production
FRONTEND_URL=https://yourapp.com
BACKEND_URL=https://api.yourapp.com
```

---

## 📞 Need Help?

**Common Issues**:
1. **Email not sending** → Check API keys and from email
2. **Token not found** → Ensure token is hashed before database lookup
3. **CORS errors** → Add frontend URL to CORS whitelist
4. **Rate limit too strict** → Adjust limits in rate limiter config

**Documentation**:
- Main README: `docs/registration-popup/README.md`
- Technical Specs: `docs/registration-popup/TECHNICAL-SPECS.md`

**Testing**: Frontend is ready and waiting for backend implementation! 🎉

