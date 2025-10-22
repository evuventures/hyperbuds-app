"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { stripeService } from '@/lib/stripe/stripe';
import { PaymentFormData } from '@/types/payment.types';
import { StripeCardElement } from '@stripe/stripe-js';

interface StripeFormProps {
    onSubmit: (paymentMethodId: string) => void;
    isLoading?: boolean;
    error?: string | null;
}

function StripeFormComponent({ onSubmit, isLoading = false, error }: StripeFormProps) {
    const { state } = usePayment();
    const [formData, setFormData] = useState<PaymentFormData>({
        cardholderName: '',
        email: '',
        billingAddress: {
            line1: '',
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
        },
    });
    const [cardError, setCardError] = useState<string | null>(null);
    const [isCardComplete, setIsCardComplete] = useState(false);
    const [useStripeElements, setUseStripeElements] = useState(true);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
    });
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    // const [isValidating, setIsValidating] = useState(false); // Removed unused variable

    // Check if manual form is complete
    const isManualFormComplete = useMemo(() => {
        if (useStripeElements) return isCardComplete;

        return (
            cardData.cardNumber.trim() !== '' &&
            cardData.expiryDate.trim() !== '' &&
            cardData.cvv.trim() !== '' &&
            formData.cardholderName.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.billingAddress.line1.trim() !== '' &&
            formData.billingAddress.city.trim() !== '' &&
            formData.billingAddress.state.trim() !== '' &&
            formData.billingAddress.postalCode.trim() !== '' &&
            formData.billingAddress.country.trim() !== '' &&
            Object.keys(validationErrors).length === 0
        );
    }, [useStripeElements, isCardComplete, cardData, formData, validationErrors]);

    const cardElementRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripeCardElementRef = useRef<StripeCardElement | any>(null);

    useEffect(() => {
        // Skip on server-side rendering
        if (typeof window === 'undefined') return;

        const initializeCard = async () => {
            try {
                // Check if Stripe publishable key is available
                if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
                    console.warn('Stripe publishable key not found, using fallback form');
                    setUseStripeElements(false);
                    return;
                }

                const cardElement = await stripeService.createCardElement();
                stripeCardElementRef.current = cardElement;

                if (cardElementRef.current) {
                    cardElement.mount(cardElementRef.current.id);

                    cardElement.on('change', (event) => {
                        const typedEvent = event as { error?: { message: string }; complete: boolean };
                        setCardError(typedEvent.error ? typedEvent.error.message : null);
                        setIsCardComplete(typedEvent.complete);
                    });
                }
            } catch (err) {
                console.error('Error initializing Stripe card element:', err);
                setCardError('Failed to initialize payment form');
                setUseStripeElements(false);
            }
        };

        if (useStripeElements) {
            initializeCard();
        }

        return () => {
            if (stripeCardElementRef.current) {
                stripeCardElementRef.current.destroy();
            }
        };
    }, [useStripeElements]);

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof PaymentFormData] as Record<string, string>),
                    [child]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleCardDataChange = (field: string, value: string) => {
        setCardData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Real-time validation with debouncing
        setTimeout(() => {
            validateField(field, value);
        }, 300);
    };

    const validateField = (field: string, value: string) => {
        const errors = { ...validationErrors };

        if (field === 'cardNumber') {
            const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');

            if (value && cleaned.length > 0) {
                if (cleaned.length < 13) {
                    errors.cardNumber = 'Card number too short';
                } else if (cleaned.length > 19) {
                    errors.cardNumber = 'Card number too long';
                } else {
                    const isValid = stripeService.validateCardNumber(value);
                    if (!isValid) {
                        errors.cardNumber = 'Invalid card number';
                    } else {
                        delete errors.cardNumber;
                    }
                }
            } else if (value && cleaned.length === 0) {
                errors.cardNumber = 'Please enter a valid card number';
            } else {
                delete errors.cardNumber;
            }
        } else if (field === 'expiryDate') {
            const isValid = stripeService.validateExpiryDate(value);
            if (value && !isValid) {
                errors.expiryDate = 'Invalid expiry date';
            } else {
                delete errors.expiryDate;
            }
        } else if (field === 'cvv') {
            const isValid = stripeService.validateCVV(value);
            if (value && !isValid) {
                errors.cvv = 'Invalid CVV';
            } else {
                delete errors.cvv;
            }
        } else if (field === 'cardholderName') {
            if (value && value.trim().length < 2) {
                errors.cardholderName = 'Name must be at least 2 characters';
            } else {
                delete errors.cardholderName;
            }
        } else if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                errors.email = 'Invalid email address';
            } else {
                delete errors.email;
            }
        }

        setValidationErrors(errors);
        setCardError(Object.keys(errors).length > 0 ? Object.values(errors)[0] : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (useStripeElements) {
            // Use Stripe Elements
            if (!stripeCardElementRef.current) {
                setCardError('Payment form not ready');
                return;
            }

            if (!isCardComplete) {
                setCardError('Please complete the card information');
                return;
            }

            try {
                setCardError(null);

                // Create payment method
                const { paymentMethod, error } = await stripeService.createPaymentMethod(
                    stripeCardElementRef.current,
                    {
                        name: formData.cardholderName,
                        email: formData.email,
                        address: {
                            line1: formData.billingAddress.line1,
                            line2: formData.billingAddress.line2,
                            city: formData.billingAddress.city,
                            state: formData.billingAddress.state,
                            postal_code: formData.billingAddress.postalCode,
                            country: formData.billingAddress.country,
                        },
                    }
                );

                if (error) {
                    setCardError(error.message);
                    return;
                }

                if (paymentMethod) {
                    onSubmit(paymentMethod.id);
                }
            } catch (err) {
                setCardError(err instanceof Error ? err.message : 'Payment failed');
            }
        } else {
            // Use fallback form validation
            if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
                setCardError('Please fill in all card details');
                return;
            }

            if (!stripeService.validateCardNumber(cardData.cardNumber)) {
                setCardError('Invalid card number');
                return;
            }

            if (!stripeService.validateExpiryDate(cardData.expiryDate)) {
                setCardError('Invalid expiry date');
                return;
            }

            if (!stripeService.validateCVV(cardData.cvv)) {
                setCardError('Invalid CVV');
                return;
            }

            // For now, simulate a payment method ID
            // In a real implementation, you would create a payment method on the backend
            const mockPaymentMethodId = `pm_${Date.now()}`;
            onSubmit(mockPaymentMethodId);
        }
    };

    const inputClasses = "p-3 mt-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cardholder Name */}
            <div>
                <label
                    htmlFor="cardholder-name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Cardholder Name
                </label>
                <input
                    id="cardholder-name"
                    type="text"
                    value={formData.cardholderName}
                    onChange={(e) => {
                        handleInputChange('cardholderName', e.target.value);
                        validateField('cardholderName', e.target.value);
                    }}
                    className={`${inputClasses} ${validationErrors.cardholderName ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="John Doe"
                    autoComplete="cc-name"
                    aria-describedby={validationErrors.cardholderName ? 'cardholder-name-error' : undefined}
                    required
                />
                {validationErrors.cardholderName && (
                    <p id="cardholder-name-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                        {validationErrors.cardholderName}
                    </p>
                )}
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={inputClasses}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                />
            </div>

            {/* Card Information */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Card Information
                </label>

                {useStripeElements ? (
                    // Stripe Elements Card Input
                    <div
                        ref={cardElementRef}
                        className="p-3 mt-2 bg-gray-50 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                ) : (
                    // Fallback Card Input Fields
                    <div className="mt-2 space-y-4">
                        {/* Card Number */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Card Number
                            </label>
                            <input
                                type="text"
                                value={cardData.cardNumber}
                                onChange={(e) => {
                                    const formatted = stripeService.formatCardNumber(e.target.value);
                                    handleCardDataChange('cardNumber', formatted);
                                }}
                                className={inputClasses}
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                autoComplete="cc-number"
                                required
                            />
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Expiry Date
                                </label>
                                <input
                                    type="text"
                                    value={cardData.expiryDate}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        const formatted = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
                                        handleCardDataChange('expiryDate', formatted);
                                    }}
                                    className={inputClasses}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    autoComplete="cc-exp"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    CVV
                                </label>
                                <input
                                    type="password"
                                    value={cardData.cvv}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        handleCardDataChange('cvv', value);
                                    }}
                                    className={inputClasses}
                                    placeholder="123"
                                    maxLength={4}
                                    autoComplete="cc-csc"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {cardError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{cardError}</p>
                )}

                {/* Toggle between Stripe Elements and Manual Entry */}
                <div className="flex gap-4 mt-2">
                    {useStripeElements ? (
                        <button
                            type="button"
                            onClick={() => setUseStripeElements(false)}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                        >
                            Use manual card entry instead
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setUseStripeElements(true)}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                        >
                            Use secure Stripe Elements instead
                        </button>
                    )}
                </div>
            </div>

            {/* Billing Address */}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Billing Address
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Street Address"
                        value={formData.billingAddress.line1}
                        onChange={(e) => handleInputChange('billingAddress.line1', e.target.value)}
                        className={inputClasses}
                        autoComplete="address-line1"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Apt / Suite"
                        value={formData.billingAddress.line2}
                        onChange={(e) => handleInputChange('billingAddress.line2', e.target.value)}
                        className={inputClasses}
                        autoComplete="address-line2"
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                        className={inputClasses}
                        autoComplete="address-level2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="State / Province"
                        value={formData.billingAddress.state}
                        onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                        className={inputClasses}
                        autoComplete="address-level1"
                        required
                    />
                    <input
                        type="text"
                        placeholder="ZIP / Postal Code"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) => handleInputChange('billingAddress.postalCode', e.target.value)}
                        className={inputClasses}
                        autoComplete="postal-code"
                        required
                    />
                    <select
                        value={formData.billingAddress.country}
                        onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                        className={inputClasses}
                        autoComplete="country"
                        required
                    >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="ES">Spain</option>
                        <option value="IT">Italy</option>
                        <option value="NL">Netherlands</option>
                        <option value="SE">Sweden</option>
                    </select>
                </div>
            </div>

            {/* Error Display */}
            {(error || state.error) && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900 dark:border-red-700">
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error || state.error}
                    </p>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || !isManualFormComplete || state.isLoading}
                className="py-3 mt-6 w-full font-semibold text-white bg-linear-to-r from-purple-500 to-pink-500 rounded-lg shadow-md transition cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading || state.isLoading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
}

// Client-side only wrapper to prevent hydration issues
export function StripeForm(props: StripeFormProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="mb-2 w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
                <div className="animate-pulse">
                    <div className="mb-2 w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
                <div className="animate-pulse">
                    <div className="mb-2 w-1/4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    return <StripeFormComponent {...props} />;
}

export default StripeForm;