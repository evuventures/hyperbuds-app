# API Documentation - Recommendations Feature

## 🔗 Base URL
```
Production: https://api.hyperbuds.com
Staging: https://staging-api.hyperbuds.com
Development: http://localhost:3000
```

## 🔐 Authentication
All endpoints require JWT authentication via the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

## 📋 Endpoints Overview

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/recommendations` | Fetch user's recommendations | ✅ |
| POST | `/api/recommendations/give-chance` | Give creator another chance | ✅ |
| POST | `/api/recommendations/permanently-pass` | Permanently pass on creator | ✅ |

---

## 📖 Endpoint Details

### **1. GET /api/recommendations**

Fetch paginated list of creators the user previously passed on.

#### **Request**
```http
GET /api/recommendations?limit=10&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Query Parameters**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Number of recommendations to return (max: 50) |
| `offset` | integer | No | 0 | Number of recommendations to skip |

#### **Response - Success (200)**
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
        "img": "https://cdn.hyperbuds.com/avatars/sophie-chen.jpg",
        "location": "Portland, OR",
        "responseTime": "< 2 hours",
        "collaborationRate": "$300-800",
        "rizzScore": 89,
        "verified": true,
        "online": true,
        "specialties": ["Design", "Art", "Branding"],
        "recentWork": "Brand Identity Project",
        "passedAt": "3 days ago"
      },
      {
        "id": 124,
        "name": "Marcus Johnson",
        "role": "Fitness Coach",
        "followers": "35K",
        "overlap": "68%",
        "synergy": "82%",
        "img": "https://cdn.hyperbuds.com/avatars/marcus-johnson.jpg",
        "location": "Austin, TX",
        "responseTime": "< 3 hours",
        "collaborationRate": "$500-1.3K",
        "rizzScore": 84,
        "verified": false,
        "online": false,
        "specialties": ["Fitness", "Nutrition", "Wellness"],
        "recentWork": "30-Day Transformation Challenge",
        "passedAt": "1 week ago"
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
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (401)**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (400)**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid pagination parameters",
  "details": {
    "limit": "Must be between 1 and 50",
    "offset": "Must be non-negative"
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (500)**
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

### **2. POST /api/recommendations/give-chance**

Give a creator another chance by moving them from recommendations to matches.

#### **Request**
```http
POST /api/recommendations/give-chance
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "creatorId": 123
}
```

#### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `creatorId` | integer | Yes | ID of the creator to give another chance to |

#### **Response - Success (200)**
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

#### **Response - Error (400)**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Creator ID is required",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (404)**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Creator not found in your recommendations",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (409)**
```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Creator is already in your matches",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

### **3. POST /api/recommendations/permanently-pass**

Permanently remove a creator from recommendations.

#### **Request**
```http
POST /api/recommendations/permanently-pass
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "creatorId": 123
}
```

#### **Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `creatorId` | integer | Yes | ID of the creator to permanently pass on |

#### **Response - Success (200)**
```json
{
  "success": true,
  "data": {
    "creatorId": 123,
    "message": "Creator has been permanently removed from recommendations.",
    "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (400)**
```json
{
  "success": false,
  "message": "Creator ID is required",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

#### **Response - Error (404)**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Creator not found in your recommendations",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## 🔄 Rate Limiting

| Endpoint | Limit | Window | Headers |
|----------|-------|--------|---------|
| GET /api/recommendations | 100 requests | 1 hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| POST /api/recommendations/give-chance | 50 requests | 1 hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| POST /api/recommendations/permanently-pass | 50 requests | 1 hour | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Exceeded Response (429)**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600,
  "timestamp": "2024-12-19T10:30:00Z"
}
```

---

## 📊 Data Models

### **RecommendationCard**
```typescript
interface RecommendationCard {
  id: number;                    // Creator's user ID
  name: string;                  // Display name
  role: string;                  // Professional role
  followers: string;             // Formatted follower count (e.g., "19K")
  overlap: string;               // Audience overlap percentage (e.g., "75%")
  synergy: string;               // Synergy score (e.g., "88%")
  img: string;                   // Avatar image URL
  location: string;              // Location string
  responseTime: string;          // Typical response time (e.g., "< 2 hours")
  collaborationRate: string;     // Rate range (e.g., "$300-800")
  rizzScore: number;             // Rizz score (0-100)
  verified: boolean;             // Verification status
  online: boolean;               // Online status
  specialties: string[];         // Array of specialties/skills
  recentWork: string;            // Description of recent work
  passedAt: string;              // Human-readable time since passed (e.g., "3 days ago")
}
```

### **RecommendationsResponse**
```typescript
interface RecommendationsResponse {
  recommendations: RecommendationCard[];
  total: number;                 // Total number of recommendations
  hasMore: boolean;              // Whether there are more recommendations
  pagination: {
    limit: number;               // Current limit
    offset: number;              // Current offset
    totalPages: number;          // Total number of pages
    currentPage: number;         // Current page number
  };
}
```

### **GiveChanceResponse**
```typescript
interface GiveChanceResponse {
  success: boolean;
  creatorId: number;
  message: string;
  timestamp: string;
}
```

### **PermanentlyPassResponse**
```typescript
interface PermanentlyPassResponse {
  success: boolean;
  creatorId: number;
  message: string;
  timestamp: string;
}
```

---

## 🚨 Error Codes

| Code | Error Type | Description |
|------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists or conflict |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_SERVER_ERROR | Server error |

---

## 🧪 Testing Examples

### **cURL Examples**

#### **Get Recommendations**
```bash
curl -X GET "https://api.hyperbuds.com/api/recommendations?limit=5&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### **Give Another Chance**
```bash
curl -X POST "https://api.hyperbuds.com/api/recommendations/give-chance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creatorId": 123}'
```

#### **Permanently Pass**
```bash
curl -X POST "https://api.hyperbuds.com/api/recommendations/permanently-pass" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creatorId": 123}'
```

### **JavaScript Examples**

#### **Fetch Recommendations**
```javascript
const fetchRecommendations = async (limit = 10, offset = 0) => {
  const response = await fetch(`/api/recommendations?limit=${limit}&offset=${offset}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  return response.json();
};
```

#### **Give Another Chance**
```javascript
const giveAnotherChance = async (creatorId) => {
  const response = await fetch('/api/recommendations/give-chance', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ creatorId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to give another chance');
  }
  
  return response.json();
};
```

---

## 📈 Monitoring & Analytics

### **Metrics to Track**
- Total recommendations fetched per user
- Give chance conversion rate
- Permanently pass rate
- Average time between pass and reconsideration
- User engagement with recommendations

### **Logging**
All API calls should be logged with:
- User ID
- Endpoint called
- Request parameters
- Response status
- Response time
- Timestamp

### **Alerts**
Set up alerts for:
- High error rates (>5%)
- Slow response times (>1s)
- Rate limit violations
- Database connection issues

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation
