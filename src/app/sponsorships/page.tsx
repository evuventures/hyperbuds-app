'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  Megaphone,
  Plus,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface SponsorOrg {
  _id: string;
  name: string;
  website: string;
  industry: string;
  countryCode: string;
  kybStatus: 'unverified' | 'pending_review' | 'verified' | 'rejected';
  kybNotes?: string;
  memberRole?: string;
}

interface SponsorCampaign {
  _id: string;
  orgId: string;
  orgName?: string;
  orgKybStatus?: string;
  title: string;
  brief: string;
  budgetMinor: number;
  currency: string;
  targetNiches: string[];
  disclosureRequired: boolean;
  ipLicenseTerms: string;
  status: string;
}

interface CampaignAgreement {
  _id: string;
  campaignTitle?: string;
  orgName?: string;
  version: number;
  amountMinor: number;
  currency: string;
  disclosureText: string;
  ipLicenseTerms: string;
  sponsorAcceptedAt?: string | null;
  creatorAcceptedAt?: string | null;
  status: string;
}

function formatMoney(minor: number, currency = 'USD') {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
  }).format((minor || 0) / 100);
}

export default function SponsorshipsPage() {
  const [tab, setTab] = useState<'campaigns' | 'agreements' | 'organizations'>('campaigns');
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [agreements, setAgreements] = useState<CampaignAgreement[]>([]);
  const [orgs, setOrgs] = useState<SponsorOrg[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply modal/inline state
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyPitch, setApplyPitch] = useState('');
  const [applyRateUsd, setApplyRateUsd] = useState('500');

  // Create org state
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgCountry, setOrgCountry] = useState('US');

  // Create campaign state
  const [campOrgId, setCampOrgId] = useState('');
  const [campTitle, setCampTitle] = useState('');
  const [campBrief, setCampBrief] = useState('');
  const [campBudgetUsd, setCampBudgetUsd] = useState('1500');
  const [campNiches, setCampNiches] = useState('tech,creator');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, aRes, oRes] = await Promise.all([
        apiClient.get('/sponsorships/campaigns').catch(() => ({ data: { campaigns: [] } })),
        apiClient.get('/sponsorships/agreements').catch(() => ({ data: { agreements: [] } })),
        apiClient.get('/sponsorships/organizations').catch(() => ({ data: { organizations: [] } })),
      ]);
      const orgList: SponsorOrg[] = Array.isArray(oRes.data?.organizations) ? oRes.data.organizations : [];
      setCampaigns(Array.isArray(cRes.data?.campaigns) ? cRes.data.campaigns : []);
      setAgreements(Array.isArray(aRes.data?.agreements) ? aRes.data.agreements : []);
      setOrgs(orgList);
      if (orgList.length > 0 && !campOrgId) setCampOrgId(orgList[0]._id);
    } finally {
      setLoading(false);
    }
  }, [campOrgId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleApply = async (e: React.FormEvent, campaignId: string) => {
    e.preventDefault();
    try {
      await apiClient.post(`/sponsorships/campaigns/${campaignId}/apply`, {
        pitch: applyPitch.trim(),
        proposedAmountMinor: Math.round(Number(applyRateUsd) * 100),
      });
      toast.success('Application submitted to sponsor.');
      setApplyingId(null);
      setApplyPitch('');
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to submit application.');
    }
  };

  const handleAcceptAgreement = async (agreementId: string) => {
    try {
      await apiClient.post(`/sponsorships/agreements/${agreementId}/accept`);
      toast.success('Agreement acceptance recorded.');
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to accept agreement.');
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/sponsorships/organizations', {
        name: orgName.trim(),
        website: orgWebsite.trim(),
        industry: orgIndustry.trim(),
        countryCode: orgCountry,
      });
      toast.success('Sponsor organization created. Submit KYB to publish open campaigns.');
      setOrgName('');
      setOrgWebsite('');
      setOrgIndustry('');
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to create organization.');
    }
  };

  const handleSubmitKyb = async (orgId: string) => {
    try {
      await apiClient.post(`/sponsorships/organizations/${orgId}/kyb-submit`, {
        notes: 'Submitted for HyperBuds brand KYB verification.',
      });
      toast.success('KYB submitted for Superadmin review.');
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to submit KYB.');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campOrgId) {
      toast.error('Create or select a sponsor organization first.');
      return;
    }
    const selectedOrg = orgs.find((o) => o._id === campOrgId);
    const status = selectedOrg?.kybStatus === 'verified' ? 'open' : 'draft';
    try {
      await apiClient.post('/sponsorships/campaigns', {
        orgId: campOrgId,
        title: campTitle.trim(),
        brief: campBrief.trim(),
        budgetMinor: Math.round(Number(campBudgetUsd) * 100),
        currency: 'USD',
        targetNiches: campNiches
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean),
        status,
      });
      toast.success(
        status === 'open'
          ? 'Campaign published live.'
          : 'Campaign saved as draft (publish once org KYB is verified).',
      );
      setCampTitle('');
      setCampBrief('');
      await loadAll();
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to create campaign.');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Brand Partnerships
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Sponsorships &amp; Campaigns
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                KYB-verified brand briefs, versioned agreements with sponsored disclosures, and provider-mediated milestone governance.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href="/brand/challenges"
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-500"
              >
                Launch Brand Challenge Pool →
              </Link>
              {(
                [
                  { id: 'campaigns', label: `Campaigns (${campaigns.length})`, icon: Megaphone },
                  { id: 'agreements', label: `Agreements (${agreements.length})`, icon: FileCheck2 },
                  { id: 'organizations', label: `Organizations (${orgs.length})`, icon: Building2 },
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
          </div>

          {loading ? (
            <div className="mt-6 h-48 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ) : tab === 'campaigns' ? (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {campaigns.length === 0 ? (
                <div className="col-span-full rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                  <Megaphone className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    No open sponsor campaigns yet
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab('organizations')}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Register a Brand Organization
                  </button>
                </div>
              ) : (
                campaigns.map((camp) => (
                  <article
                    key={camp._id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          {camp.orgName || 'Sponsor'}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {camp.status}
                        </span>
                      </div>
                      <h2 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                        {camp.title}
                      </h2>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{camp.brief}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Budget: {formatMoney(camp.budgetMinor, camp.currency)}
                        </span>
                        {camp.targetNiches?.map((n) => (
                          <span
                            key={n}
                            className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            #{n}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        IP License: {camp.ipLicenseTerms} · Paid partnership disclosure required.
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      {applyingId === camp._id ? (
                        <form onSubmit={(e) => handleApply(e, camp._id)} className="space-y-2">
                          <textarea
                            required
                            rows={2}
                            value={applyPitch}
                            onChange={(e) => setApplyPitch(e.target.value)}
                            placeholder="Share your content angle, audience fit, and timeline..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={applyRateUsd}
                              onChange={(e) => setApplyRateUsd(e.target.value)}
                              placeholder="Proposed USD"
                              className="w-32 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                            >
                              <Send className="h-3 w-3" />
                              Submit Application
                            </button>
                            <button
                              type="button"
                              onClick={() => setApplyingId(null)}
                              className="text-xs text-slate-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          disabled={camp.status !== 'open'}
                          onClick={() => setApplyingId(camp._id)}
                          className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900"
                        >
                          {camp.status === 'open' ? 'Apply to Campaign' : 'Draft Campaign'}
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : tab === 'agreements' ? (
            <div className="mt-5 space-y-3">
              {agreements.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                  No sponsorship agreements yet.
                </div>
              ) : (
                agreements.map((agr) => (
                  <div
                    key={agr._id}
                    className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {agr.campaignTitle || 'Campaign Agreement'} · {agr.orgName} (v{agr.version})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Agreed Amount: {formatMoney(agr.amountMinor, agr.currency)}
                        </p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {agr.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      {agr.disclosureText}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Note: HyperBuds does not operate unlicensed escrow. Milestone payouts execute only through an approved payment/payout provider.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${agr.sponsorAcceptedAt ? 'text-emerald-500' : 'text-slate-300'}`}
                        />
                        Sponsor accepted
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${agr.creatorAcceptedAt ? 'text-emerald-500' : 'text-slate-300'}`}
                        />
                        Creator accepted
                      </span>
                      {agr.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handleAcceptAgreement(agr._id)}
                          className="ml-auto rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                        >
                          Accept Terms
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Your Sponsor Organizations
                </h2>
                {orgs.map((o) => (
                  <div
                    key={o._id}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {o.name}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        KYB: {o.kybStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {o.industry || 'Brand'} · {o.countryCode} · Role: {o.memberRole || 'member'}
                    </p>
                    {o.kybStatus === 'unverified' && (
                      <button
                        type="button"
                        onClick={() => handleSubmitKyb(o._id)}
                        className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                      >
                        Submit for KYB Verification
                      </button>
                    )}
                  </div>
                ))}

                <form
                  onSubmit={handleCreateOrg}
                  className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Register New Sponsor Organization
                  </h3>
                  <input
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Brand / Agency Name"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={orgIndustry}
                      onChange={(e) => setOrgIndustry(e.target.value)}
                      placeholder="Industry (e.g. Audio Tech)"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <input
                      value={orgCountry}
                      onChange={(e) => setOrgCountry(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="ISO-2 (US)"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <input
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                    placeholder="https://brand.example"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Create Organization
                  </button>
                </form>
              </div>

              <form
                onSubmit={handleCreateCampaign}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-6"
              >
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Create Campaign Brief
                </h2>
                <select
                  value={campOrgId}
                  onChange={(e) => setCampOrgId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Select Sponsor Organization</option>
                  {orgs.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.kybStatus})
                    </option>
                  ))}
                </select>
                <input
                  required
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="Campaign title"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <textarea
                  required
                  rows={4}
                  value={campBrief}
                  onChange={(e) => setCampBrief(e.target.value)}
                  placeholder="Deliverables, messaging guidelines, disclosure requirements..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={campBudgetUsd}
                    onChange={(e) => setCampBudgetUsd(e.target.value)}
                    placeholder="Budget (USD)"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <input
                    value={campNiches}
                    onChange={(e) => setCampNiches(e.target.value)}
                    placeholder="Target niches (comma separated)"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Create Campaign
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
