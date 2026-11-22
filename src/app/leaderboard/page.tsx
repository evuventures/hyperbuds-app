'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { Award, Check, Copy, Crown, Flame, Sparkles, Trophy, Users } from 'lucide-react';
import { CardGridSkeleton } from '@/components/ui/AppSkeletons';
import { formatCompactCount } from '@/lib/utils/formatCount';

interface CreatorRankItem {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  rizzScore: number;
  niche: string[];
}

interface InviterRankItem {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  invitesCount: number;
  creditsEarned: number;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'creators' | 'inviters'>('creators');
  const [creators, setCreators] = useState<CreatorRankItem[]>([]);
  const [inviters, setInviters] = useState<InviterRankItem[]>([]);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const [lbRes, refRes] = await Promise.all([
        apiClient.get('/matching/leaderboard?limit=30').catch(() => null),
        apiClient.get('/wallet/referrals').catch(() => null),
      ]);
      const rawCreators = Array.isArray(lbRes?.data?.leaderboard) ? lbRes.data.leaderboard : [];
      setCreators(
        rawCreators.map((r: Record<string, unknown>, idx: number) => ({
          rank: Number(r.rank ?? idx + 1),
          userId: String(r.userId || idx),
          username: String(r.username || ''),
          displayName: String(r.displayName || r.username || 'Creator'),
          avatar: String(r.avatar || ''),
          rizzScore: Number(r.rizzScore ?? 0),
          niche: Array.isArray(r.niche) ? r.niche.map(String) : [],
        })),
      );
      setInviters(Array.isArray(refRes?.data?.leaderboard) ? refRes.data.leaderboard : []);
      if (refRes?.data?.referralLink) setReferralLink(String(refRes.data.referralLink));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  const handleCopyInvite = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Personal invite link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy invite link');
    }
  };

  const activeList = tab === 'creators' ? creators : inviters;
  const topThree = activeList.slice(0, 3);
  const rest = activeList.slice(3);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fc] px-4 py-6 pb-24 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Hero Header */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B0F7A] via-[#5B21B6] to-[#1E0A3C] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-amber-200">
                  <Crown className="h-3.5 w-3.5" />
                  HyperBuds Global Rankings
                </span>
                <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Creator Leaderboard
                </h1>
                <p className="mt-1.5 text-sm text-purple-100/85">
                  See who’s leading HyperBuds by Rizz Score and verified creator invites. Complete Duo Challenges and invite friends to climb to #1.
                </p>
              </div>
              {referralLink && (
                <button
                  type="button"
                  onClick={() => void handleCopyInvite()}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-purple-900 shadow-sm transition hover:bg-purple-50"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Invite Link Copied!' : 'Copy My Invite Link'}
                </button>
              )}
            </div>

            <div className="mt-6 inline-flex rounded-full bg-black/25 p-1">
              <button
                type="button"
                onClick={() => setTab('creators')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'creators' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-100 hover:text-white'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Top Creators (Rizz Score)
              </button>
              <button
                type="button"
                onClick={() => setTab('inviters')}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  tab === 'inviters' ? 'bg-white text-purple-900 shadow-xs' : 'text-purple-100 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Top Inviters
              </button>
            </div>
          </div>

          {loading ? (
            <CardGridSkeleton count={6} columns={3} />
          ) : activeList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <Trophy className="mx-auto h-10 w-10 text-purple-500" />
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                {tab === 'inviters' ? 'Claim the #1 Inviter Spot!' : 'No ranked creators yet'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {tab === 'inviters'
                  ? 'Share your personal invite link above — your first verified signup puts you at #1.'
                  : 'Complete your creator profile and finish Duo Challenges to climb the Rizz Leaderboard.'}
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {topThree.map((entry, idx) => {
                  const medal =
                    idx === 0
                      ? { bg: 'from-amber-400/20 to-yellow-500/10 border-amber-300/70 dark:border-amber-600/50', badge: 'bg-amber-400 text-amber-950', label: '#1 Gold' }
                      : idx === 1
                        ? { bg: 'from-slate-300/25 to-slate-400/10 border-slate-300 dark:border-slate-700', badge: 'bg-slate-300 text-slate-900', label: '#2 Silver' }
                        : { bg: 'from-orange-400/20 to-amber-700/10 border-orange-300/70 dark:border-orange-700/50', badge: 'bg-orange-400 text-orange-950', label: '#3 Bronze' };
                  const profileHref = entry.username ? `/profile/${encodeURIComponent(entry.username)}` : null;

                  return (
                    <div
                      key={entry.userId}
                      className={`relative flex flex-col items-center rounded-3xl border bg-gradient-to-b bg-white p-6 text-center shadow-xs dark:bg-slate-900 ${medal.bg}`}
                    >
                      <span className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold ${medal.badge}`}>
                        {medal.label}
                      </span>
                      {entry.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.avatar}
                          alt={entry.displayName}
                          className="mt-3 h-16 w-16 rounded-full border-2 border-purple-400 object-cover shadow-sm"
                        />
                      ) : (
                        <div className="mt-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-xl font-bold text-white">
                          {entry.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {profileHref ? (
                        <Link href={profileHref} className="mt-3 text-base font-extrabold text-slate-900 hover:text-purple-600 dark:text-white dark:hover:text-purple-400">
                          {entry.displayName}
                        </Link>
                      ) : (
                        <h3 className="mt-3 text-base font-extrabold text-slate-900 dark:text-white">{entry.displayName}</h3>
                      )}
                      {entry.username && <p className="text-xs text-slate-500">@{entry.username}</p>}

                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-800 dark:bg-purple-950/60 dark:text-purple-200">
                        <Sparkles className="h-3.5 w-3.5" />
                        {'rizzScore' in entry
                          ? `${entry.rizzScore} Rizz`
                          : `${formatCompactCount(entry.invitesCount)} Invites · +${formatCompactCount(entry.creditsEarned)} cr`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ranked List (#4+) */}
              {rest.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rest.map((entry) => {
                      const profileHref = entry.username ? `/profile/${encodeURIComponent(entry.username)}` : null;
                      return (
                        <div
                          key={entry.userId}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="w-8 shrink-0 text-center text-sm font-extrabold text-slate-400 tabular-nums">
                              #{entry.rank}
                            </span>
                            {entry.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={entry.avatar}
                                alt={entry.displayName}
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                                {entry.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              {profileHref ? (
                                <Link
                                  href={profileHref}
                                  className="block truncate text-sm font-bold text-slate-900 hover:text-purple-600 dark:text-white dark:hover:text-purple-400"
                                >
                                  {entry.displayName}
                                </Link>
                              ) : (
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                  {entry.displayName}
                                </p>
                              )}
                              <p className="truncate text-xs text-slate-500">
                                {entry.username ? `@${entry.username}` : 'Creator'}
                                {'niche' in entry && entry.niche.length > 0 ? ` · ${entry.niche.slice(0, 2).join(', ')}` : ''}
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 tabular-nums">
                            <Award className="h-3.5 w-3.5" />
                            {'rizzScore' in entry
                              ? `${entry.rizzScore} Rizz`
                              : `${formatCompactCount(entry.invitesCount)} invites`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
