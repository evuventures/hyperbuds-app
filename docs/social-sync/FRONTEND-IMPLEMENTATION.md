# Frontend Implementation Guide

## Overview

This document details the frontend implementation of the Social Media Sync feature, including components, hooks, and integration patterns.

## Component Architecture

### 1. PlatformAnalyticsPage

**Location**: `src/app/profile/platform-analytics/page.tsx`

**Purpose**: Main page component that displays platform analytics and enables sync functionality.

**Key Features**:
- Extracts social media usernames from user profile
- Manages platform credentials
- Renders platform statistics with sync buttons
- Handles loading and error states

**Code Structure**:
```typescript
export default function PlatformAnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract platform credentials from social links
  const platformCreds: Record<string, string> = {};
  const socialLinks = user?.profile?.socialLinks || {};

  // Username extraction logic for each platform
  if (socialLinks.tiktok) {
    const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
    if (match) {
      platformCreds.tiktok = match[1];
    }
  }

  return (
    <DashboardLayout>
      <PlatformStats
        platformCredentials={platformCreds}
        showCombinedMetrics={true}
        compact={false}
        clickable={false}
        showSyncButtons={true}  // Enable sync functionality
      />
    </DashboardLayout>
  );
}
```

### 2. PlatformStats Component

**Location**: `src/components/collaboration/PlatformStats.tsx`

**Purpose**: Displays platform cards with statistics and sync buttons.

**Props**:
```typescript
interface PlatformStatsProps {
  platformCredentials: Record<string, string>;
  showCombinedMetrics?: boolean;
  compact?: boolean;
  clickable?: boolean;
  showSyncButtons?: boolean;  // New prop for sync functionality
}
```

**Sync Button Integration**:
```typescript
{showSyncButtons && (
  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
    <SyncPlatformButton
      platform={platform}
      platformData={platformData}
      variant="compact"
      onSyncComplete={() => refetch()}
    />
  </div>
)}
```

### 3. SyncPlatformButton Component

**Location**: `src/components/collaboration/SyncPlatformButton.tsx`

**Purpose**: Reusable button component for syncing platform data.

**Props**:
```typescript
interface SyncPlatformButtonProps {
  platform: PlatformType;
  platformData: UnifiedPlatformData;
  variant?: 'default' | 'compact';
  onSyncComplete?: () => void;
}
```

**Button States**:
- **Idle**: Blue button with "Sync" text
- **Loading**: Spinning icon with "Syncing..." text
- **Success**: Green button with "Synced!" text (3 seconds)
- **Error**: Toast notification, button returns to idle

**Implementation**:
```typescript
export const SyncPlatformButton: React.FC<SyncPlatformButtonProps> = ({
  platform,
  platformData,
  variant = 'default',
  onSyncComplete,
}) => {
  const { syncPlatform, isSyncingPlatform } = useSocialSync();
  const [justSynced, setJustSynced] = useState(false);

  const isSyncing = isSyncingPlatform(platform);
  
  // Validate data before sync
  const hasValidData = platformData && 
    typeof platformData.followers === 'number' && 
    platformData.followers > 0;

  const handleSync = async () => {
    if (!hasValidData) {
      console.warn(`No valid data to sync for ${platform}`);
      return;
    }
    
    try {
      await syncPlatform(platform, platformData);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  // Render button based on variant and state
  // ... button rendering logic
};
```

## Hooks and Services

### 1. useSocialSync Hook

**Location**: `src/hooks/features/useSocialSync.ts`

**Purpose**: Manages social sync functionality with React Query integration.

**Features**:
- Single platform sync
- Multiple platform batch sync
- Loading state management
- Error handling
- Cache invalidation

**API**:
```typescript
const {
  syncPlatform,           // Sync single platform
  syncAllPlatforms,       // Sync multiple platforms
  isSyncing,              // Global syncing state
  syncingPlatforms,       // Set of syncing platforms
  isSyncingPlatform,      // Check specific platform
} = useSocialSync();
```

**Implementation**:
```typescript
export const useSocialSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [syncingPlatforms, setSyncingPlatforms] = useState<Set<string>>(new Set());

  // Single platform sync mutation
  const syncMutation = useMutation({
    mutationFn: async ({ platform, platformData }: SyncPlatformParams) => {
      const syncData: SocialSyncRequest = {
        followers: platformData.followers,
      };

      switch (platform) {
        case 'tiktok':
          return await profileApi.syncTikTok(syncData);
        case 'twitch':
          return await profileApi.syncTwitch(syncData);
        case 'twitter':
          return await profileApi.syncTwitter(syncData);
        default:
          throw new Error(`Sync not supported for ${platform}`);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Sync successful!",
        description: `${variables.platform.toUpperCase()} data synced to your profile`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync data",
        variant: "destructive",
      });
    },
  });

  const syncPlatform = useCallback(async (platform: PlatformType, platformData: UnifiedPlatformData) => {
    setSyncingPlatforms(prev => new Set(prev).add(platform));
    try {
      await syncMutation.mutateAsync({ platform, platformData });
    } finally {
      setSyncingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platform);
        return newSet;
      });
    }
  }, [syncMutation]);

  return {
    syncPlatform,
    syncAllPlatforms,
    isSyncing: syncingPlatforms.size > 0,
    syncingPlatforms,
    isSyncingPlatform: (platform: string) => syncingPlatforms.has(platform),
  };
};
```

### 2. usePlatformData Hook

**Location**: `src/hooks/features/usePlatformData.ts`

**Purpose**: Fetches platform data from RapidAPI with caching.

**Features**:
- Multiple platform data fetching
- 5-minute cache duration
- Error handling per platform
- Loading states

**API**:
```typescript
const {
  data: platformsData,     // Platform data object
  isLoading,               // Loading state
  error,                   // Error state
  refetch,                 // Manual refetch
} = useMultiplePlatformData(platforms);
```

### 3. profileApi Service

**Location**: `src/lib/api/profile.api.ts`

**Purpose**: API client functions for profile and social sync operations.

**Functions**:
```typescript
export const profileApi = {
  syncTikTok: async (data: SocialSyncRequest): Promise<SocialSyncResponse>,
  syncTwitch: async (data: SocialSyncRequest): Promise<SocialSyncResponse>,
  syncTwitter: async (data: SocialSyncRequest): Promise<SocialSyncResponse>,
  syncInstagram: async (data: SocialSyncRequest): Promise<SocialSyncResponse>,
  syncAllPlatforms: async (platformData: Record<string, SocialSyncRequest>),
  getProfile: async (),
  updateProfile: async (profileData: Record<string, unknown>),
};
```

## Data Flow

### 1. Initial Load

```
User visits /profile/platform-analytics
    ↓
loadProfile() fetches user data
    ↓
Extract social media usernames from profile
    ↓
useMultiplePlatformData() fetches platform data
    ↓
PlatformStats renders cards with data
    ↓
Sync buttons appear (if showSyncButtons=true)
```

### 2. Sync Process

```
User clicks sync button
    ↓
SyncPlatformButton.handleSync()
    ↓
useSocialSync.syncPlatform()
    ↓
profileApi.syncTikTok/Twitch/Twitter()
    ↓
POST /api/v1/profiles/social-sync/{platform}
    ↓
Backend updates profile
    ↓
React Query cache invalidation
    ↓
Profile data refetched
    ↓
Success toast notification
    ↓
Button shows success state
```

## Styling and UI

### Button Variants

**Default Variant**:
```tsx
<motion.button
  className="flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
>
  <Database className="w-5 h-5" />
  Sync to Database
</motion.button>
```

**Compact Variant**:
```tsx
<motion.button
  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <Database className="w-4 h-4" />
  Sync
</motion.button>
```

### State Styling

**Loading State**:
```tsx
className="... bg-blue-500 ..."
>
  <RefreshCw className="w-5 h-5 animate-spin" />
  Syncing...
```

**Success State**:
```tsx
className="... bg-gradient-to-r from-green-500 to-emerald-500 ..."
>
  <Check className="w-5 h-5" />
  Successfully Synced!
```

**Disabled State**:
```tsx
className="... bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed ..."
>
  <Database className="w-4 h-4" />
  No Data
```

## Error Handling

### Validation Errors

```typescript
const hasValidData = platformData && 
  typeof platformData.followers === 'number' && 
  platformData.followers > 0;

if (!hasValidData) {
  console.warn(`No valid data to sync for ${platform}`);
  return;
}
```

### API Errors

```typescript
try {
  await syncPlatform(platform, platformData);
} catch (error) {
  console.error('Sync error:', error);
  // Toast notification shown by useSocialSync hook
}
```

### Network Errors

Handled by axios interceptors in `src/lib/api/client.ts`:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);
```

## Testing

### Unit Tests

```typescript
// Test SyncPlatformButton component
describe('SyncPlatformButton', () => {
  it('should render sync button when data is valid', () => {
    const mockData = { followers: 1000, platform: 'tiktok' };
    render(<SyncPlatformButton platform="tiktok" platformData={mockData} />);
    expect(screen.getByText('Sync')).toBeInTheDocument();
  });

  it('should disable button when no valid data', () => {
    const mockData = { followers: 0, platform: 'tiktok' };
    render(<SyncPlatformButton platform="tiktok" platformData={mockData} />);
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// Test sync flow
describe('Social Sync Integration', () => {
  it('should sync platform data successfully', async () => {
    const mockData = { followers: 1000, platform: 'tiktok' };
    render(<PlatformAnalyticsPage />);
    
    fireEvent.click(screen.getByText('Sync'));
    await waitFor(() => {
      expect(screen.getByText('Successfully Synced!')).toBeInTheDocument();
    });
  });
});
```

## Performance Considerations

### Caching Strategy

- **Platform Data**: 5-minute cache via usePlatformData
- **Profile Data**: React Query cache with automatic invalidation
- **Sync State**: Component-level state management

### Optimization

- **Debounced Sync**: Prevent rapid clicking
- **Loading States**: Clear user feedback
- **Error Boundaries**: Graceful error handling
- **Memoization**: Prevent unnecessary re-renders

## Accessibility

### ARIA Labels

```tsx
<button
  aria-label={`Sync ${platform} data to database`}
  disabled={isSyncing || !hasValidData}
>
  Sync
</button>
```

### Keyboard Navigation

- Tab navigation support
- Enter/Space key activation
- Focus management during loading states

### Screen Reader Support

- Loading state announcements
- Success/error notifications
- Button state changes

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills

- No additional polyfills required
- Uses modern JavaScript features supported by target browsers
- Framer Motion for animations (has built-in polyfills)

## Future Enhancements

### Planned Features

1. **Auto-Sync**: Scheduled automatic syncs
2. **Sync History**: Track sync timestamps
3. **Batch Sync**: "Sync All" functionality
4. **Progress Indicators**: Multi-platform sync progress
5. **Offline Support**: Queue syncs when offline

### Technical Improvements

1. **Web Workers**: Background sync processing
2. **Service Workers**: Offline sync queuing
3. **WebSockets**: Real-time sync status
4. **PWA Support**: App-like sync experience
