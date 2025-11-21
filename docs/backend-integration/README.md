# Backend Integration - Documentation

Complete documentation for Google OAuth, UploadThing, and session management integration.

---

## 📚 Documentation Index

### 🚀 Quick Start
- **[QUICK-START.md](./QUICK-START.md)** - 5-minute setup guide

### 📖 Detailed Guides
- **[STEP-BY-STEP-SETUP.md](./STEP-BY-STEP-SETUP.md)** - Complete walkthrough with screenshots and troubleshooting
- **[SETUP-AND-TESTING-GUIDE.md](./SETUP-AND-TESTING-GUIDE.md)** - Comprehensive setup and testing guide

---

## 🎯 What's Included

This integration implements:

1. **Google OAuth Authentication**
   - OAuth 2.0 flow with authorization code exchange
   - Automatic user creation/login
   - Token-based session management

2. **UploadThing Avatar Upload**
   - Profile picture upload system
   - Direct CDN integration
   - No AWS S3 configuration needed

3. **Extended Session Duration**
   - 3-day token expiration
   - No refresh logic needed
   - Persistent sessions across browser restarts

---

## ⚡ Quick Setup (5 Steps)

1. **Check `.env.local`** - Verify Google OAuth variables are set
2. **Create UploadThing account** - Sign up at https://uploadthing.com/
3. **Add UploadThing keys** - Copy keys from dashboard to `.env.local`
4. **Update Google Console** - Add redirect URI: `http://localhost:3000/auth/google-callback`
5. **Restart dev server** - `npm run dev`

👉 **See [QUICK-START.md](./QUICK-START.md) for detailed instructions**

---

## 🧪 Testing

### Test Google OAuth
1. Go to `/auth/signin`
2. Click "Continue with Google"
3. Select Google account
4. Verify redirect and login

### Test Avatar Upload
1. Go to `/profile/edit`
2. Click avatar placeholder
3. Upload image file
4. Verify avatar updates and persists

### Test Session Persistence
1. Log in with Google
2. Close browser tab
3. Reopen and navigate to app
4. Verify user remains logged in

👉 **See [SETUP-AND-TESTING-GUIDE.md](./SETUP-AND-TESTING-GUIDE.md) for complete testing guide**

---

## 🐛 Troubleshooting

### Google OAuth Issues
- **Redirect URI mismatch**: Check `.env.local` matches Google Console
- **401 errors**: Verify token expiration is 3 days on backend

### UploadThing Issues
- **401 Unauthorized**: Verify API keys in `.env.local`
- **Upload fails**: Check file size (< 5MB) and file type

### Session Issues
- **Token not persisting**: Check localStorage for `accessToken`
- **Auto-logout**: Verify no refresh attempts on 401

👉 **See [STEP-BY-STEP-SETUP.md](./STEP-BY-STEP-SETUP.md) for detailed troubleshooting**

---

## 📁 File Structure

### Frontend Files
```
src/
├── app/
│   ├── auth/
│   │   └── google-callback/
│   │       └── page.tsx          # OAuth callback handler
│   └── api/
│       └── uploadthing/
│           ├── core.ts           # UploadThing file router
│           └── route.ts          # UploadThing API route
├── lib/
│   ├── api/
│   │   ├── auth.api.ts           # Google auth API service
│   │   ├── client.ts             # Axios client with 401 handling
│   │   └── profile.api.ts        # Profile API with avatar update
│   └── utils/
│       ├── api.ts                # API utilities (no refresh logic)
│       └── uploadthing.ts        # UploadThing upload helper
└── components/
    └── auth/
        ├── LoginForm.tsx         # Login with Google OAuth
        └── RegisterForm.tsx      # Register with Google OAuth
```

---

## 🔑 Environment Variables

Required variables in `.env.local`:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback

# UploadThing
UPLOADTHING_SECRET=sk_live_your_secret_key_here
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_app_id_here
```

---

## 📝 Implementation Summary

### Google OAuth Flow
1. User clicks "Continue with Google"
2. Redirects to Google OAuth consent screen
3. User selects Google account
4. Google redirects to `/auth/google-callback` with authorization code
5. Frontend sends code to backend `/api/v1/auth/google`
6. Backend exchanges code for user data and creates session
7. Frontend receives token and stores in localStorage
8. User redirected to dashboard or profile completion

### UploadThing Avatar Upload Flow
1. User selects image file
2. Frontend uploads file to UploadThing via `/api/uploadthing/avatar`
3. UploadThing returns CDN URL
4. Frontend sends URL to backend `/api/v1/users/me` with `{ avatar: url }`
5. Backend saves URL to user profile
6. Frontend updates avatar display immediately

### Session Management
1. Token stored in localStorage after login
2. Token included in all API requests via Authorization header
3. Token valid for 3 days (no refresh needed)
4. On 401 error: token cleared, user redirected to login
5. No refresh token attempts

---

## 🎓 Resources

- **UploadThing Docs**: https://docs.uploadthing.com/
- **UploadThing Dashboard**: https://uploadthing.com/dashboard
- **Google OAuth Console**: https://console.cloud.google.com/apis/credentials
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2

---

## ✅ Status

- ✅ Google OAuth implementation complete
- ✅ UploadThing integration complete
- ✅ Session management (3-day tokens) complete
- ✅ Error handling implemented
- ✅ Testing guides created

**Ready for testing once environment variables are configured!**

---

**Last Updated**: 2025-01-12

