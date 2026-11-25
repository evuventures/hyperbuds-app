'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { BrandActivationCard } from '@/components/brand/BrandActivationCard';
import { BrandChallengeCreatorForm } from '@/components/brand/BrandChallengeCreatorForm';
import apiClient from '@/lib/api/client';
import { formatCompactCount } from '@/lib/utils/formatCount';
import toast from 'react-hot-toast';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Coins,
  Eye,
  Heart,
  MousePointerClick,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

interface BrandChallengeRow {
  id: string;
  brandName: string;
  title: string;
  brief: string;
  creationMode: 'ai' | 'manual';
  hashtag: string;
  region: string;
  promoUrl?: string | null;
  totalPoolCredits: number;
  remainingPoolCredits: number;
  rewardCreditsPerCreator: number;
  externalPrizeNote?: string | null;
  status: 'active' | 'paused' | 'completed';
  participantsCount: number;
  verifiedCount: number;
  totalViews: number;
  totalEngagements: number;
  totalClicks: number;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export default function BrandChallengesStudioPage() {
  const [loading, setLoading] = useState(true);
  const [isBrand, setIsBrand] = useState(false);
  const [primaryBrandName, setPrimaryBrandName] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [aiCost, setAiCost] = useState(500);
  const [regions, setRegions] = useState<Array<{ code: string; label: string }>>([]);

  const [challenges, setChallenges] = useState<BrandChallengeRow[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 8,
    total: 0,
    pages: 1,
    hasMore: false,
  });

  const loadWorkspaceAndList = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const wsRes = await apiClient.get('/brand-challenges/workspace');
      const ws = wsRes.data || {};
      const brandAllowed = Boolean(ws.isBrand);
      setIsBrand(brandAllowed);
      setPrimaryBrandName(ws.primaryBrandName || '');
      setWalletBalance(Number(ws.walletBalanceCredits ?? 0));
      setAiCost(Number(ws.aiDraftCostCredits ?? 500));
      setRegions(Array.isArray(ws.regions) ? ws.regions : []);

      if (brandAllowed) {
        const listRes = await apiClient.get(`/brand-challenges?mine=true&page=${targetPage}&limit=8`);
        setChallenges(Array.isArray(listRes.data?.challenges) ? listRes.data.challenges : []);
        if (listRes.data?.pagination) {
          setPagination(listRes.data.pagination);
        }
      }
    } catch {
      toast.error('Unable to load Brand Studio.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspaceAndList(page);
  }, [page, loadWorkspaceAndList]);

  const handleToggleStatus = async (ch: BrandChallengeRow) => {
    const next = ch.status === 'active' ? 'paused' : 'active';
    try {
      await apiClient.put(`/brand-challenges/${encodeURIComponent(ch.id)}/status`, { status: next });
      toast.success(`Challenge ${next === 'active' ? 'resumed' : 'paused'}.`);
      await loadWorkspaceAndList(page);
    } catch {
      toast.error('Could not update challenge status.');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {loading && !isBrand ? (
            <div className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ) : !isBrand ? (
            <BrandActivationCard onActivated={() => void loadWorkspaceAndList(1)} />
          ) : (
            <>
              {/* Brand Hero Banner */}
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0F7A] via-[#5B21B6] to-[#1E0A3C] p-6 text-white shadow-lg sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-purple-100">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                      Brand Partner Workspace · {primaryBrandName || 'Brand'}
                    </span>
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      Brand Challenge Studio &amp; Analytics
                    </h1>
                    <p className="mt-1.5 text-sm text-purple-100/85">
                      Draft viral micro-influencer challenges with AI ({aiCost} Credits) or build manually for free, fund verified reward pools, and inspect every creator&apos;s views, engagements, and click-through rates.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="rounded-2xl border border-white/15 bg-black/25 px-4 py-2.5 backdrop-blur-xs">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-200">
                        Wallet Balance
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-lg font-extrabold tabular-nums">
                        <Coins className="h-4 w-4 text-amber-300" />
                        {walletBalance.toLocaleString()} CR
                      </p>
                    </div>
                    <Link
                      href="/payments/wallet"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-purple-900 shadow-xs transition hover:bg-purple-50"
                    >
                      <Wallet className="h-4 w-4" />
                      Top Up Credits
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dual-Mode Challenge Creator (AI 500 CR vs Manual Free) */}
              <BrandChallengeCreatorForm
                primaryBrandName={primaryBrandName}
                walletBalanceCredits={walletBalance}
                aiDraftCostCredits={aiCost}
                regions={regions}
                onBalanceChange={setWalletBalance}
                onCreated={() => {
                  setPage(1);
                  void loadWorkspaceAndList(1);
                }}
              />

              {/* Paginated My Brand Challenges List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Your Brand Challenges ({pagination.total})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Open any campaign to view full creator-by-creator analytics, views, engagements, and post click rates.
                    </p>
                  </div>
                </div>

                {challenges.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                    <BarChart3 className="mx-auto h-9 w-9 text-purple-500" />
                    <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                      No Brand Challenges launched yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Use the AI Generator or Manual Builder above to publish your first micro-influencer challenge.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {challenges.map((ch) => {
                      const ctr =
                        ch.totalViews > 0 ? ((ch.totalClicks / ch.totalViews) * 100).toFixed(1) : '0.0';
                      return (
                        <article
                          key={ch.id}
                          className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                    ch.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  {ch.status}
                                </span>
                                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                                  #{ch.hashtag}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase">
                                  {ch.creationMode === 'ai' ? 'AI Drafted' : 'Manual'} · {ch.region}
                                </span>
                              </div>
                            </div>

                            <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">
                              {ch.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                              {ch.brief}
                            </p>

                            {/* Quick 4-Metric Row */}
                            <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/50">
                              <div>
                                <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                                  <Users className="h-3 w-3 text-pink-500" /> Joined
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                  {formatCompactCount(ch.participantsCount)}
                                </p>
                              </div>
                              <div>
                                <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                                  <Eye className="h-3 w-3 text-emerald-500" /> Views
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                  {formatCompactCount(ch.totalViews)}
                                </p>
                              </div>
                              <div>
                                <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                                  <Heart className="h-3 w-3 text-purple-500" /> Eng.
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                  {formatCompactCount(ch.totalEngagements)}
                                </p>
                              </div>
                              <div>
                                <p className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
                                  <MousePointerClick className="h-3 w-3 text-orange-500" /> CTR
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                                  {ctr}%
                                </p>
                              </div>
                            </div>

                            <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {ch.totalPoolCredits > 0 ? (
                                <>
                                  Pool:{' '}
                                  <strong className="text-slate-800 dark:text-slate-200">
                                    {ch.remainingPoolCredits}/{ch.totalPoolCredits} CR
                                  </strong>{' '}
                                  left ({ch.rewardCreditsPerCreator} CR/creator)
                                </>
                              ) : (
                                <span>{ch.externalPrizeNote || 'Rizz & Brand Leaderboard Challenge'}</span>
                              )}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(ch)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              {ch.status === 'active' ? (
                                <>
                                  <PauseCircle className="h-3.5 w-3.5" /> Pause
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="h-3.5 w-3.5" /> Resume
                                </>
                              )}
                            </button>

                            <Link
                              href={`/brand/challenges/${encodeURIComponent(ch.id)}/analytics`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-500"
                            >
                              <BarChart3 className="h-3.5 w-3.5" />
                              Campaign Analytics
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-slate-500 dark:text-slate-400">
                      Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong> ({pagination.total} challenges)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Prev
                      </button>
                      <button
                        type="button"
                        disabled={!pagination.hasMore}
                        onClick={() => setPage((p) => p + 1)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        Next <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
