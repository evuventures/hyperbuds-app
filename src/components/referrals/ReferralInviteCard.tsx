'use client';

import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import {
  Check,
  Copy,
  Gift,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { formatCompactCount } from '@/lib/utils/formatCount';

interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  invitesCount: number;
  creditsEarned: number;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalRewarded: number;
  totalCreditsEarned: number;
  viewerRank: number | null;
  policy?: {
    referrerPromoCredits?: number;
    refereePromoCredits?: number;
  };
  leaderboard: LeaderboardRow[];
}

export function ReferralInviteCard({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadReferrals = useCallback(async () => {
    try {
      const res = await apiClient.get('/wallet/referrals');
      if (res.data?.referralCode) {
        setData({
          referralCode: String(res.data.referralCode),
          referralLink:
            String(res.data.referralLink || '') ||
            `${typeof window !== 'undefined' ? window.location.origin : 'https://app.hyperbuds.cloud'}/auth/signup?ref=${encodeURIComponent(String(res.data.referralCode))}`,
          totalRewarded: Number(res.data.totalRewarded ?? 0),
          totalCreditsEarned: Number(res.data.totalCreditsEarned ?? 0),
          viewerRank: typeof res.data.viewerRank === 'number' ? res.data.viewerRank : null,
          policy: res.data.policy,
          leaderboard: Array.isArray(res.data.leaderboard) ? res.data.leaderboard : [],
        });
      }
    } catch {
      // Silently stay hidden when unauthenticated
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  // Automatically claim any pending ?ref=HB-... invite code stored during signup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pendingRef = window.localStorage.getItem('hb_pending_ref');
    if (!pendingRef || !pendingRef.trim()) return;
    const cleanCode = pendingRef.trim();

    apiClient
      .post('/wallet/referrals/claim', { referralCode: cleanCode })
      .then((res) => {
        window.localStorage.removeItem('hb_pending_ref');
        const bonus = Number(res.data?.refereeCreditsAwarded ?? 15);
        toast.success(`🎉 Welcome bonus unlocked! +${bonus} Wallet Credits added to your account.`, {
          duration: 5000,
        });
        void loadReferrals();
      })
      .catch((err) => {
        const status = err?.response?.status ?? err?.status;
        // Clear terminal errors (already claimed, self-referral, invalid code); keep on 403 unverified email so it claims right after verification
        if (status === 400 || status === 404 || status === 409) {
          window.localStorage.removeItem('hb_pending_ref');
        }
      });
  }, [loadReferrals]);

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading referral card"
        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="h-4 w-40 rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const referrerBonus = Number(data.policy?.referrerPromoCredits ?? 25);
  const refereeBonus = Number(data.policy?.refereePromoCredits ?? 15);
  const shareText = `Join me on HyperBuds — find creator collab matches, join growth groups & earn rewards! Sign up with my link for +${refereeBonus} bonus credits:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      toast.success('Invite link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Join me on HyperBuds',
          text: shareText,
          url: data.referralLink,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    void handleCopy();
  };

  const visibleLeaderboard = data.leaderboard.slice(0, compact ? 5 : 10);

  return (
    <section className="overflow-hidden rounded-2xl border border-purple-200/80 bg-white shadow-xs dark:border-purple-900/50 dark:bg-slate-900">
      {/* Purple Gradient Header */}
      <div className="bg-gradient-to-br from-[#3B0F7A] via-[#5B21B6] to-[#240B48] p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
              <Gift className="h-3 w-3" />
              Invite &amp; Earn
            </span>
            <h3 className="mt-1.5 text-sm font-extrabold sm:text-base">
              Invite Creators · Earn +{referrerBonus} Credits Each
            </h3>
            <p className="mt-0.5 text-[11px] text-purple-100/85">
              Every friend who joins gets +{refereeBonus} bonus credits and you climb the Invite Leaderboard.
            </p>
          </div>
          {data.viewerRank && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-extrabold text-amber-200 ring-1 ring-amber-300/30">
              <Trophy className="h-3 w-3" />#{data.viewerRank}
            </span>
          )}
        </div>

        {/* 1-Click Copy Personal Referral Link */}
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-black/25 p-1.5 ring-1 ring-white/15">
          <input
            type="text"
            readOnly
            value={data.referralLink}
            aria-label="Your personal referral link"
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent px-2 text-[11px] font-medium text-purple-50 outline-none"
          />
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-purple-900 transition hover:bg-purple-50"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Quick Share Buttons */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${data.referralLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/90 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-500"
          >
            WhatsApp ↗
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(data.referralLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/25"
          >
            Share to X ↗
          </a>
          <button
            type="button"
            onClick={() => void handleNativeShare()}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-white/25"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70 text-center dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/40">
        <div className="py-2.5">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
            {formatCompactCount(data.totalRewarded)}
          </p>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Invited</p>
        </div>
        <div className="py-2.5">
          <p className="inline-flex items-center justify-center gap-0.5 text-sm font-extrabold text-purple-700 dark:text-purple-400 tabular-nums">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            {formatCompactCount(data.totalCreditsEarned)}
          </p>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Credits Earned</p>
        </div>
        <div className="py-2.5">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
            {data.viewerRank ? `#${data.viewerRank}` : '—'}
          </p>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Your Rank</p>
        </div>
      </div>

      {/* Top Inviters Leaderboard */}
      <div className="p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Top Inviters Leaderboard
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
            <Sparkles className="h-3 w-3" />
            Code: {data.referralCode}
          </span>
        </div>

        {visibleLeaderboard.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-4 text-center dark:border-slate-800 dark:bg-slate-800/30">
            <Users className="mx-auto h-5 w-5 text-purple-500" />
            <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              Be #1 on the Invite Leaderboard!
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Share your link above — your first invited creator claims the #1 spot.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {visibleLeaderboard.map((row) => (
              <div
                key={row.userId}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                      row.rank === 1
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : row.rank === 2
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          : row.rank === 3
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                    }`}
                  >
                    #{row.rank}
                  </span>
                  {row.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.avatar}
                      alt={row.displayName}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[11px] font-bold text-white">
                      {row.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {row.displayName}
                    </p>
                    {row.username && (
                      <p className="truncate text-[10px] text-slate-500">@{row.username}</p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 tabular-nums">
                  {formatCompactCount(row.invitesCount)} {row.invitesCount === 1 ? 'invite' : 'invites'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ReferralInviteCard;
