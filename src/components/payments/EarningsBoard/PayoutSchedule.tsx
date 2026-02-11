"use client";

import React, { useState, useEffect } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { PayoutItem } from '@/types/payment.types';

interface PayoutScheduleProps {
   className?: string;
}

export function PayoutSchedule({ className = '' }: PayoutScheduleProps) {
   const { loadPayoutHistory } = usePayment();
   const [payouts, setPayouts] = useState<PayoutItem[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const loadPayouts = async () => {
         try {
            setIsLoading(true);
            setError(null);

            // Skip API calls in development mode to prevent failed fetch errors
            if (process.env.NODE_ENV === 'development') {
               console.log('Development mode: Skipping payout history API call');
               // Set mock data for development
               setPayouts([
                  {
                     _id: 'mock-payout-1',
                     amount: 250.00,
                     currency: 'USD',
                     status: 'paid',
                     type: 'marketplace_earnings',
                     createdAt: '2024-01-15T10:30:00.000Z',
                     estimatedArrival: '2024-01-16T10:30:00.000Z',
                  },
                  {
                     _id: 'mock-payout-2',
                     amount: 150.00,
                     currency: 'USD',
                     status: 'processing',
                     type: 'marketplace_earnings',
                     createdAt: '2024-01-10T14:20:00.000Z',
                     estimatedArrival: '2024-01-12T14:20:00.000Z',
                  },
                  {
                     _id: 'mock-payout-3',
                     amount: 75.50,
                     currency: 'USD',
                     status: 'pending',
                     type: 'marketplace_earnings',
                     createdAt: '2024-01-08T09:15:00.000Z',
                     estimatedArrival: '2024-01-10T09:15:00.000Z',
                  },
               ]);
               return;
            }

            await loadPayoutHistory({ limit: 10 });
            // Note: In a real implementation, you'd get the data from the context or API response
         } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payout history');
         } finally {
            setIsLoading(false);
         }
      };

      loadPayouts();
   }, [loadPayoutHistory]);

   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
      }).format(amount);
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
      });
   };

   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case 'paid':
            return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
         case 'processing':
            return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
         case 'pending':
            return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
         case 'failed':
            return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
         default:
            return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      }
   };

   const getStatusIcon = (status: string) => {
      switch (status.toLowerCase()) {
         case 'paid':
            return (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            );
         case 'processing':
            return (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
            );
         case 'pending':
            return (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            );
         case 'failed':
            return (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            );
         default:
            return (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            );
      }
   };

   if (error) {
      return (
         <div className={`p-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg ${className}`}>
            <div className="flex items-center">
               <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
         </div>
      );
   }

   return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
         <div className="p-6 border-b border-gray-300 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
               Payout Schedule
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
               Track your payout requests and their status
            </p>
         </div>

         <div className="divide-y divide-gray-300 dark:divide-gray-700">
            {isLoading ? (
               Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-6 animate-pulse">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                           <div className="space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                           <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                     </div>
                  </div>
               ))
            ) : payouts.length === 0 ? (
               <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                     </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No Payout History
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                     Your payout requests will appear here once you start earning
                  </p>
               </div>
            ) : (
               payouts.map((payout) => (
                  <div key={payout._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                           </div>
                           <div>
                              <div className="flex items-center space-x-2">
                                 <h4 className="font-medium text-gray-900 dark:text-white">
                                    {payout.type.charAt(0).toUpperCase() + payout.type.slice(1).replace('_', ' ')}
                                 </h4>
                                 <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(payout.status)}`}>
                                    {getStatusIcon(payout.status)}
                                    <span>{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</span>
                                 </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 Requested on {formatDate(payout.createdAt)}
                                 {payout.estimatedArrival && (
                                    <span> • Est. arrival: {formatDate(payout.estimatedArrival)}</span>
                                 )}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(payout.amount)}
                           </p>
                           <p className="text-sm text-gray-600 dark:text-gray-400">
                              {payout.currency.toUpperCase()}
                           </p>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         {payouts.length > 0 && (
            <div className="p-6 border-t border-gray-300 dark:border-gray-700">
               <button className="w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors">
                  View All Payouts
               </button>
            </div>
         )}
      </div>
   );
}

export default PayoutSchedule;
