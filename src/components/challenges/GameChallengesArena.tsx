'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  ChallengeShareCardModal,
  type ShareableGameSummary,
} from './ChallengeShareCardModal';
import toast from 'react-hot-toast';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Copy,
  Flame,
  Hash,
  Loader2,
  Plus,
  Radio,
  Share2,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface GameRound {
  id: string;
  roundNumber: number;
  title: string;
  scenario: string;
  proofType: 'reel_hashtag' | 'live_session' | 'interactive';
  completed: boolean;
}

interface GameChallengeRecord {
  id: string;
  gameMode: string;
  region: string;
  difficulty: 'chill' | 'hustle' | 'boss';
  title: string;
  premise: string;
  hashtag: string;
  trendingTags: string[];
  rounds: GameRound[];
  twist?: { title: string; instruction: string; bonusRizz: number } | null;
  twistUnlocked: boolean;
  rewardCredits: number;
  rewardRizzBoost: number;
  status: 'active' | 'completed';
  modelVersion?: string;
}

interface GameCatalogItem {
  id: string;
  name: string;
  tagline: string;
}

interface RegionOption {
  code: string;
  label: string;
  currencyHint: string;
}

export function GameChallengesArena() {
  const { user } = useAuth();
  const [region, setRegion] = useState('NG');
  const [selectedMode, setSelectedMode] = useState('lagos_life');
  const [difficulty, setDifficulty] = useState<'chill' | 'hustle' | 'boss'>('hustle');
  const [customTheme, setCustomTheme] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [expandedGameIds, setExpandedGameIds] = useState<Set<string>>(new Set());

  const [dailyDrop, setDailyDrop] = useState<{
    title: string;
    premise: string;
    hashtag: string;
    rewardCredits: number;
    rewardRizzBoost: number;
    participantsCount: number;
    region: string;
  } | null>(null);
  const [dailyJoinedId, setDailyJoinedId] = useState<string | null>(null);
  const [joiningDaily, setJoiningDaily] = useState(false);
  const [shareGame, setShareGame] = useState<ShareableGameSummary | null>(null);

  const [catalog, setCatalog] = useState<GameCatalogItem[]>([]);
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [games, setGames] = useState<GameChallengeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafting, setDrafting] = useState(false);
  const [verifyingKey, setVerifyingKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadGames = useCallback(async (targetRegion: string) => {
    setLoading(true);
    try {
      const [res, dailyRes] = await Promise.all([
        apiClient.get(`/challenges/games?region=${encodeURIComponent(targetRegion)}`),
        apiClient.get(`/challenges/daily?region=${encodeURIComponent(targetRegion)}`).catch(() => null),
      ]);
      setGames(Array.isArray(res.data?.gameChallenges) ? res.data.gameChallenges : []);
      setCatalog(Array.isArray(res.data?.catalog) ? res.data.catalog : []);
      setRegions(Array.isArray(res.data?.regions) ? res.data.regions : []);
      setTrendingTags(Array.isArray(res.data?.trending?.tags) ? res.data.trending.tags : []);
      if (dailyRes?.data?.daily) setDailyDrop(dailyRes.data.daily);
      setDailyJoinedId(dailyRes?.data?.joinedChallengeId ?? null);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGames(region);
  }, [region, loadGames]);

  const handleJoinDailyDrop = async () => {
    setJoiningDaily(true);
    try {
      const res = await apiClient.post('/challenges/daily/join', { region });
      if (res.data?.gameChallenge) {
        setDailyJoinedId(res.data.gameChallenge.id);
        if (!res.data?.alreadyJoined) {
          setGames((prev) => [res.data.gameChallenge, ...prev]);
          setDailyDrop((prev) =>
            prev ? { ...prev, participantsCount: prev.participantsCount + 1 } : prev,
          );
        }
        toast.success("Joined today's drop! Start Round 1 below.");
      }
    } catch {
      toast.error('Could not join daily drop.');
    } finally {
      setJoiningDaily(false);
    }
  };

  const handleDraftGame = async () => {
    setDrafting(true);
    try {
      const res = await apiClient.post('/challenges/games/draft', {
        gameMode: selectedMode,
        region,
        difficulty,
        customTheme: customTheme.trim() || undefined,
      });
      if (res.data?.gameChallenge) {
        setGames((prev) => [res.data.gameChallenge, ...prev]);
        setCustomTheme('');
        setShowBuilder(false);
        toast.success('New AI challenge ready!');
      }
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Could not draft challenge');
    } finally {
      setDrafting(false);
    }
  };

  const handleVerifyRound = async (challengeId: string, roundId: string) => {
    const key = `${challengeId}:${roundId}`;
    setVerifyingKey(key);
    try {
      const res = await apiClient.post(
        `/challenges/games/${encodeURIComponent(challengeId)}/rounds/${encodeURIComponent(roundId)}/verify`,
      );
      const { rounds, twistUnlocked, status, newlyCompleted, rewardCredits, rewardRizzBoost } =
        res.data || {};
      setGames((prev) =>
        prev.map((g) =>
          g.id === challengeId
            ? {
                ...g,
                rounds: Array.isArray(rounds) ? rounds : g.rounds,
                twistUnlocked: Boolean(twistUnlocked),
                status: status === 'completed' ? 'completed' : g.status,
              }
            : g,
        ),
      );
      if (newlyCompleted) {
        toast.success(
          `Challenge Cleared! You earned +${rewardCredits} Credits & +${rewardRizzBoost} Rizz Score!`,
          { duration: 6000 },
        );
      } else {
        toast.success('Round verified!');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Complete the round proof first, then tap Verify.';
      toast.error(msg, { duration: 6000 });
    } finally {
      setVerifyingKey(null);
    }
  };

  const handleCopyTags = (game: GameChallengeRecord) => {
    const text = (game.trendingTags || [game.hashtag]).map((t) => `#${t.replace(/^#/, '')}`).join(' ');
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(game.id);
      toast.success('Hashtags copied!');
      window.setTimeout(() => setCopiedId(null), 1600);
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedGameIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const modeCatalog =
    catalog.length > 0
      ? catalog
      : [
          { id: 'lagos_life', name: 'Lagos Life', tagline: 'Real-world hustle scenarios & twists.' },
          { id: 'budget_hustle', name: 'Budget Hustle', tagline: 'Viral creation on a tight budget.' },
          { id: 'hot_seat', name: '60s Hot Seat', tagline: 'Rapid-fire niche takes & trivia.' },
          { id: 'impostor_live', name: 'Impostor Live', tagline: 'Live Studio mafia with polls.' },
          { id: 'pass_the_mic', name: 'Pass the Mic', tagline: 'Viral Reel chain with @mentions.' },
        ];

  return (
    <div className="space-y-6">
      {/* 1. Primary Spotlight: Today's Featured Drop */}
      {dailyDrop && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                  <Flame className="h-3.5 w-3.5" />
                  Today&apos;s Drop
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {dailyDrop.participantsCount} playing
                </span>
                <span>·</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +{dailyDrop.rewardCredits} cr · +{dailyDrop.rewardRizzBoost} Rizz
                </span>
              </div>
              <h2 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                {dailyDrop.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{dailyDrop.premise}</p>
            </div>

            <button
              type="button"
              disabled={joiningDaily || Boolean(dailyJoinedId)}
              onClick={() => void handleJoinDailyDrop()}
              className={`shrink-0 cursor-pointer rounded-xl px-5 py-2.5 text-xs font-semibold transition ${
                dailyJoinedId
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {dailyJoinedId ? 'Joined Today ✓' : joiningDaily ? 'Joining…' : 'Join Today’s Drop'}
            </button>
          </div>
        </section>
      )}

      {/* 2. Section Header + Collapsible Custom Game Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Your Active Games ({games.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Complete rounds in order to unlock rewards and your shareable card.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBuilder((v) => !v)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 transition hover:border-purple-400 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          {showBuilder ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 text-purple-600" />}
          {showBuilder ? 'Close Builder' : 'Create Custom Game'}
        </button>
      </div>

      {/* 3. Progressive Disclosure: Custom AI Game Builder (Only shown when opened) */}
      {showBuilder && (
        <section className="space-y-4 rounded-2xl border border-purple-200 bg-white p-5 shadow-xs dark:border-purple-900/50 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Draft a Custom AI Challenge
            </h3>
            <select
              aria-label="Challenge region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {(regions.length > 0
                ? regions
                : [
                    { code: 'NG', label: 'Nigeria · Lagos', currencyHint: '₦5k–₦10k' },
                    { code: 'GLOBAL', label: 'Global Trending', currencyHint: '$10–$15' },
                  ]
              ).map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 1: Game Format */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              1. Pick a Format
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {modeCatalog.map((mode) => {
                const active = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                        : 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold">{mode.name}</p>
                    <p
                      className={`mt-1 line-clamp-2 text-[11px] ${
                        active ? 'text-white/75 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {mode.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Difficulty & Optional Topic */}
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="flex items-center gap-1.5 sm:col-span-5">
              {(
                [
                  { id: 'chill', label: 'Chill (+5 cr)' },
                  { id: 'hustle', label: 'Hustle (+10 cr)' },
                  { id: 'boss', label: 'Boss (+25 cr)' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`flex-1 cursor-pointer rounded-lg border py-2 text-[11px] font-semibold transition ${
                    difficulty === d.id
                      ? 'border-purple-600 bg-purple-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <input
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              maxLength={140}
              placeholder="Optional topic or trend..."
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:col-span-4"
            />

            <button
              type="button"
              disabled={drafting}
              onClick={() => void handleDraftGame()}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50 sm:col-span-3"
            >
              {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {drafting ? 'Drafting…' : 'Draft Game'}
            </button>
          </div>

          {/* Optional Quick Trend Chips (max 6, low visual noise) */}
          {trendingTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Trending:</span>
              {trendingTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCustomTheme(`Incorporate #${tag}`)}
                  className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] text-slate-600 hover:border-purple-400 hover:text-purple-700 dark:border-slate-700 dark:text-slate-300"
                >
                  <Hash className="h-2.5 w-2.5 text-purple-500" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. Active & Completed Games — Clean Focus on Next Action */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <Flame className="mx-auto h-9 w-9 text-purple-500" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            Ready to start your first game?
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            Join Today&apos;s Drop above or tap Create Custom Game to generate a 3-round creator challenge.
          </p>
          <button
            type="button"
            onClick={() => setShowBuilder(true)}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Custom Game
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const doneCount = game.rounds.filter((r) => r.completed).length;
            const totalRounds = game.rounds.length || 3;
            const pct = Math.round((doneCount / totalRounds) * 100);
            const nextRound = game.rounds.find((r) => !r.completed) || null;
            const isExpanded = expandedGameIds.has(game.id);
            const visibleRounds = isExpanded ? game.rounds : nextRound ? [nextRound] : [];

            return (
              <article
                key={game.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Clean Top Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                        {game.gameMode.replace(/_/g, ' ')}
                      </span>
                      <span>·</span>
                      <span>#{game.hashtag.replace(/^#/, '')}</span>
                      <span>·</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        +{game.rewardCredits} cr · +{game.rewardRizzBoost} Rizz
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                      {game.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{game.premise}</p>
                  </div>

                  {/* Compact Utility Actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyTags(game)}
                      title="Copy hashtags"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {copiedId === game.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>Tags</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setShareGame({
                          id: game.id,
                          gameMode: game.gameMode,
                          region: game.region,
                          difficulty: game.difficulty,
                          title: game.title,
                          premise: game.premise,
                          hashtag: game.hashtag,
                          trendingTags: game.trendingTags || [game.hashtag],
                          completedRounds: doneCount,
                          totalRounds,
                          rewardCredits: game.rewardCredits,
                          rewardRizzBoost: game.rewardRizzBoost,
                          username:
                            user?.username ||
                            (user as { profile?: { username?: string } } | null)?.profile?.username,
                          avatar:
                            user?.avatar ||
                            (user as { profile?: { avatar?: string } } | null)?.profile?.avatar,
                        })
                      }
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {game.status === 'completed'
                        ? 'All rounds completed'
                        : `Round ${Math.min(doneCount + 1, totalRounds)} of ${totalRounds}`}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                      {doneCount}/{totalRounds}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-purple-600 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Focused Next Round (or All Rounds when expanded) */}
                {visibleRounds.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    {visibleRounds.map((r) => {
                      const busy = verifyingKey === `${game.id}:${r.id}`;
                      return (
                        <div
                          key={r.id}
                          className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                            r.completed
                              ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15'
                              : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="mt-0.5 shrink-0">
                              {r.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-purple-500" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Round {r.roundNumber}: {r.title}
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                {r.scenario}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {game.gameMode === 'impostor_live' && !r.completed && (
                              <Link
                                href="/streaming"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                              >
                                <Radio className="h-3.5 w-3.5 text-purple-600" />
                                Studio
                              </Link>
                            )}
                            {!r.completed && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void handleVerifyRound(game.id, r.id)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                              >
                                {busy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Zap className="h-3.5 w-3.5" />
                                )}
                                {r.proofType === 'reel_hashtag'
                                  ? `Verify #${game.hashtag.replace(/^#/, '')}`
                                  : r.proofType === 'live_session'
                                    ? 'Verify Live'
                                    : 'Complete Round'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Unlocked Twist (only shown when unlocked, reducing noise) + Expand All Rounds toggle */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
                  {game.twist && game.twistUnlocked ? (
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Plot Twist: <span className="font-normal">{game.twist.instruction}</span>
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {game.twist ? 'Complete Round 1 to unlock the plot twist' : ''}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpanded(game.id)}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {isExpanded ? (
                      <>
                        Hide rounds <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        View all {totalRounds} rounds <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ChallengeShareCardModal game={shareGame} onClose={() => setShareGame(null)} />
    </div>
  );
}
