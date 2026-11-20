'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  Activity,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
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

export default function SuperadminPage() {
  const [tab, setTab] = useState<'overview' | 'jurisdictions' | 'queues' | 'audit'>('overview');
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
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

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
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'overview', label: 'Overview & Providers', icon: Activity },
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
