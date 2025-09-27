import React, { useState } from 'react';
import {
   Star,
   TrendingUp,
   Users,
   Target,
   RefreshCw,
   Zap,
   Heart,
   AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRizzScore } from '@/hooks/useRizzScore';

interface RizzScoreDisplayProps {
   userId?: string;
   showDetails?: boolean;
   className?: string;
}

export const RizzScoreDisplay: React.FC<RizzScoreDisplayProps> = ({
   userId,
   showDetails = true,
   className = ''
}) => {
   const { rizzScore, loading, error, recalculate, refetch } = useRizzScore(userId);
   const [isRecalculating, setIsRecalculating] = useState(false);

   // Animation variants
   const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
         opacity: 1,
         y: 0,
         transition: {
            duration: 0.6,
            staggerChildren: 0.1
         }
      }
   };

   const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: {
         opacity: 1,
         y: 0,
         transition: { duration: 0.4 }
      }
   };

   const scoreVariants = {
      hidden: { scale: 0.8, opacity: 0 },
      visible: {
         scale: 1,
         opacity: 1,
         transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
            duration: 0.6
         }
      }
   };

   const buttonVariants = {
      hover: { scale: 1.05, transition: { duration: 0.2 } },
      tap: { scale: 0.95, transition: { duration: 0.1 } }
   };


   const handleRecalculate = async () => {
      setIsRecalculating(true);
      try {
         await recalculate();
      } catch (error) {
         console.error('Recalculation failed:', error);
      } finally {
         setIsRecalculating(false);
      }
   };

   const handleRefresh = async () => {
      try {
         await refetch();
      } catch (error) {
         console.error('Refresh failed:', error);
      }
   };

   const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600 dark:text-green-400';
      if (score >= 80) return 'text-blue-600 dark:text-blue-400';
      if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
      if (score >= 60) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
   };

   const getScoreBgColor = (score: number) => {
      if (score >= 90) return 'from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-600/20';
      if (score >= 80) return 'from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20';
      if (score >= 70) return 'from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20';
      if (score >= 60) return 'from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20';
      return 'from-red-100 to-red-200 dark:from-red-500/20 dark:to-red-600/20';
   };

   const getScoreLabel = (score: number) => {
      if (score >= 90) return 'Elite Creator';
      if (score >= 80) return 'Top Performer';
      if (score >= 70) return 'Rising Star';
      if (score >= 60) return 'Growing Creator';
      return 'Emerging Creator';
   };

   if (loading) {
      return (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 ${className}`}
         >
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="animate-pulse"
            >
               <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 items-center mb-4"
               >
                  <div className="w-8 h-8 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
                  <div className="w-32 h-6 bg-gray-300 rounded dark:bg-gray-700"></div>
               </motion.div>
               <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="mb-2 w-24 h-12 bg-gray-300 rounded-lg dark:bg-gray-700"
               ></motion.div>
               <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-48 h-4 bg-gray-300 rounded dark:bg-gray-700"
               ></motion.div>
            </motion.div>
         </motion.div>
      );
   }

   if (error) {
      return (
         <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className={`p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 ${className}`}
         >
            <motion.div
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="flex gap-3 items-center mb-4"
            >
               <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className="p-2 bg-red-100 rounded-lg dark:bg-red-500/20"
               >
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
               </motion.div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Rizz Score
               </h3>
            </motion.div>
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="mb-4 text-red-600 dark:text-red-400"
            >
               {error}
            </motion.div>
            <motion.button
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={refetch}
               className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
               <RefreshCw size={16} />
               Retry
            </motion.button>
         </motion.div>
      );
   }

   if (!rizzScore) {
      return null;
   }

   return (
      <motion.div
         variants={containerVariants}
         initial="hidden"
         animate="visible"
         className={`p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 ${className}`}
      >
         {/* Header */}
         <motion.div
            variants={itemVariants}
            className="flex justify-between items-center mb-6"
         >
            <motion.div
               initial={{ x: -30, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.2, duration: 0.5 }}
               className="flex gap-3 items-center"
            >
               <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className={`p-2 bg-gradient-to-br ${getScoreBgColor(rizzScore.currentScore)} rounded-lg`}
               >
                  <Star size={24} className={getScoreColor(rizzScore.currentScore)} />
               </motion.div>
               <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
               >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                     Rizz Score
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     Last updated: {new Date(rizzScore.lastCalculated).toLocaleDateString()}
                  </p>
               </motion.div>
            </motion.div>

            <motion.div
               initial={{ x: 30, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.5 }}
               className="flex gap-2"
            >
               {/* Refresh Data Button */}
               <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex gap-2 items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors cursor-pointer hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data from server"
               >
                  <motion.div
                     animate={loading ? { rotate: 360 } : { rotate: 0 }}
                     transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                  >
                     <RefreshCw size={16} />
                  </motion.div>
                  <span className="hidden sm:inline">
                     {loading ? 'Refreshing...' : 'Refresh'}
                  </span>
               </motion.button>

               {/* Recalculate Score Button */}
               <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  className="flex gap-2 items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg transition-colors cursor-pointer hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Recalculate your Rizz Score"
               >
                  <motion.div
                     animate={isRecalculating ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                     transition={{ duration: 0.6, repeat: isRecalculating ? Infinity : 0 }}
                  >
                     <Zap size={16} />
                  </motion.div>
                  <span className="hidden sm:inline">
                     {isRecalculating ? 'Calculating...' : 'Recalculate'}
                  </span>
               </motion.button>
            </motion.div>
         </motion.div>

         {/* Main Score Display */}
         <div className="mb-6 text-center">
            <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
               whileHover={{ scale: 1.05 }}
               className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreBgColor(rizzScore.currentScore)} border-4 border-white shadow-xl dark:border-gray-800`}
            >
               <span
                  className={`text-4xl font-bold ${getScoreColor(rizzScore.currentScore)}`}
               >
                  {rizzScore.currentScore || '0'}
               </span>
            </motion.div>
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3, duration: 0.4 }}
               className="mt-3"
            >
               <div className={`text-lg font-semibold ${getScoreColor(rizzScore.currentScore)}`}>
                  {getScoreLabel(rizzScore.currentScore)}
               </div>
               <div className="text-sm text-gray-500 dark:text-gray-400">
                  {rizzScore.trending.isViral ? '🔥 Viral Content Detected' : 'Steady Growth'}
               </div>
            </motion.div>
         </div>

         {/* Detailed Breakdown */}
         <AnimatePresence>
            {showDetails && (
               <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                  className="space-y-4"
               >
                  <motion.h4
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 1.4 }}
                     className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100"
                  >
                     Score Breakdown
                  </motion.h4>

                  {/* Engagement Factors */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 1.5 }}
                     className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                     {[
                        {
                           icon: <Heart size={16} className="text-red-500" />,
                           title: "Engagement",
                           value: `${rizzScore.factors.engagement.engagementRate.toFixed(1)}%`,
                           subtitle: `Avg ${rizzScore.factors.engagement.avgLikes.toLocaleString()} likes`,
                           delay: 1.6
                        },
                        {
                           icon: <TrendingUp size={16} className="text-green-500" />,
                           title: "Growth",
                           value: `${rizzScore.factors.growth.followerGrowthRate.toFixed(1)}%`,
                           subtitle: `${rizzScore.factors.growth.contentFrequency.toFixed(1)} posts/week`,
                           delay: 1.7
                        },
                        {
                           icon: <Users size={16} className="text-blue-500" />,
                           title: "Collaboration",
                           value: rizzScore.factors.collaboration.successfulCollabs.toString(),
                           subtitle: `${rizzScore.factors.collaboration.completionRate.toFixed(1)}% completion rate`,
                           delay: 1.8
                        },
                        {
                           icon: <Target size={16} className="text-purple-500" />,
                           title: "Quality",
                           value: rizzScore.factors.quality.contentScore.toFixed(1),
                           subtitle: "Content quality score",
                           delay: 1.9
                        }
                     ].map((factor) => (
                        <motion.div
                           key={factor.title}
                           initial={{ opacity: 0, y: 20, scale: 0.9 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           transition={{
                              delay: factor.delay,
                              duration: 0.4,
                              type: "spring",
                              stiffness: 200
                           }}
                           whileHover={{
                              scale: 1.02,
                              transition: { duration: 0.2 }
                           }}
                           className="p-4 bg-gray-50 rounded-xl dark:bg-gray-700/40"
                        >
                           <motion.div
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: factor.delay + 0.1 }}
                              className="flex gap-2 items-center mb-2"
                           >
                              {factor.icon}
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                 {factor.title}
                              </span>
                           </motion.div>
                           <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: factor.delay + 0.2, type: "spring", stiffness: 300 }}
                              className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                           >
                              {factor.value}
                           </motion.div>
                           <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: factor.delay + 0.3 }}
                              className="text-xs text-gray-500 dark:text-gray-400"
                           >
                              {factor.subtitle}
                           </motion.div>
                        </motion.div>
                     ))}
                  </motion.div>

                  {/* Trending Status */}
                  <AnimatePresence>
                     {rizzScore.trending.isViral && (
                        <motion.div
                           initial={{ opacity: 0, scale: 0.9, y: 20 }}
                           animate={{ opacity: 1, scale: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.9, y: -20 }}
                           transition={{ delay: 2, duration: 0.5, type: "spring", stiffness: 200 }}
                           whileHover={{ scale: 1.02 }}
                           className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 dark:from-orange-500/10 dark:to-red-500/10 dark:border-orange-500/20"
                        >
                           <motion.div
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 2.1 }}
                              className="flex gap-2 items-center mb-2"
                           >
                              <motion.div
                                 animate={{ rotate: [0, 10, -10, 0] }}
                                 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                              >
                                 <Zap size={16} className="text-orange-500" />
                              </motion.div>
                              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Viral Content Alert</span>
                           </motion.div>
                           <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2.2 }}
                              className="text-sm text-orange-600 dark:text-orange-400"
                           >
                              Trending score: {rizzScore.trending.trendingScore}/100
                           </motion.div>
                           {rizzScore.trending.viralContent.length > 0 && (
                              <motion.div
                                 initial={{ opacity: 0, height: 0 }}
                                 animate={{ opacity: 1, height: "auto" }}
                                 transition={{ delay: 2.3, duration: 0.3 }}
                                 className="mt-2"
                              >
                                 <div className="mb-1 text-xs text-orange-600 dark:text-orange-400">Viral content:</div>
                                 <div className="flex flex-wrap gap-1">
                                    {rizzScore.trending.viralContent.slice(0, 3).map((content, index) => (
                                       <motion.span
                                          key={index}
                                          initial={{ opacity: 0, scale: 0 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: 2.4 + index * 0.1, type: "spring", stiffness: 300 }}
                                          whileHover={{ scale: 1.1 }}
                                          className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded-full dark:bg-orange-500/20 dark:text-orange-300"
                                       >
                                          {content}
                                       </motion.span>
                                    ))}
                                 </div>
                              </motion.div>
                           )}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Score History */}
                  <AnimatePresence>
                     {rizzScore.scoreHistory && rizzScore.scoreHistory.length > 0 && (
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -20 }}
                           transition={{ delay: 2.5, duration: 0.5 }}
                           className="mt-6"
                        >
                           <motion.h5
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 2.6 }}
                              className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100"
                           >
                              Recent Score History
                           </motion.h5>
                           <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 2.7, type: "spring", stiffness: 200 }}
                              className="p-2 mb-2 bg-blue-50 rounded-lg dark:bg-blue-500/10"
                           >
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                 💡 These are automated score calculations that happen periodically to track your progress over time.
                              </p>
                           </motion.div>
                           <div className="space-y-2">
                              {rizzScore.scoreHistory.slice(0, 3).map((entry, index) => (
                                 <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                       delay: 2.8 + index * 0.1,
                                       duration: 0.4,
                                       type: "spring",
                                       stiffness: 200
                                    }}
                                    whileHover={{
                                       scale: 1.02,
                                       transition: { duration: 0.2 }
                                    }}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700/40"
                                 >
                                    <motion.div
                                       initial={{ x: -10, opacity: 0 }}
                                       animate={{ x: 0, opacity: 1 }}
                                       transition={{ delay: 2.9 + index * 0.1 }}
                                       className="flex gap-3 items-center"
                                    >
                                       <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 3 + index * 0.1, type: "spring", stiffness: 300 }}
                                          className={`w-2 h-2 rounded-full ${getScoreColor(entry.score).replace('text-', 'bg-')}`}
                                       ></motion.div>
                                       <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {new Date(entry.date).toLocaleDateString()}
                                       </span>
                                    </motion.div>
                                    <motion.div
                                       initial={{ x: 10, opacity: 0 }}
                                       animate={{ x: 0, opacity: 1 }}
                                       transition={{ delay: 3.1 + index * 0.1 }}
                                       className="flex gap-2 items-center"
                                    >
                                       <span className={`text-sm font-semibold ${getScoreColor(entry.score)}`}>
                                          {entry.score}
                                       </span>
                                       <span className="text-xs text-gray-500 capitalize dark:text-gray-400">
                                          {entry.calculationMethod}
                                       </span>
                                    </motion.div>
                                 </motion.div>
                              ))}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   );
};

export default RizzScoreDisplay;
