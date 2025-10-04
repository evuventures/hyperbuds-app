import React from 'react';
import {
   Star,
   TrendingUp,
   Users,
   Target,
   Heart,
   AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRizzScore } from '@/hooks/useRizzScore';

interface RizzScoreDisplayProps {
   userId?: string;
   showDetails?: boolean;
   className?: string;
   isFullPage?: boolean;
   onNavigateToPage?: () => void;
}

export const RizzScoreDisplay: React.FC<RizzScoreDisplayProps> = ({
   userId,
   showDetails = true,
   className = '',
   // isFullPage = false,
   // onNavigateToPage
}) => {
   const { rizzScore, loading, error } = useRizzScore(userId);

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
               onClick={() => window.location.reload()}
               className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
            >
               <AlertCircle size={16} />
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

         </motion.div>

         {/* Enhanced Main Score Display */}
         <div className="mb-8 text-center">
            {/* Animated Background Ring */}
            <motion.div
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
               className="inline-block relative"
            >
               {/* Outer Glow Ring */}
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 w-40 h-40 rounded-full bg-gradient-to-r ${getScoreBgColor(rizzScore.currentScore)} opacity-20 blur-xl`}
               />

               {/* Main Score Circle */}
               <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className={`relative inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br ${getScoreBgColor(rizzScore.currentScore)} border-4 border-white shadow-2xl dark:border-gray-800 overflow-hidden`}
               >
                  {/* Inner Pulsing Circle */}
                  <motion.div
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                     className={`absolute inset-2 bg-gradient-to-br to-transparent rounded-full from-white/20`}
                  />

                  {/* Score Number */}
                  <motion.span
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 300 }}
                     className={`relative text-5xl font-black ${getScoreColor(rizzScore.currentScore)} drop-shadow-lg`}
                     style={{ minWidth: '60px', display: 'block' }}
                  >
                     {rizzScore.currentScore || '0'}
                  </motion.span>

                  {/* Score Label Overlay */}
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.6, duration: 0.4 }}
                     className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  >
                     <div className={`px-3 py-1 text-xs font-bold ${getScoreColor(rizzScore.currentScore)} bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg`}>
                        RIZZ
                     </div>
                  </motion.div>
               </motion.div>
            </motion.div>

            {/* Enhanced Status Section */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8, duration: 0.5 }}
               className="mt-6 space-y-2"
            >
               {/* Main Status */}
               <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getScoreBgColor(rizzScore.currentScore)} bg-opacity-10 border border-current`}
               >
                  <motion.div
                     animate={{ scale: [1, 1.2, 1] }}
                     transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                     className={`w-2 h-2 rounded-full ${getScoreColor(rizzScore.currentScore)}`}
                  />
                  <span className={`text-lg font-bold ${getScoreColor(rizzScore.currentScore)}`}>
                     {getScoreLabel(rizzScore.currentScore)}
                  </span>
               </motion.div>

               {/* Growth Status */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="flex gap-2 justify-center items-center"
               >
                  {rizzScore.trending.isViral ? (
                     <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="text-2xl"
                     >
                        🔥
                     </motion.div>
                  ) : (
                     <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-lg"
                     >
                        📈
                     </motion.div>
                  )}
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                     {rizzScore.trending.isViral ? 'Viral Content Detected' : 'Steady Growth'}
                  </span>
               </motion.div>

               {/* Progress Bar */}
               <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="mx-auto mt-4 w-48"
               >
                  <div className="overflow-hidden h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                     <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rizzScore.currentScore}%` }}
                        transition={{ delay: 1.6, duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${getScoreBgColor(rizzScore.currentScore)} rounded-full`}
                     />
                  </div>
                  <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
                     {rizzScore.currentScore}/100
                  </div>
               </motion.div>
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
                     ].map((factor) => {
                        const colors = {
                           red: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600",
                           green: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700/50 hover:border-green-300 dark:hover:border-green-600",
                           blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600",
                           purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50 hover:border-purple-300 dark:hover:border-purple-600"
                        };

                        const colorClass = factor.title === "Engagement" ? "red" :
                           factor.title === "Growth" ? "green" :
                              factor.title === "Collaboration" ? "blue" : "purple";

                        return (
                           <motion.div
                              key={factor.title}
                              initial={{ opacity: 0, y: 30, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                 delay: factor.delay,
                                 duration: 0.5,
                                 type: "spring",
                                 stiffness: 200
                              }}
                              whileHover={{
                                 scale: 1.03,
                                 y: -4,
                                 transition: { duration: 0.2 }
                              }}
                              className={`overflow-hidden relative p-6 bg-gradient-to-br rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${colors[colorClass]}`}
                           >
                              {/* Animated Background Pattern */}
                              <motion.div
                                 className="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
                                 animate={{ rotate: [0, 360] }}
                                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              >
                                 <div className={`w-full h-full bg-gradient-to-br ${colorClass === "red" ? "from-red-400 to-red-600"
                                    : colorClass === "green" ? "from-green-400 to-green-600"
                                       : colorClass === "blue" ? "from-blue-400 to-blue-600"
                                          : "from-purple-400 to-purple-600"
                                    }`} />
                              </motion.div>

                              {/* Content */}
                              <div className="relative z-10">
                                 {/* Header */}
                                 <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: factor.delay + 0.1, duration: 0.4 }}
                                    className="flex gap-3 items-center mb-4"
                                 >
                                    <motion.div
                                       animate={{ scale: [1, 1.1, 1] }}
                                       transition={{ duration: 2, repeat: Infinity, delay: factor.delay }}
                                       className={`p-2 rounded-xl ${colorClass === "red" ? "bg-red-100 dark:bg-red-900/30"
                                          : colorClass === "green" ? "bg-green-100 dark:bg-green-900/30"
                                             : colorClass === "blue" ? "bg-blue-100 dark:bg-blue-900/30"
                                                : "bg-purple-100 dark:bg-purple-900/30"
                                          }`}
                                    >
                                       {factor.icon}
                                    </motion.div>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                       {factor.title}
                                    </span>
                                 </motion.div>

                                 {/* Value */}
                                 <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: factor.delay + 0.2, duration: 0.4, type: "spring" }}
                                    className={`text-3xl font-black mb-2 ${colorClass === "red" ? "text-red-600 dark:text-red-400"
                                       : colorClass === "green" ? "text-green-600 dark:text-green-400"
                                          : colorClass === "blue" ? "text-blue-600 dark:text-blue-400"
                                             : "text-purple-600 dark:text-purple-400"
                                       }`}
                                 >
                                    {factor.value}
                                 </motion.div>

                                 {/* Subtitle */}
                                 <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: factor.delay + 0.3, duration: 0.4 }}
                                    className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400"
                                 >
                                    {factor.subtitle}
                                 </motion.div>

                                 {/* Progress Indicator */}
                                 <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: factor.delay + 0.5, duration: 0.8, ease: "easeOut" }}
                                    className={`h-1 rounded-full ${colorClass === "red" ? "bg-red-200 dark:bg-red-800/50"
                                       : colorClass === "green" ? "bg-green-200 dark:bg-green-800/50"
                                          : colorClass === "blue" ? "bg-blue-200 dark:bg-blue-800/50"
                                             : "bg-purple-200 dark:bg-purple-800/50"
                                       }`}
                                 >
                                    <motion.div
                                       initial={{ width: 0 }}
                                       animate={{ width: `${Math.min(parseFloat(factor.value.replace('%', '')), 100)}%` }}
                                       transition={{ delay: factor.delay + 0.7, duration: 1, ease: "easeOut" }}
                                       className={`h-full rounded-full ${colorClass === "red" ? "bg-gradient-to-r from-red-400 to-red-500"
                                          : colorClass === "green" ? "bg-gradient-to-r from-green-400 to-green-500"
                                             : colorClass === "blue" ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                                : "bg-gradient-to-r from-purple-400 to-purple-500"
                                          }`}
                                    />
                                 </motion.div>
                              </div>
                           </motion.div>
                        );
                     })}
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
                                 <Star size={16} className="text-orange-500" />
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
