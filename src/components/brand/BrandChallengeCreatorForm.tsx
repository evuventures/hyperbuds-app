'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  Coins,
  Link2,
  Loader2,
  PenSquare,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';

interface RuleStep {
  title: string;
  instruction: string;
}

interface RegionOption {
  code: string;
  label: string;
}

interface BrandChallengeCreatorFormProps {
  primaryBrandName: string;
  walletBalanceCredits: number;
  aiDraftCostCredits: number;
  regions: RegionOption[];
  onCreated: () => void;
  onBalanceChange: (nextBalance: number) => void;
}

export function BrandChallengeCreatorForm({
  primaryBrandName,
  walletBalanceCredits,
  aiDraftCostCredits,
  regions,
  onCreated,
  onBalanceChange,
}: BrandChallengeCreatorFormProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [brandName, setBrandName] = useState(primaryBrandName || '');
  const [region, setRegion] = useState('NG');

  // AI Draft prompt state
  const [aiPrompt, setAiPrompt] = useState('');
  const [draftingAi, setDraftingAi] = useState(false);
  const [aiDraftReady, setAiDraftReady] = useState(false);
  const [modelVersion, setModelVersion] = useState('manual');

  // Challenge fields (shared by Manual & AI-populated review)
  const [title, setTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [promoUrl, setPromoUrl] = useState('');
  const [promoLabel, setPromoLabel] = useState('Shop / Try Now');
  const [rules, setRules] = useState<RuleStep[]>([
    { title: 'Hook Viewers in 3 Seconds', instruction: '' },
    { title: 'Feature Brand Naturally', instruction: '' },
    { title: 'Tag & Add Brand Link', instruction: '' },
  ]);

  // Reward Pool config
  const [poolMode, setPoolMode] = useState<'credits' | 'external'>('credits');
  const [totalPoolCredits, setTotalPoolCredits] = useState('500');
  const [rewardPerCreator, setRewardPerCreator] = useState('25');
  const [externalPrizeNote, setExternalPrizeNote] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleGenerateWithAi = async () => {
    if (aiPrompt.trim().length < 10) {
      toast.error('Describe your campaign goal in at least 10 characters first.');
      return;
    }
    if (walletBalanceCredits < aiDraftCostCredits) {
      toast.error(`You need ${aiDraftCostCredits} Wallet Credits to use AI Challenge Generation.`);
      return;
    }

    setDraftingAi(true);
    try {
      const res = await apiClient.post('/brand-challenges/ai-draft', {
        prompt: aiPrompt.trim(),
        brandName: brandName.trim() || primaryBrandName,
        region,
        customHashtag: hashtag.trim() || undefined,
      });
      const draft = res.data?.draft;
      if (draft) {
        setTitle(draft.title || '');
        setBrief(draft.brief || '');
        setHashtag(draft.hashtag || '');
        setTrendingTags(Array.isArray(draft.trendingTags) ? draft.trendingTags : []);
        if (Array.isArray(draft.rules) && draft.rules.length > 0) {
          setRules(
            draft.rules.map((r: { title?: string; instruction?: string }) => ({
              title: r.title || 'Step',
              instruction: r.instruction || '',
            })),
          );
        }
        setModelVersion(draft.modelVersion || 'brand-ai');
        setAiDraftReady(true);
      }
      if (typeof res.data?.balanceAfter === 'number') {
        onBalanceChange(res.data.balanceAfter);
      }
      toast.success(`AI Challenge drafted (-${aiDraftCostCredits} Credits)! Review and publish below.`);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Could not generate AI challenge.';
      toast.error(msg);
    } finally {
      setDraftingAi(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brief.trim()) {
      toast.error('Challenge Title and Brief are required.');
      return;
    }
    const poolNum = poolMode === 'credits' ? Math.max(0, Math.trunc(Number(totalPoolCredits) || 0)) : 0;
    const perCreatorNum = poolMode === 'credits' ? Math.max(1, Math.trunc(Number(rewardPerCreator) || 10)) : 0;

    if (poolMode === 'credits' && poolNum < perCreatorNum) {
      toast.error('Total Credit Pool must be at least equal to Reward per Creator.');
      return;
    }
    if (poolMode === 'credits' && poolNum > walletBalanceCredits) {
      toast.error(`Insufficient Wallet Credits for a ${poolNum}-credit prize pool.`);
      return;
    }

    setPublishing(true);
    try {
      const res = await apiClient.post('/brand-challenges', {
        creationMode: mode,
        brandName: brandName.trim() || primaryBrandName,
        region,
        title: title.trim(),
        brief: brief.trim(),
        hashtag: hashtag.trim(),
        trendingTags,
        promoUrl: promoUrl.trim(),
        promoLabel: promoLabel.trim() || 'Visit Brand',
        aiPrompt: mode === 'ai' ? aiPrompt.trim() : undefined,
        aiCreditsCharged: mode === 'ai' && aiDraftReady ? aiDraftCostCredits : 0,
        modelVersion,
        rules: rules.filter((r) => r.instruction.trim().length > 0),
        totalPoolCredits: poolNum,
        rewardCreditsPerCreator: perCreatorNum,
        externalPrizeNote: externalPrizeNote.trim() || undefined,
      });
      if (typeof res.data?.walletBalanceAfter === 'number') {
        onBalanceChange(res.data.walletBalanceAfter);
      }
      toast.success('Brand Challenge published live!');
      setTitle('');
      setBrief('');
      setHashtag('');
      setAiPrompt('');
      setAiDraftReady(false);
      onCreated();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Could not publish Brand Challenge.';
      toast.error(msg);
    } finally {
      setPublishing(false);
    }
  };

  const updateRule = (idx: number, field: keyof RuleStep, val: string) => {
    setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Create a Sponsored Micro-Influencer Challenge
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate with AI ({aiDraftCostCredits} Credits) or build manually for free.
          </p>
        </div>

        {/* Two Creation Modes Switcher */}
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
              mode === 'ai'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <Wand2 className="h-3.5 w-3.5" />
            AI Generator ({aiDraftCostCredits} CR)
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
              mode === 'manual'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
            }`}
          >
            <PenSquare className="h-3.5 w-3.5" />
            Manual Builder (Free)
          </button>
        </div>
      </div>

      {mode === 'ai' && (
        <div className="mt-5 rounded-2xl border border-purple-200/80 bg-purple-50/50 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-200">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Describe your campaign goal &amp; target vibe
            </span>
            <span className="rounded-full bg-purple-600/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-400/15 dark:text-purple-300">
              Costs {aiDraftCostCredits} Credits · Auto-refunded on error
            </span>
          </div>

          <textarea
            rows={3}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Example: Launch our student zero-fee dollar card in Lagos. Creators should film a funny 30-second 'expectation vs reality' skit paying online subscriptions without card declines..."
            className="mt-2.5 w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {walletBalanceCredits < aiDraftCostCredits ? (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Your balance is {walletBalanceCredits} Credits ({aiDraftCostCredits} needed).{' '}
                <Link href="/payments/wallet" className="font-bold underline">
                  Top up Wallet Credits →
                </Link>
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI pairs your brief with live regional trending hashtags automatically.
              </p>
            )}

            <button
              type="button"
              disabled={draftingAi || walletBalanceCredits < aiDraftCostCredits}
              onClick={() => void handleGenerateWithAi()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-500 disabled:opacity-50"
            >
              {draftingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {draftingAi ? 'Drafting with AI...' : `Generate Challenge (${aiDraftCostCredits} Credits)`}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handlePublish} className="mt-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Brand Display Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Your Brand Name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Region &amp; Trends
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {(regions.length > 0
                ? regions
                : [
                    { code: 'NG', label: 'Nigeria · Lagos' },
                    { code: 'GLOBAL', label: 'Global Trending' },
                    { code: 'US', label: 'United States' },
                    { code: 'GB', label: 'United Kingdom' },
                  ]
              ).map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Campaign Hashtag (no #)
            </label>
            <input
              type="text"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value.replace(/^#+/, ''))}
              placeholder="e.g. PayWaveCampus"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Challenge Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The 30-Second Zero-Decline Checkout Challenge"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Creator Brief &amp; Deliverable Instructions *
          </label>
          <textarea
            rows={3}
            required
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Tell micro-influencers what to film, what key message to mention, and how to win..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Promo CTA Link for Click-Through Rate Tracking */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination Link (Tracked for Post Click Rate / CTR %)
            </label>
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={promoUrl}
                onChange={(e) => setPromoUrl(e.target.value)}
                placeholder="https://yourbrand.com/offer"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              CTA Button Label
            </label>
            <input
              type="text"
              value={promoLabel}
              onChange={(e) => setPromoLabel(e.target.value)}
              placeholder="Shop Now / Try Free"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Step-by-step Creator Rules */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Creator Steps / Rules
            </span>
            {rules.length < 5 && (
              <button
                type="button"
                onClick={() => setRules((prev) => [...prev, { title: `Step ${prev.length + 1}`, instruction: '' }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
              >
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            )}
          </div>
          {rules.map((r, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[11px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {idx + 1}
              </span>
              <input
                type="text"
                value={r.title}
                onChange={(e) => updateRule(idx, 'title', e.target.value)}
                placeholder="Step title"
                className="w-40 shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                value={r.instruction}
                onChange={(e) => updateRule(idx, 'instruction', e.target.value)}
                placeholder="What should the creator do in this step?"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRules((prev) => prev.filter((_, i) => i !== idx))}
                  className="mt-1.5 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Reward Pool Setup */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Coins className="h-4 w-4 text-amber-500" />
              Creator Reward Pool
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setPoolMode('credits')}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  poolMode === 'credits' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Wallet Credit Pool
              </button>
              <button
                type="button"
                onClick={() => setPoolMode('external')}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  poolMode === 'external' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                0-Credit / Product Prize
              </button>
            </div>
          </div>

          {poolMode === 'credits' ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Total Credit Pool
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalPoolCredits}
                  onChange={(e) => setTotalPoolCredits(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Credits Paid per Verified Creator
                </label>
                <input
                  type="number"
                  min="1"
                  value={rewardPerCreator}
                  onChange={(e) => setRewardPerCreator(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="flex flex-col justify-center rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="font-bold">
                  Rewards up to{' '}
                  {Math.max(0, Math.floor((Number(totalPoolCredits) || 0) / Math.max(1, Number(rewardPerCreator) || 1)))}{' '}
                  verified creators
                </span>
                <span className="text-[11px] opacity-80">+25 Rizz Score per finisher</span>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <input
                type="text"
                value={externalPrizeNote}
                onChange={(e) => setExternalPrizeNote(e.target.value)}
                placeholder="Optional prize note (e.g. Top 5 creators win VIP merch box + $100 voucher)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {publishing ? 'Publishing Challenge...' : 'Publish Brand Challenge'}
          </button>
        </div>
      </form>
    </section>
  );
}
