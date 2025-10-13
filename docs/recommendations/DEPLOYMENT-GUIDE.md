# Deployment Guide - Recommendations Feature

## 🚀 Deployment Overview

This guide covers the complete deployment process for the Recommendations feature, including database migrations, environment setup, and monitoring configuration.

## 📋 Pre-Deployment Checklist

### **Backend Requirements**
- [ ] Database schema migrations created
- [ ] API endpoints implemented and tested
- [ ] Authentication middleware configured
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring setup

### **Frontend Requirements**
- [ ] Components implemented and tested
- [ ] API integration completed
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Dark mode support tested

### **Infrastructure Requirements**
- [ ] Database server ready
- [ ] Application server configured
- [ ] Load balancer configured
- [ ] CDN setup for static assets
- [ ] SSL certificates configured
- [ ] Monitoring tools configured

---

## 🗄️ Database Deployment

### **1. Schema Migration**

#### **Create Migration Files**
```sql
-- migrations/001_create_recommendations_tables.sql
-- Create user_matches table
CREATE TABLE IF NOT EXISTS user_matches (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'pass', 'permanently_pass')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id)
);

-- Create user_recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    recommended_user_id BIGINT NOT NULL,
    passed_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'permanently_passed', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recommended_user_id)
);

-- Create user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    display_name VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    role VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    avatar_url VARCHAR(500),
    followers_count INTEGER DEFAULT 0,
    rizz_score INTEGER DEFAULT 0 CHECK (rizz_score >= 0 AND rizz_score <= 100),
    verified BOOLEAN DEFAULT FALSE,
    online_status BOOLEAN DEFAULT FALSE,
    specialties TEXT[],
    response_time VARCHAR(50),
    collaboration_rate VARCHAR(100),
    recent_work VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Create Indexes Migration**
```sql
-- migrations/002_create_recommendations_indexes.sql
-- user_matches indexes
CREATE INDEX IF NOT EXISTS idx_user_matches_user_id ON user_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_action ON user_matches(action);
CREATE INDEX IF NOT EXISTS idx_user_matches_created_at ON user_matches(created_at);
CREATE INDEX IF NOT EXISTS idx_user_matches_user_action ON user_matches(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_matches_target_user ON user_matches(target_user_id);

-- user_recommendations indexes
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_status ON user_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_passed_at ON user_recommendations(passed_at);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_status ON user_recommendations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_status_created ON user_recommendations(status, created_at);

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_rizz_score ON user_profiles(rizz_score);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verified ON user_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_user_profiles_online ON user_profiles(online_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_specialties ON user_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location_rizz ON user_profiles(location, rizz_score);
```

### **2. Run Migrations**

#### **Production Database**
```bash
# Connect to production database
psql -h production-db.hyperbuds.com -U hyperbuds_user -d hyperbuds_prod

# Run migrations
\i migrations/001_create_recommendations_tables.sql
\i migrations/002_create_recommendations_indexes.sql

# Verify tables were created
\dt user_matches user_recommendations user_profiles

# Verify indexes were created
\di idx_user_matches_* idx_user_recommendations_* idx_user_profiles_*
```

#### **Staging Database**
```bash
# Connect to staging database
psql -h staging-db.hyperbuds.com -U hyperbuds_user -d hyperbuds_staging

# Run migrations
\i migrations/001_create_recommendations_tables.sql
\i migrations/002_create_recommendations_indexes.sql
```

### **3. Data Migration (if needed)**

#### **Migrate Existing Pass Data**
```sql
-- If you have existing pass data in a different format
INSERT INTO user_matches (user_id, target_user_id, action, created_at)
SELECT 
    user_id,
    target_user_id,
    'pass' as action,
    created_at
FROM old_matches_table 
WHERE action = 'pass';

-- Create initial recommendations
INSERT INTO user_recommendations (user_id, recommended_user_id, passed_at, status)
SELECT 
    user_id,
    target_user_id,
    created_at as passed_at,
    'active' as status
FROM user_matches 
WHERE action = 'pass';
```

---

## 🔧 Environment Configuration

### **1. Environment Variables**

#### **Production Environment**
```bash
# .env.production
# Database
DATABASE_URL=postgresql://hyperbuds_user:${DB_PASSWORD}@production-db.hyperbuds.com:5432/hyperbuds_prod
DB_POOL_SIZE=20
DB_TIMEOUT=30000

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=100

# Notifications
NOTIFICATION_SERVICE_URL=https://api.notifications.hyperbuds.com
NOTIFICATION_API_KEY=${NOTIFICATION_API_KEY}

# Analytics
ANALYTICS_ENDPOINT=https://api.analytics.hyperbuds.com
ANALYTICS_API_KEY=${ANALYTICS_API_KEY}

# Redis (for rate limiting)
REDIS_URL=redis://redis.hyperbuds.com:6379

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOG_LEVEL=info
```

#### **Staging Environment**
```bash
# .env.staging
# Database
DATABASE_URL=postgresql://hyperbuds_user:${DB_PASSWORD}@staging-db.hyperbuds.com:5432/hyperbuds_staging
DB_POOL_SIZE=10
DB_TIMEOUT=30000

# Authentication
JWT_SECRET=${JWT_SECRET_STAGING}
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW=3600000
RATE_LIMIT_MAX=50

# Notifications
NOTIFICATION_SERVICE_URL=https://staging-api.notifications.hyperbuds.com
NOTIFICATION_API_KEY=${NOTIFICATION_API_KEY_STAGING}

# Analytics
ANALYTICS_ENDPOINT=https://staging-api.analytics.hyperbuds.com
ANALYTICS_API_KEY=${ANALYTICS_API_KEY_STAGING}

# Redis
REDIS_URL=redis://staging-redis.hyperbuds.com:6379

# Monitoring
SENTRY_DSN=${SENTRY_DSN_STAGING}
LOG_LEVEL=debug
```

### **2. Application Configuration**

#### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=hyperbuds_prod
      - POSTGRES_USER=hyperbuds_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 🚀 Deployment Process

### **1. Staging Deployment**

#### **Deploy to Staging**
```bash
# Build and push Docker image
docker build -t hyperbuds-app:staging .
docker tag hyperbuds-app:staging registry.hyperbuds.com/hyperbuds-app:staging
docker push registry.hyperbuds.com/hyperbuds-app:staging

# Deploy to staging
kubectl apply -f k8s/staging/
kubectl rollout status deployment/hyperbuds-app-staging

# Run database migrations
kubectl exec -it deployment/hyperbuds-app-staging -- npm run migrate:up

# Verify deployment
kubectl get pods -l app=hyperbuds-app-staging
kubectl logs -l app=hyperbuds-app-staging
```

#### **Staging Tests**
```bash
# Run smoke tests
npm run test:smoke:staging

# Run API tests
npm run test:api:staging

# Run E2E tests
npm run test:e2e:staging
```

### **2. Production Deployment**

#### **Blue-Green Deployment**
```bash
# Deploy to green environment
kubectl apply -f k8s/production/green/
kubectl rollout status deployment/hyperbuds-app-green

# Run database migrations
kubectl exec -it deployment/hyperbuds-app-green -- npm run migrate:up

# Run health checks
kubectl exec -it deployment/hyperbuds-app-green -- curl -f http://localhost:3000/health

# Switch traffic to green
kubectl patch service hyperbuds-app -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor for 5 minutes
sleep 300

# If everything looks good, remove blue
kubectl delete deployment hyperbuds-app-blue
```

#### **Rolling Update (Alternative)**
```bash
# Update deployment
kubectl set image deployment/hyperbuds-app hyperbuds-app=registry.hyperbuds.com/hyperbuds-app:latest

# Monitor rollout
kubectl rollout status deployment/hyperbuds-app

# Rollback if needed
kubectl rollout undo deployment/hyperbuds-app
```

---

## 📊 Monitoring & Observability

### **1. Application Monitoring**

#### **Health Check Endpoint**
```javascript
// src/routes/health.js
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        api: 'running'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

#### **Metrics Collection**
```javascript
// src/middleware/metrics.js
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const recommendationsCounter = new prometheus.Counter({
  name: 'recommendations_total',
  help: 'Total number of recommendations',
  labelNames: ['action', 'status']
});

// Middleware to collect metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};
```

### **2. Database Monitoring**

#### **Query Performance Monitoring**
```sql
-- Monitor slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 1000  -- Queries taking more than 1 second
ORDER BY mean_time DESC
LIMIT 10;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### **3. Alerting Configuration**

#### **Prometheus Alerts**
```yaml
# alerts/recommendations.yml
groups:
  - name: recommendations
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "PostgreSQL database is not responding"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value }}%"
```

---

## 🔄 Rollback Procedures

### **1. Application Rollback**
```bash
# Rollback to previous version
kubectl rollout undo deployment/hyperbuds-app

# Rollback to specific revision
kubectl rollout undo deployment/hyperbuds-app --to-revision=2

# Check rollout status
kubectl rollout status deployment/hyperbuds-app
```

### **2. Database Rollback**
```sql
-- Rollback migrations (if needed)
-- WARNING: This will delete data!
DROP TABLE IF EXISTS user_recommendations;
DROP TABLE IF EXISTS user_matches;
-- Only drop user_profiles if it was created for this feature
-- DROP TABLE IF EXISTS user_profiles;
```

### **3. Feature Flag Rollback**
```javascript
// Disable recommendations feature
const featureFlags = {
  recommendations: false,
  // ... other flags
};

// In your application
if (featureFlags.recommendations) {
  // Show recommendations
} else {
  // Hide recommendations or show alternative content
}
```

---

## 📈 Performance Optimization

### **1. Database Optimization**
```sql
-- Analyze table statistics
ANALYZE user_matches;
ANALYZE user_recommendations;
ANALYZE user_profiles;

-- Update table statistics
UPDATE pg_stat_user_tables 
SET n_tup_ins = 0, n_tup_upd = 0, n_tup_del = 0 
WHERE relname IN ('user_matches', 'user_recommendations', 'user_profiles');

-- Vacuum tables
VACUUM ANALYZE user_matches;
VACUUM ANALYZE user_recommendations;
VACUUM ANALYZE user_profiles;
```

### **2. Caching Strategy**
```javascript
// Redis caching for recommendations
const getRecommendations = async (userId, limit, offset) => {
  const cacheKey = `recommendations:${userId}:${limit}:${offset}`;
  
  // Try to get from cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Get from database
  const recommendations = await db.query(/* ... */);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(recommendations));
  
  return recommendations;
};
```

### **3. CDN Configuration**
```yaml
# CloudFront distribution for static assets
Resources:
  RecommendationsCDN:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - DomainName: !GetAtt S3Bucket.DomainName
            Id: S3Origin
            S3OriginConfig:
              OriginAccessIdentity: !Ref OriginAccessIdentity
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
        Enabled: true
        PriceClass: PriceClass_100
```

---

## 🧪 Post-Deployment Testing

### **1. Smoke Tests**
```bash
# Test API endpoints
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.hyperbuds.com/api/recommendations

curl -X POST -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"creatorId": 123}' \
  https://api.hyperbuds.com/api/recommendations/give-chance
```

### **2. Load Testing**
```bash
# Run load tests
artillery run tests/performance/recommendations-load.yml

# Monitor metrics during load test
kubectl top pods -l app=hyperbuds-app
```

### **3. User Acceptance Testing**
```bash
# Run E2E tests against production
npm run test:e2e:production

# Test specific user journeys
npm run test:journey:recommendations
```

---

## 📞 Support & Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check database connectivity
kubectl exec -it deployment/hyperbuds-app -- psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
kubectl exec -it deployment/hyperbuds-app -- curl http://localhost:3000/health
```

#### **High Memory Usage**
```bash
# Check memory usage
kubectl top pods -l app=hyperbuds-app

# Check for memory leaks
kubectl exec -it deployment/hyperbuds-app -- node --inspect=0.0.0.0:9229
```

#### **Slow Query Performance**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;
```

### **Emergency Contacts**
- **On-Call Engineer**: +1-555-0123
- **Database Admin**: +1-555-0124
- **DevOps Team**: +1-555-0125
- **Product Manager**: +1-555-0126

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Ready for Implementation  
**Next Review**: After Production Deployment
