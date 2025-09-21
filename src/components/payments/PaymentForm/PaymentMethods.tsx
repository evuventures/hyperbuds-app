"use client";

import React, { useEffect } from 'react';
import { usePayment } from '@/context/PaymentContext';


interface PaymentMethodsProps {
   selectedMethod: string | null;
   onMethodSelect: (methodId: string) => void;
   onAddNew: () => void;
}

export function PaymentMethods({ selectedMethod, onMethodSelect, onAddNew }: PaymentMethodsProps) {
   const { state, loadPaymentMethods, deletePaymentMethod } = usePayment();

   useEffect(() => {
      // Skip API calls in development mode to prevent failed fetch errors
      if (process.env.NODE_ENV === 'development') {
         console.log('Development mode: Skipping payment methods API call');
         return;
      }

      loadPaymentMethods();
   }, [loadPaymentMethods]);

   const getCardIcon = (brand: string) => {
      const iconClass = "w-6 h-6 text-gray-600 dark:text-gray-400";

      switch (brand.toLowerCase()) {
         case 'visa':
            return (
               <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5 4.5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2h-5zm0 2h5v11h-5v-11z" />
                  <path d="M7 6.5h2v11H7v-11z" />
                  <path d="M15 6.5h2v11h-2v-11z" />
               </svg>
            );
         case 'mastercard':
            return (
               <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="12" r="3" />
                  <circle cx="15" cy="12" r="3" />
                  <path d="M9 9a3 3 0 0 0 0 6 3 3 0 0 0 0-6z" />
               </svg>
            );
         case 'amex':
            return (
               <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M8 8h8v8H8V8z" />
               </svg>
            );
         default:
            return (
               <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M8 8h8v8H8V8z" />
               </svg>
            );
      }
   };

   const formatCardNumber = (last4: string) => {
      return `•••• •••• •••• ${last4}`;
   };

   const formatExpiryDate = (month: number, year: number) => {
      return `${month.toString().padStart(2, '0')}/${year}`;
   };

   const handleDeleteMethod = async (methodId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      if (window.confirm('Are you sure you want to delete this payment method?')) {
         await deletePaymentMethod(methodId);

         // If the deleted method was selected, clear selection
         if (selectedMethod === methodId) {
            onMethodSelect('');
         }
      }
   };

   if (state.isLoading) {
      return (
         <div className="space-y-3">
            <div className="animate-pulse">
               <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
            <div className="animate-pulse">
               <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
         </div>
      );
   }

   if (state.paymentMethods.length === 0) {
      return (
         <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
               </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
               No payment methods
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
               Add a payment method to get started
            </p>
            <button
               onClick={onAddNew}
               className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
               Add Payment Method
            </button>
         </div>
      );
   }

   return (
      <div className="space-y-3">
         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Saved Payment Methods
         </h3>

         {state.paymentMethods.map((method) => (
            <div
               key={method.id}
               className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
               onClick={() => onMethodSelect(method.id)}
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     {getCardIcon(method.brand)}
                     <div>
                        <div className="flex items-center space-x-2">
                           <span className="font-medium text-gray-900 dark:text-white">
                              {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}
                           </span>
                           {method.isDefault && (
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                 Default
                              </span>
                           )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           {formatCardNumber(method.last4)} • Expires {formatExpiryDate(method.expMonth, method.expYear)}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center space-x-2">
                     <input
                        type="radio"
                        checked={selectedMethod === method.id}
                        onChange={() => onMethodSelect(method.id)}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                     />
                     <button
                        onClick={(e) => handleDeleteMethod(method.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete payment method"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                     </button>
                  </div>
               </div>
            </div>
         ))}

         <button
            onClick={onAddNew}
            className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
         >
            <div className="flex items-center justify-center space-x-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               <span>Add new payment method</span>
            </div>
         </button>
      </div>
   );
}

export default PaymentMethods;
