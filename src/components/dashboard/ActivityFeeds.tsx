"use client";

import React, { useState } from "react";
import {
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
  Users,
  Heart,
  Star,
  Zap,
  MessageCircle,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { useDashboardData } from "@/hooks/features/useDashboardData";
import type { ActivityItem } from "@/hooks/features/useDashboardData";

const TYPE_CFG: Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    badgeClass: string;
  }
> = {
  collab: {
    icon: <Users className="h-3.5 w-3.5" />,
    label: "Collab",
    badgeClass:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  collaboration_created: {
    icon: <Users className="h-3.5 w-3.5" />,
    label: "Workspace",
    badgeClass:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  follow: {
    icon: <UserPlus className="h-3.5 w-3.5" />,
    label: "Follow",
    badgeClass:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/50 dark:text-sky-300",
  },
  like: {
    icon: <Heart className="h-3.5 w-3.5" />,
    label: "Like",
    badgeClass:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300",
  },
  join: {
    icon: <Star className="h-3.5 w-3.5" />,
    label: "Join",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  message: {
    icon: <MessageCircle className="h-3.5 w-3.5" />,
    label: "Message",
    badgeClass:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/50 dark:text-violet-300",
  },
  trending: {
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    label: "Trending",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300",
  },
  default: {
    icon: <Zap className="h-3.5 w-3.5" />,
    label: "Update",
    badgeClass:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
};

const relTime = (iso?: string): string => {
  if (!iso) return "";
  const parsed = new Date(iso).getTime();
  if (Number.isNaN(parsed)) return "";
  const diff = Date.now() - parsed;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
};

const ActivityRow: React.FC<{ item: ActivityItem }> = ({ item }) => {
  const typeKey = item.type?.toLowerCase() ?? "default";
  const cfg = TYPE_CFG[typeKey] ?? TYPE_CFG.default;
  const text = item.message || item.description || "Platform update";
  const timestamp = item.createdAt || item.timestamp;
  const actorName = item.actor?.name ?? "";

  return (
    <div className="flex items-start gap-3 px-3.5 py-3 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cfg.badgeClass}`}
      >
        {cfg.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
          {actorName && <strong className="mr-1 font-semibold text-slate-900 dark:text-white">{actorName}</strong>}
          <span>{text}</span>
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded border px-1.5 py-0.2 text-[10px] font-semibold ${cfg.badgeClass}`}>
            {cfg.label}
          </span>
          {timestamp && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Clock className="h-2.5 w-2.5" />
              {relTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Skeleton: React.FC = () => (
  <div className="divide-y divide-slate-100 dark:divide-slate-800">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3 px-3.5 py-3 animate-pulse">
        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-2.5 w-1/4 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    ))}
  </div>
);

const INITIAL_VISIBLE = 5;

const ActivityFeed: React.FC = () => {
  const { activities, activitiesLoading, activitiesError } = useDashboardData();
  const typedActivities = (activities as ActivityItem[]) || [];
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? typedActivities : typedActivities.slice(0, INITIAL_VISIBLE);
  const hasMore = typedActivities.length > INITIAL_VISIBLE;
  const hiddenCount = typedActivities.length - INITIAL_VISIBLE;

  return (
    <section className="space-y-4" data-section="activity-feed">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Activity Feed</h2>
              {typedActivities.length > 0 && (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {typedActivities.length}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Public platform events</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {activitiesLoading ? (
          <Skeleton />
        ) : activitiesError ? (
          <div role="alert" className="p-6 text-center">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              Failed to load activity. Please refresh.
            </p>
          </div>
        ) : typedActivities.length === 0 ? (
          <div className="p-8 text-center">
            <Zap className="mx-auto mb-2 h-6 w-6 text-slate-300 dark:text-slate-600" />
            <p className="text-xs text-slate-500 dark:text-slate-400">No recent activity yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleItems.map((item, idx) => (
                <ActivityRow key={item._id || idx} item={item} />
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    See {hiddenCount} more
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ActivityFeed;
