# Social Sync Implementation Status & Backend Requirements

**Last Updated:** January 2025  
**Status:** Partially Complete - 3/4 Platforms Fully Functional

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implementation Status](#implementation-status)
3. [Backend API Integration](#backend-api-integration)
4. [RapidAPI Issues & Errors](#rapidapi-issues--errors)
5. [Data Format & API Contracts](#data-format--api-contracts)
6. [What Backend Team Needs to Know](#what-backend-team-needs-to-know)
7. [Known Issues & Limitations](#known-issues--limitations)
8. [Next Steps & Recommendations](#next-steps--recommendations)

---

## 🎯 Executive Summary

The social media sync feature allows users to connect their social media accounts (TikTok, Twitter, Twitch, Instagram) and sync follower/engagement data to their HyperBuds profile. 

**Current Status:**
- ✅ **3 Platforms Fully Working**: TikTok, Twitter, Twitch (can fetch data from RapidAPI + sync to backend)
- ⚠️ **1 Platform Partially Working**: Instagram (can sync to backend, but cannot fetch from RapidAPI yet)
- ❌ **RapidAPI Quota Issue**: Monthly quota exceeded for TikTok API, blocking data fetching

**Critical Issues:**
1. RapidAPI BASIC plan monthly quota has been exceeded
2. Instagram RapidAPI integration not yet implemented
3. Error handling improved, but users see quota warnings

---

## 📊 Implementation Status

### ✅ Fully Implemented Platforms (3/4)

#### 1. **TikTok** ✅
- **Data Fetching**: ✅ Implemented via RapidAPI (TikTok API23)
- **Backend Sync**: ✅ Implemented (`POST /profiles/social-sync/tiktok`)
- **Data Sent**: `followers`, `engagement`
- **Status**: Fully functional when RapidAPI quota available

#### 2. **Twitter** ✅
- **Data Fetching**: ✅ Implemented via RapidAPI (Twitter241)
- **Backend Sync**: ✅ Implemented (`POST /profiles/social-sync/twitter`)
- **Data Sent**: `followers`, `engagement`
- **Status**: Fully functional when RapidAPI quota available

#### 3. **Twitch** ✅
- **Data Fetching**: ✅ Implemented via RapidAPI (Twitch Scraper2)
- **Backend Sync**: ✅ Implemented (`POST /profiles/social-sync/twitch`)
- **Data Sent**: `followers`, `engagement`
- **Status**: Fully functional when RapidAPI quota available

### ⚠️ Partially Implemented Platforms (1/4)

#### 4. **Instagram** ⚠️
- **Data Fetching**: ❌ NOT Implemented (no RapidAPI endpoint configured)
- **Backend Sync**: ✅ Implemented (`POST /profiles/social-sync/instagram`)
- **Data Sent**: `followers`, `engagement`
- **Status**: Can sync manually entered data, but cannot fetch from API
- **Missing**: 
  - RapidAPI host configuration
  - `fetchInstagramUserInfo()` function
  - Integration in `fetchPlatformData()` switch statement
  - Validation in API route `validPlatforms` array

---

## 🔌 Backend API Integration

### Base Configuration

**Base URL:** `https://api-hyperbuds-backend.onrender.com/api/v1`

**Authentication:**
- All requests require Bearer token in Authorization header
- Token retrieved from `localStorage.getItem("accessToken")`
- Automatically added by Axios interceptor in `src/lib/api/client.ts`

### Sync Endpoints Used

All endpoints accept the same request format and return similar response structure.

#### Request Format

```typescript
interface SocialSyncRequest {
  followers?: number;  // Number of followers
  engagement?: number; // Engagement rate/score
}
```

**Example Request:**
```json
{
  "followers": 10000,
  "engagement": 7.5
}
```

#### Response Format

```typescript
interface SocialSyncResponse {
  success: boolean;
  message: string;
  profile: {
    stats: {
      platformBreakdown: {
        tiktok?: { followers: number; engagement: number };
        instagram?: { followers: number; engagement: number };
        youtube?: { followers: number; engagement: number };
        twitch?: { followers: number; engagement: number };
      };
      totalFollowers: number;
      avgEngagement: number;
    };
    // ... other profile fields
  };
}
```

### Endpoints Called by Frontend

| Platform | Endpoint | Method | Request Body | Status |
|----------|----------|---------|--------------|--------|
| TikTok | `/profiles/social-sync/tiktok` | POST | `{ followers, engagement }` | ✅ Working |
| Twitter | `/profiles/social-sync/twitter` | POST | `{ followers, engagement }` | ✅ Working |
| Twitch | `/profiles/social-sync/twitch` | POST | `{ followers, engagement }` | ✅ Working |
| Instagram | `/profiles/social-sync/instagram` | POST | `{ followers, engagement }` | ✅ Working (manual only) |

### Implementation Files

**API Client Configuration:**
- `src/lib/api/client.ts` - Axios instance with auth interceptors
- `src/lib/api/profile.api.ts` - Profile API functions including sync endpoints

**Sync Hook:**
- `src/hooks/features/useSocialSync.ts` - React hook for syncing platform data

**Key Functions:**
```typescript
// Sync single platform
syncPlatform(platform: PlatformType, platformData: UnifiedPlatformData)

// Sync all platforms at once
syncAllPlatforms(platformsData: Record<PlatformType, UnifiedPlatformData | null>)
```

### Data Flow

```
User Input Username
    ↓
Frontend validates via /api/platform/[type]?username=xxx
    ↓
RapidAPI fetch (if quota available)
    ↓
Data normalized to UnifiedPlatformData
    ↓
User clicks "Sync to Database"
    ↓
POST /profiles/social-sync/[platform]
    ↓
Backend stores data
    ↓
Frontend shows success toast & refreshes profile
```

---

## ⚠️ RapidAPI Issues & Errors

### Current RapidAPI Configuration

**Environment Variables:**
- `RAPIDAPI_KEY` or `NEXT_PUBLIC_RAPIDAPI_KEY` (preferred)

**RapidAPI Hosts:**
- TikTok: `tiktok-api23.p.rapidapi.com`
- Twitter: `twitter241.p.rapidapi.com`
- Twitch: `twitch-scraper2.p.rapidapi.com`
- Instagram: ❌ Not configured

**Caching:**
- Cache duration: 5 minutes
- Cache key format: `{platform}:{username}`

### Error Messages Encountered

#### 1. **Monthly Quota Exceeded** (Critical)

**Error Message:**
```
You have exceeded the MONTHLY quota for Requests on your current plan, BASIC. 
Upgrade your plan at https://rapidapi.com/Lundehund/api/tiktok-api23
```

**Error Source:**
- RapidAPI TikTok API23 endpoint
- HTTP Status: Usually 429 (Too Many Requests) or embedded in response body

**When This Occurs:**
- User tries to add/validate TikTok username
- API route `/api/platform/tiktok` is called
- RapidAPI returns quota error

**Frontend Handling:**
- Detects "quota" or "exceeded" keywords in error message
- Shows yellow warning icon (⚠️) instead of red error icon
- Displays user-friendly message: "⚠️ API quota exceeded. You can still save this username and sync it later."
- Allows user to proceed with saving username manually
- No mock data returned (user requested removal)

**Error Detection Code:**
```typescript
// src/lib/api/platform.api.ts
const isQuotaError = errorMessage.toLowerCase().includes('quota') || 
                    errorMessage.toLowerCase().includes('exceeded') ||
                    axiosError.response?.status === 429;
```

#### 2. **API Key Not Configured**

**Error Message:**
```
API configuration error. RapidAPI key is not configured.
```

**When This Occurs:**
- `RAPIDAPI_KEY` and `NEXT_PUBLIC_RAPIDAPI_KEY` are both missing/empty
- Frontend API route cannot make requests to RapidAPI

**HTTP Status:** `500 Internal Server Error`

#### 3. **Username Not Found**

**Error Message:**
```
Username "{username}" not found on {platform}. Please check the spelling.
```

**When This Occurs:**
- Username doesn't exist on the platform
- Typo in username entry
- Account is private/deleted

**HTTP Status:** `404 Not Found`

#### 4. **Network/API Errors**

**Error Message:**
```
Failed to fetch platform data
```

**When This Occurs:**
- RapidAPI endpoint is down
- Network connectivity issues
- Rate limiting (before quota exhaustion)
- Invalid API response format

**HTTP Status:** `404 Not Found` or `500 Internal Server Error`

### Error Handling Strategy

**Frontend Error Handling:**
1. **Quota Errors**: Yellow warning, allow manual save
2. **Username Not Found**: Red error, prevent save
3. **API Errors**: Red error, show specific message
4. **Network Errors**: Red error, suggest retry

**Error Response Format:**
```typescript
{
  success: false,
  error: "Error message here"
}
```

### RapidAPI Quota Resolution Options

**Immediate Options:**
1. ⏰ **Wait for Monthly Reset**: Quota resets at the start of next month
2. 💰 **Upgrade RapidAPI Plan**: Move from BASIC to PRO/ULTRA plan
3. 🔑 **Use Different API Key**: If backend team has separate RapidAPI account with higher quota
4. 🔄 **Implement Retry Logic**: Wait and retry with exponential backoff (requires quota reset)

**Long-term Solutions:**
1. **Backend Proxy**: Move RapidAPI calls to backend, share quota across all users
2. **Caching Strategy**: Cache user data for longer periods (current: 5 minutes)
3. **Rate Limiting**: Implement frontend rate limiting to prevent excessive API calls
4. **Multiple API Keys**: Rotate between multiple RapidAPI keys if available

---

## 📦 Data Format & API Contracts

### Data Sent to Backend

**Request Body Structure:**
```typescript
interface SocialSyncRequest {
  followers?: number;  // Total follower count
  engagement?: number; // Engagement rate/score (calculated or raw)
}
```

**Data Calculation:**

#### TikTok
- **Followers**: `statsV2.followerCount` or `stats.followerCount` or `user.followerCount`
- **Engagement**: `averageEngagement = heartCount / videoCount` (if videos exist)

#### Twitter
- **Followers**: `legacy.followers_count` or `public_metrics.followers_count`
- **Engagement**: Calculated as `(likes + tweets * 10) / tweets` (if tweets exist)

#### Twitch
- **Followers**: `followers.totalCount` or `followers.total_count`
- **Engagement**: `view_count` (total channel views)

#### Instagram (Manual Entry Only)
- **Followers**: User-entered value
- **Engagement**: User-entered value

### Data Normalization

**Unified Platform Data Format:**
```typescript
interface UnifiedPlatformData {
  platform: PlatformType;        // 'tiktok' | 'twitter' | 'twitch' | 'instagram'
  username: string;              // Platform username
  displayName: string;           // Display name
  profileImage: string;          // Profile image URL
  bio: string;                   // Bio/description
  verified: boolean;             // Verified status
  followers: number;             // Follower count → sent as 'followers'
  following: number;             // Following count (not sent to backend)
  totalContent: number;          // Total posts/videos (not sent to backend)
  totalEngagement: number;       // Total engagement (not sent to backend)
  averageEngagement: number;     // Avg engagement → sent as 'engagement'
  lastFetched: Date;            // Timestamp (not sent to backend)
  raw?: unknown;                 // Raw API response (not sent to backend)
}
```

**What Gets Sent:**
- ✅ `followers` - Mapped from `UnifiedPlatformData.followers`
- ✅ `engagement` - Mapped from `UnifiedPlatformData.averageEngagement`
- ❌ Everything else is discarded before sending to backend

### Example API Calls

**TikTok Sync Example:**
```bash
POST /api/v1/profiles/social-sync/tiktok
Authorization: Bearer <token>
Content-Type: application/json

{
  "followers": 50000,
  "engagement": 8.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Social media Tiktok synced successfully",
  "profile": {
    "stats": {
      "platformBreakdown": {
        "tiktok": {
          "followers": 50000,
          "engagement": 8.5
        }
      },
      "totalFollowers": 50000,
      "avgEngagement": 8.5
    }
  }
}
```

---

## 📢 What Backend Team Needs to Know

### 1. Current API Contract Compliance ✅

The frontend is correctly sending data to all backend endpoints:

- ✅ All 4 sync endpoints implemented (`/profiles/social-sync/{platform}`)
- ✅ Request format matches: `{ followers?: number, engagement?: number }`
- ✅ Authentication handled via Bearer token
- ✅ Error responses handled appropriately

### 2. No Changes Needed to Backend APIs

The backend API endpoints are working correctly. The frontend implementation is aligned with the backend contract.

### 3. Instagram Implementation Status

**Frontend Status:**
- ✅ Instagram sync endpoint is called correctly (`POST /profiles/social-sync/instagram`)
- ✅ Data format matches other platforms
- ❌ Cannot fetch Instagram data from RapidAPI (not implemented yet)

**Backend Status:**
- ✅ Instagram endpoint exists and works
- ✅ Accepts manual follower/engagement data

**Recommendation:**
- Backend team doesn't need to make changes
- Once RapidAPI Instagram endpoint is available, frontend will integrate it

### 4. Error Responses Expected

**Backend Should Return:**
- ✅ Success: `{ success: true, message: "...", profile: {...} }`
- ✅ Error: `{ success: false, error: "Error message" }` or standard error format

**Frontend Handles:**
- Network errors
- 401 Unauthorized (clears token, redirects to login)
- 400 Bad Request (shows error message)
- 500 Internal Server Error (shows generic error)

### 5. Data Validation

**Frontend Validates:**
- ✅ Username is not empty before API call
- ✅ Platform type is valid ('tiktok', 'twitter', 'twitch', 'instagram')
- ✅ Data exists before allowing sync (`followers > 0`)

**Backend Should Validate:**
- ⚠️ Ensure `followers` and `engagement` are valid numbers
- ⚠️ Ensure values are within reasonable ranges (e.g., followers >= 0)
- ⚠️ Handle missing optional fields gracefully

### 6. Rate Limiting Considerations

**Current Frontend Behavior:**
- Caches API responses for 5 minutes
- Makes new API call only if cache expired or username changed
- Shows loading states during API calls

**Backend Recommendations:**
- Consider implementing rate limiting on sync endpoints
- Prevent rapid-fire sync requests from same user
- Consider caching to reduce database writes

### 7. Batch Sync Support

**Frontend Implementation:**
- ✅ `syncAllPlatforms()` function calls each platform endpoint sequentially
- ✅ Uses `Promise.all()` for parallel execution
- ✅ Returns success if at least one platform syncs successfully

**Backend Consideration:**
- Consider adding batch sync endpoint: `POST /profiles/social-sync/batch`
- Could accept: `{ tiktok: {...}, twitter: {...}, twitch: {...}, instagram: {...} }`
- Would reduce API calls and improve performance

---

## 🐛 Known Issues & Limitations

### 1. RapidAPI Quota Exceeded ⚠️ CRITICAL

**Issue:** Monthly quota for TikTok API (BASIC plan) has been exceeded.

**Impact:**
- Users cannot fetch TikTok data until quota resets
- Shows warning but allows manual entry
- Other platforms may also be affected if on same plan

**Workaround:**
- Users can manually enter follower/engagement counts
- Sync functionality still works with manual data

**Solution Needed:**
- Upgrade RapidAPI plan, or
- Wait for monthly quota reset, or
- Use different API key with higher quota

### 2. Instagram API Not Implemented

**Issue:** Instagram data cannot be fetched from RapidAPI.

**Impact:**
- Users can only sync Instagram data manually
- No username validation available for Instagram

**What's Missing:**
1. RapidAPI host configuration for Instagram
2. `fetchInstagramUserInfo()` function
3. Instagram case in `fetchPlatformData()` switch
4. Instagram case in `normalizePlatformData()` switch
5. Instagram in `validPlatforms` array in API route

**Solution Needed:**
- Identify RapidAPI Instagram endpoint
- Implement Instagram fetching function
- Add Instagram normalization logic

### 3. No Mock Data Fallback

**Issue:** Removed all mock data per user request.

**Impact:**
- When API fails (quota, network, etc.), users see errors
- Cannot test sync functionality without valid API responses
- No graceful degradation

**Trade-off:**
- ✅ No misleading placeholder data
- ❌ Users must wait for API to be available or enter data manually

### 4. Error Message Clarity

**Current State:**
- Quota errors: Clear warning with helpful message ✅
- Username not found: Clear error message ✅
- API errors: Generic "Failed to fetch" message ⚠️

**Improvement Needed:**
- More specific error messages for different API failure types
- Actionable suggestions (e.g., "Try again in a few minutes")

### 5. Cache Management

**Current Implementation:**
- 5-minute cache duration
- In-memory cache (resets on server restart)
- No cache invalidation strategy

**Potential Issues:**
- Cache may serve stale data
- No way to force refresh without waiting 5 minutes
- Cache not shared across server instances (if using multiple)

**Recommendations:**
- Consider Redis or database caching for production
- Add "Refresh" button to force cache bypass
- Implement cache versioning

---

## 🚀 Next Steps & Recommendations

### Immediate Actions (Frontend Team)

1. **✅ Monitor RapidAPI Quota**
   - Check RapidAPI dashboard regularly
   - Set up alerts for quota usage
   - Plan for quota exhaustion

2. **🔍 Test Sync Functionality**
   - Test all 4 platforms with manual data entry
   - Verify backend responses match expected format
   - Test error handling for all scenarios

3. **📝 Document Instagram Integration Plan**
   - Identify which RapidAPI endpoint to use for Instagram
   - Plan implementation steps
   - Estimate effort required

### Short-term (1-2 weeks)

1. **🔄 Implement Instagram API Integration**
   - Add RapidAPI host configuration
   - Implement `fetchInstagramUserInfo()` function
   - Add Instagram to all switch statements
   - Test with real Instagram accounts

2. **⚡ Improve Error Handling**
   - Add more specific error messages
   - Implement retry logic for transient errors
   - Add error logging/tracking

3. **💾 Enhance Caching**
   - Consider persistent caching (Redis/database)
   - Add cache invalidation strategy
   - Add manual refresh capability

### Medium-term (1-2 months)

1. **🔐 Backend Proxy for RapidAPI**
   - Move RapidAPI calls to backend
   - Share quota across all users
   - Better rate limiting and caching
   - Single source of truth for API keys

2. **📊 Analytics & Monitoring**
   - Track sync success/failure rates
   - Monitor API quota usage
   - Alert on quota exhaustion
   - User analytics for sync usage

3. **🎯 Batch Sync Endpoint**
   - Backend: Implement `POST /profiles/social-sync/batch`
   - Frontend: Use batch endpoint when syncing all platforms
   - Reduce API calls and improve performance

### Long-term (3+ months)

1. **🔄 Alternative Data Sources**
   - Consider direct API integrations (if available)
   - Research alternative data providers
   - Evaluate cost vs. RapidAPI

2. **🤖 Automated Sync**
   - Scheduled background syncs
   - Webhook integration (if platforms support)
   - User preferences for sync frequency

3. **📱 Enhanced Features**
   - Historical data tracking
   - Growth analytics
   - Engagement trends
   - Comparison tools

---

## 📞 Support & Contact

### For Frontend Issues
- Check `docs/social-sync/TROUBLESHOOTING.md`
- Review `docs/social-sync/FRONTEND-IMPLEMENTATION.md`

### For Backend Questions
- Reference `docs/social-sync/API-DOCUMENTATION.md`
- Review `docs/social-sync/BACKEND-INTEGRATION.md`

### For RapidAPI Issues
- Check RapidAPI dashboard: https://rapidapi.com/developer
- Review API documentation for specific endpoints
- Contact RapidAPI support if quota issues persist

---

## 📋 Quick Reference

### Supported Platforms
- ✅ TikTok - Fully functional (quota dependent)
- ✅ Twitter - Fully functional (quota dependent)
- ✅ Twitch - Fully functional (quota dependent)
- ⚠️ Instagram - Sync only (no API fetch)

### Data Fields Sent
- `followers` - Number of followers
- `engagement` - Engagement rate/score

### Sync Endpoints
- `POST /profiles/social-sync/tiktok`
- `POST /profiles/social-sync/twitter`
- `POST /profiles/social-sync/twitch`
- `POST /profiles/social-sync/instagram`

### Current Blocker
- ⚠️ RapidAPI monthly quota exceeded (BASIC plan)

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Frontend Team

