# Social Sync Testing Guide

## Overview

This comprehensive testing guide covers all aspects of testing the Social Media Sync feature, from manual testing to automated testing strategies.

## Table of Contents

1. [Manual Testing](#manual-testing)
2. [Automated Testing](#automated-testing)
3. [API Testing](#api-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Browser Testing](#browser-testing)
7. [Mobile Testing](#mobile-testing)
8. [Error Scenarios](#error-scenarios)
9. [Test Data Setup](#test-data-setup)
10. [Troubleshooting](#troubleshooting)

## Manual Testing

### Prerequisites

- ✅ Backend API running
- ✅ Frontend dev server running (`npm run dev`)
- ✅ User logged in with valid token
- ✅ Social media links configured in profile
- ✅ Browser DevTools open (F12)

### Test Scenarios

#### 1. Basic Sync Functionality

**Test Case**: Sync TikTok data successfully

**Steps**:
1. Navigate to `http://localhost:3000/profile/platform-analytics`
2. Wait for platform data to load (5-10 seconds)
3. Locate TikTok card (pink/red gradient)
4. Click "Sync" button
5. Verify button changes to "Syncing..." with spinning icon
6. Wait for completion (~1-2 seconds)
7. Verify success indicators:
   - Button shows "Successfully Synced!" in green
   - Toast notification: "Sync successful! TIKTOK data synced to your profile"
   - Button returns to "Sync" after 3 seconds

**Expected Result**: ✅ Sync completes successfully

#### 2. Multiple Platform Sync

**Test Case**: Sync all platforms (TikTok, Twitter, Twitch)

**Steps**:
1. Sync TikTok (as above)
2. Wait for TikTok sync to complete
3. Sync Twitter (blue card)
4. Wait for Twitter sync to complete
5. Sync Twitch (purple card)
6. Wait for Twitch sync to complete

**Expected Result**: ✅ All platforms sync successfully

#### 3. Data Persistence

**Test Case**: Verify synced data persists

**Steps**:
1. Complete sync for all platforms
2. Navigate away from page (go to Dashboard)
3. Navigate back to `/profile/platform-analytics`
4. Verify data is still displayed
5. Check profile page for updated `totalFollowers`

**Expected Result**: ✅ Data persists across page refreshes

#### 4. Error Handling

**Test Case**: Handle sync failures gracefully

**Steps**:
1. Disconnect internet connection
2. Click sync button
3. Verify error toast appears
4. Reconnect internet
5. Click sync button again
6. Verify sync succeeds

**Expected Result**: ✅ Error handling works, retry succeeds

### Visual Verification Checklist

#### Button States

- [ ] **Idle State**: Blue button with "Sync" text and database icon
- [ ] **Loading State**: Spinning refresh icon with "Syncing..." text
- [ ] **Success State**: Green button with checkmark and "Synced!" text
- [ ] **Disabled State**: Gray button with "No Data" text (when no valid data)

#### UI Elements

- [ ] **Platform Cards**: Display correct follower counts and engagement
- [ ] **Sync Buttons**: Appear on all platform cards when enabled
- [ ] **Toast Notifications**: Success and error messages appear correctly
- [ ] **Loading States**: Smooth transitions between states
- [ ] **Responsive Design**: Works on different screen sizes

## Automated Testing

### Unit Tests

#### SyncPlatformButton Component

```typescript
// src/components/collaboration/__tests__/SyncPlatformButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncPlatformButton } from '../SyncPlatformButton';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SyncPlatformButton', () => {
  const mockPlatformData = {
    platform: 'tiktok' as const,
    username: 'test_user',
    displayName: 'Test User',
    profileImage: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    verified: false,
    followers: 1000,
    following: 500,
    totalContent: 100,
    totalEngagement: 5000,
    averageEngagement: 5.0,
    lastFetched: new Date(),
  };

  it('renders sync button with valid data', () => {
    render(
      <SyncPlatformButton
        platform="tiktok"
        platformData={mockPlatformData}
        variant="compact"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Sync')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('disables button when no valid data', () => {
    const invalidData = { ...mockPlatformData, followers: 0 };
    
    render(
      <SyncPlatformButton
        platform="tiktok"
        platformData={invalidData}
        variant="compact"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state during sync', async () => {
    render(
      <SyncPlatformButton
        platform="tiktok"
        platformData={mockPlatformData}
        variant="compact"
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });
  });
});
```

#### useSocialSync Hook

```typescript
// src/hooks/features/__tests__/useSocialSync.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSocialSync } from '../useSocialSync';
import * as profileApi from '@/lib/api/profile.api';

// Mock the API
jest.mock('@/lib/api/profile.api');
const mockProfileApi = profileApi as jest.Mocked<typeof profileApi>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSocialSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('syncs platform data successfully', async () => {
    const mockResponse = {
      success: true,
      message: 'Sync successful',
      profile: { stats: { platformBreakdown: { tiktok: { followers: 1000 } } } }
    };

    mockProfileApi.syncTikTok.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSocialSync(), {
      wrapper: createWrapper(),
    });

    const platformData = {
      platform: 'tiktok' as const,
      followers: 1000,
      averageEngagement: 5.0,
    } as any;

    await waitFor(async () => {
      await result.current.syncPlatform('tiktok', platformData);
    });

    expect(mockProfileApi.syncTikTok).toHaveBeenCalledWith({
      followers: 1000,
    });
  });

  it('handles sync errors', async () => {
    const mockError = new Error('Sync failed');
    mockProfileApi.syncTikTok.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSocialSync(), {
      wrapper: createWrapper(),
    });

    const platformData = {
      platform: 'tiktok' as const,
      followers: 1000,
      averageEngagement: 5.0,
    } as any;

    await expect(
      result.current.syncPlatform('tiktok', platformData)
    ).rejects.toThrow('Sync failed');
  });
});
```

### Integration Tests

#### Platform Analytics Page

```typescript
// src/app/profile/platform-analytics/__tests__/page.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PlatformAnalyticsPage from '../page';

// Mock API responses
const mockUserProfile = {
  profile: {
    socialLinks: {
      tiktok: 'https://tiktok.com/@test_user',
      twitter: 'https://twitter.com/test_user',
      twitch: 'https://twitch.tv/test_user',
    }
  }
};

const mockPlatformData = {
  tiktok: {
    platform: 'tiktok',
    username: 'test_user',
    followers: 1000,
    averageEngagement: 5.0,
  },
  twitter: {
    platform: 'twitter',
    username: 'test_user',
    followers: 500,
    averageEngagement: 3.0,
  },
  twitch: {
    platform: 'twitch',
    username: 'test_user',
    followers: 200,
    averageEngagement: 2.0,
  },
};

describe('PlatformAnalyticsPage', () => {
  it('renders platform cards with sync buttons', async () => {
    // Mock API calls
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockUserProfile }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPlatformData }),
      });

    render(<PlatformAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('TikTok')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Twitch')).toBeInTheDocument();
    });

    // Check sync buttons are present
    const syncButtons = screen.getAllByText('Sync');
    expect(syncButtons).toHaveLength(3);
  });

  it('handles sync button clicks', async () => {
    // Mock successful sync
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockUserProfile }),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPlatformData }),
      });

    render(<PlatformAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('TikTok')).toBeInTheDocument();
    });

    // Click sync button
    const syncButton = screen.getAllByText('Sync')[0];
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });
  });
});
```

## API Testing

### Backend API Tests

#### Sync Endpoint Tests

```javascript
// tests/api/sync.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Social Sync API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup test user and get auth token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  describe('POST /api/v1/profiles/social-sync/tiktok', () => {
    it('should sync TikTok data successfully', async () => {
      const syncData = {
        followers: 1000,
        engagement: 7.5
      };

      const response = await request(app)
        .post('/api/v1/profiles/social-sync/tiktok')
        .set('Authorization', `Bearer ${authToken}`)
        .send(syncData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Tiktok synced successfully');
      expect(response.body.profile.stats.platformBreakdown.tiktok).toEqual(syncData);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        engagement: 7.5
        // missing followers
      };

      const response = await request(app)
        .post('/api/v1/profiles/social-sync/tiktok')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.details[0].message).toContain('followers');
    });

    it('should require authentication', async () => {
      const syncData = { followers: 1000 };

      await request(app)
        .post('/api/v1/profiles/social-sync/tiktok')
        .send(syncData)
        .expect(401);
    });
  });

  describe('POST /api/v1/profiles/social-sync/twitch', () => {
    it('should sync Twitch data successfully', async () => {
      const syncData = {
        followers: 500,
        engagement: 3.2
      };

      const response = await request(app)
        .post('/api/v1/profiles/social-sync/twitch')
        .set('Authorization', `Bearer ${authToken}`)
        .send(syncData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.profile.stats.platformBreakdown.twitch).toEqual(syncData);
    });
  });
});
```

### Frontend API Tests

#### Platform Data API

```typescript
// tests/api/platform.test.ts
import { GET } from '@/app/api/platform/[type]/route';
import { NextRequest } from 'next/server';

describe('Platform API Route', () => {
  it('should return mock data when RapidAPI key is not configured', async () => {
    const request = new NextRequest('http://localhost:3000/api/platform/tiktok?username=test_user');
    
    const response = await GET(request, {
      params: Promise.resolve({ type: 'tiktok' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.platform).toBe('tiktok');
    expect(data.data.username).toBe('test_user');
    expect(typeof data.data.followers).toBe('number');
    expect(data.mock).toBe(true);
  });

  it('should validate platform type', async () => {
    const request = new NextRequest('http://localhost:3000/api/platform/invalid?username=test_user');
    
    const response = await GET(request, {
      params: Promise.resolve({ type: 'invalid' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid platform type');
  });

  it('should require username parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/platform/tiktok');
    
    const response = await GET(request, {
      params: Promise.resolve({ type: 'tiktok' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Username is required');
  });
});
```

## Performance Testing

### Load Testing

#### Sync Endpoint Load Test

```javascript
// tests/performance/sync-load.test.js
const loadtest = require('loadtest');

describe('Sync Endpoint Performance', () => {
  it('should handle 100 concurrent sync requests', (done) => {
    const options = {
      url: 'https://api-hyperbuds-backend.onrender.com/api/v1/profiles/social-sync/tiktok',
      maxRequests: 100,
      concurrency: 10,
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        followers: 1000,
        engagement: 7.5
      })
    };

    loadtest.loadTest(options, (error, result) => {
      expect(error).toBeNull();
      expect(result.totalRequests).toBe(100);
      expect(result.meanLatency).toBeLessThan(2000); // 2 seconds
      expect(result.errorCount).toBe(0);
      done();
    });
  });
});
```

### Memory Testing

```javascript
// tests/performance/memory.test.js
const { performance, memory } = require('perf_hooks');

describe('Memory Usage', () => {
  it('should not leak memory during sync operations', async () => {
    const initialMemory = process.memoryUsage();
    
    // Perform 100 sync operations
    for (let i = 0; i < 100; i++) {
      await syncPlatform('tiktok', { followers: 1000 + i });
    }
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // Memory increase should be less than 50MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## Security Testing

### Authentication Tests

```javascript
// tests/security/auth.test.js
describe('Sync Security', () => {
  it('should reject requests without authentication', async () => {
    const response = await request(app)
      .post('/api/v1/profiles/social-sync/tiktok')
      .send({ followers: 1000 })
      .expect(401);

    expect(response.body.message).toBe('Unauthorized');
  });

  it('should reject requests with invalid token', async () => {
    const response = await request(app)
      .post('/api/v1/profiles/social-sync/tiktok')
      .set('Authorization', 'Bearer invalid-token')
      .send({ followers: 1000 })
      .expect(403);

    expect(response.body.message).toBe('Forbidden');
  });

  it('should validate input data', async () => {
    const maliciousData = {
      followers: -1000, // Negative followers
      engagement: 150,  // Invalid engagement
      script: '<script>alert("xss")</script>' // XSS attempt
    };

    const response = await request(app)
      .post('/api/v1/profiles/social-sync/tiktok')
      .set('Authorization', `Bearer ${validToken}`)
      .send(maliciousData)
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });
});
```

### Input Validation Tests

```javascript
// tests/security/validation.test.js
describe('Input Validation', () => {
  it('should sanitize follower counts', async () => {
    const response = await request(app)
      .post('/api/v1/profiles/social-sync/tiktok')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ followers: '1000abc', engagement: 7.5 })
      .expect(400);

    expect(response.body.details[0].message).toContain('followers');
  });

  it('should limit engagement values', async () => {
    const response = await request(app)
      .post('/api/v1/profiles/social-sync/tiktok')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ followers: 1000, engagement: 150 })
      .expect(400);

    expect(response.body.details[0].message).toContain('engagement');
  });
});
```

## Browser Testing

### Cross-Browser Compatibility

#### Test Matrix

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 90+ | ✅ | Primary browser |
| Firefox | 88+ | ✅ | Full support |
| Safari | 14+ | ✅ | Full support |
| Edge | 90+ | ✅ | Full support |
| Mobile Safari | 14+ | ✅ | iOS support |
| Chrome Mobile | 90+ | ✅ | Android support |

#### Browser-Specific Tests

```javascript
// tests/browser/compatibility.test.js
describe('Browser Compatibility', () => {
  it('should work in Chrome', async () => {
    const browser = await puppeteer.launch({ 
      product: 'chrome',
      headless: false 
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/profile/platform-analytics');
    
    // Test sync functionality
    await page.click('[data-testid="sync-tiktok"]');
    await page.waitForSelector('[data-testid="sync-success"]');
    
    await browser.close();
  });

  it('should work in Firefox', async () => {
    const browser = await puppeteer.launch({ 
      product: 'firefox',
      headless: false 
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/profile/platform-analytics');
    
    // Test sync functionality
    await page.click('[data-testid="sync-tiktok"]');
    await page.waitForSelector('[data-testid="sync-success"]');
    
    await browser.close();
  });
});
```

## Mobile Testing

### Responsive Design Tests

```javascript
// tests/mobile/responsive.test.js
describe('Mobile Responsiveness', () => {
  it('should work on mobile devices', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/profile/platform-analytics');
    
    // Check if sync buttons are visible and clickable
    const syncButtons = await page.$$('[data-testid^="sync-"]');
    expect(syncButtons.length).toBeGreaterThan(0);
    
    // Test touch interaction
    await page.tap('[data-testid="sync-tiktok"]');
    await page.waitForSelector('[data-testid="sync-loading"]');
    
    await browser.close();
  });
});
```

## Error Scenarios

### Network Error Tests

```typescript
// tests/errors/network.test.ts
describe('Network Error Handling', () => {
  it('should handle network timeout', async () => {
    // Mock network timeout
    jest.spyOn(global, 'fetch').mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 100)
      )
    );

    const { result } = renderHook(() => useSocialSync(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.syncPlatform('tiktok', mockPlatformData)
    ).rejects.toThrow('Network timeout');
  });

  it('should handle server error', async () => {
    // Mock server error
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Internal server error' })
    } as Response);

    const { result } = renderHook(() => useSocialSync(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.syncPlatform('tiktok', mockPlatformData)
    ).rejects.toThrow();
  });
});
```

### Data Validation Error Tests

```typescript
// tests/errors/validation.test.ts
describe('Data Validation Errors', () => {
  it('should handle missing follower data', async () => {
    const invalidData = {
      platform: 'tiktok' as const,
      followers: 0, // Invalid
      averageEngagement: 5.0,
    } as any;

    render(
      <SyncPlatformButton
        platform="tiktok"
        platformData={invalidData}
        variant="compact"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should handle invalid platform data', async () => {
    const invalidData = {
      platform: 'tiktok' as const,
      followers: 'invalid', // Invalid type
      averageEngagement: 5.0,
    } as any;

    render(
      <SyncPlatformButton
        platform="tiktok"
        platformData={invalidData}
        variant="compact"
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});
```

## Test Data Setup

### Mock Data Factory

```typescript
// tests/factories/platformDataFactory.ts
export const createMockPlatformData = (overrides = {}) => ({
  platform: 'tiktok' as const,
  username: 'test_user',
  displayName: 'Test User',
  profileImage: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  verified: false,
  followers: 1000,
  following: 500,
  totalContent: 100,
  totalEngagement: 5000,
  averageEngagement: 5.0,
  lastFetched: new Date(),
  ...overrides,
});

export const createMockUserProfile = (overrides = {}) => ({
  profile: {
    socialLinks: {
      tiktok: 'https://tiktok.com/@test_user',
      twitter: 'https://twitter.com/test_user',
      twitch: 'https://twitch.tv/test_user',
    }
  },
  ...overrides,
});

export const createMockSyncResponse = (platform: string, data: any) => ({
  success: true,
  message: `Social media ${platform} synced successfully`,
  profile: {
    stats: {
      platformBreakdown: {
        [platform]: data
      },
      totalFollowers: data.followers,
      avgEngagement: data.engagement || 0
    }
  }
});
```

### Test Database Setup

```javascript
// tests/setup/database.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clean database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

## Troubleshooting

### Common Issues

#### 1. Sync Button Not Appearing

**Symptoms**: No sync buttons visible on platform cards

**Causes**:
- `showSyncButtons` prop not set to `true`
- Platform data not loaded
- Component not properly imported

**Solutions**:
```typescript
// Check PlatformStats usage
<PlatformStats
  platformCredentials={platformCreds}
  showSyncButtons={true}  // ← Must be true
  // ... other props
/>
```

#### 2. Sync Fails with 401 Error

**Symptoms**: "Unauthorized" error when syncing

**Causes**:
- Invalid or expired token
- Missing authentication header

**Solutions**:
```javascript
// Check token in localStorage
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Check API client headers
// src/lib/api/client.ts should include:
config.headers.Authorization = `Bearer ${token}`;
```

#### 3. Sync Button Stuck in Loading

**Symptoms**: Button shows "Syncing..." forever

**Causes**:
- Backend not responding
- Network error
- JavaScript error

**Solutions**:
```typescript
// Add error handling
const handleSync = async () => {
  try {
    await syncPlatform(platform, platformData);
  } catch (error) {
    console.error('Sync error:', error);
    // Reset button state
    setJustSynced(false);
  }
};
```

#### 4. Data Not Persisting

**Symptoms**: Synced data disappears after refresh

**Causes**:
- Backend not saving data
- Cache not invalidating
- Database connection issues

**Solutions**:
```typescript
// Check cache invalidation
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ['profile'] });
  // Force refetch
  queryClient.refetchQueries({ queryKey: ['profile'] });
}
```

### Debug Tools

#### Browser DevTools

```javascript
// Console debugging
console.log('Platform data:', platformData);
console.log('Sync state:', isSyncing);
console.log('Auth token:', localStorage.getItem('accessToken'));

// Network debugging
// Check Network tab for:
// - POST requests to /api/v1/profiles/social-sync/*
// - Request headers (Authorization)
// - Request body (followers, engagement)
// - Response status and body
```

#### React DevTools

```javascript
// Component debugging
// - Check SyncPlatformButton props
// - Verify platformData structure
// - Check useSocialSync hook state
// - Monitor React Query cache
```

### Performance Debugging

```javascript
// Measure sync performance
const startTime = performance.now();
await syncPlatform('tiktok', platformData);
const endTime = performance.now();
console.log(`Sync took ${endTime - startTime} milliseconds`);

// Memory usage
console.log('Memory usage:', performance.memory);
```

## Test Automation

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Social Sync Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit tests
      run: npm run test:unit
      
    - name: Run integration tests
      run: npm run test:integration
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Upload coverage
      uses: codecov/codecov-action@v1
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

## Summary

This comprehensive testing guide covers:

- ✅ **Manual Testing**: Step-by-step user scenarios
- ✅ **Automated Testing**: Unit, integration, and E2E tests
- ✅ **API Testing**: Backend endpoint validation
- ✅ **Performance Testing**: Load and memory testing
- ✅ **Security Testing**: Authentication and validation
- ✅ **Browser Testing**: Cross-browser compatibility
- ✅ **Mobile Testing**: Responsive design validation
- ✅ **Error Scenarios**: Comprehensive error handling
- ✅ **Test Data Setup**: Mock data and database setup
- ✅ **Troubleshooting**: Common issues and solutions

The testing strategy ensures the Social Media Sync feature is robust, reliable, and user-friendly across all platforms and scenarios.
