"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Loader2, Heart, Users, Sparkles, TrendingUp, MessageCircle, Zap } from "lucide-react";
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
  router.push(`profile/user-profile/${userId}`);
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
                  <div className="mb-6 text-center">
                     <div className="flex items-center justify-center mb-3">
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600">
                           <Heart className="w-8 h-8 text-white" />
                        </div>
                     </div>
                     <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                        AI Matches
                     </h1>
                     <p className="text-lg text-gray-600 dark:text-gray-400">
                        {isLoading
                           ? "Loading your match history..."
                           : historyMatches.length === 0 
                              ? "Discover your perfect collaboration partners"
                              : `${historyMatches.length} ${historyMatches.length === 1 ? 'match' : 'matches'} found`}
                     </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 rounded-xl border border-gray-200 backdrop-blur-sm bg-white/80 dark:bg-white/5 dark:border-white/10">
                     {isLoading ? (
                        <div className="flex flex-col justify-center items-center py-16">
                           <div className="relative mb-6">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                                 <Loader2 className="w-10 h-10 text-purple-600 animate-spin dark:text-purple-400" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                                 <Sparkles className="w-3 h-3 text-yellow-800" />
                              </div>
                           </div>
                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              Finding Your Perfect Match History
                           </h3>
                           {/*<p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                              Our AI is analyzing thousands of creators to find the best collaboration opportunities for you...
                           </p>*/}
                        </div>
                     ) : error ? (
                        <div className="flex flex-col justify-center items-center py-16">
                           <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                                 <Heart className="w-6 h-6 text-white" />
                              </div>
                           </div>
                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              Oops! Something went wrong
                           </h3>
                           <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                              We couldn&apos;t load your match history right now. Don&apos;t worry, this happens sometimes.
                           </p>
                           <div className="flex flex-col sm:flex-row gap-4">
                              <Button 
                                 onClick={() => refetch()} 
                                 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg"
                              >
                                 <RefreshCw className="w-4 h-4 mr-2" />
                                 Try Again
                              </Button>
                              <Button 
                                 onClick={() => router.push('/matching')} 
                                 variant="outline"
                                 className="px-6 py-3 border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold rounded-lg"
                              >
                                 <Heart className="w-4 h-4 mr-2" />
                                 Get Matching
                              </Button>
                           </div>
                        </div>
                     ) : historyMatches.length === 0 ? (
                        <div className="flex flex-col justify-center items-center py-16">
                           {/* Enhanced Empty State */}
                           <div className="text-center max-w-2xl mx-auto">
                              {/* Animated Icon */}
                              <div className="relative mb-8">
                                 <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center animate-pulse">
                                       <Heart className="w-12 h-12 text-white" />
                                    </div>
                                 </div>
                                 <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                    <Sparkles className="w-4 h-4 text-yellow-800" />
                                 </div>
                              </div>

                              {/* Main Message */}
                              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">
                                 No match History!
                              </h2>
                              

                              {/* Feature Cards */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                 <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500">
                                       <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Matching</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                       AI analyzes compatibility based on content, audience, and goals
                                    </p>
                                 </div>

                                 <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-green-500">
                                       <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Growth Focused</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                       Connect with creators who can help you reach new audiences
                                    </p>
                                 </div>

                                 <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500">
                                       <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Connect</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                       Start conversations and collaborations right away
                                    </p>
                                 </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                 <Button 
                                    onClick={() => router.push('/matching')} 
                                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                 >
                                    <Heart className="w-5 h-5 mr-2" />
                                    Get Matching
                                 </Button>
                               {/*  <Button 
                                    onClick={() => router.push('/profile/edit')} 
                                    variant="outline"
                                    className="px-8 py-3 border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold rounded-lg"
                                 >
                                    <Star className="w-5 h-5 mr-2" />
                                    Complete Profile
                                 </Button>*/}
                              </div>

                              {/* Tips Section */}
                              <div className="mt-12 p-6 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <MessageCircle className="w-5 h-5 mr-2 text-purple-500" />
                                    Pro Tips for Better Matches
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-start">
                                       <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                                       <span>Complete your profile with detailed bio and interests</span>
                                    </div>
                                    <div className="flex items-start">
                                       <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                                       <span>Add your social media links for better matching</span>
                                    </div>
                                    <div className="flex items-start">
                                       <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                                       <span>Be active in the matching page to get more suggestions</span>
                                    </div>
                                    <div className="flex items-start">
                                       <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                                       <span>Update your preferences to refine your matches</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
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
                  {matchHistoryData?.pagination && historyMatches.length > 0 && (
                     <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                           <Users className="w-4 h-4 mr-2 text-purple-500" />
                           <span className="font-medium">
                              Showing {historyMatches.length} of {matchHistoryData.pagination.total} total matches
                           </span>
                        </div>
                        {matchHistoryData.pagination.total > 0 && (
                           <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-500">
                              Keep swiping to discover more amazing creators!
                           </div>
                        )}
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
