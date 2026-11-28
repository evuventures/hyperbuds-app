'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Flame, Loader2, Sparkles, Zap } from 'lucide-react';

export interface PartnerDuoStatus {
  isMatched: boolean;
  matchId?: string | null;
  compatibilityScore?: number | null;
  needsChallengePrompt: boolean;
  completedRecently: boolean;
  activeChallenge: {
    id: string;
    title: string;
    description?: string;
    durationDays: number;
    rewardCredits: number;
    rewardRizzBoost: number;
    doneSteps: number;
    totalSteps: number;
    progressPercent: number;
    status: string;
  } | null;
}

interface ChatDuoChallengeCardProps {
  partnerName: string;
  status: PartnerDuoStatus | null;
  loading?: boolean;
  starting?: boolean;
  onStartChallenge: () => void;
  onNavigate?: () => void;
}

export const ChatDuoChallengeCard: React.FC<ChatDuoChallengeCardProps> = ({
  partnerName,
  status,
  loading = false,
  starting = false,
  onStartChallenge,
  onNavigate,
}) => {
  if (loading) {
    return (
      <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  if (!status || (!status.isMatched && !status.activeChallenge)) {
    return null;
  }

  if (status.activeChallenge) {
    const ch = status.activeChallenge;
    return (
      <div className="rounded-xl border border-purple-200/80 bg-white p-3.5 shadow-2xs dark:border-purple-900/50 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            <Flame className="h-3 w-3" />
            Active Duo Sprint
          </span>
          <span className="text-[11px] font-bold tabular-nums text-purple-600 dark:text-purple-300">
            {ch.progressPercent}%
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-900 dark:text-white">
          {ch.title}
        </p>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            style={{ width: `${ch.progressPercent}%` }}
            className="h-full rounded-full bg-purple-600 transition-all"
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {ch.doneSteps}/{ch.totalSteps} steps done
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            +{ch.rewardCredits} cr
          </span>
        </div>

        <Link
          href="/challenges?tab=duo"
          onClick={onNavigate}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          Continue Challenge
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (status.completedRecently) {
    return (
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Duo Sprint Completed!
        </div>
        <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
          You and {partnerName} already cleared a Grow Together Challenge recently.
        </p>
      </div>
    );
  }

  // Matched, no challenge started yet -> Clear prompt indicator
  return (
    <div className="rounded-xl border border-purple-300/80 bg-purple-50/70 p-3.5 shadow-2xs dark:border-purple-800/70 dark:bg-purple-950/30">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-800 dark:text-purple-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
          </span>
          Matched · No Challenge Yet
        </span>
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
          <Zap className="h-3 w-3" />+25 cr
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        You matched with <strong className="text-slate-900 dark:text-white">{partnerName}</strong>! Start a 7-day Grow Together Challenge to collaborate and boost both Rizz Scores.
      </p>

      <button
        type="button"
        disabled={starting}
        onClick={onStartChallenge}
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-purple-500 disabled:opacity-50"
      >
        {starting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {starting ? 'Starting Challenge...' : 'Hop on a Challenge'}
      </button>
    </div>
  );
};
