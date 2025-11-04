# Platform Integration Testing Guide

**Last Updated:** January 2025  
**Status:** ✅ Backend Endpoint Available

---

## 🎯 Quick Test Methods

### **Method 1: Test from Frontend UI (Easiest)**

1. **Navigate to Profile Edit Page:**
   ```
   http://localhost:3000/profile/edit
   ```

2. **Enter Platform Usernames:**
   - TikTok: Enter a username (e.g., `_khaled_0_0_`)
   - Instagram: Enter a username (e.g., `_looood_`)
   - YouTube: Enter a username
   - Twitter: Enter a username
   - Twitch: Enter a username

3. **Check for Preview Cards:**
   - If the API works, you'll see a preview card with follower count and engagement rate
   - If it fails, check the browser console for error messages

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for:
     - ✅ Success messages: `✅ Successfully fetched [platform] data`
     - ⚠️ Warnings: `⚠️ [platform]: Backend API endpoint not yet available`
     - ❌ Errors: Any other errors

---

### **Method 2: Test via Browser Console**

1. **Open Browser Console** (F12 → Console tab)

2. **Test with Authentication:**
   ```javascript
   // Get your auth token
   const token = localStorage.getItem('accessToken');
   
   // Test TikTok
   fetch('/api/platform/tiktok?username=_khaled_0_0_', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   .then(r => r.json())
   .then(data => console.log('TikTok Result:', data));
   
   // Test Instagram
   fetch('/api/platform/instagram?username=_looood_', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   })
   .then(r => r.json())
   .then(data => console.log('Instagram Result:', data));
   ```

3. **Expected Success Response:**
   ```json
   {
     "success": true,
     "data": {
       "platform": "tiktok",
       "username": "_khaled_0_0_",
       "displayName": "...",
       "followers": 5200,
       "totalEngagement": 432,
       "averageEngagement": 8.3,
       ...
     }
   }
   ```

---

### **Method 3: Test Direct Backend API (PowerShell)**

⚠️ **Note:** The backend requires authentication. You'll need a valid access token.

```powershell
# Set your access token (get from browser localStorage)
$token = "YOUR_ACCESS_TOKEN_HERE"

# Test TikTok
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}
$body = @{
    platform = "tiktok"
    username = "_khaled_0_0_"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api-hyperbuds-backend.onrender.com/api/v1/social/fetch" -Method POST -Headers $headers -Body $body
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $_"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}
```

---

### **Method 4: Test with cURL (Command Line)**

```bash
# Replace YOUR_ACCESS_TOKEN with actual token from localStorage
curl -X POST "https://api-hyperbuds-backend.onrender.com/api/v1/social/fetch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "platform": "tiktok",
    "username": "_khaled_0_0_"
  }'
```

---

## ✅ Success Indicators

### **Frontend Success:**
- ✅ Preview card appears with follower count
- ✅ Console shows: `✅ Successfully fetched [platform] data`
- ✅ No error messages in console
- ✅ Data source indicator shows green (live data) instead of gray (stored data)

### **Backend Success:**
```json
{
  "success": true,
  "data": {
    "followers": 5200,
    "engagement": 8.3
  }
}
```

---

## ❌ Error Scenarios

### **401 Unauthorized:**
- **Cause:** Missing or invalid authentication token
- **Fix:** Make sure you're logged in and have a valid `accessToken` in localStorage

### **404 Not Found:**
- **Cause:** Backend endpoint not deployed
- **Fix:** Contact backend team

### **400 Bad Request:**
- **Cause:** Invalid platform or username
- **Fix:** Check platform name (must be: `tiktok`, `instagram`, `youtube`, `twitter`, `twitch`)

### **500 Internal Server Error:**
- **Cause:** Backend API error
- **Fix:** Check backend logs

---

## 🧪 Test Cases

### **Test Case 1: TikTok**
```json
{
  "platform": "tiktok",
  "username": "_khaled_0_0_"
}
```

### **Test Case 2: Instagram**
```json
{
  "platform": "instagram",
  "username": "_looood_"
}
```

### **Test Case 3: YouTube**
```json
{
  "platform": "youtube",
  "username": "testuser"
}
```

### **Test Case 4: Twitter**
```json
{
  "platform": "twitter",
  "username": "khaled05075119"
}
```

### **Test Case 5: Twitch**
```json
{
  "platform": "twitch",
  "username": "ninja"
}
```

---

## 🔍 Debugging Steps

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for API calls and responses

2. **Check Network Tab:**
   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "platform"
   - Click on requests to see details

3. **Check Authentication:**
   ```javascript
   // In browser console
   console.log('Token:', localStorage.getItem('accessToken'));
   ```

4. **Check API Route:**
   - Look for requests to `/api/platform/[type]`
   - Check response status and body

5. **Check Backend Logs:**
   - Contact backend team to check server logs
   - Look for incoming requests and errors

---

## 📊 Expected Results

### **Platform Data Structure:**
```json
{
  "success": true,
  "data": {
    "platform": "tiktok",
    "username": "_khaled_0_0_",
    "displayName": "_khaled_0_0_",
    "profileImage": "",
    "bio": "",
    "verified": false,
    "followers": 5200,
    "following": 0,
    "totalContent": 0,
    "totalEngagement": 432,
    "averageEngagement": 8.3,
    "lastFetched": "2025-01-XX...",
    "raw": {
      "followers": 5200,
      "engagement": 8.3
    }
  }
}
```

---

## 🚀 Quick Start Testing

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3000/profile/edit
   ```

3. **Enter a TikTok username** (e.g., `_khaled_0_0_`)

4. **Watch for:**
   - ✅ Preview card appears = Success!
   - ⚠️ Warning message = Endpoint exists but needs auth/data
   - ❌ Error = Check console for details

---

## 📝 Testing Checklist

- [ ] Test TikTok username input
- [ ] Test Instagram username input
- [ ] Test YouTube username input
- [ ] Test Twitter username input
- [ ] Test Twitch username input
- [ ] Verify preview cards show correct data
- [ ] Verify follower counts are accurate
- [ ] Verify engagement rates are accurate
- [ ] Check console for errors
- [ ] Verify authentication works
- [ ] Test with invalid usernames (should show error)
- [ ] Test with empty username (should show validation error)

---

## 🔗 Related Documentation

- [Backend Requirements](./BACKEND-REQUIREMENTS.md)
- [Platform API Guide](./PLATFORM-API-GUIDE.md)

---

**Need Help?** Check the browser console for detailed error messages and contact the backend team if the endpoint is not responding correctly.

