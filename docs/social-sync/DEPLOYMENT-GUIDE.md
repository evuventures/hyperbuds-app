# Social Sync Deployment Guide

## Overview

This guide covers the deployment process for the Social Media Sync feature, including environment setup, configuration, and monitoring.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Frontend Deployment](#frontend-deployment)
4. [Backend Deployment](#backend-deployment)
5. [Database Setup](#database-setup)
6. [API Configuration](#api-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [Security Configuration](#security-configuration)
9. [Performance Optimization](#performance-optimization)
10. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **MongoDB**: 4.4 or higher
- **Redis**: 6.x or higher (optional, for caching)
- **Nginx**: 1.18 or higher (for production)

### Required Services

- **Backend API**: HyperBuds backend service
- **Database**: MongoDB instance
- **CDN**: For static assets (optional)
- **Monitoring**: Application monitoring service

### API Keys Required

- **RapidAPI Key**: For social media data fetching
- **JWT Secret**: For authentication
- **Database URI**: MongoDB connection string

## Environment Configuration

### Frontend Environment Variables

Create `.env.production` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1

# RapidAPI Configuration (Optional - mock data used if not provided)
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_SYNC=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=true

# Build Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Backend Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/hyperbuds
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/hyperbuds

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# API Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://hyperbuds-app.vercel.app,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
```

## Frontend Deployment

### Vercel Deployment

1. **Connect Repository**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod
```

2. **Configure Environment Variables**:
```bash
# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_API_BASE_URL
vercel env add NEXT_PUBLIC_RAPIDAPI_KEY
vercel env add NEXT_PUBLIC_ENABLE_SOCIAL_SYNC
```

3. **Build Configuration**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Docker Deployment

1. **Create Dockerfile**:
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **Build and Deploy**:
```bash
# Build Docker image
docker build -t hyperbuds-app .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1 \
  -e NEXT_PUBLIC_RAPIDAPI_KEY=your_key \
  hyperbuds-app
```

### Manual Deployment

1. **Build Application**:
```bash
# Install dependencies
npm ci --production

# Build for production
npm run build

# Start production server
npm start
```

2. **Configure Nginx**:
```nginx
# /etc/nginx/sites-available/hyperbuds
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backend Deployment

### Render.com Deployment

1. **Create render.yaml**:
```yaml
# render.yaml
services:
  - type: web
    name: hyperbuds-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: hyperbuds-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: CORS_ORIGIN
        value: https://hyperbuds-app.vercel.app
```

2. **Deploy to Render**:
```bash
# Connect to Render
# Deploy via GitHub integration
# Configure environment variables in Render dashboard
```

### Docker Backend Deployment

1. **Backend Dockerfile**:
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start application
CMD ["npm", "start"]
```

2. **Docker Compose**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/hyperbuds
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

## Database Setup

### MongoDB Configuration

1. **Create Database**:
```javascript
// Create database and collections
use hyperbuds;

// Create profiles collection with indexes
db.profiles.createIndex({ "userId": 1 }, { unique: true });
db.profiles.createIndex({ "stats.totalFollowers": 1 });
db.profiles.createIndex({ "updatedAt": 1 });

// Create sync_logs collection for monitoring
db.createCollection("sync_logs");
db.sync_logs.createIndex({ "timestamp": 1 });
db.sync_logs.createIndex({ "platform": 1 });
db.sync_logs.createIndex({ "userId": 1 });
```

2. **Database Schema Validation**:
```javascript
// Add schema validation
db.createCollection("profiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "displayName", "stats"],
      properties: {
        userId: {
          bsonType: "objectId",
          description: "User ID must be an ObjectId"
        },
        displayName: {
          bsonType: "string",
          description: "Display name must be a string"
        },
        stats: {
          bsonType: "object",
          required: ["platformBreakdown", "totalFollowers", "avgEngagement"],
          properties: {
            platformBreakdown: {
              bsonType: "object",
              properties: {
                tiktok: {
                  bsonType: "object",
                  properties: {
                    followers: { bsonType: "number", minimum: 0 },
                    engagement: { bsonType: "number", minimum: 0, maximum: 100 }
                  }
                }
                // ... other platforms
              }
            }
          }
        }
      }
    }
  }
});
```

### Database Migration

1. **Migration Script**:
```javascript
// migrations/add-social-sync-fields.js
const { MongoClient } = require('mongodb');

async function migrate() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  
  const db = client.db('hyperbuds');
  const profiles = db.collection('profiles');
  
  // Add social sync fields to existing profiles
  await profiles.updateMany(
    { "stats.platformBreakdown": { $exists: false } },
    {
      $set: {
        "stats.platformBreakdown": {
          tiktok: { followers: 0, engagement: 0 },
          twitter: { followers: 0, engagement: 0 },
          twitch: { followers: 0, engagement: 0 },
          instagram: { followers: 0, engagement: 0 }
        },
        "stats.totalFollowers": 0,
        "stats.avgEngagement": 0
      }
    }
  );
  
  console.log('Migration completed');
  await client.close();
}

migrate().catch(console.error);
```

2. **Run Migration**:
```bash
# Run migration script
node migrations/add-social-sync-fields.js
```

## API Configuration

### Rate Limiting

1. **Configure Rate Limits**:
```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const syncRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    message: 'Too many sync requests',
    error: 'Please wait before syncing again'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.user && req.user.role === 'admin';
  }
});

module.exports = { syncRateLimit };
```

2. **Apply Rate Limits**:
```javascript
// backend/routes/sync.js
const { syncRateLimit } = require('../middleware/rateLimiter');

// Apply to sync routes
router.post('/social-sync/:platform', syncRateLimit, syncPlatformData);
```

### CORS Configuration

1. **Configure CORS**:
```javascript
// backend/middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://hyperbuds-app.vercel.app',
      'http://localhost:3000',
      'https://hyperbuds.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
```

### API Documentation

1. **Swagger Configuration**:
```javascript
// backend/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HyperBuds API',
      version: '1.0.0',
      description: 'API for HyperBuds social media sync feature'
    },
    servers: [
      {
        url: 'https://api-hyperbuds-backend.onrender.com/api/v1',
        description: 'Production server'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
```

## Monitoring Setup

### Application Monitoring

1. **Sentry Configuration**:
```javascript
// backend/monitoring/sentry.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: require('../app') })
  ]
});

module.exports = Sentry;
```

2. **Health Check Endpoint**:
```javascript
// backend/routes/health.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running'
      },
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;
```

### Logging Configuration

1. **Winston Logger**:
```javascript
// backend/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'hyperbuds-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

2. **Sync Event Logging**:
```javascript
// backend/utils/syncLogger.js
const logger = require('./logger');

const logSyncEvent = (event, data) => {
  logger.info('Sync Event', {
    event,
    platform: data.platform,
    userId: data.userId,
    followers: data.followers,
    timestamp: new Date().toISOString(),
    ...data
  });
};

const logSyncError = (error, data) => {
  logger.error('Sync Error', {
    error: error.message,
    stack: error.stack,
    platform: data.platform,
    userId: data.userId,
    timestamp: new Date().toISOString()
  });
};

module.exports = { logSyncEvent, logSyncError };
```

## Security Configuration

### Authentication Security

1. **JWT Configuration**:
```javascript
// backend/config/jwt.js
const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256',
  issuer: 'hyperbuds-api',
  audience: 'hyperbuds-app'
};

const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });
};

module.exports = { generateToken, verifyToken, jwtConfig };
```

2. **Input Validation**:
```javascript
// backend/middleware/validation.js
const Joi = require('joi');

const syncDataSchema = Joi.object({
  followers: Joi.number().integer().min(0).max(100000000).required(),
  engagement: Joi.number().min(0).max(100).optional()
});

const validateSyncData = (req, res, next) => {
  const { error, value } = syncDataSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.details.map(detail => ({
        message: detail.message,
        path: detail.path,
        type: detail.type
      }))
    });
  }
  
  req.body = value;
  next();
};

module.exports = { validateSyncData };
```

### API Security

1. **Helmet Configuration**:
```javascript
// backend/middleware/security.js
const helmet = require('helmet');

const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api-hyperbuds-backend.onrender.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

module.exports = securityMiddleware;
```

2. **Request Sanitization**:
```javascript
// backend/middleware/sanitize.js
const mongoSanitize = require('express-mongo-sanitize');

const sanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key: ${key}`);
  }
});

module.exports = sanitizeMiddleware;
```

## Performance Optimization

### Caching Strategy

1. **Redis Caching**:
```javascript
// backend/cache/redis.js
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

const cacheProfile = async (userId, profile) => {
  const key = `profile:${userId}`;
  await client.setex(key, 300, JSON.stringify(profile)); // 5 minutes
};

const getCachedProfile = async (userId) => {
  const key = `profile:${userId}`;
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};

module.exports = { cacheProfile, getCachedProfile };
```

2. **API Response Caching**:
```javascript
// backend/middleware/cache.js
const { cacheProfile, getCachedProfile } = require('../cache/redis');

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return next();
    
    const cached = await getCachedProfile(userId);
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = async (data) => {
      await cacheProfile(userId, data);
      res.sendResponse(data);
    };
    
    next();
  };
};

module.exports = cacheMiddleware;
```

### Database Optimization

1. **Connection Pooling**:
```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

2. **Query Optimization**:
```javascript
// backend/models/Profile.js
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  displayName: String,
  stats: {
    platformBreakdown: {
      tiktok: { followers: Number, engagement: Number },
      twitter: { followers: Number, engagement: Number },
      twitch: { followers: Number, engagement: Number },
      instagram: { followers: Number, engagement: Number }
    },
    totalFollowers: Number,
    avgEngagement: Number
  }
}, {
  timestamps: true
});

// Add indexes for performance
profileSchema.index({ userId: 1 });
profileSchema.index({ 'stats.totalFollowers': 1 });
profileSchema.index({ updatedAt: 1 });

module.exports = mongoose.model('Profile', profileSchema);
```

## Rollback Procedures

### Frontend Rollback

1. **Vercel Rollback**:
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or rollback via Vercel dashboard
```

2. **Docker Rollback**:
```bash
# List Docker images
docker images

# Rollback to previous image
docker run -p 3000:3000 hyperbuds-app:previous-tag
```

### Backend Rollback

1. **Render.com Rollback**:
```bash
# Via Render dashboard:
# 1. Go to service dashboard
# 2. Click "Manual Deploy"
# 3. Select previous commit
# 4. Deploy
```

2. **Database Rollback**:
```javascript
// Rollback migration
const rollbackMigration = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  
  const db = client.db('hyperbuds');
  const profiles = db.collection('profiles');
  
  // Remove social sync fields
  await profiles.updateMany(
    { "stats.platformBreakdown": { $exists: true } },
    {
      $unset: {
        "stats.platformBreakdown": "",
        "stats.totalFollowers": "",
        "stats.avgEngagement": ""
      }
    }
  );
  
  console.log('Rollback completed');
  await client.close();
};
```

### Monitoring Rollback

1. **Health Check**:
```bash
# Check service health
curl https://api-hyperbuds-backend.onrender.com/health

# Check frontend
curl https://hyperbuds-app.vercel.app
```

2. **Log Analysis**:
```bash
# Check application logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Functions → Logs
```

## Post-Deployment Checklist

### Frontend Verification

- [ ] Application loads without errors
- [ ] Social sync buttons appear on platform cards
- [ ] Sync functionality works correctly
- [ ] Error handling works properly
- [ ] Mobile responsiveness maintained
- [ ] Performance metrics within acceptable range

### Backend Verification

- [ ] API endpoints respond correctly
- [ ] Database connections stable
- [ ] Authentication working
- [ ] Rate limiting active
- [ ] Logging configured
- [ ] Health checks passing

### Integration Testing

- [ ] End-to-end sync flow works
- [ ] Data persists correctly
- [ ] Error scenarios handled
- [ ] Performance meets requirements
- [ ] Security measures active

### Monitoring Setup

- [ ] Application monitoring active
- [ ] Error tracking configured
- [ ] Performance metrics collected
- [ ] Alerts configured
- [ ] Logs accessible

---

This deployment guide provides comprehensive instructions for deploying the Social Media Sync feature to production. Follow the steps carefully and verify each component before proceeding to the next step.
