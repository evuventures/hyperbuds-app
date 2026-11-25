'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface BrandChallengeRule {
  stepNumber: number;
  title: string;
  instruction: string;
}

interface BrandChallengePublicItem {
  id: string;
  brandName: string;
  title: string;
  brief: string;
  hashtag: string;
  trendingTags: string[];
  region: string;
  promoUrl?: string | null;
  promoLabel?: string | null;
  rules: BrandChallengeRule[];
  totalPoolCredits: number;
  remainingPoolCredits: number;
  rewardCreditsPerCreator: number;
  rewardRizzBoost: number;
  externalPrizeNote?: string | null;
  participantsCount: number;
  myEntry?: {
    id: string;
    status: 'joined' | 'verified' | string;
    postId?: string | null;
    rewardedCredits?: number;
  } | null;
}

export function BrandChallengesDiscoverySection() {
  const [items, setItems] = useState<BrandChallengePublicItem[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadChallenges = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/brand-challenges?page=${targetPage}&limit=10`);
      setItems(Array.isArray(res.data?.challenges) ? res.data.challenges : []);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch {
      // Non-fatal fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenges(page);
  }, [page, loadChallenges]);

  const handleJoin = async (ch: BrandChallengePublicItem) => {
    setBusyId(`join:${ch.id}`);
    try {
      await apiClient.post(`/brand-challenges/${encodeURIComponent(ch.id)}/join`);
      toast.success(`You hopped on #${ch.hashtag}! Post a Reel or Post with #${ch.hashtag}, then tap Verify.`);
      await loadChallenges(page);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        'Could not join Brand Challenge.';
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const handleVerify = async (ch: BrandChallengePublicItem) => {
    setBusyId(`verify:${ch.id}`);
    try {
      const res = await apiClient.post(`/brand-challenges/${encodeURIComponent(ch.id)}/verify`);
      const credits = Number(res.data?.rewardedCredits ?? 0);
      const rizz = Number(res.data?.rewardedRizz ?? 0);
      toast.success(
        credits > 0
          ? `Verified! You earned +${credits} Credits & +${rizz} Rizz Score!`
          : `Post verified! +${rizz} Rizz Score unlocked!`,
        { duration: 6000 },
      );
      await loadChallenges(page);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        `Publish a Post or Reel with #${ch.hashtag} first, then tap Verify!`;
      toast.error(msg, { duration: 6000 });
    } finally {
      setBusyId(null);
    }
  };

  const handleCopyTags = async (ch: BrandChallengePublicItem) => {
    const tagsText = [ch.hashtag, ...(ch.trendingTags || []).filter((t) => t !== ch.hashtag).slice(0, 4)]
      .map((t) => `#${t}`)
      .join(' ');
    try {
      await navigator.clipboard.writeText(tagsText);
      toast.success(`Copied ${tagsText}`);
    } catch {
      toast.error('Could not copy hashtags.');
    }
  };

  const handlePromoClick = (ch: BrandChallengePublicItem) => {
    void apiClient.post(`/brand-challenges/${encodeURIComponent(ch.id)}/click`, {}).catch(() => null);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200/80 bg-white p-4 shadow-xs dark:border-purple-900/50 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Sponsored Brand Challenge Pools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Are you a Brand or Marketer? Launch an AI-drafted or manual challenge and track 1,000+ micro-influencers.
          </p>
        </div>
        <Link
          href="/brand/challenges"
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-500"
        >
          <Building2 className="h-3.5 w-3.5" />
          Open Brand Challenge Studio
        </Link>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      ) : items.length === 0 ? null : (
        <div className="space-y-4">
          {items.map((ch) => {
            const joined = Boolean(ch.myEntry);
            const verified = ch.myEntry?.status === 'verified';
            return (
              <article
                key={ch.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                        <Building2 className="h-3 w-3" />
                        {ch.brandName}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        #{ch.hashtag}
                      </span>
                      {ch.rewardCreditsPerCreator > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          <Zap className="h-3 w-3" />+{ch.rewardCreditsPerCreator} Credits · +{ch.rewardRizzBoost} Rizz ({ch.remainingPoolCredits} CR left in pool)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          +{ch.rewardRizzBoost} Rizz {ch.externalPrizeNote ? `· ${ch.externalPrizeNote}` : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{ch.title}</h3>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{ch.brief}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopyTags(ch)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Hashtags
                    </button>
                    {ch.promoUrl && (
                      <a
                        href={ch.promoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handlePromoClick(ch)}
                        className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300"
                      >
                        {ch.promoLabel || 'Visit Brand'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {ch.rules?.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {ch.rules.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {i + 1}. {r.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{r.instruction}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    {ch.participantsCount} creator{ch.participantsCount === 1 ? '' : 's'} hopped on
                  </span>

                  {verified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified &amp; Rewarded
                    </span>
                  ) : !joined ? (
                    <button
                      type="button"
                      disabled={busyId === `join:${ch.id}`}
                      onClick={() => void handleJoin(ch)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-purple-500 disabled:opacity-50"
                    >
                      {busyId === `join:${ch.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      Hop On Challenge
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/dashboard"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                      >
                        Post with #{ch.hashtag}
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === `verify:${ch.id}`}
                        onClick={() => void handleVerify(ch)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {busyId === `verify:${ch.id}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Verify Post &amp; Claim Reward
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-slate-500">
                Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-40 dark:border-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <button
                  type="button"
                  disabled={!pagination.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold disabled:opacity-40 dark:border-slate-700"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
