import { apiClient } from "./client";
import type {
  AnalyticsOverview,
  AnalyticsReport,
  AnalyticsReportListResponse,
  AnalyticsPeriod,
  AnalyticsMetrics,
  AnalyticsTopContent,
} from "@/types/analytics.types";

export interface CreateAnalyticsReportRequest {
  period: AnalyticsPeriod;
  metrics: AnalyticsMetrics;
  topContent?: AnalyticsTopContent[];
  metadata?: Record<string, unknown>;
}

export const analyticsApi = {
  getOverview: async (params?: { from?: string; to?: string }): Promise<{ overview: AnalyticsOverview }> => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);

    const response = await apiClient.get(`/analytics/overview?${searchParams.toString()}`);
    return response.data;
  },

  createReport: async (
    data: CreateAnalyticsReportRequest
  ): Promise<{ report: AnalyticsReport }> => {
    const response = await apiClient.post("/analytics/reports", data);
    return response.data;
  },

  listReports: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<AnalyticsReportListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const response = await apiClient.get(`/analytics/reports?${searchParams.toString()}`);
    return response.data;
  },

  getReportById: async (reportId: string): Promise<{ report: AnalyticsReport }> => {
    const response = await apiClient.get(`/analytics/reports/${reportId}`);
    return response.data;
  },
};

export default analyticsApi;
