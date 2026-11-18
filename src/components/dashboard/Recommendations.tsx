"use client";

import React from "react";
import { Sparkles, Zap, MessageCircle, User, ExternalLink, Tag } from "lucide-react";
import { useDashboardData } from "@/hooks/features/useDashboardData";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const RecommendationSkeleton: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-3 animate-pulse dark:border-slate-800 dark:bg-slate-800/40"
      >
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    ))}
  </div>
);

const RANK_LABELS = ["Top Synergy", "High Fit", "Recommended"];

const RecommendationCard: React.FC<{ rec: Recommendation; rank: number }> = ({ rec, rank }) => {
  const router = useRouter();
  const { user, compatibilityScore, commonNiches } = rec;
  const displayName = user?.displayName || user?.username || "Creator";
  const badgeLabel = RANK_LABELS[rank] ?? RANK_LABELS[2];
  const allNiches = commonNiches?.length > 0 ? commonNiches : (user?.niche ?? []);
  const rizzDisplay = user?.rizzScore ?? rec.matchingRizzScore ?? 0;
  const handle = user?.username?.startsWith("@") ? user.username.slice(1) : user?.username;

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800">
      <div>
        {/* Top Identity & Match Score Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-base font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 overflow-hidden">
              {user?.avatar && typeof user.avatar === "string" && user.avatar.trim() !== "" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {badgeLabel}
              </span>
              <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                {displayName}
              </h3>
              {handle && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">@{handle}</p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
              {compatibilityScore}% Match
            </span>
            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Rizz: <strong className="text-slate-800 dark:text-slate-200">{rizzDisplay > 0 ? rizzDisplay : "—"}</strong>
            </p>
          </div>
        </div>

        {/* Niche Tags */}
        <div className="mt-3.5">
          {allNiches.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {allNiches.slice(0, 4).map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Tag className="h-2.5 w-2.5 text-indigo-500" />
                  {n}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">No niches listed</p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {handle ? (
          <Link
            href={`/profile/@${encodeURIComponent(handle)}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <User className="h-3.5 w-3.5" />
            View Profile
          </Link>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => router.push(`/messages?userId=${encodeURIComponent(user.id)}`)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Connect Now
        </button>
      </div>
    </article>
  );
};

const Recommendations: React.FC = () => {
  const { recommendations, recommendationsLoading, recommendationsError } = useDashboardData();
  const typedRecs = (recommendations as Recommendation[]) || [];

  return (
    <section className="space-y-4" data-section="recommendations">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              AI Recommendations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explainable creator matches based on niche &amp; engagement alignment
            </p>
          </div>
        </div>
        <Link
          href="/ai-matches"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          View all <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recommendationsLoading ? (
        <RecommendationSkeleton />
      ) : recommendationsError ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
          <Zap className="mx-auto mb-2.5 h-7 w-7 text-indigo-400" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Our matching service is calibrating your recommendations. Check back shortly.
          </p>
        </div>
      ) : typedRecs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
          <Sparkles className="mx-auto mb-2.5 h-7 w-7 text-indigo-400" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            No recommendations yet. Complete your profile to get matched!
          </p>
          <Link
            href="/profile/complete-profile"
            className="mt-2.5 inline-block text-xs font-semibold text-indigo-600 underline underline-offset-2 dark:text-indigo-400"
          >
            Complete profile →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {typedRecs.slice(0, 3).map((rec, i) => (
            <RecommendationCard key={rec.user?.id || i} rec={rec} rank={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Recommendations;
