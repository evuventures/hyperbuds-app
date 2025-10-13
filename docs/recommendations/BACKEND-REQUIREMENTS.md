# Backend Requirements - Recommendations Feature

## 📋 Overview

This document outlines all backend requirements for implementing the Recommendations feature, which allows users to reconsider creators they previously passed on during the matching process.

## 🎯 Business Logic

### **Core Concept**
- Users can "pass" on creators during matching
- Passed creators become "recommendations" for potential reconsideration
- Users can either "give another chance" (move to matches) or "permanently pass" (remove forever)

### **User Journey**
1. User matches with creators → Some get liked, others get passed
2. Passed creators appear in "Recommendations" section
3. User can reconsider and give them another chance
4. User can permanently remove them from recommendations

## 🗄️ Database Schema Requirements

### **1. User Matches Table**
```sql
CREATE TABLE user_matches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'like', 'pass', 'permanently_pass'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id)
);

-- Indexes
CREATE INDEX idx_user_matches_user_id ON user_matches(user_id);
CREATE INDEX idx_user_matches_action ON user_matches(action);
CREATE INDEX idx_user_matches_created_at ON user_matches(created_at);
```

### **2. User Recommendations Table**
```sql
CREATE TABLE user_recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recommended_user_id BIGINT NOT NULL,
    passed_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'accepted', 'permanently_passed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recommended_user_id)
);

-- Indexes
CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_status ON user_recommendations(status);
CREATE INDEX idx_user_recommendations_passed_at ON user_recommendations(passed_at);
```

### **3. User Profiles Table (if not exists)**
```sql
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    display_name VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    role VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    avatar_url VARCHAR(500),
    followers_count INTEGER DEFAULT 0,
    rizz_score INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    online_status BOOLEAN DEFAULT FALSE,
    specialties TEXT[], -- Array of strings
    response_time VARCHAR(50),
    collaboration_rate VARCHAR(100),
    recent_work VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_rizz_score ON user_profiles(rizz_score);
CREATE INDEX idx_user_profiles_location ON user_profiles(location);
CREATE INDEX idx_user_profiles_specialties ON user_profiles USING GIN(specialties);
```

## 🔌 API Endpoints Requirements

### **1. GET /api/recommendations**

#### **Purpose**
Fetch user's recommendations (creators they passed on)

#### **Request**
```http
GET /api/recommendations?limit=10&offset=0
Authorization: Bearer <jwt_token>
```

#### **Query Parameters**
- `limit` (optional): Number of recommendations to return (default: 10, max: 50)
- `offset` (optional): Number of recommendations to skip (default: 0)

#### **Response**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "id": 123,
        "name": "Sophie Chen",
        "role": "Art Director",
        "followers": "19K",
        "overlap": "75%",
        "synergy": "88%",
        "img": "https://example.com/avatar.jpg",
        "location": "Portland, OR",
        "responseTime": "< 2 hours",
        "collaborationRate": "$300-800",
        "rizzScore": 89,
        "verified": true,
        "online": true,
        "specialties": ["Design", "Art", "Branding"],
        "recentWork": "Brand Identity Project",
        "passedAt": "3 days ago"
      }
    ],
    "total": 25,
    "hasMore": true,
    "pagination": {
      "limit": 10,
      "offset": 0,
      "totalPages": 3,
      "currentPage": 1
    }
  }
}
```

#### **Error Responses**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid pagination parameters"
}
```

### **2. POST /api/recommendations/give-chance**

#### **Purpose**
Give a creator another chance (move from recommendations to matches)

#### **Request**
```http
POST /api/recommendations/give-chance
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "creatorId": 123
}
```

#### **Request Body**
- `creatorId` (required): ID of the creator to give another chance to

#### **Response**
```json
{
  "success": true,
  "data": {
    "creatorId": 123,
    "message": "Creator has been added to your matches!",
    "timestamp": "2024-12-19T10:30:00Z"
  }
}
```

#### **Business Logic**
1. Validate user is authenticated
2. Validate creatorId exists and is in user's recommendations
3. Update user_matches table: change action from 'pass' to 'like'
4. Update user_recommendations table: change status to 'accepted'
5. Send notification to the creator (optional)
6. Log the action for analytics

### **3. POST /api/recommendations/permanently-pass**

#### **Purpose**
Permanently remove a creator from recommendations

#### **Request**
```http
POST /api/recommendations/permanently-pass
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "creatorId": 123
}
```

#### **Request Body**
- `creatorId` (required): ID of the creator to permanently pass on

#### **Response**
```json
{
  "success": true,
  "data": {
    "creatorId": 123,
    "message": "Creator has been permanently removed from recommendations.",
    "timestamp": "2024-12-19T10:30:00Z"
  }
}
```

#### **Business Logic**
1. Validate user is authenticated
2. Validate creatorId exists and is in user's recommendations
3. Update user_matches table: change action to 'permanently_pass'
4. Update user_recommendations table: change status to 'permanently_passed'
5. Log the action for analytics

## 🔐 Authentication & Authorization

### **Required Middleware**
- JWT token validation
- User authentication check
- Rate limiting (100 requests per hour per user)

### **User Context**
All endpoints must have access to:
- `user_id` from JWT token
- User's subscription status
- User's preferences and settings

## 📊 Data Processing Requirements

### **1. Recommendations Generation**
```sql
-- Query to get user's recommendations
SELECT 
    up.id,
    up.display_name as name,
    up.role,
    up.followers_count as followers,
    up.location,
    up.avatar_url as img,
    up.rizz_score,
    up.verified,
    up.online_status as online,
    up.specialties,
    up.response_time,
    up.collaboration_rate,
    up.recent_work,
    um.created_at as passed_at
FROM user_matches um
JOIN user_profiles up ON um.target_user_id = up.user_id
WHERE um.user_id = $1 
    AND um.action = 'pass'
    AND NOT EXISTS (
        SELECT 1 FROM user_recommendations ur 
        WHERE ur.user_id = $1 
            AND ur.recommended_user_id = up.user_id 
            AND ur.status = 'permanently_passed'
    )
ORDER BY um.created_at DESC
LIMIT $2 OFFSET $3;
```

### **2. Overlap Calculation**
```sql
-- Calculate audience overlap percentage
-- This would be a complex query involving user's audience data
-- For now, return a mock calculation
SELECT 
    CASE 
        WHEN random() < 0.3 THEN '60-70%'
        WHEN random() < 0.6 THEN '70-80%'
        WHEN random() < 0.8 THEN '80-90%'
        ELSE '90-95%'
    END as overlap;
```

### **3. Synergy Score Calculation**
```sql
-- Calculate synergy score based on various factors
SELECT 
    CASE 
        WHEN random() < 0.2 THEN '70-75%'
        WHEN random() < 0.5 THEN '75-85%'
        WHEN random() < 0.8 THEN '85-90%'
        ELSE '90-95%'
    END as synergy;
```

## 🔄 Background Jobs

### **1. Recommendations Cleanup**
- **Frequency**: Daily
- **Purpose**: Remove old recommendations (older than 30 days)
- **Action**: Update status to 'expired'

### **2. Notification Service**
- **Trigger**: When user gives another chance
- **Purpose**: Notify the creator
- **Message**: "Someone gave you another chance! Check your matches."

### **3. Analytics Logging**
- **Trigger**: All recommendation actions
- **Purpose**: Track user behavior and feature performance
- **Data**: User ID, action type, creator ID, timestamp

## 📈 Performance Requirements

### **Response Times**
- GET /api/recommendations: < 500ms
- POST /api/recommendations/give-chance: < 300ms
- POST /api/recommendations/permanently-pass: < 300ms

### **Database Optimization**
- Proper indexing on all query columns
- Connection pooling
- Query optimization
- Caching for frequently accessed data

### **Rate Limiting**
- 100 requests per hour per user for recommendations
- 50 requests per hour per user for actions
- 1000 requests per hour per IP

## 🧪 Testing Requirements

### **Unit Tests**
- Database queries
- Business logic functions
- Input validation
- Error handling

### **Integration Tests**
- API endpoint responses
- Database transactions
- Authentication flow
- Error scenarios

### **Load Tests**
- Concurrent user requests
- Database performance under load
- Memory usage optimization

## 📋 Implementation Checklist

### **Phase 1: Database Setup**
- [ ] Create user_matches table
- [ ] Create user_recommendations table
- [ ] Create user_profiles table (if needed)
- [ ] Add proper indexes
- [ ] Set up database migrations

### **Phase 2: Core APIs**
- [ ] Implement GET /api/recommendations
- [ ] Implement POST /api/recommendations/give-chance
- [ ] Implement POST /api/recommendations/permanently-pass
- [ ] Add authentication middleware
- [ ] Add input validation

### **Phase 3: Business Logic**
- [ ] Implement recommendations query
- [ ] Add overlap calculation logic
- [ ] Add synergy score calculation
- [ ] Implement status updates
- [ ] Add error handling

### **Phase 4: Background Services**
- [ ] Set up cleanup job
- [ ] Implement notification service
- [ ] Add analytics logging
- [ ] Set up monitoring

### **Phase 5: Testing & Optimization**
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hyperbuds
DB_POOL_SIZE=20
DB_TIMEOUT=30000

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=100

# Notifications
NOTIFICATION_SERVICE_URL=https://api.notifications.com
NOTIFICATION_API_KEY=your-api-key

# Analytics
ANALYTICS_ENDPOINT=https://api.analytics.com
ANALYTICS_API_KEY=your-analytics-key
```

## 📚 Additional Resources

- [Database Schema Diagrams](./database-schema.md)
- [API Documentation](./api-documentation.md)
- [Testing Guidelines](./testing-guidelines.md)
- [Deployment Guide](./deployment-guide.md)

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation  
**Priority**: High  
