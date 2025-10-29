"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2, Heart, Users } from "lucide-react";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import { useMatchHistory } from "@/hooks/features/useMatching";
import type { CreatorProfile } from "@/types/matching.types";

const AIMatchesPage: React.FC = () => {
  const router = useRouter();
  const [likedMatches, setLikedMatches] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch, isRefetching } = useMatchHistory({
    status: "all",
    limit: 50,
    sortBy: "compatibility",
    sortOrder: "desc",
  });

  const matches = data?.matches || [];

  // Track liked matches
  useEffect(() => {
    if (matches.length) {
      const likedIds = matches
        .filter((m) => m.status === "liked" || m.status === "mutual")
        .map((m) => m.targetProfile?.userId)
        .filter((id): id is string => Boolean(id));
      setLikedMatches(new Set(likedIds));
    }
  }, [matches]);

  const handleMessage = (userId: string) => router.push(`/messages?userId=${userId}`);
  const handleViewProfile = (userId: string) => router.push(`/profile/user-profile/${userId}`);
  const refreshMatches = async () => refetch();

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-slate-900">
        <div className="flex justify-between mb-4">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={refreshMatches} disabled={isRefetching} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-2">AI Matches</h1>
        <p className="mb-6 text-gray-600">
          {isLoading ? "Loading matches..." : matches.length === 0 ? "No matches found yet" : `${matches.length} matches found`}
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <p>No matches yet. Update your profile preferences!</p>
            <Button onClick={() => router.push("/profile/edit")} className="mt-4">Complete Profile</Button>
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
    </DashboardLayout>
  );
};

export default AIMatchesPage;
