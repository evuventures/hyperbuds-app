# Step-by-Step Setup Guide

Complete walkthrough to set up Google OAuth and UploadThing integration.

---

## ✅ Step 1: Environment Variables Setup

### 1.1: Check Current `.env.local` File

Your `.env.local` file should already exist. Open it and verify it contains:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback

# UploadThing Configuration
UPLOADTHING_SECRET=sk_live_...
NEXT_PUBLIC_UPLOADTHING_APP_ID=...
```

### 1.2: If `.env.local` is Missing

Create `.env.local` in the project root and add:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback

# UploadThing Configuration
# Get these from https://uploadthing.com/dashboard after creating an account
UPLOADTHING_SECRET=sk_live_your_secret_key_here
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_app_id_here

# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
```

---

## ✅ Step 2: UploadThing Account Setup

### 2.1: Create UploadThing Account

1. **Visit**: https://uploadthing.com/
2. **Click** "Sign Up" or "Get Started"
3. **Choose** sign-up method:
   - GitHub (recommended)
   - Email
   - Google

### 2.2: Create New App

1. **After signing up**, you'll see the dashboard
2. **Click** "Create App" or "New App"
3. **Enter** app name: `hyperbuds-app` (or your preference)
4. **Select** plan (Free tier is sufficient for testing)
5. **Click** "Create"

### 2.3: Get API Keys

1. **In your app dashboard**, navigate to:
   - **Settings** → **API Keys**, OR
   - **API Keys** section in sidebar

2. **You'll see two keys**:
   - **Secret Key** (`sk_live_...` or `sk_test_...`)
   - **App ID**

3. **Copy both keys**

### 2.4: Add Keys to `.env.local`

1. **Open** `.env.local` file
2. **Replace** the placeholder values:

```env
UPLOADTHING_SECRET=sk_live_abc123xyz...  # Paste your Secret Key here
NEXT_PUBLIC_UPLOADTHING_APP_ID=abc123xyz...  # Paste your App ID here
```

3. **Save** the file

---

## ✅ Step 3: Google OAuth Console Setup

### 3.1: Access Google Cloud Console

1. **Visit**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Select** the correct project from the dropdown at the top

### 3.2: Navigate to OAuth Credentials

1. **In the left sidebar**, click:
   - **APIs & Services** → **Credentials**

2. **Or** use this direct link:
   - https://console.cloud.google.com/apis/credentials

### 3.3: Find Your OAuth Client

1. **In the "OAuth 2.0 Client IDs" section**, find:
   - **Client ID**: `265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com`

2. **Click** on the client ID to edit it

### 3.4: Add Authorized Redirect URI

1. **Scroll down** to "Authorized redirect URIs" section

2. **Click** "Add URI" button

3. **Enter** the redirect URI:
   ```
   http://localhost:3000/auth/google-callback
   ```

4. **For production**, also add:
   ```
   https://app.hyperbuds.com/auth/google-callback
   ```

5. **Click** "Save" button

### 3.5: Verify OAuth Consent Screen

1. **Navigate to**: **APIs & Services** → **OAuth consent screen**

2. **Check**:
   - App is published or in testing mode
   - Required scopes: `email`, `profile` are included
   - Test users added (if in testing mode)

---

## ✅ Step 4: Restart Development Server

After updating `.env.local`, you **MUST** restart the dev server:

1. **Stop** the current dev server (if running)
   - Press `Ctrl + C` in the terminal

2. **Start** the dev server again:
   ```bash
   npm run dev
   ```

3. **Wait** for the server to start (you'll see "Ready on http://localhost:3000")

---

## ✅ Step 5: Testing Checklist

### Test 1: Google OAuth Login ✅

1. **Open** browser: http://localhost:3000/auth/signin

2. **Click** "Continue with Google" button

3. **Expected flow**:
   - ✅ Redirects to Google login page
   - ✅ After selecting account, redirects to `/auth/google-callback`
   - ✅ Shows "Processing Google login..." message
   - ✅ Redirects to dashboard or profile completion page

4. **Check**:
   - ✅ Browser console has no errors
   - ✅ Network tab shows successful API calls
   - ✅ localStorage contains `accessToken`

**If errors occur:**
- Check redirect URI matches Google Console exactly
- Verify `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` in `.env.local` is correct
- Restart dev server after changing `.env.local`

---

### Test 2: Session Persistence (3-Day Token) ✅

1. **Log in** using Google OAuth or email/password

2. **Check** localStorage:
   - Open DevTools → Application → Local Storage
   - Verify `accessToken` exists

3. **Test persistence**:
   - Close browser tab
   - Reopen and navigate to app
   - ✅ User should remain logged in

4. **Test 401 handling**:
   - Make any authenticated API request
   - If 401 occurs, verify:
     - ✅ Token is cleared from localStorage
     - ✅ User redirected to login page
     - ✅ No refresh token attempt made

---

### Test 3: UploadThing Avatar Upload - Profile Edit ✅

1. **Navigate** to profile edit page:
   - Log in → Go to `/profile/edit`

2. **Upload avatar**:
   - Click on avatar placeholder or "Change Photo" button
   - Select image file (JPG, PNG, GIF, WebP, < 5MB)
   - Wait for upload to complete

3. **Expected**:
   - ✅ Shows "Uploading image..." message
   - ✅ Shows "Saving to profile..." message
   - ✅ Avatar preview updates immediately
   - ✅ Success message displayed

4. **Verify**:
   - ✅ Refresh page → Avatar persists
   - ✅ Check Network tab → Upload successful
   - ✅ Check console → No errors

**If upload fails:**
- Verify `UPLOADTHING_SECRET` and `NEXT_PUBLIC_UPLOADTHING_APP_ID` in `.env.local`
- Check UploadThing dashboard → App is active
- Restart dev server after adding keys

---

### Test 4: UploadThing Avatar Upload - Complete Profile ✅

1. **Navigate** to complete profile page:
   - Log in with new account → Go to `/profile/complete-profile`

2. **Fill profile form**:
   - Enter username, bio, niches, etc.

3. **Upload avatar**:
   - Click on avatar placeholder
   - Select image file
   - Wait for upload

4. **Submit profile**:
   - Complete all fields
   - Click "Save" or "Complete Profile"

5. **Expected**:
   - ✅ Avatar uploads before profile submission
   - ✅ Avatar URL included in profile data
   - ✅ Profile created successfully
   - ✅ Avatar displays correctly

---

### Test 5: Error Handling ✅

1. **Test large file upload** (> 5MB):
   - ✅ Should show error: "File size exceeds 5MB limit."

2. **Test invalid file type** (PDF, etc.):
   - ✅ Should show error: "Invalid file type..."

3. **Test Google OAuth denial**:
   - ✅ Should redirect back with error message

4. **Test network error**:
   - ✅ Should show user-friendly error message

---

## 🐛 Troubleshooting

### Issue: Google OAuth Redirect URI Mismatch

**Error**: `redirect_uri_mismatch`

**Solution**:
1. Open `.env.local`
2. Copy the exact redirect URI value
3. Go to Google Console → OAuth Client → Authorized redirect URIs
4. Ensure URI matches exactly (no trailing slash, correct protocol)
5. Save and wait 1-2 minutes for changes to propagate

---

### Issue: UploadThing Upload Fails

**Error**: `401 Unauthorized` or `Invalid API key`

**Solution**:
1. Verify keys in `.env.local`:
   - `UPLOADTHING_SECRET` should start with `sk_live_` or `sk_test_`
   - `NEXT_PUBLIC_UPLOADTHING_APP_ID` should not be empty
2. Restart dev server after adding/updating keys
3. Check UploadThing dashboard → App is active
4. Verify keys match the app in dashboard

---

### Issue: Token Not Persisting

**Symptoms**: User logged out after refresh

**Solution**:
1. Open DevTools → Application → Local Storage
2. Check if `accessToken` exists
3. If missing, check `google-callback/page.tsx` stores token correctly
4. Verify no 401 errors in Network tab
5. Check backend token expiration is 3 days

---

### Issue: Environment Variables Not Loading

**Symptoms**: Values are undefined in code

**Solution**:
1. Restart dev server after changing `.env.local`
2. Verify variable names start with `NEXT_PUBLIC_` for client-side access
3. Check for typos in variable names
4. Ensure `.env.local` is in project root (not in subdirectories)

---

## 📋 Final Verification Checklist

Before considering setup complete:

- [ ] `.env.local` file exists with all variables
- [ ] UploadThing account created and app configured
- [ ] UploadThing API keys added to `.env.local`
- [ ] Google OAuth redirect URI added to Google Console
- [ ] Dev server restarted after environment changes
- [ ] Google OAuth login works end-to-end
- [ ] Token persists after browser refresh
- [ ] Avatar upload works on profile edit page
- [ ] Avatar upload works on complete profile page
- [ ] Error handling works correctly
- [ ] No console errors during testing

---

## 📚 Additional Resources

- **UploadThing Docs**: https://docs.uploadthing.com/
- **UploadThing Dashboard**: https://uploadthing.com/dashboard
- **Google OAuth Console**: https://console.cloud.google.com/apis/credentials
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## 🎯 Next Steps

After successful setup and testing:

1. **Update production environment variables** (if deploying)
2. **Monitor logs** for errors during usage
3. **Test on different browsers/devices**
4. **User acceptance testing** with real users

---

**Last Updated**: 2025-01-12  
**Status**: Ready for Setup ✅

