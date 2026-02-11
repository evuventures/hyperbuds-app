"use client";

import React, { useState, useEffect } from 'react';
import { PaymentProvider, usePayment } from '@/context/PaymentContext';
import { SubscriptionCard } from '@/components/payments/SubscriptionCard';
import { PricingPlans } from '@/components/payments/PricingPlans';
import { PaymentMethods } from '@/components/payments/PaymentForm/PaymentMethods';
import { PricingPlan } from '@/types/payment.types';

// Available subscription plans
const availablePlans: PricingPlan[] = [
   {
      id: "basic",
      name: "Basic",
      price: 900, // $9.00 in cents
      currency: "usd",
      interval: "month",
      priceId: "price_basic_monthly",
      description: "Best for individuals getting started.",
      desc: "Best for individuals getting started.",
      features: ["✔ 5 Projects", "✔ Basic Support", "✔ Limited Features"],
      tier: "basic",
   },
   {
      id: "premium",
      name: "Premium",
      price: 2900, // $29.00 in cents
      currency: "usd",
      interval: "month",
      priceId: "price_premium_monthly",
      description: "Perfect for growing teams.",
      desc: "Perfect for growing teams.",
      features: ["✔ Unlimited Projects", "✔ Priority Support", "✔ Advanced Features"],
      tier: "premium",
      popular: true,
   },
   {
      id: "enterprise",
      name: "Enterprise",
      price: 9900, // $99.00 in cents
      currency: "usd",
      interval: "month",
      priceId: "price_enterprise_monthly",
      description: "Tailored solutions for businesses.",
      desc: "Tailored solutions for businesses.",
      features: ["✔ Dedicated Support", "✔ Custom Integrations", "✔ SLA & Compliance"],
      tier: "enterprise",
   },
];

function SubscriptionManagement() {
   const { state, createSubscription, updateSubscription, cancelSubscription, loadPaymentMethods } = usePayment();
   const [selectedPlan, setSelectedPlan] = useState<string>('');
   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
   const [showUpdateForm, setShowUpdateForm] = useState(false);
   const [isProcessing, setIsProcessing] = useState(false);

   useEffect(() => {
      loadPaymentMethods();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const handlePlanSelect = (planId: string) => {
      setSelectedPlan(planId);
   };

   const handlePaymentMethodSelect = (methodId: string) => {
      setSelectedPaymentMethod(methodId);
   };

   const handleCreateSubscription = async () => {
      if (!selectedPlan || !selectedPaymentMethod) {
         alert('Please select a plan and payment method');
         return;
      }

      try {
         setIsProcessing(true);
         const plan = availablePlans.find(p => p.id === selectedPlan);
         if (!plan) return;

         await createSubscription(plan.priceId, plan.tier, selectedPaymentMethod);
         alert('Subscription created successfully!');
         setShowUpdateForm(false);
      } catch (error) {
         console.error('Failed to create subscription:', error);
         alert('Failed to create subscription. Please try again.');
      } finally {
         setIsProcessing(false);
      }
   };

   const handleUpdateSubscription = async (newPlanId: string) => {
      try {
         setIsProcessing(true);
         const plan = availablePlans.find(p => p.id === newPlanId);
         if (!plan) return;

         await updateSubscription(plan.priceId, plan.tier);
         alert('Subscription updated successfully!');
         setShowUpdateForm(false);
      } catch (error) {
         console.error('Failed to update subscription:', error);
         alert('Failed to update subscription. Please try again.');
      } finally {
         setIsProcessing(false);
      }
   };

   const handleCancelSubscription = async () => {
      if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
         try {
            setIsProcessing(true);
            await cancelSubscription(true); // Cancel at period end
            alert('Subscription will be canceled at the end of the current billing period.');
         } catch (error) {
            console.error('Failed to cancel subscription:', error);
            alert('Failed to cancel subscription. Please try again.');
         } finally {
            setIsProcessing(false);
         }
      }
   };

   const handleAddNewPaymentMethod = () => {
      // Redirect to checkout page to add new payment method
      window.location.href = '/payments/checkout';
   };

   if (state.isLoading) {
      return (
            <div className="min-h-full bg-gray-50 dark:bg-slate-900">
               <div className="p-4 pb-16 lg:p-6 lg:pb-34">
                  <div className="flex justify-center items-center h-64">
                     <div className="w-12 h-12 rounded-full border-b-2 border-purple-500 animate-spin"></div>
                  </div>
               </div>
            </div>
      );
   }

   return (
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
            <div className="p-4 pb-16 lg:p-6 lg:pb-34">
               <div className="mx-auto max-w-6xl">
            <div className="mb-8">
               <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
                  Subscription Management
               </h1>
               <p className="text-gray-600 dark:text-gray-400">
                  Manage your subscription and billing preferences
               </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
               {/* Current Subscription */}
               <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                     Current Subscription
                  </h2>

                  {state.subscription ? (
                     <SubscriptionCard
                        subscription={state.subscription}
                        onUpdate={() => setShowUpdateForm(true)}
                        onCancel={handleCancelSubscription}
                        isLoading={isProcessing}
                     />
                  ) : (
                     <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                        <div className="text-center">
                           <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full dark:bg-gray-700">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                           </div>
                           <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                              No Active Subscription
                           </h3>
                           <p className="mb-4 text-gray-600 dark:text-gray-400">
                              Choose a plan to get started with HyperBuds
                           </p>
                           <button
                              onClick={() => setShowUpdateForm(true)}
                              className="px-4 py-2 text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700"
                           >
                              Choose Plan
                           </button>
                        </div>
                     </div>
                  )}

                  {/* Payment Methods */}
                  <div>
                     <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                        Payment Methods
                     </h3>
                     <PaymentMethods
                        selectedMethod={selectedPaymentMethod}
                        onMethodSelect={handlePaymentMethodSelect}
                        onAddNew={handleAddNewPaymentMethod}
                     />
                  </div>
               </div>

               {/* Available Plans or Update Form */}
               <div className="space-y-6">
                  {showUpdateForm ? (
                     <div>
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {state.subscription ? 'Update Subscription' : 'Choose a Plan'}
                           </h2>
                           <button
                              onClick={() => setShowUpdateForm(false)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                           >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>

                        <PricingPlans
                           plans={availablePlans}
                           selectedPlan={selectedPlan}
                           onPlanSelect={handlePlanSelect}
                           isLoading={isProcessing}
                        />

                        {selectedPlan && (
                           <div className="p-4 mt-6 bg-purple-50 rounded-lg dark:bg-purple-900">
                              <div className="flex justify-between items-center">
                                 <div>
                                    <h4 className="font-medium text-purple-900 dark:text-purple-100">
                                       Selected Plan
                                    </h4>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">
                                       {availablePlans.find(p => p.id === selectedPlan)?.name} -
                                       ${(availablePlans.find(p => p.id === selectedPlan)?.price || 0) / 100}/month
                                    </p>
                                 </div>
                                 <button
                                    onClick={state.subscription ? () => handleUpdateSubscription(selectedPlan) : handleCreateSubscription}
                                    disabled={!selectedPaymentMethod || isProcessing}
                                    className="px-6 py-2 text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                    {isProcessing ? 'Processing...' : state.subscription ? 'Update Plan' : 'Subscribe'}
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  ) : (
                     <div>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                           Available Plans
                        </h2>
                        <div className="space-y-4">
                           {availablePlans.map((plan) => (
                              <div key={plan.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h3 className="font-semibold text-gray-900 dark:text-white">
                                          {plan.name}
                                       </h3>
                                       <p className="text-sm text-gray-600 dark:text-gray-400">
                                          {plan.description}
                                       </p>
                                       <div className="mt-2">
                                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                             ${(plan.price / 100).toFixed(0)}
                                          </span>
                                          <span className="text-gray-600 dark:text-gray-400">/{plan.interval}</span>
                                       </div>
                                    </div>
                                    <button
                                       onClick={() => setShowUpdateForm(true)}
                                       className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700"
                                    >
                                       {state.subscription ? 'Change' : 'Select'}
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Error Display */}
            {state.error && (
               <div className="p-4 mt-6 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900 dark:border-red-700">
                  <p className="text-red-600 dark:text-red-400">{state.error}</p>
               </div>
            )}
               </div>
            </div>
         </div>
   );
}

export default function SubscriptionPage() {
   return (
      <PaymentProvider>
         <SubscriptionManagement />
      </PaymentProvider>
   );
}
