// Payment Error Handling Utilities

export interface PaymentError {
    code: string;
    message: string;
    details?: string;
    field?: string;
    retryable?: boolean;
}

// Error Codes from API Documentation
export const ERROR_CODES = {
    PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
    PRO_REQUIRED: 'PRO_REQUIRED',
    SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
    INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
    PAYOUT_ACCOUNT_NOT_READY: 'PAYOUT_ACCOUNT_NOT_READY',
    PAYMENT_METHOD_REQUIRED: 'PAYMENT_METHOD_REQUIRED',
    CARD_DECLINED: 'card_declined',
    INCORRECT_CVC: 'incorrect_cvc',
    EXPIRED_CARD: 'expired_card',
    PROCESSING_ERROR: 'processing_error',
    AUTHENTICATION_REQUIRED: 'authentication_required',
    INVALID_REQUEST: 'invalid_request',
    RATE_LIMIT: 'rate_limit_exceeded',
    NETWORK_ERROR: 'network_error',
    UNKNOWN_ERROR: 'unknown_error',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    [ERROR_CODES.PREMIUM_REQUIRED]: 'A premium subscription is required to access this feature.',
    [ERROR_CODES.PRO_REQUIRED]: 'A pro subscription is required to access this feature.',
    [ERROR_CODES.SUBSCRIPTION_EXPIRED]: 'Your subscription has expired. Please renew to continue.',
    [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
    [ERROR_CODES.PAYOUT_ACCOUNT_NOT_READY]: 'Your payout account needs to be set up before you can receive payments.',
    [ERROR_CODES.PAYMENT_METHOD_REQUIRED]: 'Please add a payment method to continue.',
    [ERROR_CODES.CARD_DECLINED]: 'Your card was declined. Please try a different payment method.',
    [ERROR_CODES.EXPIRED_CARD]: 'Your card has expired. Please use a different payment method.',
    [ERROR_CODES.INCORRECT_CVC]: 'Your card\'s security code is incorrect. Please try again.',
    [ERROR_CODES.PROCESSING_ERROR]: 'An error occurred while processing your payment. Please try again.',
    [ERROR_CODES.AUTHENTICATION_REQUIRED]: 'Please authenticate to continue with this payment.',
    [ERROR_CODES.INVALID_REQUEST]: 'Invalid request. Please check your information and try again.',
    [ERROR_CODES.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
    [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again later.',
} as const;

// Stripe Error Types
export const STRIPE_ERROR_TYPES = {
    CARD_ERROR: 'card_error',
    VALIDATION_ERROR: 'validation_error',
    API_ERROR: 'api_error',
    AUTHENTICATION_ERROR: 'authentication_error',
    INVALID_REQUEST_ERROR: 'invalid_request_error',
    RATE_LIMIT_ERROR: 'rate_limit_error',
    CONNECTION_ERROR: 'connection_error',
} as const;

/**
 * Checks if a given error is a Stripe error and has a `type` property.
 * @param error - The error to check.
 */
function isStripeError(error: unknown): error is { type: string; code?: string; message?: string; param?: string; } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        typeof (error as { type: unknown }).type === 'string'
    );
}

/**
 * Checks if a given error is a standard API error.
 * @param error - The error to check.
 */
function isApiError(error: unknown): error is { code: string; message: string; details?: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        typeof (error as { code: unknown }).code === 'string' &&
        typeof (error as { message: unknown }).message === 'string'
    );
}

/**
 * Checks if a given error has an HTTP response.
 * @param error - The error to check.
 */
function hasResponse(error: unknown): error is { response?: { status?: number; data?: { message?: string } } } {
    return typeof error === 'object' && error !== null && 'response' in error;
}

// Parse API Error Response
export function parseAPIError(error: unknown): PaymentError {
    if (isApiError(error)) {
        return {
            code: error.code,
            message: error.message,
            details: error.details,
            retryable: isRetryableError(error.code),
        };
    }

    // Handle Network Errors
    if (!hasResponse(error)) {
        return {
            code: ERROR_CODES.NETWORK_ERROR,
            message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
            retryable: true,
        };
    }

    // Handle HTTP Status Codes
    const response = error.response;
    const status = response?.status;

    switch (status) {
        case 400:
            return {
                code: ERROR_CODES.INVALID_REQUEST,
                message: ERROR_MESSAGES[ERROR_CODES.INVALID_REQUEST],
                details: response?.data?.message,
                retryable: false,
            };
        case 401:
            return {
                code: ERROR_CODES.AUTHENTICATION_REQUIRED,
                message: ERROR_MESSAGES[ERROR_CODES.AUTHENTICATION_REQUIRED],
                retryable: false,
            };
        case 402:
            return {
                code: ERROR_CODES.PAYMENT_METHOD_REQUIRED,
                message: ERROR_MESSAGES[ERROR_CODES.PAYMENT_METHOD_REQUIRED],
                retryable: false,
            };
        case 403:
            return {
                code: ERROR_CODES.PREMIUM_REQUIRED,
                message: ERROR_MESSAGES[ERROR_CODES.PREMIUM_REQUIRED],
                retryable: false,
            };
        case 429:
            return {
                code: ERROR_CODES.RATE_LIMIT,
                message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT],
                retryable: true,
            };
        case 500:
        case 502:
        case 503:
        case 504:
            return {
                code: ERROR_CODES.PROCESSING_ERROR,
                message: ERROR_MESSAGES[ERROR_CODES.PROCESSING_ERROR],
                retryable: true,
            };
        default:
            return {
                code: ERROR_CODES.UNKNOWN_ERROR,
                message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
                details: response?.data?.message,
                retryable: true,
            };
    }
}

// Parse Stripe Error
export function parseStripeError(error: unknown): PaymentError {
    if (!isStripeError(error)) {
        return {
            code: ERROR_CODES.UNKNOWN_ERROR,
            message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
            retryable: true,
        };
    }

    switch (error.type) {
        case STRIPE_ERROR_TYPES.CARD_ERROR:
            return parseCardError(error);
        case STRIPE_ERROR_TYPES.VALIDATION_ERROR:
            return {
                code: ERROR_CODES.INVALID_REQUEST,
                message: error.message || ERROR_MESSAGES[ERROR_CODES.INVALID_REQUEST],
                field: error.param,
                retryable: false,
            };
        case STRIPE_ERROR_TYPES.API_ERROR:
            return {
                code: ERROR_CODES.PROCESSING_ERROR,
                message: ERROR_MESSAGES[ERROR_CODES.PROCESSING_ERROR],
                retryable: true,
            };
        case STRIPE_ERROR_TYPES.AUTHENTICATION_ERROR:
            return {
                code: ERROR_CODES.AUTHENTICATION_REQUIRED,
                message: ERROR_MESSAGES[ERROR_CODES.AUTHENTICATION_REQUIRED],
                retryable: false,
            };
        case STRIPE_ERROR_TYPES.INVALID_REQUEST_ERROR:
            return {
                code: ERROR_CODES.INVALID_REQUEST,
                message: ERROR_MESSAGES[ERROR_CODES.INVALID_REQUEST],
                retryable: false,
            };
        case STRIPE_ERROR_TYPES.RATE_LIMIT_ERROR:
            return {
                code: ERROR_CODES.RATE_LIMIT,
                message: ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT],
                retryable: true,
            };
        case STRIPE_ERROR_TYPES.CONNECTION_ERROR:
            return {
                code: ERROR_CODES.NETWORK_ERROR,
                message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
                retryable: true,
            };
        default:
            return {
                code: ERROR_CODES.UNKNOWN_ERROR,
                message: error.message || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
                retryable: true,
            };
    }
}

// Parse Card-Specific Errors
function parseCardError(error: { type: string; code?: string; message?: string }): PaymentError {
    const code = error.code;
    const message = error.message || ERROR_MESSAGES[ERROR_CODES.CARD_DECLINED];

    switch (code) {
        case 'card_declined':
            return { code: ERROR_CODES.CARD_DECLINED, message, retryable: false };
        case 'expired_card':
            return { code: ERROR_CODES.EXPIRED_CARD, message, retryable: false };
        case 'incorrect_cvc':
            return { code: ERROR_CODES.INCORRECT_CVC, message, field: 'cvv', retryable: false };
        case 'processing_error':
            return { code: ERROR_CODES.PROCESSING_ERROR, message, retryable: true };
        case 'authentication_required':
            return { code: ERROR_CODES.AUTHENTICATION_REQUIRED, message, retryable: false };
        default:
            return { code: code || ERROR_CODES.CARD_DECLINED, message, retryable: false };
    }
}

// Check if Error is Retryable
export function isRetryableError(code: string): boolean {
    const retryableCodes = [
        ERROR_CODES.PROCESSING_ERROR,
        ERROR_CODES.NETWORK_ERROR,
        ERROR_CODES.RATE_LIMIT,
        ERROR_CODES.UNKNOWN_ERROR,
    ] as const;
    return (retryableCodes as readonly string[]).includes(code);
}

// Get User-Friendly Error Message
export function getUserFriendlyMessage(error: PaymentError): string {
    if (error.message && !error.message.includes('Error:') && !error.message.includes('TypeError:')) {
        return error.message;
    }
    return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
}

// Error Logger
export function logPaymentError(error: PaymentError, context?: string): void {
    const logData = {
        code: error.code,
        message: error.message,
        details: error.details,
        field: error.field,
        retryable: error.retryable,
        context,
        timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'development') {
        console.error('Payment Error:', logData);
    }
}

// Retry Logic
export function shouldRetry(error: PaymentError, attemptCount: number): boolean {
    const maxRetries = 3;
    if (attemptCount >= maxRetries) return false;
    if (!error.retryable) return false;

    return error.code === ERROR_CODES.RATE_LIMIT ||
           error.code === ERROR_CODES.NETWORK_ERROR ||
           error.code === ERROR_CODES.PROCESSING_ERROR;
}

// Get Retry Delay
export function getRetryDelay(attemptCount: number, errorCode: string): number {
    const baseDelay = 1000;
    if (errorCode === ERROR_CODES.RATE_LIMIT) {
        return baseDelay * Math.pow(2, attemptCount) * 2;
    }
    return baseDelay * Math.pow(2, attemptCount);
}

// Error Boundary Helper
export function isPaymentError(error: unknown): error is PaymentError {
    return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

// Create Error from String
export function createError(message: string, code: string = ERROR_CODES.UNKNOWN_ERROR): PaymentError {
    return {
        code,
        message,
        retryable: isRetryableError(code),
    };
}

// Error Recovery Suggestions
export function getErrorRecoverySuggestions(error: PaymentError): string[] {
    const suggestions: string[] = [];
    switch (error.code) {
        case ERROR_CODES.CARD_DECLINED:
            suggestions.push('Try a different payment method');
            suggestions.push('Contact your bank to ensure the card is active');
            suggestions.push('Check that you have sufficient funds');
            break;
        case ERROR_CODES.EXPIRED_CARD:
            suggestions.push('Use a different payment method');
            suggestions.push('Update your card information');
            break;
        case ERROR_CODES.INCORRECT_CVC:
            suggestions.push('Double-check the security code on your card');
            suggestions.push('Try re-entering the CVV');
            break;
        case ERROR_CODES.NETWORK_ERROR:
            suggestions.push('Check your internet connection');
            suggestions.push('Try again in a few moments');
            break;
        case ERROR_CODES.RATE_LIMIT:
            suggestions.push('Wait a moment before trying again');
            suggestions.push('Reduce the frequency of your requests');
            break;
        case ERROR_CODES.PAYMENT_METHOD_REQUIRED:
            suggestions.push('Add a payment method to your account');
            suggestions.push('Update your payment information');
            break;
        default:
            suggestions.push('Try again later');
            suggestions.push('Contact support if the problem persists');
    }
    return suggestions;
}