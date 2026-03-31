"use client";

import React, { useState } from "react";
import {
  Activity, Clock, ChevronDown, ChevronUp,
  Users, Heart, Star, Zap, MessageCircle, TrendingUp, UserPlus
} from "lucide-react";
import { useDashboardData } from "@/hooks/features/useDashboardData";
import type { ActivityItem } from "@/hooks/features/useDashboardData";

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_CFG: Record<string, {
  icon: React.ReactNode;
  dot: string;
  label: string;
  textColor: string;
  bgLight: string;
}> = {
  collab:   { icon: <Users className="w-3.5 h-3.5" />,        dot: "bg-purple-500",  label: "Collab",   textColor: "text-purple-600 dark:text-purple-400",  bgLight: "bg-purple-50 dark:bg-purple-900/20"  },
  follow:   { icon: <UserPlus className="w-3.5 h-3.5" />,     dot: "bg-blue-500",    label: "Follow",   textColor: "text-blue-600 dark:text-blue-400",      bgLight: "bg-blue-50 dark:bg-blue-900/20"      },
  like:     { icon: <Heart className="w-3.5 h-3.5" />,        dot: "bg-pink-500",    label: "Like",     textColor: "text-pink-600 dark:text-pink-400",      bgLight: "bg-pink-50 dark:bg-pink-900/20"      },
  join:     { icon: <Star className="w-3.5 h-3.5" />,         dot: "bg-green-500",   label: "Join",     textColor: "text-green-600 dark:text-green-400",    bgLight: "bg-green-50 dark:bg-green-900/20"    },
  message:  { icon: <MessageCircle className="w-3.5 h-3.5" />, dot: "bg-indigo-500", label: "Message",  textColor: "text-indigo-600 dark:text-indigo-400",  bgLight: "bg-indigo-50 dark:bg-indigo-900/20"  },
  trending: { icon: <TrendingUp className="w-3.5 h-3.5" />,   dot: "bg-orange-500",  label: "Trending", textColor: "text-orange-600 dark:text-orange-400",  bgLight: "bg-orange-50 dark:bg-orange-900/20"  },
  default:  { icon: <Zap className="w-3.5 h-3.5" />,          dot: "bg-violet-500",  label: "Update",   textColor: "text-violet-600 dark:text-violet-400",  bgLight: "bg-violet-50 dark:bg-violet-900/20"  },
};

const relTime = (iso?: string): string => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
};

// ─── Single row ───────────────────────────────────────────────────────────────
const ActivityRow: React.FC<{ item: ActivityItem }> = ({ item }) => {
  const typeKey = item.type?.toLowerCase() ?? "default";
  const cfg = TYPE_CFG[typeKey] ?? TYPE_CFG.default;
  const text = item.message || item.description || "New activity";
  const timestamp = item.createdAt || item.timestamp;
  const actorName = item.actor?.name ?? "";

  return (
    <div className="group flex items-start gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150">
      {/* Icon / Avatar */}
      <div className={`shrink-0 w-10 h-10 rounded-full ${cfg.bgLight} border border-gray-100 dark:border-gray-700/60 flex items-center justify-center ${cfg.textColor} mt-0.5 overflow-hidden`}>
        {item.actor?.avatar ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.actor.avatar} alt={actorName} className="w-full h-full rounded-full object-cover" />
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${cfg.dot} flex items-center justify-center text-white ring-2 ring-white dark:ring-gray-900`}>
              <span className="scale-75">{cfg.icon}</span>
            </div>
          </div>
        ) : (
          cfg.icon
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
          {actorName && (
            <span className={`font-bold mr-1 ${cfg.textColor}`}>{actorName}</span>
          )}
          <span className="text-gray-600 dark:text-gray-400">{text}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bgLight} ${cfg.textColor}`}>
            {cfg.label}
          </span>
          {timestamp && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              {relTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC = () => (
  <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-2.5 w-1/4 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const INITIAL_VISIBLE = 5;

const ActivityFeed: React.FC = () => {
  const { activities, activitiesLoading, activitiesError } = useDashboardData();
  const typedActivities = activities as ActivityItem[];
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? typedActivities : typedActivities.slice(0, INITIAL_VISIBLE);
  const hasMore = typedActivities.length > INITIAL_VISIBLE;
  const hiddenCount = typedActivities.length - INITIAL_VISIBLE;

  return (
    <section className="space-y-5" data-section="activity-feed">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Activity Feed</h2>
              {typedActivities.length > 0 && (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-black">
                  {typedActivities.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">What&apos;s happening on the platform</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 overflow-hidden">
        {activitiesLoading ? (
          <Skeleton />
        ) : activitiesError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">Failed to load activity. Please refresh.</p>
          </div>
        ) : typedActivities.length === 0 ? (
          <div className="p-10 text-center">
            <Zap className="mx-auto w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/40">
              {visibleItems.map((item) => (
                <ActivityRow key={item._id} item={item} />
              ))}
            </div>

            {/* See more / Show less */}
            {hasMore && (
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700/50 transition-all duration-200"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
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