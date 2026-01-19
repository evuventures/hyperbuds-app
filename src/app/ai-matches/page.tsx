"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2, Heart } from "lucide-react";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import { useMatching } from "@/hooks/features/useMatching";
import type { MatchSuggestion } from "@/types/matching.types";

const AIMatchesPage: React.FC = () => {
  const router = useRouter();
  const [likedMatches, setLikedMatches] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    suggestions: matches = [],
    isLoading,
    error,
    refetch,
  } = useMatching();

  useEffect(() => {
    if (matches.length) {
      const likedIds = matches
        .filter((m: MatchSuggestion) => m.status === "liked" || m.status === "mutual")
        .map((m: MatchSuggestion) => m.targetUserId || m.targetUser?.userId)
        .filter((id): id is string => Boolean(id));
      setLikedMatches(new Set(likedIds));
    }
  }, [matches]);

  const handleMessage = (userId: string) => router.push(`/messages?userId=${userId}`);
  const handleViewProfile = (userId: string) => router.push(`/profile/user-profile/${userId}`);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-50 dark:bg-slate-900">
        <div className="p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="mx-auto max-w-6xl">
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
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs text-gray-900 bg-gray-100 border-gray-300 cursor-pointer sm:text-sm dark:text-white dark:bg-white/10 dark:border-white/20 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 sm:w-4 sm:h-4 sm:mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>

            <div className="mb-5 text-center sm:mb-6">
              <div className="flex justify-center items-center mb-2 sm:mb-3">
                <div className="flex-shrink-0 p-2 mr-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md sm:p-2.5 sm:mr-3 sm:rounded-2xl">
                  <Heart className="w-6 h-6 text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">AI Matches</h1>
              </div>
              <p className="px-4 text-sm text-gray-600 sm:text-base lg:text-lg dark:text-gray-400">
                {isLoading
                  ? "Loading matches..."
                  : matches.length === 0
                    ? "No matches found yet. Try refreshing your suggestions."
                    : `${matches.length} matches found for you`}
              </p>
            </div>

            <div className="p-5 rounded-xl border-2 shadow-xl backdrop-blur-sm sm:p-6 sm:rounded-2xl lg:p-8 border-purple-200/50 bg-white/90 dark:bg-slate-800/90 dark:border-purple-500/30">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <Loader2 className="mb-4 w-12 h-12 text-purple-600 animate-spin sm:w-16 sm:h-16 dark:text-purple-400" />
                  <p className="text-base font-medium text-gray-600 sm:text-lg dark:text-gray-400">Loading your matches...</p>
                  <p className="mt-2 text-xs text-gray-500 sm:text-sm dark:text-gray-500">Checking compatibility insights</p>
                </div>
              ) : error ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-red-50 rounded-xl sm:p-6 dark:bg-red-900/20">
                    <p className="text-base font-semibold text-red-600 sm:text-lg dark:text-red-400">
                      Failed to load AI matches
                    </p>
                    <p className="mt-1 text-xs text-red-500 sm:text-sm dark:text-red-400">
                      {errorMessage}
                    </p>
                  </div>
                  <Button onClick={handleRefresh} variant="outline" className="text-xs text-purple-600 border-purple-500 sm:text-sm hover:bg-purple-50">
                    Try Again
                  </Button>
                </div>
              ) : matches.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-12 sm:py-16">
                  <div className="p-5 mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full sm:p-6 dark:from-purple-900/30 dark:to-pink-900/30">
                    <Heart className="w-12 h-12 text-pink-500 sm:w-16 sm:h-16 dark:text-pink-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                    No Matches Yet
                  </h3>
                  <p className="px-4 mb-6 max-w-md text-sm text-center text-gray-600 sm:text-base dark:text-gray-400">
                    Refresh your suggestions or fine-tune your preferences to find collaborators faster.
                  </p>
                  <Button onClick={handleRefresh} className="text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Refresh Suggestions
                  </Button>
                </div>
              ) : (
                <MatchHistoryGallery
                  historyMatches={matches}
                  likedMatches={likedMatches}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIMatchesPage;
