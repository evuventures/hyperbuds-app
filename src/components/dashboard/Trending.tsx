"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Users, Eye, Flame, ArrowUpRight } from "lucide-react";
import { useDashboardData } from "@/hooks/features/useDashboardData";

interface TrendingCollaboration {
  _id: string;
  title?: string;
  name?: string;
  type?: string;
  status?: string;
  views?: number;
  participants?: number;
  collaboratorCount?: number;
  analytics?: { totalViews?: number; totalEngagement?: number };
  category?: string;
  growthRate?: number;
}

const TrendingSkeleton: React.FC = () => (
  <div className="space-y-2.5">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 animate-pulse dark:border-slate-800 dark:bg-slate-800/40"
      >
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-2.5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    ))}
  </div>
);

const TrendingEmpty: React.FC = () => (
  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
    <Flame className="mx-auto mb-2.5 h-8 w-8 text-slate-300 dark:text-slate-600" />
    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      No trending collaborations right now.
    </p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
      Active public collaborations will appear here as creators team up.
    </p>
  </div>
);

const Trending: React.FC = () => {
  const { trending, trendingLoading, trendingError } = useDashboardData();

  return (
    <section className="space-y-4" data-section="trending">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Trending Collaborations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by measured engagement and active collaborators
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* Content */}
      {trendingLoading ? (
        <TrendingSkeleton />
      ) : trendingError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-center dark:border-red-900/60 dark:bg-red-950/30"
        >
          <p className="text-xs font-medium text-red-700 dark:text-red-300">
            Failed to load trending data. Please try again.
          </p>
        </div>
      ) : !trending || trending.length === 0 ? (
        <TrendingEmpty />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {trending.map((item: TrendingCollaboration, index: number) => {
            const collabCount = item.collaboratorCount ?? item.participants;
            const viewCount = item.analytics?.totalViews ?? item.views;
            const categoryLabel = item.category || item.type;

            return (
              <Link
                key={item._id}
                href={`/collaborations/${encodeURIComponent(item._id)}`}
                className="group flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  #{String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {item.title || item.name || "Untitled Collaboration"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {categoryLabel && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {categoryLabel.replaceAll("_", " ")}
                      </span>
                    )}
                    {collabCount !== undefined && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {collabCount}
                      </span>
                    )}
                    {viewCount !== undefined && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {viewCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {item.growthRate !== undefined ? (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      +{item.growthRate}%
                    </span>
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Trending;
