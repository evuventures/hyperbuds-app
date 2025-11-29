# 🚀 Immediate Action Plan - Backend API Integration (UPDATED)

**Date**: January 2025  
**Status**: Ready for Implementation  
**Priority**: Critical - Enables 100+ Niches & New Features  
**Last Updated**: Based on latest backend API documentation

---

## 📋 Overview

This plan implements all new backend API endpoints from matchmaker system:
1. ✅ GET /matchmaker/niches - Fetch 100+ AI-generated niches
2. ✅ POST /matchmaker/niches/update - Update user selected niches
3. ✅ GET /matchmaker/rizz-score/:userId - Get profile & matching Rizz scores + suggestions
4. ✅ GET /matchmaker/suggestions/:userId - Get matchmaker suggestions (>50% match)
5. ✅ GET /profile/:username - Get profile by username (if still needed)
6. ✅ POST /social/connect - Connect social media (if still needed)

**Important**: Profile endpoints (`/api/v1/profiles/me`) remain **untouched** - new matchmaker endpoints are separate.

---

## 🎯 Implementation Phases

### **Phase 1: API Services (Foundation)** - 2-3 hours
### **Phase 2: Niche Integration (Critical)** - 2-3 hours
### **Phase 3: Rizz Score Integration** - 1-2 hours
### **Phase 4: Matching & Suggestions** - 2-3 hours
### **Phase 5: Profile & Social** - 1-2 hours
### **Phase 6: Testing & Polish** - 1-2 hours

**Total Estimated Time**: 9-15 hours

---

## 📝 PHASE 1: Create API Services (Foundation)

### Task 1.1: Create Niche API Service ⭐ CRITICAL

**File**: `src/lib/api/niche.api.ts` (NEW)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface NichesResponse {
  niches: string[];
}

export interface UpdateNichesRequest {
  userId: string;
  niches: string[];
}

export interface UpdateNichesResponse {
  message: string;
  niches: string[];
}

export const nicheApi = {
  /**
   * Fetch all available niches from backend (100+ AI-generated niches)
   * GET /api/v1/matchmaker/niches
   * 
   * Note: Niches are returned capitalized (e.g., "Gaming", "Tech Reviews")
   */
  getNiches: async (): Promise<NichesResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/niches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch niches: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching niches:', error);
      throw error;
    }
  },

  /**
   * Update user's selected niches
   * POST /api/v1/matchmaker/niches/update
   * 
   * Note: This is separate from /api/v1/profiles/me endpoint
   * Niches should be capitalized (e.g., "Gaming", "Tech Reviews")
   */
  updateNiches: async (
    userId: string,
    niches: string[]
  ): Promise<UpdateNichesResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/niches/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          userId,
          niches,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update niches: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Error updating niches:', error);
      throw error;
    }
  },
};
```

**Checklist**:
- [ ] Create file `src/lib/api/niche.api.ts`
- [ ] Add BASE_URL import
- [ ] Implement getNiches function
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Export nicheApi

---

### Task 1.2: Create Rizz Score API Service

**File**: `src/lib/api/rizz.api.ts` (NEW)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface RizzScoreResponse {
  userId: string;
  username: string;
  displayName: string;
  rizzScore: {
    profileScore: number;
    matchingScore: number;
  };
  profileUrl: string;
  suggestions: Array<{
    userId: string;
    username: string;
    displayName: string;
    matchingScore: number;
    niche: string[];
    profileUrl: string;
  }>;
}

export const rizzApi = {
  /**
   * Get user's Rizz score (profile score, matching score, and suggestions)
   * GET /api/v1/matchmaker/rizz-score/:userId
   * 
   * Returns both profileScore and matchingScore together
   * Includes suggestions with > 50% similarity
   */
  getRizzScore: async (userId: string): Promise<RizzScoreResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/rizz-score/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch Rizz score: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching Rizz score:', error);
      throw error;
    }
  },
};
```

**Checklist**:
- [ ] Create file `src/lib/api/rizz.api.ts`
- [ ] Add BASE_URL import
- [ ] Implement calculateProfileRizzScore
- [ ] Implement calculateMatchingRizzScore
- [ ] Add TypeScript interfaces
- [ ] Add error handling
- [ ] Export rizzApi

---

### Task 1.3: Create/Update Suggestions API Service

**File**: `src/lib/api/suggestions.api.ts` (NEW or UPDATE existing)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export interface MatchSuggestion {
  userId: string;
  username: string;
  matchingScore: number;
  sharedNiches: string[];
}

export interface SuggestionsResponse {
  userId: string;
  suggestions: MatchSuggestion[];
}

export const suggestionsApi = {
  /**
   * Get matchmaker suggestions for a user (users with > 50% matching score)
   * GET /api/v1/matchmaker/suggestions/:userId
   * 
   * Returns users with matchingScore > 50%
   * Includes sharedNiches array
   */
  getSuggestions: async (userId: string): Promise<SuggestionsResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/suggestions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('User ID is missing or invalid');
        }
        if (response.status === 500) {
          throw new Error('Failed to fetch suggestions from server');
        }
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },
};
```

**Checklist**:
- [ ] Create file `src/lib/api/suggestions.api.ts`
- [ ] Add BASE_URL import
- [ ] Implement getSuggestions function
- [ ] Add authentication header
- [ ] Add error handling for 400, 500
- [ ] Add TypeScript types
- [ ] Export suggestionsApi

---

### Task 1.4: Update Profile API Service

**File**: `src/lib/api/profile.api.ts` (UPDATE existing)

**Add this function to existing profileApi**:

```typescript
export interface ProfileByUsernameResponse {
  id: string;
  username: string;
  niches: string[];
  profileRizzScore: number;
  // Add other profile fields as needed
  displayName?: string;
  bio?: string;
  avatar?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  socialLinks?: Record<string, string>;
}

// Add to existing profileApi object:
getProfileByUsername: async (
  username: string
): Promise<ProfileByUsernameResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/profile/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Username is missing or invalid');
      }
      if (response.status === 404) {
        throw new Error('Profile not found');
      }
      if (response.status === 500) {
        throw new Error('Server error while fetching profile');
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    throw error;
  }
},
```

**Checklist**:
- [ ] Open `src/lib/api/profile.api.ts`
- [ ] Add ProfileByUsernameResponse interface
- [ ] Add getProfileByUsername function to profileApi
- [ ] Add error handling (400, 404, 500)
- [ ] Test function signature

---

### Task 1.5: Create/Update Social Connect API Service

**File**: `src/lib/api/social.api.ts` (NEW or UPDATE existing)

```typescript
import { BASE_URL } from '@/config/baseUrl';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';

export interface SocialConnectRequest {
  platform: SocialPlatform;
  url: string;
}

export interface SocialConnectResponse {
  success: boolean;
  message: string;
}

export const socialApi = {
  /**
   * Connect a social media account to user profile
   * POST /api/v1/social/connect
   * Requires authentication
   */
  connectSocial: async (
    platform: SocialPlatform,
    url: string
  ): Promise<SocialConnectResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/v1/social/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ platform, url }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 'Missing platform or URL'
          );
        }
        if (response.status === 500) {
          throw new Error('Could not connect social media account');
        }
        throw new Error(`Failed to connect social account: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error connecting social media:', error);
      throw error;
    }
  },
};
```

**Checklist**:
- [ ] Create file `src/lib/api/social.api.ts` (or update existing)
- [ ] Add BASE_URL import
- [ ] Implement connectSocial function
- [ ] Add authentication check
- [ ] Add error handling (400, 500)
- [ ] Add TypeScript types
- [ ] Export socialApi

---

## 📝 PHASE 2: Niche Integration (Critical - 100+ Niches)

### Task 2.1: Create Niche Hook

**File**: `src/hooks/features/useNiches.ts` (NEW)

```typescript
import { useState, useEffect } from 'react';
import { nicheApi } from '@/lib/api/niche.api';

export const useNiches = () => {
  const [niches, setNiches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await nicheApi.getNiches();
        setNiches(response.niches);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch niches');
        setError(error);
        console.error('Error fetching niches:', error);
        // Fallback to empty array or default niches
        setNiches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNiches();
  }, []);

  return { niches, isLoading, error };
};
```

**Checklist**:
- [ ] Create file `src/hooks/features/useNiches.ts`
- [ ] Import nicheApi
- [ ] Implement useNiches hook
- [ ] Add loading state
- [ ] Add error state
- [ ] Add useEffect to fetch on mount
- [ ] Export hook

---

### Task 2.2: Update Complete Profile Page

**File**: `src/app/profile/complete-profile/page.jsx` (UPDATE)

**Changes needed**:

1. **Remove MOCK_NICHES**:
   ```javascript
   // DELETE this:
   const MOCK_NICHES = [
     "beauty", "gaming", "music", ...
   ];
   ```

2. **Import useNiches hook and nicheApi**:
   ```javascript
   import { useNiches } from '@/hooks/features/useNiches';
   import { nicheApi } from '@/lib/api/niche.api';
   ```

3. **Use hook in component**:
   ```javascript
   const { niches: availableNiches, isLoading: isLoadingNiches, error: nichesError } = useNiches();
   ```

4. **Update filteredNiches** (niches are capitalized, search should be case-insensitive):
   ```javascript
   const filteredNiches = availableNiches.filter(n =>
     n.toLowerCase().includes(search.toLowerCase())
   );
   ```

5. **Remove MAX_NICHES limit** (or set to 100+):
   ```javascript
   // Change from:
   const MAX_NICHES = 10;
   // To:
   const MAX_NICHES = 100; // Or remove limit entirely
   ```

6. **Update niche submission to use new endpoint**:
   ```javascript
   // In handleSubmit, after normalizing niches:
   const normalizedNiches = selectedNiches.length > 0 
     ? selectedNiches.map(niche => niche.trim()) // Keep capitalized
     : undefined;

   // Update niches using matchmaker endpoint (separate from profile update)
   if (normalizedNiches && normalizedNiches.length > 0) {
     const userId = localStorage.getItem('userId') || userProfile?.userId;
     if (userId) {
       try {
         await nicheApi.updateNiches(userId, normalizedNiches);
       } catch (error) {
         console.error('Failed to update niches:', error);
         // Don't block profile creation if niche update fails
       }
     }
   }
   ```

7. **Add loading state in UI**:
   ```javascript
   {isLoadingNiches && (
     <div className="text-center py-4">
       <FaSpinner className="animate-spin mx-auto" />
       <p className="text-sm text-gray-500 mt-2">Loading niches...</p>
     </div>
   )}
   ```

8. **Add error handling**:
   ```javascript
   {nichesError && (
     <div className="text-red-500 text-sm mb-2">
       Failed to load niches. Please refresh the page.
     </div>
   )}
   ```

**Checklist**:
- [ ] Remove MOCK_NICHES constant
- [ ] Import useNiches hook
- [ ] Add hook call in component
- [ ] Update filteredNiches to use availableNiches
- [ ] Update MAX_NICHES to 100+ or remove limit
- [ ] Add loading state UI
- [ ] Add error handling UI
- [ ] Test niche selection works

---

### Task 2.3: Update Profile Edit Page

**File**: `src/components/profile/ProfileEdit/Card.tsx` (UPDATE)

**Changes needed**:

1. **Import useNiches hook**:
   ```typescript
   import { useNiches } from '@/hooks/features/useNiches';
   ```

2. **Remove MOCK_NICHES**:
   ```typescript
   // DELETE this:
   const MOCK_NICHES = [
     "beauty", "gaming", "music", ...
   ];
   ```

3. **Use hook in component**:
   ```typescript
   const { niches: availableNiches, isLoading: isLoadingNiches } = useNiches();
   ```

4. **Update niche mapping**:
   ```typescript
   // Change from:
   {MOCK_NICHES.map((niche) => {
   // To:
   {availableNiches.map((niche) => {
   ```

5. **Update MAX_NICHES limit**:
   ```typescript
   // Change from:
   } else if (niches.length < 5) {
   // To:
   } else if (niches.length < 100) { // Or remove limit
   ```

6. **Update label**:
   ```typescript
   // Change from:
   Select Niches (max 5)
   // To:
   Select Niches (up to 100+)
   ```

7. **Update disabled condition**:
   ```typescript
   // Change from:
   disabled={!isSelected && niches.length >= 5}
   // To:
   disabled={!isSelected && niches.length >= 100} // Or remove
   ```

8. **Add loading state**:
   ```typescript
   {isLoadingNiches ? (
     <div className="text-center py-4">
       <FaSpinner className="animate-spin mx-auto" />
       <p>Loading niches...</p>
     </div>
   ) : (
     // ... existing niche buttons
   )}
   ```

**Checklist**:
- [ ] Remove MOCK_NICHES constant
- [ ] Import useNiches hook
- [ ] Add hook call in component
- [ ] Update niche mapping
- [ ] Update MAX_NICHES to 100+
- [ ] Update label text
- [ ] Update disabled condition
- [ ] Add loading state
- [ ] Test niche selection works

---

## 📝 PHASE 3: Rizz Score Integration

### Task 3.1: Create Rizz Score Hook

**File**: `src/hooks/features/useRizzScore.ts` (NEW)

```typescript
import { useState } from 'react';
import { rizzApi } from '@/lib/api/rizz.api';
import type { RizzScoreResponse } from '@/lib/api/rizz.api';

export const useRizzScore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rizzScoreData, setRizzScoreData] = useState<RizzScoreResponse | null>(null);

  /**
   * Get user's Rizz score (includes profileScore, matchingScore, and suggestions)
   * GET /api/v1/matchmaker/rizz-score/:userId
   */
  const getRizzScore = async (userId: string): Promise<RizzScoreResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await rizzApi.getRizzScore(userId);
      setRizzScoreData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch Rizz score');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRizzScore,
    rizzScoreData,
    isLoading,
    error,
  };
};
```

**Checklist**:
- [ ] Create file `src/hooks/features/useRizzScore.ts`
- [ ] Import rizzApi
- [ ] Implement calculateProfileRizzScore
- [ ] Implement calculateMatchingRizzScore
- [ ] Add loading and error states
- [ ] Export hook

---

### Task 3.2: Update Complete Profile to Fetch Rizz Score

**File**: `src/app/profile/complete-profile/page.jsx` (UPDATE)

**Add after profile creation**:

```javascript
import { useRizzScore } from '@/hooks/features/useRizzScore';

// In component:
const { getRizzScore, rizzScoreData, isLoading: isLoadingRizz } = useRizzScore();

// Add function to fetch Rizz score after profile creation:
useEffect(() => {
  const fetchRizzScore = async () => {
    const userId = localStorage.getItem('userId') || userProfile?.userId;
    if (userId && selectedNiches.length > 0) {
      try {
        const data = await getRizzScore(userId);
        // Data includes profileScore, matchingScore, and suggestions
        console.log('Rizz Score:', data.rizzScore);
        console.log('Suggestions:', data.suggestions);
      } catch (error) {
        console.error('Failed to fetch Rizz score:', error);
      }
    }
  };

  // Fetch after niches are updated
  if (selectedNiches.length > 0) {
    const timer = setTimeout(fetchRizzScore, 1000);
    return () => clearTimeout(timer);
  }
}, [selectedNiches, getRizzScore]);
```

**Checklist**:
- [ ] Import useRizzScore hook
- [ ] Add hook call in component
- [ ] Add useEffect to calculate score when niches change
- [ ] Add debouncing (optional but recommended)
- [ ] Display score in UI (optional)
- [ ] Handle errors gracefully

---

### Task 3.3: Update Profile Edit to Calculate Rizz Score

**File**: `src/components/profile/ProfileEdit/Card.tsx` (UPDATE)

**Similar to Task 3.2** - add Rizz score calculation when niches change.

**Checklist**:
- [ ] Import useRizzScore hook
- [ ] Add hook call
- [ ] Calculate score when niches change
- [ ] Display or save score

---

## 📝 PHASE 4: Matching & Suggestions Integration

### Task 4.1: Update Matching Page to Use New Suggestions Endpoint

**File**: `src/app/matching/page.tsx` (UPDATE)

**Changes needed**:

1. **Import suggestionsApi**:
   ```typescript
   import { suggestionsApi } from '@/lib/api/suggestions.api';
   ```

2. **Update refreshMatches function**:
   ```typescript
   const refreshMatches = async () => {
     setIsRefreshing(true);
     try {
       // Get current user ID (from profile or auth)
       const userId = userProfile?.userId || userProfile?._id || localStorage.getItem('userId');
       
       if (!userId) {
         throw new Error('User ID not found');
       }

       const response = await suggestionsApi.getSuggestions(userId);
       setMatches(response.suggestions.map(suggestion => ({
         id: suggestion.userId,
         userId: suggestion.userId,
         username: suggestion.username,
         compatibilityScore: suggestion.matchingScore,
         sharedNiches: suggestion.sharedNiches, // New field
         // Map other fields as needed
       })));
     } catch (error) {
       console.error('Failed to fetch suggestions:', error);
       setError('Failed to load match suggestions');
     } finally {
       setIsRefreshing(false);
     }
   };
   ```

**Checklist**:
- [ ] Import suggestionsApi
- [ ] Update refreshMatches to use new endpoint
- [ ] Get userId from user profile
- [ ] Map response to match format
- [ ] Handle errors
- [ ] Test suggestions load correctly

---

### Task 4.2: Display Matching Score in Match Cards

**File**: `src/components/matching/MatchCard.tsx` or similar (UPDATE)

**Matching score is already included in suggestions response**:

```typescript
// Matching score is already in the suggestion data from API
// No need to calculate separately - it's included in response

interface MatchCardProps {
  suggestion: {
    userId: string;
    username: string;
    matchingScore: number; // Already included
    sharedNiches: string[]; // Already included
  };
}

// Display matching score and shared niches:
<div>
  <p>Matching Score: {suggestion.matchingScore}%</p>
  {suggestion.sharedNiches.length > 0 && (
    <div>
      <p>Shared Niches:</p>
      <div className="flex flex-wrap gap-2">
        {suggestion.sharedNiches.map(niche => (
          <span key={niche} className="badge">{niche}</span>
        ))}
      </div>
    </div>
  )}
</div>
```

**Checklist**:
- [ ] Import useRizzScore hook
- [ ] Add matching score state
- [ ] Calculate score when component mounts
- [ ] Display score in match card
- [ ] Handle loading and errors

---

## 📝 PHASE 5: Profile & Social Integration

### Task 5.1: Create Dynamic Profile Route

**File**: `src/app/profile/[username]/page.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { profileApi } from '@/lib/api/profile.api';
import type { ProfileByUsernameResponse } from '@/lib/api/profile.api';

export default function ProfileByUsernamePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<ProfileByUsernameResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await profileApi.getProfileByUsername(username);
        setProfile(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div>
      {/* Render profile using existing profile components */}
      <h1>{profile.displayName || profile.username}</h1>
      <p>Rizz Score: {profile.profileRizzScore}</p>
      {/* Add more profile details */}
    </div>
  );
}
```

**Checklist**:
- [ ] Create file `src/app/profile/[username]/page.tsx`
- [ ] Import useParams from next/navigation
- [ ] Import profileApi
- [ ] Fetch profile by username
- [ ] Add loading state
- [ ] Add error handling
- [ ] Render profile data
- [ ] Test dynamic routing

---

### Task 5.2: Update Social Media Connection

**File**: `src/components/profile/ProfileEdit/Card.tsx` or social component (UPDATE)

**Update social link submission**:

```typescript
import { socialApi } from '@/lib/api/social.api';

// When saving social links:
const handleSocialConnect = async (platform: string, url: string) => {
  try {
    const response = await socialApi.connectSocial(
      platform as SocialPlatform,
      url
    );
    
    if (response.success) {
      // Show success message
      setMessage(response.message);
    }
  } catch (error) {
    console.error('Failed to connect social account:', error);
    setError(error instanceof Error ? error.message : 'Failed to connect');
  }
};
```

**Checklist**:
- [ ] Import socialApi
- [ ] Update social link save handler
- [ ] Use connectSocial endpoint
- [ ] Handle success/error responses
- [ ] Show user feedback
- [ ] Test social connection

---

## 📝 PHASE 6: Testing & Polish

### Task 6.1: Test All Endpoints

**Create test file**: `test-matchmaker-api-endpoints.js`

```javascript
// Test all new matchmaker endpoints
const BASE_URL = 'https://api-hyperbuds-backend.onrender.com';
const TOKEN = 'YOUR_TOKEN';
const USER_ID = 'YOUR_USER_ID';

// Test 1: GET /matchmaker/niches
async function testNiches() {
  const res = await fetch(`${BASE_URL}/api/v1/matchmaker/niches`);
  const data = await res.json();
  console.log('✅ Niches:', data.niches.length, 'niches found');
  console.log('   Sample:', data.niches.slice(0, 5));
}

// Test 2: POST /matchmaker/niches/update
async function testUpdateNiches() {
  const res = await fetch(`${BASE_URL}/api/v1/matchmaker/niches/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      userId: USER_ID,
      niches: ['Gaming', 'Tech Reviews', 'Music'],
    }),
  });
  const data = await res.json();
  console.log('✅ Update Niches:', data.message);
  console.log('   Updated niches:', data.niches);
}

// Test 3: GET /matchmaker/rizz-score/:userId
async function testRizzScore() {
  const res = await fetch(`${BASE_URL}/api/v1/matchmaker/rizz-score/${USER_ID}`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  const data = await res.json();
  console.log('✅ Rizz Score:');
  console.log('   Profile Score:', data.rizzScore.profileScore);
  console.log('   Matching Score:', data.rizzScore.matchingScore);
  console.log('   Suggestions:', data.suggestions.length);
}

// Test 4: GET /matchmaker/suggestions/:userId
async function testSuggestions() {
  const res = await fetch(`${BASE_URL}/api/v1/matchmaker/suggestions/${USER_ID}`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  const data = await res.json();
  console.log('✅ Suggestions:', data.suggestions.length, 'suggestions');
  if (data.suggestions.length > 0) {
    console.log('   First suggestion:', {
      username: data.suggestions[0].username,
      matchingScore: data.suggestions[0].matchingScore,
      sharedNiches: data.suggestions[0].sharedNiches,
    });
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Testing all matchmaker API endpoints...\n');
  try {
    await testNiches();
    await testUpdateNiches();
    await testRizzScore();
    await testSuggestions();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runAllTests();
```

**Checklist**:
- [ ] Create test file
- [ ] Test GET /niches
- [ ] Test POST /rizz/profile
- [ ] Test POST /rizz/matching
- [ ] Test GET /suggestions/:userId
- [ ] Test GET /profile/:username
- [ ] Test POST /social/connect
- [ ] Verify all tests pass

---

### Task 6.2: Update Error Handling

**Check all API calls have proper error handling**:

- [ ] Network errors
- [ ] 400 errors (bad request)
- [ ] 404 errors (not found)
- [ ] 500 errors (server error)
- [ ] Authentication errors
- [ ] User-friendly error messages

---

### Task 6.3: Add Loading States

**Ensure all async operations show loading states**:

- [ ] Niche fetching
- [ ] Rizz score calculation
- [ ] Match suggestions loading
- [ ] Profile fetching
- [ ] Social connection

---

### Task 6.4: Update Documentation

**Update relevant docs**:

- [ ] Update `docs/BACKEND-API-INTEGRATION-PLAN.md` with completion status
- [ ] Update `docs/NICHE-100-ANALYSIS.md` - mark as resolved
- [ ] Create changelog entry
- [ ] Update README if needed

---

## ✅ Final Checklist

### API Services
- [ ] `src/lib/api/niche.api.ts` - Created
- [ ] `src/lib/api/rizz.api.ts` - Created
- [ ] `src/lib/api/suggestions.api.ts` - Created/Updated
- [ ] `src/lib/api/profile.api.ts` - Updated with getProfileByUsername
- [ ] `src/lib/api/social.api.ts` - Created/Updated

### Hooks
- [ ] `src/hooks/features/useNiches.ts` - Created
- [ ] `src/hooks/features/useRizzScore.ts` - Created

### Components Updated
- [ ] `src/app/profile/complete-profile/page.jsx` - Uses API niches, calculates Rizz
- [ ] `src/components/profile/ProfileEdit/Card.tsx` - Uses API niches, calculates Rizz
- [ ] `src/app/matching/page.tsx` - Uses new suggestions endpoint
- [ ] Match cards - Show matching Rizz score
- [ ] `src/app/profile/[username]/page.tsx` - Dynamic profile route

### Testing
- [ ] All endpoints tested
- [ ] Error handling verified
- [ ] Loading states work
- [ ] Mobile responsive
- [ ] No console errors

### Documentation
- [ ] Implementation plan updated
- [ ] Changelog created
- [ ] README updated (if needed)

---

## 🚨 Critical Notes

1. **Niche Limit**: Remove or set to 100+ (backend supports unlimited)
2. **Error Handling**: All API calls must have try/catch
3. **Loading States**: Show spinners during async operations
4. **Authentication**: Some endpoints require auth token
5. **TypeScript**: All new code must be properly typed
6. **Testing**: Test each endpoint before moving to next

---

## 📅 Estimated Timeline

- **Day 1**: Phase 1 (API Services) + Phase 2 (Niche Integration)
- **Day 2**: Phase 3 (Rizz Score) + Phase 4 (Matching)
- **Day 3**: Phase 5 (Profile & Social) + Phase 6 (Testing)

**Total**: 2-3 days for complete implementation

---

## 🎯 Success Criteria

✅ 100+ niches available from backend (GET /matchmaker/niches)  
✅ Users can select unlimited niches  
✅ Niches updated via POST /matchmaker/niches/update  
✅ Rizz score fetched from GET /matchmaker/rizz-score/:userId  
✅ Profile score and matching score both available  
✅ Match suggestions use GET /matchmaker/suggestions/:userId  
✅ Suggestions show matchingScore and sharedNiches  
✅ All error cases handled  
✅ Loading states implemented  
✅ Mobile responsive  
✅ No breaking changes to existing profile endpoints  
✅ Niches are capitalized (as returned by backend)

---

**Ready to start? Begin with Phase 1, Task 1.1!** 🚀

