"use client";

import React, { memo, useCallback } from 'react';
import { PricingPlan } from '@/types/payment.types';

interface PricingPlansProps {
   plans: PricingPlan[];
   selectedPlan: string;
   onPlanSelect: (planId: string) => void;
   isLoading?: boolean;
}

const PricingPlans = memo(function PricingPlans({ plans, selectedPlan, onPlanSelect, isLoading = false }: PricingPlansProps) {
   const handlePlanSelect = useCallback((planId: string) => {
      if (!isLoading) {
         onPlanSelect(planId);
      }
   }, [onPlanSelect, isLoading]);

   return (
      <div className="space-y-6">
         {plans.map((plan) => (
            <PricingPlanCard
               key={plan.id}
               plan={plan}
               isSelected={selectedPlan === plan.id}
               isLoading={isLoading}
               onSelect={handlePlanSelect}
            />
         ))}
      </div>
   );
});

interface PricingPlanCardProps {
   plan: PricingPlan;
   isSelected: boolean;
   isLoading: boolean;
   onSelect: (planId: string) => void;
}

const PricingPlanCard = memo(function PricingPlanCard({ plan, isSelected, isLoading, onSelect }: PricingPlanCardProps) {
   const handleClick = useCallback(() => {
      onSelect(plan.id);
   }, [onSelect, plan.id]);

   return (
      <label
         className={`flex flex-col p-5 rounded-xl border transition hover:shadow-md cursor-pointer relative
            ${isSelected
               ? "border-purple-500 bg-purple-50 dark:bg-purple-900 shadow-lg"
               : "border-gray-300 dark:border-gray-700"
            } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
         {/* Radio Input */}
         <input
            type="radio"
            name="plan"
            value={plan.id}
            checked={isSelected}
            onChange={handleClick}
            className="absolute top-4 right-4 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            disabled={isLoading}
         />

         {/* Popular Badge */}
         {plan.popular && (
            <div className="absolute -top-2 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
               Most Popular
            </div>
         )}

         <div className="flex justify-between items-start">
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
               </h3>
               <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
               </p>
            </div>
         </div>

         <div className="mt-3">
            <div className="flex items-baseline">
               <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${(plan.price / 100).toFixed(0)}
               </span>
               <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  /{plan.interval}
               </span>
            </div>
            {plan.interval === 'year' && (
               <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Save 20% with annual billing
               </p>
            )}
         </div>

         <ul className="flex-grow mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {plan.features.map((feature, index) => (
               <li key={index} className="flex items-center">
                  <svg
                     className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                     />
                  </svg>
                  {feature}
               </li>
            ))}
         </ul>
      </label>
   );
});

export { PricingPlans };

export default PricingPlans;
