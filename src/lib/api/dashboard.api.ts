// src/lib/api/dashboard.api.ts

import { apiClient } from "./client";

export const dashboardApi = {
  getTrendingCollaborations: (limit = 3) =>
    apiClient.get("/dashboard/trending-collaborations", { params: { limit } }),

  // ✅ Now accepts limit — backend respects it after the fix
  getAIRecommendations: () =>
    apiClient.get("/dashboard/ai-recommendations"),

  getActivityFeed: (limit = 10) =>
    apiClient.get("/dashboard/activity-feed", { params: { limit } }),
};