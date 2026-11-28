"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Globe2, Heart, Loader2, MessageCircle, RefreshCw, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { CardGridSkeleton } from "@/components/ui/AppSkeletons";
import { AiMatchStudioPanel } from "@/components/matching/AiMatchStudioPanel";
import { Button } from "@/components/ui/button";
import MatchHistoryGallery from "@/components/matching/MatchHistoryGallery";
import { useMatching } from "@/hooks/features/useMatching";
import { useNotificationSocket } from "@/hooks/features/useNotificationSocket";
import { profileApi, type ProfileByUsernameResponse } from "@/lib/api/profile.api";
import apiClient from "@/lib/api/client";
import type { CreatorProfile, MatchSuggestion } from "@/types/matching.types";

interface ExternalCreatorCard {
  _id: string;
  platform: string;
  handle: string;
  displayName: string;
  niche?: string[];
  followersEstimate?: number;
  compatibilityScore?: number;
  rizzEstimateV2?: number | null;
  rizzTier?: string | null;
  claimStatus: 'unclaimed' | 'pending_verification' | 'claimed';
  sourceUrl?: string;
}

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
  const existingProfile = match.targetUser || (match as unknown as { targetProfile?: CreatorProfile })?.targetProfile;
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
  // If targetUser or targetProfile already contains profile details, avoid redundant network requests
  const existingProfile = match.targetUser || (match as unknown as { targetProfile?: CreatorProfile })?.targetProfile;
  if (existingProfile?.avatar && (existingProfile?.displayName || existingProfile?.username)) {
    return {
      ...match,
      targetUser: buildDisplayProfile(match),
    };
  }

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
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'external' | 'prompt'>('matches');
  const [incomingRequests, setIncomingRequests] = useState<MatchSuggestion[]>([]);
  const [mutualMatches, setMutualMatches] = useState<MatchSuggestion[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [externalCreators, setExternalCreators] = useState<ExternalCreatorCard[]>([]);
  const [provenance, setProvenance] = useState<string>('local_heuristic_fallback');
  const [externalLoading, setExternalLoading] = useState(false);
  const [claimProofById, setClaimProofById] = useState<Record<string, string>>({});
  const [extBanner, setExtBanner] = useState<string | null>(null);

  const loadMatchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await apiClient.get<{
        incoming?: MatchSuggestion[];
        mutual?: MatchSuggestion[];
      }>('/matching/requests');
      setIncomingRequests(Array.isArray(res.data?.incoming) ? res.data.incoming : []);
      setMutualMatches(Array.isArray(res.data?.mutual) ? res.data.mutual : []);
    } catch {
      // Non-fatal
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t === 'requests' || t === 'external' || t === 'prompt' || t === 'matches') {
        setActiveTab(t);
      }
    }
    void loadMatchRequests();
  }, [loadMatchRequests]);

  // Real-time refresh when another creator matches with you or accepts your match
  useNotificationSocket({
    enabled: true,
    showToast: false,
    onNewNotification: (notif) => {
      if (notif?.type === 'match') {
        void loadMatchRequests();
      }
    },
  });

  const loadExternalCreators = useCallback(async () => {
    setExternalLoading(true);
    try {
      const res = await apiClient.get('/matching/external?limit=12');
      setExternalCreators(Array.isArray(res.data?.creators) ? res.data.creators : []);
      if (res.data?.provenance) setProvenance(res.data.provenance);
    } catch {
      setExternalCreators([]);
    } finally {
      setExternalLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExternalCreators();
  }, [loadExternalCreators]);

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

  const handleLikeMatch = async (match: MatchSuggestion) => {
    const actionTargetId = getMatchUserId(match) || match._id || match.id;
    if (!actionTargetId) return;
    try {
      const res = await apiClient.put(`/matching/matches/${encodeURIComponent(actionTargetId)}/action`, {
        action: "like",
      });
      const isMutual = Boolean(res.data?.isMutual);
      const nextStatus: MatchSuggestion["status"] = isMutual ? "mutual" : "liked";
      setDisplayMatches((prev) =>
        prev.map((m) =>
          getMatchUserId(m) === actionTargetId || m._id === match._id
            ? { ...m, status: nextStatus }
            : m
        )
      );
      if (isMutual) {
        toast.success(
          `It's a Match with ${match.targetUser?.displayName || match.targetUser?.username || "this creator"}! 🎉`
        );
      } else {
        toast.success(
          `Liked ${match.targetUser?.displayName || match.targetUser?.username || "creator"}! They've been notified to match back.`
        );
      }
      void loadMatchRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send match request.");
    }
  };

  const handlePassMatch = async (match: MatchSuggestion) => {
    const actionTargetId = getMatchUserId(match) || match._id || match.id;
    setDisplayMatches((prev) =>
      prev.filter((m) => getMatchUserId(m) !== actionTargetId && m._id !== match._id)
    );
    setIncomingRequests((prev) =>
      prev.filter((m) => getMatchUserId(m) !== actionTargetId && m._id !== match._id)
    );
    if (!actionTargetId) return;
    try {
      await apiClient.put(`/matching/matches/${encodeURIComponent(actionTargetId)}/action`, {
        action: "pass",
      });
    } catch {
      // Optimistically dismissed
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), loadMatchRequests()]);
    setIsRefreshing(false);
  };

  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPageLoading = isLoading || (matches.length > 0 && isEnriching && displayMatches.length === 0);

  let content: React.ReactNode;
  if (isPageLoading) {
    content = <CardGridSkeleton count={6} columns={3} darkSurface />;
  } else if (error) {
    content = (
      <div className="rounded-3xl border border-rose-500/25 bg-[#1b121c]/80 p-8 shadow-[0_24px_80px_-36px_rgba(239,68,68,0.4)] backdrop-blur-xl">
        <p role="alert" className="text-lg font-semibold text-rose-300">
          Failed to load AI matches
        </p>
        <p className="mt-2 text-sm text-rose-200/80">{errorMessage}</p>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="mt-5 rounded-full border-rose-400/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25 hover:text-white"
        >
          Try Again
        </Button>
      </div>
    );
  } else if (displayMatches.length === 0) {
    content = (
      <div className="flex min-h-90 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
        <div className="mb-4 rounded-full bg-linear-to-br from-blue-500/25 to-purple-500/25 p-5 ring-1 ring-white/10">
          <Sparkles className="h-12 w-12 text-indigo-300" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Matches Yet</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-300/80 sm:text-base">
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
        onLike={handleLikeMatch}
        onPass={handlePassMatch}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-full overflow-hidden bg-[#121318] text-white">
        {/* Ambient glowing electric-purple + cobalt-blue radial background */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden lg:absolute">
          <div className="absolute -left-24 top-16 h-[420px] w-[420px] rounded-full bg-[#7c3aed]/20 blur-[145px]" />
          <div className="absolute right-[-60px] top-[34%] h-[460px] w-[460px] rounded-full bg-[#2563eb]/25 blur-[155px]" />
          <div className="absolute bottom-[-80px] left-[22%] h-[420px] w-[420px] rounded-full bg-[#4f46e5]/20 blur-[145px]" />
        </div>

        <div className="relative z-10 px-4 py-6 pb-20 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="rounded-full border-white/15 bg-white/[0.06] text-slate-200 backdrop-blur-md hover:bg-white/[0.14] hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-full border-indigo-400/25 bg-indigo-500/15 text-indigo-200 backdrop-blur-md hover:bg-indigo-500/25 hover:text-white"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Two-column editorial header matching persona showcase */}
            <div className="mb-8 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-[#2563eb] to-[#7c3aed] px-3.5 py-1 text-xs font-semibold text-white shadow-md shadow-blue-600/25">
                  Creator Discovery
                </span>
                <h1 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                  <span className="text-white">Find your </span>
                  <span className="block text-[#8ea5ff]">next collaborator</span>
                </h1>
              </div>

              <div className="lg:col-span-5 flex flex-col lg:items-end gap-3">
                <p className="text-sm leading-relaxed text-slate-300/85 sm:text-base lg:text-right">
                  Explore creators suggested from your profile, Empire Builder engine, and opt-in public claim index.
                </p>
                <div className="inline-flex flex-wrap rounded-full border border-white/15 bg-white/[0.05] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('matches')}
                    className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                      activeTab === 'matches' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    AI Matches
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('requests')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition ${
                      activeTab === 'requests' ? 'bg-pink-600 text-white' : 'text-pink-200 hover:text-white'
                    }`}
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    Requests
                    {incomingRequests.length > 0 && (
                      <span className="ml-0.5 rounded-full bg-white px-1.5 py-0.2 text-[10px] font-bold text-pink-600">
                        {incomingRequests.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('external')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition ${
                      activeTab === 'external' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Globe2 className="h-3.5 w-3.5" />
                    External AI Match
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('prompt')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition ${
                      activeTab === 'prompt' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-amber-200 hover:text-white'
                    }`}
                  >
                    ✨ Prompt Match ($10)
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'matches' ? (
              content
            ) : activeTab === 'requests' ? (
              <div className="space-y-8">
                <section className="rounded-3xl border border-pink-400/25 bg-white/[0.04] p-6 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Creators Who Want to Match With You ({incomingRequests.length})
                      </h2>
                      <p className="text-xs text-slate-300/80">
                        Tap Match Back to make it mutual, unlock messaging, and publish your Match Card.
                      </p>
                    </div>
                  </div>

                  {requestsLoading ? (
                    <CardGridSkeleton count={3} columns={3} darkSurface />
                  ) : incomingRequests.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-sm text-slate-300">
                      No pending match requests right now. When a creator matches with you, they&apos;ll appear here in real time!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {incomingRequests.map((reqItem) => {
                        const prof = reqItem.targetUser;
                        const name = prof?.displayName || prof?.username || 'Creator';
                        return (
                          <div
                            key={reqItem._id || reqItem.targetUserId}
                            className="flex flex-col justify-between rounded-2xl border border-pink-400/25 bg-[#181a24]/90 p-5"
                          >
                            <div>
                              <div className="flex items-center gap-3">
                                {prof?.avatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={prof.avatar}
                                    alt={name}
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-pink-500/40"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-pink-500 to-purple-600 text-base font-bold text-white">
                                    {name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-white">{name}</p>
                                  <p className="truncate text-xs text-slate-400">@{prof?.username || 'creator'}</p>
                                </div>
                                <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-bold text-pink-200">
                                  {reqItem.compatibilityScore}% fit
                                </span>
                              </div>
                              {prof?.bio && (
                                <p className="mt-3 line-clamp-2 text-xs text-slate-300">{prof.bio}</p>
                              )}
                              {Array.isArray(prof?.niche) && prof.niche.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1">
                                  {prof.niche.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-indigo-200"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => void handleLikeMatch(reqItem)}
                                className="flex-1 cursor-pointer rounded-full bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 text-xs font-semibold text-white hover:opacity-95"
                              >
                                <Heart className="mr-1.5 h-3.5 w-3.5 fill-current" />
                                Match Back
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={`View ${name}'s profile`}
                                onClick={() => handleViewProfile(reqItem)}
                                className="h-9 w-9 cursor-pointer rounded-full border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                              >
                                <UserRound className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                aria-label={`Pass on ${name}`}
                                onClick={() => void handlePassMatch(reqItem)}
                                className="h-9 w-9 cursor-pointer rounded-full border border-white/10 text-slate-300 hover:bg-rose-500/20 hover:text-rose-200"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-emerald-400/20 bg-white/[0.04] p-6 backdrop-blur-xl">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-white">
                      Mutual Matches ({mutualMatches.length})
                    </h2>
                    <p className="text-xs text-slate-300/80">
                      Creators who matched back — start messaging or launch a Grow Together Duo Challenge.
                    </p>
                  </div>

                  {mutualMatches.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-slate-300">
                      No mutual matches yet. Match with creators in AI Matches or accept incoming requests above!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {mutualMatches.map((m) => {
                        const prof = m.targetUser;
                        const name = prof?.displayName || prof?.username || 'Creator';
                        return (
                          <div
                            key={m._id || m.targetUserId}
                            className="flex flex-col justify-between rounded-2xl border border-emerald-400/25 bg-[#181a24]/90 p-5"
                          >
                            <div className="flex items-center gap-3">
                              {prof?.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={prof.avatar}
                                  alt={name}
                                  className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/40"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-base font-bold text-white">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-white">{name}</p>
                                <p className="truncate text-xs text-emerald-300">{m.compatibilityScore}% Mutual Match 🎉</p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleMessage(m)}
                                className="flex-1 cursor-pointer rounded-full bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                                Message
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => router.push('/challenges')}
                                className="cursor-pointer rounded-full border-white/15 bg-white/5 text-xs text-white hover:bg-white/15"
                              >
                                Duo Challenge
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            ) : activeTab === 'prompt' ? (
              <AiMatchStudioPanel mode="prompt" />
            ) : (
              <div className="space-y-6">
                <AiMatchStudioPanel mode="external" />
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-xs backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>
                      Engine provenance: <strong className="text-white">{provenance.replace(/_/g, ' ')}</strong> · Opt-in verification only (no automated unsolicited DMs).
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={async () => {
                      setExtBanner(null);
                      try {
                        const res = await apiClient.post('/matching/external/analyze', { limit: 12 });
                        setExternalCreators(Array.isArray(res.data?.creators) ? res.data.creators : []);
                        setExtBanner(`External creator discovery analyzed (${res.data?.creditsCharged ?? 5} credits).`);
                      } catch (err) {
                        setExtBanner(err instanceof Error ? err.message : 'Unable to analyze external creators.');
                      }
                    }}
                    className="rounded-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Analyze External Matches (5 cr)
                  </Button>
                </div>

                {extBanner && (
                  <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-4 py-3 text-xs text-indigo-100">
                    {extBanner}
                  </div>
                )}

                {externalLoading ? (
                  <CardGridSkeleton count={3} columns={3} darkSurface />
                ) : externalCreators.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-slate-300">
                    No indexed external creators match your current filters yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {externalCreators.map((ext) => (
                      <div
                        key={ext._id}
                        className="rounded-2xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-xl space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-200">
                              {ext.platform} · @{ext.handle}
                            </span>
                            <h3 className="mt-1.5 text-base font-semibold text-white">{ext.displayName}</h3>
                          </div>
                          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                            {ext.compatibilityScore ?? 75}% fit
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Status: <strong>{ext.claimStatus}</strong> · Est. followers:{' '}
                          {(ext.followersEstimate ?? 0).toLocaleString()}
                        </p>
                        {ext.claimStatus === 'unclaimed' && (
                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <input
                              type="text"
                              value={claimProofById[ext._id] || ''}
                              onChange={(e) =>
                                setClaimProofById((prev) => ({ ...prev, [ext._id]: e.target.value }))
                              }
                              placeholder="Enter bio verification code (e.g. HB-PROOF)"
                              className="w-full rounded-lg border border-white/15 bg-black/30 px-2.5 py-1.5 text-xs text-white"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await apiClient.post(`/profiles/claim/${ext._id}`, {
                                      verificationMethod: 'bio_token',
                                      verificationProof: claimProofById[ext._id] || '',
                                    });
                                    setExtBanner(`Claim verified for @${ext.handle}`);
                                    await loadExternalCreators();
                                  } catch (err) {
                                    setExtBanner(err instanceof Error ? err.message : 'Claim verification failed.');
                                  }
                                }}
                                className="flex-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                              >
                                Verify & Claim
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiClient.post(`/matching/external/${ext._id}/block`);
                                  setExternalCreators((prev) => prev.filter((item) => item._id !== ext._id));
                                }}
                                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                              >
                                Hide
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIMatchesPage;