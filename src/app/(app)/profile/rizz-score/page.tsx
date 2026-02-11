"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Zap, TrendingUp, Users, MessageCircle, Calendar, Star, Trophy } from "lucide-react";
import RizzScoreDisplay from "@/components/profile/RizzScoreDisplay";
import { useRizzScore } from "@/hooks/useRizzScore";

const RizzScorePage: React.FC = () => {
   const router = useRouter();
   const { rizzScore, loading, error, recalculate, refetch } = useRizzScore();
   const [isNavigating, setIsNavigating] = useState(false);

   const handleBackToProfile = () => {
      setIsNavigating(true);
      setTimeout(() => {
         router.push("/profile");
      }, 300);
   };

   const handleRefresh = async () => {
      try {
         await refetch();
      } catch (err) {
         console.error("Failed to refresh Rizz Score:", err);
      }
   };

   const handleRecalculate = async () => {
      try {
         await recalculate();
      } catch (err) {
         console.error("Failed to recalculate Rizz Score:", err);
      }
   };

   return (
      <>
         <motion.div
            className="min-h-full pb-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors duration-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 lg:pb-34"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
         >
            {/* Header Section */}
            <motion.div
               className="relative bg-white border-b border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-700"
               initial={{ opacity: 0, y: -30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, ease: "easeOut" }}
            >
               <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                  {/* Mobile Layout */}
                  <div className="block py-4 md:hidden">
                     {/* Mobile Header */}
                     <div className="flex justify-between items-center mb-4">
                        <motion.button
                           onClick={handleBackToProfile}
                           disabled={isNavigating}
                           className="flex gap-2 items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <ArrowLeft className="w-4 h-4" />
                           <span className="text-sm font-medium">Back</span>
                        </motion.button>

                        <div className="flex gap-2 items-center">
                           <motion.button
                              onClick={handleRefresh}
                              disabled={loading}
                              className="flex gap-1 items-center px-3 py-2 text-blue-700 bg-blue-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                              <span className="hidden text-sm font-medium sm:inline">Refresh</span>
                           </motion.button>

                           {/* Recalculate button commented out */}
                           {/* <motion.button
                              onClick={handleRecalculate}
                              disabled={loading}
                              className="flex gap-1 items-center px-3 py-2 text-purple-700 bg-purple-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <Zap className="w-4 h-4" />
                              <span className="hidden text-sm font-medium sm:inline">Recalc</span>
                           </motion.button> */}
                        </div>
                     </div>

                     {/* Mobile Title */}
                     <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                           Rizz Score Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                           Detailed insights into your social media performance
                        </p>
                     </div>
                  </div>

                  {/* Medium Screen Layout (md) */}
                  <div className="hidden py-6 md:block lg:hidden">
                     {/* Top Row - Buttons */}
                     <div className="flex justify-between items-center mb-6">
                        <motion.button
                           onClick={handleBackToProfile}
                           disabled={isNavigating}
                           className="flex gap-2 items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <ArrowLeft className="w-4 h-4" />
                           <span className="text-sm font-medium">Back</span>
                        </motion.button>

                        <div className="flex gap-2 items-center">
                           <motion.button
                              onClick={handleRefresh}
                              disabled={loading}
                              className="flex gap-1 items-center px-3 py-2 text-blue-700 bg-blue-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                              <span className="text-sm font-medium">Refresh</span>
                           </motion.button>

                           {/* Recalculate button commented out */}
                           {/* <motion.button
                              onClick={handleRecalculate}
                              disabled={loading}
                              className="flex gap-1 items-center px-3 py-2 text-purple-700 bg-purple-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <Zap className="w-4 h-4" />
                              <span className="text-sm font-medium">Recalculate</span>
                           </motion.button> */}
                        </div>
                     </div>

                     {/* Title Section */}
                     <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                           Rizz Score Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                           Detailed insights into your social media performance
                        </p>
                     </div>
                  </div>

                  {/* Large Screen Layout (lg+) */}
                  <div className="hidden justify-between items-center py-6 lg:flex">
                     {/* Back Button */}
                     <motion.button
                        onClick={handleBackToProfile}
                        disabled={isNavigating}
                        className="flex gap-3 items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                     >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                     </motion.button>

                     {/* Page Title */}
                     <div className="flex-1 px-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                           Rizz Score Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                           Detailed insights into your social media performance
                        </p>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex gap-3 items-center">
                        <motion.button
                           onClick={handleRefresh}
                           disabled={loading}
                           className="flex gap-2 items-center px-4 py-2 text-blue-700 bg-blue-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                           <span className="font-medium">Refresh</span>
                        </motion.button>

                        {/* Recalculate button commented out */}
                        {/* <motion.button
                           onClick={handleRecalculate}
                           disabled={loading}
                           className="flex gap-2 items-center px-4 py-2 text-purple-700 bg-purple-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <Zap className="w-4 h-4" />
                           <span className="font-medium">Recalculate</span>
                        </motion.button> */}
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
               className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
               {/* Loading State - Only show when we don't have data yet */}
               {loading && !rizzScore && (
                  <div className="flex flex-col justify-center items-center py-20">
                     <motion.div
                        className="w-16 h-16 rounded-full border-4 border-purple-200 animate-spin border-t-purple-600"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                     />
                     <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Loading your Rizz Score...
                     </p>
                  </div>
               )}

               {/* Error State - Only show when we don't have data */}
               {error && !rizzScore && (
                  <div className="flex flex-col justify-center items-center py-20">
                     <div className="flex justify-center items-center mb-4 w-16 h-16 bg-red-100 rounded-full dark:bg-red-900/20">
                        <span className="text-2xl">⚠️</span>
                     </div>
                     <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                        Unable to Load Rizz Score
                     </h3>
                     <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                        {error}
                     </p>
                     <motion.button
                        onClick={handleRefresh}
                        className="px-6 py-3 font-medium text-white bg-purple-600 rounded-lg transition-colors duration-200 hover:bg-purple-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                     >
                        Try Again
                     </motion.button>
                  </div>
               )}

               {/* Error Banner - Show at top if error occurs during recalculation */}
               {error && rizzScore && (
                  <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-700"
                  >
                     <div className="flex gap-3 items-center">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                           <p className="text-sm font-medium text-red-800 dark:text-red-300">
                              {error}
                           </p>
                        </div>
                        <button
                           onClick={() => window.location.reload()}
                           className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                        >
                           Reload
                        </button>
                     </div>
                  </motion.div>
               )}

               {/* Rizz Score Content - Always show if we have data */}
               {rizzScore && (
                  <div className="relative space-y-8">
                     {/* Loading Overlay - Show when recalculating */}
                     {loading && (
                        <div className="absolute inset-0 z-50 flex justify-center items-center bg-white/80 backdrop-blur-sm rounded-2xl dark:bg-gray-900/80">
                           <div className="flex flex-col gap-3 items-center">
                              <motion.div
                                 className="w-12 h-12 rounded-full border-4 border-purple-200 animate-spin border-t-purple-600"
                                 animate={{ rotate: 360 }}
                                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                 Recalculating...
                              </p>
                           </div>
                        </div>
                     )}
                     
                     {/* Enhanced Rizz Score Display */}
                     <div className="overflow-hidden bg-white rounded-2xl border border-gray-300 shadow-xl dark:bg-gray-900 dark:border-gray-700">
                        <RizzScoreDisplay
                           userId={rizzScore.userId}
                           showDetails={true}
                           isFullPage={true}
                        />
                     </div>

                     {/* Additional Analytics Section */}
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                        {/* Engagement Rate */}
                        <motion.div
                           className="p-4 bg-white rounded-xl border border-gray-300 shadow-lg dark:bg-gray-900 dark:border-gray-700 sm:p-5 lg:p-6"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-2.5 items-center mb-3 sm:gap-3">
                              <div className="flex-shrink-0 flex justify-center items-center w-9 h-9 bg-green-100 rounded-lg shadow-sm dark:bg-green-900/20 sm:w-10 sm:h-10">
                                 <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 sm:w-5 sm:h-5" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Engagement Rate</h3>
                           </div>
                           <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                              {rizzScore.factors.engagement.engagementRate.toFixed(1)}%
                           </p>
                           <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                              Average across all platforms
                           </p>
                        </motion.div>

                        {/* Content Frequency */}
                        <motion.div
                           className="p-4 bg-white rounded-xl border border-gray-300 shadow-lg dark:bg-gray-900 dark:border-gray-700 sm:p-5 lg:p-6"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-2.5 items-center mb-3 sm:gap-3">
                              <div className="flex-shrink-0 flex justify-center items-center w-9 h-9 bg-purple-100 rounded-lg shadow-sm dark:bg-purple-900/20 sm:w-10 sm:h-10">
                                 <MessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 sm:w-5 sm:h-5" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Content Frequency</h3>
                           </div>
                           <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                              {rizzScore.factors.growth.contentFrequency.toFixed(1)}
                           </p>
                           <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                              Posts per week
                           </p>
                        </motion.div>

                        {/* Consistency Score */}
                        <motion.div
                           className="p-4 bg-white rounded-xl border border-gray-300 shadow-lg dark:bg-gray-900 dark:border-gray-700 sm:p-5 lg:p-6"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-2.5 items-center mb-3 sm:gap-3">
                              <div className="flex-shrink-0 flex justify-center items-center w-9 h-9 bg-blue-100 rounded-lg shadow-sm dark:bg-blue-900/20 sm:w-10 sm:h-10">
                                 <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 sm:w-5 sm:h-5" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Consistency</h3>
                           </div>
                           <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                              {rizzScore.factors.growth.consistencyScore.toFixed(1)}%
                           </p>
                           <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                              Posting consistency
                           </p>
                        </motion.div>

                        {/* Last Updated */}
                        <motion.div
                           className="p-4 bg-white rounded-xl border border-gray-300 shadow-lg dark:bg-gray-900 dark:border-gray-700 sm:p-5 lg:p-6"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-2.5 items-center mb-3 sm:gap-3">
                              <div className="flex-shrink-0 flex justify-center items-center w-9 h-9 bg-orange-100 rounded-lg shadow-sm dark:bg-orange-900/20 sm:w-10 sm:h-10">
                                 <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 sm:w-5 sm:h-5" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">Last Updated</h3>
                           </div>
                           <p className="text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                              {new Date(rizzScore.lastCalculated).toLocaleDateString()}
                           </p>
                           <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
                              {new Date(rizzScore.lastCalculated).toLocaleTimeString()}
                           </p>
                        </motion.div>
                     </div>

                     {/* Leaderboard Link */}
                     <motion.div
                        className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 shadow-lg dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700 sm:p-6"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                     >
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                           {/* Left Content */}
                           <div className="flex gap-3 items-center sm:gap-4">
                              <div className="flex-shrink-0 p-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-md sm:p-3">
                                 <Trophy className="w-5 h-5 text-white sm:w-6 sm:h-6" />
                              </div>
                              <div className="flex-1">
                                 <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                                    See How You Rank
                                 </h3>
                                 <p className="mt-0.5 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                    Compare your Rizz Score with top creators
                                 </p>
                              </div>
                           </div>

                           {/* Button */}
                           <motion.button
                              onClick={() => router.push('/profile/rizz-score/leaderboard')}
                              className="flex gap-2 justify-center items-center px-4 py-2.5 w-full text-sm font-semibold text-white bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-md transition-all duration-200 cursor-pointer sm:w-auto hover:from-yellow-600 hover:to-amber-600 hover:shadow-lg active:scale-95"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <Trophy className="w-4 h-4" />
                              <span>View Leaderboard</span>
                           </motion.button>
                        </div>
                     </motion.div>

                     {/* Tips and Recommendations */}
                     <motion.div
                        className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-lg dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700 sm:p-6 lg:p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                     >
                        {/* Header */}
                        <div className="flex gap-3 items-start mb-5 sm:items-center sm:mb-6">
                           <div className="flex-shrink-0 flex justify-center items-center w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-md sm:w-12 sm:h-12">
                              <Star className="w-5 h-5 text-white sm:w-6 sm:h-6" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold leading-tight text-gray-900 sm:text-lg lg:text-xl dark:text-white">
                                 Tips to Improve Your Rizz Score
                              </h3>
                              <p className="mt-1 text-xs leading-tight text-gray-600 sm:text-sm dark:text-gray-400">
                                 Based on your current performance
                              </p>
                           </div>
                        </div>

                        {/* Tips Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
                           {/* Content Strategy */}
                           <motion.div
                              className="p-5 space-y-3.5 bg-white/60 rounded-xl border border-purple-200 shadow-sm backdrop-blur-sm dark:bg-gray-800/60 dark:border-purple-700 sm:p-6 sm:space-y-4"
                              whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                              transition={{ duration: 0.2 }}
                           >
                              <h4 className="flex gap-2.5 items-center text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                                 <div className="flex-shrink-0 w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                                 Content Strategy
                              </h4>
                              <ul className="space-y-3 text-xs leading-relaxed text-gray-700 sm:text-sm dark:text-gray-300">
                                 <li className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                    <span className="flex-1">Post consistently to maintain engagement</span>
                                 </li>
                                 <li className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                    <span className="flex-1">Use trending hashtags and topics</span>
                                 </li>
                                 <li className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                    <span className="flex-1">Engage with your audience regularly</span>
                                 </li>
                              </ul>
                           </motion.div>

                           {/* Growth Tips */}
                           <motion.div
                              className="p-5 space-y-3.5 bg-white/60 rounded-xl border border-pink-200 shadow-sm backdrop-blur-sm dark:bg-gray-800/60 dark:border-pink-700 sm:p-6 sm:space-y-4"
                              whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                              transition={{ duration: 0.2 }}
                           >
                              <h4 className="flex gap-2.5 items-center text-sm font-bold text-gray-900 sm:text-base dark:text-white">
                                 <div className="flex-shrink-0 w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full"></div>
                                 Growth Tips
                              </h4>
                              <ul className="space-y-3 text-xs leading-relaxed text-gray-700 sm:text-sm dark:text-gray-300">
                                 <li className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                    <span className="flex-1">Collaborate with other creators</span>
                                 </li>
                                 <li className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                    <span className="flex-1">Cross-promote across platforms</span>
                                 </li>
                                 <li className="flex gap-3 items-start">
                                    <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                    <span className="flex-1">Analyze your best-performing content</span>
                                 </li>
                              </ul>
                           </motion.div>
                        </div>
                     </motion.div>
                  </div>
               )}
            </motion.div>
         </motion.div>
      </>
   );
};

export default RizzScorePage;