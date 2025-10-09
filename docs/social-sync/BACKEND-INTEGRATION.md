# Backend Integration Guide

## Overview

This document details the backend integration for the Social Media Sync feature, including API endpoints, data structures, and integration patterns.

## Backend API Endpoints

### Base Configuration

**Production Backend**: `https://api-hyperbuds-backend.onrender.com/api/v1`
**Local Development**: `http://localhost:4000/api/v1`

### Authentication

All sync endpoints require Bearer token authentication:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Sync Endpoints

### 1. TikTok Sync

**Endpoint**: `POST /profiles/social-sync/tiktok`

**Request Body**:
```json
{
  "followers": 1000,
  "engagement": 7.5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Social media Tiktok synced successfully",
  "profile": {
    "stats": {
      "platformBreakdown": {
        "tiktok": {
          "followers": 1000,
          "engagement": 7.5
        },
        "instagram": {
          "followers": 15925,
          "engagement": 2.91
        },
        "youtube": {
          "followers": 7100,
          "engagement": 2.66
        },
        "twitch": {
          "followers": 0,
          "engagement": 0
        }
      },
      "totalFollowers": 24025,
      "avgEngagement": 1.39
    },
    "preferences": {
      "audienceSize": {
        "min": 0,
        "max": 1000000
      },
      "budget": {
        "min": 0,
        "max": 10000
      },
      "collaborationTypes": [],
      "locations": []
    },
    "location": {
      "city": "Delhi",
      "state": "Delhi",
      "country": "India"
    },
    "_id": "68cec58c9b8985cfa07fe824",
    "userId": "68cec2a59b8985cfa07fe80a",
    "niche": ["music", "education", "gaming", "comedy", "fitness"],
    "rizzScore": 79,
    "isPublic": true,
    "isActive": true,
    "lastSeen": "2025-09-26T21:02:18.953Z",
    "createdAt": "2025-09-20T15:17:32.306Z",
    "updatedAt": "2025-10-08T19:01:19.222Z",
    "__v": 0,
    "bio": "Hi",
    "displayName": "Yash Gupta",
    "avatar": "",
    "profileUrl": "",
    "id": ""
  }
}
```

### 2. Twitch Sync

**Endpoint**: `POST /profiles/social-sync/twitch`

**Request Body**:
```json
{
  "followers": 500,
  "engagement": 3.2
}
```

**Response**: Same structure as TikTok sync

### 3. Twitter Sync

**Endpoint**: `POST /profiles/social-sync/twitter`

**Request Body**:
```json
{
  "followers": 2500,
  "engagement": 5.8
}
```

**Response**: Same structure as TikTok sync

### 4. Instagram Sync

**Endpoint**: `POST /profiles/social-sync/instagram`

**Request Body**:
```json
{
  "followers": 15000,
  "engagement": 4.2
}
```

**Response**: Same structure as TikTok sync

## Data Validation

### Required Fields

- `followers`: Number (required)
- `engagement`: Number (optional)

### Validation Rules

```javascript
// Backend validation example
const validateSyncData = (data) => {
  const errors = [];
  
  if (!data.followers || typeof data.followers !== 'number') {
    errors.push({
      message: '"followers" is required',
      path: ['followers'],
      type: 'any.required',
      context: {
        key: 'followers',
        label: 'followers'
      }
    });
  }
  
  if (data.followers < 0) {
    errors.push({
      message: '"followers" must be a positive number',
      path: ['followers'],
      type: 'number.positive',
      context: {
        key: 'followers',
        value: data.followers
      }
    });
  }
  
  if (data.engagement && (data.engagement < 0 || data.engagement > 100)) {
    errors.push({
      message: '"engagement" must be between 0 and 100',
      path: ['engagement'],
      type: 'number.range',
      context: {
        key: 'engagement',
        value: data.engagement
      }
    });
  }
  
  return errors;
};
```

## Error Responses

### Validation Error (400 Bad Request)

```json
{
  "message": "Validation failed",
  "details": [
    {
      "message": "\"followers\" is required",
      "path": ["followers"],
      "type": "any.required",
      "context": {
        "key": "followers",
        "label": "followers"
      }
    }
  ]
}
```

### Authentication Error (401 Unauthorized)

```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing token"
}
```

### Not Found Error (404 Not Found)

```json
{
  "message": "Profile not found",
  "error": "User profile does not exist"
}
```

### Server Error (500 Internal Server Error)

```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Database Schema

### Profile Document Structure

```javascript
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "displayName": "String",
  "bio": "String",
  "avatar": "String",
  "profileUrl": "String",
  "niche": ["String"],
  "rizzScore": "Number",
  "isPublic": "Boolean",
  "isActive": "Boolean",
  "lastSeen": "Date",
  "createdAt": "Date",
  "updatedAt": "Date",
  "stats": {
    "platformBreakdown": {
      "tiktok": {
        "followers": "Number",
        "engagement": "Number"
      },
      "instagram": {
        "followers": "Number",
        "engagement": "Number"
      },
      "youtube": {
        "followers": "Number",
        "engagement": "Number"
      },
      "twitch": {
        "followers": "Number",
        "engagement": "Number"
      }
    },
    "totalFollowers": "Number",
    "avgEngagement": "Number"
  },
  "preferences": {
    "audienceSize": {
      "min": "Number",
      "max": "Number"
    },
    "budget": {
      "min": "Number",
      "max": "Number"
    },
    "collaborationTypes": ["String"],
    "locations": ["String"]
  },
  "location": {
    "city": "String",
    "state": "String",
    "country": "String"
  }
}
```

## Backend Processing Logic

### Sync Process

1. **Validate Request**:
   - Check authentication token
   - Validate request body
   - Verify user exists

2. **Update Platform Data**:
   - Update `stats.platformBreakdown.{platform}`
   - Set followers and engagement values
   - Update timestamp

3. **Recalculate Aggregates**:
   - Sum all platform followers for `totalFollowers`
   - Calculate average engagement for `avgEngagement`
   - Update `updatedAt` timestamp

4. **Return Updated Profile**:
   - Fetch complete profile
   - Return success response

### Code Example

```javascript
// Backend sync handler
const syncPlatformData = async (req, res) => {
  try {
    const { platform } = req.params;
    const { followers, engagement } = req.body;
    const userId = req.user.id;

    // Validate platform
    const validPlatforms = ['tiktok', 'twitter', 'twitch', 'instagram'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        message: 'Invalid platform type',
        error: 'Platform must be one of: tiktok, twitter, twitch, instagram'
      });
    }

    // Validate data
    const validationErrors = validateSyncData({ followers, engagement });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        details: validationErrors
      });
    }

    // Update profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          [`stats.platformBreakdown.${platform}`]: {
            followers,
            engagement: engagement || 0
          },
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        message: 'Profile not found',
        error: 'User profile does not exist'
      });
    }

    // Recalculate aggregates
    const platformBreakdown = profile.stats.platformBreakdown;
    const totalFollowers = Object.values(platformBreakdown)
      .reduce((sum, platform) => sum + (platform.followers || 0), 0);
    
    const avgEngagement = Object.values(platformBreakdown)
      .filter(platform => platform.engagement > 0)
      .reduce((sum, platform, _, arr) => sum + platform.engagement / arr.length, 0);

    // Update aggregates
    await Profile.findByIdAndUpdate(profile._id, {
      $set: {
        'stats.totalFollowers': totalFollowers,
        'stats.avgEngagement': avgEngagement
      }
    });

    // Return updated profile
    const updatedProfile = await Profile.findById(profile._id);
    
    res.json({
      success: true,
      message: `Social media ${platform} synced successfully`,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};
```

## Rate Limiting

### Current Implementation

- **No rate limiting** currently implemented
- **Recommended**: 10 syncs per minute per user
- **Future**: Redis-based rate limiting

### Recommended Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const syncRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    message: 'Too many sync requests',
    error: 'Please wait before syncing again'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to sync routes
app.use('/api/v1/profiles/social-sync', syncRateLimit);
```

## Security Considerations

### Input Sanitization

```javascript
const sanitizeSyncData = (data) => {
  return {
    followers: Math.max(0, Math.floor(Number(data.followers))),
    engagement: Math.max(0, Math.min(100, Number(data.engagement || 0)))
  };
};
```

### Authentication

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'Invalid token'
      });
    }
    req.user = user;
    next();
  });
};
```

### Data Validation

```javascript
const validatePlatformData = (platform, data) => {
  const schema = {
    tiktok: {
      followers: { type: 'number', min: 0, max: 100000000 },
      engagement: { type: 'number', min: 0, max: 100 }
    },
    twitter: {
      followers: { type: 'number', min: 0, max: 100000000 },
      engagement: { type: 'number', min: 0, max: 100 }
    },
    twitch: {
      followers: { type: 'number', min: 0, max: 10000000 },
      engagement: { type: 'number', min: 0, max: 100 }
    },
    instagram: {
      followers: { type: 'number', min: 0, max: 100000000 },
      engagement: { type: 'number', min: 0, max: 100 }
    }
  };

  return validate(data, schema[platform]);
};
```

## Monitoring and Logging

### Sync Metrics

```javascript
const syncMetrics = {
  totalSyncs: 0,
  successfulSyncs: 0,
  failedSyncs: 0,
  platformBreakdown: {
    tiktok: 0,
    twitter: 0,
    twitch: 0,
    instagram: 0
  }
};

// Log sync events
const logSyncEvent = (platform, success, error = null) => {
  syncMetrics.totalSyncs++;
  syncMetrics.platformBreakdown[platform]++;
  
  if (success) {
    syncMetrics.successfulSyncs++;
    console.log(`✅ ${platform} sync successful`);
  } else {
    syncMetrics.failedSyncs++;
    console.error(`❌ ${platform} sync failed:`, error);
  }
};
```

### Error Tracking

```javascript
const trackSyncError = (platform, error, userId) => {
  console.error('Sync Error:', {
    platform,
    error: error.message,
    userId,
    timestamp: new Date().toISOString(),
    stack: error.stack
  });
  
  // Send to error tracking service (e.g., Sentry)
  // Sentry.captureException(error, {
  //   tags: { platform, userId },
  //   extra: { syncData: req.body }
  // });
};
```

## Testing

### Unit Tests

```javascript
describe('Sync Platform Data', () => {
  it('should sync TikTok data successfully', async () => {
    const mockData = { followers: 1000, engagement: 7.5 };
    const result = await syncPlatformData('tiktok', mockData, 'user123');
    
    expect(result.success).toBe(true);
    expect(result.profile.stats.platformBreakdown.tiktok).toEqual(mockData);
  });

  it('should validate required fields', async () => {
    const invalidData = { engagement: 7.5 }; // missing followers
    
    await expect(syncPlatformData('tiktok', invalidData, 'user123'))
      .rejects.toThrow('followers is required');
  });
});
```

### Integration Tests

```javascript
describe('Sync API Endpoints', () => {
  it('should sync TikTok via API', async () => {
    const response = await request(app)
      .post('/api/v1/profiles/social-sync/tiktok')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ followers: 1000, engagement: 7.5 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.profile.stats.platformBreakdown.tiktok.followers).toBe(1000);
  });
});
```

## Deployment Considerations

### Environment Variables

```env
# Required
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/hyperbuds

# Optional
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
LOG_LEVEL=info
```

### Health Checks

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      redis: 'connected'
    }
  });
});
```

### Performance Monitoring

```javascript
const syncPerformance = {
  averageResponseTime: 0,
  totalRequests: 0,
  slowRequests: 0
};

const trackPerformance = (startTime, platform) => {
  const duration = Date.now() - startTime;
  syncPerformance.totalRequests++;
  syncPerformance.averageResponseTime = 
    (syncPerformance.averageResponseTime + duration) / 2;
  
  if (duration > 5000) { // 5 seconds
    syncPerformance.slowRequests++;
    console.warn(`Slow sync detected: ${platform} took ${duration}ms`);
  }
};
```

## Future Enhancements

### Planned Features

1. **Batch Sync**: Sync multiple platforms in one request
2. **Historical Data**: Track follower growth over time
3. **Auto-Sync**: Scheduled automatic syncs
4. **Webhooks**: Real-time sync notifications
5. **Analytics**: Sync usage analytics

### Technical Improvements

1. **Caching**: Redis cache for frequently accessed profiles
2. **Queue System**: Background sync processing
3. **WebSockets**: Real-time sync status updates
4. **GraphQL**: More efficient data fetching
5. **Microservices**: Separate sync service
