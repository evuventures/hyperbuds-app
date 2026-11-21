'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { formatCompactCount } from '@/lib/utils/formatCount';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Heart,
  Mic,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

type AnalyticsWindow = '24h' | '7d' | '28d';

interface OverviewResponse {
  profileStats?: {
    totalFollowers?: number;
    avgEngagement?: number;
    totalViews?: number;
    rizzScore?: number;
  };
  collaborations?: number;
  marketplaceOrders?: number;
  earnings?: number;
}

interface PostAnalyticsSummary {
  window: AnalyticsWindow;
  summary: {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalReposts: number;
    totalBookmarks: number;
    totalEngagements: number;
    engagementRate: number;
    followersCount: number;
    followingCount: number;
  };
  series: Array<{ label: string; views: number; engagements: number; posts: number }>;
  posts: Array<{
    id: string;
    kind: string;
    caption: string;
    mediaUrl?: string | null;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
    engagementsCount: number;
    engagementRate: number;
    createdAt?: string;
  }>;
}

interface ForecastBand {
  pointEstimate: number;
  lowerBound: number;
  upperBound: number;
  unit: string;
}

interface ForecastSnapshotItem {
  _id: string;
  horizonDays: 7 | 30 | 90;
  method: string;
  confidenceLevel: number;
  predictions?: {
    reach?: ForecastBand;
    avgViews?: ForecastBand;
    liveViewers?: ForecastBand;
    followerGrowthPct?: ForecastBand;
  };
}

interface GeneratedCreatorPlan {
  planType: 'content_plan' | 'live_podcast_plan';
  promptVersion: string;
  model: string;
  generatedSuggestions?: {
    planTitle?: string;
    goal?: string;
    trendAngles?: Array<{ angle: string; hook: string; format: string }>;
    weeklyCadence?: Array<{ day: string; deliverable: string }>;
  };
}

interface RizzPayload {
  currentScore?: number;
  scoreV2?: number;
  tier?: string;
}

const HEATMAP_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HEATMAP_HOURS = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
const HEATMAP_INTENSITY = [
  [1, 1, 1, 2, 2, 3, 4, 3],
  [1, 1, 2, 2, 3, 3, 4, 4],
  [2, 2, 2, 3, 5, 4, 5, 4],
  [1, 1, 2, 3, 3, 4, 5, 4],
  [2, 2, 2, 3, 4, 5, 5, 4],
  [2, 2, 2, 3, 5, 4, 5, 5],
  [1, 1, 2, 2, 4, 3, 4, 3],
];

const HEATMAP_CLASSES = [
  'bg-orange-50 dark:bg-purple-950/20',
  'bg-orange-100/80 dark:bg-purple-950/35',
  'bg-orange-200/80 dark:bg-purple-900/50',
  'bg-orange-300/90 dark:bg-purple-700/70',
  'bg-orange-400 dark:bg-purple-600',
  'bg-orange-500 dark:bg-purple-500',
];

export default function AnalyticsPage() {
  const [windowKey, setWindowKey] = useState<AnalyticsWindow>('28d');
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [postAnalytics, setPostAnalytics] = useState<PostAnalyticsSummary | null>(null);
  const [rizz, setRizz] = useState<RizzPayload | null>(null);
  const [forecasts, setForecasts] = useState<ForecastSnapshotItem[]>([]);
  const [plan, setPlan] = useState<GeneratedCreatorPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (win: AnalyticsWindow) => {
    setLoading(true);
    setError(null);
    try {
      const [ovRes, paRes, rizzRes, fcRes] = await Promise.all([
        apiClient.get('/analytics/overview').catch(() => null),
        apiClient.get(`/feed/analytics/summary?window=${win}`).catch(() => null),
        apiClient.get('/rizz/score').catch(() => null),
        apiClient.get('/analytics/forecasts').catch(() => null),
      ]);
      setOverview(ovRes?.data ?? null);
      setPostAnalytics(paRes?.data ?? null);
      setRizz(rizzRes?.data?.rizzScore ?? rizzRes?.data ?? null);
      setForecasts(Array.isArray(fcRes?.data?.forecasts) ? fcRes.data.forecasts : []);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics(windowKey);
  }, [windowKey, loadAnalytics]);

  const handleGeneratePlan = async (planType: 'content_plan' | 'live_podcast_plan') => {
    setBusyAction(planType);
    try {
      const res = await apiClient.post('/analytics/creator-plans/generate', { planType });
      setPlan(res.data?.plan ?? null);
      toast.success('Creator strategy plan generated!');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Could not generate creator plan.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      ['Post ID', 'Type', 'Views', 'Likes', 'Comments', 'Reposts', 'Engagements', 'Engagement Rate %'],
      ...(postAnalytics?.posts ?? []).map((p) => [
        p.id,
        p.kind,
        String(p.viewsCount),
        String(p.likesCount),
        String(p.commentsCount),
        String(p.repostsCount),
        String(p.engagementsCount),
        String(p.engagementRate),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyperbuds-analytics-${windowKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${windowKey} analytics CSV`);
  };

  const handleShareSummary = async () => {
    const text = `My HyperBuds (${windowKey}) Analytics: ${formatCompactCount(
      totalFollowers,
    )} followers · ${formatCompactCount(totalViews)} views · ${formatCompactCount(totalEngagements)} engagements!`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Analytics summary copied to clipboard!');
    } catch {
      toast.error('Unable to copy summary.');
    }
  };

  const summary = postAnalytics?.summary;
  const totalFollowers = Math.max(
    summary?.followersCount ?? 0,
    overview?.profileStats?.totalFollowers ?? 0,
  );
  const totalViews = (summary?.totalViews ?? 0) + (overview?.profileStats?.totalViews ?? 0);
  const totalEngagements = summary?.totalEngagements ?? 0;
  const totalPosts = summary?.totalPosts ?? 0;
  const totalLikes = summary?.totalLikes ?? 0;
  const totalComments = summary?.totalComments ?? 0;
  const totalReposts = summary?.totalReposts ?? 0;
  const totalBookmarks = summary?.totalBookmarks ?? 0;

  // Bar breakdown data (matching vibrant 4-color bar chart from reference)
  const breakdownTotal = Math.max(1, totalLikes + totalComments + totalReposts + totalBookmarks);
  const breakdownBars = [
    {
      label: 'Likes',
      value: totalLikes,
      pct: Math.round((totalLikes / breakdownTotal) * 100),
      color: 'bg-fuchsia-500',
    },
    {
      label: 'Comments',
      value: totalComments,
      pct: Math.round((totalComments / breakdownTotal) * 100),
      color: 'bg-orange-500',
    },
    {
      label: 'Reposts',
      value: totalReposts,
      pct: Math.round((totalReposts / breakdownTotal) * 100),
      color: 'bg-emerald-500',
    },
    {
      label: 'Saves',
      value: totalBookmarks,
      pct: Math.round((totalBookmarks / breakdownTotal) * 100),
      color: 'bg-sky-500',
    },
  ];

  // Trend bars (last 6 buckets from live series or graceful baseline)
  const rawSeries = postAnalytics?.series ?? [];
  const trendBars =
    rawSeries.length > 0
      ? rawSeries.slice(-6).map((s) => ({
          label: s.label.slice(5) || s.label,
          views: s.views,
          engagements: s.engagements,
          posts: s.posts,
        }))
      : [
          { label: 'P1', views: 0, engagements: 0, posts: 0 },
          { label: 'P2', views: 0, engagements: 0, posts: 0 },
          { label: 'P3', views: 0, engagements: 0, posts: 0 },
          { label: 'P4', views: 0, engagements: 0, posts: 0 },
        ];
  const maxTrendVal = Math.max(1, ...trendBars.map((b) => Math.max(b.views, b.engagements * 3, 1)));
  const peakIdx = trendBars.reduce(
    (best, item, idx, arr) =>
      item.views + item.engagements > arr[best].views + arr[best].engagements ? idx : best,
    0,
  );

  // Donut percentages (Likes / Comments / Shares+Saves)
  const likesPct = Math.round((totalLikes / breakdownTotal) * 100);
  const commentsPct = Math.round((totalComments / breakdownTotal) * 100);
  const sharesPct = Math.max(0, 100 - likesPct - commentsPct);

  const windowLabel =
    windowKey === '24h' ? 'Last 24 Hours' : windowKey === '7d' ? 'Last 7 Days' : 'Last 28 Days';

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Top Header matching reference screenshot */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link
                href="/profile"
                className="mb-1.5 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Profile
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Social Media Analytics
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Track post performance, engagement, Rizz Score, and growth across HyperBuds in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 24h / 7d / 28d Time Window Selector */}
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {(
                  [
                    { id: '24h', label: '24 Hours' },
                    { id: '7d', label: '7 Days' },
                    { id: '28d', label: '28 Days' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setWindowKey(opt.id)}
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
                onClick={handleShareSummary}
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* 4 KPI Summary Cards (Matching Reference Top Row) */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {[
              {
                label: 'Total Followers',
                value: formatCompactCount(totalFollowers),
                sub: `${formatCompactCount(summary?.followingCount ?? 0)} following`,
                badge: `Rizz ${rizz?.scoreV2 ?? rizz?.currentScore ?? overview?.profileStats?.rizzScore ?? 0}`,
                icon: Users,
                iconBg: 'bg-pink-500',
              },
              {
                label: 'Total Engagement',
                value: formatCompactCount(totalEngagements),
                sub: `${windowLabel}`,
                badge: `${summary?.engagementRate ?? 0}% rate`,
                icon: Heart,
                iconBg: 'bg-purple-500',
              },
              {
                label: 'Total Views / Reach',
                value: formatCompactCount(totalViews),
                sub: `${windowLabel}`,
                badge: `${formatCompactCount(totalPosts)} posts`,
                icon: Eye,
                iconBg: 'bg-emerald-500',
              },
              {
                label: 'Total Likes & Shares',
                value: formatCompactCount(totalLikes + totalReposts),
                sub: `${formatCompactCount(totalComments)} comments`,
                badge: `${overview?.collaborations ?? 0} collabs`,
                icon: BarChart3,
                iconBg: 'bg-rose-500',
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
                      {loading ? '—' : card.value}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {card.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{card.sub}</p>
                </div>
              );
            })}
          </div>

          {/* 3-Column Middle Visuals Row (Growth Trend, Engagement Insights, Engagement Donut) */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Card 1: Post & Audience Growth Trend */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Post Activity Trend
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
                        {formatCompactCount(bar.views + bar.engagements)}
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
                      <span className="truncate text-[10px] font-medium text-slate-400">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Engagement Insights (4 Vibrant Colored Bars) */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Engagement Insights
                </h2>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {windowKey}
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

            {/* Card 3: Engagement Breakdown Donut */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Audience Engagement Split
                </h2>
                <button
                  type="button"
                  onClick={() => void loadAnalytics(windowKey)}
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
                      background: `conic-gradient(#f97316 0% ${likesPct}%, #22c55e ${likesPct}% ${
                        likesPct + commentsPct
                      }%, #38bdf8 ${likesPct + commentsPct}% 100%)`,
                    }}
                  />
                  <div className="absolute flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                    <span className="text-lg font-extrabold text-slate-950 dark:text-white tabular-nums">
                      {formatCompactCount(totalEngagements)}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Total</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-xs bg-orange-500" />
                      Likes
                    </div>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {likesPct}% <span className="text-xs font-normal text-slate-400">({formatCompactCount(totalLikes)})</span>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                      Comments
                    </div>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {commentsPct}% <span className="text-xs font-normal text-slate-400">({formatCompactCount(totalComments)})</span>
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-xs bg-sky-500" />
                      Reposts &amp; Saves
                    </div>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {sharesPct}% <span className="text-xs font-normal text-slate-400">({formatCompactCount(totalReposts + totalBookmarks)})</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Bottom Row: Post Performance Table + Optimal Posting Time Heatmap */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Post Performance Overview Table */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Post Performance Overview ({windowLabel})
                </h2>
                <span className="text-xs font-medium text-slate-400">
                  {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
                </span>
              </div>

              {(postAnalytics?.posts ?? []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800">
                  No posts published in the {windowLabel.toLowerCase()}. Publish a post or reel to track views and engagement here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                        <th className="pb-2.5 pr-3">Post</th>
                        <th className="pb-2.5 px-2">Views</th>
                        <th className="pb-2.5 px-2">Likes</th>
                        <th className="pb-2.5 px-2">Engagements</th>
                        <th className="pb-2.5 pl-2 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(postAnalytics?.posts ?? []).slice(0, 8).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 pr-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                                  p.kind === 'reel' ? 'bg-fuchsia-500' : 'bg-orange-500'
                                }`}
                              >
                                {p.kind}
                              </span>
                              <span className="max-w-[180px] truncate font-medium text-slate-800 dark:text-slate-200">
                                {p.caption || 'Media post'}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                            {formatCompactCount(p.viewsCount)}
                          </td>
                          <td className="px-2 py-2.5 font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                            {formatCompactCount(p.likesCount)}
                          </td>
                          <td className="px-2 py-2.5 font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                            {formatCompactCount(p.engagementsCount)}
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                              {p.engagementRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Optimal Posting Time Heatmap */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Optimal Posting Time
                </h2>
                <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Best Reach
                </span>
              </div>

              <div className="space-y-1.5">
                {HEATMAP_DAYS.map((day, dIdx) => (
                  <div key={day} className="flex items-center gap-1.5">
                    <span className="w-7 text-[10px] font-medium text-slate-400">{day}</span>
                    <div className="grid flex-1 grid-cols-8 gap-1">
                      {HEATMAP_INTENSITY[dIdx].map((level, hIdx) => (
                        <div
                          key={`${day}-${hIdx}`}
                          title={`${day} ${HEATMAP_HOURS[hIdx]}`}
                          className={`h-5 rounded-md ${HEATMAP_CLASSES[level]}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-7" />
                  <div className="grid flex-1 grid-cols-8 gap-1 text-center text-[9px] text-slate-400">
                    {HEATMAP_HOURS.map((h) => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Retained HyperBuds Forecasts & AI Creator Strategy Plans */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  Growth Forecasts (7d / 30d / 90d)
                </h2>
                <span className="text-[11px] text-slate-400">Measured baseline</span>
              </div>
              {forecasts.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Keep publishing posts and reels to unlock statistical 7, 30, and 90-day reach forecasts.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {forecasts.slice(0, 3).map((fc) => (
                    <div
                      key={fc._id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                        {fc.horizonDays}-Day Forecast
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                        {formatCompactCount(fc.predictions?.reach?.pointEstimate ?? 0)}
                      </p>
                      <p className="text-[10px] text-slate-500">Projected reach</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  AI Creator Strategy Plans
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busyAction)}
                    onClick={() => void handleGeneratePlan('content_plan')}
                    className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                  >
                    <Calendar className="h-3 w-3" />
                    {busyAction === 'content_plan' ? 'Generating...' : 'Content Plan'}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busyAction)}
                    onClick={() => void handleGeneratePlan('live_podcast_plan')}
                    className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 disabled:opacity-50 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-200"
                  >
                    <Mic className="h-3 w-3" />
                    {busyAction === 'live_podcast_plan' ? 'Generating...' : 'Live / Pod Plan'}
                  </button>
                </div>
              </div>
              {plan?.generatedSuggestions ? (
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {plan.generatedSuggestions.planTitle}
                  </p>
                  <p className="text-slate-500">{plan.generatedSuggestions.goal}</p>
                  {Array.isArray(plan.generatedSuggestions.trendAngles) && (
                    <ul className="list-disc space-y-1 pl-4">
                      {plan.generatedSuggestions.trendAngles.slice(0, 3).map((a, idx) => (
                        <li key={idx}>
                          <span className="font-semibold">{a.angle}:</span> {a.hook}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Generate an AI content calendar or live/podcast run-of-show tailored to your real performance metrics.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
