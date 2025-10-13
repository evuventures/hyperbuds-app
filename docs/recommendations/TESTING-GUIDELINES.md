# Testing Guidelines - Recommendations Feature

## 🧪 Testing Overview

This document outlines comprehensive testing strategies for the Recommendations feature, including unit tests, integration tests, and end-to-end testing scenarios.

## 📋 Testing Checklist

### **Phase 1: Unit Tests**
- [ ] Database query functions
- [ ] Business logic functions
- [ ] Input validation
- [ ] Error handling
- [ ] Data transformation utilities

### **Phase 2: Integration Tests**
- [ ] API endpoint responses
- [ ] Database transactions
- [ ] Authentication flow
- [ ] Rate limiting
- [ ] Error scenarios

### **Phase 3: End-to-End Tests**
- [ ] Complete user workflows
- [ ] UI interactions
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

---

## 🔧 Unit Testing

### **Test Framework Setup**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### **Database Query Tests**

#### **Test: Get User Recommendations**
```javascript
// tests/unit/recommendations.test.js
const { getRecommendations } = require('../../src/services/recommendations');

describe('getRecommendations', () => {
  beforeEach(() => {
    // Mock database connection
    jest.clearAllMocks();
  });

  test('should return paginated recommendations for valid user', async () => {
    const userId = 1;
    const limit = 10;
    const offset = 0;

    const result = await getRecommendations(userId, limit, offset);

    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('hasMore');
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations.length).toBeLessThanOrEqual(limit);
  });

  test('should return empty array for user with no recommendations', async () => {
    const userId = 999; // Non-existent user
    const result = await getRecommendations(userId, 10, 0);

    expect(result.recommendations).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  test('should handle invalid pagination parameters', async () => {
    const userId = 1;
    const invalidLimit = -1;
    const invalidOffset = -1;

    await expect(getRecommendations(userId, invalidLimit, invalidOffset))
      .rejects.toThrow('Invalid pagination parameters');
  });
});
```

#### **Test: Give Another Chance**
```javascript
describe('giveAnotherChance', () => {
  test('should successfully give another chance to valid creator', async () => {
    const userId = 1;
    const creatorId = 123;

    const result = await giveAnotherChance(userId, creatorId);

    expect(result.success).toBe(true);
    expect(result.creatorId).toBe(creatorId);
    expect(result.message).toContain('added to your matches');
  });

  test('should throw error for non-existent creator', async () => {
    const userId = 1;
    const creatorId = 999; // Non-existent creator

    await expect(giveAnotherChance(userId, creatorId))
      .rejects.toThrow('Creator not found in your recommendations');
  });

  test('should throw error for creator already in matches', async () => {
    const userId = 1;
    const creatorId = 124; // Already in matches

    await expect(giveAnotherChance(userId, creatorId))
      .rejects.toThrow('Creator is already in your matches');
  });
});
```

### **Business Logic Tests**

#### **Test: Overlap Calculation**
```javascript
// tests/unit/overlap.test.js
const { calculateOverlap } = require('../../src/utils/overlap');

describe('calculateOverlap', () => {
  test('should calculate overlap percentage correctly', () => {
    const userAudience = { demographics: { age: '25-34', location: 'US' } };
    const creatorAudience = { demographics: { age: '25-34', location: 'US' } };

    const overlap = calculateOverlap(userAudience, creatorAudience);

    expect(overlap).toBeGreaterThanOrEqual(0);
    expect(overlap).toBeLessThanOrEqual(100);
    expect(typeof overlap).toBe('number');
  });

  test('should handle missing audience data', () => {
    const userAudience = null;
    const creatorAudience = { demographics: { age: '25-34' } };

    const overlap = calculateOverlap(userAudience, creatorAudience);

    expect(overlap).toBe(0);
  });
});
```

---

## 🔗 Integration Testing

### **API Endpoint Tests**

#### **Test: GET /api/recommendations**
```javascript
// tests/integration/recommendations-api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/recommendations', () => {
  let authToken;

  beforeAll(async () => {
    // Setup test user and get auth token
    authToken = await createTestUserAndGetToken();
  });

  test('should return recommendations with valid auth', async () => {
    const response = await request(app)
      .get('/api/recommendations?limit=5&offset=0')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('recommendations');
    expect(response.body.data).toHaveProperty('total');
    expect(response.body.data).toHaveProperty('hasMore');
  });

  test('should return 401 without auth token', async () => {
    const response = await request(app)
      .get('/api/recommendations')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('UNAUTHORIZED');
  });

  test('should return 400 for invalid pagination', async () => {
    const response = await request(app)
      .get('/api/recommendations?limit=-1&offset=-1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('VALIDATION_ERROR');
  });

  test('should respect rate limiting', async () => {
    // Make 101 requests to trigger rate limit
    for (let i = 0; i < 101; i++) {
      await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${authToken}`);
    }

    const response = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(429);

    expect(response.body.error).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

#### **Test: POST /api/recommendations/give-chance**
```javascript
describe('POST /api/recommendations/give-chance', () => {
  test('should successfully give another chance', async () => {
    const response = await request(app)
      .post('/api/recommendations/give-chance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ creatorId: 123 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.creatorId).toBe(123);
  });

  test('should return 400 for missing creatorId', async () => {
    const response = await request(app)
      .post('/api/recommendations/give-chance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Creator ID is required');
  });

  test('should return 404 for non-existent creator', async () => {
    const response = await request(app)
      .post('/api/recommendations/give-chance')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ creatorId: 999 })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('NOT_FOUND');
  });
});
```

### **Database Transaction Tests**

#### **Test: Give Another Chance Transaction**
```javascript
// tests/integration/transactions.test.js
const { giveAnotherChance } = require('../../src/services/recommendations');
const db = require('../../src/database/connection');

describe('Give Another Chance Transaction', () => {
  test('should update both user_matches and user_recommendations', async () => {
    const userId = 1;
    const creatorId = 123;

    // Start transaction
    await db.beginTransaction();

    try {
      const result = await giveAnotherChance(userId, creatorId);

      // Verify user_matches was updated
      const match = await db.query(
        'SELECT action FROM user_matches WHERE user_id = ? AND target_user_id = ?',
        [userId, creatorId]
      );
      expect(match[0].action).toBe('like');

      // Verify user_recommendations was updated
      const recommendation = await db.query(
        'SELECT status FROM user_recommendations WHERE user_id = ? AND recommended_user_id = ?',
        [userId, creatorId]
      );
      expect(recommendation[0].status).toBe('accepted');

      await db.commit();
    } catch (error) {
      await db.rollback();
      throw error;
    }
  });

  test('should rollback on error', async () => {
    const userId = 1;
    const creatorId = 999; // Non-existent creator

    await db.beginTransaction();

    try {
      await giveAnotherChance(userId, creatorId);
      fail('Should have thrown an error');
    } catch (error) {
      await db.rollback();
      
      // Verify no changes were made
      const match = await db.query(
        'SELECT action FROM user_matches WHERE user_id = ? AND target_user_id = ?',
        [userId, creatorId]
      );
      expect(match).toHaveLength(0);
    }
  });
});
```

---

## 🎭 End-to-End Testing

### **Playwright E2E Tests**

#### **Test: Complete Recommendations Workflow**
```javascript
// tests/e2e/recommendations.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Recommendations Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to dashboard
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should display recommendations section', async ({ page }) => {
    // Check if recommendations section is visible
    await expect(page.locator('[data-testid="recommendations-section"]')).toBeVisible();
    
    // Check if "No recommendations yet" message is shown
    await expect(page.locator('text=No recommendations yet')).toBeVisible();
    
    // Check if "Get Match" button is present
    await expect(page.locator('[data-testid="get-match-button"]')).toBeVisible();
  });

  test('should load and display recommendation cards', async ({ page }) => {
    // Mock API response
    await page.route('**/api/recommendations**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            recommendations: [
              {
                id: 123,
                name: 'Sophie Chen',
                role: 'Art Director',
                followers: '19K',
                overlap: '75%',
                synergy: '88%',
                img: '/images/test-avatar.jpg',
                location: 'Portland, OR',
                responseTime: '< 2 hours',
                collaborationRate: '$300-800',
                rizzScore: 89,
                verified: true,
                online: true,
                specialties: ['Design', 'Art', 'Branding'],
                recentWork: 'Brand Identity Project',
                passedAt: '3 days ago'
              }
            ],
            total: 1,
            hasMore: false
          }
        })
      });
    });

    // Reload page to trigger API call
    await page.reload();
    
    // Check if recommendation card is displayed
    await expect(page.locator('[data-testid="recommendation-card-123"]')).toBeVisible();
    await expect(page.locator('text=Sophie Chen')).toBeVisible();
    await expect(page.locator('text=Art Director')).toBeVisible();
    await expect(page.locator('text=19K')).toBeVisible();
  });

  test('should handle give another chance action', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/recommendations**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            recommendations: [/* mock data */],
            total: 1,
            hasMore: false
          }
        })
      });
    });

    await page.route('**/api/recommendations/give-chance**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            creatorId: 123,
            message: 'Creator has been added to your matches!'
          }
        })
      });
    });

    await page.reload();
    
    // Click "Accept" button
    await page.click('[data-testid="accept-button-123"]');
    
    // Check if success message is shown
    await expect(page.locator('text=Creator has been added to your matches!')).toBeVisible();
    
    // Check if button state changed
    await expect(page.locator('[data-testid="accept-button-123"]')).toHaveText('Already Accepted!');
  });

  test('should handle permanently pass action', async ({ page }) => {
    // Similar test for permanently pass functionality
    await page.click('[data-testid="pass-button-123"]');
    
    // Check if confirmation dialog appears
    await expect(page.locator('[data-testid="confirm-pass-dialog"]')).toBeVisible();
    
    // Confirm the action
    await page.click('[data-testid="confirm-pass-button"]');
    
    // Check if card is removed
    await expect(page.locator('[data-testid="recommendation-card-123"]')).not.toBeVisible();
  });

  test('should handle loading and error states', async ({ page }) => {
    // Test loading state
    await page.route('**/api/recommendations**', async route => {
      // Delay response to show loading state
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { recommendations: [], total: 0, hasMore: false }
        })
      });
    });

    await page.reload();
    
    // Check if loading spinner is shown
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for loading to complete
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // Check if recommendations section is properly displayed on mobile
    await expect(page.locator('[data-testid="recommendations-section"]')).toBeVisible();
    
    // Check if cards are properly stacked
    const cards = page.locator('[data-testid^="recommendation-card-"]');
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    
    // Check if buttons are properly sized for mobile
    const acceptButton = firstCard.locator('[data-testid^="accept-button-"]');
    await expect(acceptButton).toBeVisible();
  });
});
```

---

## 🚀 Performance Testing

### **Load Testing with Artillery**
```yaml
# tests/performance/recommendations-load.yml
config:
  target: 'https://api.hyperbuds.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Authorization: 'Bearer {{ $processEnvironment.JWT_TOKEN }}'

scenarios:
  - name: "Get Recommendations"
    weight: 70
    flow:
      - get:
          url: "/api/recommendations?limit=10&offset=0"
          expect:
            - statusCode: 200
            - hasProperty: "success"
            - hasProperty: "data.recommendations"

  - name: "Give Another Chance"
    weight: 20
    flow:
      - post:
          url: "/api/recommendations/give-chance"
          json:
            creatorId: "{{ $randomInt(1, 1000) }}"
          expect:
            - statusCode: [200, 404] # 404 is expected for non-existent creators

  - name: "Permanently Pass"
    weight: 10
    flow:
      - post:
          url: "/api/recommendations/permanently-pass"
          json:
            creatorId: "{{ $randomInt(1, 1000) }}"
          expect:
            - statusCode: [200, 404] # 404 is expected for non-existent creators
```

### **Database Performance Tests**
```javascript
// tests/performance/database.test.js
const { performance } = require('perf_hooks');
const { getRecommendations } = require('../../src/services/recommendations');

describe('Database Performance', () => {
  test('should fetch recommendations within 500ms', async () => {
    const start = performance.now();
    
    await getRecommendations(1, 10, 0);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(500);
  });

  test('should handle concurrent requests', async () => {
    const promises = Array(10).fill().map(() => 
      getRecommendations(1, 10, 0)
    );
    
    const start = performance.now();
    await Promise.all(promises);
    const end = performance.now();
    
    const duration = end - start;
    expect(duration).toBeLessThan(1000); // All requests within 1 second
  });
});
```

---

## 🔍 Security Testing

### **Authentication Tests**
```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  test('should reject requests without auth token', async () => {
    const response = await request(app)
      .get('/api/recommendations')
      .expect(401);

    expect(response.body.error).toBe('UNAUTHORIZED');
  });

  test('should reject requests with invalid auth token', async () => {
    const response = await request(app)
      .get('/api/recommendations')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.error).toBe('UNAUTHORIZED');
  });

  test('should reject requests with expired auth token', async () => {
    const expiredToken = generateExpiredJWT();
    
    const response = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.error).toBe('UNAUTHORIZED');
  });
});
```

### **Input Validation Tests**
```javascript
describe('Input Validation', () => {
  test('should reject invalid creator IDs', async () => {
    const invalidIds = ['abc', -1, 0, null, undefined, ''];

    for (const id of invalidIds) {
      const response = await request(app)
        .post('/api/recommendations/give-chance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ creatorId: id })
        .expect(400);

      expect(response.body.success).toBe(false);
    }
  });

  test('should reject SQL injection attempts', async () => {
    const maliciousInputs = [
      "'; DROP TABLE user_matches; --",
      "1 OR 1=1",
      "1 UNION SELECT * FROM users"
    ];

    for (const input of maliciousInputs) {
      const response = await request(app)
        .post('/api/recommendations/give-chance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ creatorId: input })
        .expect(400);

      expect(response.body.success).toBe(false);
    }
  });
});
```

---

## 📊 Test Coverage Requirements

### **Minimum Coverage Thresholds**
- **Unit Tests**: 90% line coverage
- **Integration Tests**: 80% line coverage
- **E2E Tests**: 70% user journey coverage

### **Coverage Report**
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
npm run test:coverage:report
```

---

## 🚀 Continuous Integration

### **GitHub Actions Workflow**
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

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
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Generate coverage report
        run: npm run test:coverage
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v1
```

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation
