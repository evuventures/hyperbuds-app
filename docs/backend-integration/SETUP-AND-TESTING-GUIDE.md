# Backend Integration - Setup & Testing Guide

Complete guide for setting up Google OAuth, UploadThing, and testing all implementations.

---

## 📋 Table of Contents

1. [Environment Variables Setup](#1-environment-variables-setup)
2. [UploadThing Configuration](#2-uploadthing-configuration)
3. [Google OAuth Console Setup](#3-google-oauth-console-setup)
4. [Testing Guide](#4-testing-guide)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Environment Variables Setup

### Step 1.1: Create `.env.local` File

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```bash
# Copy the example file
cp .env.local.example .env.local
```

### Step 1.2: Configure Google OAuth Variables

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback
```

**For Production:**
```env
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://app.hyperbuds.com/auth/google-callback
```

### Step 1.3: Configure UploadThing Variables

**⚠️ You'll get these after setting up UploadThing (see Section 2):**

```env
UPLOADTHING_SECRET=sk_live_...  # Server-side secret
NEXT_PUBLIC_UPLOADTHING_APP_ID=...  # Client-side app ID
```

---

## 2. UploadThing Configuration

### Step 2.1: Create UploadThing Account

1. **Visit**: https://uploadthing.com/
2. **Sign Up** or **Log In** with your preferred method (GitHub, Email, etc.)
3. **Create a New App**:
   - Click "Create App" or "New App"
   - Name it: `hyperbuds-app` (or your preference)
   - Select plan (Free tier is sufficient for testing)

### Step 2.2: Get API Keys

1. **Go to Dashboard**: https://uploadthing.com/dashboard
2. **Select your app** from the list
3. **Navigate to "API Keys"** or "Settings" section
4. **Copy the following**:
   - **Secret Key** (`sk_live_...`) → This is `UPLOADTHING_SECRET`
   - **App ID** → This is `NEXT_PUBLIC_UPLOADTHING_APP_ID`

### Step 2.3: Add Keys to `.env.local`

```env
UPLOADTHING_SECRET=sk_live_abc123xyz...
NEXT_PUBLIC_UPLOADTHING_APP_ID=abc123xyz...
```

### Step 2.4: Configure UploadThing File Router (Already Done ✅)

The file router is already configured in:
- `src/app/api/uploadthing/core.ts` - File router with `avatar` endpoint
- `src/app/api/uploadthing/route.ts` - Route handler

**No changes needed** - it's ready to use!

---

## 3. Google OAuth Console Setup

### Step 3.1: Access Google Cloud Console

1. **Visit**: https://console.cloud.google.com/
2. **Select Project**: Use existing project or create new one
3. **Navigate to**: **APIs & Services** → **Credentials**

### Step 3.2: Find Your OAuth 2.0 Client

1. **Locate** your OAuth 2.0 Client ID: `265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com`
2. **Click** on it to edit

### Step 3.3: Add Authorized Redirect URIs

1. **Scroll to** "Authorized redirect URIs" section
2. **Click** "Add URI"
3. **Add the following URIs**:

   **For Development:**
   ```
   http://localhost:3000/auth/google-callback
   ```

   **For Production:**
   ```
   https://app.hyperbuds.com/auth/google-callback
   ```

4. **Click** "Save"

### Step 3.4: Verify OAuth Consent Screen

1. **Navigate to**: **APIs & Services** → **OAuth consent screen**
2. **Verify**:
   - App is published or in testing mode
   - Scopes: `email` and `profile` are configured
   - Test users added (if in testing mode)

---

## 4. Testing Guide

### Prerequisites

- ✅ Environment variables configured in `.env.local`
- ✅ UploadThing account created and API keys added
- ✅ Google OAuth redirect URI added to Google Console
- ✅ Development server running: `npm run dev`

---

### Test 1: Google OAuth Login Flow

#### Steps:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Login Page**:
   - Open: http://localhost:3000/auth/signin
   - Or: http://localhost:3000/auth/register

3. **Click "Continue with Google"** button

4. **Expected Behavior**:
   - ✅ Redirects to Google OAuth consent screen
   - ✅ After selecting Google account, redirects to `/auth/google-callback`
   - ✅ Shows "Processing Google login..." message
   - ✅ Redirects to dashboard or profile completion page

5. **Verify**:
   - ✅ Check browser console for errors
   - ✅ Check Network tab for successful API calls:
     - `POST /api/v1/auth/google` → Should return `200` with `accessToken`
     - `GET /api/v1/users/me` → Should return user profile
   - ✅ Check localStorage: `accessToken` should be stored
   - ✅ Check if user is redirected correctly

#### What to Look For:

- **Success**: Token stored, user logged in, redirected to dashboard/profile
- **Error**: Check console for error messages, verify redirect URI matches

---

### Test 2: Session Management (3-Day Token)

#### Steps:

1. **Log in** via Google OAuth or email/password

2. **Verify Token Storage**:
   - Open DevTools → Application → Local Storage
   - Check for `accessToken` key
   - Token should be stored as a JWT string

3. **Test Token Persistence**:
   - Close browser tab/window
   - Reopen and navigate to app
   - **Expected**: User should remain logged in

4. **Test Token Expiry Handling**:
   - Note: Tokens now last 3 days (cannot test expiry immediately)
   - If you get a 401 error, verify:
     - ✅ Token is cleared from localStorage
     - ✅ User is redirected to login page
     - ✅ No refresh attempt is made

5. **Test No Refresh Logic**:
   - Open DevTools → Network tab
   - Make any authenticated API request
   - If request returns `401`:
     - ✅ Verify NO request to `/api/v1/auth/refresh`
     - ✅ Verify token is cleared immediately
     - ✅ Verify redirect to login

#### What to Look For:

- **Success**: Token persists across sessions, 401 errors handled gracefully
- **Error**: If refresh attempts occur, check `src/lib/utils/api.ts` and `src/lib/api/client.ts`

---

### Test 3: UploadThing Avatar Upload - Profile Edit Page

#### Steps:

1. **Navigate to Profile Edit**:
   - Log in to the app
   - Go to: `/profile/edit` or find "Edit Profile" button

2. **Upload Avatar**:
   - Click on avatar placeholder or "Choose Photo" button
   - Select an image file (JPG, PNG, GIF, WebP)
   - **File Requirements**:
     - Size: < 5MB
     - Format: JPG, PNG, GIF, or WebP

3. **Expected Behavior**:
   - ✅ File picker opens
   - ✅ After selecting file, shows "Uploading image..." message
   - ✅ Shows "Saving to profile..." message
   - ✅ Avatar preview updates immediately
   - ✅ Success message: "Profile picture uploaded successfully!"

4. **Verify Upload**:
   - Check Network tab for:
     - `POST /api/uploadthing/avatar` → Should return `200` with file URL
     - `PUT /api/v1/users/me` → Should return `200` with updated profile
   - Check browser console for UploadThing URL (should be CDN URL)
   - Refresh page → Avatar should persist

5. **Test Error Handling**:
   - Try uploading file > 5MB → Should show error
   - Try uploading non-image file → Should show error
   - Check error messages are user-friendly

#### What to Look For:

- **Success**: Avatar uploads to UploadThing, URL saved to backend, avatar persists on refresh
- **Error**: Check console for UploadThing errors, verify API keys are set

---

### Test 4: UploadThing Avatar Upload - Complete Profile Page

#### Steps:

1. **Navigate to Complete Profile**:
   - Log in with new account or account without complete profile
   - Go to: `/profile/complete-profile`

2. **Fill Profile Form**:
   - Enter username, display name, bio, etc.
   - Select niches

3. **Upload Avatar**:
   - Click on avatar placeholder
   - Select image file (same requirements as Test 3)

4. **Submit Profile**:
   - Complete all required fields
   - Click "Save" or "Complete Profile"

5. **Expected Behavior**:
   - ✅ Shows "Uploading image to UploadThing..." message
   - ✅ Shows "Creating your profile..." message
   - ✅ Avatar URL included in profile submission
   - ✅ Profile created/updated successfully
   - ✅ Avatar displays correctly after submission

6. **Verify**:
   - Check Network tab for upload and profile update requests
   - Check that avatar URL is sent to backend in profile data
   - Verify avatar displays in profile after completion

#### What to Look For:

- **Success**: Avatar uploads before profile submission, URL included in profile data
- **Error**: If avatar fails, profile should still save (check error handling)

---

### Test 5: Edge Cases & Error Handling

#### Test 5.1: Google OAuth Denied

1. Click "Continue with Google"
2. On Google consent screen, click "Cancel" or deny access
3. **Expected**: Redirected back to login with error message

#### Test 5.2: Network Errors

1. Disable network connection
2. Try to log in with Google
3. **Expected**: Error message displayed, no crash

#### Test 5.3: Invalid UploadThing Configuration

1. Temporarily remove `UPLOADTHING_SECRET` from `.env.local`
2. Try to upload avatar
3. **Expected**: Error message displayed, upload fails gracefully

#### Test 5.4: Large File Upload

1. Try uploading file > 5MB
2. **Expected**: Error message: "File size exceeds 5MB limit."

#### Test 5.5: Invalid File Type

1. Try uploading PDF or other non-image file
2. **Expected**: Error message: "Invalid file type..."

---

## 5. Troubleshooting

### Issue 1: Google OAuth Redirect URI Mismatch

**Error**: `redirect_uri_mismatch`

**Solution**:
1. Verify redirect URI in `.env.local` matches Google Console
2. Check that URI is added in Google Console → OAuth Client → Authorized redirect URIs
3. For localhost, use: `http://localhost:3000/auth/google-callback`
4. Make sure no trailing slashes

---

### Issue 2: UploadThing Upload Fails

**Error**: `401 Unauthorized` or `Invalid API key`

**Solution**:
1. Verify `UPLOADTHING_SECRET` is set in `.env.local`
2. Verify `NEXT_PUBLIC_UPLOADTHING_APP_ID` is set
3. Restart dev server after adding environment variables
4. Check UploadThing dashboard → API Keys are active
5. Ensure secret key starts with `sk_live_` or `sk_test_`

---

### Issue 3: Token Not Persisting

**Symptoms**: User logged out after refresh

**Solution**:
1. Check localStorage: `localStorage.getItem('accessToken')`
2. Verify token is being stored in `google-callback/page.tsx`
3. Check for 401 errors in Network tab
4. Verify backend token expiration is set to 3 days

---

### Issue 4: Avatar Not Saving to Backend

**Symptoms**: Avatar uploads to UploadThing but doesn't persist

**Solution**:
1. Check Network tab for `PUT /api/v1/users/me` request
2. Verify request includes `avatar` field in body
3. Check backend endpoint accepts `PUT /api/v1/users/me` with `{ avatar: url }`
4. Check browser console for backend errors

---

### Issue 5: 401 Errors Triggering Refresh

**Symptoms**: Still seeing refresh token attempts

**Solution**:
1. Check `src/lib/utils/api.ts` - refresh logic should be removed
2. Check `src/lib/api/client.ts` - should only clear token on 401
3. Verify `src/hooks/auth/useAuth.ts` - `refreshSession()` is deprecated

---

## 6. Quick Test Checklist

### Google OAuth
- [ ] Login page shows "Continue with Google" button
- [ ] Clicking button redirects to Google
- [ ] Selecting account redirects to callback page
- [ ] Callback page processes and stores token
- [ ] User redirected to dashboard/profile page
- [ ] Token persists after browser refresh
- [ ] Denying OAuth shows error message

### Session Management
- [ ] Token stored in localStorage
- [ ] Token persists across browser sessions
- [ ] 401 errors clear token and redirect to login
- [ ] No refresh token attempts on 401

### UploadThing Avatar Upload
- [ ] Profile Edit page: Upload works
- [ ] Complete Profile page: Upload works
- [ ] Avatar preview updates immediately
- [ ] Avatar persists after page refresh
- [ ] Error handling works (large file, wrong type)
- [ ] UploadThing CDN URL is returned
- [ ] Avatar URL saved to backend

---

## 7. Next Steps After Testing

1. **Update Production Environment Variables**:
   - Set production Google OAuth redirect URI
   - Set production UploadThing keys (if different)

2. **Monitor Logs**:
   - Check browser console for errors
   - Check network requests for failures
   - Check UploadThing dashboard for upload stats

3. **User Testing**:
   - Test with different Google accounts
   - Test with different image sizes/types
   - Test on different browsers/devices

---

## 8. Support & Resources

### UploadThing
- **Documentation**: https://docs.uploadthing.com/
- **Dashboard**: https://uploadthing.com/dashboard
- **Support**: Check UploadThing docs for troubleshooting

### Google OAuth
- **Console**: https://console.cloud.google.com/
- **Documentation**: https://developers.google.com/identity/protocols/oauth2

### Backend API
- **Base URL**: `https://api-hyperbuds-backend.onrender.com`
- **Endpoints**:
  - `POST /api/v1/auth/google` - Google OAuth
  - `PUT /api/v1/users/me` - Update avatar URL

---

## Notes

- **Environment variables** must be set before starting dev server
- **Restart dev server** after changing `.env.local` file
- **Google OAuth** redirect URI must match exactly (including protocol)
- **UploadThing** keys are environment-specific (dev vs production)
- **Tokens** now last 3 days - no refresh logic needed

---

**Last Updated**: 2025-01-12
**Status**: Ready for Testing ✅

