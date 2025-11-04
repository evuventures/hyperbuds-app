# Social API Documentation (Backend Integration)

**Last Updated:** January 2025  
**Status:** ✅ **Frontend Implementation Complete** | ⚠️ **Backend Endpoint Status: Deployed but Has Error**  
**Priority:** 🔴 **HIGH** - Required for platform validation to work

### 🔴 **Current Backend Error:**
```
Error: socialMediaService.fetchSocialData is not a function
Status: 500 Internal Server Error
```

**Issue:** The backend endpoint `/api/v1/social/fetch` is deployed and receiving requests, but there's a bug in the backend code. The service method `fetchSocialData` is not defined or not properly exported.

**Fix Required:** The backend team needs to:
1. Check if `socialMediaService.fetchSocialData` function exists
2. Ensure it's properly exported/imported
3. Verify the service is correctly initialized

---

## 📋 API Specification

### **Base URL:**
```
https://api-hyperbuds-backend.onrender.com
```

### **Endpoint:**
```
POST /api/v1/social/fetch
```

### **Description:**
Fetches a user's social media data such as followers, engagement rate, and other basic profile information. This connects directly to SocialData.Tools API, so the frontend does not need to call RapidAPI or any third-party API directly.

---

## 📤 Request Format

### **Headers:**
```
Content-Type: application/json
Authorization: Bearer {accessToken}  (optional - if authentication is required)
```

### **Request Body:**
You only need to send two parameters:

```json
{
  "platform": "tiktok" | "instagram" | "youtube" | "twitter" | "twitch",
  "username": "username_here"
}
```

### **Example Request:**
```json
{
  "platform": "tiktok",
  "username": "username_here"
}
```

---

## 📥 Response Format

### **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "followers": 5200,
    "engagement": 8.3
  }
}
```

### **Error Response (400/404/500):**
```json
{
  "success": false,
  "error": "Error message here",
  "message": "Optional additional error details"
}
```

---

## 🔌 Supported Platforms

The backend supports these platforms:

1. ✅ **TikTok** - `platform: "tiktok"`
2. ✅ **Instagram** - `platform: "instagram"`
3. ✅ **YouTube** - `platform: "youtube"`
4. ✅ **Twitter/X** - `platform: "twitter"`
5. ✅ **Twitch** - `platform: "twitch"`

### **Platform-Specific Username Formats**

- **TikTok**: Username without `@` (e.g., `_khaled_0_0_`)
- **Instagram**: Username without `@` (e.g., `_looood_`)
- **YouTube**: Username without `@` (e.g., `username` or channel name)
- **Twitter**: Username without `@` (e.g., `khaled05075119`)
- **Twitch**: Channel name (e.g., `ninja`)

---

## 🔧 Backend Environment Variables

**⚠️ IMPORTANT:** These environment variables are configured on the **BACKEND** server, NOT the frontend. The frontend does NOT need these variables.

**Backend Environment Variables (.env):**
```env
SOCIALDATA_API_URL=https://api.socialdata.tools/v1/social
SOCIALDATA_API_KEY=_api_key_here
PORT=4000
NODE_ENV=production
```

**Note:** These are already configured on the backend but listed for clarity.

---

## ⚡ Rate Limits

Rate limits from SocialData.Tools API:

- **TikTok** – around 200 requests per hour (depends on plan)
- **Instagram** – around 200 requests per hour
- **YouTube** – up to 10,000 requests per day (Google quota)
- **Twitter/X** – about 300 requests per 15 minutes
- **Twitch** – about 800 requests per minute

---

## 🎯 Frontend Implementation Status

### ✅ **What's Already Done:**

1. ✅ **Platform API Service** (`src/lib/api/platform.api.ts`)
   - Complete integration layer ready for backend
   - Handles all 5 platforms
   - Caching implemented (5-minute cache)
   - Error handling implemented

2. ✅ **Next.js API Route** (`src/app/api/platform/[type]/route.ts`)
   - Route handler ready
   - Validates platform types
   - Validates usernames
   - Passes requests to backend API

3. ✅ **React Hooks** (`src/hooks/features/usePlatformData.ts`)
   - Client-side data fetching
   - Multiple platform support
   - Error handling
   - Loading states

4. ✅ **UI Components** (`src/components/profile/PlatformUsernameInput.tsx`)
   - Real-time validation
   - Preview cards
   - Error messages
   - Success indicators

5. ✅ **Type Definitions** (`src/types/platform.types.ts`)
   - All platforms defined
   - Type safety implemented

6. ✅ **Base URL Configuration** (`src/config/baseUrl.ts`)
   - Configured to: `https://api-hyperbuds-backend.onrender.com`

### ✅ **Frontend Configuration:**
- **Base URL:** `https://api-hyperbuds-backend.onrender.com` (configured in `src/config/baseUrl.ts`)
- **Endpoint:** `/api/v1/social/fetch`
- **Method:** `POST`
- **Authentication:** Optional - Token passed via `Authorization: Bearer {token}` header if available
- **No frontend environment variables needed** - All configuration is in code

### ✅ **Verification Checklist:**
- ✅ Base URL matches documentation
- ✅ Endpoint path matches documentation (`/api/v1/social/fetch`)
- ✅ Request format matches documentation (platform + username)
- ✅ Response format handling matches documentation
- ✅ Authentication token forwarding implemented
- ✅ All 5 platforms supported (TikTok, Instagram, YouTube, Twitter, Twitch)
- ✅ Error handling implemented
- ✅ Caching implemented (5-minute cache)

---

## 🚨 Error Handling

The backend should handle and return appropriate error responses:

### **Invalid Platform (400 Bad Request)**
```json
{
  "success": false,
  "error": "Invalid platform. Supported platforms: tiktok, instagram, youtube, twitter, twitch"
}
```

### **Username Not Found (404 Not Found)**
```json
{
  "success": false,
  "error": "Username not found on platform"
}
```

### **Rate Limit Exceeded (429 Too Many Requests)**
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

### **API Error (500 Internal Server Error)**
```json
{
  "success": false,
  "error": "Failed to fetch social media data",
  "message": "SocialData.Tools API error: [details]"
}
```

---

## ✅ Frontend Implementation Status

### **What's Already Done:**

1. ✅ **Platform API Service** (`src/lib/api/platform.api.ts`)
   - Complete integration layer ready for backend
   - Handles all 5 platforms
   - Caching implemented (5-minute cache)
   - Error handling implemented

2. ✅ **Next.js API Route** (`src/app/api/platform/[type]/route.ts`)
   - Route handler ready
   - Validates platform types
   - Validates usernames
   - Passes requests to backend API

3. ✅ **React Hooks** (`src/hooks/features/usePlatformData.ts`)
   - Client-side data fetching
   - Multiple platform support
   - Error handling
   - Loading states

4. ✅ **UI Components** (`src/components/profile/PlatformUsernameInput.tsx`)
   - Real-time validation
   - Preview cards
   - Error messages
   - Success indicators

5. ✅ **Type Definitions** (`src/types/platform.types.ts`)
   - All platforms defined
   - Type safety implemented

### **What's Waiting for Backend:**

- ❌ Backend endpoint `/api/v1/social/fetch` implementation
- ❌ Integration with SocialData.Tools API
- ❌ Error handling for rate limits
- ❌ Authentication (if required)

---

## 📝 Testing Checklist

Once the backend endpoint is implemented, test with:

### **Test Cases:**

1. **TikTok:**
   ```bash
   POST /api/v1/social/fetch
   {
     "platform": "tiktok",
     "username": "_khaled_0_0_"
   }
   ```

2. **Instagram:**
   ```bash
   POST /api/v1/social/fetch
   {
     "platform": "instagram",
     "username": "_looood_"
   }
   ```

3. **YouTube:**
   ```bash
   POST /api/v1/social/fetch
   {
     "platform": "youtube",
     "username": "testuser"
   }
   ```

4. **Twitter:**
   ```bash
   POST /api/v1/social/fetch
   {
     "platform": "twitter",
     "username": "khaled05075119"
   }
   ```

5. **Twitch:**
   ```bash
   POST /api/v1/social/fetch
   {
     "platform": "twitch",
     "username": "ninja"
   }
   ```

### **Error Cases to Test:**

- Invalid platform name
- Empty username
- Username not found
- Rate limit exceeded
- API connection failure

---

## 🔍 Current Frontend Flow

```
User enters username
    ↓
Frontend validates input
    ↓
Calls: GET /api/platform/[type]?username=xxx
    ↓
Next.js API Route (server-side)
    ↓
Calls: POST /api/v1/social/fetch
    ↓
Backend API (SocialData.Tools)
    ↓
Returns: { success: true, data: { followers, engagement } }
    ↓
Frontend normalizes data
    ↓
Displays preview card with user info
```

---

## 🚀 Implementation Steps for Backend Team

### **Step 1: Create the Route**

Create a new route handler:
```javascript
// routes/social.js or similar
router.post('/api/v1/social/fetch', async (req, res) => {
  // Implementation here
});
```

### **Step 2: Validate Request**

```javascript
const { platform, username } = req.body;

// Validate platform
const validPlatforms = ['tiktok', 'instagram', 'youtube', 'twitter', 'twitch'];
if (!validPlatforms.includes(platform)) {
  return res.status(400).json({
    success: false,
    error: `Invalid platform. Supported: ${validPlatforms.join(', ')}`
  });
}

// Validate username
if (!username || username.trim() === '') {
  return res.status(400).json({
    success: false,
    error: 'Username is required'
  });
}
```

### **Step 3: Call SocialData.Tools API**

```javascript
const response = await fetch(`${SOCIALDATA_API_URL}/fetch`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SOCIALDATA_API_KEY}`
  },
  body: JSON.stringify({
    platform: platform,
    username: username.trim()
  })
});

const data = await response.json();
```

### **Step 4: Format Response**

```javascript
if (data.success && data.data) {
  return res.json({
    success: true,
    data: {
      followers: data.data.followers || 0,
      engagement: data.data.engagement || 0
    }
  });
} else {
  return res.status(404).json({
    success: false,
    error: data.error || 'Failed to fetch social media data'
  });
}
```

---

## 📊 Expected Response Format

The backend MUST return data in this exact format:

```json
{
  "success": true,
  "data": {
    "followers": 5200,
    "engagement": 8.3
  }
}
```

**Important Notes:**
- `followers` must be a number (not string)
- `engagement` must be a number (percentage, e.g., 8.3 = 8.3%)
- Both fields are required when `success: true`

---

## 🔐 Authentication (Optional)

If the endpoint requires authentication, the frontend will send:
```
Authorization: Bearer {accessToken}
```

The backend should:
- Validate the token if authentication is required
- Return `401 Unauthorized` if token is invalid/missing
- Process the request if token is valid

**Current Status:** Frontend sends auth token, but backend endpoint doesn't exist yet to test authentication.

---

## ⚠️ Critical Notes

1. **Endpoint Path:** Must be exactly `/api/v1/social/fetch`
2. **HTTP Method:** Must be `POST` (not GET)
3. **Response Format:** Must match the format specified above
4. **Error Handling:** Must return proper error messages
5. **Rate Limiting:** Handle SocialData.Tools rate limits gracefully

---

## 📞 Support

If you need clarification on:
- Request/response format
- Platform-specific requirements
- Error handling
- Integration details

Please refer to this document or contact the frontend team.

---

## 🎯 Success Criteria

The endpoint will be considered working when:

1. ✅ Returns `200 OK` with valid data for valid usernames
2. ✅ Returns proper error messages for invalid usernames
3. ✅ Handles rate limits gracefully
4. ✅ Works for all 5 platforms (TikTok, Instagram, YouTube, Twitter, Twitch)
5. ✅ Response format matches the specification exactly

---

## 📝 Example Implementation (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Environment variables
const SOCIALDATA_API_URL = process.env.SOCIALDATA_API_URL || 'https://api.socialdata.tools/v1/social';
const SOCIALDATA_API_KEY = process.env.SOCIALDATA_API_KEY;

router.post('/api/v1/social/fetch', async (req, res) => {
  try {
    const { platform, username } = req.body;

    // Validate platform
    const validPlatforms = ['tiktok', 'instagram', 'youtube', 'twitter', 'twitch'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: `Invalid platform. Supported platforms: ${validPlatforms.join(', ')}`
      });
    }

    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    // Call SocialData.Tools API
    try {
      const response = await axios.post(
        `${SOCIALDATA_API_URL}/fetch`,
        {
          platform: platform,
          username: username.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SOCIALDATA_API_KEY}`
          }
        }
      );

      // Check if response is successful
      if (response.data && response.data.success && response.data.data) {
        return res.json({
          success: true,
          data: {
            followers: response.data.data.followers || 0,
            engagement: response.data.data.engagement || 0
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          error: response.data?.error || 'Failed to fetch social media data'
        });
      }
    } catch (apiError) {
      // Handle API errors
      if (apiError.response?.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        });
      }

      if (apiError.response?.status === 404) {
        return res.status(404).json({
          success: false,
          error: `Username "${username}" not found on ${platform}`
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch social media data',
        message: apiError.message
      });
    }
  } catch (error) {
    console.error('Social fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
```

---

## ✅ Verification

Once implemented, verify the endpoint works by testing:

```bash
curl -X POST https://api-hyperbuds-backend.onrender.com/api/v1/social/fetch \
  -H "Content-Type: application/json" \
  -d '{"platform":"instagram","username":"_looood_"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "followers": 5200,
    "engagement": 8.3
  }
}
```

---

**Frontend Status:** ✅ **100% Complete - Waiting for Backend**  
**Backend Status:** ❌ **Not Implemented - Blocking Feature**

