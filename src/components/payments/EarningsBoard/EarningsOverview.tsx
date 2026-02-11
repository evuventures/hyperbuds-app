"use client";

import React from 'react';
import { EarningsSummary } from '@/types/payment.types';

interface EarningsOverviewProps {
   earnings: EarningsSummary | null;
   isLoading?: boolean;
}

export function EarningsOverview({ earnings, isLoading = false }: EarningsOverviewProps) {
   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD',
      }).format(amount);
   };

   // Use mock data in development mode if no earnings data
   const displayEarnings = earnings || (process.env.NODE_ENV === 'development' ? {
      totalEarnings: 1250.50,
      availableForPayout: 850.25,
      pendingPayouts: 200.00,
      completedPayouts: 200.25,
      thisMonthEarnings: 425.75
   } : null);

   if (isLoading) {
      return (
         <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
               Earnings Overview
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
               {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                     <div className="mb-2 w-1/2 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                     <div className="w-3/4 h-8 bg-gray-200 rounded dark:bg-gray-700"></div>
                  </div>
               ))}
            </div>
         </div>
      );
   }

   if (!displayEarnings) {
      return (
         <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
               Earnings Overview
            </h3>
            <div className="py-8 text-center">
               <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full dark:bg-gray-700">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
               </div>
               <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  No Earnings Data
               </h4>
               <p className="text-gray-600 dark:text-gray-400">
                  Start creating content to see your earnings here
               </p>
            </div>
         </div>
      );
   }

   const earningsData = [
      {
         label: 'Total Earnings',
         value: formatCurrency(displayEarnings.totalEarnings),
         icon: (
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
         ),
         color: 'text-green-600 dark:text-green-400',
         bgColor: 'bg-green-50 dark:bg-green-900',
      },
      {
         label: 'Available for Payout',
         value: formatCurrency(displayEarnings.availableForPayout),
         icon: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
         ),
         color: 'text-blue-600 dark:text-blue-400',
         bgColor: 'bg-blue-50 dark:bg-blue-900',
      },
      {
         label: 'Pending Payouts',
         value: formatCurrency(displayEarnings.pendingPayouts),
         icon: (
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
         ),
         color: 'text-yellow-600 dark:text-yellow-400',
         bgColor: 'bg-yellow-50 dark:bg-yellow-900',
      },
      {
         label: 'This Month',
         value: formatCurrency(displayEarnings.thisMonthEarnings),
         icon: (
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
         ),
         color: 'text-purple-600 dark:text-purple-400',
         bgColor: 'bg-purple-50 dark:bg-purple-900',
      },
   ];

   return (
      <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-md dark:bg-gray-800 dark:border-gray-700">
         <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
            Earnings Overview
         </h3>

         <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {earningsData.map((item, index) => (
               <div key={index} className={`p-4 rounded-lg ${item.bgColor}`}>
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {item.label}
                     </p>
                     {item.icon}
                  </div>
                  <p className={`text-2xl font-bold ${item.color}`}>
                     {item.value}
                  </p>
               </div>
            ))}
         </div>

         {/* Additional Stats */}
         <div className="pt-6 mt-6 border-t border-gray-300 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Payouts</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                     {formatCurrency(displayEarnings.completedPayouts)}
                  </p>
               </div>
               <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Payout Success Rate</p>
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                     {displayEarnings.completedPayouts > 0
                        ? `${Math.round((displayEarnings.completedPayouts / (displayEarnings.completedPayouts + displayEarnings.pendingPayouts)) * 100)}%`
                        : '0%'
                     }
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}

export default EarningsOverview;
