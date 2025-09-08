"use client";

import React, { useState } from "react";
import { FaApple } from "react-icons/fa";
import { Header } from "@/components/layout/Header/Header";

export default function CheckoutPage() {
   const [selectedPlan, setSelectedPlan] = useState<string>("Basic"); // default selected

   const plans = [
      {
         name: "Basic",
         price: "$9/mo",
         desc: "Best for individuals getting started.",
         features: ["✔ 5 Projects", "✔ Basic Support", "✔ Limited Features"],
      },
      {
         name: "Premium",
         price: "$29/mo",
         desc: "Perfect for growing teams.",
         features: ["✔ Unlimited Projects", "✔ Priority Support", "✔ Advanced Features"],
      },
      {
         name: "Enterprise",
         price: "$99/mo",
         desc: "Tailored solutions for businesses.",
         features: ["✔ Dedicated Support", "✔ Custom Integrations", "✔ SLA & Compliance"],
      },
   ];

   const inputClasses =
      "p-3 mt-2 w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500";

   // Mock user data for header
   const mockUser = {
      username: "user",
      email: "user@example.com",
      displayName: "User",
      avatar: ""
   };

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
         {/* Header with Dark Mode Toggle */}
         <Header user={mockUser} onMenuClick={() => { }} />

         <div className="flex justify-center px-6 py-12">
            <div className="grid grid-cols-1 w-full max-w-6xl bg-white rounded-2xl shadow-lg dark:bg-gray-800 lg:grid-cols-2">

               {/* Left side - Pricing Plans */}
               <div className="p-10 border-b border-gray-200 lg:border-b-0 lg:border-r dark:border-gray-700">
                  <h2 className="mb-8 text-xl font-bold text-gray-900 dark:text-white">
                     Choose Your Plan
                  </h2>

                  <div className="space-y-6">
                     {plans.map((plan) => (
                        <label
                           key={plan.name}
                           className={`flex flex-col p-5 rounded-xl border transition hover:shadow-md cursor-pointer relative
                           ${selectedPlan === plan.name
                                 ? "border-purple-500 bg-purple-50 dark:bg-purple-900 shadow-lg"
                                 : "border-gray-200 dark:border-gray-700"
                              }`}
                        >
                           {/* Radio Input */}
                           <input
                              type="radio"
                              name="plan"
                              value={plan.name}
                              checked={selectedPlan === plan.name}
                              onChange={() => setSelectedPlan(plan.name)}
                              className="absolute top-4 right-4 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                           />

                           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {plan.name}
                           </h3>
                           <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {plan.desc}
                           </p>
                           <p className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
                              {plan.price}
                           </p>
                           <ul className="flex-grow mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              {plan.features.map((f, i) => (
                                 <li key={i}>{f}</li>
                              ))}
                           </ul>
                        </label>
                     ))}
                  </div>
               </div>

               {/* Right side - Payment Form */}
               <div className="p-10">
                  {/* Apple Pay */}
                  <button className="flex gap-2 justify-center items-center py-3 w-full font-medium text-white bg-black rounded-lg transition cursor-pointer hover:opacity-90">
                     <FaApple size={20} />
                     Pay
                  </button>

                  <div className="flex items-center my-8">
                     <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                     <span className="px-4 text-sm text-gray-500">Or pay with card</span>
                     <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                  </div>

                  {/* Payment Form */}
                  <form className="space-y-5">
                     {/* Cardholder Name */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Cardholder Name
                        </label>
                        <input type="text" className={inputClasses} placeholder="John Doe" />
                     </div>

                     {/* Card Number */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Card Number
                        </label>
                        <input type="text" className={inputClasses} placeholder="1234 5678 9012 3456" />
                     </div>

                     {/* Expiry + CVV */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Expiry Date
                           </label>
                           <input type="text" className={inputClasses} placeholder="MM/YY" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              CVV
                           </label>
                           <input type="password" className={inputClasses} placeholder="123" />
                        </div>
                     </div>

                     {/* Email */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Email
                        </label>
                        <input type="email" className={inputClasses} placeholder="you@example.com" />
                     </div>

                     {/* Billing Address */}
                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                           Billing Address
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="text" placeholder="Street Address" className={inputClasses} />
                           <input type="text" placeholder="Apt / Suite" className={inputClasses} />
                           <input type="text" placeholder="City" className={inputClasses} />
                           <input type="text" placeholder="State / Province" className={inputClasses} />
                           <input type="text" placeholder="ZIP / Postal Code" className={inputClasses} />
                           <input type="text" placeholder="Country" className={inputClasses} />
                        </div>
                     </div>

                     <button
                        type="submit"
                        className="py-3 mt-6 w-full font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md transition cursor-pointer hover:opacity-90"
                     >
                        Pay Now
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </div>
   );
}
