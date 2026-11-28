'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  Activity,
  CheckCircle2,
  Cpu,
  FileText,
  Globe,
  Lock,
  Radio,
  RefreshCw,
  Shield,
  Sliders,
  XCircle,
} from 'lucide-react';

interface JurisdictionRow {
  countryCode: string;
  countryName: string;
  version: number;
  accountAllowed: boolean;
  paymentAllowed: boolean;
  payoutAllowed: boolean;
  subscriptionAllowed: boolean;
  prizeAllowed: boolean;
  shippingAllowed: boolean;
  notes: string;
}

interface AdminOverview {
  metrics: {
    usersTotal: number;
    profilesTotal: number;
    openReports: number;
    openDisputes: number;
    pendingKybOrgs: number;
    openCampaigns: number;
    totalCreditLiability: number;
    totalRewardBudgetLiability: number;
    jurisdictionsConfigured: number;
    auditLogCount: number;
  };
  providers: Record<string, unknown>;
}

interface PolicyRow {
  key: string;
  value: unknown;
  version: number;
  description: string;
}

interface AuditLogRow {
  _id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

interface EmpireMatchRecord {
  id?: number | string;
  ts?: string;
  creator_a?: string;
  creator_b?: string;
  score?: number;
  source?: string;
  fallback?: boolean;
  latency_ms?: number;
  request_id?: string;
  end_user_id?: string;
}

interface EmpireThreatRecord {
  id?: number | string;
  ts?: string;
  actor?: string;
  end_user_id?: string;
  reason?: string;
  risk_score?: number;
  action?: string;
}

interface EmpireAdminSnapshot {
  configured: boolean;
  mode: string;
  baseUrl: string;
  circuitOpen: boolean;
  cachedPairsCount?: number;
  health?: {
    status?: string;
    instance_id?: string;
    version?: string;
    ai?: { mode?: string; scorer?: string; circuit?: string; consecutive_failures?: number };
    security?: { active_blocks?: number; tracked_actors?: number };
    throughput?: {
      matches_per_sec?: number;
      latency_ms?: { p50?: number | null; p95?: number | null };
      team_latency_ms?: { p50?: number | null; p95?: number | null };
    };
    sync?: {
      enabled?: boolean;
      status?: string;
      backlog?: number;
      written?: number;
      dropped?: number;
      last_success_at?: string | null;
      last_error?: string | null;
    };
    totals?: { events?: number; matches?: number; threats_blocked?: number; critical_events?: number };
  };
  recentMatches?: { data?: EmpireMatchRecord[] };
  recentThreats?: { data?: EmpireThreatRecord[] };
  embeddings?: {
    activePublicProfiles: number;
    embeddedCount: number;
    missingOrStaleCount: number;
    embedderHealthy: boolean;
    model: string;
  };
}

export default function SuperadminPage() {
  const [tab, setTab] = useState<'overview' | 'empire' | 'jurisdictions' | 'queues' | 'audit'>('overview');
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [jurisdictions, setJurisdictions] = useState<JurisdictionRow[]>([]);
  const [queues, setQueues] = useState<{
    moderationReports: Array<Record<string, unknown>>;
    marketplaceDisputes: Array<Record<string, unknown>>;
    sponsorKybReviews: Array<Record<string, unknown>>;
  }>({ moderationReports: [], marketplaceDisputes: [], sponsorKybReviews: [] });
  const [policies, setPolicies] = useState<PolicyRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);
  const [policyDrafts, setPolicyDrafts] = useState<Record<string, string>>({});

  const [empireSnap, setEmpireSnap] = useState<EmpireAdminSnapshot | null>(null);
  const [liveMatches, setLiveMatches] = useState<EmpireMatchRecord[]>([]);
  const [liveThreats, setLiveThreats] = useState<EmpireThreatRecord[]>([]);
  const [liveTick, setLiveTick] = useState<Record<string, unknown> | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [syncingEmbeddings, setSyncingEmbeddings] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const loadEmpireSnapshot = useCallback(async () => {
    try {
      const eRes = await apiClient.get<EmpireAdminSnapshot>('/admin/empire-builder');
      setEmpireSnap(eRes.data);
      if (Array.isArray(eRes.data?.recentMatches?.data)) {
        setLiveMatches(eRes.data.recentMatches!.data!.slice(0, 20));
      }
      if (Array.isArray(eRes.data?.recentThreats?.data)) {
        setLiveThreats(eRes.data.recentThreats!.data!.slice(0, 20));
      }
    } catch {
      // Non-blocking if admin lacks access or service restarting
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const ovRes = await apiClient.get<AdminOverview>('/admin/overview');
      setOverview(ovRes.data);

      const [jRes, qRes, pRes, aRes] = await Promise.all([
        apiClient.get('/jurisdictions'),
        apiClient.get('/admin/queues'),
        apiClient.get('/admin/policies'),
        apiClient.get('/admin/audit-logs?limit=40'),
        loadEmpireSnapshot(),
      ]);
      setJurisdictions(Array.isArray(jRes.data?.jurisdictions) ? jRes.data.jurisdictions : []);
      if (qRes.data?.queues) setQueues(qRes.data.queues);
      const polList: PolicyRow[] = Array.isArray(pRes.data?.policies) ? pRes.data.policies : [];
      setPolicies(polList);
      setPolicyDrafts(
        Object.fromEntries(polList.map((p) => [p.key, JSON.stringify(p.value)])),
      );
      setAuditLogs(Array.isArray(aRes.data?.logs) ? aRes.data.logs : []);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number }; status?: number })?.response?.status;
      if (status === 401 || status === 403) {
        setForbidden(true);
      } else {
        toast.error('Unable to load Superadmin console.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadEmpireSnapshot]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (tab !== 'empire' || forbidden) return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const pollInterval = setInterval(() => {
      void loadEmpireSnapshot();
    }, 15_000);

    const openStream = async () => {
      try {
        const res = await apiClient.post<{ wsUrl?: string }>('/admin/empire-builder/stream-token', {});
        if (cancelled || !res.data?.wsUrl) return;
        const sock = new WebSocket(res.data.wsUrl);
        wsRef.current = sock;

        sock.onopen = () => {
          if (!cancelled) setWsConnected(true);
        };
        sock.onmessage = (ev) => {
          try {
            const frame = JSON.parse(String(ev.data)) as {
              type?: string;
              data?: Record<string, unknown>;
            };
            if (frame.type === 'tick' && frame.data) {
              setLiveTick(frame.data);
            } else if (frame.type === 'match' && frame.data) {
              setLiveMatches((prev) => [frame.data as EmpireMatchRecord, ...prev].slice(0, 25));
            } else if (frame.type === 'threat' && frame.data) {
              setLiveThreats((prev) => [frame.data as EmpireThreatRecord, ...prev].slice(0, 25));
            }
          } catch {
            // Ignore malformed stream frame
          }
        };
        sock.onclose = () => {
          setWsConnected(false);
          if (!cancelled) {
            reconnectTimer = setTimeout(() => {
              void openStream();
            }, 5000);
          }
        };
        sock.onerror = () => {
          sock.close();
        };
      } catch {
        setWsConnected(false);
      }
    };

    void openStream();

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [tab, forbidden, loadEmpireSnapshot]);

  const handleBackfillEmbeddings = async () => {
    setSyncingEmbeddings(true);
    try {
      const res = await apiClient.post<{ result?: { updated?: number; checked?: number } }>(
        '/admin/embeddings/backfill',
        { limit: 200 },
      );
      toast.success(
        `Embeddings synced (${res.data?.result?.updated ?? 0} updated of ${res.data?.result?.checked ?? 0} checked).`,
      );
      await loadEmpireSnapshot();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to backfill embeddings.');
    } finally {
      setSyncingEmbeddings(false);
    }
  };

  const toggleJurisdictionField = async (
    row: JurisdictionRow,
    field: keyof Pick<
      JurisdictionRow,
      'paymentAllowed' | 'payoutAllowed' | 'subscriptionAllowed' | 'prizeAllowed' | 'shippingAllowed'
    >,
  ) => {
    try {
      await apiClient.put(`/jurisdictions/${row.countryCode}`, {
        [field]: !row[field],
      });
      toast.success(`Updated ${row.countryCode} policy (version incremented & audited).`);
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to update jurisdiction.');
    }
  };

  const reviewKyb = async (orgId: string, decision: 'verified' | 'rejected') => {
    try {
      await apiClient.put(`/sponsorships/organizations/${orgId}/kyb-review`, {
        decision,
        notes: `Reviewed in Superadmin Console (${decision}).`,
      });
      toast.success(`Organization marked ${decision}.`);
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to review KYB.');
    }
  };

  const resolveDispute = async (disputeId: string, status: 'resolved_refund' | 'rejected') => {
    try {
      await apiClient.put(`/marketplace/disputes/${disputeId}/resolve`, {
        status,
        resolutionNote: `Resolved via Superadmin queue (${status}).`,
      });
      toast.success(`Dispute updated to ${status}.`);
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to resolve dispute.');
    }
  };

  const savePolicy = async (key: string) => {
    try {
      const parsed = JSON.parse(policyDrafts[key] ?? 'null');
      await apiClient.put(`/admin/policies/${key}`, { value: parsed });
      toast.success(`Policy "${key}" updated and audited.`);
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Invalid JSON value or update failed.');
    }
  };

  const tickCircuit = (liveTick?.circuit as { status?: string } | undefined)?.status;
  const tickSecurity = liveTick?.security as { active_blocks?: number; tracked_actors?: number } | undefined;
  const tickSync = liveTick?.sync as
    | { enabled?: boolean; status?: string; backlog?: number; written?: number }
    | undefined;
  const tickThroughput = liveTick?.throughput as
    | {
        matches_per_sec?: number;
        latency_ms?: { p50?: number | null; p95?: number | null };
        team_latency_ms?: { p50?: number | null; p95?: number | null };
      }
    | undefined;

  const circuitState = tickCircuit || empireSnap?.health?.ai?.circuit || 'closed';
  const syncStatus = tickSync?.status || empireSnap?.health?.sync?.status || 'disabled';
  const syncWritten = tickSync?.written ?? empireSnap?.health?.sync?.written ?? 0;
  const syncBacklog = tickSync?.backlog ?? empireSnap?.health?.sync?.backlog ?? 0;
  const activeBlocks = tickSecurity?.active_blocks ?? empireSnap?.health?.security?.active_blocks ?? 0;
  const p50Ms = tickThroughput?.latency_ms?.p50 ?? empireSnap?.health?.throughput?.latency_ms?.p50 ?? null;
  const p95Ms = tickThroughput?.latency_ms?.p95 ?? empireSnap?.health?.throughput?.latency_ms?.p95 ?? null;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Governance &amp; Operations
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Superadmin Console
              </h1>
            </div>

            {!forbidden && (
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Superadmin sections">
                {(
                  [
                    { id: 'overview', label: 'Overview & Providers', icon: Activity },
                    { id: 'empire', label: 'Empire Builder Live', icon: Radio },
                    { id: 'jurisdictions', label: 'Jurisdictions', icon: Globe },
                    { id: 'queues', label: 'Ops Queues', icon: Shield },
                    { id: 'audit', label: 'Policies & Audit', icon: Sliders },
                  ] as const
                ).map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.id}
                      onClick={() => setTab(t.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                        tab === t.id
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {loading ? (
            <div className="mt-6 h-60 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ) : forbidden ? (
            <div className="mt-8 mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <Lock className="mx-auto h-8 w-8 text-slate-400" />
              <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                Superadmin Access Required
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                This console is strictly restricted to authenticated accounts with the platform admin role.
              </p>
            </div>
          ) : tab === 'empire' ? (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
                      wsConnected
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
                    />
                    {wsConnected ? 'Live WebSocket Connected' : 'REST Polling Active'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Instance: <strong>{empireSnap?.health?.instance_id || 'hyperbuds-production'}</strong> · Mode:{' '}
                    <strong className="uppercase">{empireSnap?.mode || 'live'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void loadEmpireSnapshot()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh Snapshot
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: 'AI Circuit', value: circuitState.toUpperCase() },
                  {
                    label: 'Match Latency (p50/p95)',
                    value: p50Ms !== null ? `${p50Ms}ms / ${p95Ms ?? '-'}ms` : 'Idle (<1m)',
                  },
                  { label: 'Total Matches', value: empireSnap?.health?.totals?.matches ?? 0 },
                  { label: 'Active Blocks', value: `${activeBlocks} (${empireSnap?.health?.totals?.threats_blocked ?? 0} total)` },
                  { label: 'PG Sync Status', value: `${syncStatus} (${syncWritten} rows, q:${syncBacklog})` },
                  {
                    label: 'Vector Embeddings',
                    value: `${empireSnap?.embeddings?.embeddedCount ?? 0} / ${empireSnap?.embeddings?.activePublicProfiles ?? 0}`,
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <p className="text-[11px] text-slate-500">{card.label}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2.5 text-xs">
                  <Cpu className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Auto-Refresh Creator Embeddings ({empireSnap?.embeddings?.model || 'all-MiniLM-L6-v2'})
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sidecar:{' '}
                      <strong>{empireSnap?.embeddings?.embedderHealthy ? 'Online' : 'Standby'}</strong> · Missing or
                      stale active profiles: <strong>{empireSnap?.embeddings?.missingOrStaleCount ?? 0}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={syncingEmbeddings}
                  onClick={handleBackfillEmbeddings}
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
                >
                  {syncingEmbeddings ? 'Syncing...' : 'Sync Missing Embeddings'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Recent &amp; Live Creator Matches ({liveMatches.length})
                  </h2>
                  <div className="mt-3 max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {liveMatches.length === 0 ? (
                      <p className="py-6 text-slate-500">No creator matches recorded yet.</p>
                    ) : (
                      liveMatches.map((m, idx) => (
                        <div
                          key={`${m.request_id || m.id || idx}`}
                          className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                        >
                          <div>
                            <span className="font-mono font-semibold text-slate-900 dark:text-white">
                              {String(m.creator_a || '').slice(-8)} ↔ {String(m.creator_b || '').slice(-8)}
                            </span>
                            <span className="ml-2 text-slate-500">
                              {m.source || 'engine'} {m.fallback ? '(fallback)' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">
                              {Math.round(Number(m.score ?? 0) * 100)}%
                            </span>
                            <span className="text-[10px] tabular-nums text-slate-400">
                              {m.latency_ms !== undefined ? `${m.latency_ms}ms` : ''}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Security Gate Decisions ({liveThreats.length})
                  </h2>
                  <div className="mt-3 max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {liveThreats.length === 0 ? (
                      <p className="py-6 text-slate-500">Zero flagged or blocked threats recorded.</p>
                    ) : (
                      liveThreats.map((th, idx) => (
                        <div
                          key={`${th.id || idx}`}
                          className="flex items-center justify-between gap-2 py-2.5"
                        >
                          <div>
                            <p className="font-mono font-semibold text-slate-900 dark:text-white">
                              {th.end_user_id || th.actor || 'actor'}
                            </p>
                            <p className="text-[11px] text-slate-500">{th.reason || 'security_gate'}</p>
                          </div>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                              th.action === 'blocked'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {th.action || 'flagged'} ({Number(th.risk_score ?? 0).toFixed(2)})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : tab === 'overview' && overview ? (
            <div className="mt-5 space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { label: 'Users', value: overview.metrics.usersTotal },
                  { label: 'Open Reports', value: overview.metrics.openReports },
                  { label: 'Open Disputes', value: overview.metrics.openDisputes },
                  { label: 'Pending KYB', value: overview.metrics.pendingKybOrgs },
                  { label: 'Credit Liability', value: `${overview.metrics.totalCreditLiability} cr` },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <p className="text-[11px] text-slate-500">{m.label}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Provider Readiness Matrix
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {(['cloudinary', 'livekit', 'webPush', 'stripe', 'openai', 'empireBuilderAi'] as const).map(
                    (key) => {
                      const active = Boolean(overview.providers[key]);
                      return (
                        <div
                          key={key}
                          className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800"
                        >
                          <p className="font-medium text-slate-700 dark:text-slate-300">{key}</p>
                          <p
                            className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${
                              active ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {active ? 'Configured' : 'Not configured'}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          ) : tab === 'jurisdictions' ? (
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-3 py-3">Ver</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3">Payout</th>
                    <th className="px-3 py-3">Sub</th>
                    <th className="px-3 py-3">Prizes</th>
                    <th className="px-3 py-3">Shipping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jurisdictions.map((j) => (
                    <tr key={j.countryCode}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {j.countryCode} · {j.countryName}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-slate-500">v{j.version}</td>
                      {(
                        [
                          'paymentAllowed',
                          'payoutAllowed',
                          'subscriptionAllowed',
                          'prizeAllowed',
                          'shippingAllowed',
                        ] as const
                      ).map((field) => (
                        <td key={field} className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => toggleJurisdictionField(j, field)}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              j[field]
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {j[field] ? 'ON' : 'OFF'}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === 'queues' ? (
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Sponsor KYB Reviews ({queues.sponsorKybReviews.length})
                </h2>
                <div className="mt-3 space-y-2.5 text-xs">
                  {queues.sponsorKybReviews.length === 0 ? (
                    <p className="text-slate-500">No pending KYB submissions.</p>
                  ) : (
                    queues.sponsorKybReviews.map((org) => (
                      <div
                        key={String(org._id)}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {String(org.name)} ({String(org.countryCode)})
                          </p>
                          <p className="text-[11px] text-slate-500">{String(org.kybNotes || '')}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => reviewKyb(String(org._id), 'verified')}
                            className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => reviewKyb(String(org._id), 'rejected')}
                            className="rounded-md border border-rose-300 px-2.5 py-1 text-[11px] font-semibold text-rose-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Marketplace Disputes ({queues.marketplaceDisputes.length})
                </h2>
                <div className="mt-3 space-y-2.5 text-xs">
                  {queues.marketplaceDisputes.length === 0 ? (
                    <p className="text-slate-500">No open marketplace disputes.</p>
                  ) : (
                    queues.marketplaceDisputes.map((d) => (
                      <div
                        key={String(d._id)}
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            Order #{String(d.orderId).slice(-8)} · {String(d.reason)}
                          </p>
                          <p className="text-[11px] text-slate-500">Status: {String(d.status)}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => resolveDispute(String(d._id), 'resolved_refund')}
                            className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
                          >
                            Refund
                          </button>
                          <button
                            type="button"
                            onClick={() => resolveDispute(String(d._id), 'rejected')}
                            className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Configurable Policies
                </h2>
                {policies.map((p) => (
                  <div
                    key={p.key}
                    className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">
                        {p.key}
                      </span>
                      <span className="text-[10px] text-slate-500">v{p.version}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">{p.description}</p>
                    <div className="mt-2 flex gap-2">
                      <input
                        aria-label={`Policy value for ${p.key}`}
                        value={policyDrafts[p.key] ?? ''}
                        onChange={(e) =>
                          setPolicyDrafts((prev) => ({ ...prev, [p.key]: e.target.value }))
                        }
                        className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => savePolicy(p.key)}
                        className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Immutable Audit Trail ({auditLogs.length})
                  </h2>
                </div>
                <div className="mt-3 max-h-[460px] divide-y divide-slate-100 overflow-y-auto text-xs dark:divide-slate-800">
                  {auditLogs.length === 0 ? (
                    <p className="py-6 text-slate-500">No admin actions recorded yet.</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log._id} className="flex items-center justify-between gap-2 py-2.5">
                        <div>
                          <span className="font-mono font-semibold text-slate-900 dark:text-white">
                            {log.action}
                          </span>
                          <span className="ml-2 text-slate-500">
                            {log.targetType}:{log.targetId}
                          </span>
                        </div>
                        <span className="text-[10px] tabular-nums text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
