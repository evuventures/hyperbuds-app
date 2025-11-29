# Backend Disabled Features - Restoration Guide

**Date Created:** January 2025  
**Status:** Features Temporarily Disabled  
**Reason:** Backend API endpoints not ready yet

---

## 📋 Overview

This document lists all features that have been temporarily disabled due to backend API endpoints not being ready. All disabled code is clearly marked with comments and can be easily restored once the backend is working.

---

## 🎯 Purpose

- Prevent infinite loading states
- Avoid error messages from failed API calls
- Maintain app stability while backend is being developed
- Provide clear instructions for re-enabling features

---

## 📝 Files Modified

### 1. Notification Features

#### `src/lib/api/notifications.api.ts`
**Status:** ✅ All API methods return mock/empty responses

**What was changed:**
- `getNotifications()` - Returns empty notifications array
- `markAsRead()` - Returns mock success response
- `markAllAsRead()` - Returns mock success response
- `deleteNotification()` - Returns mock success response
- `getPreferences()` - Returns default preferences
- `updatePreferences()` - Returns the same preferences passed in

**How to restore:**
1. Find each method in the file
2. Remove the mock return statements
3. Uncomment the actual API calls (they're marked with `// TEMPORARILY DISABLED`)
4. Remove the `// TEMPORARILY DISABLED - Backend not ready` comments

**Example:**
```typescript
// BEFORE (disabled):
getNotifications: async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
  // TEMPORARILY DISABLED - Backend not ready
  // const queryParams = new URLSearchParams();
  // ... actual code commented out ...
  return { success: true, notifications: [], ... }; // Mock response
}

// AFTER (enabled):
getNotifications: async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  // ... actual code ...
  const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<NotificationsResponse>(url);
  return response.data;
}
```

---

#### `src/hooks/features/useNotifications.ts`
**Status:** ✅ Refetch intervals and retries disabled

**What was changed:**
- `useNotifications()` - `refetchInterval` set to `false`, `retry` set to `false`
- `useNotificationPreferences()` - `retry` set to `false`

**How to restore:**
1. In `useNotifications()`:
   - Change `refetchInterval: false` back to `refetchInterval: 60000`
   - Change `retry: false` back to `retry: 2`
   - Uncomment the `retryDelay` line

2. In `useNotificationPreferences()`:
   - Remove `retry: false` (or set to appropriate value)

**Example:**
```typescript
// BEFORE (disabled):
return useQuery({
  queryKey: notificationKeys.list(params),
  queryFn: () => notificationsApi.getNotifications(params),
  staleTime: 30000,
  refetchInterval: false, // Disabled
  retry: false, // Disabled
});

// AFTER (enabled):
return useQuery({
  queryKey: notificationKeys.list(params),
  queryFn: () => notificationsApi.getNotifications(params),
  staleTime: 30000,
  refetchInterval: 60000, // Refetch every minute
  retry: 2, // Retry failed requests up to 2 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

#### `src/hooks/features/useNotificationSocket.ts`
**Status:** ✅ Socket connection completely disabled

**What was changed:**
- Early return in `useEffect` prevents socket connection
- All event handlers commented out

**How to restore:**
1. Remove the early `return;` statement at the start of the `useEffect`
2. Uncomment all the socket connection code
3. Uncomment all event handlers (`handleNewNotification`, `handleUpdatedNotification`, etc.)
4. Uncomment the socket event subscriptions

**Example:**
```typescript
// BEFORE (disabled):
useEffect(() => {
  // TEMPORARILY DISABLED - Backend not ready yet
  return; // Early return prevents execution
  
  // if (!enabled) return;
  // ... all code commented out ...
}, [enabled, queryClient, refetchUnreadCount, onNewNotification]);

// AFTER (enabled):
useEffect(() => {
  if (!enabled) return;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ No access token found, cannot connect to notification socket');
    }
    return;
  }
  
  try {
    notificationSocket.connect(token);
  } catch (error) {
    // ... error handling ...
  }
  
  // ... all event handlers and subscriptions ...
}, [enabled, queryClient, refetchUnreadCount, onNewNotification]);
```

---

#### `src/lib/socket/notificationSocket.ts`
**Status:** ✅ Socket connect method disabled

**What was changed:**
- `connect()` method returns `null` instead of creating socket connection
- All socket initialization code commented out

**How to restore:**
1. Remove the early return and mock socket return
2. Uncomment all the socket initialization code
3. Restore the `io()` call with proper configuration

**Example:**
```typescript
// BEFORE (disabled):
connect(token: string): Socket {
  // TEMPORARILY DISABLED - Backend not ready yet
  // Return a mock socket to prevent errors
  return null as unknown as Socket;
  
  // ... all code commented out ...
}

// AFTER (enabled):
connect(token: string): Socket {
  if (this.socket?.connected) {
    return this.socket;
  }

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api-hyperbuds-backend.onrender.com';

  this.socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: this.maxReconnectAttempts,
    reconnectionDelay: this.reconnectDelay,
    forceNew: true,
  });

  this.setupEventListeners();
  return this.socket;
}
```

---

### 2. Social Media Sync Features

#### `src/lib/api/profile.api.ts`
**Status:** ✅ All sync methods return mock error responses

**What was changed:**
- `syncTikTok()` - Returns mock error response
- `syncTwitch()` - Returns mock error response
- `syncTwitter()` - Returns mock error response
- `syncInstagram()` - Returns mock error response
- `syncAllPlatforms()` - Returns mock error response

**How to restore:**
1. For each sync method (`syncTikTok`, `syncTwitch`, `syncTwitter`, `syncInstagram`):
   - Remove the mock return statement
   - Uncomment the actual API call
   - Remove the `// TEMPORARILY DISABLED` comments

2. For `syncAllPlatforms()`:
   - Remove the mock results object creation
   - Uncomment all the sync logic
   - Restore the `Promise.all()` call

**Example:**
```typescript
// BEFORE (disabled):
syncTikTok: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
  // TEMPORARILY DISABLED - Backend not ready
  // const response = await apiClient.post('/profiles/social-sync/tiktok', data);
  // return response.data;
  
  return {
    success: false,
    message: 'Social media sync is temporarily disabled - backend not ready',
    // ... mock response ...
  };
}

// AFTER (enabled):
syncTikTok: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
  const response = await apiClient.post('/profiles/social-sync/tiktok', data);
  return response.data;
}
```

---

#### `src/hooks/features/useSocialSync.ts`
**Status:** ✅ Sync mutations disabled with error messages

**What was changed:**
- `syncMutation.mutationFn` - Throws error instead of calling API
- `syncAllPlatforms()` - Shows error toast and throws error

**How to restore:**
1. In `syncMutation.mutationFn`:
   - Remove the early error throw
   - Uncomment all the sync logic
   - Restore the switch statement with API calls

2. In `syncAllPlatforms()`:
   - Remove the error toast and throw
   - Uncomment all the sync logic
   - Restore the `profileApi.syncAllPlatforms()` call

**Example:**
```typescript
// BEFORE (disabled):
mutationFn: async ({ platform, platformData }: SyncPlatformParams) => {
  // TEMPORARILY DISABLED - Backend not ready yet
  console.log(`🔄 Sync mutation called for ${platform} (DISABLED - backend not ready)`);
  throw new Error('Social media sync is temporarily disabled - backend not ready');
  
  // ... all code commented out ...
}

// AFTER (enabled):
mutationFn: async ({ platform, platformData }: SyncPlatformParams) => {
  console.log(`🔄 Sync mutation called for ${platform}:`, { platform, platformData });

  const syncData: SocialSyncRequest = {
    followers: platformData.followers,
    engagement: platformData.averageEngagement,
  };

  try {
    let result;
    switch (platform) {
      case 'tiktok':
        result = await profileApi.syncTikTok(syncData);
        break;
      // ... other cases ...
    }
    return result;
  } catch (error) {
    console.error(`❌ Sync API error for ${platform}:`, error);
    throw error;
  }
}
```

---

### 3. Platform Data Fetching Features

#### `src/lib/api/platform.api.ts`
**Status:** ✅ `fetchSocialDataFromBackend` function disabled

**What was changed:**
- `fetchSocialDataFromBackend()` - Returns error response immediately
- All API call logic commented out

**How to restore:**
1. Remove the early return with error
2. Uncomment all the API call logic
3. Restore the `axios.post()` call
4. Restore all error handling logic

**Example:**
```typescript
// BEFORE (disabled):
async function fetchSocialDataFromBackend(
   platform: PlatformType,
   username: string,
   authToken?: string
): Promise<PlatformAPIResponse<BackendSocialResponse['data']>> {
   // TEMPORARILY DISABLED - Backend not ready
   console.log(`📡 Social media API call disabled for ${platform}/${username} - backend not ready`);
   
   return {
      success: false,
      error: 'Social media API is temporarily disabled - backend not ready',
   };
   
   // ... all code commented out ...
}

// AFTER (enabled):
async function fetchSocialDataFromBackend(
   platform: PlatformType,
   username: string,
   authToken?: string
): Promise<PlatformAPIResponse<BackendSocialResponse['data']>> {
   try {
      const cacheKey = `${platform}:${username}`;
      const cached = getCachedData<BackendSocialResponse['data']>(cacheKey);

      if (cached) {
         return { success: true, data: cached };
      }

      // ... rest of the implementation ...
      const response = await axios.post<BackendSocialResponse>(
         BACKEND_API_URL,
         { platform: backendPlatform, username: username.trim() },
         { headers }
      );
      
      // ... handle response ...
   } catch (error) {
      // ... error handling ...
   }
}
```

---

### 4. Profile Page Components

#### `src/app/profile/page.jsx`
**Status:** ✅ Platform Performance section commented out

**What was changed:**
- Entire Platform Performance section wrapped in comments
- `PlatformStats` component not rendered

**How to restore:**
1. Remove the comment markers (`{/* ... */}`)
2. Uncomment the entire Platform Performance section
3. The section will automatically show when user has social links

**Example:**
```jsx
// BEFORE (disabled):
{/* Platform Performance Section */}
{/* TEMPORARILY COMMENTED OUT - Backend not ready yet */}
{/* TODO: Uncomment when backend is working */}
{/* {user?.profile?.socialLinks && (() => {
  // ... entire section commented ...
})()} */}

// AFTER (enabled):
{/* Platform Performance Section */}
{user?.profile?.socialLinks && (() => {
  // Extract usernames from social links URLs for connected platforms only
  const platformCreds = {};
  const socialLinks = user.profile.socialLinks;
  
  // ... extract usernames ...
  
  return hasPlatforms && (
    <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
      <h3 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
        {/* ... header ... */}
        Platform Performance
      </h3>
      <PlatformStats
        platformCredentials={platformCreds}
        showCombinedMetrics={false}
        compact={true}
        clickable={true}
      />
    </div>
  );
})()}
```

---

#### `src/app/profile/user-profile/page.tsx`
**Status:** ✅ Platform Performance section commented out

**What was changed:**
- Same as `src/app/profile/page.jsx`

**How to restore:**
- Follow the same steps as `src/app/profile/page.jsx`

---

## 🔄 Step-by-Step Restoration Process

### Step 1: Verify Backend is Ready

Before uncommenting anything, verify that the backend endpoints are working:

1. **Notification Endpoints:**
   - `GET /api/v1/notifications` - Returns notifications list
   - `PUT /api/v1/notifications/:id/read` - Marks notification as read
   - `PUT /api/v1/notifications/read-all` - Marks all as read
   - `DELETE /api/v1/notifications/:id` - Deletes notification
   - `GET /api/v1/notifications/preferences` - Gets preferences
   - `PUT /api/v1/notifications/preferences` - Updates preferences

2. **Social Media Sync Endpoints:**
   - `POST /api/v1/profiles/social-sync/tiktok` - Sync TikTok data
   - `POST /api/v1/profiles/social-sync/twitter` - Sync Twitter data
   - `POST /api/v1/profiles/social-sync/twitch` - Sync Twitch data
   - `POST /api/v1/profiles/social-sync/instagram` - Sync Instagram data

3. **Platform Data Endpoints:**
   - `POST /api/v1/social/fetch` - Fetch platform data (TikTok, Instagram, YouTube, Twitter, Twitch)

4. **WebSocket Connection:**
   - Socket.IO server running at `NEXT_PUBLIC_SOCKET_URL`
   - Events: `notification:new`, `notification:updated`, `notification:deleted`, `notifications:read-all`

### Step 2: Restore Notification Features

1. **Restore API calls:**
   ```bash
   # File: src/lib/api/notifications.api.ts
   # Uncomment all API methods
   ```

2. **Restore hooks:**
   ```bash
   # File: src/hooks/features/useNotifications.ts
   # Enable refetchInterval and retry
   ```

3. **Restore socket connection:**
   ```bash
   # File: src/hooks/features/useNotificationSocket.ts
   # Remove early return, uncomment socket connection
   # File: src/lib/socket/notificationSocket.ts
   # Restore connect() method
   ```

### Step 3: Restore Social Media Sync Features

1. **Restore API calls:**
   ```bash
   # File: src/lib/api/profile.api.ts
   # Uncomment all sync methods
   ```

2. **Restore hooks:**
   ```bash
   # File: src/hooks/features/useSocialSync.ts
   # Uncomment sync mutation logic
   ```

### Step 4: Restore Platform Data Fetching

1. **Restore API function:**
   ```bash
   # File: src/lib/api/platform.api.ts
   # Uncomment fetchSocialDataFromBackend function
   ```

### Step 5: Restore Profile Page Components

1. **Restore Platform Performance section:**
   ```bash
   # File: src/app/profile/page.jsx
   # Uncomment Platform Performance section
   # File: src/app/profile/user-profile/page.tsx
   # Uncomment Platform Performance section
   ```

### Step 6: Test Everything

1. **Test Notifications:**
   - Check if notifications load
   - Test marking as read
   - Test deleting notifications
   - Verify WebSocket real-time updates

2. **Test Social Media Sync:**
   - Try syncing each platform (TikTok, Twitter, Twitch, Instagram)
   - Verify data is saved to profile
   - Check sync buttons work

3. **Test Platform Data:**
   - Enter platform usernames
   - Verify data is fetched and displayed
   - Check Platform Performance section on profile page

---

## 🔍 Search for All Disabled Code

To find all disabled code quickly, search for these patterns:

```bash
# Search for disabled comments
grep -r "TEMPORARILY DISABLED" src/
grep -r "TEMPORARILY COMMENTED OUT" src/
grep -r "TODO: Uncomment when backend" src/
grep -r "Backend not ready" src/
```

---

## 📌 Important Notes

1. **All disabled code is clearly marked** with comments explaining why it's disabled
2. **Mock responses are provided** to prevent crashes
3. **Components handle errors gracefully** - they won't break if APIs fail
4. **No data is lost** - all code is preserved, just commented out
5. **Easy to restore** - just uncomment the code sections

---

## ✅ Checklist for Restoration

- [ ] Backend notification endpoints are working
- [ ] Backend social media sync endpoints are working
- [ ] Backend platform data endpoint is working
- [ ] WebSocket server is running and accessible
- [ ] All notification API methods restored
- [ ] Notification hooks restored (refetch intervals, retries)
- [ ] Notification socket connection restored
- [ ] All social media sync API methods restored
- [ ] Social media sync hooks restored
- [ ] Platform data fetching function restored
- [ ] Profile page Platform Performance sections restored
- [ ] All features tested and working

---

## 🐛 Troubleshooting

### If notifications still don't work after restoration:

1. Check browser console for errors
2. Verify authentication token is being sent
3. Check network tab for API request/response
4. Verify WebSocket connection in browser DevTools
5. Check backend logs for errors

### If social media sync still doesn't work:

1. Verify platform credentials are correct
2. Check API request payload format
3. Verify backend accepts the data format
4. Check for CORS issues
5. Verify authentication token

### If platform data fetching doesn't work:

1. Verify backend endpoint URL is correct
2. Check if platform is supported by backend
3. Verify username format is correct
4. Check for rate limiting errors
5. Verify authentication token

---

## 📞 Support

If you encounter issues during restoration, check:
- Backend API documentation
- Backend logs
- Browser console errors
- Network request/response in DevTools

---

**Last Updated:** January 2025  
**Maintained By:** Development Team

