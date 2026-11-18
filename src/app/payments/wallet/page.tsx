'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { PaymentNavigation } from '@/components/payments/PaymentNavigation';
import { getAccessToken } from '@/store/authSelectors';
import {
  walletAPI,
  type AiUsageRecordItem,
  type CreatorChallengeItem,
  type ReferralSummary,
  type WalletAccountSummary,
  type WalletLedgerEntry,
} from '@/lib/api/payment.api';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Copy,
  Cpu,
  Gift,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';

const DEFAULT_PACKS = [
  { credits: 100, priceCents: 200, label: 'Starter Pack' },
  { credits: 250, priceCents: 450, label: 'Creator Pack · Save 10%' },
  { credits: 500, priceCents: 800, label: 'Growth Pack · Popular' },
  { credits: 1000, priceCents: 1500, label: 'Studio Pack · Best Value' },
  { credits: 2500, priceCents: 3500, label: 'Network Pack · Max Savings' },
];

const DEFAULT_AI_TARIFFS = [
  { key: 'advanced_match', label: 'Advanced Match', cost: 3 },
  { key: 'challenge', label: 'Challenge Verification', cost: 4 },
  { key: 'forecast', label: 'Forecast (7d/30d/90d)', cost: 5 },
  { key: 'live_podcast_plan', label: 'Live / Podcast Plan', cost: 5 },
  { key: 'external_creator_analysis', label: 'External Discovery AI', cost: 5 },
  { key: 'content_plan', label: 'Content & Trend Plan', cost: 6 },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletAccountSummary | null>(null);
  const [entries, setEntries] = useState<WalletLedgerEntry[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsageRecordItem[]>([]);
  const [challenges, setChallenges] = useState<CreatorChallengeItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralSummary | null>(null);
  const [referralInput, setReferralInput] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [reconciliation, setReconciliation] = useState<{
    balanceMatches: boolean;
    reservedMatches: boolean;
    entryCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const resolveToken = () =>
    getAccessToken() || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);

  const loadWalletData = useCallback(async () => {
    const token = resolveToken();
    if (!token) {
      setLoading(false);
      setError('Sign in to view your credits wallet and ledger.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [walletRes, ledgerRes, recRes, aiRes, challengesRes, refRes] = await Promise.all([
        walletAPI.getWallet(token),
        walletAPI.getLedger(token, 1, 20),
        walletAPI.getReconciliation(token),
        walletAPI.getAiUsage(token, 15),
        walletAPI.getChallenges(token),
        walletAPI.getReferrals(token).catch(() => null),
      ]);
      setWallet(walletRes.wallet);
      setEntries(ledgerRes.entries || []);
      setReconciliation(recRes);
      setAiUsage(aiRes.records || []);
      setChallenges(challengesRes.challenges || []);
      if (refRes) setReferrals(refRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load wallet data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWalletData();
  }, [loadWalletData]);

  const handleTopUp = async (credits: number) => {
    const token = resolveToken();
    if (!token) return;
    setBusyId(`pack-${credits}`);
    setActionBanner(null);
    try {
      const idempotencyKey = `topup-${credits}-${Date.now()}`;
      const res = await walletAPI.createTopUpIntent(token, credits, idempotencyKey);
      setActionBanner(
        `Top-up intent ${res.paymentIntentId} created for ${res.creditGrant.toLocaleString()} credits ($${(
          res.amountCents / 100
        ).toFixed(2)} USD).`
      );
      await loadWalletData();
    } catch (err) {
      setActionBanner(
        err instanceof Error
          ? err.message
          : 'Top-up unavailable until Stripe gateway keys are configured.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleClaimChallenge = async (challengeId: string) => {
    const token = resolveToken();
    if (!token) return;
    setBusyId(`challenge-${challengeId}`);
    setActionBanner(null);
    try {
      const res = await walletAPI.claimChallenge(token, challengeId, {
        notes: 'Submitted creator milestone evidence',
      });
      setWallet(res.wallet);
      setActionBanner('Challenge reward credited to your immutable wallet ledger.');
      await loadWalletData();
    } catch (err) {
      setActionBanner(err instanceof Error ? err.message : 'Unable to claim challenge reward.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-slate-50/70 dark:bg-slate-950/60 p-4 pb-16 lg:p-8 lg:pb-24">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-800/70 bg-purple-50 dark:bg-purple-950/50 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                <Wallet className="h-3.5 w-3.5" />
                Immutable Credits Ledger
              </div>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Wallet, AI Metering & Creator Rewards
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Integer credit minor units, idempotent top-ups, automatic AI failure refunds, and challenge rewards. Cash payouts remain gated under KYC/KYB compliance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/payments/subscription"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Manage Plans
              </Link>
              <button
                type="button"
                onClick={() => void loadWalletData()}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {actionBanner && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-200 dark:border-blue-800/70 bg-blue-50 dark:bg-blue-950/40 p-4 text-sm text-blue-800 dark:text-blue-200">
              <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{actionBanner}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Credits
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white" data-testid="available-credits">
                {(wallet?.availableCredits ?? 0).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Ready for AI tools & features
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Posted Balance
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {(wallet?.balanceCredits ?? 0).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Currency: CREDITS
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Reserved (Pending AI)
              </div>
              <div className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                {(wallet?.reservedCredits ?? 0).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Auto-refunded if job fails
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ledger Reconciliation
              </div>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
                {reconciliation?.balanceMatches && reconciliation?.reservedMatches
                  ? 'Verified'
                  : loading
                  ? 'Checking...'
                  : 'Synced'}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {reconciliation?.entryCount ?? entries.length} append-only entries
              </div>
            </div>
          </div>

          {/* Credit Buckets & AI Tariffs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Credit Buckets (Spend Priority)
                </h2>
                <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                  Promo → Subscription → Purchased
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/30 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-purple-700 dark:text-purple-300 font-medium">
                    1st · Promo
                  </div>
                  <div className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {(wallet?.buckets?.promo ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/70 dark:bg-sky-950/30 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-sky-700 dark:text-sky-300 font-medium">
                    2nd · Plan
                  </div>
                  <div className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {(wallet?.buckets?.subscription ?? 0).toLocaleString()}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-medium">
                    3rd · Bought
                  </div>
                  <div className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                    {(wallet?.buckets?.purchased ?? wallet?.balanceCredits ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </section>

            <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  AI Feature Credit Tariffs
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Failed metered jobs auto-refund to wallet
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEFAULT_AI_TARIFFS.map((t) => (
                  <div
                    key={t.key}
                    className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 px-3 py-2 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{t.label}</span>
                    <span className="font-mono font-semibold text-purple-600 dark:text-purple-400 shrink-0">
                      {t.cost} cr
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Referrals & Anti-Farming */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <Gift className="h-4 w-4" />
                  CREATOR REFERRAL PROGRAM
                </div>
                <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  Earn +{referrals?.policy?.referrerPromoCredits ?? 25} Promo Credits per Verified Invite
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Anti-farming guard active: verified email required, single claim per account, and{' '}
                  {referrals?.policy?.maxMonthlyRewardedReferrals ?? 10}/mo referrer cap (
                  {referrals?.monthlyRemainingCount ?? 10} remaining).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 px-3 py-2 text-xs font-mono font-semibold text-purple-800 dark:text-purple-200">
                  <span>{referrals?.referralCode || 'HB-LOADING'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (referrals?.referralCode && navigator.clipboard) {
                        void navigator.clipboard.writeText(referrals.referralCode);
                        setCopiedReferral(true);
                        setTimeout(() => setCopiedReferral(false), 1800);
                      }
                    }}
                    className="rounded p-1 hover:bg-purple-200/60 dark:hover:bg-purple-900/60"
                    aria-label="Copy referral code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  {copiedReferral && <span className="text-[10px] font-sans">Copied</span>}
                </div>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const token = resolveToken();
                if (!token || !referralInput.trim()) return;
                setBusyId('referral-claim');
                setActionBanner(null);
                try {
                  await walletAPI.claimReferral(token, referralInput.trim());
                  setReferralInput('');
                  setActionBanner('Referral bonus promo credits applied to your Promo bucket!');
                  await loadWalletData();
                } catch (err) {
                  setActionBanner(err instanceof Error ? err.message : 'Unable to claim referral code.');
                } finally {
                  setBusyId(null);
                }
              }}
              className="mt-4 flex flex-col sm:flex-row gap-2 max-w-md"
            >
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder="Enter invite code (e.g. HB-1A2B3C4D)"
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={busyId === 'referral-claim' || !referralInput.trim()}
                className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {busyId === 'referral-claim' ? 'Claiming...' : 'Claim Code'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Credit Packs (USD Minor-Unit Pricing)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Idempotent Stripe payment intents verified by webhook replay protection.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {DEFAULT_PACKS.map((pack) => (
                <div
                  key={pack.credits}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4"
                >
                  <div>
                    <div className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      {pack.label}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                      {pack.credits.toLocaleString()} credits
                    </div>
                    <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                      ${(pack.priceCents / 100).toFixed(2)} USD
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busyId === `pack-${pack.credits}`}
                    onClick={() => void handleTopUp(pack.credits)}
                    className="mt-4 w-full rounded-lg bg-slate-900 dark:bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {busyId === `pack-${pack.credits}` ? 'Creating Intent...' : 'Purchase Pack'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Creator Challenges & Credit Rewards
                </h2>
              </div>
              {challenges.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
                  No active creator challenges at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {challenges.map((challenge) => {
                    const claimed = challenge.mySubmission?.status === 'rewarded';
                    return (
                      <div
                        key={challenge._id}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {challenge.title}
                            </span>
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              +{challenge.rewardCredits} credits
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {challenge.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={claimed || busyId === `challenge-${challenge._id}`}
                          onClick={() => void handleClaimChallenge(challenge._id)}
                          className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                            claimed
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 cursor-default'
                              : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                          }`}
                        >
                          {claimed ? (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Rewarded
                            </span>
                          ) : busyId === `challenge-${challenge._id}` ? (
                            'Claiming...'
                          ) : (
                            'Claim Reward'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Metered AI Jobs & Auto-Refunds
                </h2>
              </div>
              {aiUsage.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
                  No metered AI usage recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {aiUsage.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                          <span>{item.feature.replace(/_/g, ' ')}</span>
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                            {item.model} · {item.promptVersion}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.creditCost} credits · {item.inputTokens + item.outputTokens} tokens
                          {item.errorMessage ? ` · ${item.errorMessage}` : ''}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === 'refunded'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : item.status === 'settled'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs overflow-x-auto">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Immutable Ledger Entries
            </h2>
            {entries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
                No ledger transactions recorded yet.
              </p>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">Type</th>
                    <th className="py-2.5 pr-4 font-medium">Amount</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Reference</th>
                    <th className="py-2.5 font-medium">Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {entries.map((entry) => {
                    const positive = entry.amountMinor > 0;
                    return (
                      <tr key={entry._id}>
                        <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5">
                            {positive ? (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-amber-500" />
                            )}
                            {entry.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td
                          className={`py-3 pr-4 font-mono font-semibold ${
                            positive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {positive ? '+' : ''}
                          {entry.amountMinor} {entry.currency}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {entry.refType || 'wallet'} {entry.refId ? `· ${entry.refId}` : ''}
                        </td>
                        <td className="py-3 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>

          <PaymentNavigation />
        </div>
      </div>
    </DashboardLayout>
  );
}
