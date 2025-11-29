# API Endpoints Summary - Matchmaker System

**Base URL**: `/api/v1`  
**Last Updated**: January 2025

---

## 📋 All Endpoints

### 1. **GET /matchmaker/niches**
- **Purpose**: Get 100+ AI-generated niches
- **Method**: GET
- **Auth**: Not required
- **Response**: `{ niches: string[] }`
- **Notes**: Niches are capitalized

### 2. **POST /matchmaker/niches/update**
- **Purpose**: Update user's selected niches
- **Method**: POST
- **Auth**: Required
- **Body**: `{ userId: string, niches: string[] }`
- **Response**: `{ message: string, niches: string[] }`
- **Notes**: Separate from `/api/v1/profiles/me`

### 3. **GET /matchmaker/rizz-score/:userId**
- **Purpose**: Get user's Rizz scores and suggestions
- **Method**: GET
- **Auth**: Required
- **Response**: 
  ```json
  {
    "userId": string,
    "username": string,
    "displayName": string,
    "rizzScore": {
      "profileScore": number,
      "matchingScore": number
    },
    "profileUrl": string,
    "suggestions": Array<{
      "userId": string,
      "username": string,
      "displayName": string,
      "matchingScore": number,
      "niche": string[],
      "profileUrl": string
    }>
  }
  ```

### 4. **GET /matchmaker/suggestions/:userId**
- **Purpose**: Get matchmaker suggestions (>50% match)
- **Method**: GET
- **Auth**: Required
- **Response**:
  ```json
  {
    "userId": string,
    "suggestions": Array<{
      "userId": string,
      "username": string,
      "matchingScore": number,
      "sharedNiches": string[]
    }>
  }
  ```

---

## 🔄 Key Differences from Previous Docs

| Previous | Updated | Change |
|----------|---------|--------|
| `/niches` | `/matchmaker/niches` | Added `/matchmaker/` prefix |
| `/rizz/profile` | `/matchmaker/rizz-score/:userId` | Combined into single endpoint |
| `/rizz/matching` | Included in `/rizz-score/:userId` | No separate endpoint |
| `/suggestions/:userId` | `/matchmaker/suggestions/:userId` | Added `/matchmaker/` prefix |
| Lowercase niches | Capitalized niches | Format change |
| N/A | `/matchmaker/niches/update` | New endpoint |

---

## ⚠️ Important Notes

1. **Profile Endpoints Unchanged**: `/api/v1/profiles/me` remains untouched
2. **Niche Capitalization**: Backend returns capitalized niches (e.g., "Gaming", "Tech Reviews")
3. **Separate Systems**: Matchmaker endpoints are separate from profile endpoints
4. **Authentication**: Most endpoints require auth token
5. **userId Required**: Most endpoints need userId parameter

---

## 📝 Implementation Checklist

- [ ] Update all endpoint paths to use `/matchmaker/` prefix
- [ ] Handle capitalized niche format
- [ ] Use new `/matchmaker/niches/update` endpoint
- [ ] Update Rizz score to use single endpoint
- [ ] Update suggestions to use new endpoint
- [ ] Display sharedNiches in match cards
- [ ] Test all endpoints
- [ ] Verify profile endpoints still work


