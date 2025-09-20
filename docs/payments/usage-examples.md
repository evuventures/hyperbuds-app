# HyperBuds Payment Integration - Usage Examples

## Overview

This document provides comprehensive usage examples for the HyperBuds payment integration. These examples demonstrate how to use the payment components, context, and utilities in various scenarios.

## Table of Contents

1. [Basic Payment Flow](#basic-payment-flow)
2. [Subscription Management](#subscription-management)
3. [Payment Method Management](#payment-method-management)
4. [Error Handling](#error-handling)
5. [Form Validation](#form-validation)
6. [Testing](#testing)
7. [Advanced Features](#advanced-features)

## Basic Payment Flow

### 1. Simple Checkout Page

```tsx
import React, { useState } from 'react';
import { PaymentProvider, usePayment } from '@/context/PaymentContext';
import { PricingPlans } from '@/components/payments/PricingPlans';
import { StripeForm } from '@/components/payments/PaymentForm/StripeForm';

function CheckoutPage() {
   const [selectedPlan, setSelectedPlan] = useState('premium');
   const [showPaymentForm, setShowPaymentForm] = useState(false);

   const plans = [
      {
         id: 'basic',
         name: 'Basic',
         price: 900,
         currency: 'usd',
         interval: 'month',
         priceId: 'price_basic_monthly',
         description: 'Best for individuals',
         features: ['5 Projects', 'Basic Support'],
         tier: 'basic',
      },
      {
         id: 'premium',
         name: 'Premium',
         price: 2900,
         currency: 'usd',
         interval: 'month',
         priceId: 'price_premium_monthly',
         description: 'Perfect for teams',
         features: ['Unlimited Projects', 'Priority Support'],
         tier: 'premium',
         popular: true,
      },
   ];

   return (
      <PaymentProvider>
         <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Choose Your Plan</h1>
            
            <PricingPlans
               plans={plans}
               selectedPlan={selectedPlan}
               onPlanSelect={setSelectedPlan}
            />

            <button
               onClick={() => setShowPaymentForm(true)}
               className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
               Continue to Payment
            </button>

            {showPaymentForm && (
               <div className="mt-8">
                  <StripeForm
                     onSubmit={(paymentMethodId) => {
                        console.log('Payment method created:', paymentMethodId);
                        // Handle payment submission
                     }}
                  />
               </div>
            )}
         </div>
      </PaymentProvider>
   );
}
```

### 2. Payment with Context

```tsx
import React from 'react';
import { usePayment } from '@/context/PaymentContext';

function PaymentButton({ planId, amount }: { planId: string; amount: number }) {
   const { createSubscription, state } = usePayment();

   const handlePayment = async () => {
      try {
         await createSubscription(planId, 'premium', 'pm_123');
         console.log('Subscription created successfully');
      } catch (error) {
         console.error('Payment failed:', error);
      }
   };

   return (
      <button
         onClick={handlePayment}
         disabled={state.isLoading}
         className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
      >
         {state.isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </button>
   );
}
```

## Subscription Management

### 1. Display Current Subscription

```tsx
import React from 'react';
import { usePayment } from '@/context/PaymentContext';
import { SubscriptionCard } from '@/components/payments/SubscriptionCard';

function SubscriptionPage() {
   const { state, updateSubscription, cancelSubscription } = usePayment();

   const handleUpdate = async () => {
      try {
         await updateSubscription('price_enterprise_monthly', 'enterprise');
         console.log('Subscription updated');
      } catch (error) {
         console.error('Update failed:', error);
      }
   };

   const handleCancel = async () => {
      try {
         await cancelSubscription(true); // Cancel at period end
         console.log('Subscription will be canceled');
      } catch (error) {
         console.error('Cancel failed:', error);
      }
   };

   if (!state.subscription) {
      return <div>No active subscription</div>;
   }

   return (
      <div className="max-w-2xl mx-auto p-6">
         <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
         
         <SubscriptionCard
            subscription={state.subscription}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            isLoading={state.isLoading}
         />
      </div>
   );
}
```

### 2. Subscription Status Check

```tsx
import React, { useEffect } from 'react';
import { usePayment } from '@/context/PaymentContext';

function SubscriptionGuard({ children }: { children: React.ReactNode }) {
   const { state } = usePayment();

   useEffect(() => {
      if (state.subscription?.status === 'past_due') {
         // Redirect to billing page
         window.location.href = '/billing';
      }
   }, [state.subscription]);

   if (state.subscription?.status === 'canceled') {
      return (
         <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Subscription Canceled</h2>
            <p className="text-gray-600 mb-4">Your subscription has been canceled.</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg">
               Reactivate Subscription
            </button>
         </div>
      );
   }

   return <>{children}</>;
}
```

## Payment Method Management

### 1. Payment Methods List

```tsx
import React, { useEffect } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { PaymentMethods } from '@/components/payments/PaymentForm/PaymentMethods';

function PaymentMethodsPage() {
   const { state, loadPaymentMethods, deletePaymentMethod } = usePayment();
   const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

   useEffect(() => {
      loadPaymentMethods();
   }, [loadPaymentMethods]);

   const handleDelete = async (methodId: string) => {
      try {
         await deletePaymentMethod(methodId);
         console.log('Payment method deleted');
      } catch (error) {
         console.error('Delete failed:', error);
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-6">
         <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>
         
         <PaymentMethods
            selectedMethod={selectedMethod}
            onMethodSelect={setSelectedMethod}
            onAddNew={() => console.log('Add new payment method')}
         />
      </div>
   );
}
```

### 2. Add New Payment Method

```tsx
import React, { useState } from 'react';
import { StripeForm } from '@/components/payments/PaymentForm/StripeForm';

function AddPaymentMethodPage() {
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async (paymentMethodId: string) => {
      setIsSubmitting(true);
      try {
         // Save payment method to backend
         const response = await fetch('/api/payment-methods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentMethodId }),
         });
         
         if (response.ok) {
            console.log('Payment method saved');
            // Redirect or show success message
         }
      } catch (error) {
         console.error('Save failed:', error);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-6">
         <h1 className="text-2xl font-bold mb-6">Add Payment Method</h1>
         
         <StripeForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
         />
      </div>
   );
}
```

## Error Handling

### 1. Error Boundary

```tsx
import React, { Component, ReactNode } from 'react';
import { ErrorState } from '@/components/payments/LoadingStates';

interface Props {
   children: ReactNode;
}

interface State {
   hasError: boolean;
   error?: Error;
}

class PaymentErrorBoundary extends Component<Props, State> {
   constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
   }

   static getDerivedStateFromError(error: Error): State {
      return { hasError: true, error };
   }

   componentDidCatch(error: Error, errorInfo: any) {
      console.error('Payment Error:', error, errorInfo);
   }

   render() {
      if (this.state.hasError) {
         return (
            <ErrorState
               title="Payment Error"
               message="Something went wrong with the payment system. Please try again."
               onRetry={() => this.setState({ hasError: false })}
            />
         );
      }

      return this.props.children;
   }
}

export default PaymentErrorBoundary;
```

### 2. Error Handling in Components

```tsx
import React from 'react';
import { usePayment } from '@/context/PaymentContext';
import { parseAPIError, getErrorRecoverySuggestions } from '@/lib/utils/paymentErrors';

function PaymentForm() {
   const { state, createSubscription } = usePayment();
   const [error, setError] = useState<string | null>(null);

   const handlePayment = async () => {
      try {
         setError(null);
         await createSubscription('price_premium_monthly', 'premium');
      } catch (err) {
         const paymentError = parseAPIError(err);
         setError(paymentError.message);
         
         // Log error for debugging
         console.error('Payment Error:', paymentError);
         
         // Show recovery suggestions
         const suggestions = getErrorRecoverySuggestions(paymentError);
         console.log('Recovery suggestions:', suggestions);
      }
   };

   return (
      <div>
         {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
               <p className="text-red-600">{error}</p>
            </div>
         )}
         
         <button onClick={handlePayment} disabled={state.isLoading}>
            {state.isLoading ? 'Processing...' : 'Subscribe'}
         </button>
      </div>
   );
}
```

## Form Validation

### 1. Real-time Validation

```tsx
import React, { useState } from 'react';
import { validateCardNumber, validateExpiryDate, validateCVV } from '@/lib/utils/paymentValidation';

function CardInput() {
   const [cardNumber, setCardNumber] = useState('');
   const [expiryDate, setExpiryDate] = useState('');
   const [cvv, setCvv] = useState('');
   const [errors, setErrors] = useState<{[key: string]: string}>({});

   const validateField = (field: string, value: string) => {
      const newErrors = { ...errors };
      
      if (field === 'cardNumber') {
         const validation = validateCardNumber(value);
         if (!validation.isValid) {
            newErrors.cardNumber = validation.errors[0];
         } else {
            delete newErrors.cardNumber;
         }
      } else if (field === 'expiryDate') {
         const validation = validateExpiryDate(value);
         if (!validation.isValid) {
            newErrors.expiryDate = validation.errors[0];
         } else {
            delete newErrors.expiryDate;
         }
      } else if (field === 'cvv') {
         const validation = validateCVV(value);
         if (!validation.isValid) {
            newErrors.cvv = validation.errors[0];
         } else {
            delete newErrors.cvv;
         }
      }
      
      setErrors(newErrors);
   };

   return (
      <div className="space-y-4">
         <div>
            <label>Card Number</label>
            <input
               type="text"
               value={cardNumber}
               onChange={(e) => {
                  setCardNumber(e.target.value);
                  validateField('cardNumber', e.target.value);
               }}
               className={errors.cardNumber ? 'border-red-500' : ''}
            />
            {errors.cardNumber && (
               <p className="text-red-500 text-sm">{errors.cardNumber}</p>
            )}
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label>Expiry Date</label>
               <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => {
                     setExpiryDate(e.target.value);
                     validateField('expiryDate', e.target.value);
                  }}
                  className={errors.expiryDate ? 'border-red-500' : ''}
               />
               {errors.expiryDate && (
                  <p className="text-red-500 text-sm">{errors.expiryDate}</p>
               )}
            </div>
            
            <div>
               <label>CVV</label>
               <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                     setCvv(e.target.value);
                     validateField('cvv', e.target.value);
                  }}
                  className={errors.cvv ? 'border-red-500' : ''}
               />
               {errors.cvv && (
                  <p className="text-red-500 text-sm">{errors.cvv}</p>
               )}
            </div>
         </div>
      </div>
   );
}
```

## Testing

### 1. Component Testing

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentProvider } from '@/context/PaymentContext';
import { PricingPlans } from '@/components/payments/PricingPlans';
import { mockPricingPlans } from '@/lib/utils/testUtils';

// Mock the payment context
jest.mock('@/context/PaymentContext', () => ({
   usePayment: () => ({
      state: { isLoading: false },
      createSubscription: jest.fn(),
   }),
}));

describe('PricingPlans', () => {
   it('renders pricing plans correctly', () => {
      render(
         <PricingPlans
            plans={mockPricingPlans}
            selectedPlan="premium"
            onPlanSelect={jest.fn()}
         />
      );

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
   });

   it('calls onPlanSelect when plan is clicked', () => {
      const onPlanSelect = jest.fn();
      
      render(
         <PricingPlans
            plans={mockPricingPlans}
            selectedPlan="basic"
            onPlanSelect={onPlanSelect}
         />
      );

      fireEvent.click(screen.getByText('Premium'));
      expect(onPlanSelect).toHaveBeenCalledWith('premium');
   });
});
```

### 2. API Testing

```tsx
import { paymentAPI } from '@/lib/api/payment.api';
import { mockAPIResponses } from '@/lib/utils/testUtils';

// Mock fetch
global.fetch = jest.fn();

describe('PaymentAPI', () => {
   beforeEach(() => {
      (fetch as jest.Mock).mockClear();
   });

   it('creates payment intent successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
         ok: true,
         json: async () => mockAPIResponses.createPaymentIntent,
      });

      const result = await paymentAPI.createPaymentIntent({
         amount: 2900,
         currency: 'usd',
         paymentType: 'subscription',
      });

      expect(result).toEqual(mockAPIResponses.createPaymentIntent);
      expect(fetch).toHaveBeenCalledWith(
         expect.stringContaining('/setup-intent'),
         expect.objectContaining({
            method: 'POST',
            headers: expect.any(Object),
            body: expect.any(String),
         })
      );
   });

   it('handles API errors correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
         ok: false,
         json: async () => ({ message: 'Invalid request' }),
      });

      await expect(
         paymentAPI.createPaymentIntent({
            amount: 0,
            currency: 'usd',
            paymentType: 'subscription',
         })
      ).rejects.toThrow('Invalid request');
   });
});
```

## Advanced Features

### 1. Apple Pay Integration

```tsx
import React, { useEffect, useRef } from 'react';
import { stripeService } from '@/lib/stripe/stripe';

function ApplePayButton({ amount, onSuccess, onError }: {
   amount: number;
   onSuccess: (paymentMethod: any) => void;
   onError: (error: any) => void;
}) {
   const buttonRef = useRef<HTMLDivElement>(null);
   const [isAvailable, setIsAvailable] = useState(false);

   useEffect(() => {
      const checkAvailability = async () => {
         const available = await stripeService.isApplePayAvailable();
         setIsAvailable(available);
      };
      checkAvailability();
   }, []);

   useEffect(() => {
      if (isAvailable && buttonRef.current) {
         const createButton = async () => {
            const button = await stripeService.createApplePayButton({
               amount,
               currency: 'usd',
               label: 'HyperBuds Premium',
               onSuccess,
               onError,
            });
            
            if (button && buttonRef.current) {
               button.mount(buttonRef.current);
            }
         };
         createButton();
      }
   }, [isAvailable, amount, onSuccess, onError]);

   if (!isAvailable) {
      return null;
   }

   return <div ref={buttonRef} />;
}
```

### 2. Payment Analytics

```tsx
import React, { useEffect } from 'react';
import { usePayment } from '@/context/PaymentContext';

function PaymentAnalytics() {
   const { state } = usePayment();

   useEffect(() => {
      // Track payment events
      if (state.paymentIntent) {
         // Track payment intent created
         gtag('event', 'payment_intent_created', {
            value: state.paymentIntent.amount,
            currency: 'USD',
         });
      }

      if (state.subscription) {
         // Track subscription created
         gtag('event', 'subscription_created', {
            subscription_tier: state.subscription.subscription.tier,
            value: state.subscription.subscription.amount,
         });
      }
   }, [state.paymentIntent, state.subscription]);

   return null; // This is just for analytics
}
```

### 3. Custom Payment Flow

```tsx
import React, { useState } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { PaymentProvider } from '@/context/PaymentContext';

function CustomPaymentFlow() {
   const [step, setStep] = useState<'plan' | 'payment' | 'confirmation'>('plan');
   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

   return (
      <PaymentProvider>
         <div className="max-w-4xl mx-auto p-6">
            {step === 'plan' && (
               <PlanSelectionStep
                  onSelect={(planId) => {
                     setSelectedPlan(planId);
                     setStep('payment');
                  }}
               />
            )}
            
            {step === 'payment' && (
               <PaymentStep
                  planId={selectedPlan}
                  onSuccess={() => setStep('confirmation')}
                  onBack={() => setStep('plan')}
               />
            )}
            
            {step === 'confirmation' && (
               <ConfirmationStep
                  planId={selectedPlan}
                  onComplete={() => window.location.href = '/dashboard'}
               />
            )}
         </div>
      </PaymentProvider>
   );
}
```

## Best Practices

### 1. Error Handling
- Always wrap payment operations in try-catch blocks
- Use the error parsing utilities for consistent error handling
- Provide user-friendly error messages
- Implement retry logic for network errors

### 2. Performance
- Use React.memo for expensive components
- Implement proper loading states
- Use skeleton components for better UX
- Optimize re-renders with useCallback and useMemo

### 3. Security
- Never store sensitive payment data
- Always use Stripe Elements for card input
- Validate all inputs on both client and server
- Use HTTPS in production

### 4. Testing
- Write unit tests for all components
- Test error scenarios
- Mock external dependencies
- Use the provided test utilities

### 5. Accessibility
- Use proper ARIA labels
- Ensure keyboard navigation works
- Provide screen reader support
- Test with accessibility tools

This comprehensive guide should help you implement the HyperBuds payment integration effectively. For more specific examples or questions, refer to the individual component documentation or the API specification.
