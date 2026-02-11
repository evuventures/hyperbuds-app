"use client";

import React from 'react';
import { PaymentProvider, usePayment } from '@/context/PaymentContext';
import { BillingHistory } from '@/components/payments/PaymentForm/BillingHistory';
function PaymentHistoryPage() {
   const { state } = usePayment();

   return (
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
            <div className="p-4 pb-16 lg:p-6 lg:pb-34">
               <div className="mx-auto max-w-6xl space-y-6">
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
                        Payment History
                     </h1>
                     <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                        View all your payment transactions and billing history.
                     </p>
                  </div>

                  <div className="space-y-6">
                     <BillingHistory />

                     <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/60">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                           Payment Information
                        </h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                           <div>
                              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                                 Payment Methods
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 All payments are processed securely through Stripe. Your
                                 payment details are encrypted and never stored on our servers.
                              </p>
                           </div>
                           <div>
                              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                                 Billing Support
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 Need help with billing? Contact support for assistance.
                              </p>
                              <button className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                                 Contact Support
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/60">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                           Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                           <button
                              onClick={() => window.location.href = '/payments/subscription'}
                              className="p-4 text-left border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                           >
                              <div className="flex items-center space-x-3">
                                 <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full dark:bg-purple-900">
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
                              className="p-4 text-left border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                           >
                              <div className="flex items-center space-x-3">
                                 <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
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
                              className="p-4 text-left border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                           >
                              <div className="flex items-center space-x-3">
                                 <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900">
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

                     {state.error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900 dark:border-red-700">
                           <p className="text-red-600 dark:text-red-400">{state.error}</p>
                        </div>
                     )}
                  </div>
               </div>
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
