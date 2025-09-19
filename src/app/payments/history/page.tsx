"use client";

import React from 'react';
import { PaymentProvider, usePayment } from '@/context/PaymentContext';
import { Header } from '@/components/layout/Header/Header';
import { BillingHistory } from '@/components/payments/PaymentForm/BillingHistory';

// Mock user data
const mockUser = {
   id: '1',
   name: 'John Doe',
   email: 'john@example.com',
   avatar: '/images/user1.png',
};

function PaymentHistoryPage() {
   const { state } = usePayment();

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         <Header user={mockUser} onMenuClick={() => { }} />

         <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment History
               </h1>
               <p className="text-gray-600 dark:text-gray-400">
                  View all your payment transactions and billing history
               </p>
            </div>

            <div className="space-y-6">
               {/* Payment History Component */}
               <BillingHistory />

               {/* Additional Information */}
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                     Payment Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                           Payment Methods
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           All payments are processed securely through Stripe.
                           Your payment information is encrypted and never stored on our servers.
                        </p>
                     </div>

                     <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                           Billing Support
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                           Need help with a payment or have billing questions?
                           Contact our support team for assistance.
                        </p>
                        <button className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                           Contact Support
                        </button>
                     </div>
                  </div>
               </div>

               {/* Quick Actions */}
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                     Quick Actions
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <button
                        onClick={() => window.location.href = '/payments/subscription'}
                        className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                     >
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                           </div>
                           <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Manage Subscription</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Update or cancel your plan</p>
                           </div>
                        </div>
                     </button>

                     <button
                        onClick={() => window.location.href = '/payments/earnings'}
                        className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                     >
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                           </div>
                           <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">View Earnings</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Track your creator earnings</p>
                           </div>
                        </div>
                     </button>

                     <button
                        onClick={() => window.location.href = '/payments/checkout'}
                        className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                     >
                        <div className="flex items-center space-x-3">
                           <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                           </div>
                           <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">Make Payment</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Subscribe to a new plan</p>
                           </div>
                        </div>
                     </button>
                  </div>
               </div>
            </div>

            {/* Error Display */}
            {state.error && (
               <div className="mt-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{state.error}</p>
               </div>
            )}
         </div>
      </div>
   );
}

export default function PaymentHistoryPageWrapper() {
   return (
      <PaymentProvider>
         <PaymentHistoryPage />
      </PaymentProvider>
   );
}
