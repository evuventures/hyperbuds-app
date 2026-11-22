'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  Sparkles,
  Wand2,
  Wallet,
  Zap,
} from 'lucide-react';
import { CardGridSkeleton } from '@/components/ui/AppSkeletons';

interface RankedAiMatch {
  id?: string;
  source: 'hyperbuds' | 'external';
  platform: string;
  handle: string;
  displayName: string;
  avatar: string;
  bio: string;
  profileUrl: string;
  niches: string[];
  compatibilityScore: number;
  detailedAnalysis?: string;
  projectedGrowth?: {
    estimatedReachLift: string;
    estimatedEngagementBoost: string;
    estimatedNewFollowers: string;
    bestFormat: string;
  };
  matchReasons: string[];
  collabIdea: string;
  outreachPitch: string;
  provenance: string;
  measuredMetrics?: Record<string, unknown>;
}

const EXAMPLE_PROMPTS = [
  'Find me energetic tech & AI podcasters who love discussing creator tools for a 2-part collab',
  'Match me with funny lifestyle or comedy creators for a 7-day viral Reels challenge',
  'Find startup founders and business creators building in Africa or the UK for a podcast interview',
];

export function AiMatchStudioPanel({ mode }: { mode: 'external' | 'prompt' }) {
  // External AI Match state
  const [extQuery, setExtQuery] = useState('');
  const [extPlatform, setExtPlatform] = useState<'all' | 'tiktok' | 'podcast' | 'bluesky' | 'youtube'>('all');

  // Custom Prompt Match ($10 / 500 credits) state
  const [customPrompt, setCustomPrompt] = useState('');
  const [includeExternal, setIncludeExternal] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsCredits, setNeedsCredits] = useState(false);
  const [matches, setMatches] = useState<RankedAiMatch[]>([]);
  const [meta, setMeta] = useState<{
    creditsCharged?: number;
    balanceAfter?: number;
    modelVersion?: string;
    provenance?: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runExternalAiMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsCredits(false);
    try {
      const res = await apiClient.post('/matching/external/ai-match', {
        query: extQuery.trim() || undefined,
        platform: extPlatform,
        limit: 9,
      });
      setMatches(Array.isArray(res.data?.matches) ? res.data.matches : []);
      setMeta({
        creditsCharged: res.data?.creditsCharged,
        balanceAfter: res.data?.balanceAfter,
        modelVersion: res.data?.modelVersion,
        provenance: res.data?.provenance,
      });
      toast.success(`Found ${res.data?.matches?.length ?? 0} AI-ranked external matches!`);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const msg = err?.response?.data?.message || err?.message || 'External AI match failed.';
      if (status === 402) setNeedsCredits(true);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const runPromptMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim().length < 10) {
      setError('Describe your ideal collaborator in at least 10 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    setNeedsCredits(false);
    try {
      const res = await apiClient.post('/matching/prompt-match', {
        prompt: customPrompt.trim(),
        includeExternal,
        limit: 9,
      });
      setMatches(Array.isArray(res.data?.matches) ? res.data.matches : []);
      setMeta({
        creditsCharged: res.data?.creditsCharged,
        balanceAfter: res.data?.balanceAfter,
        modelVersion: res.data?.modelVersion,
        provenance: res.data?.provenance,
      });
      toast.success(`Custom AI Prompt Match complete! (${res.data?.creditsCharged ?? 500} credits used)`);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const msg = err?.response?.data?.message || err?.message || 'Custom Prompt Match failed.';
      if (status === 402) setNeedsCredits(true);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = async (key: string, pitch: string) => {
    try {
      await navigator.clipboard.writeText(pitch);
      setCopiedKey(key);
      toast.success('AI outreach pitch + your HyperBuds invite link copied!');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Could not copy pitch');
    }
  };

  return (
    <div className="space-y-6">
      {mode === 'external' ? (
        <form
          onSubmit={runExternalAiMatch}
          className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-xl space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-[11px] font-bold text-purple-200">
                <Globe2 className="h-3.5 w-3.5" />
                Free Public Creator Discovery + AI Ranking
              </span>
              <h2 className="mt-2 text-lg font-bold text-white">
                External AI Creator Match
              </h2>
              <p className="mt-0.5 text-xs text-slate-300">
                Discovers real public creators from TikTok, YouTube, Apple Podcasts, and Bluesky, ranks the best fits with AI, and writes a 1-click invite pitch with your referral link.
              </p>
            </div>
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-400/30">
              5 Credits / search
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
            <input
              type="text"
              value={extQuery}
              onChange={(e) => setExtQuery(e.target.value)}
              placeholder="Niche, topic, or paste a TikTok video URL (e.g. Afrobeats, AI tech, Comedy)"
              className="sm:col-span-6 rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:border-purple-400 focus:outline-none"
            />
            <select
              value={extPlatform}
              onChange={(e) => setExtPlatform(e.target.value as any)}
              className="sm:col-span-3 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-xs text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Sources (TikTok + YT + Podcasts + Bluesky)</option>
              <option value="tiktok">TikTok Creators</option>
              <option value="youtube">YouTube Channels</option>
              <option value="podcast">Apple Podcasts</option>
              <option value="bluesky">Bluesky Creators</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-purple-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'AI Matching...' : 'Find Matches (5 cr)'}
            </button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={runPromptMatch}
          className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-purple-950/70 via-[#19102c] to-slate-950/90 p-5 backdrop-blur-xl space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-200">
                <Wand2 className="h-3.5 w-3.5" />
                Premium Custom AI Prompt Match
              </span>
              <h2 className="mt-2 text-lg font-bold text-white">
                Describe Your Exact Dream Collaborator
              </h2>
              <p className="mt-0.5 text-xs text-slate-300">
                Tell our AI exactly who you want to work with (niche, vibe, format, region, audience). Searches both HyperBuds and external creators with deep AI ranking, custom collab concepts, and personalized outreach pitches.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-400/35 bg-amber-400/10 px-3.5 py-2 text-right">
              <p className="text-xs font-extrabold text-amber-200">500 Credits</p>
              <p className="text-[10px] text-amber-100/80">$10.00 worth · auto-refund on error</p>
            </div>
          </div>

          <textarea
            rows={3}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Find me witty tech & creator-economy podcasters or YouTubers who love filming 60-second debates and want to cross-promote this week..."
            className="w-full rounded-2xl border border-white/15 bg-black/35 p-3.5 text-sm text-white placeholder:text-slate-400 focus:border-purple-400 focus:outline-none"
          />

          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCustomPrompt(ex)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-slate-300 transition hover:border-purple-400 hover:text-white"
              >
                {ex.slice(0, 56)}…
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeExternal}
                onChange={(e) => setIncludeExternal(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-purple-600"
              />
              Include external creators (TikTok, YouTube, Podcasts, Bluesky)
            </label>

            <button
              type="submit"
              disabled={loading || customPrompt.trim().length < 10}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {loading ? 'Running Deep AI Match...' : 'Run Custom Prompt Match (500 cr · $10)'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/35 bg-rose-950/40 px-4 py-3 text-xs text-rose-200">
          <span>{error}</span>
          {needsCredits && (
            <Link
              href="/payments/wallet"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-50"
            >
              <Wallet className="h-3.5 w-3.5" />
              Top Up Wallet Credits
            </Link>
          )}
        </div>
      )}

      {meta && matches.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] text-slate-300">
          <span>
            Ranked by <strong className="text-white">{meta.modelVersion || 'AI'}</strong> · Label:{' '}
            <strong className="text-purple-300">AI Match Estimate</strong>
          </span>
          {typeof meta.creditsCharged === 'number' && (
            <span>
              Charged <strong className="text-amber-300">{meta.creditsCharged} cr</strong>
              {typeof meta.balanceAfter === 'number' ? ` · Balance: ${meta.balanceAfter} cr` : ''}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <CardGridSkeleton count={6} columns={3} darkSurface />
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((m, idx) => {
            const key = `${m.platform}:${m.handle}:${idx}`;
            return (
              <article
                key={key}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-white/15 bg-white/[0.05] p-5 backdrop-blur-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {m.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.avatar}
                          alt={m.displayName}
                          className="h-11 w-11 shrink-0 rounded-full border border-white/20 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                          {m.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="inline-block rounded-full bg-purple-500/25 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-200">
                          {m.source === 'hyperbuds' ? 'HyperBuds' : m.platform}
                        </span>
                        <h3 className="mt-0.5 truncate text-sm font-bold text-white">{m.displayName}</h3>
                        <p className="truncate text-[11px] text-slate-400">@{m.handle}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-extrabold text-emerald-300">
                      {m.compatibilityScore}% fit
                    </span>
                  </div>

                  {m.bio && <p className="line-clamp-2 text-xs text-slate-400">{m.bio}</p>}

                  {m.detailedAnalysis && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-slate-200">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                        Why You’re a Fit
                      </p>
                      <p>{m.detailedAnalysis}</p>
                    </div>
                  )}

                  {m.projectedGrowth && (
                    <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/30 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          Projected Collab Growth
                        </span>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-200">
                          AI Estimate
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="rounded-lg bg-black/25 px-2.5 py-1.5">
                          <p className="text-[9px] text-slate-400">Reach Lift</p>
                          <p className="font-bold text-emerald-300">{m.projectedGrowth.estimatedReachLift}</p>
                        </div>
                        <div className="rounded-lg bg-black/25 px-2.5 py-1.5">
                          <p className="text-[9px] text-slate-400">Engagement</p>
                          <p className="font-bold text-emerald-300">{m.projectedGrowth.estimatedEngagementBoost}</p>
                        </div>
                        <div className="rounded-lg bg-black/25 px-2.5 py-1.5">
                          <p className="text-[9px] text-slate-400">Est. New Followers</p>
                          <p className="font-bold text-white">{m.projectedGrowth.estimatedNewFollowers}</p>
                        </div>
                        <div className="rounded-lg bg-black/25 px-2.5 py-1.5">
                          <p className="text-[9px] text-slate-400">Best Format</p>
                          <p className="truncate font-bold text-purple-200" title={m.projectedGrowth.bestFormat}>
                            {m.projectedGrowth.bestFormat}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-1 text-[11px] text-slate-200">
                    {m.matchReasons.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-purple-400" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-xl border border-purple-500/25 bg-purple-950/40 p-2.5 text-[11px] text-purple-100">
                    <span className="font-bold text-purple-300">AI Collab Idea: </span>
                    {m.collabIdea}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => void handleCopyPitch(key, m.outreachPitch)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-purple-500"
                  >
                    {copiedKey === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey === key ? 'Copied Pitch + Invite!' : 'Copy AI Pitch & Invite'}
                  </button>
                  {m.profileUrl && (
                    <a
                      href={m.profileUrl}
                      target={m.source === 'external' ? '_blank' : undefined}
                      rel={m.source === 'external' ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center justify-center rounded-xl border border-white/15 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                      title="Open profile"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default AiMatchStudioPanel;
