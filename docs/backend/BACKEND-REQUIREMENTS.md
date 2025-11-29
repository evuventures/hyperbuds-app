# Backend Requirements - Matchmaker System Integration

**Date:** January 2025  
**Status:** ⚠️ URGENT - Frontend Ready, Backend Endpoints Missing  
**Priority:** 🔴 CRITICAL  
**Base URL:** `https://api-hyperbuds-backend.onrender.com/api/v1`

---

## 📋 Executive Summary

The frontend has been fully implemented and is ready for production, but **4 critical backend endpoints are missing** and returning 404 errors. This document outlines all backend work required to support the matchmaker system integration.

**Current Status:**
- ✅ Frontend: 100% Complete
- ❌ Backend: Endpoints Not Implemented
- ⚠️ Impact: App using fallback data (not production-ready)

---

## 🎯 Priority Levels

| Priority | Endpoint | Status | Impact |
|----------|----------|--------|--------|
| 🔴 **CRITICAL** | `GET /matchmaker/niches` | ❌ Missing | Blocks 100+ niches feature |
| 🔴 **CRITICAL** | `POST /matchmaker/niches/update` | ❌ Missing | Blocks niche selection |
| 🟡 **HIGH** | `GET /matchmaker/rizz-score/:userId` | ❌ Missing | Blocks Rizz score display |
| 🟡 **HIGH** | `GET /matchmaker/suggestions/:userId` | ❌ Missing | Blocks match suggestions |

---

## 📡 Required API Endpoints

### Base Configuration

- **Base URL:** `https://api-hyperbuds-backend.onrender.com/api/v1`
- **Authentication:** Bearer token in `Authorization` header (where required)
- **Content-Type:** `application/json`
- **Error Format:** All errors should return `{ "message": "error message" }`

---

## 🔴 CRITICAL PRIORITY - Endpoint 1: Get Niches

### `GET /api/v1/matchmaker/niches`

**Purpose:** Returns complete list of 100+ AI-generated niches for user selection

**Status:** ❌ **NOT IMPLEMENTED** (Returns 404)

**Authentication:** Not required (public endpoint)

**Request:**
```http
GET /api/v1/matchmaker/niches
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "niches": [
    "Lifestyle", "Tech", "Beauty", "Finance", "Vlogging", "Comedy", "Business",
    "Travel", "Fashion", "Food", "Music", "Gaming", "Fitness", "Education",
    "Photography", "Motivation", "Cars", "Sports", "Health", "Real Estate",
    "Parenting", "Art", "Dance", "Reviews", "DIY", "Spirituality", "Movies",
    "Marketing", "Crypto", "AI", "Productivity", "Cooking", "Career", "Luxury",
    "Environment", "Gardening", "Pets", "Mental Health", "Self Improvement",
    "Science", "Tech Reviews", "Startups", "Entrepreneurship", "Investing",
    "Writing", "Books", "Podcasts", "Languages", "Culture", "History",
    "Political Commentary", "Philosophy", "Minimalism", "Home Decor",
    "Fitness Challenges", "Yoga", "Meditation", "Nutrition", "Diet Plans",
    "Streetwear", "Sneakers", "Jewelry", "Interior Design", "Architecture",
    "Web Development", "Mobile Apps", "Software Tutorials", "Gadgets",
    "AR/VR", "Blockchain", "NFTs", "Stock Market", "Trading", "Economics",
    "Legal Advice", "Relationships", "Dating", "Marriage", "Parenting Tips",
    "Travel Vlogs", "Adventure Sports", "Hiking", "Camping", "Photography Tips",
    "Film Reviews", "TV Shows", "Streaming Recommendations", "Anime", "Comics",
    "Board Games", "Card Games", "Esports", "Motorsports", "Luxury Cars",
    "Watches", "Fashion Hacks", "Beauty Tutorials", "Skincare", "Haircare",
    "Makeup", "Mental Exercises", "Life Hacks", "Motivational Stories",
    "Social Media Tips", "SEO", "Content Creation", "Affiliate Marketing",
    "Dropshipping", "E-commerce", "Cooking Hacks", "Recipes", "Baking",
    "Smoothies", "Veganism", "Sustainable Living", "Charity", "Non-profits"
  ]
}
```

**Important Requirements:**
- ✅ Must return **100+ niches** (minimum)
- ✅ Niches must be **capitalized** (e.g., "Gaming", "Tech Reviews", not "gaming", "tech reviews")
- ✅ Response must be an array of strings
- ✅ No authentication required
- ✅ Should be fast (consider caching)

**Error Responses:**
- `500 Internal Server Error` - Server error
  ```json
  {
    "message": "Failed to fetch niches"
  }
  ```

**Testing:**
```bash
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches
```

**Expected Result:** Should return 200 OK with niches array

**Current Result:** ❌ 404 Not Found - `{ "message": "Route not found" }`

---

## 🔴 CRITICAL PRIORITY - Endpoint 2: Update User Niches

### `POST /api/v1/matchmaker/niches/update`

**Purpose:** Allows user to select or update their niches

**Status:** ❌ **NOT IMPLEMENTED** (Not tested yet, but likely missing)

**Authentication:** ✅ **REQUIRED** (Bearer token)

**Request:**
```http
POST /api/v1/matchmaker/niches/update
Content-Type: application/json
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "userId": "12345",
  "niches": ["Gaming", "Tech Reviews", "Music"]
}
```

**Request Validation:**
- `userId` (string, required): Valid user ID
- `niches` (array of strings, required): Array of capitalized niche names
- Niches must match values from `/matchmaker/niches` endpoint
- Maximum niches: Should support 100+ (no hard limit, but reasonable limit recommended)

**Response (200 OK):**
```json
{
  "message": "Niches updated successfully",
  "niches": ["Gaming", "Tech Reviews", "Music"]
}
```

**Important Requirements:**
- ✅ Must validate that niches exist in the available niches list
- ✅ Must validate userId matches authenticated user
- ✅ Must store niches in user profile (separate from `/api/v1/profiles/me`)
- ✅ Niches should be stored as capitalized strings
- ✅ Should return updated niches array

**Error Responses:**

- `400 Bad Request` - Invalid request body
  ```json
  {
    "message": "Invalid niches provided"
  }
  ```

- `401 Unauthorized` - Missing or invalid token
  ```json
  {
    "message": "Authentication required"
  }
  ```

- `403 Forbidden` - User ID doesn't match authenticated user
  ```json
  {
    "message": "You can only update your own niches"
  }
  ```

- `404 Not Found` - User not found
  ```json
  {
    "message": "User not found"
  }
  ```

- `500 Internal Server Error` - Server error
  ```json
  {
    "message": "Failed to update niches"
  }
  ```

**Testing:**
```bash
curl -X POST https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "niches": ["Gaming", "Tech Reviews", "Music"]
  }'
```

**Current Result:** ❌ 404 Not Found - `{ "message": "Route not found" }`

**Frontend Handling:**
- ✅ Profile update still succeeds
- ✅ No error shown to user
- ✅ Console shows warning: "Niche update endpoint not available yet (backend not implemented)"
- ✅ Niches will automatically save once endpoint is implemented

**Note:** This endpoint is **separate** from `/api/v1/profiles/me`. The profile endpoint should remain unchanged.

---

## 🟡 HIGH PRIORITY - Endpoint 3: Get Rizz Score

### `GET /api/v1/matchmaker/rizz-score/:userId`

**Purpose:** Returns user's profile Rizz score, matching score, and match suggestions

**Status:** ❌ **NOT IMPLEMENTED** (Returns 404 - Confirmed via testing)

**Authentication:** ✅ **REQUIRED** (Bearer token)

**Request:**
```http
GET /api/v1/matchmaker/rizz-score/:userId
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `userId` (string, required): User ID to get Rizz score for

**Response (200 OK):**
```json
{
  "userId": "12345",
  "username": "ayomide",
  "displayName": "Ayomide",
  "rizzScore": {
    "profileScore": 78,
    "matchingScore": 0
  },
  "profileUrl": "https://app.hyperbuds.com/@ayomide",
  "suggestions": [
    {
      "userId": "98333",
      "username": "esther",
      "displayName": "Esther",
      "matchingScore": 63,
      "niche": ["Tech Reviews", "Music"],
      "profileUrl": "https://app.hyperbuds.com/@esther"
    },
    {
      "userId": "45678",
      "username": "john",
      "displayName": "John",
      "matchingScore": 58,
      "niche": ["Gaming", "Tech Reviews"],
      "profileUrl": "https://app.hyperbuds.com/@john"
    }
  ]
}
```

**Important Requirements:**
- ✅ `profileScore` (number, 0-100): Calculated based on user's profile completeness and niches
- ✅ `matchingScore` (number, 0-100): Overall matching score (can be 0 if no matches)
- ✅ `suggestions` (array): Users with matching score > 50%
- ✅ Each suggestion must include:
  - `userId`, `username`, `displayName`
  - `matchingScore` (number, 0-100)
  - `niche` (array of strings): User's selected niches
  - `profileUrl` (string): Full profile URL
- ✅ Suggestions should be sorted by `matchingScore` (highest first)
- ✅ Limit suggestions to reasonable number (e.g., top 20)

**Rizz Score Calculation:**
- `profileScore`: Based on:
  - Profile completeness (bio, avatar, location, social links)
  - Number of niches selected (more niches = higher score)
  - Profile quality metrics
- `matchingScore`: Based on:
  - Niche overlap with other users
  - Compatibility algorithm
  - User preferences

**Error Responses:**

- `400 Bad Request` - Invalid userId
  ```json
  {
    "message": "User ID is missing or invalid"
  }
  ```

- `401 Unauthorized` - Missing or invalid token
  ```json
  {
    "message": "Authentication required"
  }
  ```

- `404 Not Found` - User not found
  ```json
  {
    "message": "User not found"
  }
  ```

- `500 Internal Server Error` - Server error
  ```json
  {
    "message": "Failed to calculate Rizz score"
  }
  ```

**Testing:**
```bash
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/rizz-score/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:** Should return 200 OK with Rizz score data

**Current Result:** ❌ 404 Not Found - `{ "message": "Route not found" }`

**Frontend Handling:**
- ✅ Frontend uses mock/fallback data when endpoint returns 404
- ✅ No error shown to user
- ✅ Console shows warning: "Endpoint not found - Backend not implemented yet"
- ✅ Rizz Score page still loads (shows loading state or fallback)
- ✅ Once endpoint is implemented, Rizz Score will display automatically

---

## 🟡 HIGH PRIORITY - Endpoint 4: Get Match Suggestions

### `GET /api/v1/matchmaker/suggestions/:userId`

**Purpose:** Returns all users with matching score > 50% for collaboration matching

**Status:** ❌ **NOT IMPLEMENTED** (Returns 404 - Confirmed via testing)

**Authentication:** ✅ **REQUIRED** (Bearer token)

**Request:**
```http
GET /api/v1/matchmaker/suggestions/:userId
Authorization: Bearer {accessToken}
```

**URL Parameters:**
- `userId` (string, required): User ID to get suggestions for

**Response (200 OK):**
```json
{
  "userId": "12345",
  "suggestions": [
    {
      "userId": "98333",
      "username": "esther",
      "matchingScore": 63,
      "sharedNiches": ["Tech Reviews", "Gaming"]
    },
    {
      "userId": "45678",
      "username": "john",
      "matchingScore": 58,
      "sharedNiches": ["Gaming"]
    },
    {
      "userId": "78901",
      "username": "sarah",
      "matchingScore": 52,
      "sharedNiches": ["Music", "Tech Reviews"]
    }
  ]
}
```

**Important Requirements:**
- ✅ Only return users with `matchingScore > 50%`
- ✅ `matchingScore` (number, 0-100): Compatibility score
- ✅ `sharedNiches` (array of strings): Niches that both users have selected
- ✅ Suggestions should be sorted by `matchingScore` (highest first)
- ✅ Limit to reasonable number (e.g., top 50 suggestions)
- ✅ Should exclude the requesting user from results

**Matching Algorithm:**
- Calculate compatibility based on:
  - Niche overlap (shared niches)
  - Profile completeness similarity
  - Location proximity (if available)
  - User preferences alignment
- Only include users with score > 50%

**Error Responses:**

- `400 Bad Request` - Invalid userId
  ```json
  {
    "message": "User ID is missing or invalid"
  }
  ```

- `401 Unauthorized` - Missing or invalid token
  ```json
  {
    "message": "Authentication required"
  }
  ```

- `404 Not Found` - User not found
  ```json
  {
    "message": "User not found"
  }
  ```

- `500 Internal Server Error` - Server error
  ```json
  {
    "message": "Failed to fetch suggestions from server"
  }
  ```

**Testing:**
```bash
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/suggestions/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:** Should return 200 OK with suggestions array

**Current Result:** ❌ 404 Not Found - `{ "message": "Route not found" }`

**Frontend Handling:**
- ✅ Frontend uses mock/fallback data when endpoint returns 404
- ✅ No error shown to user
- ✅ Console shows warning: "Endpoint not found - Backend not implemented yet"
- ✅ Matching page still loads (shows loading state or fallback)
- ✅ Once endpoint is implemented, suggestions will display automatically

---

## 📊 Data Storage Requirements

### User Niches Storage

**Database Schema:**
- Store user niches separately from profile data
- Field: `niches` (array of strings)
- Format: Capitalized strings (e.g., "Gaming", "Tech Reviews")
- Location: User document/table
- Index: Should be indexed for fast matching queries

**Example:**
```json
{
  "userId": "12345",
  "niches": ["Gaming", "Tech Reviews", "Music"],
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

### Rizz Score Calculation

**Storage:**
- Can be calculated on-the-fly OR cached
- If cached, should update when:
  - User updates niches
  - User updates profile
  - Other users update (affects matching scores)

**Performance:**
- Consider caching for frequently accessed scores
- Recalculate periodically or on-demand

---

## 🔐 Authentication Requirements

### Token Validation

All authenticated endpoints must:
1. ✅ Validate Bearer token in `Authorization` header
2. ✅ Extract user ID from token
3. ✅ Verify user exists and is active
4. ✅ Return 401 if token is invalid/expired

### User Authorization

For endpoints that modify user data:
- ✅ Verify `userId` in request matches authenticated user
- ✅ Return 403 if user tries to modify another user's data

---

## ⚠️ Error Handling Standards

### Standard Error Response Format

All error responses should follow this format:
```json
{
  "message": "Human-readable error message"
}
```

### HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid request parameters/body
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Message Guidelines

- ✅ Clear and user-friendly
- ✅ Specific to the error
- ✅ No sensitive information
- ✅ Consistent format across all endpoints

---

## 🧪 Testing Requirements

### Endpoint Testing Checklist

For each endpoint, verify:

1. ✅ **Success Cases:**
   - Valid request returns 200 OK
   - Response format matches specification
   - Data is correct and complete

2. ✅ **Error Cases:**
   - Invalid authentication returns 401
   - Invalid parameters return 400
   - Missing resources return 404
   - Server errors return 500

3. ✅ **Edge Cases:**
   - Empty arrays
   - Maximum values
   - Special characters
   - Very long strings

4. ✅ **Performance:**
   - Response time < 500ms (for simple endpoints)
   - Response time < 2s (for complex calculations)
   - Handles concurrent requests

### Test Data

**Test User IDs:**
- Use existing test users or create test users
- Ensure test users have profiles and niches

**Test Niches:**
- Use valid niches from the niches list
- Test with various combinations
- Test with maximum number of niches

---

## 📝 Implementation Notes

### Important Considerations

1. **Niche Format:**
   - ✅ Always use **capitalized** format (e.g., "Gaming", not "gaming")
   - ✅ Frontend expects capitalized niches
   - ✅ Store in database as capitalized

2. **Backward Compatibility:**
   - ✅ Existing `/api/v1/profiles/me` endpoint should remain **unchanged**
   - ✅ New matchmaker endpoints are **separate system**
   - ✅ Can coexist without conflicts

3. **Performance:**
   - ✅ Consider caching for `/matchmaker/niches` (doesn't change often)
   - ✅ Optimize matching algorithm for large user base
   - ✅ Use database indexes for niche matching queries

4. **Scalability:**
   - ✅ Matching algorithm should handle 1000+ users
   - ✅ Consider pagination for suggestions if needed
   - ✅ Optimize database queries

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All 4 endpoints implemented and tested
- [ ] Authentication working correctly
- [ ] Error handling implemented
- [ ] Response formats match specification
- [ ] Performance tested (response times acceptable)
- [ ] Database indexes created
- [ ] Caching implemented (if applicable)
- [ ] Logging and monitoring set up
- [ ] API documentation updated
- [ ] Frontend team notified

---

## 📞 Frontend Integration Details

### Current Frontend Status

- ✅ Frontend code is **100% complete**
- ✅ All API calls are implemented
- ✅ Error handling is in place
- ✅ Fallback mechanism active (using hardcoded data)
- ✅ **404 errors handled gracefully** - No user-facing errors shown

### Frontend Error Handling

**Important:** The frontend is designed to handle missing endpoints gracefully:

1. **`GET /matchmaker/niches` (404):**
   - ✅ Frontend uses fallback hardcoded list (100+ niches)
   - ✅ No error shown to user
   - ✅ App continues to work normally
   - ✅ Console shows warning (not error)

2. **`POST /matchmaker/niches/update` (404):**
   - ✅ Profile update still succeeds
   - ✅ No error shown to user
   - ✅ Console shows warning (not error)
   - ✅ Niches will save once endpoint is implemented

3. **User Experience:**
   - ✅ Users can select niches (from fallback list)
   - ✅ Profile saves successfully
   - ✅ No error messages displayed
   - ✅ Seamless experience

**What This Means:**
- Frontend is **production-ready** from user perspective
- Backend can implement endpoints without breaking frontend
- No urgent user-facing issues
- Endpoints can be implemented incrementally

### Frontend Expectations

The frontend expects:
1. ✅ Endpoints at exact paths specified
2. ✅ Response formats exactly as documented
3. ✅ Error responses in specified format
4. ✅ Niches in capitalized format
5. ✅ Fast response times (< 2s)

### Frontend Files Using These Endpoints

1. `src/lib/api/niche.api.ts` - Niche fetching and updating
2. `src/lib/api/rizz.api.ts` - Rizz score fetching
3. `src/lib/api/suggestions.api.ts` - Match suggestions
4. `src/hooks/features/useNiches.ts` - Niches hook
5. `src/hooks/features/useRizzScore.ts` - Rizz score hook
6. `src/app/profile/complete-profile/page.jsx` - Profile completion
7. `src/components/profile/ProfileEdit/Card.tsx` - Profile editing
8. `src/app/matching/page.tsx` - Matching page

---

## 🐛 Known Issues

### Current Problems

1. ❌ **`GET /matchmaker/niches`** - Returns 404
   - **Impact:** Frontend using fallback hardcoded list
   - **User Impact:** ✅ None - App works with fallback
   - **Priority:** 🔴 CRITICAL
   - **Status:** Not implemented
   - **Frontend Handling:** ✅ Graceful - No errors shown

2. ❌ **`POST /matchmaker/niches/update`** - Returns 404
   - **Impact:** Niches cannot be saved to backend
   - **User Impact:** ✅ Minimal - Profile saves, niches will save once endpoint ready
   - **Priority:** 🔴 CRITICAL
   - **Status:** Not implemented (confirmed via testing)
   - **Frontend Handling:** ✅ Graceful - No errors shown, profile update succeeds

3. ❌ **`GET /matchmaker/rizz-score/:userId`** - Returns 404
   - **Impact:** Rizz scores not displayed (frontend uses fallback)
   - **User Impact:** ✅ Minimal - Frontend handles gracefully
   - **Priority:** 🟡 HIGH
   - **Status:** Not implemented (confirmed via testing)
   - **Frontend Handling:** ✅ Graceful - No errors shown, uses fallback data

4. ❌ **`GET /matchmaker/suggestions/:userId`** - Returns 404
   - **Impact:** Match suggestions not working (frontend uses fallback)
   - **User Impact:** ✅ Minimal - Frontend handles gracefully
   - **Priority:** 🟡 HIGH
   - **Status:** Not implemented (confirmed via testing)
   - **Frontend Handling:** ✅ Graceful - No errors shown, uses fallback data

---

## 📅 Timeline & Priority

### Phase 1: Critical (Week 1) 🔴
- [ ] Implement `GET /matchmaker/niches`
- [ ] Implement `POST /matchmaker/niches/update`
- [ ] Test both endpoints
- [ ] Deploy to staging

### Phase 2: High Priority (Week 2) 🟡
- [ ] Implement `GET /matchmaker/rizz-score/:userId`
- [ ] Implement `GET /matchmaker/suggestions/:userId`
- [ ] Test both endpoints
- [ ] Deploy to staging

### Phase 3: Testing & Optimization (Week 3) 🟢
- [ ] Performance testing
- [ ] Load testing
- [ ] Bug fixes
- [ ] Production deployment

---

## 📚 Additional Resources

### Related Documentation

- `docs/UPDATED-API-DOCUMENTATION.md` - Full API documentation
- `docs/API-ENDPOINTS-SUMMARY.md` - Endpoint summary
- `docs/BACKEND-API-INTEGRATION-PLAN.md` - Integration plan
- `docs/FALLBACK-NICHES-SOLUTION.md` - Current fallback solution

### Frontend Test Scripts

- `test-niche-endpoint.js` - Test niche endpoints
- `test-niche-validation.js` - Test niche validation

---

## ❓ Questions & Support

### For Backend Team

If you have questions about:
- **Endpoint specifications:** See detailed specs above
- **Frontend expectations:** See "Frontend Integration Details" section
- **Testing:** See "Testing Requirements" section
- **Data formats:** See individual endpoint specifications

### Contact

- **Frontend Team:** Ready to test once endpoints are implemented
- **Documentation:** This file contains all requirements
- **Test Scripts:** Available in project root

---

## ✅ Success Criteria

Endpoints are considered complete when:

1. ✅ All 4 endpoints return 200 OK for valid requests
2. ✅ Response formats match specifications exactly
3. ✅ Error handling works correctly
4. ✅ Authentication works correctly
5. ✅ Frontend can successfully call all endpoints
6. ✅ Performance is acceptable (< 2s response time)
7. ✅ Tested with real user data
8. ✅ Deployed to staging and verified

---

**Last Updated:** January 2025  
**Document Version:** 1.0  
**Status:** ⚠️ URGENT - Backend Implementation Required

