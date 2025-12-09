# Backend API Integration Plan

Based on the new backend API documentation, here's what needs to be implemented in the frontend.

## 📋 New API Endpoints

### 1. **GET /niches** - Get Full Niche List ✅ CRITICAL
- **Purpose**: Fetch 100+ available niches from backend
- **Current State**: Frontend uses hardcoded `MOCK_NICHES` (17 items)
- **Action Required**: Replace hardcoded list with API call
- **Impact**: Enables 100+ niche selection feature

### 2. **POST /rizz/profile** - Calculate Profile Rizz Score
- **Purpose**: Calculate user's Rizz score based on selected niches
- **Current State**: Rizz score exists but may not use niche-based calculation
- **Action Required**: Integrate niche-based calculation
- **Impact**: More accurate Rizz scores

### 3. **POST /rizz/matching** - Calculate Matching Score
- **Purpose**: Calculate compatibility between two users
- **Current State**: Matching exists but may use different algorithm
- **Action Required**: Integrate new matching endpoint
- **Impact**: Better match suggestions

### 4. **GET /suggestions/:userId** - Get Match Suggestions
- **Purpose**: Get recommended creator matches
- **Current State**: Matching page exists with different endpoint
- **Action Required**: Update to use new endpoint
- **Impact**: Better match recommendations

### 5. **GET /profile/:username** - Get Profile by Username
- **Purpose**: Fetch public profile by username
- **Current State**: Profile pages exist
- **Action Required**: Add username-based profile fetching
- **Impact**: Dynamic profile routing support

### 6. **POST /social/connect** - Connect Social Media
- **Purpose**: Link social media accounts
- **Current State**: Social links are saved in profile
- **Action Required**: Use dedicated endpoint for social connections
- **Impact**: Better social media integration

---

## 🎯 Implementation Priority

### **Phase 1: Critical (100+ Niches Support)** 🔴
1. **GET /niches** - Fetch niche list from backend
   - Replace `MOCK_NICHES` with API call
   - Update complete-profile page
   - Update profile edit page
   - Remove hardcoded niche limit (backend now supports 100+)

### **Phase 2: High Priority** 🟡
2. **POST /rizz/profile** - Profile Rizz Score calculation
3. **GET /suggestions/:userId** - Match suggestions
4. **GET /profile/:username** - Username-based profiles

### **Phase 3: Medium Priority** 🟢
5. **POST /rizz/matching** - Matching score calculation
6. **POST /social/connect** - Social media connection

---

## 📝 Detailed Implementation Tasks

### Task 1: Create Niche API Service

**File**: `src/lib/api/niche.api.ts` (NEW)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface NichesResponse {
  niches: string[];
}

export const nicheApi = {
  /**
   * Fetch all available niches from backend (100+ niches)
   */
  getNiches: async (): Promise<NichesResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/niches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch niches');
    }

    return response.json();
  },
};
```

### Task 2: Create Rizz Score API Service

**File**: `src/lib/api/rizz.api.ts` (NEW or UPDATE)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface ProfileRizzScoreRequest {
  niches: string[];
}

export interface ProfileRizzScoreResponse {
  profileRizzScore: number;
}

export interface MatchingRizzScoreRequest {
  userA: { niches: string[] };
  userB: { niches: string[] };
}

export interface MatchingRizzScoreResponse {
  matchingRizzScore: number;
}

export const rizzApi = {
  /**
   * Calculate profile Rizz score based on niches
   */
  calculateProfileRizzScore: async (
    niches: string[]
  ): Promise<ProfileRizzScoreResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/rizz/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ niches }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate profile Rizz score');
    }

    return response.json();
  },

  /**
   * Calculate matching Rizz score between two users
   */
  calculateMatchingRizzScore: async (
    userANiches: string[],
    userBNiches: string[]
  ): Promise<MatchingRizzScoreResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/rizz/matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userA: { niches: userANiches },
        userB: { niches: userBNiches },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to calculate matching Rizz score');
    }

    return response.json();
  },
};
```

### Task 3: Create Suggestions API Service

**File**: `src/lib/api/suggestions.api.ts` (NEW or UPDATE)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface MatchSuggestion {
  id: string;
  username: string;
  score: number;
}

export interface SuggestionsResponse {
  suggestions: MatchSuggestion[];
}

export const suggestionsApi = {
  /**
   * Get match suggestions for a user
   */
  getSuggestions: async (userId: string): Promise<SuggestionsResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/suggestions/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    return response.json();
  },
};
```

### Task 4: Create Profile by Username API

**File**: `src/lib/api/profile.api.ts` (UPDATE)

```typescript
// Add to existing profileApi
export interface ProfileByUsernameResponse {
  id: string;
  username: string;
  niches: string[];
  profileRizzScore: number;
  // ... other profile fields
}

export const profileApi = {
  // ... existing methods

  /**
   * Get profile by username (for dynamic routing)
   */
  getProfileByUsername: async (
    username: string
  ): Promise<ProfileByUsernameResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/profile/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Profile not found');
      }
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },
};
```

### Task 5: Create Social Connect API

**File**: `src/lib/api/social.api.ts` (NEW or UPDATE)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface SocialConnectRequest {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';
  url: string;
}

export interface SocialConnectResponse {
  success: boolean;
  message: string;
}

export const socialApi = {
  /**
   * Connect a social media account
   */
  connectSocial: async (
    platform: string,
    url: string
  ): Promise<SocialConnectResponse> => {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${BASE_URL}/api/v1/social/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ platform, url }),
    });

    if (!response.ok) {
      throw new Error('Failed to connect social media account');
    }

    return response.json();
  },
};
```

---

## 🔄 Component Updates Required

### 1. **Complete Profile Page** (`src/app/profile/complete-profile/page.jsx`)
- ✅ Remove `MOCK_NICHES` hardcoded array
- ✅ Fetch niches from `/niches` API on component mount
- ✅ Remove MAX_NICHES limit (or set to 100+)
- ✅ Calculate Rizz score after niche selection using `/rizz/profile`

### 2. **Profile Edit Page** (`src/components/profile/ProfileEdit/Card.tsx`)
- ✅ Fetch niches from `/niches` API
- ✅ Remove hardcoded niche limit
- ✅ Update Rizz score when niches change

### 3. **Matching Page** (`src/app/matching/page.tsx`)
- ✅ Use `/suggestions/:userId` endpoint
- ✅ Display matching scores from API
- ✅ Use `/rizz/matching` for detailed compatibility

### 4. **Profile Pages**
- ✅ Add username-based profile fetching
- ✅ Support dynamic routing `/profile/:username`

### 5. **Social Media Components**
- ✅ Use `/social/connect` endpoint for linking accounts

---

## 🚀 Implementation Steps

### Step 1: Create API Services (Priority 1)
1. Create `src/lib/api/niche.api.ts`
2. Create/update `src/lib/api/rizz.api.ts`
3. Create/update `src/lib/api/suggestions.api.ts`
4. Update `src/lib/api/profile.api.ts`
5. Create/update `src/lib/api/social.api.ts`

### Step 2: Update Niche Selection (Priority 1)
1. Update complete-profile page to fetch niches
2. Update profile edit page to fetch niches
3. Remove MAX_NICHES limit (or increase to 100+)
4. Add loading states for niche fetching
5. Add error handling

### Step 3: Integrate Rizz Score (Priority 2)
1. Calculate profile Rizz score after niche selection
2. Display Rizz score in profile
3. Update matching to use new Rizz score calculation

### Step 4: Update Matching (Priority 2)
1. Use `/suggestions/:userId` endpoint
2. Display match scores
3. Integrate matching Rizz score calculation

### Step 5: Add Username Profiles (Priority 2)
1. Create dynamic route `/profile/[username]`
2. Fetch profile by username
3. Update navigation to use usernames

### Step 6: Social Media Integration (Priority 3)
1. Use `/social/connect` endpoint
2. Update social link components

---

## ⚠️ Important Notes

1. **Niche Limit**: Backend now supports 100+ niches, so frontend should allow unlimited or very high limit
2. **API Base URL**: All endpoints use `/api/v1/` prefix
3. **Authentication**: Some endpoints require auth token
4. **Error Handling**: All API calls need proper error handling
5. **Loading States**: Show loading indicators while fetching
6. **Caching**: Consider caching niche list (doesn't change often)

---

## 📊 Testing Checklist

- [ ] Fetch niches from API (100+ items)
- [ ] Select multiple niches (test with 20-30+)
- [ ] Calculate profile Rizz score
- [ ] Get match suggestions
- [ ] Calculate matching Rizz score
- [ ] Fetch profile by username
- [ ] Connect social media account
- [ ] Error handling for all endpoints
- [ ] Loading states work correctly
- [ ] Mobile responsiveness maintained

---

## 🎯 Success Criteria

1. ✅ Niche list loads from backend (100+ niches available)
2. ✅ Users can select unlimited niches (or very high limit)
3. ✅ Rizz score calculates based on niches
4. ✅ Match suggestions work with new endpoint
5. ✅ Profile pages support username routing
6. ✅ Social media connection works

---

**Next Steps**: Start with Phase 1 (Niche API integration) as it's critical for the 100+ niches feature.


