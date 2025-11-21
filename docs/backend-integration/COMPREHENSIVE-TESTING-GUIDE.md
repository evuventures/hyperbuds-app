# Comprehensive Testing Guide - Backend Integration Features

**Author**: Khaled Nasser  
**Date**: 2025-01-12  
**Scope**: Testing Google OAuth, 3-Day Token Session, and UploadThing Avatar Upload

---

## 📋 Pre-Testing Checklist

Before starting tests, verify the following:

- [ ] Dev server is running (`npm run dev`)
- [ ] `.env.local` file exists and contains:
  - [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - [ ] `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (should be `http://localhost:3000/auth/google-callback`)
  - [ ] `NEXT_PUBLIC_UPLOADTHING_TOKEN` (from UploadThing dashboard)
  - [ ] `UPLOADTHING_TOKEN` (same as above, for server-side)
  - [ ] `NEXT_PUBLIC_UPLOADTHING_APP_ID` (should be `np2flplp9c`)
- [ ] Google OAuth redirect URI configured in Google Console
- [ ] UploadThing account created and configured
- [ ] Browser DevTools open (F12) to monitor console and network requests

---

## 🧪 Test 1: Google Authentication (OAuth 2.0)

### Overview
Test the complete Google OAuth flow from login to token storage.

### Test Steps

#### Step 1: Navigate to Login Page
1. Open browser and go to: `http://localhost:3000/auth/signin`
2. **Verify**: Login page loads correctly
3. **Verify**: "Continue with Google" button is visible

#### Step 2: Initiate Google OAuth
1. Click "Continue with Google" button
2. **Expected**: Browser redirects to Google OAuth consent screen
3. **Verify**: Google login page displays correctly
4. **Verify**: Can see your Google account(s) listed

#### Step 3: Select Google Account
1. Select a Google account to use for login
2. **Expected**: Google redirects back to your app at `/auth/google-callback`
3. **Verify**: Page shows "Processing Google login..." message
4. **Verify**: Status updates to "Authenticating with backend..."
5. **Verify**: Status updates to "Login successful! Checking profile..."

#### Step 4: Verify Redirect and Token Storage
1. **Verify**: You are redirected to either:
   - `/dashboard` (if profile is complete)
   - `/profile/complete-profile` (if profile is incomplete)
2. Open Browser DevTools Console (F12)
3. Go to **Application** tab → **Local Storage** → `http://localhost:3000`
4. **Verify**: `accessToken` key exists with a JWT token value
5. Go to **Network** tab and check requests:
   - **Verify**: `POST /api/v1/auth/google` returns `200 OK`
   - **Verify**: `GET /api/v1/users/me` returns `200 OK`

#### Step 5: Verify User Logged In
1. **Verify**: User avatar/name appears in navigation (if implemented)
2. **Verify**: Dashboard or profile page loads correctly
3. Navigate to `/profile` or `/profile/edit`
4. **Verify**: Your profile information is displayed

### Expected Results
✅ All steps complete without errors  
✅ Token stored in `localStorage`  
✅ User redirected to appropriate page  
✅ Console shows no error messages  
✅ Network requests succeed with 200 status

### Failure Points to Watch
- ❌ Google consent screen doesn't appear (check redirect URI in Google Console)
- ❌ Error on `/auth/google-callback` page (check backend endpoint)
- ❌ `accessToken` not in localStorage (check backend response)
- ❌ Redirect fails (check profile completion logic)

---

## 🧪 Test 2: Auto-Logout Fix (3-Day Token Session)

### Overview
Test that users stay logged in for 3 days and sessions persist across browser restarts.

### Test Steps

#### Step 1: Login and Verify Token
1. Log in using Google OAuth (complete Test 1)
2. Open DevTools → **Application** → **Local Storage**
3. Copy the `accessToken` value
4. **Verify**: Token is a JWT string (starts with `eyJ...`)
5. **Verify**: Token exists and is valid

#### Step 2: Verify Session Persists Across Browser Restart
1. Close the browser tab completely
2. Close the browser application completely (optional but recommended)
3. Reopen browser
4. Navigate to `http://localhost:3000`
5. **Verify**: You are still logged in
6. **Verify**: You are NOT redirected to login page
7. Navigate to `/dashboard` or any protected route
8. **Verify**: Protected routes are accessible without re-login

#### Step 3: Verify Token Persists in LocalStorage
1. Open DevTools → **Application** → **Local Storage**
2. **Verify**: `accessToken` still exists
3. **Verify**: Token value is the same as before browser restart
4. Check token expiration (optional - decode JWT):
   - Go to https://jwt.io
   - Paste your token
   - Check `exp` field (should be ~3 days from now)

#### Step 4: Test Token Refresh Behavior (Should NOT Refresh)
1. Make an API request (navigate to any page that calls `/api/v1/users/me`)
2. Open **Network** tab
3. **Verify**: Request includes `Authorization: Bearer {token}` header
4. **Verify**: Same token is used (no new token generated)
5. **Verify**: No refresh token API calls are made

#### Step 5: Verify No Auto-Logout After 5 Minutes
1. Log in using Google OAuth
2. Wait for 5+ minutes without interacting with the app
3. **Verify**: You are still logged in after 5 minutes
4. **Verify**: No redirect to login page
5. Refresh the page (F5)
6. **Verify**: You remain logged in after refresh

### Expected Results
✅ Token persists across browser restarts  
✅ No auto-logout after 5 minutes  
✅ Token valid for 3 days (no refresh needed)  
✅ No refresh token logic executed  
✅ Protected routes remain accessible

### Failure Points to Watch
- ❌ Auto-logout after 5 minutes (backend token expiration not fixed)
- ❌ Token missing after browser restart (localStorage not persisting)
- ❌ Redirected to login after refresh (token validation failing)

### Additional Test: Manual Token Expiration (Optional)
1. Log in and copy `accessToken` from localStorage
2. Decode JWT at https://jwt.io
3. Note the `exp` (expiration) timestamp
4. Calculate when token expires (should be ~3 days from now)
5. **Expected**: Token will expire after 3 days (72 hours)
6. After expiration, backend should return `401 Unauthorized`
7. Frontend should clear token and redirect to login

---

## 🧪 Test 3: Profile Photo Upload (UploadThing Integration)

### Overview
Test the complete avatar upload flow from file selection to display.

### Test Steps

#### Step 1: Navigate to Profile Edit Page
1. Log in using Google OAuth (if not already logged in)
2. Navigate to `/profile/edit`
3. **Verify**: Profile edit page loads correctly
4. **Verify**: Avatar placeholder or current avatar is visible
5. **Verify**: Camera icon overlay appears on hover (if no avatar)

#### Step 2: Select Image File
1. Click on the avatar placeholder/circle
2. **Expected**: File picker dialog opens
3. Select an image file (JPG, PNG, GIF, or WebP)
4. **Verify**: File size is less than 5MB (if larger, should show error)
5. **Verify**: File type is valid (if invalid, should show error)

#### Step 3: Upload Image to UploadThing
1. After selecting file, **verify**: Upload status message appears
2. **Verify**: Status shows "Uploading image..."
3. Open **Network** tab in DevTools
4. **Verify**: `POST /api/uploadthing` request is made
5. **Verify**: Request returns `200 OK`
6. **Verify**: Response contains file URL (should be `https://np2flplp9c.ufs.sh/...`)

#### Step 4: Save Avatar URL to Backend
1. **Verify**: Status updates to "Saving to profile..."
2. **Verify**: `PUT /api/v1/profiles/me` request is made
3. **Verify**: Request body contains `{ "avatar": "https://..." }`
4. **Verify**: Request includes `Authorization: Bearer {token}` header
5. **Verify**: Response returns `200 OK`
6. **Verify**: Status shows "Profile picture uploaded successfully!"

#### Step 5: Verify Avatar Display
1. **Verify**: Avatar image appears immediately on edit page
2. **Verify**: Image loads from UploadThing CDN URL
3. **Verify**: No Next.js Image errors in console
4. Navigate to `/profile` (profile view page)
5. **Verify**: Avatar displays correctly on profile page
6. Refresh the page (F5)
7. **Verify**: Avatar persists after page refresh

#### Step 6: Verify Avatar Persists Across Sessions
1. Close browser tab
2. Reopen browser
3. Navigate to `http://localhost:3000/profile`
4. **Verify**: Avatar is still displayed
5. Navigate to `/profile/edit`
6. **Verify**: Avatar is displayed correctly in edit page

#### Step 7: Test Avatar Change (Update Existing Avatar)
1. Navigate to `/profile/edit`
2. Click on existing avatar
3. Select a different image file
4. **Verify**: New avatar uploads successfully
5. **Verify**: New avatar replaces old one
6. **Verify**: Old UploadThing URL is replaced in backend

### Expected Results
✅ Image uploads to UploadThing successfully  
✅ Avatar URL saved to backend  
✅ Avatar displays immediately after upload  
✅ Avatar persists across page refreshes  
✅ Avatar persists across browser sessions  
✅ Avatar can be changed/updated  
✅ No console errors related to Next.js Image

### Failure Points to Watch
- ❌ File picker doesn't open (click handler issue)
- ❌ Upload fails with "Missing token" error (check `.env.local`)
- ❌ Next.js Image error "hostname not configured" (restart server after `next.config.ts` update)
- ❌ Avatar not saving to backend (check API endpoint `/profiles/me`)
- ❌ Avatar not displaying on profile page (check ProfileCard component)

### File Size/Type Validation Tests
1. **Test Invalid File Type**:
   - Try uploading a `.pdf` or `.txt` file
   - **Expected**: Error message "Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed."
2. **Test Large File**:
   - Try uploading a file larger than 5MB
   - **Expected**: Error message "File size exceeds 5MB limit."

---

## 🔍 Advanced Testing: Network Request Verification

### Verify Google OAuth Flow Requests

1. **Before Login**:
   - Open DevTools → **Network** tab
   - Filter by `Fetch/XHR`
   - Navigate to `/auth/signin`

2. **During Login**:
   - Click "Continue with Google"
   - **Verify**: Redirect to `accounts.google.com`
   - **Verify**: Google OAuth consent screen loads

3. **After Account Selection**:
   - Select Google account
   - **Verify**: Redirect to `/auth/google-callback?code=...`
   - **Verify**: `POST /api/v1/auth/google` request with:
     - Method: `POST`
     - Headers: `Content-Type: application/json`
     - Body: `{ "code": "..." }`
     - Status: `200 OK`
   - **Verify**: Response contains `{ "accessToken": "...", "user": {...} }`

4. **After Authentication**:
   - **Verify**: `GET /api/v1/users/me` request with:
     - Headers: `Authorization: Bearer {token}`
     - Status: `200 OK`
   - **Verify**: Response contains user profile data

### Verify Avatar Upload Flow Requests

1. **Upload to UploadThing**:
   - Select image file
   - **Verify**: `POST /api/uploadthing` request
   - **Verify**: Request contains FormData with file
   - **Verify**: Response contains `{ url: "https://np2flplp9c.ufs.sh/..." }`

2. **Save to Backend**:
   - **Verify**: `PUT /api/v1/profiles/me` request with:
     - Headers: `Authorization: Bearer {token}`
     - Body: `{ "avatar": "https://..." }`
     - Status: `200 OK`
   - **Verify**: Response contains updated profile with avatar URL

3. **Fetch Profile**:
   - Navigate to `/profile`
   - **Verify**: `GET /api/v1/profiles/me` request
   - **Verify**: Response includes `avatar` field with UploadThing URL

---

## 📊 Testing Checklist Summary

### Google OAuth (Test 1)
- [ ] Login page loads correctly
- [ ] "Continue with Google" button works
- [ ] Google OAuth consent screen appears
- [ ] Can select Google account
- [ ] Redirects to `/auth/google-callback`
- [ ] Backend authentication succeeds
- [ ] Token stored in localStorage
- [ ] User redirected to dashboard/profile completion
- [ ] No console errors
- [ ] Network requests succeed

### 3-Day Token Session (Test 2)
- [ ] Token stored in localStorage
- [ ] Token persists after browser restart
- [ ] User remains logged in after 5+ minutes of inactivity
- [ ] User remains logged in after page refresh
- [ ] Protected routes accessible without re-login
- [ ] No refresh token logic executed
- [ ] Token valid for 3 days (check JWT expiration)

### Avatar Upload (Test 3)
- [ ] Avatar upload button works
- [ ] File picker opens
- [ ] File validation works (type and size)
- [ ] Upload to UploadThing succeeds
- [ ] Avatar URL saved to backend
- [ ] Avatar displays immediately after upload
- [ ] Avatar displays on profile page
- [ ] Avatar persists after page refresh
- [ ] Avatar persists after browser restart
- [ ] Can update/change avatar
- [ ] No Next.js Image errors

---

## 🐛 Common Issues and Solutions

### Issue: Google OAuth Redirect Not Working
**Symptoms**: Clicking "Continue with Google" doesn't redirect  
**Solution**: 
1. Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local`
2. Verify redirect URI in Google Console matches `http://localhost:3000/auth/google-callback`
3. Restart dev server after environment changes

### Issue: Token Not Persisting After Browser Restart
**Symptoms**: User logged out after closing browser  
**Solution**:
1. Check `localStorage` is not cleared by browser settings
2. Verify token is being stored: `localStorage.getItem('accessToken')`
3. Check if browser is in incognito/private mode (localStorage may not persist)

### Issue: Avatar Upload Fails with "Missing token"
**Symptoms**: UploadThing error about missing token  
**Solution**:
1. Verify `NEXT_PUBLIC_UPLOADTHING_TOKEN` is set in `.env.local`
2. Verify `UPLOADTHING_TOKEN` is also set (for server-side)
3. Restart dev server after adding environment variables
4. Check token is on a single line (no line breaks)

### Issue: Avatar Not Displaying (Next.js Image Error)
**Symptoms**: Error "hostname not configured under images"  
**Solution**:
1. Verify `next.config.ts` contains UploadThing domains:
   ```typescript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: '*.ufs.sh' },
       { protocol: 'https', hostname: 'utfs.io' },
     ],
   }
   ```
2. **Restart dev server** (critical - config changes require restart)

### Issue: Avatar Not Saving to Backend
**Symptoms**: Avatar uploads but doesn't persist  
**Solution**:
1. Check Network tab for `PUT /api/v1/profiles/me` request
2. Verify request includes `Authorization: Bearer {token}` header
3. Verify endpoint is `/profiles/me` (not `/users/me`)
4. Check backend logs for errors

---

## ✅ Testing Completion

After completing all three tests, you should have verified:

1. ✅ **Google OAuth**: Complete authentication flow works end-to-end
2. ✅ **3-Day Token**: Session persists correctly, no premature logouts
3. ✅ **Avatar Upload**: Image upload and display works correctly

If all tests pass, the implementation is **ready for production**! 🎉

---

## 📝 Test Report Template

Use this template to document your test results:

```
## Test Report - [Date]

### Test 1: Google OAuth
- Status: ✅ PASS / ❌ FAIL
- Issues Found: [List any issues]
- Screenshots: [Attach if needed]

### Test 2: 3-Day Token Session
- Status: ✅ PASS / ❌ FAIL
- Token Expiration: [Check JWT and note expiration time]
- Issues Found: [List any issues]

### Test 3: Avatar Upload
- Status: ✅ PASS / ❌ FAIL
- Avatar URL: [Copy UploadThing URL]
- Issues Found: [List any issues]

### Overall Status
- All Features: ✅ PASS / ⚠️ PARTIAL / ❌ FAIL
- Blockers: [List any critical issues]
- Notes: [Additional observations]
```

---

**Last Updated**: 2025-01-12  
**Documentation Version**: 1.0

