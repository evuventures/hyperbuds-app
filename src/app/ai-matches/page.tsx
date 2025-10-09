"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import type { CreatorProfile } from "@/types/matching.types";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import ProfileModal from "@/components/matching/ProfileModal";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useMatchHistory } from "@/hooks/features/useMatching";

const AIMatchesPage: React.FC = () => {
   const router = useRouter();
   const [selectedProfile, setSelectedProfile] = useState<CreatorProfile | null>(null);
   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
   const [likedMatches, setLikedMatches] = useState<Set<string>>(new Set());
   const [isMounted, setIsMounted] = useState(false);

   // Ensure client-side only rendering
   React.useEffect(() => {
      setIsMounted(true);
   }, []);

   // Fetch match history using the real API hook - only fetch when mounted on client
   const {
      data: matchHistoryData,
      isLoading,
      error,
      refetch,
      isRefetching
   } = useMatchHistory({
      status: 'all',
      limit: 50,
      sortBy: 'compatibility',
      sortOrder: 'desc'
   });

   // Extract matches from the response
   const historyMatches = React.useMemo(() => matchHistoryData?.matches || [], [matchHistoryData?.matches]);

   // Update liked matches when data loads
   React.useEffect(() => {
      if (historyMatches.length > 0) {
         const likedIds = historyMatches
            .filter(match => match.status === "liked" || match.status === "mutual")
            .map(match => match.targetProfile?.userId)
            .filter((id): id is string => Boolean(id));
         setLikedMatches(new Set(likedIds));
      }
   }, [historyMatches]);

   // Don't render until mounted on client
   if (!isMounted) {
      return (
         <DashboardLayout>
            <div className="flex justify-center items-center min-h-screen">
               <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
            </div>
         </DashboardLayout>
      );
   }

   const handleMessage = (userId: string) => {
      console.log("Opening chat with user:", userId);
      // Navigate to messages with the user
      router.push(`/messages?userId=${userId}`);
   };

   const handleViewProfile = (userId: string) => {
      const match = historyMatches.find(m => m.targetProfile?.userId === userId);
      if (match?.targetProfile) {
         setSelectedProfile(match.targetProfile);
         setIsProfileModalOpen(true);
      }
   };

   const refreshMatches = async () => {
      await refetch();
   };

   return (
      <DashboardLayout>
         <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <div className="p-6">
               <div className="mx-auto max-w-4xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-1">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-gray-900 bg-gray-100 border-gray-300 cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
                     >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back
                     </Button>

                     <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshMatches}
                        disabled={isRefetching}
                        className="text-gray-900 bg-gray-100 border-gray-300 cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
                     >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
                        Refresh
                     </Button>
                  </div>

                  {/* Title */}
                  <div className="mb-4 text-center">
                     <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">AI Matches</h1>
                     <p className="text-gray-600 dark:text-gray-400">
                        {isLoading
                           ? "Loading your match history..."
                           : `${historyMatches.length} matches found`}
                     </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 rounded-xl border border-gray-200 backdrop-blur-sm bg-white/80 dark:bg-white/5 dark:border-white/10">
                     {isLoading ? (
                        <div className="flex flex-col justify-center items-center py-12">
                           <Loader2 className="mb-4 w-12 h-12 text-purple-600 animate-spin dark:text-purple-400" />
                           <p className="text-gray-600 dark:text-gray-400">Loading your AI matches...</p>
                        </div>
                     ) : error ? (
                        <div className="flex flex-col justify-center items-center py-12">
                           <div className="p-4 mb-4 bg-red-50 rounded-lg dark:bg-red-900/20">
                              <p className="text-red-600 dark:text-red-400">
                                 Failed to load matches: {error.message}
                              </p>
                           </div>
                           <Button onClick={() => refetch()} variant="outline">
                              Try Again
                           </Button>
                        </div>
                     ) : historyMatches.length === 0 ? (
                        <div className="flex flex-col justify-center items-center py-12">
                           <p className="mb-4 text-gray-600 dark:text-gray-400">
                              No matches found yet. Start swiping in the matching page!
                           </p>
                           <Button onClick={() => router.push('/matching')} variant="default">
                              Go to Matching
                           </Button>
                        </div>
                     ) : (
                        <MatchHistoryGallery
                           historyMatches={historyMatches}
                           onMessage={handleMessage}
                           onViewProfile={handleViewProfile}
                           likedMatches={likedMatches}
                        />
                     )}
                  </div>

                  {/* Pagination Info */}
                  {matchHistoryData?.pagination && (
                     <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        Showing {historyMatches.length} of {matchHistoryData.pagination.total} total matches
                     </div>
                  )}
               </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
               profile={selectedProfile}
               isOpen={isProfileModalOpen}
               onClose={() => {
                  setIsProfileModalOpen(false);
                  setSelectedProfile(null);
               }}
               onAction={() => { }} // Not used in this context
               onCollaboration={() => { }} // Not used in this context
               isLiked={selectedProfile ? likedMatches.has(selectedProfile.userId) : false}
            />
         </div>
      </DashboardLayout>
   );
};

export default AIMatchesPage;
