"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import {
   PaymentState,
   PaymentIntentResponse,
   PaymentMethod,
   SubscriptionResponse,
   EarningsSummary,
   PaymentHistoryQuery,
   PayoutSetupRequest,
   PayoutRequest,
   PayoutHistoryQuery,
   RefundRequest,
   PayoutAccountStatus,
   // PricingPlan, // Removed unused import
   // PaymentFormData // Removed unused import
} from '@/types/payment.types';
import { paymentAPI } from '@/lib/api/payment.api';
import { getAccessToken } from '@/stores/auth.store';

// Action Types
type PaymentAction =
   | { type: 'SET_LOADING'; payload: boolean }
   | { type: 'SET_ERROR'; payload: string | null }
   | { type: 'SET_PAYMENT_INTENT'; payload: PaymentIntentResponse['data'] | null }
   | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
   | { type: 'SET_SELECTED_PAYMENT_METHOD'; payload: string | null }
   | { type: 'SET_SUBSCRIPTION'; payload: SubscriptionResponse['data'] | null }
   | { type: 'SET_EARNINGS'; payload: EarningsSummary | null }
   | { type: 'CLEAR_PAYMENT_INTENT' }
   | { type: 'RESET_STATE' };

// Initial State
const initialState: PaymentState = {
   isLoading: false,
   error: null,
   paymentIntent: null,
   paymentMethods: [],
   selectedPaymentMethod: null,
   subscription: null,
   earnings: null,
};

// Reducer
function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
   switch (action.type) {
      case 'SET_LOADING':
         return { ...state, isLoading: action.payload };
      case 'SET_ERROR':
         return { ...state, error: action.payload, isLoading: false };
      case 'SET_PAYMENT_INTENT':
         return { ...state, paymentIntent: action.payload, error: null };
      case 'SET_PAYMENT_METHODS':
         return { ...state, paymentMethods: action.payload };
      case 'SET_SELECTED_PAYMENT_METHOD':
         return { ...state, selectedPaymentMethod: action.payload };
      case 'SET_SUBSCRIPTION':
         return { ...state, subscription: action.payload };
      case 'SET_EARNINGS':
         return { ...state, earnings: action.payload };
      case 'CLEAR_PAYMENT_INTENT':
         return { ...state, paymentIntent: null };
      case 'RESET_STATE':
         return initialState;
      default:
         return state;
   }
}

// Context Type
interface PaymentContextType {
   state: PaymentState;
   dispatch: React.Dispatch<PaymentAction>;

   // Payment Intent Methods
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   createPaymentIntent: (amount: number, currency: string, paymentType: string, metadata?: any) => Promise<void>;
   confirmPayment: (paymentIntentId: string, paymentMethodId: string) => Promise<void>;

   // Subscription Methods
   createSubscription: (priceId: string, tier: string, paymentMethodId?: string) => Promise<void>;
   updateSubscription: (priceId: string, tier: string) => Promise<void>;
   cancelSubscription: (cancelAtPeriodEnd?: boolean) => Promise<void>;

   // Payment Methods
   loadPaymentMethods: () => Promise<void>;
   deletePaymentMethod: (paymentMethodId: string) => Promise<void>;

   // Earnings
   loadEarnings: () => Promise<void>;

   // Payment History
   loadPaymentHistory: (query?: PaymentHistoryQuery) => Promise<void>;

   // Payouts
   setupPayoutAccount: (data: PayoutSetupRequest) => Promise<void>;
   getPayoutAccountStatus: () => Promise<PayoutAccountStatus>;
   requestPayout: (data: PayoutRequest) => Promise<void>;
   loadPayoutHistory: (query?: PayoutHistoryQuery) => Promise<void>;

   // Refunds (Admin)
   refundPayment: (data: RefundRequest) => Promise<void>;

   // Utility Methods
   clearError: () => void;
   clearPaymentIntent: () => void;
   resetState: () => void;
}

// Context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Provider Props
interface PaymentProviderProps {
   children: ReactNode;
}

// Get auth token helper (moved outside component to prevent recreation)
const getAuthToken = (): string | null => {
   return getAccessToken();
};

// Provider Component
export function PaymentProvider({ children }: PaymentProviderProps) {
   const [state, dispatch] = useReducer(paymentReducer, initialState);

   // Payment Intent Methods
   const createPaymentIntent = async (
      amount: number,
      currency: string,
      paymentType: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata?: Record<string, any>,
      retryCount: number = 0
   ) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping create payment intent API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.createPaymentIntent(token, {
            amount,
            currency,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            paymentType: paymentType as any,
            metadata,
         });

         dispatch({ type: 'SET_PAYMENT_INTENT', payload: response.data });
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';

         // Retry logic for network errors
         if (retryCount < 3 && errorMessage.includes('network')) {
            setTimeout(() => {
               createPaymentIntent(amount, currency, paymentType, metadata, retryCount + 1);
            }, Math.pow(2, retryCount) * 1000); // Exponential backoff
            return;
         }

         dispatch({
            type: 'SET_ERROR',
            payload: errorMessage
         });
      }
   };

   const confirmPayment = async (paymentIntentId: string, paymentMethodId: string) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping confirm payment API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.confirmPayment(token, {
            paymentIntentId,
            paymentMethodId,
         });

         if (response.data.status === 'succeeded') {
            dispatch({ type: 'CLEAR_PAYMENT_INTENT' });
            // Reload payment methods to get updated list
            await loadPaymentMethods();
         }
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to confirm payment'
         });
      }
   };

   // Subscription Methods
   const createSubscription = async (priceId: string, tier: string, paymentMethodId?: string) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping create subscription API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         if (!paymentMethodId) {
            throw new Error('Payment method is required');
         }

         const response = await paymentAPI.createSubscription(token, {
            priceId,
            tier: tier as 'premium' | 'pro',
            paymentMethodId,
         });

         dispatch({ type: 'SET_SUBSCRIPTION', payload: response.data });
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to create subscription'
         });
      }
   };

   const updateSubscription = async (priceId: string, tier: string) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping update subscription API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.updateSubscription(token, {
            priceId,
            tier: tier as 'premium' | 'pro',
         });

         dispatch({ type: 'SET_SUBSCRIPTION', payload: response.data });
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to update subscription'
         });
      }
   };

   const cancelSubscription = async (cancelAtPeriodEnd: boolean = true) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping cancel subscription API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.cancelSubscription(token, {
            cancelAtPeriodEnd,
         });

         dispatch({ type: 'SET_SUBSCRIPTION', payload: response.data });
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to cancel subscription'
         });
      }
   };

   // Payment Methods
   const loadPaymentMethods = useCallback(async () => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payment methods API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.getPaymentMethods(token);
         dispatch({ type: 'SET_PAYMENT_METHODS', payload: response.data.paymentMethods });
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to load payment methods'
         });
      }
   }, []);

   const deletePaymentMethod = async (paymentMethodId: string) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping delete payment method API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         await paymentAPI.deletePaymentMethod(token, paymentMethodId);
         await loadPaymentMethods(); // Reload the list
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to delete payment method'
         });
      }
   };

   // Earnings
   const loadEarnings = useCallback(async () => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping earnings API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.getEarnings(token);
         dispatch({ type: 'SET_EARNINGS', payload: response.data });
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to load earnings'
         });
      }
   }, []);

   // Payment History
   const loadPaymentHistory = useCallback(async (query: PaymentHistoryQuery = {}) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payment history API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         await paymentAPI.getPaymentHistory(token, query);
         // Note: Payment history would need to be added to state if needed
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to load payment history'
         });
      }
   }, []);

   // Payouts
   const setupPayoutAccount = async (data: PayoutSetupRequest) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payout account setup API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         await paymentAPI.setupPayoutAccount(token, data);
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to setup payout account'
         });
      }
   };

   const getPayoutAccountStatus = useCallback(async () => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payout account status API call');
            return {
               accountId: 'mock-account-id',
               detailsSubmitted: false,
               chargesEnabled: false,
               transfersEnabled: false,
               requiresAction: true
            };
         }

         dispatch({ type: 'SET_LOADING', payload: true });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         const response = await paymentAPI.getPayoutAccountStatus(token);
         return response.data;
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to get payout account status'
         });
         throw error;
      }
   }, []);

   const requestPayout = async (data: PayoutRequest) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payout request API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         await paymentAPI.requestPayout(token, data);
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to request payout'
         });
      }
   };

   const loadPayoutHistory = useCallback(async (query: PayoutHistoryQuery = {}) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payout history API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         await paymentAPI.getPayoutHistory(token, query);
         // Note: Payout history would need to be added to state if needed
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to load payout history'
         });
      }
   }, []);

   // Refunds (Admin)
   const refundPayment = async (data: RefundRequest) => {
      try {
         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping refund payment API call');
            return;
         }

         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const token = getAuthToken();
         if (!token) {
            throw new Error('Authentication token not found');
         }

         await paymentAPI.refundPayment(token, data);
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to refund payment'
         });
      }
   };

   // Utility Methods
   const clearError = () => {
      dispatch({ type: 'SET_ERROR', payload: null });
   };

   const clearPaymentIntent = () => {
      dispatch({ type: 'CLEAR_PAYMENT_INTENT' });
   };

   const resetState = () => {
      dispatch({ type: 'RESET_STATE' });
   };

   // Load initial data
   useEffect(() => {
      // Skip API calls in development mode to prevent failed fetch errors
      if (process.env.NODE_ENV === 'development') {
         console.log('Development mode: Skipping API calls to prevent failed fetch errors');
         return;
      }

      // Only load data if we have an auth token (client-side only)
      if (typeof window === 'undefined') return;

      const hasAuthToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      if (hasAuthToken) {
         loadPaymentMethods();
         loadEarnings();
      }
   }, [loadPaymentMethods, loadEarnings]);

   const contextValue: PaymentContextType = {
      state,
      dispatch,
      createPaymentIntent,
      confirmPayment,
      createSubscription,
      updateSubscription,
      cancelSubscription,
      loadPaymentMethods,
      deletePaymentMethod,
      loadEarnings,
      loadPaymentHistory,
      setupPayoutAccount,
      getPayoutAccountStatus,
      requestPayout,
      loadPayoutHistory,
      refundPayment,
      clearError,
      clearPaymentIntent,
      resetState,
   };

   return (
      <PaymentContext.Provider value={contextValue}>
         {children}
      </PaymentContext.Provider>
   );
}

// Hook to use payment context
export function usePayment() {
   const context = useContext(PaymentContext);
   if (context === undefined) {
      throw new Error('usePayment must be used within a PaymentProvider');
   }
   return context;
}

export default PaymentContext;
