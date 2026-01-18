"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, Loader2, Users, Zap } from "lucide-react";
import type { CreatorProfile } from "@/types/matching.types";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import ProfileModal from "@/components/matching/ProfileModal";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useMatchHistory } from "@/hooks/features/useMatching";


const CollaborationsPage: React.FC = () => {
  const router = useRouter();
  const [selectedProfile, setSelectedProfile] = useState<CreatorProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [likedMatches, setLikedMatches] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch mutual matches (collaborations) using the real API hook - only fetch when mounted on client.
  const {
    data: matchHistoryData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useMatchHistory({
    status: 'mutual', // Only get mutual matches
    limit: 50,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Extract matches from the response
  const mutualMatches = React.useMemo(() => matchHistoryData?.matches || [], [matchHistoryData?.matches]);

  // Update liked matches when data loads
  React.useEffect(() => {
    if (mutualMatches.length > 0) {
      const likedIds = mutualMatches
        .map(match => match.targetProfile?.userId)
        .filter((id): id is string => Boolean(id));
      setLikedMatches(new Set(likedIds));
    }
  }, [mutualMatches]);

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center pb-16 min-h-full lg:pb-34">
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
    const match = mutualMatches.find(m => m.targetProfile?.userId === userId);
    if (match?.targetProfile) {
      setSelectedProfile(match.targetProfile);
      setIsProfileModalOpen(true);
    }
  };

  const handleStartCollab = (userId: string) => {
    console.log("Starting collaboration with user:", userId);
    // Navigate to collaboration room or modal
    router.push(`/collaborations/${userId}`);
  };

  const refreshCollaborations = async () => {
    await refetch();
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="flex gap-2 justify-between items-center mb-6 sm:mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="text-xs text-gray-900 bg-gray-100 border-gray-300 cursor-pointer sm:text-sm dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                <ArrowLeft className="mr-1.5 w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshCollaborations}
                disabled={isRefetching}
                className="text-xs text-gray-900 bg-gray-100 border-gray-300 cursor-pointer sm:text-sm dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 sm:w-4 sm:h-4 sm:mr-2 ${isRefetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>

            {/* Title */}
            <div className="mb-5 text-center sm:mb-6">
              <div className="flex justify-center items-center mb-2 sm:mb-3">
                <div className="shrink-0 p-2 mr-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl shadow-md sm:p-2.5 sm:mr-3 sm:rounded-2xl">
                  <Users className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">Collaborations</h1>
              </div>
              <p className="px-4 text-sm text-gray-600 sm:text-base lg:text-lg dark:text-gray-400">
                {isLoading
                  ? "Loading your mutual matches..."
                  : mutualMatches.length === 0
                    ? "No mutual matches yet. Keep swiping to find collaborators!"
                    : `${mutualMatches.length} mutual ${mutualMatches.length === 1 ? 'match' : 'matches'} ready to collaborate`}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col gap-2 justify-center mb-5 sm:flex-row sm:flex-wrap sm:mb-6">
              <Button
                variant="default"
                onClick={() => router.push('/collaborations')}
                className="text-xs bg-linear-to-r from-purple-500 to-pink-500 sm:text-sm hover:from-purple-600 hover:to-pink-600"
              >
                <Users className="mr-1.5 w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">All Collaborations</span>
                <span className="sm:hidden">Collaborations</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/collaborations/active')}
                className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                <Zap className="mr-1.5 w-3.5 h-3.5 sm:mr-2 sm:w-4 sm:h-4" />
                Active Projects
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/ai-matches')}
                className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                <span className="hidden sm:inline">View Match History</span>
                <span className="sm:hidden">Match History</span>
              </Button>

            </div>

            {/* Content */}
            <div className="p-5 rounded-xl border-2 shadow-xl backdrop-blur-sm sm:p-6 sm:rounded-2xl lg:p-8 border-purple-200/50 bg-white/90 dark:bg-slate-800/90 dark:border-purple-500/30">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <Loader2 className="mb-4 w-12 h-12 text-purple-600 animate-spin sm:w-16 sm:h-16 dark:text-purple-400" />
                  <p className="text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400">Loading your collaborations...</p>
                  <p className="mt-2 text-xs text-gray-500 sm:text-sm dark:text-gray-500">Finding your mutual matches</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-red-50 rounded-xl sm:p-6 dark:bg-red-900/20">
                    <p className="text-base font-semibold text-red-600 sm:text-lg dark:text-red-400">
                      Failed to load collaborations
                    </p>
                    <p className="mt-1 text-xs text-red-500 sm:text-sm dark:text-red-400">
                      {error.message}
                    </p>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50">
                    Try Again
                  </Button>
                </div>
              ) : mutualMatches.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-linear-to-br from-purple-100 to-pink-100 rounded-full sm:p-6 dark:from-purple-900/30 dark:to-pink-900/30">
                    <Users className="w-12 h-12 text-purple-600 sm:w-16 sm:h-16 dark:text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    No Collaborations Yet
                  </h3>
                  <p className="px-4 mb-6 max-w-md text-sm text-center text-gray-600 sm:text-base dark:text-gray-400">
                    Get Matching to find amazing creators! When match is accepted, you&apos;ll see them here ready to collaborate.
                  </p>
                  <Button
                    onClick={() => router.push('/matching')}
                    className="text-sm bg-linear-to-r from-purple-500 to-pink-500 sm:text-base hover:from-purple-600 hover:to-pink-600"
                  >
                    <Zap className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Start Matching
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-5 sm:mb-6">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                      🎉 Mutual Matches - Ready to Collaborate!
                    </h2>
                    <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                      These creators liked you back. Time to start creating amazing content together!
                    </p>
                  </div>
                  <MatchHistoryGallery
                    historyMatches={mutualMatches}
                    onMessage={handleMessage}
                    onViewProfile={handleViewProfile}
                    likedMatches={likedMatches}
                  />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {mutualMatches.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mt-5 sm:grid-cols-3 sm:gap-4 sm:mt-6">
                <div className="p-5 text-center bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm sm:p-6 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-500/30">
                  <Users className="mx-auto mb-2 w-7 h-7 text-purple-600 sm:w-8 sm:h-8 dark:text-purple-400" />
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">{mutualMatches.length}</p>
                  <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Mutual Matches</p>
                </div>
                <div className="p-5 text-center bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm sm:p-6 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-500/30">
                  <Zap className="mx-auto mb-2 w-7 h-7 text-blue-600 sm:w-8 sm:h-8 dark:text-blue-400" />
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {mutualMatches.filter(m => m.compatibilityScore >= 85).length}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">High Compatibility</p>
                </div>
                <div className="p-5 text-center bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm sm:p-6 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-500/30">
                  <Users className="mx-auto mb-2 w-7 h-7 text-green-600 sm:w-8 sm:h-8 dark:text-green-400" />
                  <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    {new Set(mutualMatches.flatMap(m => m.targetProfile?.niche || [])).size}
                  </p>
                  <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">Unique Niches</p>
                </div>
              </div>
            )}

            {/* Pagination Info */}
            {matchHistoryData?.pagination && mutualMatches.length > 0 && (
              <div className="mt-4 text-xs text-center text-gray-600 sm:mt-6 sm:text-sm dark:text-gray-400">
                Showing {mutualMatches.length} of {matchHistoryData.pagination.total} total mutual matches
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
          onAction={() => { }} // Already mutual, no actions needed
          onCollaboration={handleStartCollab}
          isLiked={true} // Always liked in mutual matches
        />
      </div>
    </DashboardLayout>
  );
};

export default CollaborationsPage;
