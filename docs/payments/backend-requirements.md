# HyperBuds Payment Integration - Backend Requirements

## Overview

This document outlines the complete backend implementation requirements for the HyperBuds payment system. The frontend has been fully implemented and is ready for backend integration.

> **Note**: For detailed API specifications, see [Payment Backend API Specification](./payment-backend-api-specification.md)

## API Endpoints Required

### Base Configuration
- **Base URL**: `https://api.hyperbuds.com/api/v1/payments`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`
- **Rate Limiting**: 200 requests per minute per user
- **HTTPS Only**: All endpoints require SSL

### 1. Payment Intents & Processing

#### POST /setup-intent
Create a payment intent for processing payments.

**Request Body:**
```json
{
  "amount": 1999,
  "currency": "usd",
  "paymentType": "subscription",
  "metadata": {
    "subscriptionTier": "premium",
    "description": "Premium subscription"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentIntentId": "pi_123",
    "clientSecret": "pi_123_secret_456",
    "paymentId": "64f8a1b2c3d4e5f6"
  }
}
```

#### POST /confirm
Confirm a payment with payment method.

**Request Body:**
```json
{
  "paymentIntentId": "pi_123",
  "paymentMethodId": "pm_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "succeeded",
    "payment": {
      "_id": "64f8a1b2c3d4e5f6",
      "amount": 1999,
      "status": "succeeded"
    }
  }
}
```

### 2. Subscriptions

#### POST /subscriptions
Create new subscription.

**Request Body:**
```json
{
  "priceId": "price_premium_monthly",
  "tier": "premium",
  "paymentMethodId": "pm_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_123",
    "status": "active",
    "subscription": {
      "tier": "premium",
      "currentPeriodEnd": "2024-11-11T00:00:00.000Z"
    }
  }
}
```

#### PUT /subscriptions
Update existing subscription.

**Request Body:**
```json
{
  "priceId": "price_pro_monthly",
  "tier": "pro"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_123",
    "status": "active",
    "message": "Subscription updated successfully"
  }
}
```

#### DELETE /subscriptions
Cancel subscription.

**Request Body:**
```json
{
  "cancelAtPeriodEnd": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_123",
    "cancelAtPeriodEnd": true,
    "message": "Subscription will be canceled at the end of the current period"
  }
}
```

### 3. Payment Methods

#### GET /methods
Get user's saved payment methods.

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "id": "pm_123",
        "brand": "visa",
        "last4": "4242",
        "expMonth": 12,
        "expYear": 2025,
        "isDefault": true
      }
    ]
  }
}
```

#### DELETE /methods/:paymentMethodId
Remove a payment method.

**Response:**
```json
{
  "success": true,
  "message": "Payment method removed successfully"
}
```

### 4. Payment History

#### GET /history
Get payment history with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (succeeded, pending, failed, canceled)
- `paymentType` (optional): Filter by type (subscription, marketplace_service, one_time)

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "64f8a1b2c3d4e5f6",
        "amount": 1999,
        "currency": "usd",
        "status": "succeeded",
        "paymentType": "subscription",
        "createdAt": "2024-09-11T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "pages": 3,
      "currentPage": 1,
      "limit": 20
    }
  }
}
```

### 5. Creator Payouts

#### POST /payouts/setup
Setup creator payout account.

**Request Body:**
```json
{
  "country": "US",
  "email": "creator@example.com",
  "businessType": "individual",
  "individual": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": "acct_123",
    "onboardingUrl": "https://connect.stripe.com/setup/...",
    "message": "Complete account setup using the provided URL"
  }
}
```

#### GET /payouts/account-status
Check payout account status.

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": "acct_123",
    "detailsSubmitted": true,
    "chargesEnabled": true,
    "transfersEnabled": true,
    "requiresAction": false
  }
}
```

#### POST /payouts
Request a payout.

**Request Body:**
```json
{
  "amount": 5000,
  "payoutType": "marketplace_earnings",
  "description": "Weekly earnings payout"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payoutId": "64f8a1b2c3d4e5f6",
    "transferId": "tr_123",
    "amount": 5000,
    "status": "processing",
    "message": "Payout initiated successfully"
  }
}
```

#### GET /payouts/history
Get payout history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (processing, paid, failed, canceled)

**Response:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "_id": "64f8a1b2c3d4e5f6",
        "amount": 50.00,
        "currency": "USD",
        "status": "paid",
        "type": "marketplace_earnings",
        "createdAt": "2024-09-11T10:30:00.000Z",
        "estimatedArrival": "2024-09-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 12,
      "pages": 1,
      "currentPage": 1,
      "limit": 20
    }
  }
}
```

### 6. Earnings & Analytics

#### GET /earnings
Get earnings summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 1250.50,
    "availableForPayout": 850.25,
    "pendingPayouts": 200.00,
    "completedPayouts": 200.25,
    "thisMonthEarnings": 425.75
  }
}
```

### 7. Admin Operations

#### POST /refund
Refund a payment (Admin only).

**Request Body:**
```json
{
  "paymentId": "64f8a1b2c3d4e5f6",
  "amount": 1999,
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "re_123",
    "amount": 19.99,
    "status": "succeeded",
    "message": "Refund processed successfully"
  }
}
```

### 8. Webhooks

#### POST /webhooks/stripe
Stripe webhook handler.

**Headers:**
- `stripe-signature`: Webhook signature for verification

## Error Handling

### Error Response Format
All endpoints should return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Required Error Codes
- `PREMIUM_REQUIRED` - Premium subscription needed
- `PRO_REQUIRED` - Pro subscription needed
- `SUBSCRIPTION_EXPIRED` - Subscription has expired
- `INSUFFICIENT_FUNDS` - Not enough balance for payout
- `PAYOUT_ACCOUNT_NOT_READY` - Stripe Connect account needs setup
- `PAYMENT_METHOD_REQUIRED` - Payment method needs to be added

## Security Requirements

### 1. Authentication
- All endpoints require Bearer token authentication
- Validate JWT tokens on every request
- Implement proper token expiration handling

### 2. PCI Compliance
- Never store card details directly
- Use Stripe for all card processing
- Implement proper data encryption for sensitive information

### 3. Rate Limiting
- Implement 200 requests per minute per user
- Return appropriate error responses for rate limit exceeded

### 4. Input Validation
- Validate all input parameters
- Sanitize user inputs
- Implement proper data type validation

### 5. Webhook Security
- Verify Stripe webhook signatures
- Implement idempotency for webhook processing
- Log all webhook events for audit

## Database Schema Requirements

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  tier ENUM('basic', 'premium', 'enterprise') NOT NULL,
  status ENUM('active', 'incomplete', 'incomplete_expired', 'trialing', 'past_due', 'canceled', 'unpaid') NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('succeeded', 'pending', 'failed', 'canceled') NOT NULL,
  payment_type ENUM('subscription', 'marketplace_service', 'one_time') NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Payment Methods Table
```sql
CREATE TABLE payment_methods (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stripe_payment_method_id VARCHAR(255) UNIQUE,
  brand VARCHAR(50) NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Payouts Table
```sql
CREATE TABLE payouts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stripe_transfer_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status ENUM('processing', 'paid', 'failed', 'canceled') NOT NULL,
  payout_type ENUM('marketplace_earnings', 'referral_bonus', 'manual') NOT NULL,
  description TEXT,
  estimated_arrival TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Stripe Integration Requirements

### 1. Stripe Configuration
- Set up Stripe account with proper API keys
- Configure webhook endpoints
- Set up Stripe Connect for payouts

### 2. Required Stripe Products
Create the following products in Stripe Dashboard:

#### Basic Plan
- Product ID: `prod_basic`
- Price ID: `price_basic_monthly`
- Amount: $9.00/month

#### Premium Plan
- Product ID: `prod_premium`
- Price ID: `price_premium_monthly`
- Amount: $29.00/month

#### Enterprise Plan
- Product ID: `prod_enterprise`
- Price ID: `price_enterprise_monthly`
- Amount: $99.00/month

### 3. Webhook Events to Handle
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_method.attached`
- `payment_method.detached`
- `account.updated` (for Connect accounts)

## Environment Variables Required

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-jwt-secret

# API Configuration
API_BASE_URL=https://api.hyperbuds.com
RATE_LIMIT_REQUESTS=200
RATE_LIMIT_WINDOW=60
```

## Testing Requirements

### 1. Unit Tests
- Test all API endpoints
- Test error handling
- Test validation logic
- Test Stripe integration

### 2. Integration Tests
- Test complete payment flow
- Test subscription lifecycle
- Test webhook processing
- Test payout functionality

### 3. Test Data
- Use Stripe test mode
- Create test customers and subscriptions
- Test with various card scenarios

## Monitoring and Logging

### 1. Logging
- Log all payment transactions
- Log API requests and responses
- Log webhook events
- Log errors with context

### 2. Monitoring
- Monitor API response times
- Monitor error rates
- Monitor webhook processing
- Set up alerts for critical failures

### 3. Analytics
- Track payment success rates
- Track subscription metrics
- Track payout performance
- Generate financial reports

## Deployment Checklist

- [ ] Stripe account configured
- [ ] Database schema created
- [ ] Environment variables set
- [ ] Webhook endpoints configured
- [ ] SSL certificates installed
- [ ] Rate limiting implemented
- [ ] Error handling tested
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Tests passing

## Frontend Integration Points

The frontend expects the following behavior:

1. **Authentication**: All requests include Bearer token
2. **Error Handling**: Consistent error response format
3. **Pagination**: Standard pagination for list endpoints
4. **Real-time Updates**: WebSocket support for payment status updates
5. **CORS**: Proper CORS headers for frontend domain

## Support and Maintenance

### 1. Documentation
- Keep API documentation updated
- Document any changes or new endpoints
- Provide integration examples

### 2. Versioning
- Use semantic versioning for API changes
- Maintain backward compatibility
- Deprecate old endpoints properly

### 3. Security Updates
- Regular security audits
- Update dependencies
- Monitor for vulnerabilities

This documentation provides everything needed to implement the backend payment system for HyperBuds. The frontend is fully implemented and ready for integration.
