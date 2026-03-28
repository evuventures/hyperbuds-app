// src/context/DashboardDataContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { dashboardApi } from "@/lib/api/dashboard.api";
import type { TrendingItem, Recommendation, ActivityItem } from "@/hooks/features/useDashboardData";

// ─── Context Shape ────────────────────────────────────────────────────────────
interface DashboardDataContextValue {
  trending: TrendingItem[];
  trendingLoading: boolean;
  trendingError: string | null;

  recommendations: Recommendation[];
  recommendationsLoading: boolean;
  recommendationsError: string | null;

  activities: ActivityItem[];
  activitiesLoading: boolean;
  activitiesError: string | null;

  refetch: () => void;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

// ─── Provider — wrap this around your dashboard layout ───────────────────────
export const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setTrendingLoading(true);
    setRecommendationsLoading(true);
    setActivitiesLoading(true);

    const [trendingResult, recommendationsResult, activitiesResult] =
      await Promise.allSettled([
        dashboardApi.getTrendingCollaborations(3),
        dashboardApi.getAIRecommendations(),
        dashboardApi.getActivityFeed(10),
      ]);

    if (trendingResult.status === "fulfilled") {
      setTrending((trendingResult.value.data.trending as TrendingItem[]) ?? []);
      setTrendingError(null);
    } else {
      setTrendingError(trendingResult.reason?.message ?? "Failed to load trending");
    }
    setTrendingLoading(false);

    if (recommendationsResult.status === "fulfilled") {
      const all = (recommendationsResult.value.data.recommendations as Recommendation[]) ?? [];
      setRecommendations(all.slice(0, 3));
      setRecommendationsError(null);
    } else {
      setRecommendationsError(recommendationsResult.reason?.message ?? "Failed to load recommendations");
    }
    setRecommendationsLoading(false);

    if (activitiesResult.status === "fulfilled") {
      setActivities((activitiesResult.value.data.activities as ActivityItem[]) ?? []);
      setActivitiesError(null);
    } else {
      setActivitiesError(activitiesResult.reason?.message ?? "Failed to load activity feed");
    }
    setActivitiesLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <DashboardDataContext.Provider
      value={{
        trending, trendingLoading, trendingError,
        recommendations, recommendationsLoading, recommendationsError,
        activities, activitiesLoading, activitiesError,
        refetch: fetchAll,
      }}
    >
      {children}
    </DashboardDataContext.Provider>
  );
};

// ─── Hook — replaces useDashboardData in all components ──────────────────────
export const useDashboardData = (): DashboardDataContextValue => {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error("useDashboardData must be used inside <DashboardDataProvider>");
  }
  return ctx;
};