# Environment Variables Setup Guide

This document explains the environment variables used in the Hyperbuds frontend application.

## Files Created

1. **`.env.local`** - Your local environment variables (not committed to git)
2. **`.env.example`** - Template file for reference (can be committed)
3. **Updated `src/config/baseUrl.ts`** - Now uses environment variables
4. **Updated `src/hooks/socket/useSocket.ts`** - Now uses environment variables

## Environment Variables

### Backend API Configuration

```env
NEXT_PUBLIC_BASE_URL=https://api-hyperbuds-backend.onrender.com
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
```

- **Purpose**: Base URL for backend API calls
- **Used in**: `src/config/baseUrl.ts`
- **Note**: `NEXT_PUBLIC_` prefix makes it available in the browser

### Google OAuth

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=253158885695-eiacv1vl5cjgpt0g9lf63o3sn2f3pjuu.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://api-hyperbuds-backend.onrender.com/api/v1/auth/google/callback
```

- **Purpose**: Google OAuth authentication
- **Source**: From backend `.env` file
- **Note**: Client ID is safe to expose in frontend

### UploadThing Configuration

```env
NEXT_PUBLIC_UPLOADTHING_TOKEN=your_token_here
UPLOADTHING_SECRET=your_secret_here
```

- **Purpose**: File upload service
- **Setup**: Get from https://uploadthing.com/dashboard
- **Note**: `UPLOADTHING_SECRET` is server-side only (not exposed to browser)

### Abstract API

```env
NEXT_PUBLIC_ABSTRACT_API_KEY=your_key_here
```

- **Purpose**: Location services (IP geolocation)
- **Used in**: `src/app/profile/complete-profile/page.jsx`
- **Setup**: Get from https://www.abstractapi.com/

### Socket URL

```env
NEXT_PUBLIC_SOCKET_URL=https://api-hyperbuds-backend.onrender.com
```

- **Purpose**: WebSocket connection for real-time features
- **Used in**: `src/hooks/socket/useSocket.ts`, `src/lib/socket/notificationSocket.ts`

### Frontend URL

```env
NEXT_PUBLIC_FRONTEND_URL=https://hyperbuds-frontend.vercel.app
```

- **Purpose**: Frontend application URL
- **Used for**: CORS, redirects, etc.

### Environment

```env
NODE_ENV=development
```

- **Purpose**: Environment mode (development/production)
- **Note**: Automatically set by Next.js in production

## Variables NOT Included (Backend Only)

These should **NEVER** be in the frontend `.env.local`:

- ❌ `JWT_ACCESS_SECRET` - Backend only
- ❌ `JWT_REFRESH_SECRET` - Backend only
- ❌ `JWT_RESET_SECRET` - Backend only
- ❌ `MONGO_URI` - Backend only
- ❌ `REDIS_HOST`, `REDIS_PASSWORD`, `REDIS_USERNAME` - Backend only
- ❌ `BREVO_API_KEY` - Backend only
- ❌ `SMTP_*` variables - Backend only
- ❌ `STRIPE_SECRET_KEY` - Backend only (use publishable key if needed)
- ❌ `SOCIALDATA_API_KEY` - Backend only
- ❌ `OPENAI_API_KEY` - Backend only

## Usage in Code

### Accessing Environment Variables

```typescript
// ✅ Correct - Client-side (browser)
const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

// ❌ Wrong - Server-side only (won't work in browser)
const secret = process.env.SECRET_KEY; // undefined in browser
```

### Example: Using BASE_URL

```typescript
import { BASE_URL } from '@/config/baseUrl';

const response = await fetch(`${BASE_URL}/api/v1/profiles/me`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Setup Instructions

1. **Copy `.env.example` to `.env.local`**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the values** in `.env.local`:
   - Update Google OAuth credentials (already filled from backend)
   - Add UploadThing credentials if using
   - Add Abstract API key if using location services

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

4. **Verify it's working**:
   - Check browser console for any errors
   - Verify API calls are using the correct URL

## Security Notes

1. ✅ **`.env.local` is in `.gitignore`** - Won't be committed
2. ✅ **Only `NEXT_PUBLIC_*` variables** are exposed to the browser
3. ✅ **No secrets in frontend** - All sensitive data stays on backend
4. ⚠️ **Never commit `.env.local`** - Contains actual credentials
5. ✅ **`.env.example` is safe to commit** - Contains placeholders only

## Production Deployment

For production (Vercel, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names as in `.env.local`
3. Set `NODE_ENV=production`
4. Update URLs to production values

### Vercel Example

1. Go to Project Settings → Environment Variables
2. Add each variable from `.env.local`
3. Deploy - variables will be available automatically

## Troubleshooting

### Variables not working?

1. **Check the prefix**: Must be `NEXT_PUBLIC_` for client-side
2. **Restart dev server**: Environment variables load at startup
3. **Check spelling**: Variable names are case-sensitive
4. **Check `.env.local` location**: Must be in project root

### "process.env is undefined"?

- Make sure variable starts with `NEXT_PUBLIC_`
- Restart your dev server
- Check that `.env.local` exists in project root

## Files Updated

- ✅ `src/config/baseUrl.ts` - Now uses `NEXT_PUBLIC_BASE_URL`
- ✅ `src/hooks/socket/useSocket.ts` - Now uses `NEXT_PUBLIC_SOCKET_URL`
- ✅ `src/lib/socket/notificationSocket.ts` - Ready to use `NEXT_PUBLIC_SOCKET_URL` when enabled

## Next Steps

1. ✅ Environment files created
2. ✅ Configuration files updated
3. ⏳ Fill in missing values (UploadThing, Abstract API if needed)
4. ⏳ Test the application
5. ⏳ Deploy to production with environment variables


