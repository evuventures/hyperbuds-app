"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton Loading Components - use shared Skeleton primitive
export function PaymentFormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
      <div>
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-28" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded" />
    </div>
  );
}

export function PaymentMethodsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function PricingPlansSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="mb-2 h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <div className="mb-4">
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, featureIndex) => (
              <Skeleton key={featureIndex} className="h-4 w-3/4 max-w-[14rem]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function BillingHistorySkeleton() {
  return (
    <div className="rounded-lg bg-white shadow-md dark:bg-gray-800">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4 p-6">
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscriptionCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
   const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
   };

   return (
      <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
         <svg className="w-full h-full text-purple-600" fill="none" viewBox="0 0 24 24">
            <circle
               className="opacity-25"
               cx="12"
               cy="12"
               r="10"
               stroke="currentColor"
               strokeWidth="4"
            />
            <path
               className="opacity-75"
               fill="currentColor"
               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
         </svg>
      </div>
   );
}

// Loading Button Component
export function LoadingButton({
   isLoading,
   children,
   className = '',
   ...props
}: {
   isLoading: boolean;
   children: React.ReactNode;
   className?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   [key: string]: any;
}) {
   return (
      <button
         className={`flex items-center justify-center gap-2 ${className}`}
         disabled={isLoading}
         {...props}
      >
         {isLoading && <LoadingSpinner size="sm" />}
         {children}
      </button>
   );
}

// Error State Component
export function ErrorState({
   title,
   message,
   onRetry,
   retryText = 'Try Again',
   className = '',
}: {
   title: string;
   message: string;
   onRetry?: () => void;
   retryText?: string;
   className?: string;
}) {
   return (
      <div className={`text-center py-8 ${className}`}>
         <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
         </div>
         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {title}
         </h3>
         <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message}
         </p>
         {onRetry && (
            <button
               onClick={onRetry}
               className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
               {retryText}
            </button>
         )}
      </div>
   );
}

// Empty State Component
export function EmptyState({
   title,
   message,
   action,
   className = '',
}: {
   title: string;
   message: string;
   action?: React.ReactNode;
   className?: string;
}) {
   return (
      <div className={`text-center py-8 ${className}`}>
         <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
         </div>
         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {title}
         </h3>
         <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message}
         </p>
         {action}
      </div>
   );
}

const LoadingStates = {
  PaymentFormSkeleton,
  PaymentMethodsSkeleton,
  PricingPlansSkeleton,
  BillingHistorySkeleton,
  SubscriptionCardSkeleton,
  LoadingSpinner,
  LoadingButton,
  ErrorState,
  EmptyState,
};


export default LoadingStates;
