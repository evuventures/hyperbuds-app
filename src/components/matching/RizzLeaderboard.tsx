'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
   Trophy,
   Medal,
   Award,
   MapPin,
   TrendingUp,
   Crown,
   Zap
} from 'lucide-react';
import { useRizzLeaderboard } from '@/hooks/features/useMatching';
import type { LeaderboardQuery } from '@/types/matching.types';

interface RizzLeaderboardProps {
   query?: LeaderboardQuery;
   compact?: boolean;
   maxItems?: number;
}

interface LeaderboardItem {
   userId: string;
   currentScore: number;
   trending: {
      isViral: boolean;
      trendingScore: number;
   };
   profile: {
      username: string;
      displayName: string;
      avatar?: string;
      niche: string[];
      location?: {
         city?: string;
         state?: string;
         country?: string;
      };
   };
}

const RizzLeaderboard: React.FC<RizzLeaderboardProps> = ({
   query = {},
   compact = false,
   maxItems = 10
}) => {
   const { data, isLoading, error, refetch } = useRizzLeaderboard({
      ...query,
      limit: Math.min(maxItems, 50) // API limit
   });

   // Memoize leaderboard items to prevent unnecessary re-renders
   const leaderboard = React.useMemo(() => {
      return data?.leaderboard || [];
   }, [data?.leaderboard]);

   // Memoized leaderboard item component for better performance
   const LeaderboardItem = React.memo(function LeaderboardItem({ item, rank, index }: { item: LeaderboardItem; rank: number; index: number }) {
      const isTopThree = rank <= 3;

      return (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
          relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md
          ${getRankBackground(rank)}
          ${isTopThree ? 'ring-2 ring-opacity-50' : ''}
          ${rank === 1 ? 'ring-yellow-400' : rank === 2 ? 'ring-gray-400' : rank === 3 ? 'ring-amber-400' : ''}
        `}
         >
            {/* Rank Badge */}
            <div className="flex-shrink-0 self-start sm:self-auto">
               {getRankIcon(rank)}
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
               {/* Avatar */}
               <div className="flex-shrink-0">
                  {item.profile.avatar ? (
                     <Image
                        src={item.profile.avatar}
                        alt={`${item.profile.displayName || item.profile.username}'s avatar`}
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white dark:border-gray-700"
                        unoptimized={false}
                        priority={index < 3} // Prioritize loading for top 3
                     />
                  ) : (
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                        {item.profile.displayName?.[0]?.toUpperCase() || '?'}
                     </div>
                  )}
               </div>

               {/* User Details */}
               <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                     <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                        {item.profile.displayName || item.profile.username}
                     </h3>
                     {item.trending?.isViral && (
                        <div className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full dark:bg-red-900/20 dark:text-red-400 flex-shrink-0">
                           <TrendingUp className="w-3 h-3" />
                           <span className="hidden xs:inline">Viral</span>
                        </div>
                     )}
                  </div>

                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                     {item.profile.niche && item.profile.niche.length > 0 && (
                        <span className="truncate">
                           {item.profile.niche.slice(0, 2).join(', ')}
                        </span>
                     )}
                     {item.profile.location?.country && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                           <MapPin className="w-3 h-3" />
                           {item.profile.location.country}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Rizz Score */}
            <div className="text-right flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
               <div className="flex items-center gap-1 justify-end sm:justify-end">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                     {item.currentScore.toFixed(0)}
                  </span>
               </div>
               <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Rizz Score
               </p>
               {item.trending?.trendingScore && (
                  <p className={`text-xs ${item.trending.trendingScore > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                     {item.trending.trendingScore > 0 ? '+' : ''}{item.trending.trendingScore.toFixed(1)}
                  </p>
               )}
            </div>
         </motion.div>
      );
   });

   // Get ranking icons for top 3
   const getRankIcon = (rank: number) => {
      switch (rank) {
         case 1:
            return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
         case 2:
            return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
         case 3:
            return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
         default:
            return <span className="w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 flex items-center justify-center">#{rank}</span>;
      }
   };

   // Get ranking background for top 3
   const getRankBackground = (rank: number) => {
      switch (rank) {
         case 1:
            return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700';
         case 2:
            return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-300 dark:border-gray-600';
         case 3:
            return 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700';
         default:
            return 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700';
      }
   };

   // Loading state
   if (isLoading) {
      return (
         <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
               <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
                     <div className="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-600"></div>
                     <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4 dark:bg-gray-600"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2 dark:bg-gray-600"></div>
                     </div>
                     <div className="w-16 h-6 bg-gray-300 rounded dark:bg-gray-600"></div>
                  </div>
               </div>
            ))}
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 dark:bg-red-900/20">
               <Trophy className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
               Failed to Load Leaderboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
               {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <button
               onClick={() => refetch()}
               className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
               Try Again
            </button>
         </div>
      );
   }

   // Empty state
   if (leaderboard.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 dark:bg-purple-900/20">
               <Trophy className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
               No Rankings Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
               Be the first to appear on the leaderboard by building your Rizz Score!
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {/* Header */}
         {!compact && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg dark:from-purple-900/20 dark:to-pink-900/20 flex-shrink-0">
                     <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                     <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                        Rizz Score Leaderboard
                     </h2>
                     <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Top {leaderboard.length} creators by Rizz Score
                     </p>
                  </div>
               </div>

               <button
                  onClick={() => refetch()}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors self-start sm:self-auto"
                  title="Refresh leaderboard"
               >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
               </button>
            </div>
         )}

         {/* Leaderboard Items */}
         <div className="space-y-3">
            {leaderboard.map((item: LeaderboardItem, index: number) => {
               const rank = index + 1;
               return (
                  <LeaderboardItem
                     key={item.userId}
                     item={item}
                     rank={rank}
                     index={index}
                  />
               );
            })}
         </div>
      </div>
   );
};

export default RizzLeaderboard;
