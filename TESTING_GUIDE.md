# Testing Guide: Redux to Zustand + WebSocket Removal Migration

## Quick Test Commands

```bash
# 1. Type check and build
npm run build

# 2. Lint check
npm run lint

# 3. Run tests
npm test

# 4. Start dev server
npm run dev
```

## Comprehensive Testing Checklist

### 1. Build & Type Safety ✅

```bash
# Should compile without errors (except known complete-profile page issue)
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

**Expected:**
- ✅ TypeScript compiles successfully
- ✅ No Redux/Socket import errors
- ⚠️ Known issue: `/profile/complete-profile` SSR error (pre-existing)

---

### 2. Authentication Flow Testing

#### Test 1: Login
1. Navigate to `/auth/signin`
2. Enter credentials and login
3. **Verify:**
   - ✅ Token is stored in localStorage (`accessToken`)
   - ✅ Token is stored in Zustand store
   - ✅ User is redirected after login
   - ✅ No console errors about Redux

#### Test 2: Token Persistence
1. Login successfully
2. Refresh the page (F5)
3. **Verify:**
   - ✅ User remains logged in
   - ✅ Token persists across refresh
   - ✅ No redirect to login page

#### Test 3: Logout
1. While logged in, click logout
2. **Verify:**
   - ✅ Token removed from localStorage
   - ✅ Zustand store cleared
   - ✅ Redirected to login page
   - ✅ No console errors

#### Test 4: API Calls with Auth
1. While logged in, navigate to any protected page
2. Open browser DevTools → Network tab
3. **Verify:**
   - ✅ API requests include `Authorization: Bearer <token>` header
   - ✅ No 401 Unauthorized errors
   - ✅ Data loads successfully

**Manual Check:**
```javascript
// In browser console:
localStorage.getItem('accessToken') // Should return token string
```

---

### 3. State Management Testing

#### Test 5: Theme Toggle
1. Navigate to any page
2. Toggle dark/light mode (if available)
3. Refresh page
4. **Verify:**
   - ✅ Theme preference persists
   - ✅ Theme applies correctly on refresh
   - ✅ No Redux errors in console

#### Test 6: Sidebar State
1. Navigate to dashboard
2. Collapse/expand sidebar
3. Refresh page
4. **Verify:**
   - ✅ Sidebar state persists
   - ✅ No Redux errors

**Manual Check:**
```javascript
// In browser console (after Zustand store loads):
// Check if stores are accessible
```

---

### 4. Messaging Polling Testing

#### Test 7: Message Polling
1. Navigate to `/messages` or any conversation
2. Open browser DevTools → Network tab
3. Select an active conversation
4. **Verify:**
   - ✅ Messages load initially
   - ✅ New messages appear (polling every 5 seconds)
   - ✅ Network tab shows requests every ~5s when conversation active
   - ✅ No WebSocket connection errors
   - ✅ No socket.io errors in console

**Expected Network Activity:**
- Initial load: `GET /api/v1/messages?conversationId=...`
- Polling: Same request repeats every 5 seconds
- No WebSocket upgrade requests

#### Test 8: Conversation List Polling
1. Navigate to `/messages`
2. Open browser DevTools → Network tab
3. **Verify:**
   - ✅ Conversations list loads
   - ✅ List refreshes every 30 seconds
   - ✅ No WebSocket errors

**Manual Check:**
```javascript
// In browser console:
// Should see no socket.io connections
// Check Network tab for polling intervals
```

---

### 5. Notifications Polling Testing

#### Test 9: Notification Polling
1. Navigate to any page with notifications
2. Open browser DevTools → Network tab
3. **Verify:**
   - ✅ Notifications load initially
   - ✅ Notifications refresh every 60 seconds
   - ✅ No WebSocket connection attempts
   - ✅ No socket.io errors

**Expected Network Activity:**
- Initial load: `GET /api/v1/notifications`
- Polling: Same request every 60 seconds

---

### 6. Component Functionality Testing

#### Test 10: Matching Page
1. Navigate to `/matching`
2. **Verify:**
   - ✅ Match suggestions load
   - ✅ Swipe actions work
   - ✅ Filters work
   - ✅ No Redux errors

#### Test 11: Profile Edit
1. Navigate to `/profile/edit`
2. Edit profile information
3. Save changes
4. **Verify:**
   - ✅ Changes save successfully
   - ✅ API calls include auth token
   - ✅ No errors

#### Test 12: User Search
1. Use search functionality (if available)
2. **Verify:**
   - ✅ Search works
   - ✅ Results display
   - ✅ No errors

---

### 7. Console Error Check

#### Test 13: No Redux/Socket Errors
1. Open browser DevTools → Console
2. Navigate through the app
3. **Verify:**
   - ✅ No "Redux" related errors
   - ✅ No "socket.io" related errors
   - ✅ No "useAppSelector" or "useAppDispatch" errors
   - ✅ No "ReduxProvider" errors
   - ✅ No "SocketProvider" errors

**Common Errors to Watch For:**
- ❌ `Cannot read property 'dispatch' of undefined` (Redux)
- ❌ `Module not found: 'react-redux'` (Redux)
- ❌ `socket.io-client` errors (WebSocket)
- ❌ `useAppSelector is not a function` (Redux)

---

### 8. Performance Testing

#### Test 14: Polling Efficiency
1. Open browser DevTools → Network tab
2. Navigate to messages page
3. Monitor network requests for 1 minute
4. **Verify:**
   - ✅ Polling intervals are correct (5s for active conversation, 30s for list)
   - ✅ No excessive requests
   - ✅ Requests stop when page is inactive/closed

---

### 9. SSR/Hydration Testing

#### Test 15: SSR Safety
1. Disable JavaScript in browser
2. Navigate to pages
3. **Verify:**
   - ✅ Pages render without JavaScript
   - ✅ No hydration errors
   - ✅ `getAccessToken()` returns null during SSR (safe)

#### Test 16: Client-Side Hydration
1. Enable JavaScript
2. Refresh pages
3. **Verify:**
   - ✅ No hydration mismatches
   - ✅ Zustand stores hydrate correctly
   - ✅ No console warnings about hydration

---

### 10. Edge Cases

#### Test 17: Token Expiration
1. Wait for token to expire (or manually remove token)
2. Try to access protected page
3. **Verify:**
   - ✅ Redirects to login
   - ✅ Zustand store cleared
   - ✅ No errors

#### Test 18: Network Offline
1. Go offline (DevTools → Network → Offline)
2. Try to use app
3. **Verify:**
   - ✅ Polling stops gracefully
   - ✅ No errors
   - ✅ App handles offline state

#### Test 19: Multiple Tabs
1. Open app in multiple tabs
2. Login in one tab
3. **Verify:**
   - ✅ Other tabs reflect login state
   - ✅ Token syncs across tabs (via localStorage)
   - ✅ No conflicts

---

## Automated Testing

### Unit Tests

```bash
# Run existing tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Files to Verify:**
- `src/lib/api/__tests__/profile.api.test.ts` - Should pass
- Any auth-related tests should use Zustand mocks

### Integration Tests (Manual)

Test the following flows end-to-end:

1. **Login → Navigate → Logout**
2. **Send Message → Receive via Polling**
3. **Toggle Theme → Refresh → Verify Persistence**

---

## Debugging Tools

### Browser Console Checks

```javascript
// Check Zustand stores
import { useAuthStore } from '@/stores/auth.store';
console.log(useAuthStore.getState());

// Check token
localStorage.getItem('accessToken');

// Check if Redux is still present (should be undefined)
window.__REDUX_DEVTOOLS_EXTENSION__; // Should be undefined
```

### React DevTools

1. Install React DevTools extension
2. Check component tree
3. **Verify:**
   - ✅ No ReduxProvider in tree
   - ✅ No SocketProvider in tree
   - ✅ Zustand stores accessible

### Network Tab Monitoring

1. Open DevTools → Network
2. Filter by "Fetch/XHR"
3. **Verify:**
   - ✅ Polling requests at correct intervals
   - ✅ No WebSocket connections
   - ✅ All requests include auth headers

---

## Known Issues & Workarounds

### Issue 1: Complete-Profile Page SSR Error

**Error:** `TypeError: number 0 is not iterable`

**Status:** Pre-existing bug, unrelated to migration

**Workaround:**
- Page works in client-side mode
- Skip prerendering for this page (already done with `dynamic = 'force-dynamic'`)
- Fix the page code separately

### Issue 2: Polling May Feel Slower Than WebSockets

**Expected:** Messages update every 5 seconds instead of instantly

**Mitigation:**
- This is by design (per Joseph's rules)
- Consider reducing polling interval if needed (currently 5s)

---

## Success Criteria

✅ **Migration is successful if:**
1. All build/lint commands pass (except known issue)
2. Login/logout works correctly
3. Token persists across refreshes
4. API calls include auth headers
5. Messages poll every 5s when active
6. Notifications poll every 60s
7. No Redux/Socket errors in console
8. Theme and sidebar state persist
9. All existing functionality works

---

## Quick Verification Script

Run this in browser console after login:

```javascript
// Quick health check
const checks = {
  token: !!localStorage.getItem('accessToken'),
  zustand: typeof window !== 'undefined' && typeof useAuthStore !== 'undefined',
  redux: typeof window !== 'undefined' && !window.__REDUX_DEVTOOLS_EXTENSION__,
  socket: typeof window !== 'undefined' && !window.io,
};

console.table(checks);
// All should be true (or undefined for redux/socket)
```

---

## Reporting Issues

If you find issues:

1. **Check console** for error messages
2. **Check Network tab** for failed requests
3. **Verify** it's not the known complete-profile issue
4. **Document** the steps to reproduce
5. **Check** if it's related to Redux/Socket removal or pre-existing

---

## Next Steps After Testing

1. ✅ Fix complete-profile page SSR error (separate task)
2. ✅ Monitor polling performance in production
3. ✅ Consider adjusting polling intervals if needed
4. ✅ Add unit tests for Zustand stores if missing
