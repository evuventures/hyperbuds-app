# Updated Backend API Documentation

**Date**: January 2025  
**Source**: Backend Team  
**Base URL**: `/api/v1`

---

## 📋 New Endpoints (Matchmaker System)

### 1. **GET /matchmaker/niches** - Get AI-Generated Niches

**Purpose**: Returns complete list of 100+ AI-generated niches

**Endpoint**: `GET /api/v1/matchmaker/niches`

**Response**:
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

**Notes**:
- Returns 100+ niches
- Niches are **capitalized** (not lowercase)
- This is a separate endpoint from profile endpoints

---

### 2. **POST /matchmaker/niches/update** - Update User Niches

**Purpose**: Allows user to select or update their niches

**Endpoint**: `POST /api/v1/matchmaker/niches/update`

**Important**: Does NOT affect existing `/api/v1/profiles/me` endpoint

**Request Body**:
```json
{
  "userId": "12345",
  "niches": ["Gaming", "Tech Reviews", "Music"]
}
```

**Response**:
```json
{
  "message": "Niches updated successfully",
  "niches": ["Gaming", "Tech Reviews", "Music"]
}
```

**Notes**:
- Requires authentication
- Niches are **capitalized** (not lowercase)
- Separate from profile update endpoint

---

### 3. **GET /matchmaker/rizz-score/:userId** - Get User Rizz Score

**Purpose**: Returns profile Rizz score, matching score, and suggestions

**Endpoint**: `GET /api/v1/matchmaker/rizz-score/:userId`

**Response**:
```json
{
  "userId": "12345",
  "username": "ayomide",
  "displayName": "Ayomide",
  "rizzScore": {
    "profileScore": 78,
    "matchingScore": 0
  },
  "profileUrl": "https://app.com/@ayomide",
  "suggestions": [
    {
      "userId": "98333",
      "username": "esther",
      "displayName": "Esther",
      "matchingScore": 63,
      "niche": ["Tech Reviews", "Music"],
      "profileUrl": "https://app.com/@esther"
    }
  ]
}
```

**Notes**:
- Returns both profileScore and matchingScore
- Includes suggestions with > 50% similarity
- Suggestions include matchingScore and shared niches

---

### 4. **GET /matchmaker/suggestions/:userId** - Get Matchmaker Suggestions

**Purpose**: Returns all users with matching score > 50%

**Endpoint**: `GET /api/v1/matchmaker/suggestions/:userId`

**Response**:
```json
{
  "userId": "12345",
  "suggestions": [
    {
      "userId": "98333",
      "username": "esther",
      "matchingScore": 63,
      "sharedNiches": ["Tech Reviews", "Gaming"]
    }
  ]
}
```

**Notes**:
- Only returns users with matchingScore > 50%
- Includes sharedNiches array
- Requires authentication

---

## 🔄 Key Changes from Previous Documentation

1. **Endpoint Paths Changed**:
   - `/niches` → `/matchmaker/niches`
   - `/rizz/profile` → `/matchmaker/rizz-score/:userId` (combined)
   - `/rizz/matching` → Included in `/matchmaker/rizz-score/:userId`
   - `/suggestions/:userId` → `/matchmaker/suggestions/:userId`

2. **Niche Format**:
   - Niches are **capitalized** (e.g., "Gaming", "Tech Reviews")
   - Not lowercase like before

3. **New Endpoint**:
   - `POST /matchmaker/niches/update` - Dedicated niche update endpoint

4. **Response Structure**:
   - Rizz score endpoint returns both profileScore and matchingScore together
   - Suggestions include sharedNiches array
   - Profile URL included in responses

5. **Profile Endpoints**:
   - `/api/v1/profiles/me` remains **untouched**
   - New matchmaker endpoints are separate

---

## ⚠️ Important Notes

1. **Niche Capitalization**: Backend returns capitalized niches, frontend should handle this
2. **Separate Endpoints**: Matchmaker endpoints are separate from profile endpoints
3. **Authentication**: Most endpoints require authentication token
4. **userId Required**: Most endpoints require userId parameter
5. **No Profile Changes**: Profile endpoints remain unchanged

---

## 📝 Implementation Impact

### Files to Update:
1. `src/lib/api/niche.api.ts` - Update endpoint path
2. `src/lib/api/rizz.api.ts` - Update to single endpoint
3. `src/lib/api/suggestions.api.ts` - Update endpoint path
4. `src/app/profile/complete-profile/page.jsx` - Use new update endpoint
5. `src/components/profile/ProfileEdit/Card.tsx` - Use new update endpoint

### Key Changes:
- All endpoints now use `/matchmaker/` prefix
- Niches are capitalized (may need normalization)
- Rizz score is a single endpoint returning both scores
- New dedicated niche update endpoint


