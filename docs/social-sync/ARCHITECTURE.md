# Social Sync Architecture

## System Overview

The Social Media Sync feature follows a client-server architecture with the following components:

```
Frontend (Next.js)          Backend (External API)
┌─────────────────┐         ┌─────────────────┐
│ Platform Stats  │────────▶│ Social Sync API │
│ Component       │         │ Endpoints       │
└─────────────────┘         └─────────────────┘
         │
         ▼
┌─────────────────┐
│ useSocialSync   │
│ Hook            │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Platform API    │
│ (Mock/Real)     │
└─────────────────┘
```

## Component Hierarchy

### Frontend Components

1. **PlatformAnalyticsPage** (`src/app/profile/platform-analytics/page.tsx`)
   - Main page component
   - Manages user profile data
   - Extracts social media usernames
   - Renders platform statistics

2. **PlatformStats** (`src/components/collaboration/PlatformStats.tsx`)
   - Displays platform cards
   - Shows follower counts and engagement
   - Renders sync buttons
   - Handles platform data visualization

3. **SyncPlatformButton** (`src/components/collaboration/SyncPlatformButton.tsx`)
   - Individual sync button component
   - Handles sync state management
   - Provides user feedback
   - Manages loading states

### Hooks and Services

1. **useSocialSync** (`src/hooks/features/useSocialSync.ts`)
   - Manages sync mutations
   - Handles API calls
   - Provides sync state
   - Manages error handling

2. **usePlatformData** (`src/hooks/features/usePlatformData.ts`)
   - Fetches platform data
   - Manages caching
   - Handles multiple platforms
   - Provides loading states

3. **profileApi** (`src/lib/api/profile.api.ts`)
   - API service functions
   - Request/response types
   - Error handling
   - Backend communication

### API Routes

1. **Platform API** (`src/app/api/platform/[type]/route.ts`)
   - Fetches platform data from RapidAPI
   - Provides mock data fallback
   - Handles username validation
   - Manages caching

## Data Flow

### 1. Initial Data Loading

```
User visits page
    ↓
Load user profile
    ↓
Extract social media usernames
    ↓
Fetch platform data for each username
    ↓
Display platform cards with data
```

### 2. Sync Process

```
User clicks sync button
    ↓
Validate platform data
    ↓
Send sync request to backend
    ↓
Update local state
    ↓
Show success/error feedback
```

## Data Structures

### UnifiedPlatformData

```typescript
interface UnifiedPlatformData {
  platform: PlatformType;
  username: string;
  displayName: string;
  profileImage: string;
  bio: string;
  verified: boolean;
  followers: number;        // Key field for sync
  following: number;
  totalContent: number;
  totalEngagement: number;
  averageEngagement: number;
  lastFetched: Date;
  raw?: unknown;
}
```

### SocialSyncRequest

```typescript
interface SocialSyncRequest {
  followers?: number;       // Backend expects this field
  engagement?: number;
}
```

## Error Handling

### Frontend Error Handling

1. **API Errors**: Caught in useSocialSync hook
2. **Validation Errors**: Handled in SyncPlatformButton
3. **Network Errors**: Managed by axios interceptors
4. **User Feedback**: Toast notifications

### Backend Error Handling

1. **Validation Errors**: 400 Bad Request with details
2. **Authentication Errors**: 401 Unauthorized
3. **Server Errors**: 500 Internal Server Error

## Caching Strategy

- **Platform Data**: 5-minute cache duration
- **User Profile**: Cached in React Query
- **Sync State**: Managed in component state

## Security Considerations

- **API Keys**: Stored in environment variables
- **User Data**: Validated before sync
- **Rate Limiting**: Handled by RapidAPI
- **Authentication**: Required for all sync operations
