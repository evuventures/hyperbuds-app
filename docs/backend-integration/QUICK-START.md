# Quick Start Guide - Backend Integration Setup

Fast setup guide for Google OAuth and UploadThing integration.

---

## ⚡ Quick Setup (5 Minutes)

### 1. Create `.env.local` File

```bash
# Create file in project root
touch .env.local
```

### 2. Add Google OAuth Variables

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google-callback
```

### 3. Set Up UploadThing (3 Steps)

**Step 1**: Sign up at https://uploadthing.com/

**Step 2**: Create app and get API keys from dashboard

**Step 3**: Add to `.env.local`:
```env
UPLOADTHING_SECRET=sk_live_your_key_here
NEXT_PUBLIC_UPLOADTHING_APP_ID=your_app_id_here
```

### 4. Update Google OAuth Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth client: `265404811439-3a6feinek5pckg02bjg7mfrva4esuqh0...`
3. Add redirect URI: `http://localhost:3000/auth/google-callback`
4. Save

### 5. Restart Dev Server

```bash
npm run dev
```

### 6. Test

- **Google Login**: Go to `/auth/signin` → Click "Continue with Google"
- **Avatar Upload**: Go to `/profile/edit` → Click avatar → Upload image

---

## ✅ Verification Checklist

- [ ] `.env.local` file created with all variables
- [ ] UploadThing account created and keys added
- [ ] Google OAuth redirect URI added to console
- [ ] Dev server restarted
- [ ] Google login works
- [ ] Avatar upload works

---

## 🐛 Common Issues

**Google OAuth fails?**
- Check redirect URI matches exactly in Google Console

**UploadThing fails?**
- Verify API keys in `.env.local`
- Restart dev server after adding keys

**Token not persisting?**
- Check localStorage for `accessToken`
- Verify no refresh attempts on 401

---

For detailed testing guide, see: `docs/backend-integration/SETUP-AND-TESTING-GUIDE.md`

