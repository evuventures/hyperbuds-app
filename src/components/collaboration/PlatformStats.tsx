/**
 * Platform Stats Component
 * Displays social media platform statistics for AI collaboration
 */

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
   TrendingUp,
   Users,
   Heart,
   Video,
   CheckCircle2,
   Loader2,
   AlertCircle,
   RefreshCw
} from 'lucide-react';
import { useMultiplePlatformData, useCombinedPlatformMetrics } from '@/hooks/features/usePlatformData';
import type { PlatformType, PlatformCredentials } from '@/types/platform.types';
import { SyncPlatformButton } from './SyncPlatformButton';

interface PlatformStatsProps {
   platformCredentials: PlatformCredentials;
   showCombinedMetrics?: boolean;
   compact?: boolean;
   clickable?: boolean;
   showSyncButtons?: boolean;
}

const platformIcons: Record<PlatformType, string> = {
   tiktok: '🎵',
   twitter: '🐦',
   twitch: '🎮',
   instagram: '📷',
   youtube: '📺',
};

const platformColors: Record<PlatformType, string> = {
   tiktok: 'from-pink-500 to-red-500',
   twitter: 'from-blue-400 to-blue-600',
   twitch: 'from-purple-500 to-purple-700',
   instagram: 'from-purple-600 via-pink-500 to-orange-400',
   youtube: 'from-red-500 to-red-700',
};

export function PlatformStats({
   platformCredentials,
   showCombinedMetrics = true,
   compact = false,
   clickable = false,
   showSyncButtons = false
}: PlatformStatsProps) {
   const [platforms, setPlatforms] = useState<Array<{ type: PlatformType; username: string }>>([]);
   const router = useRouter();

   const handlePlatformClick = (platform: PlatformType) => {
      if (clickable) {
         router.push(`/profile/platform-analytics?platform=${platform}`);
      }
   };

   useEffect(() => {
      const platformList: Array<{ type: PlatformType; username: string }> = [];

      if (platformCredentials.tiktok) {
         platformList.push({ type: 'tiktok', username: platformCredentials.tiktok });
      }
      if (platformCredentials.twitter) {
         platformList.push({ type: 'twitter', username: platformCredentials.twitter });
      }
      if (platformCredentials.twitch) {
         platformList.push({ type: 'twitch', username: platformCredentials.twitch });
      }
      if (platformCredentials.instagram) {
         platformList.push({ type: 'instagram', username: platformCredentials.instagram });
      }
      if (platformCredentials.youtube) {
         platformList.push({ type: 'youtube', username: platformCredentials.youtube });
      }

      setPlatforms(platformList);
   }, [platformCredentials]);

   const { data, loading, errors, refetch } = useMultiplePlatformData(platforms);
   const combinedMetrics = useCombinedPlatformMetrics(data);

   if (platforms.length === 0) {
      return (
         <div className="p-6 text-center bg-gray-50 rounded-xl dark:bg-gray-800">
            <AlertCircle className="mx-auto mb-2 w-12 h-12 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
               No platform accounts connected
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
               Add your social media usernames in your profile to see stats here
            </p>
         </div>
      );
   }

   if (loading) {
      return (
         <div className="p-8 text-center bg-gray-50 rounded-xl dark:bg-gray-800">
            <Loader2 className="mx-auto mb-3 w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
               Fetching platform data...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
               This may take a few seconds
            </p>
         </div>
      );
   }

   if (errors.length > 0 && Object.values(data).every(d => d === null)) {
      return (
         <div className="p-6 text-center bg-red-50 rounded-xl dark:bg-red-900/20">
            <AlertCircle className="mx-auto mb-2 w-12 h-12 text-red-500" />
            <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
               Failed to load platform data
            </p>
            <button
               onClick={() => refetch()}
               className="inline-flex gap-2 items-center px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-lg transition-colors hover:bg-red-50 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/40"
            >
               <RefreshCw className="w-4 h-4" />
               Retry
            </button>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Combined Metrics */}
         {showCombinedMetrics && combinedMetrics.platformCount > 0 && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 shadow-lg dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800"
            >
               <div className="flex gap-2 items-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                     Combined Reach
                  </h3>
               </div>

               <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="p-4 bg-white rounded-xl dark:bg-gray-800">
                     <p className="mb-1 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                        Total Followers
                     </p>
                     <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {combinedMetrics.totalFollowers.toLocaleString()}
                     </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl dark:bg-gray-800">
                     <p className="mb-1 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                        Total Engagement
                     </p>
                     <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {combinedMetrics.totalEngagement.toLocaleString()}
                     </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl dark:bg-gray-800">
                     <p className="mb-1 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                        Avg. Engagement
                     </p>
                     <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {combinedMetrics.averageEngagementRate.toFixed(1)}
                     </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl dark:bg-gray-800">
                     <p className="mb-1 text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                        Platforms
                     </p>
                     <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        {combinedMetrics.platformCount}
                     </p>
                  </div>
               </div>
            </motion.div>
         )}

         {/* Individual Platform Stats */}
         <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {(Object.keys(data) as PlatformType[]).map((platform) => {
               const platformData = data[platform];

               if (!platformData) return null;

               // Compact version for Platform Performance section
               if (compact) {
                  return (
                     <motion.div
                        key={platform}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`group p-5 rounded-xl transition-all hover:scale-[1.02] bg-gray-50/80 dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500/70 hover:shadow-lg ${clickable ? 'cursor-pointer' : ''}`}
                        onClick={() => handlePlatformClick(platform)}
                     >
                        <div className="flex justify-between items-center mb-4">
                           <div
                              className={`p-3 rounded-xl bg-gradient-to-br ${
                                 platform === "tiktok"
                                    ? "from-pink-100 to-rose-100 dark:from-pink-500/20 dark:to-rose-500/20"
                                    : platform === "twitter"
                                       ? "from-cyan-100 to-blue-100 dark:from-cyan-500/20 dark:to-blue-500/20"
                                       : platform === "twitch"
                                          ? "from-purple-100 to-violet-100 dark:from-purple-500/20 dark:to-violet-500/20"
                                          : platform === "instagram"
                                             ? "from-purple-100 via-pink-100 to-orange-100 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-orange-500/20"
                                             : "from-red-100 to-red-200 dark:from-red-500/20 dark:to-red-500/20"
                              } group-hover:scale-110 transition-transform`}
                           >
                              <Users
                                 size={24}
                                 className={`${
                                    platform === "tiktok"
                                       ? "text-pink-600 dark:text-pink-400"
                                       : platform === "twitter"
                                          ? "text-cyan-600 dark:text-cyan-400"
                                          : platform === "twitch"
                                             ? "text-purple-600 dark:text-purple-400"
                                             : platform === "instagram"
                                                ? "text-purple-600 dark:text-purple-400"
                                                : "text-red-600 dark:text-red-400"
                                 }`}
                              />
                           </div>
                        </div>

                        <div className="flex gap-2 justify-between items-center mb-2">
                           <div className="text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                              {platform}
                           </div>
                        </div>

                        <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                           {platformData.followers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                           followers
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                           Engagement: {platformData.averageEngagement > 0 ? platformData.averageEngagement.toFixed(1) : 0}%
                        </div>
                     </motion.div>
                  );
               }

               // Full version for other uses
               return (
                  <motion.div
                     key={platform}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     whileHover={{ scale: 1.02 }}
                     className="overflow-hidden bg-white rounded-xl border border-gray-300 shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg"
                  >
                     {/* Platform Header */}
                     <div className={`p-4 bg-gradient-to-r ${platformColors[platform]}`}>
                        <div className="flex gap-3 items-center">
                           <span className="text-3xl">{platformIcons[platform]}</span>
                           <div className="flex-1 min-w-0">
                              <div className="flex gap-2 items-center">
                                 <h4 className="text-lg font-bold text-white capitalize truncate">
                                    {platform}
                                 </h4>
                                 {platformData.verified && (
                                    <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                                 )}
                              </div>
                              <p className="text-sm truncate text-white/90">
                                 @{platformData.username}
                              </p>
                           </div>
                        </div>
                     </div>

                     {/* Platform Stats */}
                     <div className="p-4 space-y-3">
                        <div className="flex gap-2 items-start">
                           {platformData.profileImage && (
                              <Image
                                 src={platformData.profileImage}
                                 alt={platformData.displayName}
                                 width={48}
                                 height={48}
                                 className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700"
                                 unoptimized
                              />
                           )}
                           <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate dark:text-gray-100">
                                 {platformData.displayName}
                              </p>
                              {platformData.bio && (
                                 <p className="text-xs text-gray-600 line-clamp-2 dark:text-gray-400">
                                    {platformData.bio}
                                 </p>
                              )}
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                           <div className="flex gap-2 items-center">
                              <Users className="w-4 h-4 text-blue-500" />
                              <div>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                                 <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {platformData.followers.toLocaleString()}
                                 </p>
                              </div>
                           </div>

                           <div className="flex gap-2 items-center">
                              <Heart className="w-4 h-4 text-red-500" />
                              <div>
                                 <p className="text-xs text-gray-500 dark:text-gray-400">Engagement</p>
                                 <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {platformData.totalEngagement.toLocaleString()}
                                 </p>
                              </div>
                           </div>

                           {platformData.totalContent > 0 && (
                              <>
                                 <div className="flex gap-2 items-center">
                                    <Video className="w-4 h-4 text-purple-500" />
                                    <div>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">Content</p>
                                       <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {platformData.totalContent.toLocaleString()}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="flex gap-2 items-center">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <div>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Rate</p>
                                       <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {platformData.averageEngagement.toFixed(1)}
                                       </p>
                                    </div>
                                 </div>
                              </>
                           )}
                        </div>

                        {/* Sync Button */}
                        {showSyncButtons && (
                           <div className="pt-3 mt-3 border-t border-gray-300 dark:border-gray-700">
                              <SyncPlatformButton
                                 platform={platform}
                                 platformData={platformData}
                                 variant="compact"
                                 onSyncComplete={() => refetch()}
                              />
                           </div>
                        )}
                     </div>
                  </motion.div>
               );
            })}
         </div>

         {/* Last Updated */}
         <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Data fetched from public profiles • Updates every 5 minutes
         </div>
      </div>
   );
}