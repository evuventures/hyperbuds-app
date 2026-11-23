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
  Circle,
  Copy,
  Flame,
  Gamepad2,
  Globe,
  Hash,
  Loader2,
  Radio,
  Share2,
  Sparkles,
  Users,
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
  const [trendSource, setTrendSource] = useState<string>('');
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
      setTrendSource(String(res.data?.trending?.source || ''));
      if (dailyRes?.data?.daily) setDailyDrop(dailyRes.data.daily);
      setDailyJoinedId(dailyRes?.data?.joinedChallengeId ?? null);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinDailyDrop = async () => {
    setJoiningDaily(true);
    try {
      const res = await apiClient.post('/challenges/daily/join', { region });
      if (res.data?.gameChallenge) {
        setDailyJoinedId(res.data.gameChallenge.id);
        if (!res.data?.alreadyJoined) {
          setGames((prev) => [res.data.gameChallenge, ...prev]);
          setDailyDrop((prev) => (prev ? { ...prev, participantsCount: prev.participantsCount + 1 } : prev));
        }
        toast.success("Joined today's featured drop!");
      }
    } catch {
      toast.error('Could not join daily drop.');
    } finally {
      setJoiningDaily(false);
    }
  };

  useEffect(() => {
    void loadGames(region);
  }, [region, loadGames]);

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
        toast.success('AI Game Master drafted a fresh dynamic challenge!');
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
        toast.success('Round verified! Plot twist unlocked.');
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
      toast.success('Trending hashtags copied!');
      window.setTimeout(() => setCopiedId(null), 1600);
    });
  };

  return (
    <div className="space-y-6">
      {/* Daily Featured Drop Banner (Shared Cultural Moment) */}
      {dailyDrop && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-900/50 dark:bg-purple-950/25">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-white">
                  <Flame className="h-3 w-3" />
                  Today&apos;s Featured Drop · {dailyDrop.region}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Users className="h-3 w-3" />
                  {dailyDrop.participantsCount} creators playing
                </span>
                <span className="text-emerald-700 dark:text-emerald-400">
                  +{dailyDrop.rewardCredits} cr · +{dailyDrop.rewardRizzBoost} Rizz
                </span>
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                {dailyDrop.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{dailyDrop.premise}</p>
            </div>
            <button
              type="button"
              disabled={joiningDaily || Boolean(dailyJoinedId)}
              onClick={() => void handleJoinDailyDrop()}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
                dailyJoinedId
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900'
              }`}
            >
              {dailyJoinedId ? 'Joined Today ✓' : joiningDaily ? 'Joining…' : 'Join Today’s Drop'}
            </button>
          </div>
        </div>
      )}

      {/* Live Regional & Global Trending Hashtags Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Live World &amp; Regional Trends
            </span>
            {trendSource === 'live_rss' || trendSource === 'cached_rss' ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Live Feed
              </span>
            ) : null}
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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

        <div className="mt-3 flex flex-wrap gap-1.5">
          {trendingTags.slice(0, 10).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setCustomTheme(`Incorporate #${tag}`)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <Hash className="h-3 w-3 text-purple-500" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* AI Game Master Builder */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Gamepad2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              AI Game Master · Draft a Dynamic Challenge
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Pick a game format and difficulty. AI weaves live {region} &amp; world trends into 3 playable rounds + a surprise mid-game plot twist.
            </p>
          </div>
        </div>

        {/* 5 Game Mode Cards */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {(catalog.length > 0
            ? catalog
            : [
                { id: 'lagos_life', name: 'Lagos Life', tagline: 'Real-world hustle scenarios & plot twists.' },
                { id: 'budget_hustle', name: 'Budget Hustle', tagline: 'Viral creation on a tight local budget.' },
                { id: 'hot_seat', name: '60s Hot Seat', tagline: 'Rapid-fire niche trivia & culture takes.' },
                { id: 'impostor_live', name: 'Impostor Live', tagline: 'Live Studio mafia with viewer polls.' },
                { id: 'pass_the_mic', name: 'Pass the Mic', tagline: 'Viral Reel chain with @mentions.' },
              ]
          ).map((mode) => {
            const active = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200'
                }`}
              >
                <p className="text-xs font-bold">{mode.name}</p>
                <p
                  className={`mt-1 line-clamp-2 text-[11px] leading-snug ${
                    active ? 'text-white/75 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {mode.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Difficulty + Custom Twist + Draft CTA */}
        <div className="mt-4 grid gap-3 sm:grid-cols-12">
          <div className="flex items-center gap-1.5 sm:col-span-4">
            {(
              [
                { id: 'chill', label: 'Chill · +5 cr' },
                { id: 'hustle', label: 'Hustle · +10 cr' },
                { id: 'boss', label: 'Boss · +25 cr' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`flex-1 rounded-lg border py-2 text-[11px] font-semibold transition ${
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
            placeholder="Optional twist or topic (or click a trending #hashtag above)…"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:col-span-5"
          />

          <button
            type="button"
            disabled={drafting}
            onClick={() => void handleDraftGame()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:col-span-3"
          >
            {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {drafting ? 'Drafting…' : 'Draft Challenge'}
          </button>
        </div>
      </section>

      {/* Active & Completed Game Challenges */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <Flame className="mx-auto h-8 w-8 text-purple-500" />
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            No AI Game Challenges drafted yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Select <span className="font-semibold">Lagos Life</span> or any game above and let the AI Game Master draft your first 3-round challenge.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const doneCount = game.rounds.filter((r) => r.completed).length;
            return (
              <article
                key={game.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-white dark:text-slate-900">
                        {game.gameMode.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        {game.region} · {game.difficulty}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        +{game.rewardCredits} cr · +{game.rewardRizzBoost} Rizz
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      {game.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{game.premise}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShareGame({
                          id: game.id,
                          gameMode: game.gameMode,
                          region: game.region,
                          title: game.title,
                          premise: game.premise,
                          hashtag: game.hashtag,
                          trendingTags: game.trendingTags || [game.hashtag],
                          completedRounds: doneCount,
                          totalRounds: game.rounds.length,
                          rewardCredits: game.rewardCredits,
                          rewardRizzBoost: game.rewardRizzBoost,
                          username:
                            user?.username ||
                            (user as { profile?: { username?: string } } | null)?.profile?.username,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-purple-500"
                    >
                      <Share2 className="h-3 w-3" />
                      Share Card
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyTags(game)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      {copiedId === game.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      Copy Hashtags
                    </button>
                    {game.gameMode === 'impostor_live' && (
                      <Link
                        href="/streaming"
                        className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-purple-500"
                      >
                        <Radio className="h-3 w-3" /> Open Live Studio
                      </Link>
                    )}
                  </div>
                </div>

                {/* Live Trending + Verification Hashtags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(game.trendingTags || [game.hashtag]).map((t, i) => (
                    <span
                      key={`${game.id}-tag-${t}`}
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        i === 0
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      #{t.replace(/^#/, '')}
                    </span>
                  ))}
                </div>

                {/* 3 Playable Rounds */}
                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {game.rounds.map((r) => {
                    const busy = verifyingKey === `${game.id}:${r.id}`;
                    return (
                      <div
                        key={r.id}
                        className={`flex flex-col justify-between rounded-xl border p-3.5 ${
                          r.completed
                            ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                            : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                            <span>ROUND {r.roundNumber}</span>
                            {r.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-300 dark:text-slate-700" />
                            )}
                          </div>
                          <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                            {r.title}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                            {r.scenario}
                          </p>
                        </div>

                        {!r.completed && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleVerifyRound(game.id, r.id)}
                            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                          >
                            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                            {r.proofType === 'reel_hashtag'
                              ? `Verify #${game.hashtag}`
                              : r.proofType === 'live_session'
                                ? 'Verify Live'
                                : 'Complete Round'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mid-Game AI Plot Twist */}
                {game.twist && (
                  <div
                    className={`mt-3 rounded-xl border px-3.5 py-2.5 text-xs ${
                      game.twistUnlocked
                        ? 'border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100'
                        : 'border-dashed border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
                    }`}
                  >
                    <p className="font-bold">
                      {game.twistUnlocked
                        ? `Plot Twist Unlocked: ${game.twist.title}`
                        : `Locked Mid-Game Plot Twist (Complete Round 1 to reveal · ${doneCount}/3 done)`}
                    </p>
                    {game.twistUnlocked && <p className="mt-0.5 text-[11px]">{game.twist.instruction}</p>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ChallengeShareCardModal game={shareGame} onClose={() => setShareGame(null)} />
    </div>
  );
}
