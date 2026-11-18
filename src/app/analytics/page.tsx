'use client';

import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { Calendar, Mic, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

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

interface AnalyticsReport {
  _id: string;
  period?: {
    start?: string;
    end?: string;
    granularity?: string;
  };
  metrics?: {
    totalFollowers?: number;
    avgEngagement?: number;
    totalViews?: number;
    earnings?: number;
  };
  topContent?: Array<{
    title?: string;
    platform?: string;
    views?: number;
    engagement?: number;
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
  measuredBaseline?: {
    followers?: number;
    avgViews?: number;
    avgEngagementPercent?: number;
  };
  predictions?: {
    reach?: ForecastBand;
    avgViews?: ForecastBand;
    liveViewers?: ForecastBand;
    followerGrowthPct?: ForecastBand;
  };
  createdAt?: string;
}

interface GeneratedCreatorPlan {
  planType: 'content_plan' | 'live_podcast_plan';
  promptVersion: string;
  model: string;
  creditsCharged?: number;
  measuredFacts?: {
    totalFollowers?: number;
    avgEngagement?: number;
  };
  generatedSuggestions?: {
    planTitle?: string;
    goal?: string;
    trendAngles?: Array<{ angle: string; hook: string; format: string }>;
    weeklyCadence?: Array<{ day: string; deliverable: string }>;
    runOfShow?: Array<{ minute: string; segment: string; prompt: string }>;
    postProductionChecklist?: string[];
  };
}

interface RizzPayload {
  currentScore?: number;
  scoreV2?: number;
  tier?: string;
  factors?: {
    engagement?: {
      engagementRate?: number;
      viralPotential?: number;
      audienceConsistency?: number;
    };
    growth?: {
      followerGrowth?: number;
      contentFrequency?: number;
      trendAlignment?: number;
    };
    collaboration?: {
      responseRate?: number;
      completionRate?: number;
      partnerSatisfaction?: number;
    };
    content?: {
      nicheRelevance?: number;
    };
  };
  lastCalculated?: string;
}

function formatNumber(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';
  return value.toLocaleString();
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '$0.00';
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AnalyticsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [rizz, setRizz] = useState<RizzPayload | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [forecasts, setForecasts] = useState<ForecastSnapshotItem[]>([]);
  const [horizonDays, setHorizonDays] = useState<7 | 30 | 90>(30);
  const [forecastBusy, setForecastBusy] = useState(false);
  const [planType, setPlanType] = useState<'content_plan' | 'live_podcast_plan'>('content_plan');
  const [planTopic, setPlanTopic] = useState('');
  const [planGoal, setPlanGoal] = useState('');
  const [planBusy, setPlanBusy] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedCreatorPlan | null>(null);
  const [banner, setBanner] = useState<{ type: 'error' | 'info'; text: string } | null>(
    null,
  );

  const loadAnalytics = useCallback(async (from?: string, to?: string) => {
    setBanner(null);

    if (from && to && new Date(from) > new Date(to)) {
      setBanner({
        type: 'error',
        text: 'Start date must be on or before end date.',
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const [overviewRes, reportsRes, meRes] = await Promise.all([
        apiClient.get(`/analytics/overview${queryString}`),
        apiClient.get('/analytics/reports?limit=10'),
        apiClient.get('/auth/me').catch(() => null),
      ]);

      setOverview(overviewRes.data?.overview ?? {});
      setReports(Array.isArray(reportsRes.data?.reports) ? reportsRes.data.reports : []);

      const resolvedUserId =
        meRes?.data?.user?._id || meRes?.data?.user?.id || meRes?.data?._id || null;
      setUserId(resolvedUserId);

      if (resolvedUserId) {
        const rizzRes = await apiClient
          .get(`/rizzScore/${resolvedUserId}`)
          .catch(() => null);
        if (rizzRes?.data?.rizzScore) {
          setRizz(rizzRes.data.rizzScore);
        }
      }
      const forecastRes = await apiClient.get('/analytics/forecast?limit=6').catch(() => null);
      if (Array.isArray(forecastRes?.data?.snapshots)) {
        setForecasts(forecastRes.data.snapshots);
      }
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Unable to load analytics.';
      setBanner({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRecalculateRizz = async () => {
    if (!userId) return;
    setRecalculating(true);
    setBanner(null);
    try {
      const response = await apiClient.post('/rizzScore/calculate', { userId });
      if (response.data?.rizzScore) {
        setRizz(response.data.rizzScore);
      }
      setBanner({ type: 'info', text: 'Rizz Score recalculated from latest metrics.' });
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Unable to recalculate score.';
      setBanner({ type: 'error', text: message });
    } finally {
      setRecalculating(false);
    }
  };

  const handleGenerateForecast = async () => {
    setForecastBusy(true);
    setBanner(null);
    try {
      const response = await apiClient.post('/analytics/forecast/generate', { horizonDays });
      if (response.data?.snapshot) {
        setForecasts((prev) => [response.data.snapshot, ...prev]);
      }
      setBanner({
        type: 'info',
        text: `Statistical ${horizonDays}-day forecast generated (${response.data?.creditsCharged ?? 5} credits billed).`,
      });
    } catch (error) {
      setBanner({
        type: 'error',
        text: (error as { message?: string })?.message || 'Unable to generate statistical forecast.',
      });
    } finally {
      setForecastBusy(false);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanBusy(true);
    setBanner(null);
    try {
      const response = await apiClient.post('/analytics/plans/generate', {
        planType,
        topic: planTopic.trim() || undefined,
        goal: planGoal.trim() || undefined,
      });
      setGeneratedPlan(response.data);
      setBanner({
        type: 'info',
        text: `Generated ${planType === 'content_plan' ? 'Content & Trend Plan' : 'Live & Podcast Runbook'} (${response.data?.creditsCharged ?? (planType === 'content_plan' ? 6 : 5)} credits).`,
      });
    } catch (error) {
      setBanner({
        type: 'error',
        text: (error as { message?: string })?.message || 'Unable to generate creator plan.',
      });
    } finally {
      setPlanBusy(false);
    }
  };

  const rizzScoreValue =
    rizz?.currentScore ?? overview?.profileStats?.rizzScore ?? 0;

  const rizzRows = [
    {
      label: 'Engagement rate',
      value: rizz?.factors?.engagement?.engagementRate ?? 0,
      kind: 'Measured',
    },
    {
      label: 'Follower growth',
      value: rizz?.factors?.growth?.followerGrowth ?? 0,
      kind: 'Measured',
    },
    {
      label: 'Collaboration completion',
      value: rizz?.factors?.collaboration?.completionRate ?? 0,
      kind: 'Computed',
    },
    {
      label: 'Niche relevance',
      value: rizz?.factors?.content?.nicheRelevance ?? 0,
      kind: 'Computed',
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Performance Ledger
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Analytics & Rizz Score
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Measured audience metrics, collaboration volume, and 0–100 creator compatibility score.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadAnalytics(fromDate, toDate);
              }}
              className="flex flex-wrap items-end gap-2"
            >
              <div>
                <label
                  htmlFor="analytics-from"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400"
                >
                  From
                </label>
                <input
                  id="analytics-from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="analytics-to"
                  className="block text-[11px] font-medium text-slate-500 dark:text-slate-400"
                >
                  To
                </label>
                <input
                  id="analytics-to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Apply
              </button>
              {(fromDate || toDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                    loadAnalytics();
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  Reset
                </button>
              )}
            </form>
          </div>

          {banner && (
            <div
              role="status"
              className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              {banner.text}
            </div>
          )}

          {/* KPI Strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total followers
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {loading ? '—' : formatNumber(overview?.profileStats?.totalFollowers)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Avg engagement
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {loading ? '—' : `${(overview?.profileStats?.avgEngagement ?? 0).toFixed(1)}%`}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Collaborations
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {loading ? '—' : formatNumber(overview?.collaborations)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Recorded earnings
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                {loading ? '—' : formatCurrency(overview?.earnings)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Reports Table */}
            <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Period Reports
                </h2>
                <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {reports.length} saved
                </span>
              </div>

              {loading ? (
                <div className="space-y-3 p-5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                  No period reports generated for this account yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-2.5 font-medium">Period</th>
                        <th className="px-4 py-2.5 font-medium">Views</th>
                        <th className="px-4 py-2.5 font-medium">Engagement</th>
                        <th className="px-5 py-2.5 text-right font-medium">Earnings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {reports.map((report) => {
                        const start = report.period?.start
                          ? new Date(report.period.start).toLocaleDateString()
                          : '—';
                        const end = report.period?.end
                          ? new Date(report.period.end).toLocaleDateString()
                          : '—';
                        return (
                          <tr key={report._id}>
                            <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                              {start} – {end}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                              {formatNumber(report.metrics?.totalViews)}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                              {(report.metrics?.avgEngagement ?? 0).toFixed(1)}%
                            </td>
                            <td className="px-5 py-3 text-right tabular-nums text-slate-900 dark:text-white">
                              {formatCurrency(report.metrics?.earnings)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Rizz Score Breakdown */}
            <aside className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3.5 dark:border-slate-800">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Compatibility Index
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
                      {Math.round(rizzScoreValue)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!userId || recalculating}
                  onClick={handleRecalculateRizz}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                  Recalculate
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                {rizzRows.map((row) => {
                  const pct = Math.max(0, Math.min(100, Math.round(row.value)));
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {row.label}
                        </span>
                        <span className="tabular-nums text-slate-500 dark:text-slate-400">
                          {pct}/100 · {row.kind}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-slate-900 dark:bg-slate-200"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-5 border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Measured fields come directly from synced profile and collaboration records.
                Computed sub-scores are weighted estimates used for matching rank.
              </p>
            </aside>
          </div>

          {/* Statistical Growth Forecasting + AI Creator Plans */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3.5 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Statistical Forecast · Non-Guaranteed Estimate
                  </div>
                  <h2 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                    7 / 30 / 90-Day Reach & Engagement Intervals
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {([7, 30, 90] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setHorizonDays(days)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium border ${
                        horizonDays === days
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={forecastBusy}
                    onClick={handleGenerateForecast}
                    className="ml-1 inline-flex items-center gap-1 rounded-lg bg-slate-900 dark:bg-purple-600 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-purple-700 disabled:opacity-50"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {forecastBusy ? 'Running...' : 'Run (5 cr)'}
                  </button>
                </div>
              </div>

              {forecasts.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  Run a forecast snapshot to view 80% uncertainty intervals alongside your measured analytics baseline.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {(() => {
                    const latest = forecasts[0];
                    const reach = latest.predictions?.reach;
                    const views = latest.predictions?.avgViews;
                    const live = latest.predictions?.liveViewers;
                    return (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span>
                            Horizon: <strong className="text-slate-900 dark:text-white">{latest.horizonDays} days</strong> ({latest.method})
                          </span>
                          <span>{Math.round((latest.confidenceLevel ?? 0.8) * 100)}% interval</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                            <p className="text-[11px] text-slate-500">Projected Reach</p>
                            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                              {formatNumber(reach?.pointEstimate)}
                            </p>
                            <p className="text-[11px] text-slate-500 tabular-nums">
                              Band: {formatNumber(reach?.lowerBound)} – {formatNumber(reach?.upperBound)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                            <p className="text-[11px] text-slate-500">Projected Avg Views</p>
                            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                              {formatNumber(views?.pointEstimate)}
                            </p>
                            <p className="text-[11px] text-slate-500 tabular-nums">
                              Band: {formatNumber(views?.lowerBound)} – {formatNumber(views?.upperBound)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                            <p className="text-[11px] text-slate-500">Est. Live Viewers</p>
                            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                              {formatNumber(live?.pointEstimate)}
                            </p>
                            <p className="text-[11px] text-slate-500 tabular-nums">
                              Band: {formatNumber(live?.lowerBound)} – {formatNumber(live?.upperBound)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
              <div className="border-b border-slate-200 pb-3.5 dark:border-slate-800">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Generated Suggestions · Metered Job
                </div>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                  Personalized Content, Trend & Live Studio Plans
                </h2>
              </div>

              <form onSubmit={handleGeneratePlan} className="mt-4 space-y-3 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPlanType('content_plan')}
                    className={`flex-1 rounded-lg border px-3 py-2 font-medium text-left ${
                      planType === 'content_plan'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Content & Trend Plan (6 cr)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType('live_podcast_plan')}
                    className={`flex-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-medium text-left ${
                      planType === 'live_podcast_plan'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Live / Podcast Plan (5 cr)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={planTopic}
                    onChange={(e) => setPlanTopic(e.target.value)}
                    placeholder="Topic or series focus"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                  />
                  <input
                    type="text"
                    value={planGoal}
                    onChange={(e) => setPlanGoal(e.target.value)}
                    placeholder="Primary growth goal"
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={planBusy}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {planBusy ? 'Synthesizing Plan...' : 'Generate Metered Plan'}
                </button>
              </form>

              {generatedPlan?.generatedSuggestions && (
                <div className="mt-4 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {generatedPlan.generatedSuggestions.planTitle}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {generatedPlan.model} · {generatedPlan.promptVersion}
                    </span>
                  </div>
                  {(generatedPlan.generatedSuggestions.trendAngles || []).slice(0, 2).map((t) => (
                    <div key={t.angle} className="rounded bg-white/80 dark:bg-slate-900/80 p-2">
                      <strong>{t.angle}</strong> ({t.format}): {t.hook}
                    </div>
                  ))}
                  {(generatedPlan.generatedSuggestions.runOfShow || []).slice(0, 3).map((r) => (
                    <div key={r.minute} className="rounded bg-white/80 dark:bg-slate-900/80 p-2">
                      <strong>{r.minute} · {r.segment}</strong>: {r.prompt}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
