/**
 * Platform Username Input Component
 * Allows users to input their usernames for TikTok, Twitter, and Twitch
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Shield, Lock, Sparkles, Video, MessageCircle, TrendingUp, Zap, Camera, Play } from 'lucide-react';
import { usePlatformData } from '@/hooks/features/usePlatformData';
import type { PlatformType } from '@/types/platform.types';

interface PlatformUsernameInputProps {
   platform: PlatformType;
   value: string;
   onChange: (value: string) => void;
   label: string;
   placeholder: string;
   validateOnBlur?: boolean;
   showPreview?: boolean;
}

export function PlatformUsernameInput({
   platform,
   value,
   onChange,
   label,
   placeholder,
   validateOnBlur = true,
   showPreview = true,
}: PlatformUsernameInputProps) {
   const [shouldValidate, setShouldValidate] = useState(false);
   const [debouncedValue, setDebouncedValue] = useState(value);

   // Debounce the value to avoid too many API calls
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedValue(value);
      }, 800);

      return () => clearTimeout(timer);
   }, [value]);

   // Fetch platform data when validation is enabled and value is set
   const { data, loading, error } = usePlatformData(
      shouldValidate && debouncedValue ? platform : null,
      debouncedValue || null,
      { enabled: shouldValidate && !!debouncedValue }
   );

   const handleBlur = () => {
      if (validateOnBlur && value.trim()) {
         setShouldValidate(true);
      }
   };

   const handleChange = (newValue: string) => {
      // Remove @ symbol if user types it
      const cleanValue = newValue.replace(/^@/, '');
      onChange(cleanValue);

      // Reset validation when user types
      if (shouldValidate && cleanValue !== value) {
         setShouldValidate(false);
      }
   };

   const getStatusIcon = () => {
      if (!value || !shouldValidate) return null;
      if (loading) return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      if (error) {
         // Show warning icon for quota errors (yellow/orange) instead of error
         const isQuotaError = error.error?.toLowerCase().includes('quota') || 
                            error.error?.toLowerCase().includes('exceeded');
         if (isQuotaError) {
            return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
         }
         return <XCircle className="w-5 h-5 text-red-500" />;
      }
      if (data) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      return null;
   };

   const getStatusMessage = () => {
      if (!value || !shouldValidate) return null;
      if (loading) return 'Validating username...';
      if (error) {
         // Check if it's a quota error
         const isQuotaError = error.error?.toLowerCase().includes('quota') || 
                            error.error?.toLowerCase().includes('exceeded');
         
         if (isQuotaError) {
            return '⚠️ API quota exceeded. You can still save this username and sync it later.';
         }
         
         // Check if it's a username not found error
         if (error.error?.toLowerCase().includes('not found') || 
             error.error?.toLowerCase().includes('username')) {
            return `Username "${value}" not found on ${platform}. Please check the spelling.`;
         }
         
         // Generic API error
         return `Unable to verify username. Error: ${error.error}`;
      }
      if (data) return `✓ Found: ${data.displayName} (${data.followers.toLocaleString()} followers)`;
      return null;
   };

   const getStatusColor = () => {
      if (!value || !shouldValidate) return 'border-gray-200 dark:border-gray-700';
      if (loading) return 'border-blue-300 dark:border-blue-600';
      if (error) return 'border-red-300 dark:border-red-600';
      if (data) return 'border-green-300 dark:border-green-600';
      return 'border-gray-200 dark:border-gray-700';
   };

   return (
      <div className="space-y-3">
         {label && (
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
               {label}
            </label>
         )}

         <div className="relative">
            <input
               type="text"
               value={value}
               onChange={(e) => handleChange(e.target.value)}
               onBlur={handleBlur}
               placeholder={placeholder}
               className={`px-4 py-3 pr-12 w-full text-base font-medium text-gray-900 bg-gray-50 rounded-xl border-2 transition-all duration-200 dark:text-gray-100 dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 focus:border-purple-500 dark:focus:border-purple-600 focus:bg-white dark:focus:bg-gray-800 ${getStatusColor()}`}
            />
            <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
               {getStatusIcon()}
            </div>
         </div>

         {/* Status message */}
         <AnimatePresence mode="wait">
            {shouldValidate && getStatusMessage() && (
               <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`
                     flex items-center gap-2 text-sm font-medium
                     ${loading ? 'text-blue-600 dark:text-blue-400' : ''}
                     ${error ? 'text-red-600 dark:text-red-400' : ''}
                     ${data ? 'text-green-600 dark:text-green-400' : ''}`}
               >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {error && <XCircle className="w-4 h-4" />}
                  {data && <CheckCircle2 className="w-4 h-4" />}
                  <span>{getStatusMessage()}</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Clean Preview Card */}
         <AnimatePresence>
            {showPreview && data && (
               <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4"
               >
                  <div className="p-4 bg-green-50 rounded-xl border-2 border-green-300 dark:bg-green-900/20 dark:border-green-700">
                     <div className="flex gap-3 items-center mb-3">
                        {data.profileImage && (
                           <Image
                              src={data.profileImage}
                              alt={data.displayName}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-xl"
                              unoptimized
                           />
                        )}
                        <div className="flex-1 min-w-0">
                           <div className="flex gap-2 items-center">
                              <p className="font-bold text-gray-900 dark:text-white">{data.displayName}</p>
                              {data.verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-400">@{data.username}</p>
                        </div>
                     </div>
                     <div className="flex gap-4 text-sm">
                        <div>
                           <span className="font-semibold text-gray-900 dark:text-white">{data.followers.toLocaleString()}</span>
                           <span className="text-gray-600 dark:text-gray-400"> followers</span>
                        </div>
                        {data.totalContent > 0 && (
                           <div>
                              <span className="font-semibold text-gray-900 dark:text-white">{data.totalContent}</span>
                              <span className="text-gray-600 dark:text-gray-400"> posts</span>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

/**
 * Platform Group Input Component
 * Manages multiple platform username inputs
 */
interface PlatformCredentials {
   tiktok?: string;
   twitter?: string;
   twitch?: string;
   instagram?: string;
   youtube?: string;
}

interface PlatformUsernameGroupProps {
   values: PlatformCredentials;
   onChange: (values: PlatformCredentials) => void;
   showPreviews?: boolean;
}

export function PlatformUsernameGroup({
   values,
   onChange,
   showPreviews = true,
}: PlatformUsernameGroupProps) {
   const platforms: Array<{
      type: PlatformType;
      label: string;
      placeholder: string;
      icon: React.ReactNode;
      color: string;
      gradient: string;
      borderGlow: string;
   }> = [
         {
            type: 'tiktok',
            label: 'TikTok',
            placeholder: 'username',
            icon: <Video className="w-6 h-6" />,
            color: 'from-purple-500 via-violet-500 to-indigo-600',
            gradient: 'from-pink-500/10 via-rose-500/10 to-red-500/10',
            borderGlow: 'group-hover:shadow-pink-500/50',
         },
         {
            type: 'instagram',
            label: 'Instagram',
            placeholder: 'username',
            icon: <Camera className="w-6 h-6" />,
            color: 'from-purple-500 via-violet-500 to-indigo-600',
            gradient: 'from-purple-600/10 via-pink-500/10 to-orange-400/10',
            borderGlow: 'group-hover:shadow-pink-500/50',
         },
         {
            type: 'youtube',
            label: 'YouTube',
            placeholder: 'username',
            icon: <Play className="w-6 h-6" />,
            color: 'from-purple-500 via-violet-500 to-indigo-600',
            gradient: 'from-red-500/10 via-red-600/10 to-red-700/10',
            borderGlow: 'group-hover:shadow-red-500/50',
         },
         {
            type: 'twitter',
            label: 'Twitter / X',
            placeholder: 'username',
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'from-purple-500 via-violet-500 to-indigo-600',
            gradient: 'from-blue-500/10 via-cyan-500/10 to-sky-500/10',
            borderGlow: 'group-hover:shadow-blue-500/50',
         },
         {
            type: 'twitch',
            label: 'Twitch',
            placeholder: 'channel_name',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'from-purple-500 via-violet-500 to-indigo-600',
            gradient: 'from-purple-500/10 via-violet-500/10 to-indigo-600/10',
            borderGlow: 'group-hover:shadow-purple-500/50',
         },
      ];

   const handleChange = (platform: PlatformType, value: string) => {
      onChange({
         ...values,
         [platform]: value,
      });
   };

   return (
      <div className="space-y-8">
         {/* Ultra Modern Header */}
         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="overflow-hidden relative p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl shadow-2xl md:p-10"
         >
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
               <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl animate-pulse" />
               <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-overlay blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 space-y-4">
               <div className="flex flex-col gap-4 items-start md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4 items-center">
                     <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex justify-center items-center w-16 h-16 rounded-2xl shadow-lg backdrop-blur-md bg-white/20"
                     >
                        <Sparkles className="w-8 h-8 text-white" />
                     </motion.div>
                     <div>
                        <h3 className="text-2xl font-black leading-tight text-white md:text-3xl">
                           AI-Powered Platform Sync
                        </h3>
                        <p className="text-sm text-white/80 md:text-base">
                           Real-time validation & analytics
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-2 items-center px-4 py-2 rounded-full backdrop-blur-md bg-white/20">
                     <Zap className="w-4 h-4 text-yellow-300" />
                     <span className="text-sm font-semibold text-white">Live Integration</span>
                  </div>
               </div>
               <p className="max-w-3xl text-base leading-relaxed text-white/90">
                  Connect your social media accounts to unlock AI-powered collaboration matching.
                  We analyze your public profile data to find perfect creative partners with <span className="font-bold text-yellow-300">95% accuracy</span>.
               </p>
            </div>
         </motion.div>

         {/* Clean, Modern Platform Cards */}
         <div className="space-y-6">
            {platforms.map((platform, index) => (
               <motion.div
                  key={platform.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-visible"
               >
                  {/* Platform Header */}
                  <div className="flex gap-3 items-center mb-3">
                     <div className={`flex justify-center items-center w-12 h-12 bg-gradient-to-br ${platform.color} rounded-xl shadow-md`}>
                        <div className="text-white">
                           {platform.icon}
                        </div>
                     </div>
                     <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                           {platform.label}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           Enter your username for AI matching
                        </p>
                     </div>
                  </div>

                  {/* Input Container */}
                  <div className="p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm transition-shadow dark:bg-gray-800 dark:border-gray-700 hover:shadow-md">
                     <PlatformUsernameInput
                        platform={platform.type}
                        value={values[platform.type as keyof PlatformCredentials] || ''}
                        onChange={(value) => handleChange(platform.type, value)}
                        label=""
                        placeholder={platform.placeholder}
                        showPreview={showPreviews}
                     />
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Premium Privacy & Security Section */}
         {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 rounded-3xl border-2 shadow-2xl md:p-10 border-orange-400/40 dark:border-orange-500/30"
         >
             Decorative elements 
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/20 dark:bg-yellow-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
               {/* Header 
               <div className="flex flex-col gap-6 items-start mb-8 md:flex-row md:items-center">
                  <motion.div
                     className="flex justify-center items-center w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl shadow-2xl shrink-0"
                     whileHover={{ scale: 1.05, rotate: 5 }}
                     transition={{ type: "spring", stiffness: 300 }}
                  >
                     <Shield className="w-10 h-10 text-white" />
                  </motion.div>

                  <div className="flex-1">
                     <div className="flex flex-wrap gap-3 items-center mb-2">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white md:text-3xl">
                           Privacy & Security
                        </h4>
                        <div className="flex gap-2 items-center px-4 py-1.5 bg-green-100 dark:bg-green-500/20 rounded-full border border-green-400 dark:border-green-500/30">
                           <Lock className="w-4 h-4 text-green-600 dark:text-green-400" />
                           <span className="text-sm font-bold text-green-700 dark:text-green-400">
                              100% Secure
                           </span>
                        </div>
                     </div>
                     <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 md:text-lg">
                        We only fetch <span className="font-bold text-orange-600 dark:text-orange-400">publicly available data</span> from your profiles to enhance your experience:
                     </p>
                  </div>
               </div>

               {/* Features Grid 
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* AI Matching 
                  <motion.div
                     whileHover={{ scale: 1.02, y: -4 }}
                     className="flex gap-4 items-start p-5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/10 dark:to-emerald-500/10 rounded-2xl border border-green-300 dark:border-green-500/30 backdrop-blur-sm"
                  >
                     <div className="flex justify-center items-center w-10 h-10 bg-green-200 dark:bg-green-500/20 rounded-xl shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
                     </div>
                     <div>
                        <h5 className="mb-1 text-base font-bold text-gray-900 dark:text-white">AI Matching</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-400">Real metrics for better matches</p>
                     </div>
                  </motion.div>

                  {/* Verified Stats 
                  <motion.div
                     whileHover={{ scale: 1.02, y: -4 }}
                     className="flex gap-4 items-start p-5 bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-500/10 dark:to-teal-500/10 rounded-2xl border border-green-300 dark:border-green-500/30 backdrop-blur-sm"
                  >
                     <div className="flex justify-center items-center w-10 h-10 bg-green-200 dark:bg-green-500/20 rounded-xl shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
                     </div>
                     <div>
                        <h5 className="mb-1 text-base font-bold text-gray-900 dark:text-white">Verified Stats</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-400">Audience & engagement data</p>
                     </div>
                  </motion.div>

                  {/* Smart Analytics 
                  <motion.div
                     whileHover={{ scale: 1.02, y: -4 }}
                     className="flex gap-4 items-start p-5 bg-gradient-to-br from-green-100 to-cyan-100 dark:from-green-500/10 dark:to-cyan-500/10 rounded-2xl border border-green-300 dark:border-green-500/30 backdrop-blur-sm"
                  >
                     <div className="flex justify-center items-center w-10 h-10 bg-green-200 dark:bg-green-500/20 rounded-xl shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-400" />
                     </div>
                     <div>
                        <h5 className="mb-1 text-base font-bold text-gray-900 dark:text-white">Smart Analytics</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-400">Compatibility scoring</p>
                     </div>
                  </motion.div>

                  {/* Never Private 
                  <motion.div
                     whileHover={{ scale: 1.02, y: -4 }}
                     className="flex gap-4 items-start p-5 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-500/10 dark:to-rose-500/10 rounded-2xl border border-red-300 dark:border-red-500/30 backdrop-blur-sm"
                  >
                     <div className="flex justify-center items-center w-10 h-10 bg-red-200 dark:bg-red-500/20 rounded-xl shrink-0">
                        <XCircle className="w-6 h-6 text-red-700 dark:text-red-400" />
                     </div>
                     <div>
                        <h5 className="mb-1 text-base font-bold text-gray-900 dark:text-white">Never Private</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-400">No DMs, posts, or personal data</p>
                     </div>
                  </motion.div>
               </div>
            </div>
         </motion.div> */}
      </div>
   );
}

