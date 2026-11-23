'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Heart, Radio, Sparkles, Users, X } from 'lucide-react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

const DISMISS_GUIDE_KEY = 'hb_first_win_guide_dismissed_v1';

interface DailyDropSummary {
  dateKey: string;
  region: string;
  gameMode: string;
  title: string;
  premise: string;
  hashtag: string;
  rewardCredits: number;
  rewardRizzBoost: number;
  participantsCount: number;
}

/**
 * Compact, high-signal Daily Featured Drop + 60-Second First-Win Guide
 * displayed at the top of Home Feed so every creator immediately sees
 * today's shared cultural moment and clearest next action.
 */
export function DailyDropAndStartCard() {
  const [daily, setDaily] = useState<DailyDropSummary | null>(null);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(true);

  useEffect(() => {
    try {
      setGuideDismissed(localStorage.getItem(DISMISS_GUIDE_KEY) === '1');
    } catch {
      setGuideDismissed(false);
    }

    void apiClient
      .get('/challenges/daily?region=NG')
      .then((res) => {
        if (res.data?.daily) setDaily(res.data.daily);
        if (res.data?.joinedChallengeId) setJoinedId(res.data.joinedChallengeId);
      })
      .catch(() => null);
  }, []);

  const handleJoinDaily = async () => {
    setJoining(true);
    try {
      const res = await apiClient.post('/challenges/daily/join', { region: daily?.region || 'NG' });
      if (res.data?.gameChallenge?.id) {
        setJoinedId(res.data.gameChallenge.id);
        setDaily((prev) =>
          prev ? { ...prev, participantsCount: prev.participantsCount + (res.data?.alreadyJoined ? 0 : 1) } : prev,
        );
        toast.success("Joined today's featured drop! Open Challenges to play Round 1.");
      }
    } catch {
      toast.error("Couldn't join right now.");
    } finally {
      setJoining(false);
    }
  };

  const dismissGuide = () => {
    setGuideDismissed(true);
    try {
      localStorage.setItem(DISMISS_GUIDE_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  };

  if (!daily && guideDismissed) return null;

  return (
    <div className="space-y-3">
      {/* Today's Shared Featured Drop */}
      {daily && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 px-2.5 py-0.5 text-white">
                  <Flame className="h-3 w-3" />
                  Today&apos;s Featured Drop
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Users className="h-3 w-3" />
                  {daily.participantsCount} playing
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  +{daily.rewardCredits} cr · +{daily.rewardRizzBoost} Rizz
                </span>
              </div>
              <h3 className="mt-1.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                {daily.title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                {daily.premise}
              </p>
            </div>

            {joinedId ? (
              <Link
                href="/challenges"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                Continue Playing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled={joining}
                onClick={() => void handleJoinDaily()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {joining ? 'Joining…' : 'Join Drop'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 60-Second Quick-Start Guide for New Creators */}
      {!guideDismissed && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Quick Start · Your First 60 Seconds on HyperBuds
            </p>
            <button
              type="button"
              onClick={dismissGuide}
              aria-label="Dismiss quick start"
              className="rounded p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link
              href="/challenges"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 transition hover:border-purple-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Flame className="h-4 w-4 shrink-0 text-purple-600" />
              <span>1. Play Lagos Life</span>
            </Link>
            <Link
              href="/ai-matches"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 transition hover:border-purple-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Heart className="h-4 w-4 shrink-0 text-rose-500" />
              <span>2. Get 3 AI Matches</span>
            </Link>
            <Link
              href="/streaming"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 transition hover:border-purple-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Radio className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>3. Go Live or Post Reel</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
