"use client";

import React, { useState } from "react";
import { FaApple } from "react-icons/fa";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { PaymentProvider, usePayment } from "@/context/PaymentContext";
import { PricingPlans } from "@/components/payments/PricingPlans";
import { StripeForm } from "@/components/payments/PaymentForm/StripeForm";
import { PricingPlan } from "@/types/payment.types";

// Pricing plans configuration
const plans: PricingPlan[] = [
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

function CheckoutContent() {
   const { state, createSubscription } = usePayment();
   const [selectedPlan, setSelectedPlan] = useState<string>("premium"); // default selected
   const [isProcessing, setIsProcessing] = useState(false);
   const [success, setSuccess] = useState(false);

   // Get selected plan details
   const selectedPlanDetails = plans.find(plan => plan.id === selectedPlan);

   // Handle plan selection
   const handlePlanSelect = (planId: string) => {
      setSelectedPlan(planId);
   };

   // Handle payment submission
   const handlePaymentSubmit = async (paymentMethodId: string) => {
      if (!selectedPlanDetails) return;

      try {
         setIsProcessing(true);

         // Create subscription with the payment method
         await createSubscription(
            selectedPlanDetails.priceId,
            selectedPlanDetails.tier,
            paymentMethodId
         );

         setSuccess(true);
      } catch (error) {
         console.error('Payment failed:', error);
      } finally {
         setIsProcessing(false);
      }
   };

   // Handle Apple Pay (Currently Disabled)
   const handleApplePay = async () => {
      alert('Apple Pay is currently disabled. Please use a card instead.');
   };

   // Success state
   if (success) {
      return (
         <DashboardLayout>
            <div className="min-h-full bg-gray-50 dark:bg-slate-900">
               <div className="p-4 pb-16 lg:p-6 lg:pb-34">
                  <div className="flex justify-center items-center min-h-[60vh]">
                     <div className="p-8 w-full max-w-md text-center bg-white rounded-2xl shadow-lg dark:bg-gray-800">
                        <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full dark:bg-green-900">
                           <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                           Payment Successful!
                        </h2>
                        <p className="mb-6 text-gray-600 dark:text-gray-400">
                           Your {selectedPlanDetails?.name} subscription is now active.
                        </p>
                        <button
                           onClick={() => window.location.href = '/dashboard'}
                           className="py-3 w-full font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transition hover:opacity-90"
                        >
                           Go to Dashboard
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </DashboardLayout>
      );
   }

   return (
      <DashboardLayout>
         <div className="min-h-full bg-gray-50 dark:bg-slate-900">
            <div className="p-4 pb-16 lg:p-6 lg:pb-34">
               <div className="flex justify-center">
                  <div className="grid grid-cols-1 w-full max-w-6xl bg-white rounded-2xl shadow-lg dark:bg-gray-800 lg:grid-cols-2">
                     {/* Left side - Pricing Plans */}
                     <div className="p-10 border-b border-gray-200 lg:border-b-0 lg:border-r dark:border-gray-700">
                        <h2 className="mb-8 text-xl font-bold text-gray-900 dark:text-white">
                           Choose Your Plan
                        </h2>

                        <PricingPlans
                           plans={plans}
                           selectedPlan={selectedPlan}
                           onPlanSelect={handlePlanSelect}
                           isLoading={state.isLoading}
                        />
                     </div>

                     {/* Right side - Payment Form */}
                     <div className="p-10">
                        {/* Order Summary */}
                        {selectedPlanDetails && (
                           <div className="p-4 mb-6 bg-gray-50 rounded-lg dark:bg-gray-700">
                              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Order Summary</h3>
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-600 dark:text-gray-400">
                                    {selectedPlanDetails.name} Plan
                                 </span>
                                 <span className="font-semibold text-gray-900 dark:text-white">
                                    ${(selectedPlanDetails.price / 100).toFixed(2)}/{selectedPlanDetails.interval}
                                 </span>
                              </div>
                           </div>
                        )}

                        {/* Apple Pay - Currently Disabled */}
                        <div id="apple-pay-button-container" className="mb-6">
                           <button
                              onClick={handleApplePay}
                              disabled={true}
                              className="flex gap-2 justify-center items-center py-3 w-full font-medium text-white bg-gray-400 rounded-lg opacity-50 transition cursor-not-allowed"
                              title="Apple Pay is currently disabled"
                           >
                              <FaApple size={20} />
                              Pay with Apple Pay (Disabled)
                           </button>
                        </div>

                        <div className="flex items-center my-6">
                           <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                           <span className="px-4 text-sm text-gray-500">Or pay with card</span>
                           <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                        </div>

                        {/* Payment Form - Always Visible */}
                        <StripeForm
                           onSubmit={handlePaymentSubmit}
                           isLoading={isProcessing}
                           error={state.error}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </DashboardLayout>
   );
}

// Main component with PaymentProvider
export default function CheckoutPage() {
   return (
      <PaymentProvider>
         <CheckoutContent />
      </PaymentProvider>
   );
}
