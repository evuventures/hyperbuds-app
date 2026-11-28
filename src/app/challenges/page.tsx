'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { GameChallengesArena } from '@/components/challenges/GameChallengesArena';
import { BrandChallengesDiscoverySection } from '@/components/challenges/BrandChallengesDiscoverySection';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
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
  const [tab, setTab] = useState<'games' | 'duo' | 'brand'>('games');
  const [duoChallenges, setDuoChallenges] = useState<DuoChallengeItem[]>([]);
  const [suggestedPartners, setSuggestedPartners] = useState<PartnerSummary[]>([]);
  const [communityChallenges, setCommunityChallenges] = useState<CommunityChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t === 'duo' || t === 'brand' || t === 'games') {
      setTab(t);
    } else if (t === 'community') {
      setTab('brand');
    }
  }, []);

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
      toast.success(`Duo Sprint started with ${partner.displayName}!`);
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Could not start Duo Sprint.');
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
          `Duo Sprint Completed! You & your match earned +${rewardCredits} Credits & +${rewardRizzBoost} Rizz Score!`,
          { duration: 6000 },
        );
      } else {
        toast.success('Step verified & completed!');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Complete this action on HyperBuds first, then tap Verify.';
      toast.error(msg, { duration: 6000 });
    } finally {
      setTogglingKey(null);
    }
  };

  const activeDuoCount = duoChallenges.filter((c) => c.status === 'active').length;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Clean, Uncluttered Page Header */}
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Challenges
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Play creator games, sprint with your matches, or hop on brand prize pools.
              </p>
            </div>
            <Link
              href="/ai-matches"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Users className="h-3.5 w-3.5 text-purple-600" />
              Find Matches
            </Link>
          </header>

          {/* Simple 3-Way Segmented Switcher */}
          <nav
            aria-label="Challenge categories"
            className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setTab('games')}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                tab === 'games'
                  ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="h-4 w-4 shrink-0" />
              <span>Daily &amp; Games</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('duo')}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                tab === 'duo'
                  ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Flame className="h-4 w-4 shrink-0" />
              <span>With a Match</span>
              {(activeDuoCount > 0 || suggestedPartners.length > 0) && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    tab === 'duo'
                      ? 'bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                  }`}
                >
                  {activeDuoCount || suggestedPartners.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTab('brand')}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                tab === 'brand'
                  ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Trophy className="h-4 w-4 shrink-0" />
              <span>Brand Pools</span>
            </button>
          </nav>

          {/* Tab Content */}
          {tab === 'games' ? (
            <GameChallengesArena />
          ) : loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : tab === 'duo' ? (
            <div className="space-y-6">
              {/* Active & Completed Duo Sprints */}
              {duoChallenges.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Your Duo Sprints
                  </h2>
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
                        className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {ch.partner.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={ch.partner.avatar}
                                alt={ch.partner.displayName}
                                className="h-11 w-11 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                                {ch.partner.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                {ch.title}
                              </h3>
                              <p className="text-xs text-slate-500">
                                With <span className="font-medium text-slate-700 dark:text-slate-300">{ch.partner.displayName}</span>
                                {' · '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  +{ch.rewardCredits} cr &amp; +{ch.rewardRizzBoost} Rizz
                                </span>
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/messages?userId=${encodeURIComponent(ch.partner.userId)}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
                            Chat
                          </Link>
                        </div>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{ch.description}</p>

                        {/* Clean Progress Bar */}
                        <div className="mt-4">
                          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                            <span>{ch.status === 'completed' ? 'Completed' : `${ch.durationDays}-day sprint`}</span>
                            <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                              {pct}% ({doneSteps}/{totalSteps})
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full rounded-full bg-purple-600 transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* 3 Clean Checklist Steps */}
                        <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
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
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-default dark:hover:bg-slate-800/50"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span className="mt-0.5 shrink-0">
                                    {busy ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                                    ) : mineDone ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                    )}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {m.title}
                                    </p>
                                    {m.description && (
                                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {m.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2 text-[11px]">
                                  <span className="text-slate-400">
                                    Partner {partnerDone ? '✓' : '·'}
                                  </span>
                                  <span
                                    className={`rounded-lg px-2.5 py-1 font-semibold ${
                                      mineDone
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        : 'bg-purple-600 text-white'
                                    }`}
                                  >
                                    {mineDone ? 'Done' : 'Verify'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </section>
              )}

              {/* Start a Sprint with a Match */}
              {suggestedPartners.length > 0 ? (
                <section className="space-y-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Ready to Sprint With
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pick a match to launch a quick 7-day collaboration sprint (+25 cr &amp; +5 Rizz).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {suggestedPartners.map((partner) => (
                      <div
                        key={partner.userId}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {partner.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={partner.avatar}
                              alt={partner.displayName}
                              className="h-10 w-10 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                              {partner.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
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
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
                        >
                          {generatingFor === partner.userId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {generatingFor === partner.userId ? 'Starting…' : 'Start'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : duoChallenges.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                  <Sparkles className="mx-auto h-9 w-9 text-purple-500" />
                  <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                    No Duo Sprints yet
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                    Match with a creator first, then team up on a 7-day sprint to grow together and earn +25 Credits.
                  </p>
                  <Link
                    href="/ai-matches"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                  >
                    Find a Match
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              <BrandChallengesDiscoverySection />

              {communityChallenges.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Community Bounties
                  </h2>
                  {communityChallenges.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Zap className="h-3.5 w-3.5" />+{c.rewardCredits} Credits
                        </span>
                        <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                          {c.title}
                        </h3>
                        {c.description && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
