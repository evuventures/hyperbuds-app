# Testing Checklist - Backend Integration

Use this checklist to verify all implementations are working correctly.

---

## 🔧 Pre-Testing Setup

- [ ] `.env.local` file exists in project root
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- [ ] `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` is set in `.env.local`
- [ ] `UPLOADTHING_SECRET` is set in `.env.local` (not placeholder)
- [ ] `NEXT_PUBLIC_UPLOADTHING_APP_ID` is set in `.env.local` (not placeholder)
- [ ] UploadThing account created at https://uploadthing.com/
- [ ] UploadThing app created and API keys obtained
- [ ] Google OAuth redirect URI added to Google Console
- [ ] Dev server restarted after environment changes

---

## ✅ Test 1: Google OAuth Login

### Setup
- [ ] Dev server running (`npm run dev`)
- [ ] Browser opened to http://localhost:3000

### Test Steps
1. [ ] Navigate to `/auth/signin`
2. [ ] Verify "Continue with Google" button is visible
3. [ ] Click "Continue with Google" button

### Expected Results
- [ ] Redirects to Google OAuth consent screen
- [ ] Google login page loads correctly
- [ ] Can select Google account
- [ ] After selecting account, redirects to `/auth/google-callback`
- [ ] Shows "Processing Google login..." message
- [ ] Redirects to dashboard or profile completion page

### Verification
- [ ] Browser console has no errors
- [ ] Network tab shows `POST /api/v1/auth/google` with status `200`
- [ ] Network tab shows `GET /api/v1/users/me` with status `200`
- [ ] `localStorage` contains `accessToken` key
- [ ] User is logged in (avatar/nav shows user info)

---

## ✅ Test 2: Session Persistence (3-Day Token)

### Setup
- [ ] User logged in (from Test 1)

### Test Steps
1. [ ] Check `localStorage` for `accessToken`
2. [ ] Verify token exists as JWT string
3. [ ] Close browser tab/window
4. [ ] Reopen browser
5. [ ] Navigate to http://localhost:3000

### Expected Results
- [ ] `accessToken` exists in `localStorage`
- [ ] User remains logged in after browser restart
- [ ] No redirect to login page
- [ ] User profile/nav shows correctly

### Test 401 Handling (Optional)
1. [ ] Make authenticated API request (e.g., navigate to protected page)
2. [ ] If 401 occurs (simulate expired token), verify:
   - [ ] Token is cleared from `localStorage`
   - [ ] User redirected to login page
   - [ ] No refresh token attempt made (check Network tab)

---

## ✅ Test 3: UploadThing Avatar Upload - Profile Edit

### Setup
- [ ] User logged in
- [ ] Navigate to `/profile/edit`

### Test Steps
1. [ ] Find avatar placeholder or "Change Photo" button
2. [ ] Click on avatar/button
3. [ ] File picker opens
4. [ ] Select image file (JPG, PNG, GIF, or WebP, < 5MB)
5. [ ] Wait for upload to complete

### Expected Results
- [ ] File picker opens correctly
- [ ] Shows "Uploading image..." message during upload
- [ ] Shows "Saving to profile..." message
- [ ] Avatar preview updates immediately
- [ ] Success message displayed: "Profile picture uploaded successfully!"

### Verification
- [ ] Network tab shows `POST /api/uploadthing/avatar` with status `200`
- [ ] Network tab shows `PUT /api/v1/users/me` with status `200`
- [ ] UploadThing returns CDN URL (check response)
- [ ] Avatar URL saved to backend (check request payload)
- [ ] Refresh page → Avatar persists and displays correctly
- [ ] Browser console has no errors

---

## ✅ Test 4: UploadThing Avatar Upload - Complete Profile

### Setup
- [ ] User logged in (new account or account without complete profile)
- [ ] Navigate to `/profile/complete-profile`

### Test Steps
1. [ ] Fill profile form (username, bio, niches, etc.)
2. [ ] Click on avatar placeholder
3. [ ] Select image file
4. [ ] Wait for upload
5. [ ] Complete all required fields
6. [ ] Click "Save" or "Complete Profile"

### Expected Results
- [ ] Avatar uploads successfully before profile submission
- [ ] Shows upload progress messages
- [ ] Avatar preview updates
- [ ] Profile submission includes avatar URL
- [ ] Profile created/updated successfully
- [ ] Avatar displays correctly after submission

### Verification
- [ ] Network tab shows successful upload request
- [ ] Network tab shows profile creation/update with avatar URL
- [ ] Avatar URL included in profile data payload
- [ ] Avatar displays on profile after completion
- [ ] No errors in console

---

## ✅ Test 5: Error Handling

### Test 5.1: Large File Upload
- [ ] Try uploading file > 5MB
- [ ] Expected: Error message "File size exceeds 5MB limit."
- [ ] Upload should not proceed

### Test 5.2: Invalid File Type
- [ ] Try uploading PDF or other non-image file
- [ ] Expected: Error message about invalid file type
- [ ] Upload should not proceed

### Test 5.3: Google OAuth Denial
- [ ] Click "Continue with Google"
- [ ] On Google consent screen, click "Cancel" or deny
- [ ] Expected: Redirected back to login with error message
- [ ] User should not be logged in

### Test 5.4: Network Error
- [ ] Disable network connection
- [ ] Try to log in with Google
- [ ] Expected: Error message displayed (no crash)
- [ ] App should handle error gracefully

### Test 5.5: Missing UploadThing Configuration
- [ ] Temporarily remove `UPLOADTHING_SECRET` from `.env.local`
- [ ] Restart dev server
- [ ] Try to upload avatar
- [ ] Expected: Error message displayed
- [ ] Upload should fail gracefully

---

## ✅ Test 6: Edge Cases

### Test 6.1: Multiple Avatar Uploads
- [ ] Upload avatar on profile edit page
- [ ] Verify upload succeeds
- [ ] Upload different avatar
- [ ] Verify new avatar replaces old one
- [ ] Verify old avatar URL is replaced in backend

### Test 6.2: Avatar on New Account
- [ ] Create new account via Google OAuth
- [ ] Complete profile with avatar
- [ ] Verify avatar uploads and saves correctly
- [ ] Verify avatar displays after profile completion

### Test 6.3: Token Expiration Simulation
- [ ] Log in successfully
- [ ] Manually remove `accessToken` from `localStorage`
- [ ] Navigate to protected page
- [ ] Expected: Redirected to login page
- [ ] No errors in console

---

## 🐛 Troubleshooting Checklist

If any test fails, check:

### Google OAuth Issues
- [ ] Redirect URI in `.env.local` matches Google Console exactly
- [ ] Redirect URI added in Google Console → OAuth Client
- [ ] No trailing slashes in redirect URI
- [ ] Google OAuth consent screen is published or in testing mode
- [ ] Test users added (if in testing mode)

### UploadThing Issues
- [ ] `UPLOADTHING_SECRET` is set in `.env.local`
- [ ] `NEXT_PUBLIC_UPLOADTHING_APP_ID` is set in `.env.local`
- [ ] API keys are not placeholders
- [ ] Dev server restarted after adding keys
- [ ] UploadThing app is active in dashboard
- [ ] Secret key starts with `sk_live_` or `sk_test_`

### Session Issues
- [ ] Token stored in `localStorage` after login
- [ ] Token persists after browser refresh
- [ ] No 401 errors in Network tab (unless token expired)
- [ ] No refresh token attempts on 401

### General Issues
- [ ] Dev server restarted after changing `.env.local`
- [ ] Browser console has no errors
- [ ] Network requests show correct status codes
- [ ] Environment variables loaded correctly (check `process.env`)

---

## 📊 Test Results Summary

### Overall Status
- [ ] ✅ All tests passing
- [ ] ⚠️ Some tests failing (see notes below)
- [ ] ❌ Critical issues found

### Notes
_Record any issues or observations here:_

---

## ✅ Sign-Off

- **Tester**: _____________________
- **Date**: _____________________
- **Status**: ☐ Ready for Production ☐ Needs Fixes
- **Notes**: _____________________

---

**Last Updated**: 2025-01-12

