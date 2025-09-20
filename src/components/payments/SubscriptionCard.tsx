"use client";

import React from 'react';
import { SubscriptionResponse } from '@/types/payment.types';

interface SubscriptionCardProps {
   subscription: SubscriptionResponse['data'];
   onUpdate?: () => void;
   onCancel?: () => void;
   isLoading?: boolean;
}

export function SubscriptionCard({ subscription, onUpdate, onCancel, isLoading = false }: SubscriptionCardProps) {
   const getStatusColor = (status: string) => {
      switch (status) {
         case 'active':
            return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
         case 'trialing':
            return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
         case 'past_due':
            return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
         case 'canceled':
            return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
         default:
            return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      }
   };

   const getStatusText = (status: string) => {
      switch (status) {
         case 'active':
            return 'Active';
         case 'trialing':
            return 'Trial';
         case 'past_due':
            return 'Past Due';
         case 'canceled':
            return 'Canceled';
         case 'incomplete':
            return 'Incomplete';
         case 'incomplete_expired':
            return 'Expired';
         case 'unpaid':
            return 'Unpaid';
         default:
            return status.charAt(0).toUpperCase() + status.slice(1);
      }
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      });
   };

   const getTierDisplayName = (tier: string) => {
      return tier.charAt(0).toUpperCase() + tier.slice(1);
   };

   return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
         <div className="flex items-center justify-between mb-4">
            <div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTierDisplayName(subscription.subscription.tier)} Subscription
               </h3>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subscription ID: {subscription.subscriptionId}
               </p>
            </div>
            <span
               className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}
            >
               {getStatusText(subscription.status)}
            </span>
         </div>

         <div className="space-y-3">
            <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600 dark:text-gray-400">Current Period End:</span>
               <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(subscription.subscription.currentPeriodEnd)}
               </span>
            </div>

            <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600 dark:text-gray-400">Tier:</span>
               <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getTierDisplayName(subscription.subscription.tier)}
               </span>
            </div>
         </div>

         {(onUpdate || onCancel) && (
            <div className="mt-6 flex gap-3">
               {onUpdate && (
                  <button
                     onClick={onUpdate}
                     disabled={isLoading}
                     className="flex-1 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 dark:bg-purple-900 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {isLoading ? 'Updating...' : 'Update Plan'}
                  </button>
               )}
               {onCancel && (
                  <button
                     onClick={onCancel}
                     disabled={isLoading}
                     className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                     {isLoading ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
               )}
            </div>
         )}
      </div>
   );
}

export default SubscriptionCard;
