"use client";

import React, { useEffect, useState } from 'react';
import { usePayment } from '@/context/PaymentContext';
import { PaymentHistoryItem, PaymentHistoryQuery } from '@/types/payment.types';
import { paymentAPI } from '@/lib/api/payment.api';

interface BillingHistoryProps {
   className?: string;
}

export function BillingHistory({ className = '' }: BillingHistoryProps) {
   const { state } = usePayment();
   const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
   const [pagination, setPagination] = useState({
      total: 0,
      pages: 0,
      currentPage: 1,
      limit: 20,
   });
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const loadPayments = async (page: number = 1, filters: Partial<PaymentHistoryQuery> = {}) => {
      try {
         setIsLoading(true);
         setError(null);

         // Skip API calls in development mode to prevent failed fetch errors
         if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Skipping payment history API call');
            // Set mock data for development
            setPayments([
               {
                  _id: 'mock-payment-1',
                  amount: 2900,
                  currency: 'usd',
                  status: 'succeeded',
                  paymentType: 'subscription',
                  createdAt: '2024-01-15T10:30:00.000Z',
               },
               {
                  _id: 'mock-payment-2',
                  amount: 900,
                  currency: 'usd',
                  status: 'succeeded',
                  paymentType: 'one_time',
                  createdAt: '2024-01-10T14:20:00.000Z',
               },
               {
                  _id: 'mock-payment-3',
                  amount: 5000,
                  currency: 'usd',
                  status: 'pending',
                  paymentType: 'marketplace_service',
                  createdAt: '2024-01-08T09:15:00.000Z',
               },
            ]);
            setPagination({
               total: 3,
               pages: 1,
               currentPage: 1,
               limit: 20,
            });
            return;
         }

         const response = await paymentAPI.getPaymentHistory({
            page,
            limit: 20,
            ...filters,
         });

         setPayments(response.data.payments);
         setPagination(response.data.pagination);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to load payment history');
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      loadPayments();
   }, []);

   const formatAmount = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: currency.toUpperCase(),
      }).format(amount / 100);
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });
   };

   const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
         case 'succeeded':
            return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
         case 'pending':
            return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
         case 'failed':
            return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
         case 'canceled':
            return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
         default:
            return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      }
   };

   const getPaymentTypeIcon = (paymentType: string) => {
      switch (paymentType.toLowerCase()) {
         case 'subscription':
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
            );
         case 'marketplace_service':
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </svg>
            );
         case 'one_time':
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
               </svg>
            );
         default:
            return (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
               </svg>
            );
      }
   };

   const handlePageChange = (page: number) => {
      loadPayments(page);
   };

   const handleFilterChange = (filter: string, value: string) => {
      const filters: Partial<PaymentHistoryQuery> = {};
      if (filter === 'status' && value !== 'all') {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         filters.status = value as any;
      }
      if (filter === 'paymentType' && value !== 'all') {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         filters.paymentType = value as any;
      }
      loadPayments(1, filters);
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
         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Billing History
               </h3>
               <div className="flex space-x-2">
                  <select
                     onChange={(e) => handleFilterChange('status', e.target.value)}
                     className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                     <option value="all">All Status</option>
                     <option value="succeeded">Succeeded</option>
                     <option value="pending">Pending</option>
                     <option value="failed">Failed</option>
                     <option value="canceled">Canceled</option>
                  </select>
                  <select
                     onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                     className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                     <option value="all">All Types</option>
                     <option value="subscription">Subscription</option>
                     <option value="marketplace_service">Marketplace</option>
                     <option value="one_time">One-time</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
               Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-6 animate-pulse">
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                           <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                     </div>
                  </div>
               ))
            ) : payments.length === 0 ? (
               <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No payment history
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                     Your payment history will appear here once you make your first payment.
                  </p>
               </div>
            ) : (
               payments.map((payment) => (
                  <div key={payment._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              {getPaymentTypeIcon(payment.paymentType)}
                           </div>
                           <div>
                              <div className="flex items-center space-x-2">
                                 <h4 className="font-medium text-gray-900 dark:text-white">
                                    {payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1).replace('_', ' ')}
                                 </h4>
                                 <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                 </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 {formatDate(payment.createdAt)}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-gray-900 dark:text-white">
                              {formatAmount(payment.amount, payment.currency)}
                           </p>
                           <p className="text-sm text-gray-600 dark:text-gray-400">
                              {payment.currency.toUpperCase()}
                           </p>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         {/* Pagination */}
         {pagination.pages > 1 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
               <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                     Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                     {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                     {pagination.total} results
                  </p>
                  <div className="flex space-x-2">
                     <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                     >
                        Previous
                     </button>
                     <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.pages}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
                     >
                        Next
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

export default BillingHistory;
