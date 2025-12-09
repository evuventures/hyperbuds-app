# 🧪 Improved Rizz Score Test Script

**This script automatically fetches userId from the API if not in localStorage**

---

## 📋 Copy This Code to Browser Console:

```javascript
// Improved Rizz Score Test Script
// This automatically fetches userId from API if not in localStorage

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
      const checks = [
        { name: 'userId', value: data.userId, type: 'string' },
        { name: 'username', value: data.username, type: 'string' },
        { name: 'displayName', value: data.displayName, type: 'string' },
        { name: 'rizzScore', value: data.rizzScore, type: 'object' },
        { name: 'rizzScore.profileScore', value: data.rizzScore?.profileScore, type: 'number', range: [0, 100] },
        { name: 'rizzScore.matchingScore', value: data.rizzScore?.matchingScore, type: 'number', range: [0, 100] },
        { name: 'profileUrl', value: data.profileUrl, type: 'string' },
        { name: 'suggestions', value: data.suggestions, type: 'array' },
      ];
      
      let allValid = true;
      checks.forEach(check => {
        if (check.value === undefined || check.value === null) {
          console.log(`   ❌ ${check.name}: Missing`);
          allValid = false;
        } else if (check.type === 'number') {
          if (typeof check.value !== 'number') {
            console.log(`   ❌ ${check.name}: Should be number, got ${typeof check.value}`);
            allValid = false;
          } else if (check.range) {
            const [min, max] = check.range;
            if (check.value < min || check.value > max) {
              console.log(`   ⚠️  ${check.name}: ${check.value} (expected ${min}-${max})`);
            } else {
              console.log(`   ✅ ${check.name}: ${check.value}`);
            }
          } else {
            console.log(`   ✅ ${check.name}: ${check.value}`);
          }
        } else if (check.type === 'array') {
          if (!Array.isArray(check.value)) {
            console.log(`   ❌ ${check.name}: Should be array, got ${typeof check.value}`);
            allValid = false;
          } else {
            console.log(`   ✅ ${check.name}: Array with ${check.value.length} items`);
          }
        } else {
          console.log(`   ✅ ${check.name}: ${check.value}`);
        }
      });
      
      if (allValid) {
        console.log('\n   ✅ All validations passed!');
      }
      
      // Summary
      console.log('\n📈 Summary:');
      console.log(`   - Profile Score: ${data.rizzScore?.profileScore || 'N/A'}`);
      console.log(`   - Matching Score: ${data.rizzScore?.matchingScore || 'N/A'}`);
      console.log(`   - Suggestions: ${data.suggestions?.length || 0} users`);
      
    } else if (response.status === 404) {
      console.error('\n❌ FAILED: 404 Not Found');
      console.error('Response:', data);
      console.warn('\n⚠️  Endpoint not found - Backend not implemented yet');
      console.warn('   Expected: GET /api/v1/matchmaker/rizz-score/:userId');
    } else if (response.status === 401) {
      console.error('\n❌ FAILED: 401 Unauthorized');
      console.error('Response:', data);
      console.warn('\n⚠️  Authentication failed - Token may be expired');
      console.warn('   Try logging out and logging in again');
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

---

## 🎯 Quick One-Liner Version:

If you just want to quickly test, use this shorter version:

```javascript
(async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return console.error('❌ Not logged in');
  
  // Get userId from API
  const profile = await fetch('https://api-hyperbuds-backend.onrender.com/api/v1/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  const userId = profile.profile?.userId || profile.data?.profile?.userId || profile.userId || profile.user?.userId;
  if (!userId) return console.error('❌ UserId not found');
  
  // Test Rizz Score
  const res = await fetch(`https://api-hyperbuds-backend.onrender.com/api/v1/matchmaker/rizz-score/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Data:', data);
})();
```

---

## 📝 What This Script Does:

1. ✅ Checks for access token
2. ✅ Tries to get userId from localStorage
3. ✅ If not found, fetches userId from `/api/v1/users/me` API
4. ✅ Tests the Rizz Score endpoint
5. ✅ Validates the response structure
6. ✅ Shows detailed results

---

**Copy the first script and paste it into your browser console!**


