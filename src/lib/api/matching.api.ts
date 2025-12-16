// src/lib/api/matching.api.ts

import { apiClient } from "./client";
import type {
  MatchSuggestion,
  MatchPreferences,
  CompatibilityQuery,
  MatchAction,
  MatchFeedback,
  RizzScore,
  LeaderboardQuery,
  PaginatedResponse,
  ApiResponse,
} from "../../types/matching.types";

// Interface for user stats inside profile
export interface UserStats {
  totalFollowers?: number;
  [key: string]: unknown; // Allows additional fields
}

export const matchingApi = {
  // ✅ 1. Get match suggestions
  getSuggestions: async (params?: {
    page?: number;
    limit?: number;
    refresh?: boolean;
  }): Promise<PaginatedResponse<MatchSuggestion>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.refresh) searchParams.set("refresh", params.refresh.toString());

    const response = await apiClient.get(`/matching/suggestions?${searchParams}`);
    return response.data;
  },

  // ✅ 2. Update user matching preferences
  setPreferences: async (preferences: MatchPreferences): Promise<ApiResponse> => {
    const response = await apiClient.post("/matching/preferences", preferences);
    return response.data;
  },

  // ✅ 3. Compatibility score
  getCompatibilityScore: async (
    query: CompatibilityQuery
  ): Promise<{
    compatibilityScore: number;
    breakdown: Record<string, number>;
    confidence: number;
    keyFeatures: string[];
    targetUser: {
      id: string;
      username: string;
      displayName: string;
      avatar?: string;
      niche: string[];
      stats: UserStats;
    };
  }> => {
    const searchParams = new URLSearchParams();
    searchParams.set("targetUserId", query.targetUserId);
    if (query.useAI !== undefined)
      searchParams.set("useAI", query.useAI.toString());

    const response = await apiClient.get(
      `/matching/compatibility?${searchParams}`
    );
    return response.data;
  },

  // ✅ 4. Match history
  getMatchHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "viewed" | "liked" | "passed" | "mutual" | "all";
  }): Promise<PaginatedResponse<MatchSuggestion>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);

    const response = await apiClient.get(`/matching/history?${searchParams}`);
    return response.data;
  },

  // ✅ 5. Update match status (like, pass, view)
  updateMatchStatus: async (
    matchId: string,
    action: MatchAction
  ): Promise<{
    message: string;
    match: MatchSuggestion;
    isMutual: boolean;
  }> => {
    const response = await apiClient.put(
      `/matching/matches/${matchId}/action`,
      action
    );
    return response.data;
  },

  // ✅ 6. Provide feedback on a match
  provideFeedback: async (
    matchId: string,
    feedback: MatchFeedback
  ): Promise<{
    message: string;
    match: MatchSuggestion;
  }> => {
    const response = await apiClient.post(
      `/matching/matches/${matchId}/feedback`,
      feedback
    );
    return response.data;
  },

  // ✅ 7. Block a user
  blockUser: async (userId: string): Promise<ApiResponse> => {
    const response = await apiClient.post("/matching/block", { userId });
    return response.data;
  },

  // ✅ 8. Get user's Rizz Score
  // Updated to use new endpoint: GET /api/v1/update/rizz-score
  getRizzScore: async (): Promise<{ rizzScore: RizzScore }> => {
    const response = await apiClient.get("/update/rizz-score");
    const data = response.data;
    
    // Handle case where backend returns just a number: { rizzScore: 37 }
    // Convert it to full RizzScore object structure
    if (typeof data.rizzScore === 'number') {
      const scoreValue = data.rizzScore;
      const now = new Date().toISOString();
      
      // Create a normalized RizzScore object with default values
      const normalizedRizzScore: RizzScore = {
        _id: '',
        userId: '',
        currentScore: scoreValue,
        factors: {
          engagement: {
            avgLikes: 0,
            avgComments: 0,
            avgShares: 0,
            avgViews: 0,
            engagementRate: 0,
          },
          growth: {
            followerGrowthRate: 0,
            contentFrequency: 0,
            consistencyScore: 0,
          },
          collaboration: {
            successfulCollabs: 0,
            avgPartnerRating: 0,
            responseRate: 0,
            completionRate: 0,
          },
          quality: {
            contentScore: 0,
            technicalQuality: 0,
            originality: 0,
          },
        },
        trending: {
          isViral: false,
          trendingScore: 0,
          viralContent: [],
        },
        lastCalculated: now,
        calculationVersion: '1.0',
        createdAt: now,
        updatedAt: now,
      };
      
      return { rizzScore: normalizedRizzScore };
    }
    
    // If it's already a full object, return as is
    return data;
  },

  // ✅ 9. Recalculate Rizz Score
  recalculateRizzScore: async (): Promise<{
    message: string;
    rizzScore: RizzScore;
  }> => {
    try {
      const response = await apiClient.post("/matching/rizz-score/recalculate");
      const data = response.data;
      
      // Handle case where backend returns just a number: { rizzScore: 37 }
      // Convert it to full RizzScore object structure
      if (data.rizzScore && typeof data.rizzScore === 'number') {
        const scoreValue = data.rizzScore;
        const now = new Date().toISOString();
        
        // Create a normalized RizzScore object with default values
        const normalizedRizzScore: RizzScore = {
          _id: '',
          userId: '',
          currentScore: scoreValue,
          factors: {
            engagement: {
              avgLikes: 0,
              avgComments: 0,
              avgShares: 0,
              avgViews: 0,
              engagementRate: 0,
            },
            growth: {
              followerGrowthRate: 0,
              contentFrequency: 0,
              consistencyScore: 0,
            },
            collaboration: {
              successfulCollabs: 0,
              avgPartnerRating: 0,
              responseRate: 0,
              completionRate: 0,
            },
            quality: {
              contentScore: 0,
              technicalQuality: 0,
              originality: 0,
            },
          },
          trending: {
            isViral: false,
            trendingScore: 0,
            viralContent: [],
          },
          lastCalculated: now,
          calculationVersion: '1.0',
          createdAt: now,
          updatedAt: now,
        };
        
        return {
          message: data.message || 'Rizz Score recalculated successfully',
          rizzScore: normalizedRizzScore,
        };
      }
      
      // If it's already a full object, return as is
      return data;
    } catch (error: unknown) {
      // If recalculate endpoint doesn't exist or fails, just refetch the current score
      console.warn('Recalculate endpoint not available, fetching current score instead:', error);
      const currentScore = await matchingApi.getRizzScore();
      return {
        message: 'Score refreshed (recalculate endpoint not available)',
        rizzScore: currentScore.rizzScore,
      };
    }
  },

  // ✅ 10. Leaderboard (Rizz Rankings)
  getRizzLeaderboard: async (query?: LeaderboardQuery): Promise<{
    leaderboard: Array<{
      userId: string;
      currentScore: number;
      trending: {
        isViral: boolean;
        trendingScore: number;
      };
      lastCalculated: string;
      profile: {
        username: string;
        displayName: string;
        avatar?: string;
        niche: string[];
        stats: {
          totalFollowers: number;
        };
      };
    }>;
  }> => {
    const searchParams = new URLSearchParams();
    if (query?.niche) searchParams.set("niche", query.niche);
    if (query?.location) searchParams.set("location", query.location);
    if (query?.limit) searchParams.set("limit", query.limit.toString());
    if (query?.timeframe) searchParams.set("timeframe", query.timeframe);

    const response = await apiClient.get(`/matching/leaderboard?${searchParams}`);
    return response.data;
  },
};

export default matchingApi;
