# Social Sync Troubleshooting Guide

## Common Issues and Solutions

This guide helps diagnose and resolve common issues with the Social Media Sync feature.

## Table of Contents

1. [Sync Button Issues](#sync-button-issues)
2. [Authentication Problems](#authentication-problems)
3. [Data Loading Issues](#data-loading-issues)
4. [API Communication Problems](#api-communication-problems)
5. [Performance Issues](#performance-issues)
6. [Browser-Specific Issues](#browser-specific-issues)
7. [Mobile Issues](#mobile-issues)
8. [Development Issues](#development-issues)
9. [Production Issues](#production-issues)
10. [Debug Tools](#debug-tools)

## Sync Button Issues

### Issue: Sync Button Not Appearing

**Symptoms**:
- Platform cards display but no sync buttons visible
- Only platform data shown without sync functionality

**Possible Causes**:
1. `showSyncButtons` prop not set to `true`
2. Platform data not loaded properly
3. Component not properly imported

**Solutions**:

1. **Check PlatformStats Configuration**:
```typescript
// Ensure showSyncButtons is set to true
<PlatformStats
  platformCredentials={platformCreds}
  showCombinedMetrics={true}
  compact={false}
  clickable={false}
  showSyncButtons={true}  // ← This must be true
/>
```

2. **Verify Platform Data Loading**:
```typescript
// Check if platform data is loaded
console.log('Platform data:', platformData);
console.log('Has valid data:', hasValidData);

// Platform data should have followers > 0
if (platformData.followers > 0) {
  // Sync button should appear
}
```

3. **Check Component Import**:
```typescript
// Ensure SyncPlatformButton is imported
import { SyncPlatformButton } from '@/components/collaboration/SyncPlatformButton';

// Check if component is rendered
{showSyncButtons && (
  <SyncPlatformButton
    platform={platform}
    platformData={platformData}
    variant="compact"
    onSyncComplete={() => refetch()}
  />
)}
```

### Issue: Sync Button Disabled

**Symptoms**:
- Sync button appears but is grayed out
- Button shows "No Data" text
- Button is not clickable

**Possible Causes**:
1. Platform data has invalid follower count
2. Platform data is null or undefined
3. Data validation failing

**Solutions**:

1. **Check Data Validation**:
```typescript
// Debug data validation
const hasValidData = platformData && 
  typeof platformData.followers === 'number' && 
  platformData.followers > 0;

console.log('Platform data:', platformData);
console.log('Has valid data:', hasValidData);
console.log('Followers type:', typeof platformData?.followers);
console.log('Followers value:', platformData?.followers);
```

2. **Fix Data Structure**:
```typescript
// Ensure platform data has correct structure
const validPlatformData = {
  platform: 'tiktok',
  username: 'test_user',
  displayName: 'Test User',
  followers: 1000,  // Must be number > 0
  averageEngagement: 5.0,
  // ... other required fields
};
```

### Issue: Sync Button Stuck in Loading

**Symptoms**:
- Button shows "Syncing..." with spinning icon
- Button never returns to normal state
- No success or error feedback

**Possible Causes**:
1. Backend API not responding
2. Network timeout
3. JavaScript error in sync process
4. React state not updating

**Solutions**:

1. **Check Network Requests**:
```javascript
// Open DevTools → Network tab
// Look for POST requests to /api/v1/profiles/social-sync/*
// Check if request completes or times out
```

2. **Add Error Handling**:
```typescript
const handleSync = async () => {
  try {
    console.log('Starting sync...');
    await syncPlatform(platform, platformData);
    console.log('Sync completed');
  } catch (error) {
    console.error('Sync error:', error);
    // Reset button state
    setJustSynced(false);
  }
};
```

3. **Check Backend Status**:
```bash
# Test backend endpoint directly
curl -X POST "https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followers": 1000, "engagement": 7.5}'
```

## Authentication Problems

### Issue: 401 Unauthorized Error

**Symptoms**:
- Sync fails with "Unauthorized" error
- Toast shows "Sync failed: Unauthorized"
- Network request returns 401 status

**Possible Causes**:
1. Invalid or expired access token
2. Missing Authorization header
3. Token format incorrect

**Solutions**:

1. **Check Token in LocalStorage**:
```javascript
// Open DevTools → Console
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Check if token exists and is valid JWT format
if (!token) {
  console.error('No access token found');
  // Redirect to login
}
```

2. **Verify Token Format**:
```javascript
// JWT tokens have 3 parts separated by dots
const tokenParts = token.split('.');
if (tokenParts.length !== 3) {
  console.error('Invalid token format');
}
```

3. **Check API Client Headers**:
```typescript
// Verify apiClient includes Authorization header
// src/lib/api/client.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

4. **Refresh Token**:
```typescript
// If token is expired, refresh it
const refreshToken = async () => {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
  } catch (error) {
    // Redirect to login
    window.location.href = '/auth/login';
  }
};
```

### Issue: 403 Forbidden Error

**Symptoms**:
- Sync fails with "Forbidden" error
- Token exists but access denied

**Possible Causes**:
1. Token is invalid or malformed
2. User doesn't have permission
3. Token signature verification failed

**Solutions**:

1. **Validate Token**:
```javascript
// Decode JWT token (without verification)
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Token expires:', new Date(payload.exp * 1000));
```

2. **Check User Permissions**:
```typescript
// Verify user has sync permissions
const checkPermissions = async () => {
  const response = await fetch('/api/v1/profiles/me');
  const profile = await response.json();
  console.log('User profile:', profile);
  // Check if user can sync
};
```

## Data Loading Issues

### Issue: Platform Data Not Loading

**Symptoms**:
- Platform cards show loading spinner forever
- No platform data displayed
- Console shows "No data returned from TikTok API"

**Possible Causes**:
1. RapidAPI key not configured
2. Platform API endpoint not working
3. Username extraction failing
4. Network connectivity issues

**Solutions**:

1. **Check RapidAPI Configuration**:
```javascript
// Check if RapidAPI key is set
console.log('RapidAPI Key:', process.env.RAPIDAPI_KEY);
console.log('Public RapidAPI Key:', process.env.NEXT_PUBLIC_RAPIDAPI_KEY);

// If not set, mock data should be used
```

2. **Test Platform API Directly**:
```bash
# Test platform API endpoint
curl "http://localhost:3000/api/platform/tiktok?username=test_user"

# Should return mock data if RapidAPI key not configured
```

3. **Check Username Extraction**:
```typescript
// Debug username extraction
const socialLinks = user?.profile?.socialLinks || {};
console.log('Social links:', socialLinks);

if (socialLinks.tiktok) {
  const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
  console.log('TikTok match:', match);
  if (match) {
    console.log('Extracted username:', match[1]);
  }
}
```

4. **Verify Mock Data**:
```typescript
// Check if mock data is being returned
// src/app/api/platform/[type]/route.ts
if (!rapidApiKey) {
  console.log(`🔧 Using mock data for ${type} (username: ${username}) - RapidAPI key not configured`);
  
  const mockData = {
    platform: type as PlatformType,
    username: username.trim(),
    followers: Math.floor(Math.random() * 10000) + 100,
    // ... other mock data
  };
  
  return NextResponse.json({
    success: true,
    data: mockData,
    mock: true
  });
}
```

### Issue: Wrong Platform Data

**Symptoms**:
- Platform data loads but shows incorrect information
- Follower counts don't match actual platform
- Data seems outdated

**Possible Causes**:
1. Using mock data instead of real data
2. Cached data is outdated
3. Username extraction incorrect
4. API returning wrong data

**Solutions**:

1. **Check Data Source**:
```javascript
// Check if using mock or real data
const response = await fetch('/api/platform/tiktok?username=test_user');
const data = await response.json();
console.log('Using mock data:', data.mock);
console.log('Data source:', data.cached ? 'cached' : 'fresh');
```

2. **Clear Cache**:
```typescript
// Clear platform data cache
const clearCache = () => {
  // Clear localStorage cache
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('platform_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Refetch data
  refetch();
};
```

3. **Verify Username**:
```typescript
// Ensure correct username is being used
const platformCreds = {
  tiktok: 'correct_username',  // Make sure this is correct
  twitter: 'correct_username',
  twitch: 'correct_username'
};
```

## API Communication Problems

### Issue: Network Request Fails

**Symptoms**:
- Network request shows as failed in DevTools
- Console shows network error
- Sync never completes

**Possible Causes**:
1. Backend server down
2. Network connectivity issues
3. CORS issues
4. Request timeout

**Solutions**:

1. **Check Backend Status**:
```bash
# Test backend health
curl "https://api-hyperbuds-backend.onrender.com/health"

# Test specific endpoint
curl "https://api-hyperbuds-backend.onrender.com/api/v1/profiles/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

2. **Check Network Connectivity**:
```javascript
// Test network connectivity
fetch('https://api-hyperbuds-backend.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('Backend status:', data))
  .catch(error => console.error('Network error:', error));
```

3. **Handle Network Errors**:
```typescript
// Add network error handling
const handleSync = async () => {
  try {
    await syncPlatform(platform, platformData);
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      toast({
        title: "Network Error",
        description: "Please check your internet connection",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }
};
```

### Issue: CORS Errors

**Symptoms**:
- Console shows CORS error
- Request blocked by browser
- "Access to fetch at ... has been blocked by CORS policy"

**Possible Causes**:
1. Backend not configured for CORS
2. Frontend domain not allowed
3. Preflight request failing

**Solutions**:

1. **Check CORS Configuration**:
```javascript
// Backend should allow frontend domain
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

2. **Use Proxy in Development**:
```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://api-hyperbuds-backend.onrender.com/api/v1/:path*'
      }
    ];
  }
};
```

## Performance Issues

### Issue: Slow Sync Performance

**Symptoms**:
- Sync takes more than 5 seconds
- UI becomes unresponsive during sync
- Multiple syncs cause performance degradation

**Possible Causes**:
1. Backend API slow response
2. Large data payloads
3. Multiple simultaneous requests
4. Memory leaks

**Solutions**:

1. **Optimize Backend Response**:
```javascript
// Backend should respond quickly
const syncPlatformData = async (req, res) => {
  const startTime = Date.now();
  
  // ... sync logic ...
  
  const duration = Date.now() - startTime;
  console.log(`Sync completed in ${duration}ms`);
  
  res.json({ success: true, duration });
};
```

2. **Debounce Sync Requests**:
```typescript
// Prevent multiple simultaneous syncs
const [isSyncing, setIsSyncing] = useState(false);

const handleSync = async () => {
  if (isSyncing) return; // Prevent multiple syncs
  
  setIsSyncing(true);
  try {
    await syncPlatform(platform, platformData);
  } finally {
    setIsSyncing(false);
  }
};
```

3. **Optimize Data Payload**:
```typescript
// Only send necessary data
const syncData = {
  followers: platformData.followers,
  // Don't send large objects
};
```

### Issue: Memory Leaks

**Symptoms**:
- Browser becomes slow after multiple syncs
- Memory usage increases over time
- Page crashes after extended use

**Possible Causes**:
1. Event listeners not cleaned up
2. React state not properly managed
3. Large objects in memory
4. Timers not cleared

**Solutions**:

1. **Clean Up Event Listeners**:
```typescript
useEffect(() => {
  const handleStorageChange = (e) => {
    // Handle storage change
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);
```

2. **Clear Timers**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setJustSynced(false);
  }, 3000);
  
  return () => clearTimeout(timer);
}, [justSynced]);
```

3. **Optimize State Management**:
```typescript
// Use useCallback to prevent unnecessary re-renders
const handleSync = useCallback(async () => {
  // ... sync logic
}, [platform, platformData]);

// Use useMemo for expensive calculations
const hasValidData = useMemo(() => {
  return platformData && 
    typeof platformData.followers === 'number' && 
    platformData.followers > 0;
}, [platformData]);
```

## Browser-Specific Issues

### Issue: Chrome-Specific Problems

**Symptoms**:
- Works in other browsers but not Chrome
- Chrome DevTools shows specific errors
- Chrome extensions interfering

**Solutions**:

1. **Disable Extensions**:
```javascript
// Test in incognito mode to disable extensions
// Or disable specific extensions that might interfere
```

2. **Check Chrome Version**:
```javascript
// Ensure Chrome version is supported
const chromeVersion = navigator.userAgent.match(/Chrome\/(\d+)/);
console.log('Chrome version:', chromeVersion[1]);
```

### Issue: Safari-Specific Problems

**Symptoms**:
- Works in other browsers but not Safari
- Safari-specific JavaScript errors
- Different behavior on iOS Safari

**Solutions**:

1. **Check Safari Compatibility**:
```javascript
// Test Safari-specific features
if (typeof window !== 'undefined') {
  console.log('Safari version:', navigator.userAgent);
  console.log('WebKit version:', navigator.userAgent.match(/Version\/(\d+)/));
}
```

2. **Handle Safari Quirks**:
```typescript
// Safari has different behavior for some APIs
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (isSafari) {
  // Handle Safari-specific code
}
```

## Mobile Issues

### Issue: Touch Events Not Working

**Symptoms**:
- Sync button not responding to touch
- Touch events not firing
- Mobile-specific UI issues

**Solutions**:

1. **Add Touch Event Handlers**:
```typescript
const handleTouchStart = (e) => {
  e.preventDefault();
  handleSync();
};

<button
  onTouchStart={handleTouchStart}
  onClick={handleSync}
>
  Sync
</button>
```

2. **Optimize for Mobile**:
```css
/* Ensure buttons are touch-friendly */
.sync-button {
  min-height: 44px; /* iOS minimum touch target */
  min-width: 44px;
  touch-action: manipulation;
}
```

### Issue: Mobile Layout Issues

**Symptoms**:
- Sync buttons not visible on mobile
- Layout breaks on small screens
- Text too small to read

**Solutions**:

1. **Responsive Design**:
```css
/* Mobile-first responsive design */
.sync-button {
  padding: 12px 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .sync-button {
    padding: 16px 20px;
    font-size: 16px;
  }
}
```

2. **Mobile-Specific Styling**:
```typescript
// Detect mobile and adjust UI
const isMobile = window.innerWidth < 768;

<SyncPlatformButton
  platform={platform}
  platformData={platformData}
  variant={isMobile ? 'compact' : 'default'}
/>
```

## Development Issues

### Issue: Hot Reload Not Working

**Symptoms**:
- Changes not reflected after saving
- Need to manually refresh browser
- Development server not updating

**Solutions**:

1. **Restart Dev Server**:
```bash
# Stop current server (Ctrl+C)
npm run dev
# Or
yarn dev
```

2. **Clear Next.js Cache**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

3. **Check File Watching**:
```bash
# Check if file watching is working
# On Windows, might need to increase file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Issue: TypeScript Errors

**Symptoms**:
- TypeScript compilation errors
- Type mismatches
- Build failing

**Solutions**:

1. **Check Type Definitions**:
```typescript
// Ensure all types are properly defined
interface SyncPlatformButtonProps {
  platform: PlatformType;
  platformData: UnifiedPlatformData;
  variant?: 'default' | 'compact';
  onSyncComplete?: () => void;
}
```

2. **Fix Type Errors**:
```typescript
// Add proper type assertions
const platformData = data as UnifiedPlatformData;

// Use proper type guards
if (typeof platformData.followers === 'number') {
  // Safe to use platformData.followers
}
```

## Production Issues

### Issue: Build Fails

**Symptoms**:
- `npm run build` fails
- TypeScript errors in production
- Missing dependencies

**Solutions**:

1. **Check Build Logs**:
```bash
# Run build with verbose output
npm run build -- --verbose

# Check for specific errors
npm run build 2>&1 | grep -i error
```

2. **Fix TypeScript Errors**:
```typescript
// Ensure all files have proper types
// Add @ts-ignore for complex cases
// @ts-ignore
const complexData = someComplexObject;
```

3. **Check Dependencies**:
```bash
# Ensure all dependencies are installed
npm install

# Check for peer dependency warnings
npm install --legacy-peer-deps
```

### Issue: Environment Variables Missing

**Symptoms**:
- API calls fail in production
- Environment variables not loaded
- Different behavior in production

**Solutions**:

1. **Check Environment Variables**:
```bash
# Check if environment variables are set
echo $NEXT_PUBLIC_API_BASE_URL
echo $RAPIDAPI_KEY
```

2. **Configure Production Environment**:
```env
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api-hyperbuds-backend.onrender.com/api/v1
RAPIDAPI_KEY=your_production_key
```

3. **Use Fallback Values**:
```typescript
// Provide fallback values
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
  'https://api-hyperbuds-backend.onrender.com/api/v1';
```

## Debug Tools

### Browser DevTools

1. **Console Debugging**:
```javascript
// Add debug logs
console.log('Platform data:', platformData);
console.log('Sync state:', isSyncing);
console.log('Auth token:', localStorage.getItem('accessToken'));

// Check network requests
// DevTools → Network → Filter by "sync"
```

2. **React DevTools**:
```javascript
// Install React DevTools extension
// Check component props and state
// Monitor React Query cache
```

3. **Performance Profiling**:
```javascript
// Use Performance tab in DevTools
// Record performance during sync
// Check for memory leaks
```

### Logging

1. **Frontend Logging**:
```typescript
// Add comprehensive logging
const logSyncEvent = (event, data) => {
  console.log(`[SYNC] ${event}:`, {
    timestamp: new Date().toISOString(),
    platform: data.platform,
    followers: data.followers,
    ...data
  });
};
```

2. **Backend Logging**:
```javascript
// Add backend logging
const logSyncRequest = (platform, data, userId) => {
  console.log(`[BACKEND] Sync request:`, {
    platform,
    followers: data.followers,
    userId,
    timestamp: new Date().toISOString()
  });
};
```

### Testing Tools

1. **API Testing**:
```bash
# Use curl to test API endpoints
curl -X POST "https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followers": 1000, "engagement": 7.5}'
```

2. **Network Testing**:
```javascript
// Test network connectivity
const testNetwork = async () => {
  try {
    const response = await fetch('https://api-hyperbuds-backend.onrender.com/health');
    const data = await response.json();
    console.log('Network test:', data);
  } catch (error) {
    console.error('Network test failed:', error);
  }
};
```

## Getting Help

### When to Escalate

Escalate to the development team if:
- Issue persists after trying all solutions
- Backend API is completely down
- Security-related issues
- Data corruption or loss

### Information to Provide

When reporting issues, include:
1. **Browser and version**
2. **Operating system**
3. **Steps to reproduce**
4. **Console errors**
5. **Network request details**
6. **Screenshots or videos**

### Contact Information

- **Development Team**: [team@hyperbuds.com]
- **Bug Reports**: [GitHub Issues]
- **Documentation**: [Internal Wiki]

---

This troubleshooting guide should help resolve most common issues with the Social Media Sync feature. If you encounter an issue not covered here, please document it and add it to this guide for future reference.
