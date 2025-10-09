# Social Sync API Documentation

## Backend API Endpoints

### Base URL
- **Production**: `https://api-hyperbuds-backend.onrender.com/api/v1`
- **Local Development**: `http://localhost:4000/api/v1`

### Authentication
All requests require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Sync Endpoints

### 1. Sync TikTok Data

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

### 2. Sync Twitch Data

**Endpoint**: `POST /profiles/social-sync/twitch`

**Request Body**:
```json
{
  "followers": 500,
  "engagement": 3.2
}
```

**Response**: Same structure as TikTok sync

### 3. Sync Twitter Data

**Endpoint**: `POST /profiles/social-sync/twitter`

**Request Body**:
```json
{
  "followers": 2500,
  "engagement": 5.8
}
```

**Response**: Same structure as TikTok sync

## Frontend API Endpoints

### Platform Data Fetching

**Endpoint**: `GET /api/platform/[type]?username=[username]`

**Parameters**:
- `type`: Platform type (`tiktok`, `twitter`, `twitch`)
- `username`: Social media username

**Response**:
```json
{
  "success": true,
  "data": {
    "platform": "tiktok",
    "username": "_khaled_0_0_",
    "displayName": "khaled_",
    "profileImage": "https://...",
    "bio": "future is good-_-",
    "verified": false,
    "followers": 95,
    "following": 1200,
    "totalContent": 0,
    "totalEngagement": 0,
    "averageEngagement": 0,
    "lastFetched": "2025-10-09T13:35:02.529Z",
    "raw": { ... }
  },
  "cached": false,
  "mock": true
}
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

### Server Error (500 Internal Server Error)

```json
{
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Rate Limiting

- **RapidAPI**: 1000 requests/month (free tier)
- **Backend API**: No specific rate limits implemented
- **Frontend**: 5-minute cache for platform data

## Environment Variables

### Required for Production

```env
RAPIDAPI_KEY=your_rapidapi_key_here
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
```

### Required for Development

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
# RAPIDAPI_KEY is optional - mock data will be used if not provided
```

## Mock Data Configuration

When `RAPIDAPI_KEY` is not configured, the system returns mock data:

- **Followers**: Random number between 100-10,100
- **Following**: Random number between 10-1,010
- **Content**: Random number between 5-105
- **Engagement**: Random number between 100-5,100
- **Average Engagement**: Random number between 1-21

## Testing Endpoints

### Manual Testing

```bash
# Test TikTok sync
curl -X POST "https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followers": 1000, "engagement": 7.5}'

# Test platform data fetching
curl "http://localhost:3000/api/platform/tiktok?username=_khaled_0_0_"
```

### Console Testing

```javascript
// Test sync in browser console
const testSync = async () => {
  const response = await fetch('/api/platform/tiktok?username=test', {
    method: 'GET'
  });
  const data = await response.json();
  console.log('Platform data:', data);
};
testSync();
```
