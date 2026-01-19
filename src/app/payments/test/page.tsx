"use client";

import React from 'react';
import { PaymentProvider } from '@/context/PaymentContext';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { PaymentNavigation } from '@/components/payments/PaymentNavigation';

function PaymentTestPage() {
   return (
      <DashboardLayout>
         <div className="min-h-full bg-gray-50 dark:bg-slate-900">
            <div className="p-4 pb-16 lg:p-6 lg:pb-34">
               <div className="mx-auto max-w-6xl">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment System Test Page
               </h1>
               <p className="text-gray-600 dark:text-gray-400">
                  Test all the payment pages and components we&39;ve created
               </p>
            </div>

            <PaymentNavigation />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                     Features Implemented
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                     <li>✅ Complete API integration with HyperBuds Payment API</li>
                     <li>✅ Stripe payment processing</li>
                     <li>✅ Subscription management</li>
                     <li>✅ Creator earnings dashboard</li>
                     <li>✅ Payment history with filters</li>
                     <li>✅ Payout management</li>
                     <li>✅ Tax document handling</li>
                     <li>✅ Payment method management</li>
                     <li>✅ Responsive design</li>
                     <li>✅ Dark mode support</li>
                  </ul>
               </div>

               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                     Quick Links
                  </h3>
                  <div className="space-y-3">
                     <a
                        href="/payments/checkout"
                        className="block p-3 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                     >
                        <div className="font-medium text-purple-900 dark:text-purple-100">Checkout Page</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Test payment form and plan selection</div>
                     </a>

                     <a
                        href="/payments/subscription"
                        className="block p-3 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                     >
                        <div className="font-medium text-blue-900 dark:text-blue-100">Subscription Management</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Manage subscriptions and payment methods</div>
                     </a>

                     <a
                        href="/payments/earnings"
                        className="block p-3 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                     >
                        <div className="font-medium text-green-900 dark:text-green-100">Creator Earnings</div>
                        <div className="text-sm text-green-700 dark:text-green-300">View earnings and request payouts</div>
                     </a>

                     <a
                        href="/payments/history"
                        className="block p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
                     >
                        <div className="font-medium text-yellow-900 dark:text-yellow-100">Payment History</div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">View all payment transactions</div>
                     </a>
                  </div>
               </div>
            </div>
               </div>
            </div>
         </div>
      </DashboardLayout>
   );
}

export default function PaymentTestPageWrapper() {
   return (
      <PaymentProvider>
         <PaymentTestPage />
      </PaymentProvider>
   );
}
