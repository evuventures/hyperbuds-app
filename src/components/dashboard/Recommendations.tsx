"use client";

import React from "react";
import { Sparkles, Zap, MessageCircle, User, ExternalLink, Tag } from "lucide-react";
import { useDashboardData } from "@/hooks/features/useDashboardData";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecommendationUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  niche?: string[];
  rizzScore?: number;
}

interface Recommendation {
  user: RecommendationUser;
  compatibilityScore: number;
  matchingRizzScore: number;
  commonNiches: string[];
  keyFeatures: string[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const RecommendationSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 animate-pulse">
        {/* avatar placeholder */}
        <div className="w-28 sm:w-36 md:w-44 shrink-0 bg-gray-200 dark:bg-gray-700 min-h-[160px]" />
        <div className="flex-1 p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <div className="h-10 w-16 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-700 ml-auto" />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[1, 2, 3].map(j => <div key={j} className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />)}
          </div>
          <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Rank config ──────────────────────────────────────────────────────────────
const RANK_CONFIG = [
  { label: "Ultimate Match",    gradient: "from-purple-600 to-violet-700"  },
  { label: "Top Compatibility", gradient: "from-violet-600 to-indigo-700"  },
  { label: "Great Fit",         gradient: "from-indigo-600 to-purple-700"  },
];

// ─── Single Card ──────────────────────────────────────────────────────────────
const RecommendationCard: React.FC<{ rec: Recommendation; rank: number }> = ({ rec, rank }) => {
  const router = useRouter();
  const { user, compatibilityScore, commonNiches } = rec;
  const displayName = user.displayName || user.username;
  const cfg = RANK_CONFIG[rank] ?? RANK_CONFIG[2];
  const allNiches = commonNiches.length > 0 ? commonNiches : (user.niche ?? []);
  const rizzDisplay = user.rizzScore ?? rec.matchingRizzScore ?? 0;

  return (
    <div className="group relative flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl dark:hover:shadow-purple-900/20 transition-all duration-300">

      {/* ── Avatar ── */}
      <div className="relative w-full sm:w-36 md:w-44 shrink-0 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden min-h-[160px] sm:min-h-0">
        {user.avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.avatar}
            alt={displayName}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center py-8 sm:py-0">
            <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${cfg.gradient} flex items-center justify-center text-white text-3xl font-black shadow-lg`}>
              {displayName[0].toUpperCase()}
            </div>
          </div>
        )}

        {/* Rank + name overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/85 via-black/50 to-transparent px-3 pt-6 pb-2.5">
          <div className={`inline-block px-2 py-0.5 rounded-full bg-linear-to-r ${cfg.gradient} text-white text-[8px] font-black tracking-widest uppercase mb-1 shadow`}>
            {cfg.label}
          </div>
          <p className="text-white font-bold text-sm leading-tight truncate">{displayName}</p>
          <p className="text-white/60 text-[10px] truncate">@{user.username}</p>
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-col flex-1 p-4 min-w-0 gap-3">

        {/* Match % + Rizz + Connect */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Match */}
          <div className="text-center shrink-0">
            <div className="text-xl font-black text-purple-600 dark:text-purple-400 leading-none">
              {compatibilityScore}%
            </div>
            <div className="text-[8px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 mt-0.5">
              Match
            </div>
          </div>

          {/* Rizz */}
          <div className="px-2.5 py-1 rounded-lg bg-gray-900 dark:bg-black border border-gray-700 text-center min-w-[40px] shrink-0">
            <div className="text-base font-black text-orange-400 leading-none">
              {rizzDisplay > 0 ? rizzDisplay : "–"}
            </div>
            <div className="text-[8px] font-bold tracking-widest uppercase text-gray-500 mt-0.5">
              Rizz
            </div>
          </div>

          {/* Connect — moves to new line on very small screens */}
          <button
            onClick={() => router.push(`/messages?userId=${user.id}`)}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs text-white bg-linear-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-105 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Connect Now</span>
            <span className="sm:hidden">Connect</span>
          </button>
        </div>

        {/* Niches */}
        {allNiches.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {allNiches.slice(0, 5).map((n) => (
              <span
                key={n}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800 capitalize"
              >
                <Tag className="w-2.5 h-2.5" />
                {n}
              </span>
            ))}
            {allNiches.length > 5 && (
              <span className="flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                +{allNiches.length - 5}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">No niches listed</p>
        )}

        {/* Profile link */}
        <div className="flex justify-end mt-auto pt-1">
          <Link
            href={`/profile/${user.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Recommendations: React.FC = () => {
  const { recommendations, recommendationsLoading, recommendationsError } = useDashboardData();
  const typedRecs = recommendations as Recommendation[];

  return (
    <section className="space-y-5" data-section="recommendations">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-purple-500 to-violet-600 rounded-xl shadow-md shadow-purple-200 dark:shadow-purple-900/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Recommendations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Matched just for you</p>
          </div>
        </div>
        <Link
          href="/ai-matches"
          className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          View all <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recommendationsLoading ? (
        <RecommendationSkeleton />
      ) : recommendationsError ? (
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <Zap className="mx-auto w-8 h-8 text-purple-400 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Our AI is calibrating your matches. Check back shortly!</p>
        </div>
      ) : typedRecs.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-purple-100 dark:border-purple-900/40">
          <Sparkles className="mx-auto w-8 h-8 text-purple-300 dark:text-purple-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No recommendations yet. Complete your profile to get matched!</p>
          <Link href="/profile" className="mt-3 inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 underline underline-offset-2">
            Complete profile →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {typedRecs.slice(0, 3).map((rec, i) => (
            <RecommendationCard key={rec.user.id} rec={rec} rank={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Recommendations;