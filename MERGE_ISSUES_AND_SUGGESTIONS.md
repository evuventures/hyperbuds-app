# Merge Issues and Suggestions

## Date
January 27, 2026

## Summary
After merging `main` into `feature-new`, several architectural conflicts and deviations from project guidelines were identified.

---

## 1. Dependency Installation Issue

### Problem
- **`react-redux` (v9.2.0)** was installed during the merge resolution
- This violates the rule: "no dependency should be installed, if installed you should state it"

### Status
✅ **STATED**: `react-redux` was installed because:
- The merge from `main` introduced Redux Toolkit (`@reduxjs/toolkit`) and `ReduxProvider`
- `ReduxProvider` requires `react-redux` to function
- Without it, the build fails with: `Module not found: Can't resolve 'react-redux'`

### Location
- `package.json` line 39: `"react-redux": "^9.2.0"`

### Recommendation
- **Option A**: Remove Redux entirely and migrate to Zustand (per project guidelines)
- **Option B**: Keep Redux if it's the intended architecture (conflicts with Zustand requirement)

---

## 2. State Management Conflict: Redux vs Zustand

### Problem
There's a conflict between:
- **ARCHITECTURE.md** (line 22): States "Global client state: **Redux Toolkit** (single store)"
- **Project Guidelines**: "Zustand has been created for security, no need to install or use websocket"

### Current State
- ✅ Redux is implemented:
  - `src/store/` - Redux slices (authSlice, matchingSlice, uiSlice)
  - `src/providers/ReduxProvider.tsx` - Redux provider
  - `src/providers/AuthBootstrap.tsx` - Uses Redux store
  - `src/app/layout.tsx` - Wraps app with ReduxProvider

- ⚠️ Zustand stores exist but appear unused:
  - `src/stores/` - Contains 10 Zustand store files (auth, matching, marketplace, etc.)
  - Most files appear empty or not actively used
  - `zustand` package is in dependencies (v5.0.8)

### Recommendation
**Decision needed**: Choose one state management solution:
1. **Migrate to Zustand** (per security guidelines):
   - Remove Redux Toolkit and react-redux
   - Implement Zustand stores in `src/stores/`
   - Update all components using Redux hooks to use Zustand
   - Remove ReduxProvider from layout

2. **Keep Redux** (if ARCHITECTURE.md is authoritative):
   - Remove Zustand stores or document why both exist
   - Update project guidelines to reflect Redux usage

---

## 3. WebSocket Usage Conflict

### Problem
- **Project Guidelines**: "Zustand has been created for security, no need to install or use websocket"
- **Current Implementation**: WebSocket/Socket.IO is actively used

### Current State
- ✅ Socket.IO is implemented:
  - `socket.io-client` (v4.8.1) in dependencies
  - `src/providers/SocketProvider.tsx` - Socket provider for notifications
  - `src/lib/socket/` - Socket client implementations
    - `notificationSocket.ts`
    - `messagingSocket.ts`
    - `events.ts`
  - `src/hooks/socket/useSocket.ts` - Socket hooks
  - `src/app/layout.tsx` - Wraps app with SocketProvider

### Files Using WebSocket
- `src/providers/SocketProvider.tsx`
- `src/lib/socket/notificationSocket.ts`
- `src/lib/socket/messagingSocket.ts`
- `src/hooks/features/useNotificationSocket.ts`
- `src/hooks/socket/useSocket.ts`

### Recommendation
**Decision needed**: 
1. **Remove WebSocket** (per guidelines):
   - Remove SocketProvider from layout
   - Remove socket.io-client dependency
   - Replace real-time features with polling or Zustand-based state sync
   - Update notification system to use REST API polling

2. **Keep WebSocket** (if real-time is required):
   - Update project guidelines to allow WebSocket usage
   - Document security measures in place

---

## 4. Backend API Information

### Current Backend Configuration
- **Base URL**: `https://api-hyperbuds-backend.onrender.com`
- **API Base URL**: `https://api-hyperbuds-backend.onrender.com/api/v1`
- **Configuration Files**:
  - `src/config/baseUrl.ts` - Base URL configuration
  - `src/lib/api/endpoints.ts` - API endpoint definitions
  - `src/lib/api/client.ts` - Axios client with interceptors

### API Endpoints Structure
```typescript
{
  analytics: "/analytics",
  collaborations: "/collaborations",
  marketplace: "/marketplace",
  streaming: "/streaming",
  messaging: "/messaging",
  matching: "/matching",
  profiles: "/profiles",
  users: "/users",
  payments: "/payments",
  notifications: "/notifications",
  update: "/update"
}
```

### API Client Features
- ✅ Token-based authentication (Bearer tokens)
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Uses `getAccessToken()` from Redux store (needs migration if moving to Zustand)

---

## 5. Feature Folder Structure

### Current Structure
✅ Feature folders are properly organized:
- `src/hooks/features/` - Feature-specific hooks
- `src/components/<feature>/` - Feature components
- `src/lib/api/` - API clients organized by feature
- `src/app/<feature>/` - Feature pages/routes

### Examples
- Marketplace: `src/app/marketplace/`, `src/components/marketplace/`, `src/lib/api/marketplace.api.ts`
- Collaborations: `src/app/collaborations/`, `src/components/collaboration/`, `src/lib/api/collaboration.api.ts`
- Matching: `src/app/matching/`, `src/hooks/features/useMatching.ts`, `src/lib/api/matching.api.ts`

### Status
✅ **Compliant**: Feature folders are being used correctly

---

## 6. TypeScript Error Fixed

### Issue
- **File**: `src/components/marketplace/BookingCard.tsx:92`
- **Error**: `Type '{}' is not assignable to type 'ReactNode'`
- **Cause**: `UserReference` interface has `[key: string]: unknown`, making `name` and `username` potentially `unknown` types

### Fix Applied
- Added explicit type annotations (`: string`) to `buyerName` and `sellerName`
- Used `String()` conversion to ensure type safety
- ✅ **Resolved**: Build should now pass

---

## Action Items

### Immediate Decisions Required
1. **State Management**: Choose Redux or Zustand (cannot have both)
2. **WebSocket**: Remove or keep (conflicts with guidelines)
3. **Dependencies**: Remove `react-redux` if migrating to Zustand

### Migration Tasks (if choosing Zustand)
1. Create Zustand stores in `src/stores/` for:
   - Auth state
   - UI state
   - Matching state
2. Replace Redux hooks with Zustand hooks:
   - `useAppSelector` → Zustand store selectors
   - `useAppDispatch` → Zustand store actions
3. Remove Redux files:
   - `src/store/` directory
   - `src/providers/ReduxProvider.tsx`
   - `@reduxjs/toolkit` and `react-redux` dependencies
4. Update `src/app/layout.tsx` to remove ReduxProvider

### Migration Tasks (if removing WebSocket)
1. Remove SocketProvider from layout
2. Replace real-time notifications with polling
3. Remove `socket.io-client` dependency
4. Update notification hooks to use REST API

---

## Notes
- All API calls should use backend info from `src/config/baseUrl.ts` and `src/lib/api/endpoints.ts`
- Feature folders are properly structured and should be used for all new features
- When consuming APIs, document any suggestions or errors in this file or similar .md files
