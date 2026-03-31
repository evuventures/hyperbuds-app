// src/hooks/features/useDashboardData.ts
// This file now just re-exports from the context so all imports keep working.
export { useDashboardData } from "@/context/DashboardDataContext";

// ─── Shared Types (used by context + components) ──────────────────────────────
export interface TrendingItem {
  _id: string;
  title?: string;
  name?: string;
  views?: number;
  participants?: number;
  category?: string;
  growthRate?: number;
}

export interface RecommendationUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  niche?: string[];
  rizzScore?: number;
  stats?: { avgEngagement?: number };
}

export interface Recommendation {
  user: RecommendationUser;
  compatibilityScore: number;
  matchingRizzScore: number;
  commonNiches: string[];
  keyFeatures: string[];
}

export interface ActivityItem {
  _id: string;
  type?: string;
  message?: string;
  description?: string;
  createdAt?: string;
  timestamp?: string;
  actor?: { name?: string; username?: string; avatar?: string };
  meta?: Record<string, unknown>;
}