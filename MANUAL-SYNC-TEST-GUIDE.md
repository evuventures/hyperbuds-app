# Manual Sync Test Guide

## Quick Test Steps

### Option 1: Use the Test Script (Easiest)

1. **Navigate to:** `http://localhost:3000/profile/platform-analytics`
2. **Open DevTools:** Press `F12`
3. **Go to Console tab**
4. **Copy the entire contents of** `test-sync-console.js`
5. **Paste into console and press Enter**
6. **Check the results:**
   - ✅ Green "SUCCESS! Sync worked!" = Fix is working
   - ❌ Red "FAILED!" = Still has issues

---

### Option 2: Manual UI Testing

1. **Open browser:** `http://localhost:3000/profile/platform-analytics`

2. **Login** if not already logged in

3. **Wait for platform data to load** (~5-10 seconds)
   - You should see 3 platform cards: TikTok, Twitter, Twitch
   - Each card has a blue "Sync" button at the bottom

4. **Open Network Tab** (F12 → Network)

5. **Click the "Sync" button** on TikTok card

6. **Watch for:**
   - Button text: "Syncing..." with spinning icon
   
7. **Check Network Tab:**
   - Find: POST request to `/social-sync/tiktok`
   - Click on it
   - Go to "Payload" or "Request" tab
   - **Verify it shows:**
     ```json
     {
       "follow": 95,
       "engagement": 0
     }
     ```
   - **NOT** `"followers": 95` (that was the bug)

8. **Check Response Tab:**
   - Should show status: `200 OK`
   - Response body:
     ```json
     {
       "success": true,
       "message": "Social media Tiktok synced successfully"
     }
     ```

9. **Check UI:**
   - Button should turn GREEN
   - Text should say: "✓ Synced!"
   - Toast notification: "Sync successful!"
   - After 3 seconds, button returns to blue "Sync"

---

### Option 3: Check Code Directly

Verify the fix was applied:

```bash
# Check the hook file
grep -n "follow:" src/hooks/features/useSocialSync.ts
```

Should show:
```
Line 23:        follow: platformData.followers,  // Backend expects "follow" field
Line 85:          follow: data.followers,  // Backend expects "follow" field
```

---

## Expected Results

### ✅ SUCCESS Indicators:
- HTTP 200 OK response
- Request payload has `"follow"` field (not `"followers"`)
- Toast shows: "Sync successful! TIKTOK data synced"
- Button turns green with checkmark
- No errors in console

### ❌ FAILURE Indicators:
- HTTP 400 Bad Request
- Error: "Validation failed"
- Request payload has `"followers"` field (old bug)
- Red error toast
- Console shows validation errors

---

## Troubleshooting

### If still seeing HTTP 400:

1. **Clear browser cache:**
   - Hard refresh: `Ctrl + Shift + R`
   - Or clear cache: DevTools → Application → Clear storage

2. **Verify code changes:**
   ```bash
   git log --oneline -1
   # Should show: "fix: change API field from 'followers' to 'follow'"
   ```

3. **Check if dev server restarted:**
   - Server should show compilation messages
   - Look for "Ready in X.Xs" in terminal

4. **Inspect actual request:**
   - DevTools → Network → POST social-sync/tiktok
   - Payload tab should show `"follow"` not `"followers"`

---

## Test All Platforms

After TikTok works, test the others:

1. **Twitter:**
   - Payload: `{ "follow": 12, "engagement": 272 }`
   - Endpoint: `/social-sync/twitter`

2. **Twitch:**
   - Payload: `{ "follow": 0, "engagement": 0 }`
   - Endpoint: `/social-sync/twitch`

---

## Success Confirmation

Once working, you should see in your profile:
- Updated `totalFollowers` count
- Platform breakdown with synced data
- Toast confirmations for each sync

The fix is complete and pushed to `feature-platform-api` branch! 🎉

