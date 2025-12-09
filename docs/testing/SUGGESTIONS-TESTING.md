# 🧪 Match Suggestions API Testing Guide

**Quick Reference for Testing Match Suggestions Integration**

---

## 🚀 Method 1: Browser Console (Easiest)

### Step-by-Step:

1. **Open your app** in browser (make sure you're logged in)
2. **Open DevTools** (Press `F12` or `Right-click → Inspect`)
3. **Go to Console tab**
4. **Copy and paste this code:**

```javascript
// Improved Match Suggestions Test Script
// Automatically fetches userId from API if not in localStorage

(async function testSuggestions() {
  console.log('🚀 Starting Match Suggestions Test...');
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
          localStorage.setItem('userId', userId); // Save for next time
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
  
  // Step 4: Test Match Suggestions API
  console.log('\n🧪 Testing Match Suggestions API...');
  console.log(`   Endpoint: /api/v1/matchmaker/suggestions/${userId}`);
  
  try {
    const BASE_URL = 'https://api-hyperbuds-backend.onrender.com';
    const response = await fetch(`${BASE_URL}/api/v1/matchmaker/suggestions/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    
    if (response.status === 200) {
      console.log('\n✅ SUCCESS! Match Suggestions Data:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n📊 Validation:');
      console.log('  ✅ userId:', data.userId ? '✅' : '❌');
      console.log('  ✅ suggestions:', Array.isArray(data.suggestions) ? `✅ ${data.suggestions.length} items` : '❌');
      
      if (data.suggestions?.length > 0) {
        const first = data.suggestions[0];
        console.log('\n  First Suggestion:');
        console.log('    ✅ userId:', first.userId ? '✅' : '❌');
        console.log('    ✅ username:', first.username ? '✅' : '❌');
        console.log('    ✅ matchingScore:', typeof first.matchingScore === 'number' ? `✅ ${first.matchingScore}` : '❌');
        console.log('    ✅ sharedNiches:', Array.isArray(first.sharedNiches) ? `✅ ${first.sharedNiches.length} niches` : '❌');
      }
      
      // Summary
      console.log('\n📈 Summary:');
      console.log(`   - Total Suggestions: ${data.suggestions?.length || 0} users`);
      if (data.suggestions?.length > 0) {
        const scores = data.suggestions.map(s => s.matchingScore || 0);
        console.log(`   - Average Score: ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}`);
        console.log(`   - Highest Score: ${Math.max(...scores)}`);
      }
      
    } else if (response.status === 404) {
      console.error('\n❌ FAILED: 404 Not Found');
      console.warn('⚠️  Endpoint not found - Backend not implemented yet');
    } else if (response.status === 401) {
      console.error('\n❌ FAILED: 401 Unauthorized');
      console.warn('⚠️  Authentication failed - Token may be expired');
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

1. **Open `test-suggestions.js`** file in your project root
2. **Update the variables:**
   ```javascript
   const ACCESS_TOKEN = 'your-token-here'; // From localStorage.getItem('accessToken')
   const USER_ID = 'your-user-id-here'; // From localStorage.getItem('userId')
   ```
3. **Run the script:**
   ```bash
   node test-suggestions.js
   ```
4. **Check the output** for validation results

---

## 🎨 Method 3: UI Testing (Matching Page)

### Step-by-Step:

1. **Navigate to Matching page:**
   - Go to `/matching` in your browser
   - Or click on "Matching" in your navigation menu

2. **Open DevTools:**
   - Press `F12` or `Right-click → Inspect`
   - Go to **Network** tab

3. **Check the request:**
   - Look for request to `/api/v1/matchmaker/suggestions/:userId`
   - Click on it to see details

4. **Verify the response:**
   - **Status:** Should be `200 OK` (or `404` if not implemented)
   - **Response:** Should contain suggestions array

5. **Check the UI:**
   - Suggestions should display on the page
   - Matching scores should be visible
   - Shared niches should be shown

---

## ✅ Expected Results

### Success Response (200 OK):
```json
{
  "userId": "68c1ea88531c3fa696776528",
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
    }
  ]
}
```

### Validation Checklist:
- ✅ `userId` is a string
- ✅ `suggestions` is an array
- ✅ Each suggestion has:
  - `userId` (string)
  - `username` (string)
  - `matchingScore` (number, 0-100)
  - `sharedNiches` (array of strings)

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
Response: { "message": "Failed to fetch suggestions from server" }
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
   - Filter by "suggestions"
   - Check request headers and response

4. **Check Console:**
   - Look for error messages
   - Check for warnings about missing endpoints

---

## 📝 Notes

- **Endpoint:** `GET /api/v1/matchmaker/suggestions/:userId`
- **Authentication:** Required (Bearer token)
- **Status:** ⚠️ Currently returns 404 (not implemented)
- **Frontend:** Handles 404 gracefully (no errors shown to user)
- **Minimum Matching Score:** Only users with > 50% matching score are returned

---

**Last Updated:** January 2025


