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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
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
                onClick={refreshCollaborations}
                disabled={isRefetching}
                className="text-gray-900 bg-gray-100 border-gray-300 cursor-pointer dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
              <div className="flex justify-center items-center mb-2">
                <div className="p-3 mr-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Collaborations</h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {isLoading
                  ? "Loading your mutual matches..."
                  : mutualMatches.length === 0
                    ? "No mutual matches yet. Keep swiping to find collaborators!"
                    : `${mutualMatches.length} mutual ${mutualMatches.length === 1 ? 'match' : 'matches'} ready to collaborate`}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 justify-center mb-6">
              <Button
                variant="default"
                onClick={() => router.push('/collaborations')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Users className="mr-2 w-4 h-4" />
                All Collaborations
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/collaborations/active')}
                className="text-purple-600 border-purple-500 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                <Zap className="mr-2 w-4 h-4" />
                Active Projects
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/collaborations/history')}
                className="text-purple-600 border-purple-500 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
              >
                History
              </Button>
            </div>

            {/* Content */}
            <div className="p-8 rounded-2xl border-2 shadow-xl backdrop-blur-sm border-purple-200/50 bg-white/90 dark:bg-slate-800/90 dark:border-purple-500/30">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <Loader2 className="mb-4 w-16 h-16 text-purple-600 animate-spin dark:text-purple-400" />
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading your collaborations...</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Finding your mutual matches</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="p-6 mb-4 bg-red-50 rounded-xl dark:bg-red-900/20">
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      Failed to load collaborations
                    </p>
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                      {error.message}
                    </p>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" className="text-purple-600 border-purple-500 hover:bg-purple-50">
                    Try Again
                  </Button>
                </div>
              ) : mutualMatches.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="p-6 mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full dark:from-purple-900/30 dark:to-pink-900/30">
                    <Users className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                    No Collaborations Yet
                  </h3>
                  <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
                    Start swiping to find amazing creators! When you both like each other, you&apos;ll see them here ready to collaborate.
                  </p>
                  <Button
                    onClick={() => router.push('/matching')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    Start Matching
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      🎉 Mutual Matches - Ready to Collaborate!
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
              <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
                <div className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-500/30">
                  <Users className="mx-auto mb-2 w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{mutualMatches.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mutual Matches</p>
                </div>
                <div className="p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-500/30">
                  <Zap className="mx-auto mb-2 w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mutualMatches.filter(m => m.compatibilityScore >= 85).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Compatibility</p>
                </div>
                <div className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-500/30">
                  <Users className="mx-auto mb-2 w-8 h-8 text-green-600 dark:text-green-400" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(mutualMatches.flatMap(m => m.targetProfile?.niche || [])).size}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Niches</p>
                </div>
              </div>
            )}

            {/* Pagination Info */}
            {matchHistoryData?.pagination && mutualMatches.length > 0 && (
              <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
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
