"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import { useMatching } from "@/hooks/features/useMatching";
import { profileApi, type ProfileByUsernameResponse } from "@/lib/api/profile.api";
import type { CreatorProfile, MatchSuggestion } from "@/types/matching.types";

const DEFAULT_PROFILE_STATS = {
  totalFollowers: 0,
  avgEngagement: 0,
  platformBreakdown: {},
};

type AIMatchesDisplayProfile = CreatorProfile & {
  age?: number;
};

/** Messaging / profile target: the other user in the suggestion (prefer API `targetUserId`). */
const getMatchUserId = (match: MatchSuggestion) =>
  match.targetUserId ||
  match.targetUser?.userId ||
  (match.targetUser as { id?: string } | undefined)?.id ||
  match.userId;

const getMatchUsername = (match: MatchSuggestion) => match.targetUser?.username?.trim() || "";

const parseAgeValue = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const numericAge = Number.parseInt(value, 10);
    if (Number.isFinite(numericAge) && numericAge > 0) {
      return numericAge;
    }

    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
      const ageFromDate = new Date().getFullYear() - parsedDate.getFullYear();
      return ageFromDate > 0 ? ageFromDate : undefined;
    }
  }

  return undefined;
};

const extractProfileAge = (profile?: Record<string, unknown>): number | undefined => {
  if (!profile) {
    return undefined;
  }

  return (
    parseAgeValue(profile.age) ||
    parseAgeValue(profile.birthDate) ||
    parseAgeValue(profile.dateOfBirth) ||
    parseAgeValue(profile.dob)
  );
};

const getPublicProfileForMatch = async (
  match: MatchSuggestion
): Promise<ProfileByUsernameResponse | undefined> => {
  const username = getMatchUsername(match);

  if (username) {
    try {
      return await profileApi.getProfileByUsername(username);
    } catch (error) {
      console.warn(`Failed to fetch profile for @${username}:`, error);
    }
  }

  return undefined;
};

const buildDisplayProfile = (
  match: MatchSuggestion,
  publicProfile?: ProfileByUsernameResponse
): AIMatchesDisplayProfile => {
  const existingProfile = match.targetUser;
  const userId = getMatchUserId(match);
  const username = publicProfile?.username || existingProfile?.username || "";
  const displayName =
    publicProfile?.displayName || existingProfile?.displayName || username || userId || "Unknown Creator";
  const stats = existingProfile?.stats;
  const age =
    extractProfileAge(publicProfile as Record<string, unknown> | undefined) ||
    extractProfileAge(existingProfile as Record<string, unknown> | undefined);

  return {
    userId,
    username,
    displayName,
    avatar: publicProfile?.avatar || existingProfile?.avatar,
    bio: publicProfile?.bio ?? existingProfile?.bio,
    niche: publicProfile?.niche || existingProfile?.niche || [],
    location: publicProfile?.location || existingProfile?.location,
    stats: {
      totalFollowers: stats?.totalFollowers ?? DEFAULT_PROFILE_STATS.totalFollowers,
      avgEngagement: stats?.avgEngagement ?? DEFAULT_PROFILE_STATS.avgEngagement,
      platformBreakdown: stats?.platformBreakdown ?? {},
    },
    socialLinks: publicProfile?.socialLinks || existingProfile?.socialLinks,
    rizzScore: publicProfile?.profileRizzScore ?? existingProfile?.rizzScore,
    isPublic: existingProfile?.isPublic ?? true,
    isActive: existingProfile?.isActive ?? true,
    ...(age ? { age } : {}),
  };
};

const enrichMatchWithProfile = async (match: MatchSuggestion): Promise<MatchSuggestion> => {
  const profileData = await getPublicProfileForMatch(match);

  return {
    ...match,
    targetUser: buildDisplayProfile(match, profileData),
  };
};

const AIMatchesPage: React.FC = () => {
  const router = useRouter();
  const [displayMatches, setDisplayMatches] = useState<MatchSuggestion[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);

  const {
    suggestions: matches = [],
    isLoading,
    error,
    refetch,
  } = useMatching();

  useEffect(() => {
    let isCancelled = false;

    const syncMatches = async () => {
      if (!matches.length) {
        setDisplayMatches((currentMatches) => (currentMatches.length ? [] : currentMatches));
        setIsEnriching(false);
        return;
      }

      setIsEnriching(true);

      const enrichedMatches = await Promise.all(matches.map(enrichMatchWithProfile));

      if (!isCancelled) {
        setDisplayMatches(enrichedMatches);
        setIsEnriching(false);
      }
    };

    syncMatches();

    return () => {
      isCancelled = true;
    };
  }, [matches]);

  const handleMessage = (match: MatchSuggestion) => {
    const userId = getMatchUserId(match);

    if (userId && userId !== "undefined") {
      router.push(`/messages?userId=${encodeURIComponent(userId)}`);
      return;
    }

    console.error("User ID not found. Match payload:", match);
  };

  const resolveAndNavigateToProfile = async (match: MatchSuggestion) => {
    const username = match.targetUser?.username?.trim();

    if (username) {
      const cleanUsername = username.startsWith("@") ? username.slice(1) : username;
      router.push(`/profile/@${cleanUsername}`);
      return;
    }

    const userId = getMatchUserId(match);

    if (!userId) {
      console.error("Unable to resolve profile navigation target. Match payload:", match);
      return;
    }

    try {
      const profileData = await profileApi.getPublicProfileByIdentifier(userId);
      const resolvedUsername = profileData.username?.trim();

      if (resolvedUsername) {
        const cleanUsername = resolvedUsername.startsWith("@")
          ? resolvedUsername.slice(1)
          : resolvedUsername;
        router.push(`/profile/@${cleanUsername}`);
        return;
      }
    } catch (error) {
      console.warn(`Failed to resolve profile route for user ${userId}:`, error);
    }

    console.error("Unable to navigate to public profile because username could not be resolved.", match);
  };

  const handleViewProfile = (match: MatchSuggestion) => {
    void resolveAndNavigateToProfile(match);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPageLoading = isLoading || (matches.length > 0 && isEnriching && displayMatches.length === 0);

  let content: React.ReactNode;
  if (isPageLoading) {
    content = (
      <div className="flex min-h-90 flex-col items-center justify-center rounded-4xl border border-fuchsia-200/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1a1227]/80 dark:shadow-none">
        <Loader2 className="mb-4 h-14 w-14 animate-spin text-fuchsia-400" />
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Loading your top matches...</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Gathering compatibility signals and bios.</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="rounded-4xl border border-red-300/60 bg-white/90 p-8 shadow-sm backdrop-blur dark:border-red-500/20 dark:bg-[#1a1227]/85 dark:shadow-none">
        <p className="text-lg font-semibold text-red-600 dark:text-red-300">Failed to load AI matches</p>
        <p className="mt-2 text-sm text-red-500/90 dark:text-red-200/80">{errorMessage}</p>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="mt-5 border-red-300/60 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-100 dark:hover:bg-red-500/20 dark:hover:text-white"
        >
          Try Again
        </Button>
      </div>
    );
  } else if (displayMatches.length === 0) {
    content = (
      <div className="flex min-h-90 flex-col items-center justify-center rounded-4xl border border-fuchsia-200/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1a1227]/80 dark:shadow-none">
        <div className="mb-4 rounded-full bg-linear-to-br from-fuchsia-500/20 to-pink-500/20 p-5">
          <Sparkles className="h-12 w-12 text-fuchsia-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Matches Yet</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
          Refresh your suggestions and we&apos;ll pull in more creators that fit your style.
        </p>
      </div>
    );
  } else {
    content = (
      <MatchHistoryGallery
        historyMatches={displayMatches}
        onMessage={handleMessage}
        onViewProfile={handleViewProfile}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-full bg-white dark:bg-slate-900 dark:text-white">
        <div className="relative overflow-hidden p-4 pb-16 lg:p-6 lg:pb-34">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-80 " />
            <div className="absolute right-0 top-32 h-72 w-72 rounded-full " />
            <div className="absolute left-0 top-56 h-80 w-80 rounded-full " />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex items-center justify-between gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              className="border-fuchsia-200 bg-white/80 text-slate-700 hover:bg-fuchsia-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              className="border-fuchsia-300/50 bg-white/80 text-fuchsia-700 hover:bg-fuchsia-50 hover:text-fuchsia-800 dark:border-fuchsia-400/20 dark:bg-white/5 dark:text-fuchsia-100 dark:hover:bg-fuchsia-500/10 dark:hover:text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <div className="mb-8 max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-linear-to-br from-fuchsia-500 to-pink-500 p-3 shadow-[0_12px_35px_-10px_rgba(217,70,239,0.8)]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-500 dark:text-fuchsia-300/80">
                    HyperBuds AI
                  </p>
                  <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                    Top AI Matches
                  </h1>
                </div>
              </div>
              <p className="text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
                Our neural engine found these matches for you.
              </p>
            </div>

            {content}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIMatchesPage;
