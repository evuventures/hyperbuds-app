"use client";

import React from "react";
import { TrendingUp, Users, Eye, Flame, ArrowUpRight } from "lucide-react";
import { useDashboardData } from "@/hooks/features/useDashboardData";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrendingCollaboration {
  _id: string;
  title?: string;
  name?: string;
  views?: number;
  participants?: number;
  category?: string;
  growthRate?: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const TrendingSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const TrendingEmpty: React.FC = () => (
  <div className="p-10 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
    <Flame className="mx-auto w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      No trending collaborations right now.
    </p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back soon!</p>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const Trending: React.FC = () => {
  const { trending, trendingLoading, trendingError } = useDashboardData();

  return (
    <section className="space-y-5" data-section="trending">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 rounded-xl shadow-md shadow-orange-200 dark:shadow-orange-900/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Trending Collaborations
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Most active this week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
            Live
          </span>
        </div>
      </div>

      {/* Content */}
      {trendingLoading ? (
        <TrendingSkeleton />
      ) : trendingError ? (
        <div className="p-4 text-center rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
          <p className="text-sm text-red-500 dark:text-red-400">
            Failed to load trending data. Please try again.
          </p>
        </div>
      ) : !trending || trending.length === 0 ? (
        <TrendingEmpty />
      ) : (
        <div className="space-y-3">
          {trending.map((item: TrendingCollaboration, index: number) => (
            <div
              key={item._id}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-md dark:hover:shadow-orange-900/10 transition-all duration-200 cursor-pointer"
            >
              {/* Rank badge */}
              <div
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  index === 0
                    ? "bg-linear-to-br from-yellow-400 to-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/40"
                    : index === 1
                    ? "bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600 text-white"
                    : "bg-linear-to-br from-amber-600 to-amber-700 text-white"
                }`}
              >
                #{index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {item.title || item.name || "Untitled Collaboration"}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {item.category && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                      {item.category}
                    </span>
                  )}
                  {item.participants !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="w-3 h-3" />
                      {item.participants}
                    </span>
                  )}
                  {item.views !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Eye className="w-3 h-3" />
                      {item.views.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Growth or arrow */}
              <div className="shrink-0 flex items-center gap-1">
                {item.growthRate !== undefined ? (
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    +{item.growthRate}%
                  </span>
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Trending;