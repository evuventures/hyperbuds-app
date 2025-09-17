// Testing Utilities for Payment Integration

import { PaymentMethod, PricingPlan, PaymentHistoryItem } from '@/types/payment.types';

// Mock Data for Testing
export const mockPaymentMethods: PaymentMethod[] = [
   {
      id: 'pm_1234567890',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
   },
   {
      id: 'pm_0987654321',
      brand: 'mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2026,
      isDefault: false,
   },
   {
      id: 'pm_1122334455',
      brand: 'amex',
      last4: '1234',
      expMonth: 3,
      expYear: 2027,
      isDefault: false,
   },
];

export const mockPricingPlans: PricingPlan[] = [
   {
      id: 'basic',
      name: 'Basic',
      price: 900,
      currency: 'usd',
      interval: 'month',
      priceId: 'price_basic_monthly',
      description: 'Best for individuals getting started.',
      features: ['✔ 5 Projects', '✔ Basic Support', '✔ Limited Features'],
      tier: 'basic',
   },
   {
      id: 'premium',
      name: 'Premium',
      price: 2900,
      currency: 'usd',
      interval: 'month',
      priceId: 'price_premium_monthly',
      description: 'Perfect for growing teams.',
      features: ['✔ Unlimited Projects', '✔ Priority Support', '✔ Advanced Features'],
      tier: 'premium',
      popular: true,
   },
   {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9900,
      currency: 'usd',
      interval: 'month',
      priceId: 'price_enterprise_monthly',
      description: 'Tailored solutions for businesses.',
      features: ['✔ Dedicated Support', '✔ Custom Integrations', '✔ SLA & Compliance'],
      tier: 'enterprise',
   },
];

export const mockPaymentHistory: PaymentHistoryItem[] = [
   {
      _id: 'pay_1234567890',
      amount: 2900,
      currency: 'usd',
      status: 'succeeded',
      paymentType: 'subscription',
      createdAt: '2024-01-15T10:30:00.000Z',
   },
   {
      _id: 'pay_0987654321',
      amount: 5000,
      currency: 'usd',
      status: 'succeeded',
      paymentType: 'marketplace_service',
      createdAt: '2024-01-10T14:20:00.000Z',
   },
   {
      _id: 'pay_1122334455',
      amount: 1500,
      currency: 'usd',
      status: 'pending',
      paymentType: 'one_time',
      createdAt: '2024-01-08T09:15:00.000Z',
   },
];

// Test Card Numbers
export const testCardNumbers = {
   visa: '4242424242424242',
   visaDebit: '4000056655665556',
   mastercard: '5555555555554444',
   amex: '378282246310005',
   discover: '6011111111111117',
   declined: '4000000000000002',
   insufficientFunds: '4000000000009995',
   expiredCard: '4000000000000069',
   incorrectCvc: '4000000000000127',
   processingError: '4000000000000119',
};

// Mock API Responses
export const mockAPIResponses = {
   createPaymentIntent: {
      success: true,
      data: {
         paymentIntentId: 'pi_1234567890',
         clientSecret: 'pi_1234567890_secret_abcdef',
         paymentId: 'pay_1234567890',
      },
   },
   confirmPayment: {
      success: true,
      data: {
         status: 'succeeded',
         payment: {
            _id: 'pay_1234567890',
            amount: 2900,
            status: 'succeeded',
         },
      },
   },
   createSubscription: {
      success: true,
      data: {
         subscriptionId: 'sub_1234567890',
         status: 'active',
         subscription: {
            tier: 'premium',
            currentPeriodEnd: '2024-02-15T10:30:00.000Z',
         },
      },
   },
   getPaymentMethods: {
      success: true,
      data: {
         paymentMethods: mockPaymentMethods,
      },
   },
   getPaymentHistory: {
      success: true,
      data: {
         payments: mockPaymentHistory,
         pagination: {
            total: 3,
            pages: 1,
            currentPage: 1,
            limit: 20,
         },
      },
   },
   getEarnings: {
      success: true,
      data: {
         totalEarnings: 1250.50,
         availableForPayout: 850.25,
         pendingPayouts: 200.00,
         completedPayouts: 200.25,
         thisMonthEarnings: 425.75,
      },
   },
};

// Error Responses
export const mockErrorResponses = {
   cardDeclined: {
      success: false,
      message: 'Your card was declined.',
      code: 'card_declined',
   },
   insufficientFunds: {
      success: false,
      message: 'Your card has insufficient funds.',
      code: 'card_declined',
   },
   expiredCard: {
      success: false,
      message: 'Your card has expired.',
      code: 'expired_card',
   },
   incorrectCvc: {
      success: false,
      message: 'Your card\'s security code is incorrect.',
      code: 'incorrect_cvc',
   },
   networkError: {
      success: false,
      message: 'Network error. Please check your connection.',
      code: 'network_error',
   },
   rateLimit: {
      success: false,
      message: 'Too many requests. Please wait a moment.',
      code: 'rate_limit_exceeded',
   },
};

// Test Utilities
export class PaymentTestUtils {
   // Generate random payment method
   static generateMockPaymentMethod(overrides: Partial<PaymentMethod> = {}): PaymentMethod {
      const brands = ['visa', 'mastercard', 'amex', 'discover'] as const;
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];

      return {
         id: `pm_${Math.random().toString(36).substr(2, 9)}`,
         brand: randomBrand,
         last4: Math.floor(1000 + Math.random() * 9000).toString(),
         expMonth: Math.floor(Math.random() * 12) + 1,
         expYear: new Date().getFullYear() + Math.floor(Math.random() * 5) + 1,
         isDefault: false,
         ...overrides,
      };
   }

   // Generate random payment history item
   static generateMockPaymentHistoryItem(overrides: Partial<PaymentHistoryItem> = {}): PaymentHistoryItem {
      const statuses = ['succeeded', 'pending', 'failed', 'canceled'] as const;
      const paymentTypes = ['subscription', 'marketplace_service', 'one_time'] as const;
      const currencies = ['usd', 'eur', 'gbp'] as const;

      return {
         _id: `pay_${Math.random().toString(36).substr(2, 9)}`,
         amount: Math.floor(Math.random() * 10000) + 100,
         currency: currencies[Math.floor(Math.random() * currencies.length)],
         status: statuses[Math.floor(Math.random() * statuses.length)],
         paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
         createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
         ...overrides,
      };
   }

   // Simulate API delay
   static async simulateAPIDelay(ms: number = 1000): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
   }

   // Simulate API error
   static async simulateAPIError(errorType: keyof typeof mockErrorResponses): Promise<never> {
      await this.simulateAPIDelay(500);
      throw new Error(mockErrorResponses[errorType].message);
   }

   // Generate test form data
   static generateTestFormData() {
      return {
         cardholderName: 'John Doe',
         email: 'john.doe@example.com',
         billingAddress: {
            line1: '123 Main St',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
         },
      };
   }

   // Validate test environment
   static isTestEnvironment(): boolean {
      return process.env.NODE_ENV === 'test' || process.env.NEXT_PUBLIC_TEST_MODE === 'true';
   }

   // Mock Stripe Elements
   static createMockStripeElement() {
      return {
         mount: jest.fn(),
         on: jest.fn(),
         destroy: jest.fn(),
         createToken: jest.fn().mockResolvedValue({ token: { id: 'tok_test' } }),
      };
   }

   // Mock Stripe instance
   static createMockStripe() {
      return {
         elements: jest.fn().mockReturnValue({
            create: jest.fn().mockReturnValue(this.createMockStripeElement()),
         }),
         createPaymentMethod: jest.fn().mockResolvedValue({
            paymentMethod: { id: 'pm_test' },
            error: null,
         }),
         confirmPayment: jest.fn().mockResolvedValue({
            paymentIntent: { status: 'succeeded' },
            error: null,
         }),
         retrievePaymentIntent: jest.fn().mockResolvedValue({
            paymentIntent: { status: 'succeeded' },
            error: null,
         }),
      };
   }
}

// Test Hooks
export const useMockPaymentContext = () => {
   return {
      state: {
         isLoading: false,
         error: null,
         paymentIntent: null,
         paymentMethods: mockPaymentMethods,
         selectedPaymentMethod: null,
         subscription: null,
         earnings: null,
      },
      createPaymentIntent: jest.fn().mockResolvedValue(undefined),
      confirmPayment: jest.fn().mockResolvedValue(undefined),
      createSubscription: jest.fn().mockResolvedValue(undefined),
      updateSubscription: jest.fn().mockResolvedValue(undefined),
      cancelSubscription: jest.fn().mockResolvedValue(undefined),
      loadPaymentMethods: jest.fn().mockResolvedValue(undefined),
      deletePaymentMethod: jest.fn().mockResolvedValue(undefined),
      loadEarnings: jest.fn().mockResolvedValue(undefined),
      clearError: jest.fn(),
      clearPaymentIntent: jest.fn(),
      resetState: jest.fn(),
   };
};

export default PaymentTestUtils;
