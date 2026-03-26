"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from "lucide-react";
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

const getMatchUserId = (match: MatchSuggestion) =>
  match.targetUser?.userId ||
  (match.targetUser as { id?: string } | undefined)?.id ||
  match.targetUserId ||
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
      router.push(`/messages?userId=${userId}`);
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

  return (
    <div className="min-h-full bg-[#140b1f] text-white">
      <div className="relative overflow-hidden p-4 pb-16 lg:p-6 lg:pb-34">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.18),_transparent_60%)]" />
          <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-fuchsia-500/8 blur-3xl" />
          <div className="absolute left-0 top-56 h-80 w-80 rounded-full bg-pink-500/6 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-fuchsia-400/20 bg-white/5 text-fuchsia-100 hover:bg-fuchsia-500/10 hover:text-white"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="mb-8 max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-500 p-3 shadow-[0_12px_35px_-10px_rgba(217,70,239,0.8)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-300/80">
                  HyperBuds AI
                </p>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Top AI Matches
                </h1>
              </div>
            </div>
            <p className="text-base leading-7 text-slate-300 sm:text-lg">
              Our neural engine found these souls for you.
            </p>
          </div>

          {isPageLoading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-[#1a1227]/80 p-8 text-center shadow-[0_24px_80px_-36px_rgba(192,38,211,0.6)] backdrop-blur">
              <Loader2 className="mb-4 h-14 w-14 animate-spin text-fuchsia-400" />
              <p className="text-lg font-semibold text-white">Loading your top matches...</p>
              <p className="mt-2 text-sm text-slate-400">Gathering compatibility signals and bios.</p>
            </div>
          ) : error ? (
            <div className="rounded-[32px] border border-red-500/20 bg-[#1a1227]/85 p-8 shadow-[0_24px_80px_-36px_rgba(239,68,68,0.45)] backdrop-blur">
              <p className="text-lg font-semibold text-red-300">Failed to load AI matches</p>
              <p className="mt-2 text-sm text-red-200/80">{errorMessage}</p>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="mt-5 border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-white"
              >
                Try Again
              </Button>
            </div>
          ) : displayMatches.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-[#1a1227]/80 p-8 text-center shadow-[0_24px_80px_-36px_rgba(192,38,211,0.6)] backdrop-blur">
              <div className="mb-4 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 p-5">
                <Sparkles className="h-12 w-12 text-fuchsia-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">No Matches Yet</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
                Refresh your suggestions and we&apos;ll pull in more creators that fit your style.
              </p>
            </div>
          ) : (
            <MatchHistoryGallery
              historyMatches={displayMatches}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMatchesPage;
