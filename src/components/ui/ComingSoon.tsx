'use client';

import React from 'react';
import { Sparkles, Calendar, Bell, Rocket, TrendingUp, Zap } from 'lucide-react';

interface ComingSoonProps {
   title?: string;
   description?: string;
   icon?: 'sparkles' | 'calendar' | 'bell' | 'rocket' | 'trending' | 'zap';
   variant?: 'default' | 'gradient' | 'minimal' | 'feature';
   size?: 'sm' | 'md' | 'lg';
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
   title = 'Coming Soon',
   description = 'Get recent updates on events happening in HyperBuds',
   icon = 'sparkles',
   variant = 'default',
   size = 'md',
}) => {
   const getIcon = () => {
      const iconProps = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8';

      switch (icon) {
         case 'calendar':
            return <Calendar className={iconProps} />;
         case 'bell':
            return <Bell className={iconProps} />;
         case 'rocket':
            return <Rocket className={iconProps} />;
         case 'trending':
            return <TrendingUp className={iconProps} />;
         case 'zap':
            return <Zap className={iconProps} />;
         default:
            return <Sparkles className={iconProps} />;
      }
   };

   // Variant: Gradient (Most Eye-catching)
   if (variant === 'gradient') {
      return (
         <div className="overflow-hidden relative p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-xl dark:from-purple-700 dark:via-blue-700 dark:to-indigo-700">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full blur-xl bg-white/10 dark:bg-white/5 animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full blur-2xl bg-yellow-300/20 dark:bg-yellow-400/10"></div>

            <div className="relative z-10 text-center">
               <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-2xl backdrop-blur-sm bg-white/20 dark:bg-white/10">
                     <div className="text-white animate-bounce">
                        {getIcon()}
                     </div>
                  </div>
               </div>

               <div className="inline-flex gap-2 items-center px-4 py-2 mb-4 text-sm font-bold tracking-wider text-white uppercase rounded-full backdrop-blur-sm bg-white/20 dark:bg-white/10">
                  <span className="relative flex w-2 h-2">
                     <span className="inline-flex absolute w-full h-full bg-yellow-400 rounded-full opacity-75 animate-ping"></span>
                     <span className="relative inline-flex w-2 h-2 bg-yellow-300 rounded-full"></span>
                  </span>
                  Coming Soon
               </div>

               <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                  {title}
               </h3>

               <p className="mx-auto max-w-md text-base text-white/90 dark:text-white/80 md:text-lg">
                  {description}
               </p>

               <div className="flex justify-center gap-2 mt-6">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-75" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-150" style={{ animationDelay: '0.3s' }}></div>
               </div>
            </div>
         </div>
      );
   }

   // Variant: Feature (For sidebar features)
   if (variant === 'feature') {
      return (
         <div className="p-6 bg-gradient-to-br from-gray-50 via-white rounded-3xl border shadow-lg backdrop-blur-sm to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950/20 border-gray-200/60 dark:border-gray-700/60">
            <div className="text-center">
               <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl dark:from-purple-500/20 dark:to-blue-500/20">
                     <div className="text-purple-600 dark:text-purple-400">
                        {getIcon()}
                     </div>
                  </div>
               </div>

               <div className="inline-flex gap-2 items-center px-3 py-1.5 mb-3 text-xs font-bold tracking-wider text-purple-600 uppercase bg-purple-100 rounded-full dark:bg-purple-500/20 dark:text-purple-400">
                  <span className="relative flex w-1.5 h-1.5">
                     <span className="inline-flex absolute w-full h-full bg-purple-500 rounded-full opacity-75 animate-ping"></span>
                     <span className="relative inline-flex w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                  </span>
                  Coming Soon
               </div>

               <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {title}
               </h3>

               <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
               </p>
            </div>
         </div>
      );
   }

   // Variant: Minimal (Simple and clean)
   if (variant === 'minimal') {
      return (
         <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
            <div className="flex justify-center mb-3">
               <div className="text-gray-400 dark:text-gray-500">
                  {getIcon()}
               </div>
            </div>

            <div className="inline-flex gap-2 items-center px-3 py-1 mb-2 text-xs font-semibold text-gray-500 uppercase bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-400">
               Coming Soon
            </div>

            <h4 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
               {title}
            </h4>

            <p className="text-xs text-gray-500 dark:text-gray-400">
               {description}
            </p>
         </div>
      );
   }

   // Variant: Default
   return (
      <div className="p-6 bg-white rounded-3xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
         <div className="text-center">
            <div className="flex justify-center mb-4">
               <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl dark:from-blue-500/20 dark:to-purple-500/20">
                  <div className="text-blue-600 dark:text-blue-400">
                     {getIcon()}
                  </div>
               </div>
            </div>

            <div className="inline-flex gap-2 items-center px-3 py-1.5 mb-3 text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-100 rounded-full dark:bg-blue-500/20 dark:text-blue-400">
               <span className="relative flex w-1.5 h-1.5">
                  <span className="inline-flex absolute w-full h-full bg-blue-500 rounded-full opacity-75 animate-ping"></span>
                  <span className="relative inline-flex w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
               </span>
               Coming Soon
            </div>

            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
               {title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
               {description}
            </p>

            <div className="flex justify-center gap-1.5 mt-4">
               <div className="w-1.5 h-1.5 bg-gray-300 rounded-full dark:bg-gray-600 animate-pulse"></div>
               <div className="w-1.5 h-1.5 bg-gray-300 rounded-full dark:bg-gray-600 animate-pulse" style={{ animationDelay: '0.15s' }}></div>
               <div className="w-1.5 h-1.5 bg-gray-300 rounded-full dark:bg-gray-600 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            </div>
         </div>
      </div>
   );
};

