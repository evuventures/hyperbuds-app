// Payment Types for HyperBuds Payment Integration

export interface PaymentIntent {
   amount: number;
   currency: string;
   paymentType: 'subscription' | 'marketplace_service' | 'one_time';
   metadata?: {
      subscriptionTier?: string;
      serviceId?: string;
      description?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
   };
}

export interface PaymentIntentResponse {
   success: boolean;
   data: {
      paymentIntentId: string;
      clientSecret: string;
      paymentId: string;
   };
}

export interface PaymentConfirmation {
   paymentIntentId: string;
   paymentMethodId: string;
}

export interface PaymentConfirmationResponse {
   success: boolean;
   data: {
      status: 'succeeded' | 'requires_action' | 'requires_payment_method' | 'processing';
      payment: {
         _id: string;
         amount: number;
         status: string;
      };
   };
}

export interface Subscription {
   priceId: string;
   tier: 'basic' | 'premium' | 'enterprise';
   paymentMethodId?: string;
}

export interface SubscriptionResponse {
   success: boolean;
   data: {
      subscriptionId: string;
      status: 'active' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
      subscription: {
         tier: string;
         currentPeriodEnd: string;
      };
   };
}

export interface SubscriptionUpdate {
   priceId: string;
   tier: 'basic' | 'premium' | 'enterprise';
}

export interface SubscriptionCancel {
   cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
   id: string;
   brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay';
   last4: string;
   expMonth: number;
   expYear: number;
   isDefault: boolean;
}

export interface PaymentMethodsResponse {
   success: boolean;
   data: {
      paymentMethods: PaymentMethod[];
   };
}

export interface PaymentHistoryQuery {
   page?: number;
   limit?: number;
   status?: 'succeeded' | 'pending' | 'failed' | 'canceled';
   paymentType?: 'subscription' | 'marketplace_service' | 'one_time';
}

export interface PaymentHistoryItem {
   _id: string;
   amount: number;
   currency: string;
   status: string;
   paymentType: string;
   createdAt: string;
}

export interface PaymentHistoryResponse {
   success: boolean;
   data: {
      payments: PaymentHistoryItem[];
      pagination: {
         total: number;
         pages: number;
         currentPage: number;
         limit: number;
      };
   };
}

export interface PayoutSetup {
   country: string;
   email: string;
   businessType: 'individual' | 'company';
   individual?: {
      firstName: string;
      lastName: string;
      email: string;
      address: {
         line1: string;
         city: string;
         state: string;
         postalCode: string;
         country: string;
      };
   };
   company?: {
      name: string;
      email: string;
      address: {
         line1: string;
         city: string;
         state: string;
         postalCode: string;
         country: string;
      };
   };
}

export interface PayoutSetupResponse {
   success: boolean;
   data: {
      accountId: string;
      onboardingUrl: string;
      message: string;
   };
}

export interface PayoutAccountStatus {
   success: boolean;
   data: {
      accountId: string;
      detailsSubmitted: boolean;
      chargesEnabled: boolean;
      transfersEnabled: boolean;
      requiresAction: boolean;
   };
}

export interface PayoutRequest {
   amount: number;
   payoutType: 'marketplace_earnings' | 'referral_bonus' | 'manual';
   description: string;
}

export interface PayoutRequestResponse {
   success: boolean;
   data: {
      payoutId: string;
      transferId: string;
      amount: number;
      status: 'processing' | 'paid' | 'failed' | 'canceled';
      message: string;
   };
}

export interface PayoutHistoryQuery {
   page?: number;
   limit?: number;
   status?: 'processing' | 'paid' | 'failed' | 'canceled';
}

export interface PayoutHistoryItem {
   _id: string;
   amount: number;
   currency: string;
   status: string;
   type: string;
   createdAt: string;
   estimatedArrival?: string;
}

export interface PayoutHistoryResponse {
   success: boolean;
   data: {
      payouts: PayoutHistoryItem[];
      pagination: {
         total: number;
         pages: number;
         currentPage: number;
         limit: number;
      };
   };
}

export interface EarningsSummary {
   success: boolean;
   data: {
      totalEarnings: number;
      availableForPayout: number;
      pendingPayouts: number;
      completedPayouts: number;
      thisMonthEarnings: number;
   };
}

export interface RefundRequest {
   paymentId: string;
   amount: number;
   reason: 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'other';
}

export interface RefundResponse {
   success: boolean;
   data: {
      refundId: string;
      amount: number;
      status: 'succeeded' | 'pending' | 'failed' | 'canceled';
      message: string;
   };
}

export interface PaymentError {
   success: false;
   message: string;
   code: string;
   details?: string;
}

// Pricing Plan Types
export interface PricingPlan {
   id: string;
   name: string;
   price: number; // in cents
   currency: string;
   interval: 'month' | 'year';
   priceId: string;
   description: string;
   features: string[];
   popular?: boolean;
   tier: 'basic' | 'premium' | 'enterprise';
   desc?: string; // Alias for description for backward compatibility
}

// Stripe Elements Types
export interface StripeCardElement {
   mount: (element: HTMLElement) => void;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   on: (event: string, handler: (event: any) => void) => void;
   destroy: () => void;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   createToken: () => Promise<{ token?: { id: string }; error?: any }>;
}

export interface StripeElements {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   create: (type: string, options?: any) => StripeCardElement;
}

export interface Stripe {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   elements: (options?: any) => StripeElements;
   confirmPayment: (options: {
      elements: StripeElements;
      confirmParams: {
         payment_method: {
            card: StripeCardElement;
            billing_details?: {
               name?: string;
               email?: string;
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               address?: any;
            };
         };
      };
      redirect: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
   }) => Promise<{ error?: any; paymentIntent?: any }>;
}

// Payment Form Types
export interface PaymentFormData {
   cardholderName: string;
   email: string;
   billingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
   };
}

// Payment State Types
export interface PaymentState {
   isLoading: boolean;
   error: string | null;
   paymentIntent: PaymentIntentResponse['data'] | null;
   paymentMethods: PaymentMethod[];
   selectedPaymentMethod: string | null;
   subscription: SubscriptionResponse['data'] | null;
   earnings: EarningsSummary['data'] | null;
}

// Webhook Types
export interface StripeWebhookEvent {
   id: string;
   type: string;
   data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      object: any;
   };
   created: number;
}
