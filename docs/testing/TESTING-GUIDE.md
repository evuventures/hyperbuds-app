# 🧪 Testing Guide - Backend API Integration Updates

**Date:** January 2025  
**Status:** Ready for Testing  
**Updated Files:** 8 files

---

## 📋 Summary of Changes

### **New API Services Created:**
1. ✅ `src/lib/api/niche.api.ts` - Niche fetching and updating
2. ✅ `src/lib/api/rizz.api.ts` - Rizz score fetching
3. ✅ `src/lib/api/suggestions.api.ts` - Match suggestions fetching

### **New Hooks Created:**
4. ✅ `src/hooks/features/useNiches.ts` - Hook for fetching niches
5. ✅ `src/hooks/features/useRizzScore.ts` - Hook for fetching Rizz scores

### **Updated Components:**
6. ✅ `src/app/profile/complete-profile/page.jsx` - Now uses API for niches
7. ✅ `src/components/profile/ProfileEdit/Card.tsx` - Now uses API for niches
8. ✅ `src/app/matching/page.tsx` - Now uses suggestions API

### **Configuration:**
9. ✅ `src/config/baseUrl.ts` - Base URL configuration

### **Test Script:**
10. ✅ `test-niche-validation.js` - Niche validation test script

---

## 🚀 Pre-Testing Setup

### 1. **Verify Environment Variables**

Check your `.env.local` or `.env` file:

```bash
# Required
NEXT_PUBLIC_BASE_URL=https://api-hyperbuds-backend.onrender.com
# OR
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1

# Optional (for location auto-fill)
NEXT_PUBLIC_ABSTRACT_API_KEY=your_key_here
```

### 2. **Verify Backend is Running**

The backend should be accessible at:
- `https://api-hyperbuds-backend.onrender.com`

Test with:
```bash
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches
```

Expected: Should return a JSON array of niches (100+ items)

### 3. **Get Your Access Token**

1. Open your app in browser
2. Login to get an access token
3. Open browser console (F12)
4. Run: `localStorage.getItem('accessToken')`
5. Copy the token (you'll need it for manual API testing)

---

## 🧪 Testing Checklist

### **Phase 1: Niche API Integration** ⭐ CRITICAL

#### Test 1.1: Fetch Niches from API

**Location:** Complete Profile Page (`/profile/complete-profile`)

**Steps:**
1. Navigate to `/profile/complete-profile` (or start profile completion)
2. Go to the niche selection step
3. Open browser DevTools → Network tab
4. Look for request to `/api/v1/matchmaker/niches`

**Expected Results:**
- ✅ Request succeeds (200 status)
- ✅ Response contains `{ niches: [...] }` with 100+ niche items
- ✅ Niches are displayed in the dropdown/search
- ✅ Niches are capitalized (e.g., "Gaming", "Tech Reviews")
- ✅ Loading state shows while fetching
- ✅ No console errors

**If it fails:**
- Check Network tab for error response
- Check console for error messages
- Verify `BASE_URL` in `src/config/baseUrl.ts`
- Verify backend endpoint is accessible

---

#### Test 1.2: Select and Save Niches

**Location:** Complete Profile Page (`/profile/complete-profile`)

**Steps:**
1. On niche selection step, select 3-5 niches
2. Complete the profile form
3. Submit the form
4. Open browser DevTools → Network tab
5. Look for request to `/api/v1/matchmaker/niches/update`

**Expected Results:**
- ✅ Request succeeds (200 status)
- ✅ Request body contains `{ userId: "...", niches: [...] }`
- ✅ Niches are capitalized in the request
- ✅ Response contains `{ message: "...", niches: [...] }`
- ✅ Profile saves successfully
- ✅ No console errors

**If it fails:**
- Check Network tab for error response
- Verify authentication token is sent
- Check if userId is correct
- Verify niches array format

---

#### Test 1.3: Edit Profile Niches

**Location:** Profile Edit Page (`/profile` → Edit button)

**Steps:**
1. Navigate to your profile page
2. Click "Edit Profile"
3. Go to niche selection section
4. Open browser DevTools → Network tab
5. Change selected niches
6. Save the profile

**Expected Results:**
- ✅ Niches load from API (100+ options)
- ✅ Previously selected niches are pre-selected
- ✅ Can select/deselect niches
- ✅ On save, request to `/api/v1/matchmaker/niches/update` is made
- ✅ Niches update successfully
- ✅ No console errors

**If it fails:**
- Check if niches are loading correctly
- Verify save functionality
- Check Network tab for errors

---

### **Phase 2: Rizz Score Integration**

#### Test 2.1: Fetch Rizz Score (Browser Console Method)

**Location:** Anywhere `useRizzScore` hook is used

**Method 1: Browser Console (Quick Test)**

**Steps:**
1. Open your app in browser (logged in)
2. Open browser DevTools → Console (F12)
3. Copy and paste this code:
```javascript
// Get your userId and token
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.userId || localStorage.getItem('userId');
const token = localStorage.getItem('accessToken');

console.log('🔍 User Info:');
console.log('  UserId:', userId);
console.log('  Token:', token ? '✅ Found' : '❌ Missing');

if (!userId) {
  console.error('❌ UserId not found! Make sure you are logged in.');
} else if (!token) {
  console.error('❌ Access token not found! Please log in again.');
} else {
  // Test Rizz Score API
  console.log('\n🧪 Testing Rizz Score API...');
  fetch('https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/rizz-score/' + userId, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
  .then(async r => {
    console.log('📡 Response Status:', r.status, r.statusText);
    const data = await r.json();
    return { status: r.status, data };
  })
  .then(({ status, data }) => {
    if (status === 200) {
      console.log('✅ SUCCESS! Rizz Score Data:');
      console.log(JSON.stringify(data, null, 2));
      
      // Validate response
      console.log('\n📊 Validation:');
      console.log('  ✅ userId:', data.userId ? '✅' : '❌');
      console.log('  ✅ username:', data.username ? '✅' : '❌');
      console.log('  ✅ displayName:', data.displayName ? '✅' : '❌');
      console.log('  ✅ profileScore:', typeof data.rizzScore?.profileScore === 'number' ? `✅ ${data.rizzScore.profileScore}` : '❌');
      console.log('  ✅ matchingScore:', typeof data.rizzScore?.matchingScore === 'number' ? `✅ ${data.rizzScore.matchingScore}` : '❌');
      console.log('  ✅ suggestions:', Array.isArray(data.suggestions) ? `✅ ${data.suggestions.length} items` : '❌');
    } else {
      console.error('❌ FAILED:', status);
      console.error('Response:', data);
      if (status === 404) {
        console.warn('⚠️  Endpoint not found - Backend not implemented yet');
      } else if (status === 401) {
        console.warn('⚠️  Authentication failed - Check your token');
      }
    }
  })
  .catch(err => {
    console.error('❌ ERROR:', err);
  });
}
```

**Expected Results:**
- ✅ Response contains:
  ```json
  {
    "userId": "...",
    "username": "...",
    "displayName": "...",
    "rizzScore": {
      "profileScore": 0-100,
      "matchingScore": 0-100
    },
    "profileUrl": "...",
    "suggestions": [...]
  }
  ```
- ✅ `profileScore` is a number (0-100)
- ✅ `matchingScore` is a number (0-100)
- ✅ `suggestions` is an array of user suggestions

**Method 2: Test Script (Node.js)**

**Steps:**
1. Open `test-rizz-score.js` file
2. Update `ACCESS_TOKEN` and `USER_ID` variables:
   ```javascript
   const ACCESS_TOKEN = 'your-token-here'; // From localStorage.getItem('accessToken')
   const USER_ID = 'your-user-id-here'; // From localStorage.getItem('userId')
   ```
3. Run: `node test-rizz-score.js`

**Method 3: UI Testing (Rizz Score Page)**

**Steps:**
1. Navigate to `/profile/rizz-score` page
2. Open browser DevTools → Network tab
3. Look for request to `/api/v1/matchmaker/rizz-score/:userId`
4. Check response in Network tab
5. Verify Rizz Score displays correctly on page

**Expected Results:**
- ✅ Page loads without errors
- ✅ Rizz Score displays (or shows loading state)
- ✅ Network request shows 200 status (or 404 if not implemented)
- ✅ Profile score and matching score are visible
- ✅ Suggestions list is displayed

**If it fails:**
- Check authentication token (must be valid)
- Verify userId is correct
- Check backend endpoint is working (should return 200, not 404)
- Verify user has selected niches (required for score calculation)
- Check Network tab for error details
- Check Console for error messages

---

### **Phase 3: Match Suggestions Integration**

#### Test 3.1: Fetch Match Suggestions

**Location:** Matching Page (`/matching`)

**Steps:**
1. Navigate to `/matching` page
2. Open browser DevTools → Network tab
3. Wait for page to load
4. Look for request to `/api/v1/matchmaker/suggestions/:userId`

**Expected Results:**
- ✅ Request succeeds (200 status)
- ✅ Response contains:
  ```json
  {
    "userId": "...",
    "suggestions": [
      {
        "userId": "...",
        "username": "...",
        "matchingScore": 50-100,
        "sharedNiches": [...]
      }
    ]
  }
  ```
- ✅ Suggestions are displayed on the page
- ✅ Matching scores are shown (should be > 50%)
- ✅ Shared niches are displayed
- ✅ No console errors

**If it fails:**
- Check Network tab for error response
- Verify authentication token
- Check if user has selected niches
- Verify backend endpoint is working

---

#### Test 3.2: Match Card Interactions

**Location:** Matching Page (`/matching`)

**Steps:**
1. On matching page, click on a match card
2. View match details
3. Check compatibility score
4. View shared niches

**Expected Results:**
- ✅ Match cards display correctly
- ✅ Matching scores are accurate (> 50%)
- ✅ Shared niches are shown
- ✅ Profile modals open correctly
- ✅ Compatibility modal shows correct data

**If it fails:**
- Check if data is being transformed correctly
- Verify profile fetching for each suggestion
- Check console for errors

---

## 🔍 Manual API Testing

### Test Niche API Directly

```bash
# 1. Get Niches
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches

# 2. Update Niches (replace YOUR_TOKEN and USER_ID)
curl -X POST https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/niches/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "USER_ID",
    "niches": ["Gaming", "Tech Reviews", "Comedy"]
  }'
```

### Test Rizz Score API

```bash
# Replace YOUR_TOKEN and USER_ID
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/rizz-score/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Suggestions API

```bash
# Replace YOUR_TOKEN and USER_ID
curl https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/suggestions/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Automated Testing Script

### Run Niche Validation Test

**File:** `test-niche-validation.js`

**Steps:**
1. Open `test-niche-validation.js`
2. Update `ACCESS_TOKEN` with your token:
   ```javascript
   const ACCESS_TOKEN = 'your_actual_token_here';
   ```
3. Run the test:
   ```bash
   node test-niche-validation.js
   ```

**Expected Results:**
- ✅ All test cases pass
- ✅ Valid niches are accepted
- ✅ Invalid niches are rejected
- ✅ Max 5 niches limit is enforced
- ✅ Lowercase validation works

---

## 🐛 Common Issues & Solutions

### Issue 1: Niches Not Loading

**Symptoms:**
- Empty niche dropdown
- Loading spinner never stops
- Console errors

**Solutions:**
1. Check Network tab - is request being made?
2. Verify `BASE_URL` in `src/config/baseUrl.ts`
3. Check backend endpoint: `GET /api/v1/matchmaker/niches`
4. Verify CORS is enabled on backend
5. Check console for error messages

---

### Issue 2: Authentication Errors

**Symptoms:**
- 401 Unauthorized errors
- "Authentication required" messages

**Solutions:**
1. Verify user is logged in
2. Check `localStorage.getItem('accessToken')` exists
3. Verify token is not expired
4. Check token is being sent in Authorization header
5. Re-login if token is invalid

---

### Issue 3: Niches Not Saving

**Symptoms:**
- Niches selection works but doesn't save
- Error on profile save

**Solutions:**
1. Check Network tab for `/api/v1/matchmaker/niches/update` request
2. Verify request body format:
   ```json
   {
     "userId": "string",
     "niches": ["Gaming", "Tech Reviews"]
   }
   ```
3. Verify niches are capitalized
4. Check backend response for error messages
5. Verify userId is correct

---

### Issue 4: Suggestions Not Showing

**Symptoms:**
- Matching page is empty
- No suggestions displayed

**Solutions:**
1. Verify user has selected niches
2. Check if other users exist with matching niches
3. Verify suggestions API returns data
4. Check Network tab for errors
5. Verify matching score threshold (> 50%)

---

## ✅ Success Criteria

All tests pass when:

1. ✅ **Niche API:**
   - Niches load from backend (100+ items)
   - Niches are capitalized correctly
   - Can select and save niches
   - Max niches limit works (if applicable)

2. ✅ **Rizz Score API:**
   - Rizz score fetches successfully
   - Profile score is calculated
   - Matching score is calculated
   - Suggestions are included

3. ✅ **Suggestions API:**
   - Suggestions load on matching page
   - Matching scores are > 50%
   - Shared niches are displayed
   - Match cards work correctly

4. ✅ **Error Handling:**
   - Network errors are handled gracefully
   - Authentication errors show proper messages
   - Loading states work correctly
   - No console errors

---

## 📊 Testing Report Template

After testing, document your results:

```markdown
## Testing Report - [Date]

### Environment
- Backend URL: [URL]
- Frontend URL: [URL]
- Browser: [Browser]
- User ID: [ID]

### Test Results

#### Phase 1: Niche API
- [ ] Niches load from API
- [ ] Can select niches
- [ ] Can save niches
- [ ] Edit profile niches works

#### Phase 2: Rizz Score
- [ ] Rizz score fetches
- [ ] Profile score displays
- [ ] Matching score displays

#### Phase 3: Suggestions
- [ ] Suggestions load
- [ ] Match cards display
- [ ] Shared niches show

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional notes]
```

---

## 🚀 Next Steps After Testing

1. **If all tests pass:**
   - ✅ Integration is complete
   - ✅ Ready for production
   - ✅ Document any edge cases found

2. **If tests fail:**
   - ❌ Document specific failures
   - ❌ Check backend logs
   - ❌ Verify API endpoints
   - ❌ Check error messages
   - ❌ Fix issues and re-test

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify backend is running
4. Check backend logs
5. Review API documentation

---

**Last Updated:** January 2025  
**Maintained By:** Development Team
