"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Zap, TrendingUp, Users, MessageCircle, Calendar, Star, Trophy } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
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
      <DashboardLayout>
         <motion.div
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors duration-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
         >
            {/* Header Section */}
            <motion.div
               className="relative bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700"
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

                           <motion.button
                              onClick={handleRecalculate}
                              disabled={loading}
                              className="flex gap-1 items-center px-3 py-2 text-purple-700 bg-purple-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <Zap className="w-4 h-4" />
                              <span className="hidden text-sm font-medium sm:inline">Recalc</span>
                           </motion.button>
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

                           <motion.button
                              onClick={handleRecalculate}
                              disabled={loading}
                              className="flex gap-1 items-center px-3 py-2 text-purple-700 bg-purple-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <Zap className="w-4 h-4" />
                              <span className="text-sm font-medium">Recalculate</span>
                           </motion.button>
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

                        <motion.button
                           onClick={handleRecalculate}
                           disabled={loading}
                           className="flex gap-2 items-center px-4 py-2 text-purple-700 bg-purple-100 rounded-lg transition-all duration-200 cursor-pointer dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <Zap className="w-4 h-4" />
                           <span className="font-medium">Recalculate</span>
                        </motion.button>
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
               {/* Loading State */}
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

               {/* Error State */}
               {error && (
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

               {/* Rizz Score Content */}
               {rizzScore && !loading && (
                  <div className="space-y-8">
                     {/* Enhanced Rizz Score Display */}
                     <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-xl dark:bg-gray-900 dark:border-gray-700">
                        <RizzScoreDisplay
                           userId={rizzScore.userId}
                           showDetails={true}
                           isFullPage={true}
                        />
                     </div>

                     {/* Additional Analytics Section */}
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Engagement Rate */}
                        <motion.div
                           className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-3 items-center mb-3">
                              <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900/20">
                                 <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Engagement Rate</h3>
                           </div>
                           <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {rizzScore.factors.engagement.engagementRate.toFixed(1)}%
                           </p>
                           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Average across all platforms
                           </p>
                        </motion.div>

                        {/* Content Frequency */}
                        <motion.div
                           className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-3 items-center mb-3">
                              <div className="flex justify-center items-center w-10 h-10 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                                 <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Content Frequency</h3>
                           </div>
                           <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {rizzScore.factors.growth.contentFrequency.toFixed(1)}
                           </p>
                           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Posts per week
                           </p>
                        </motion.div>

                        {/* Consistency Score */}
                        <motion.div
                           className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-3 items-center mb-3">
                              <div className="flex justify-center items-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                                 <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Consistency</h3>
                           </div>
                           <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {rizzScore.factors.growth.consistencyScore.toFixed(1)}%
                           </p>
                           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Posting consistency
                           </p>
                        </motion.div>

                        {/* Last Updated */}
                        <motion.div
                           className="p-6 bg-white rounded-xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-700"
                           whileHover={{ scale: 1.02, y: -2 }}
                           transition={{ duration: 0.2 }}
                        >
                           <div className="flex gap-3 items-center mb-3">
                              <div className="flex justify-center items-center w-10 h-10 bg-orange-100 rounded-lg dark:bg-orange-900/20">
                                 <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                              </div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Last Updated</h3>
                           </div>
                           <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(rizzScore.lastCalculated).toLocaleDateString()}
                           </p>
                           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(rizzScore.lastCalculated).toLocaleTimeString()}
                           </p>
                        </motion.div>
                     </div>

                     {/* Leaderboard Link */}
                     <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700">
                        <div className="flex justify-between items-center">
                           <div className="flex gap-4 items-center">
                              <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl">
                                 <Trophy className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    See How You Rank
                                 </h3>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Compare your Rizz Score with top creators
                                 </p>
                              </div>
                           </div>
                           <motion.button
                              onClick={() => router.push('/profile/rizz-score/leaderboard')}
                              className="flex gap-2 items-center px-4 py-2 text-white bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg transition-all duration-200 cursor-pointer hover:from-yellow-600 hover:to-amber-600 hover:shadow-lg"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                           >
                              <Trophy className="w-4 h-4" />
                              <span className="font-medium">View Leaderboard</span>
                           </motion.button>
                        </div>
                     </div>

                     {/* Tips and Recommendations */}
                     <div className="p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-700">
                        <div className="flex gap-3 items-center mb-6">
                           <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                              <Star className="w-6 h-6 text-white" />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                 Tips to Improve Your Rizz Score
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                 Based on your current performance
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                           <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">Content Strategy</h4>
                              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                 <li className="flex gap-2 items-start">
                                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Post consistently to maintain engagement
                                 </li>
                                 <li className="flex gap-2 items-start">
                                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Use trending hashtags and topics
                                 </li>
                                 <li className="flex gap-2 items-start">
                                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Engage with your audience regularly
                                 </li>
                              </ul>
                           </div>

                           <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 dark:text-white">Growth Tips</h4>
                              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                 <li className="flex gap-2 items-start">
                                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-pink-500 rounded-full"></span>
                                    Collaborate with other creators
                                 </li>
                                 <li className="flex gap-2 items-start">
                                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-pink-500 rounded-full"></span>
                                    Cross-promote across platforms
                                 </li>
                                 <li className="flex gap-2 items-start">
                                    <span className="flex-shrink-0 mt-2 w-2 h-2 bg-pink-500 rounded-full"></span>
                                    Analyze your best-performing content
                                 </li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </motion.div>
         </motion.div>
      </DashboardLayout>
   );
};

export default RizzScorePage;
