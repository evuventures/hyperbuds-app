'use client'

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { PlatformStats } from "@/components/collaboration/PlatformStats";
import { apiFetch } from "@/lib/utils/api";
import { ArrowLeft, TrendingUp, Users, Heart, Video, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface User {
   profile?: {
      socialLinks?: {
         tiktok?: string;
         twitter?: string;
         twitch?: string;
      };
   };
}

export default function PlatformAnalyticsPage() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const platform = searchParams.get('platform') as 'tiktok' | 'twitter' | 'twitch' | null;

   const loadProfile = async () => {
      try {
         setIsLoading(true);
         const data = await apiFetch("/api/v1/profiles/me");
         setUser(data);
         setError(null);
      } catch (err) {
         console.error("Error loading profile:", err);
         setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      loadProfile();
   }, []);

   if (error) {
      return (
         <DashboardLayout>
            <div className="p-6">
               <div className="text-center">
                  <p className="text-red-400">Error loading profile: {error}</p>
                  <button
                     onClick={() => window.location.reload()}
                     className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                     Retry
                  </button>
               </div>
            </div>
         </DashboardLayout>
      );
   }

   if (isLoading) {
      return (
         <DashboardLayout>
            <div className="p-6">
               <div className="animate-pulse">
                  <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-gray-300 rounded-xl"></div>
                     ))}
                  </div>
               </div>
            </div>
         </DashboardLayout>
      );
   }

   // Extract platform credentials
   const platformCreds: Record<string, string> = {};
   const socialLinks = user?.profile?.socialLinks || {};

   if (socialLinks.tiktok) {
      const match = socialLinks.tiktok.match(/tiktok\.com\/@?([^/?]+)/);
      if (match) {
         platformCreds.tiktok = match[1];
      }
   }

   if (socialLinks.twitter) {
      const match = socialLinks.twitter.match(/(?:twitter|x)\.com\/([^/?]+)/);
      if (match) {
         platformCreds.twitter = match[1];
      }
   }

   if (socialLinks.twitch) {
      const match = socialLinks.twitch.match(/twitch\.tv\/([^/?]+)/);
      if (match) {
         platformCreds.twitch = match[1];
      }
   }

   const platformNames = {
      tiktok: 'TikTok',
      twitter: 'Twitter / X',
      twitch: 'Twitch'
   };

   return (
      <DashboardLayout>
         <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="p-6 space-y-8">
               {/* Header */}
               <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-6 mb-8"
               >
                  <button
                     onClick={() => router.back()}
                     className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
                  >
                     <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        Back
                     </span>
                  </button>
                  <div className="flex-1">
                     <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Platform Analytics
                     </h1>
                     <p className="text-gray-600 dark:text-gray-400">
                        Detailed insights for your social media platforms
                     </p>
                  </div>
               </motion.div>

               {/* Platform Performance Overview */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative p-8 bg-white/80 dark:bg-gray-800/80 rounded-3xl border shadow-xl backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 overflow-hidden"
               >
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-cyan-100 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
                  <h2 className="flex gap-3 items-center mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">
                     <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg dark:from-purple-500/20 dark:to-pink-500/20">
                        <TrendingUp
                           size={24}
                           className="text-purple-600 dark:text-purple-400"
                        />
                     </div>
                     Platform Performance
                  </h2>

                  <PlatformStats
                     platformCredentials={platformCreds}
                     showCombinedMetrics={true}
                     compact={false}
                     clickable={false}
                  />
               </motion.div>

               {/* Individual Platform Details */}
               {platform && platformCreds[platform] && (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60"
                  >
                     <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                           {platformNames[platform]} Analytics
                        </h2>
                        <a
                           href={socialLinks[platform]}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
                        >
                           <ExternalLink className="w-4 h-4" />
                           View Profile
                        </a>
                     </div>

                     <PlatformStats
                        platformCredentials={{ [platform]: platformCreds[platform] }}
                        showCombinedMetrics={false}
                        compact={false}
                        clickable={false}
                     />
                  </motion.div>
               )}

               {/* Quick Stats Grid */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
               >
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                     <div className="flex items-center gap-3 mb-3">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                           Total Reach
                        </h3>
                     </div>
                     <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {Object.values(platformCreds).length > 0 ? 'Active' : '0'}
                     </p>
                     <p className="text-sm text-blue-700 dark:text-blue-300">
                        Connected platforms
                     </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                     <div className="flex items-center gap-3 mb-3">
                        <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                           Engagement
                        </h3>
                     </div>
                     <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        Real-time
                     </p>
                     <p className="text-sm text-green-700 dark:text-green-300">
                        Updated every 5 minutes
                     </p>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
                     <div className="flex items-center gap-3 mb-3">
                        <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                           Content
                        </h3>
                     </div>
                     <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        Live Data
                     </p>
                     <p className="text-sm text-purple-700 dark:text-purple-300">
                        From platform APIs
                     </p>
                  </div>
               </motion.div>
            </div>
         </div>
      </DashboardLayout>
   );
}
