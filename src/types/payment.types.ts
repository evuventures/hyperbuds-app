// Payment Intent Types
export interface PaymentIntentRequest {
    amount: number;
    currency: string;
    paymentType: 'subscription' | 'marketplace_service' | 'one_time';
    metadata?: {
        subscriptionTier?: string;
        serviceId?: string;
        description?: string;
        [key: string]: unknown; // FIXED: Replaced 'any' with 'unknown'
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

export interface ConfirmPaymentRequest {
    paymentIntentId: string;
    paymentMethodId: string;
}

export interface ConfirmPaymentResponse {
    success: boolean;
    data: {
        status: 'succeeded' | 'failed' | 'requires_action';
        payment: {
            _id: string;
            amount: number;
            status: string;
        };
    };
}

// Subscription Types
export interface CreateSubscriptionRequest {
    priceId: string;
    tier: 'premium' | 'pro';
    paymentMethodId: string;
}

export interface UpdateSubscriptionRequest {
    priceId: string;
    tier: 'premium' | 'pro';
}

export interface CancelSubscriptionRequest {
    cancelAtPeriodEnd: boolean;
}

export interface SubscriptionResponse {
    success: boolean;
    data: {
        subscriptionId: string;
        status: 'active' | 'canceled' | 'past_due' | 'incomplete';
        subscription?: {
            tier: string;
            currentPeriodEnd: string;
        };
        message?: string;
    };
}

// Payment Method Types
export interface PaymentMethod {
    id: string;
    brand: string;
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

// Payment History Types
export interface PaymentHistoryQuery {
    page?: number;
    limit?: number;
    status?: 'succeeded' | 'failed' | 'pending' | 'canceled';
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

// Payout Types
export interface PayoutSetupRequest {
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
    accountId: string;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    transfersEnabled: boolean;
    requiresAction: boolean;
}

export interface PayoutAccountStatusResponse {
    success: boolean;
    data: PayoutAccountStatus;
}

export interface PayoutRequest {
    amount: number;
    payoutType: 'marketplace_earnings' | 'referral_bonus' | 'manual';
    description: string;
}

export interface PayoutItem {
    _id: string;
    amount: number;
    currency: string;
    status: 'processing' | 'paid' | 'failed' | 'canceled';
    type: string;
    createdAt: string;
    estimatedArrival?: string;
}

export interface PayoutResponse {
    success: boolean;
    data: {
        payoutId: string;
        transferId: string;
        amount: number;
        status: string;
        message: string;
    };
}

export interface PayoutHistoryQuery {
    page?: number;
    limit?: number;
    status?: 'processing' | 'paid' | 'failed' | 'canceled';
}

export interface PayoutHistoryResponse {
    success: boolean;
    data: {
        payouts: PayoutItem[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            limit: number;
        };
    };
}

// Earnings Types
export interface EarningsSummary {
    totalEarnings: number;
    availableForPayout: number;
    pendingPayouts: number;
    completedPayouts: number;
    thisMonthEarnings: number;
}

export interface EarningsResponse {
    success: boolean;
    data: EarningsSummary;
}

// Refund Types (Admin)
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
        status: string;
        message: string;
    };
}

// Error Response
export interface PaymentErrorResponse {
    success: false;
    message: string;
    code: string;
    details?: string;
}

// Subscription Tiers
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
    id: string;
    name: string;
    tier: SubscriptionTier;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId: string;
}

// Common Error Codes
export type PaymentErrorCode =
    | 'PREMIUM_REQUIRED'
    | 'PRO_REQUIRED'
    | 'SUBSCRIPTION_EXPIRED'
    | 'INSUFFICIENT_FUNDS'
    | 'PAYOUT_ACCOUNT_NOT_READY'
    | 'PAYMENT_METHOD_REQUIRED'
    | 'INVALID_PAYMENT_METHOD'
    | 'PAYMENT_FAILED'
    | 'SUBSCRIPTION_NOT_FOUND'
    | 'UNAUTHORIZED';

// Payment State (for context)
export interface PaymentState {
    isLoading: boolean;
    error: string | null;
    paymentIntent: PaymentIntentResponse['data'] | null;
    paymentMethods: PaymentMethod[];
    selectedPaymentMethod: string | null;
    subscription: SubscriptionResponse['data'] | null;
    earnings: EarningsSummary | null;
}

// Payment Form Data
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

// Pricing Plan (for UI)
export interface PricingPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    priceId: string;
    description: string;
    desc: string;
    features: string[];
    tier: SubscriptionTier;
    popular?: boolean;
}

// Stripe Types
export interface Stripe {
    elements: (options?: unknown) => StripeElements; // FIXED: Replaced 'any' with 'unknown'
    confirmPayment: (options: unknown) => Promise<unknown>; // FIXED: Replaced 'any' with 'unknown'
}

export interface StripeElements {
    create: (type: string, options?: unknown) => unknown; // FIXED: Replaced 'any' with 'unknown'
}

export interface StripeCardElement {
    mount: (selector: string) => void;
    unmount: () => void;
    on: (event: string, handler: (event: unknown) => void) => void; // FIXED: Replaced 'any' with 'unknown'
    destroy: () => void;
}