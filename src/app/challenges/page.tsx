'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { GameChallengesArena } from '@/components/challenges/GameChallengesArena';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  Award,
  CheckCircle2,
  Circle,
  Flame,
  Gamepad2,
  Loader2,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

interface DuoMilestone {
  id: string;
  title: string;
  description: string;
  completedByUserA: boolean;
  completedByUserB: boolean;
}

interface PartnerSummary {
  userId: string;
  matchId?: string | null;
  displayName: string;
  username: string;
  avatar: string;
  niche: string[];
}

interface DuoChallengeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  rewardCredits: number;
  rewardRizzBoost: number;
  status: 'active' | 'completed';
  isUserA: boolean;
  partner: PartnerSummary;
  milestones: DuoMilestone[];
  expiresAt?: string;
  completedAt?: string;
}

interface CommunityChallengeItem {
  id: string;
  title: string;
  description?: string;
  rewardCredits: number;
  status: string;
  remainingCredits?: number;
}

export default function ChallengesPage() {
  const [tab, setTab] = useState<'games' | 'duo' | 'community'>('games');
  const [duoChallenges, setDuoChallenges] = useState<DuoChallengeItem[]>([]);
  const [suggestedPartners, setSuggestedPartners] = useState<PartnerSummary[]>([]);
  const [communityChallenges, setCommunityChallenges] = useState<CommunityChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [duoRes, commRes] = await Promise.all([
        apiClient.get('/challenges/duo').catch(() => null),
        apiClient.get('/challenges').catch(() => null),
      ]);
      setDuoChallenges(Array.isArray(duoRes?.data?.duoChallenges) ? duoRes.data.duoChallenges : []);
      setSuggestedPartners(
        Array.isArray(duoRes?.data?.suggestedPartners) ? duoRes.data.suggestedPartners : [],
      );
      setCommunityChallenges(
        Array.isArray(commRes?.data?.challenges) ? commRes.data.challenges : [],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleGenerateDuo = async (partner: PartnerSummary) => {
    setGeneratingFor(partner.userId);
    try {
      await apiClient.post('/challenges/duo/generate', {
        partnerUserId: partner.userId,
        matchId: partner.matchId || undefined,
      });
      toast.success(`AI Grow Together Challenge started with ${partner.displayName}!`);
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Could not start Duo Challenge.');
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleToggleMilestone = async (challengeId: string, milestoneId: string) => {
    const key = `${challengeId}:${milestoneId}`;
    setTogglingKey(key);
    try {
      const res = await apiClient.post(
        `/challenges/duo/${encodeURIComponent(challengeId)}/milestones/${encodeURIComponent(milestoneId)}/toggle`,
      );
      const { milestones, status, newlyCompleted, rewardCredits, rewardRizzBoost } = res.data || {};
      setDuoChallenges((prev) =>
        prev.map((ch) =>
          ch.id === challengeId
            ? {
                ...ch,
                milestones: Array.isArray(milestones) ? milestones : ch.milestones,
                status: status === 'completed' ? 'completed' : ch.status,
              }
            : ch,
        ),
      );
      if (newlyCompleted) {
        toast.success(
          `🎉 Duo Challenge Completed! You & your match earned +${rewardCredits} Credits & +${rewardRizzBoost} Rizz Score!`,
          { duration: 6000 },
        );
      } else {
        toast.success('Step verified & completed!');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Complete this action on HyperBuds first, then tap Verify & Complete.';
      toast.error(msg, { duration: 6000 });
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header Hero */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0F7A] via-[#5B21B6] to-[#1E0A3C] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-purple-100 backdrop-blur-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Grow Together · AI Match Challenges
                </span>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Creator Challenges
                </h1>
                <p className="mt-1.5 text-sm text-purple-100/85">
                  Team up with your AI Matches on personalized 7-day collaboration sprints to grow your audiences together and earn Wallet Credits + Rizz Score boosts.
                </p>
              </div>
              <Link
                href="/ai-matches"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-purple-900 shadow-sm transition hover:bg-purple-50"
              >
                <Users className="h-4 w-4" />
                Find New Matches
              </Link>
            </div>

            {/* Tabs */}
            <div className="mt-6 inline-flex flex-wrap rounded-full bg-black/25 p-1">
              <button
                type="button"
                onClick={() => setTab('games')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'games'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-purple-100 hover:text-white'
                }`}
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                AI Games (Lagos Life &amp; More)
              </button>
              <button
                type="button"
                onClick={() => setTab('duo')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'duo'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-purple-100 hover:text-white'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Grow Together Duos ({duoChallenges.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('community')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'community'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-purple-100 hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" />
                Community &amp; Brand ({communityChallenges.length})
              </button>
            </div>
          </div>

          {tab === 'games' ? (
            <GameChallengesArena />
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : tab === 'duo' ? (
            <div className="space-y-6">
              {/* Start a New AI Duo Challenge with Your Matches */}
              {suggestedPartners.length > 0 && (
                <section className="rounded-2xl border border-purple-200/80 bg-white p-5 shadow-xs dark:border-purple-900/50 dark:bg-slate-900">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        Start a Grow Together Challenge with a Match
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        AI tailors a 7-day collab sprint based on both of your niches.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {suggestedPartners.map((partner) => (
                      <div
                        key={partner.userId}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-3">
                          {partner.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={partner.avatar}
                              alt={partner.displayName}
                              className="h-11 w-11 rounded-full border-2 border-purple-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                              {partner.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                              {partner.displayName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {partner.niche.slice(0, 2).join(' · ') || 'Matched Creator'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={generatingFor === partner.userId}
                          onClick={() => void handleGenerateDuo(partner)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                        >
                          {generatingFor === partner.userId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {generatingFor === partner.userId
                            ? 'Generating AI Sprint...'
                            : 'Start AI Duo Challenge'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Active & Completed Duo Challenges */}
              {duoChallenges.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <Sparkles className="mx-auto h-10 w-10 text-purple-500" />
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                    No Duo Challenges yet
                  </h3>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                    Match with a creator in AI Matchmaking, then launch a personalized 7-day Grow Together Challenge to earn +25 Credits &amp; +5 Rizz Score together.
                  </p>
                  <Link
                    href="/ai-matches"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500"
                  >
                    Explore AI Matches
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {duoChallenges.map((ch) => {
                    const totalSteps = ch.milestones.length * 2;
                    const doneSteps = ch.milestones.reduce(
                      (acc, m) => acc + (m.completedByUserA ? 1 : 0) + (m.completedByUserB ? 1 : 0),
                      0,
                    );
                    const pct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

                    return (
                      <article
                        key={ch.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {ch.partner.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={ch.partner.avatar}
                                alt={ch.partner.displayName}
                                className="h-12 w-12 rounded-2xl border-2 border-purple-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-base font-bold text-white">
                                {ch.partner.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                    ch.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  }`}
                                >
                                  {ch.status === 'completed' ? '✓ Completed' : `${ch.durationDays}-Day Duo Sprint`}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                  <Zap className="h-3 w-3" />+{ch.rewardCredits} Credits · +{ch.rewardRizzBoost} Rizz
                                </span>
                              </div>
                              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                                {ch.title}
                              </h3>
                              <p className="text-xs text-slate-500">
                                With{' '}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {ch.partner.displayName}
                                </span>
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/messages?userId=${encodeURIComponent(ch.partner.userId)}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
                            Message Partner
                          </Link>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{ch.description}</p>

                        {/* Shared Progress Bar */}
                        <div className="mt-4">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Shared Duo Progress
                            </span>
                            <span className="font-bold text-purple-700 dark:text-purple-300 tabular-nums">
                              {pct}% ({doneSteps}/{totalSteps})
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* Shared 3-Milestone Checklist */}
                        <div className="mt-4 space-y-2.5">
                          {ch.milestones.map((m) => {
                            const mineDone = ch.isUserA ? m.completedByUserA : m.completedByUserB;
                            const partnerDone = ch.isUserA ? m.completedByUserB : m.completedByUserA;
                            const busy = togglingKey === `${ch.id}:${m.id}`;

                            return (
                              <button
                                key={m.id}
                                type="button"
                                disabled={busy || ch.status === 'completed'}
                                onClick={() => void handleToggleMilestone(ch.id, m.id)}
                                className={`flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition ${
                                  mineDone
                                    ? 'border-purple-200 bg-purple-50/50 dark:border-purple-900/50 dark:bg-purple-950/20'
                                    : 'border-slate-200 bg-white hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="mt-0.5 text-purple-600 dark:text-purple-400">
                                    {busy ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : mineDone ? (
                                      <CheckCircle2 className="h-5 w-5 fill-purple-600 text-white dark:fill-purple-500" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                    )}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                      {m.title}
                                    </p>
                                    {m.description && (
                                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {m.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] font-semibold">
                                  <span
                                    className={`rounded-full px-2 py-0.5 ${
                                      mineDone
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                    }`}
                                  >
                                    {mineDone ? 'Verified ✓' : 'Verify & Complete'}
                                  </span>
                                  <span
                                    className={`rounded-full px-2 py-0.5 ${
                                      partnerDone
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}
                                  >
                                    Partner {partnerDone ? '✓' : '·'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {communityChallenges.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                  <Award className="mx-auto h-10 w-10 text-purple-500" />
                  <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                    No Brand or Community Challenges Open Right Now
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Check back soon for funded brand prize pools — or start a Grow Together Duo Challenge with your AI Matches!
                  </p>
                </div>
              ) : (
                communityChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                        +{c.rewardCredits} Credits Reward
                      </span>
                      <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                        {c.title}
                      </h3>
                      {c.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
