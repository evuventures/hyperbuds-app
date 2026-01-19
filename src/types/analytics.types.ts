import type { Pagination } from "./common.types";

export type AnalyticsGranularity = "daily" | "weekly" | "monthly";

export interface AnalyticsPeriod {
  start: string;
  end: string;
  granularity?: AnalyticsGranularity;
}

export interface AnalyticsMetrics {
  totalFollowers?: number;
  avgEngagement?: number;
  totalViews?: number;
  totalLikes?: number;
  totalComments?: number;
  totalShares?: number;
  collaborations?: number;
  marketplaceOrders?: number;
  earnings?: number;
}

export interface AnalyticsTopContent {
  title?: string;
  platform?: string;
  url?: string;
  views?: number;
  engagement?: number;
}

export interface AnalyticsReport {
  _id: string;
  userId: string;
  period: AnalyticsPeriod;
  metrics: AnalyticsMetrics;
  topContent?: AnalyticsTopContent[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalyticsOverview {
  profileStats: Record<string, unknown>;
  collaborations: number;
  marketplaceOrders: number;
  earnings: number;
}

export interface AnalyticsReportListResponse {
  reports: AnalyticsReport[];
  pagination: Pagination;
}
