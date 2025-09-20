# Stripe Setup Guide for HyperBuds Payment Integration

## Overview

This guide explains how to set up Stripe for the HyperBuds payment integration. The frontend supports both Stripe Elements (secure) and fallback manual card entry.

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Stripe Account Setup

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Create a new account or sign in
3. Complete the account setup process

### 2. Get API Keys
1. Go to the Stripe Dashboard
2. Navigate to **Developers** > **API Keys**
3. Copy the **Publishable key** (starts with `pk_test_`)
4. Copy the **Secret key** (starts with `sk_test_`)

### 3. Create Products and Prices

#### Basic Plan
- Product Name: "HyperBuds Basic"
- Product ID: `prod_basic`
- Price: $9.00/month
- Price ID: `price_basic_monthly`

#### Premium Plan
- Product Name: "HyperBuds Premium"
- Product ID: `prod_premium`
- Price: $29.00/month
- Price ID: `price_premium_monthly`

#### Enterprise Plan
- Product Name: "HyperBuds Enterprise"
- Product ID: `prod_enterprise`
- Price: $99.00/month
- Price ID: `price_enterprise_monthly`

### 4. Set Up Webhooks
1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/v1/payments/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_method.attached`
   - `payment_method.detached`
   - `account.updated`
5. Copy the **Signing secret** (starts with `whsec_`)

## Frontend Configuration

### 1. Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

### 2. Test the Integration
1. Start your development server: `npm run dev`
2. Navigate to `/payments/checkout`
3. The form should show either:
   - Stripe Elements card input (if key is configured)
   - Manual card entry fields (if key is missing)

### 3. Fallback Behavior
If Stripe Elements fail to load, the form automatically falls back to manual card entry fields:
- Card Number (with formatting)
- Expiry Date (MM/YY format)
- CVV (3-4 digits)

## Testing

### Test Card Numbers
Use these test card numbers for testing:

- **Visa**: `4242424242424242`
- **Visa (debit)**: `4000056655665556`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`
- **Declined**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`

### Test Scenarios
1. **Successful Payment**: Use `4242424242424242`
2. **Declined Payment**: Use `4000000000000002`
3. **Insufficient Funds**: Use `4000000000009995`
4. **Expired Card**: Use any card with past expiry date
5. **Invalid CVV**: Use any card with wrong CVV

## Security Considerations

### 1. PCI Compliance
- Stripe Elements handle card data securely
- No sensitive card data is stored in your application
- All card processing goes through Stripe

### 2. Environment Variables
- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### 3. Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement idempotency for webhook processing

## Troubleshooting

### Common Issues

#### 1. "Stripe publishable key not found"
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Ensure the key starts with `pk_test_` or `pk_live_`
- Restart your development server after adding the variable

#### 2. "Failed to initialize payment form"
- Check browser console for detailed error messages
- Verify the Stripe publishable key is valid
- Ensure Stripe.js is loading correctly

#### 3. Card validation errors
- Check that card numbers are properly formatted
- Verify expiry dates are in MM/YY format
- Ensure CVV is 3-4 digits

#### 4. Payment method creation fails
- Verify the backend API is implemented
- Check that the payment method creation endpoint is working
- Ensure proper error handling in the frontend

### Debug Mode
Enable debug logging by adding this to your environment:

```env
NEXT_PUBLIC_STRIPE_DEBUG=true
```

This will log additional information to the browser console.

## Production Deployment

### 1. Switch to Live Keys
Replace test keys with live keys:
- `pk_test_...` → `pk_live_...`
- `sk_test_...` → `sk_live_...`

### 2. Update Webhook URLs
- Change webhook URLs to production domain
- Test webhook endpoints thoroughly

### 3. Enable Live Mode
- Switch Stripe account to live mode
- Test with real payment methods
- Monitor payment success rates

## Support

For Stripe-related issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Discord Community](https://discord.gg/stripe)

For HyperBuds integration issues:
- Check the payment integration documentation
- Review the frontend implementation guide
- Contact the development team
