"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import {
   PaymentState,
   PaymentIntentResponse,
   PaymentMethod,
   SubscriptionResponse,
   EarningsSummary,
   // PricingPlan, // Removed unused import
   // PaymentFormData // Removed unused import
} from '@/types/payment.types';
import { paymentAPI } from '@/lib/api/payment.api';

// Action Types
type PaymentAction =
   | { type: 'SET_LOADING'; payload: boolean }
   | { type: 'SET_ERROR'; payload: string | null }
   | { type: 'SET_PAYMENT_INTENT'; payload: PaymentIntentResponse['data'] | null }
   | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
   | { type: 'SET_SELECTED_PAYMENT_METHOD'; payload: string | null }
   | { type: 'SET_SUBSCRIPTION'; payload: SubscriptionResponse['data'] | null }
   | { type: 'SET_EARNINGS'; payload: EarningsSummary['data'] | null }
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
         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const response = await paymentAPI.createPaymentIntent({
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
         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const response = await paymentAPI.confirmPayment({
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
         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const response = await paymentAPI.createSubscription({
            priceId,
            tier: tier as 'basic' | 'premium' | 'enterprise',
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
         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const response = await paymentAPI.updateSubscription({
            priceId,
            tier: tier as 'basic' | 'premium' | 'enterprise',
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
         dispatch({ type: 'SET_LOADING', payload: true });
         dispatch({ type: 'SET_ERROR', payload: null });

         const response = await paymentAPI.cancelSubscription({
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
         dispatch({ type: 'SET_LOADING', payload: true });

         const response = await paymentAPI.getPaymentMethods();
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
         dispatch({ type: 'SET_LOADING', payload: true });

         await paymentAPI.deletePaymentMethod(paymentMethodId);
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
         dispatch({ type: 'SET_LOADING', payload: true });

         const response = await paymentAPI.getEarnings();
         dispatch({ type: 'SET_EARNINGS', payload: response.data });
      } catch (error) {
         dispatch({
            type: 'SET_ERROR',
            payload: error instanceof Error ? error.message : 'Failed to load earnings'
         });
      }
   }, []);

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
