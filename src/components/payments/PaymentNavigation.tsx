"use client";

import React from 'react';
import Link from 'next/link';
import {
   CreditCard,
   DollarSign,
   History,
   Settings,
   TrendingUp,
   FileText
} from 'lucide-react';

export function PaymentNavigation() {
   const navigationItems = [
      {
         name: 'Checkout',
         href: '/payments/checkout',
         icon: CreditCard,
         description: 'Subscribe to a plan'
      },
      {
         name: 'Subscription',
         href: '/payments/subscription',
         icon: Settings,
         description: 'Manage your subscription'
      },
      {
         name: 'Earnings',
         href: '/payments/earnings',
         icon: TrendingUp,
         description: 'View creator earnings'
      },
      {
         name: 'History',
         href: '/payments/history',
         icon: History,
         description: 'Payment history'
      }
   ];

   return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Payment System Testing
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {navigationItems.map((item) => {
               const Icon = item.icon;
               return (
                  <Link
                     key={item.name}
                     href={item.href}
                     className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                     <div className="flex items-center space-x-3 mb-2">
                        <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                           {item.name}
                        </h3>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                     </p>
                  </Link>
               );
            })}
         </div>

         <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
               Testing Instructions:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
               <li>• <strong>Checkout:</strong> Test payment form and plan selection</li>
               <li>• <strong>Subscription:</strong> Test subscription management</li>
               <li>• <strong>Earnings:</strong> Test creator earnings dashboard</li>
               <li>• <strong>History:</strong> Test payment history and filters</li>
            </ul>
         </div>
      </div>
   );
}

export default PaymentNavigation;
