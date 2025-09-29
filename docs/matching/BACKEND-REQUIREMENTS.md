# Backend Requirements for Matching Page Production

## Overview
This document outlines all the backend API endpoints, data structures, and functionality required to support the matching page in production. The frontend is already implemented and ready to integrate with these APIs.

---

## Required API Endpoints

### 1. **User Profile Endpoint**
```http
GET /api/v1/profile
Authorization: Bearer {accessToken}
```

**Response Structure:**
```json
{
  "success": true,
  "profile": {
    "userId": "string",
    "username": "string", 
    "displayName": "string",
    "avatar": "string (URL)",
    "bio": "string",
    "niche": ["string"],
    "location": {
      "city": "string",
      "state": "string", 
      "country": "string"
    },
    "socialLinks": {
      "instagram": "string (URL)",
      "youtube": "string (URL)",
      "tiktok": "string (URL)",
      "twitter": "string (URL)",
      "linkedin": "string (URL)",
      "twitch": "string (URL)"
    },
    "stats": {
      "totalFollowers": "number",
      "averageEngagement": "number",
      "platformBreakdown": {
        "instagram": "number",
        "youtube": "number",
        "tiktok": "number"
      }
    },
    "rizzScore": "number (0-100)",
    "preferences": {
      "collaborationTypes": ["string"],
      "audienceSize": {
        "min": "number",
        "max": "number"
      },
      "locations": ["string"],
      "niches": ["string"],
      "maxDistance": "number",
      "contentFrequency": "string"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Profile not found
- `500 Internal Server Error`: Server error

---

### 2. **Match Suggestions Endpoint**
```http
GET /api/v1/matching/suggestions
Authorization: Bearer {accessToken}
Query Parameters:
  - limit: number (default: 10)
  - offset: number (default: 0)
  - preferences: object (optional)
```

**Response Structure:**
```json
{
  "success": true,
  "matches": [
    {
      "_id": "string",
      "userId": "string",
      "targetUserId": "string", 
      "compatibilityScore": "number (0-100)",
      "matchType": "ai-suggested" | "manual" | "mutual-interest",
      "scoreBreakdown": {
        "audienceOverlap": "number (0-100)",
        "nicheCompatibility": "number (0-100)",
        "engagementStyle": "number (0-100)",
        "geolocation": "number (0-100)",
        "activityTime": "number (0-100)",
        "rizzScoreCompatibility": "number (0-100)"
      },
      "status": "pending" | "accepted" | "rejected" | "expired",
      "metadata": {
        "algorithm": "string",
        "confidence": "number (0-1)",
        "features": ["string"],
        "createdAt": "ISO date string",
        "expiresAt": "ISO date string"
      },
      "targetProfile": {
        "userId": "string",
        "username": "string",
        "displayName": "string", 
        "avatar": "string (URL)",
        "bio": "string",
        "niche": ["string"],
        "location": {
          "city": "string",
          "state": "string",
          "country": "string"
        },
        "socialLinks": {
          "instagram": "string (URL)",
          "youtube": "string (URL)",
          "tiktok": "string (URL)",
          "twitter": "string (URL)",
          "linkedin": "string (URL)",
          "twitch": "string (URL)"
        },
        "stats": {
          "totalFollowers": "number",
          "averageEngagement": "number",
          "platformBreakdown": {
            "instagram": "number",
            "youtube": "number", 
            "tiktok": "number"
          }
        },
        "rizzScore": "number (0-100)"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number", 
    "offset": "number",
    "hasMore": "boolean"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Invalid query parameters
- `500 Internal Server Error`: Server error

---

### 3. **Action Handling Endpoint**
```http
POST /api/v1/matching/actions
Authorization: Bearer {accessToken}
Content-Type: application/json

Body:
{
  "matchId": "string",
  "action": "like" | "unlike" | "pass" | "view" | "collab"
}
```

**Response Structure:**
```json
{
  "success": true,
  "action": "string",
  "matchId": "string",
  "timestamp": "ISO date string",
  "message": "string (optional)"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Invalid action or matchId
- `404 Not Found`: Match not found
- `409 Conflict`: Action already performed
- `500 Internal Server Error`: Server error

---

### 4. **Preferences Submission Endpoint**
```http
POST /api/v1/matching/preferences
Authorization: Bearer {accessToken}
Content-Type: application/json

Body:
{
  "collaborationTypes": ["string"],
  "audienceSize": {
    "min": "number",
    "max": "number"
  },
  "locations": ["string"],
  "niches": ["string"],
  "maxDistance": "number",
  "timezone": "string",
  "language": "string", 
  "experienceLevel": "string",
  "contentFrequency": "string"
}
```

**Response Structure:**
```json
{
  "success": true,
  "preferences": {
    "collaborationTypes": ["string"],
    "audienceSize": {
      "min": "number",
      "max": "number"
    },
    "locations": ["string"],
    "niches": ["string"],
    "maxDistance": "number",
    "timezone": "string",
    "language": "string",
    "experienceLevel": "string", 
    "contentFrequency": "string"
  },
  "updatedAt": "ISO date string",
  "message": "Preferences saved successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Invalid preferences data
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

---

### 5. **Collaboration Request Endpoint**
```http
POST /api/v1/matching/collaboration
Authorization: Bearer {accessToken}
Content-Type: application/json

Body:
{
  "targetUserId": "string",
  "message": "string (optional)",
  "collaborationType": "string (optional)"
}
```

**Response Structure:**
```json
{
  "success": true,
  "collaborationId": "string",
  "targetUserId": "string",
  "status": "pending",
  "message": "Collaboration request sent successfully",
  "createdAt": "ISO date string"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Invalid target user or data
- `404 Not Found`: Target user not found
- `409 Conflict`: Collaboration already exists
- `500 Internal Server Error`: Server error

---

## Database Schema Requirements

### 1. **Users Table**
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  niche JSON, -- Array of strings
  location JSON, -- {city, state, country}
  social_links JSON, -- {instagram, youtube, tiktok, etc.}
  stats JSON, -- {totalFollowers, averageEngagement, platformBreakdown}
  rizz_score INTEGER DEFAULT 0,
  preferences JSON, -- User's matching preferences
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. **Matches Table**
```sql
CREATE TABLE matches (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  target_user_id VARCHAR(255) NOT NULL,
  compatibility_score INTEGER NOT NULL,
  match_type ENUM('ai-suggested', 'manual', 'mutual-interest') NOT NULL,
  score_breakdown JSON, -- Detailed scoring breakdown
  status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  metadata JSON, -- Algorithm info, confidence, features
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id),
  UNIQUE KEY unique_match (user_id, target_user_id)
);
```

### 3. **Match Actions Table**
```sql
CREATE TABLE match_actions (
  id VARCHAR(255) PRIMARY KEY,
  match_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  action ENUM('like', 'unlike', 'pass', 'view', 'collab') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. **Collaborations Table**
```sql
CREATE TABLE collaborations (
  id VARCHAR(255) PRIMARY KEY,
  requester_id VARCHAR(255) NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  message TEXT,
  collaboration_type VARCHAR(100),
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (target_id) REFERENCES users(id)
);
```

---

## Algorithm Requirements

### 1. **Compatibility Scoring Algorithm**
The system needs to calculate compatibility scores based on:

**Audience Overlap (25% weight):**
- Follower count similarity
- Audience demographics overlap
- Engagement rate compatibility

**Niche Compatibility (20% weight):**
- Content category alignment
- Brand partnership potential
- Audience interest overlap

**Engagement Style (15% weight):**
- Posting frequency compatibility
- Content format preferences
- Interaction patterns

**Geolocation (15% weight):**
- Physical distance (based on maxDistance preference)
- Time zone compatibility
- Regional audience overlap

**Activity Time (10% weight):**
- Peak activity time alignment
- Time zone considerations
- Scheduling compatibility

**Rizz Score Compatibility (15% weight):**
- Rizz score similarity
- Content quality alignment
- Professional level matching

### 2. **Matching Algorithm Logic**
```javascript
// Pseudo-code for matching algorithm
function calculateCompatibility(user1, user2, preferences) {
  const scores = {
    audienceOverlap: calculateAudienceOverlap(user1.stats, user2.stats),
    nicheCompatibility: calculateNicheCompatibility(user1.niche, user2.niche),
    engagementStyle: calculateEngagementStyle(user1.stats, user2.stats),
    geolocation: calculateGeolocation(user1.location, user2.location, preferences.maxDistance),
    activityTime: calculateActivityTime(user1.activity, user2.activity),
    rizzScoreCompatibility: calculateRizzCompatibility(user1.rizzScore, user2.rizzScore)
  };
  
  const weights = {
    audienceOverlap: 0.25,
    nicheCompatibility: 0.20,
    engagementStyle: 0.15,
    geolocation: 0.15,
    activityTime: 0.10,
    rizzScoreCompatibility: 0.15
  };
  
  const totalScore = Object.keys(scores).reduce((sum, key) => {
    return sum + (scores[key] * weights[key]);
  }, 0);
  
  return {
    totalScore: Math.round(totalScore),
    breakdown: scores
  };
}
```

---

## Data Validation Requirements

### 1. **Profile Data Validation**
```javascript
// Required fields validation
const profileSchema = {
  userId: { type: 'string', required: true, minLength: 1 },
  username: { type: 'string', required: true, minLength: 3, maxLength: 50 },
  displayName: { type: 'string', required: true, minLength: 1, maxLength: 100 },
  avatar: { type: 'string', required: false, format: 'url' },
  bio: { type: 'string', required: false, maxLength: 500 },
  niche: { type: 'array', required: true, minItems: 1, maxItems: 10 },
  location: {
    type: 'object',
    required: false,
    properties: {
      city: { type: 'string', maxLength: 100 },
      state: { type: 'string', maxLength: 100 },
      country: { type: 'string', maxLength: 100 }
    }
  },
  socialLinks: {
    type: 'object',
    required: false,
    properties: {
      instagram: { type: 'string', format: 'url' },
      youtube: { type: 'string', format: 'url' },
      tiktok: { type: 'string', format: 'url' },
      twitter: { type: 'string', format: 'url' },
      linkedin: { type: 'string', format: 'url' },
      twitch: { type: 'string', format: 'url' }
    }
  },
  rizzScore: { type: 'number', required: true, minimum: 0, maximum: 100 }
};
```

### 2. **Social Media URL Validation**
```javascript
// Platform-specific URL validation
const socialUrlPatterns = {
  instagram: /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
  youtube: /^https:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?[a-zA-Z0-9_-]+\/?$/,
  tiktok: /^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/,
  twitter: /^https:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+\/?$/,
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/(in\/|company\/)[a-zA-Z0-9-]+\/?$/,
  twitch: /^https:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_]+\/?$/
};
```

---

## Performance Requirements

### 1. **Response Time Targets**
- Profile endpoint: < 200ms
- Match suggestions: < 500ms
- Action handling: < 100ms
- Preferences submission: < 300ms

### 2. **Caching Strategy**
- User profiles: Cache for 5 minutes
- Match suggestions: Cache for 2 minutes
- Static data (niches, locations): Cache for 1 hour

### 3. **Rate Limiting**
- Profile requests: 100 requests/minute per user
- Match actions: 200 requests/minute per user
- Preferences updates: 10 requests/minute per user

---

## Security Requirements

### 1. **Authentication**
- JWT token validation for all endpoints
- Token expiration handling
- Refresh token mechanism

### 2. **Data Protection**
- Input sanitization for all user data
- SQL injection prevention
- XSS protection for stored data

### 3. **Privacy**
- User data encryption at rest
- Secure transmission (HTTPS only)
- GDPR compliance for EU users

---

## Monitoring & Logging

### 1. **Required Metrics**
- API response times
- Error rates by endpoint
- User engagement metrics
- Match success rates

### 2. **Logging Requirements**
- All API requests and responses
- Error logs with stack traces
- User action logs for analytics
- Performance metrics

---

## Testing Requirements

### 1. **Unit Tests**
- All API endpoints
- Data validation functions
- Algorithm calculations
- Error handling

### 2. **Integration Tests**
- End-to-end user flows
- Database operations
- External service integrations
- Authentication flows

### 3. **Load Testing**
- Concurrent user simulation
- Database performance under load
- API rate limiting validation
- Memory and CPU usage monitoring

---

## Deployment Checklist

### 1. **Environment Setup**
- [ ] Production database configured
- [ ] Redis cache setup
- [ ] Environment variables configured
- [ ] SSL certificates installed

### 2. **API Deployment**
- [ ] All endpoints implemented and tested
- [ ] Rate limiting configured
- [ ] Monitoring and logging setup
- [ ] Error handling implemented

### 3. **Data Migration**
- [ ] User data migrated
- [ ] Indexes created for performance
- [ ] Backup strategy implemented
- [ ] Data validation completed

---

## Support & Maintenance

### 1. **Documentation**
- API documentation (Swagger/OpenAPI)
- Database schema documentation
- Deployment guides
- Troubleshooting guides

### 2. **Monitoring**
- Real-time error tracking
- Performance monitoring
- User analytics
- System health checks

---

*This document provides everything the backend team needs to implement the matching page functionality in production. The frontend is ready and will work seamlessly once these APIs are implemented.*
