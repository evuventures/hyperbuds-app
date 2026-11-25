'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import {
  BrandChallengeParticipantsTable,
  type BrandChallengeParticipantRow,
} from '@/components/brand/BrandChallengeParticipantsTable';
import apiClient from '@/lib/api/client';
import { formatCompactCount } from '@/lib/utils/formatCount';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Download,
  Eye,
  Heart,
  MousePointerClick,
  RefreshCw,
  Share2,
  Users,
} from 'lucide-react';

type CampaignWindow = '24h' | '7d' | '28d' | 'all';

interface CampaignAnalyticsPayload {
  window: CampaignWindow;
  challenge: {
    id: string;
    brandName: string;
    title: string;
    brief: string;
    hashtag: string;
    region: string;
    promoUrl?: string | null;
    status: string;
  };
  summary: {
    totalParticipants: number;
    verifiedParticipants: number;
    joinedOnlyParticipants: number;
    totalChallengePosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalReposts: number;
    totalBookmarks: number;
    totalEngagements: number;
    engagementRate: number;
    totalClicks: number;
    clickRate: number;
  };
  pool: {
    totalPoolCredits: number;
    remainingPoolCredits: number;
    distributedCredits: number;
    rewardCreditsPerCreator: number;
  };
  series: Array<{
    label: string;
    views: number;
    engagements: number;
    clicks: number;
    posts: number;
  }>;
  participants: BrandChallengeParticipantRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export default function BrandChallengeAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const challengeId = String(params?.id || '');

  const [windowKey, setWindowKey] = useState<CampaignWindow>('28d');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'joined'>('all');
  const [sortBy, setSortBy] = useState<'views' | 'engagements' | 'ctr' | 'recent'>('views');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [data, setData] = useState<CampaignAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadAnalytics = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        window: windowKey,
        page: String(page),
        limit: String(pageSize),
        status: statusFilter,
        sort: sortBy,
      });
      if (debouncedSearch) qs.set('search', debouncedSearch);

      const res = await apiClient.get(`/brand-challenges/${encodeURIComponent(challengeId)}/analytics?${qs.toString()}`);
      setData(res.data);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Unable to load Brand Challenge analytics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [challengeId, windowKey, page, pageSize, statusFilter, sortBy, debouncedSearch]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const s = data?.summary;
  const totalParticipants = s?.totalParticipants ?? 0;
  const verifiedParticipants = s?.verifiedParticipants ?? 0;
  const totalViews = s?.totalViews ?? 0;
  const totalEngagements = s?.totalEngagements ?? 0;
  const totalLikes = s?.totalLikes ?? 0;
  const totalComments = s?.totalComments ?? 0;
  const totalSharesSaves = (s?.totalReposts ?? 0) + (s?.totalBookmarks ?? 0);
  const totalClicks = s?.totalClicks ?? 0;
  const clickRate = s?.clickRate ?? 0;
  const engagementRate = s?.engagementRate ?? 0;

  const actionTotal = Math.max(1, totalLikes + totalComments + totalSharesSaves + totalClicks);
  const breakdownBars = [
    {
      label: 'Likes',
      pct: Math.round((totalLikes / actionTotal) * 100),
      color: 'bg-fuchsia-500',
    },
    {
      label: 'Comments',
      pct: Math.round((totalComments / actionTotal) * 100),
      color: 'bg-emerald-500',
    },
    {
      label: 'Shares/Saves',
      pct: Math.round((totalSharesSaves / actionTotal) * 100),
      color: 'bg-sky-500',
    },
    {
      label: 'Link Clicks',
      pct: Math.round((totalClicks / actionTotal) * 100),
      color: 'bg-orange-500',
    },
  ];

  const rawSeries = data?.series ?? [];
  const trendBars =
    rawSeries.length > 0
      ? rawSeries.slice(-6).map((b) => ({
          label: b.label.length > 6 ? b.label.slice(5) : b.label,
          views: b.views,
          engagements: b.engagements,
          clicks: b.clicks,
        }))
      : [
          { label: 'D1', views: 0, engagements: 0, clicks: 0 },
          { label: 'D2', views: 0, engagements: 0, clicks: 0 },
          { label: 'D3', views: 0, engagements: 0, clicks: 0 },
          { label: 'D4', views: 0, engagements: 0, clicks: 0 },
        ];
  const maxTrendVal = Math.max(1, ...trendBars.map((b) => Math.max(b.views, b.engagements * 3, 1)));
  const peakIdx = trendBars.reduce(
    (best, item, idx, arr) =>
      item.views + item.engagements > arr[best].views + arr[best].engagements ? idx : best,
    0,
  );

  const likesSharePct = Math.round((totalLikes / actionTotal) * 100);
  const commentsSharePct = Math.round(((totalComments + totalSharesSaves) / actionTotal) * 100);
  const clicksSharePct = Math.max(0, 100 - likesSharePct - commentsSharePct);

  const windowLabel =
    windowKey === '24h'
      ? 'Last 24 Hours'
      : windowKey === '7d'
        ? 'Last 7 Days'
        : windowKey === '28d'
          ? 'Last 28 Days'
          : 'All Time';

  const handleExportCsv = () => {
    const rows = [
      [
        'Creator',
        'Username',
        'Status',
        'Posts',
        'Views',
        'Engagements',
        'Engagement Rate %',
        'Post Clicks',
        'Click Rate (CTR) %',
        'Rewarded Credits',
      ],
      ...(data?.participants ?? []).map((p) => [
        p.displayName,
        p.username,
        p.status,
        String(p.postsCount),
        String(p.viewsCount),
        String(p.engagementsCount),
        String(p.engagementRate),
        String(p.clicksCount),
        String(p.clickRate),
        String(p.rewardedCredits),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brand-challenge-${data?.challenge?.hashtag || challengeId}-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported current influencer analytics page to CSV');
  };

  const handleShareCampaign = async () => {
    const shareUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/challenges` : 'https://app.hyperbuds.cloud/challenges';
    const text = `Join the #${data?.challenge?.hashtag || 'HyperBuds'} Brand Challenge by ${
      data?.challenge?.brandName || 'our brand'
    } on HyperBuds! ${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Challenge invite copied to clipboard!');
    } catch {
      toast.error('Unable to copy invite.');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Top Header matching Profile Analytics layout */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/brand/challenges"
                className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Brand Challenges
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {data?.challenge?.title || 'Brand Challenge Analytics'}
                </h1>
                {data?.challenge?.hashtag && (
                  <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    #{data.challenge.hashtag}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Track creators who hopped on, total challenge views, engagements, and per-creator post click-through rates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {(
                  [
                    { id: '24h', label: '24 Hours' },
                    { id: '7d', label: '7 Days' },
                    { id: '28d', label: '28 Days' },
                    { id: 'all', label: 'All Time' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setWindowKey(opt.id);
                      setPage(1);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      windowKey === opt.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => void handleShareCampaign()}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                <Share2 className="h-3.5 w-3.5" />
                Invite Creators
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* 4 KPI Summary Cards (Same Visual Design as Profile Analytics, Brand Campaign Metrics) */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {[
              {
                label: 'Creators Hopped On',
                value: formatCompactCount(totalParticipants),
                sub: `${s?.joinedOnlyParticipants ?? 0} filming · ${verifiedParticipants} verified`,
                badge: `${verifiedParticipants} verified`,
                icon: Users,
                iconBg: 'bg-pink-500',
              },
              {
                label: 'Total Challenge Views',
                value: formatCompactCount(totalViews),
                sub: `${windowLabel}`,
                badge: `${formatCompactCount(s?.totalChallengePosts ?? 0)} posts`,
                icon: Eye,
                iconBg: 'bg-emerald-500',
              },
              {
                label: 'Total Engagements',
                value: formatCompactCount(totalEngagements),
                sub: `${formatCompactCount(totalLikes)} likes · ${formatCompactCount(totalComments)} comments`,
                badge: `${engagementRate}% eng. rate`,
                icon: Heart,
                iconBg: 'bg-purple-500',
              },
              {
                label: 'Post Clicks & CTR',
                value: formatCompactCount(totalClicks),
                sub: data?.challenge?.promoUrl ? 'Tracked destination clicks' : 'Add promo URL to track clicks',
                badge: `${clickRate}% click rate`,
                icon: MousePointerClick,
                iconBg: 'bg-orange-500',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {card.label}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-white shadow-xs ${card.iconBg}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl tabular-nums">
                      {loading && !data ? '—' : card.value}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {card.badge}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-400 dark:text-slate-500">{card.sub}</p>
                </div>
              );
            })}
          </div>

          {/* 3-Column Middle Visuals Row (Matching Profile Analytics Design) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Card 1: Challenge Views & Velocity Trend */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Challenge Views Velocity
                </h2>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {windowLabel}
                </span>
              </div>

              <div className="flex h-44 items-end justify-between gap-2.5 pt-6">
                {trendBars.map((bar, idx) => {
                  const pct = Math.max(
                    16,
                    Math.round((Math.max(bar.views, bar.engagements * 3) / maxTrendVal) * 100),
                  );
                  const isPeak = idx === peakIdx;
                  return (
                    <div key={`${bar.label}-${idx}`} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                        {formatCompactCount(bar.views)}
                      </span>
                      <div className="flex h-28 w-full items-end">
                        <div
                          style={{ height: `${pct}%` }}
                          className={`w-full rounded-t-xl transition-all ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-500 to-orange-300 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        />
                      </div>
                      <span className="truncate text-[10px] font-medium text-slate-400">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Engagement & Click Breakdown (4 Vibrant Bars) */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Action &amp; Click Insights
                </h2>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {clickRate}% CTR
                </span>
              </div>

              <div className="flex h-44 items-end justify-between gap-3 pt-6">
                {breakdownBars.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                      {item.pct}%
                    </span>
                    <div className="flex h-28 w-full items-end">
                      <div
                        style={{ height: `${Math.max(14, item.pct)}%` }}
                        className={`w-full rounded-t-xl ${item.color} transition-all`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Conversion & Reward Pool Split Donut */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Conversion &amp; Pool Split
                </h2>
                <button
                  type="button"
                  onClick={() => void loadAnalytics()}
                  aria-label="Refresh analytics"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                  <div
                    className="h-full w-full rounded-full"
                    style={{
                      background: `conic-gradient(#d946ef 0% ${likesSharePct}%, #22c55e ${likesSharePct}% ${
                        likesSharePct + commentsSharePct
                      }%, #f97316 ${likesSharePct + commentsSharePct}% 100%)`,
                    }}
                  />
                  <div className="absolute flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <span className="text-lg font-extrabold text-slate-950 dark:text-white tabular-nums">
                      {clickRate}%
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Avg CTR</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-xs bg-orange-500" />
                      Post Link Clicks
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {clicksSharePct}%{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({formatCompactCount(totalClicks)})
                      </span>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                      Comments &amp; Shares
                    </div>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                      {commentsSharePct}%{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({formatCompactCount(totalComments + totalSharesSaves)})
                      </span>
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800">
                    Pool Disbursed:{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {data?.pool?.distributedCredits ?? 0}/{data?.pool?.totalPoolCredits ?? 0} CR
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Paginated Influencer Performance Table (Supports 1,000+ Creators) */}
          <BrandChallengeParticipantsTable
            participants={data?.participants ?? []}
            pagination={
              data?.pagination ?? {
                page,
                limit: pageSize,
                total: 0,
                pages: 1,
                hasMore: false,
              }
            }
            loading={loading}
            search={searchInput}
            onSearchChange={setSearchInput}
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={(val) => {
              setSortBy(val);
              setPage(1);
            }}
            pageSize={pageSize}
            onPageSizeChange={(val) => {
              setPageSize(val);
              setPage(1);
            }}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
