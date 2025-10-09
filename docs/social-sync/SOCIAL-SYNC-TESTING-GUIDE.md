# Social Media Sync - Complete Testing Guide

**Feature:** Sync platform data from RapidAPI to backend database  
**Date:** October 9, 2025  
**Testing Status:** Ready for manual testing

---

## 🧪 How to Test the Social Sync Feature

### Prerequisites:
✅ Backend API running at `https://api-hyperbuds-backend.onrender.com`  
✅ Frontend dev server running: `npm run dev`  
✅ User logged in with valid token  
✅ Social media links added to profile (TikTok, Twitch, Twitter)

---

## Step-by-Step Testing Instructions

### **Step 1: Navigate to Platform Analytics**

1. Open browser: `http://localhost:3000`
2. Login if not already logged in
3. Click **Profile** in sidebar
4. Scroll down to **Platform Performance** section
5. Click on any platform card (shows detailed stats)
   
   **OR** 
   
6. Navigate directly to: `http://localhost:3000/profile/platform-analytics`

---

### **Step 2: Wait for Platform Data to Load**

You should see:
- Loading spinner initially
- Then platform cards appear with data from RapidAPI
- Each card shows:
  - Platform icon and name (TikTok 🎵, Twitter 🐦, Twitch 🎮)
  - Username (@your_username)
  - Followers count
  - Engagement stats
  - **NEW: "Sync" button at bottom of card**

---

### **Step 3: Test Syncing a Single Platform**

#### TikTok Sync Test:

1. **Locate the TikTok card** (pink/red gradient header)
2. **Find the "Sync" button** at bottom of card
3. **Click "Sync to Database"** button
4. **Observe the button states:**
   - Changes to "Syncing..." with spinning icon
   - Button is disabled during sync
5. **Wait for completion** (~1-2 seconds)
6. **Verify success indicators:**
   - Button changes to "Successfully Synced!" with checkmark
   - Green color for 3 seconds
   - Toast notification appears: "Sync successful! TIKTOK data synced to your profile"
7. **Button returns to "Sync"** after 3 seconds

#### Expected Network Request:
```
POST https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
Body:
{
  "follow": 1000,           // From RapidAPI data (backend expects "follow" not "followers")
  "engagement": 7.5         // From RapidAPI data
}
```

#### Expected Response:
```json
{
  "success": true,
  "message": "Social media Tiktok synced successfully",
  "profile": {
    "stats": {
      "platformBreakdown": {
        "tiktok": {
          "followers": 1000,
          "engagement": 7.5
        }
      },
      "totalFollowers": 24025,
      "avgEngagement": 1.39
    }
  }
}
```

---

### **Step 4: Test Twitch Sync**

1. **Locate the Twitch card** (purple gradient header)
2. **Click "Sync" button**
3. **Verify same behavior as TikTok**

#### Expected Network Request:
```
POST https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/twitch
Body:
{
  "followers": 500,
  "engagement": 3.2
}
```

---

### **Step 5: Test Twitter Sync**

1. **Locate the Twitter card** (blue gradient header)
2. **Click "Sync" button**
3. **Verify same behavior**

#### Expected Network Request:
```
POST https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/twitter
Body:
{
  "followers": 1500,
  "engagement": 4.8
}
```

---

### **Step 6: Verify Data Persistence**

After syncing platforms:

1. **Navigate away** from page (e.g., go to Dashboard)
2. **Navigate back** to `/profile/platform-analytics`
3. **Check if synced data is still there**
4. **Verify "totalFollowers" is updated** in profile stats

---

### **Step 7: Test Error Handling**

#### Test with Invalid Token:
1. Open DevTools → Application → LocalStorage
2. Delete `accessToken`
3. Try to sync
4. **Expected:** Error toast "Sync failed: Unauthorized"

#### Test with Network Error:
1. Disable internet connection
2. Try to sync
3. **Expected:** Error toast "Sync failed: Network error"

#### Test with Backend Error:
1. If backend returns 500 error
2. **Expected:** Error toast with error message
3. Button returns to "Sync" state (not stuck in loading)

---

## 🔍 DevTools Checks

### Open Browser DevTools (F12)

#### Network Tab:
```
Filter: XHR/Fetch
Look for:
✅ POST /api/v1/profiles/social-sync/tiktok
✅ POST /api/v1/profiles/social-sync/twitch  
✅ POST /api/v1/profiles/social-sync/twitter

Check Request Headers:
✅ Authorization: Bearer {token}
✅ Content-Type: application/json

Check Request Payload:
✅ { "followers": number, "engagement": number }

Check Response:
✅ Status: 200 OK
✅ Body: { "success": true, "message": "...", "profile": {...} }
```

#### Console Tab:
```
Look for:
✅ No errors
✅ "Sync successful!" (from hook)

Warnings are OK:
⚠️ React DevTools message
⚠️ Hydration warnings (not critical)
```

#### Application Tab:
```
Check localStorage:
✅ accessToken exists
✅ Valid JWT format
```

---

## 📊 Visual Verification

### Button States Checklist:

**Idle State:**
```
┌────────────────┐
│ 🗄️  Sync       │  ← Blue background
└────────────────┘
```

**Loading State:**
```
┌────────────────┐
│ ⟳  Syncing...  │  ← Spinning icon, blue background
└────────────────┘
```

**Success State:**
```
┌────────────────┐
│ ✓  Synced!     │  ← Green background, 3 seconds
└────────────────┘
```

---

## 🧪 Test Scenarios

### Scenario 1: First Time Sync
- User has never synced before
- Click sync
- Data saved to database
- Profile totalFollowers updated

### Scenario 2: Update Existing Data
- User already synced before
- Followers increased on platform
- Click sync again
- Database updated with new count
- totalFollowers recalculated

### Scenario 3: Multiple Platforms
- Sync TikTok first
- Then sync Twitch
- Then sync Twitter
- Verify totalFollowers = sum of all platforms

### Scenario 4: Rapid Clicking
- Click sync button multiple times quickly
- Should only trigger once
- Button disabled during sync
- No duplicate requests

---

## 🎯 Expected Outcomes

### After Successful Sync:

1. **Database Updated:**
   ```json
   profile.stats.platformBreakdown = {
     "tiktok": { "followers": 1000, "engagement": 7.5 },
     "twitch": { "followers": 500, "engagement": 3.2 }
   }
   ```

2. **Total Followers Recalculated:**
   ```
   totalFollowers = 1000 (TikTok) + 500 (Twitch) = 1500
   ```

3. **Average Engagement Recalculated:**
   ```
   avgEngagement = (7.5 + 3.2) / 2 = 5.35%
   ```

4. **Profile Updated:**
   - `profile.updatedAt` = current timestamp
   - Changes reflected in profile page
   - Rizz score may be recalculated (uses follower data)

---

## 🐛 Common Issues & Solutions

### Issue 1: Button Doesn't Appear
**Symptom:** No "Sync" button visible
**Cause:** `showSyncButtons` prop not set
**Solution:** Check PlatformStats usage has `showSyncButtons={true}`

### Issue 2: Sync Fails with 401
**Symptom:** Error toast "Unauthorized"
**Cause:** Invalid or expired token
**Solution:** Log out and log in again

### Issue 3: Sync Button Stuck in Loading
**Symptom:** Button shows "Syncing..." forever
**Cause:** Backend not responding or error
**Solution:** Check backend logs, refresh page

### Issue 4: No Data to Sync
**Symptom:** Error toast "No platform data available"
**Cause:** Platform usernames not in profile
**Solution:** Add social links in profile edit page first

---

## 📱 Mobile Testing

### Responsive Design Check:

1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Select iPhone or Android device
3. Navigate to platform analytics
4. Verify:
   - Cards stack vertically
   - Sync buttons still visible
   - Touch-friendly button size
   - Proper spacing on mobile

---

## 🔄 Auto-Refresh After Sync

**Feature:** Page data refreshes automatically after sync

**Test:**
1. Note current follower count on card
2. Click sync button
3. Wait for success
4. **Verify:** Card data refreshes (may change if API data updated)
5. **Check:** Profile data refetched in background

---

## 📋 Final Checklist

Before marking as complete, verify:

- ✅ All 3 platforms have sync buttons (TikTok, Twitch, Twitter)
- ✅ Buttons only appear when `showSyncButtons={true}`
- ✅ Sync request contains correct follower count
- ✅ Backend responds with 200 OK
- ✅ Success toast appears
- ✅ Button shows success state for 3 seconds
- ✅ Error handling works (401, 500, network errors)
- ✅ Multiple syncs work correctly
- ✅ Profile totalFollowers updates
- ✅ No console errors
- ✅ Loading states work properly
- ✅ Mobile responsive
- ✅ Dark mode compatible

---

## 📝 Manual Testing Script

Copy and use this checklist:

```
□ Start dev server: npm run dev
□ Login to app
□ Navigate to /profile/platform-analytics
□ Wait for platform data to load (5-10 seconds)
□ Verify "Sync" button appears on each platform card

TikTok Test:
□ Click TikTok sync button
□ Verify button shows "Syncing..."
□ Check Network tab for POST request
□ Verify 200 OK response
□ See success toast
□ Button shows "Synced!" in green
□ Button returns to "Sync" after 3 seconds

Twitch Test:
□ Click Twitch sync button
□ Same verification steps

Twitter Test:
□ Click Twitter sync button
□ Same verification steps

Verification:
□ Navigate to /profile
□ Check totalFollowers count updated
□ Refresh page, data persists
□ No console errors
```

---

## 💡 Quick Test Command

For quick verification, open browser console and run:

```javascript
// Check if sync functions are available
const testSync = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      followers: 1000,
      engagement: 7.5
    })
  });
  
  const data = await response.json();
  console.log('Sync result:', data);
  return data;
};

// Run test
await testSync();
```

---

## ✅ Success Criteria

Feature is working correctly if:

1. ✅ Button appears on all platform cards when enabled
2. ✅ Clicking button triggers POST request to correct endpoint
3. ✅ Request body contains followers and engagement data
4. ✅ Backend responds with updated profile
5. ✅ Success toast notification shown
6. ✅ Button visual states work (idle → loading → success → idle)
7. ✅ Profile data refreshes after sync
8. ✅ Multiple syncs can be performed
9. ✅ Error handling works for all edge cases
10. ✅ No console errors or warnings

---

**Happy Testing!** 🚀

If you encounter any issues, check:
- Backend logs for API errors
- Browser console for frontend errors
- Network tab for failed requests
- LocalStorage for valid auth token

