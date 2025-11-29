# 🧪 Rizz Score API Testing Guide

**Quick Reference for Testing Rizz Score Integration**

---

## 🚀 Method 1: Browser Console (Easiest)

### Step-by-Step:

1. **Open your app** in browser (make sure you're logged in)
2. **Open DevTools** (Press `F12` or `Right-click → Inspect`)
3. **Go to Console tab**
4. **Copy and paste this code:**

```javascript
// Improved Rizz Score Test Script
// Automatically fetches userId from API if not in localStorage

(async function testRizzScore() {
  console.log('🚀 Starting Rizz Score Test...');
  console.log('='.repeat(60));
  
  // Step 1: Get access token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('❌ Access token not found! Please log in first.');
    return;
  }
  console.log('✅ Access token found');
  
  // Step 2: Try to get userId from localStorage
  let userId = localStorage.getItem('userId');
  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  if (!userId && userFromStorage.userId) {
    userId = userFromStorage.userId;
  }
  
  // Step 3: If userId not in localStorage, fetch from API
  if (!userId) {
    console.log('⚠️  UserId not in localStorage, fetching from API...');
    try {
      const BASE_URL = 'https://api-hyperbuds-backend.onrender.com';
      const profileRes = await fetch(`${BASE_URL}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        
        // Try different response structures
        userId = profileData.profile?.userId || 
                 profileData.data?.profile?.userId ||
                 profileData.data?.userId ||
                 profileData.userId ||
                 profileData.user?.userId ||
                 profileData.user?.id;
        
        if (userId) {
          console.log('✅ UserId fetched from API:', userId);
          // Optionally save it for next time
          localStorage.setItem('userId', userId);
        } else {
          console.error('❌ Could not find userId in API response');
          console.log('API Response:', profileData);
          return;
        }
      } else {
        console.error('❌ Failed to fetch profile:', profileRes.status);
        return;
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      return;
    }
  } else {
    console.log('✅ UserId found in localStorage:', userId);
  }
  
  // Step 4: Test Rizz Score API
  console.log('\n🧪 Testing Rizz Score API...');
  console.log(`   Endpoint: /api/v1/matchmaker/rizz-score/${userId}`);
  
  try {
    const BASE_URL = 'https://api-hyperbuds-backend.onrender.com';
    const response = await fetch(`${BASE_URL}/api/v1/matchmaker/rizz-score/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS! Rizz Score Data:');
      console.log(JSON.stringify(data, null, 2));
      
      // Validate response
      console.log('\n📊 Validation:');
      console.log('  ✅ userId:', data.userId ? '✅' : '❌');
      console.log('  ✅ username:', data.username ? '✅' : '❌');
      console.log('  ✅ displayName:', data.displayName ? '✅' : '❌');
      console.log('  ✅ profileScore:', typeof data.rizzScore?.profileScore === 'number' ? `✅ ${data.rizzScore.profileScore}` : '❌');
      console.log('  ✅ matchingScore:', typeof data.rizzScore?.matchingScore === 'number' ? `✅ ${data.rizzScore.matchingScore}` : '❌');
      console.log('  ✅ suggestions:', Array.isArray(data.suggestions) ? `✅ ${data.suggestions.length} items` : '❌');
      
      // Summary
      console.log('\n📈 Summary:');
      console.log(`   - Profile Score: ${data.rizzScore?.profileScore || 'N/A'}`);
      console.log(`   - Matching Score: ${data.rizzScore?.matchingScore || 'N/A'}`);
      console.log(`   - Suggestions: ${data.suggestions?.length || 0} users`);
      
    } else if (response.status === 404) {
      console.error('\n❌ FAILED: 404 Not Found');
      console.error('Response:', data);
      console.warn('\n⚠️  Endpoint not found - Backend not implemented yet');
    } else if (response.status === 401) {
      console.error('\n❌ FAILED: 401 Unauthorized');
      console.error('Response:', data);
      console.warn('\n⚠️  Authentication failed - Token may be expired');
    } else {
      console.error('\n❌ FAILED:', response.status);
      console.error('Response:', data);
    }
    
  } catch (err) {
    console.error('\n❌ ERROR:', err);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
})();
```

5. **Press Enter** to run
6. **Check the console output** for results

---

## 🖥️ Method 2: Test Script (Node.js)

### Step-by-Step:

1. **Open `test-rizz-score.js`** file in your project root
2. **Update the variables:**
   ```javascript
   const ACCESS_TOKEN = 'your-token-here'; // Get from browser console: localStorage.getItem('accessToken')
   const USER_ID = 'your-user-id-here'; // Get from browser console: JSON.parse(localStorage.getItem('user')).userId
   ```
3. **Run the script:**
   ```bash
   node test-rizz-score.js
   ```
4. **Check the output** for validation results

---

## 🎨 Method 3: UI Testing (Rizz Score Page)

### Step-by-Step:

1. **Navigate to Rizz Score page:**
   - Go to `/profile/rizz-score` in your browser
   - Or click on "Rizz Score" in your profile menu

2. **Open DevTools:**
   - Press `F12` or `Right-click → Inspect`
   - Go to **Network** tab

3. **Check the request:**
   - Look for request to `/api/v1/matchmaker/rizz-score/:userId`
   - Click on it to see details

4. **Verify the response:**
   - **Status:** Should be `200 OK` (or `404` if not implemented)
   - **Response:** Should contain rizzScore data

5. **Check the UI:**
   - Rizz Score should display on the page
   - Profile Score and Matching Score should be visible
   - Suggestions list should be displayed (if any)

---

## ✅ Expected Results

### Success Response (200 OK):
```json
{
  "userId": "68c1ea88531c3fa696776528",
  "username": "khaled",
  "displayName": "Khaled",
  "rizzScore": {
    "profileScore": 85,
    "matchingScore": 92
  },
  "profileUrl": "/profile/khaled",
  "suggestions": [
    {
      "userId": "...",
      "username": "...",
      "displayName": "...",
      "matchingScore": 88,
      "niche": ["Gaming", "Tech"],
      "profileUrl": "/profile/..."
    }
  ]
}
```

### Validation Checklist:
- ✅ `userId` is a string
- ✅ `username` is a string
- ✅ `displayName` is a string
- ✅ `rizzScore.profileScore` is a number (0-100)
- ✅ `rizzScore.matchingScore` is a number (0-100)
- ✅ `profileUrl` is a string
- ✅ `suggestions` is an array

---

## ❌ Common Errors

### 404 Not Found
```
Status: 404
Response: { "message": "Route not found" }
```
**Meaning:** Backend endpoint not implemented yet  
**Action:** Wait for backend team to implement the endpoint

### 401 Unauthorized
```
Status: 401
Response: { "message": "Unauthorized" }
```
**Meaning:** Invalid or expired token  
**Action:** Log out and log in again to get a new token

### 400 Bad Request
```
Status: 400
Response: { "message": "User ID is missing or invalid" }
```
**Meaning:** Invalid userId format  
**Action:** Check userId is correct format (MongoDB ObjectId)

### 500 Internal Server Error
```
Status: 500
Response: { "message": "Internal server error" }
```
**Meaning:** Backend error  
**Action:** Contact backend team

---

## 🔍 Debugging Tips

1. **Check Authentication:**
   ```javascript
   const token = localStorage.getItem('accessToken');
   console.log('Token:', token ? 'Found' : 'Missing');
   ```

2. **Check User ID:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   console.log('UserId:', user.userId);
   ```

3. **Check Network Tab:**
   - Open DevTools → Network tab
   - Filter by "rizz-score"
   - Check request headers and response

4. **Check Console:**
   - Look for error messages
   - Check for warnings about missing endpoints

---

## 📝 Notes

- **Endpoint:** `GET /api/v1/matchmaker/rizz-score/:userId`
- **Authentication:** Required (Bearer token)
- **Status:** ⚠️ Currently returns 404 (not implemented)
- **Frontend:** Handles 404 gracefully (no errors shown to user)

---

**Last Updated:** January 2025

