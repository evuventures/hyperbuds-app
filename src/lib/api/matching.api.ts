// src/lib/api/matching.api.ts

import { apiClient } from './client';
import type {
  MatchSuggestion,
  MatchPreferences,
  CompatibilityQuery,
  MatchAction,
  MatchFeedback,
  RizzScore,
  LeaderboardQuery,
  PaginatedResponse,
  ApiResponse
} from '../../types/matching.types';

// New interface to replace 'any'
export interface UserStats {
  totalFollowers?: number;
  [key: string]: unknown; // Allows for other unknown properties
}

export const matchingApi = {
  // Get match suggestions
  getSuggestions: async (params?: {
    page?: number;
    limit?: number;
    refresh?: boolean;
  }): Promise<PaginatedResponse<MatchSuggestion>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.refresh) searchParams.set('refresh', params.refresh.toString());

    const response = await apiClient.get(`/matching/suggestions?${searchParams}`);
    return response.data;
  },

  // Set matching preferences
  setPreferences: async (preferences: MatchPreferences): Promise<ApiResponse> => {
    const response = await apiClient.post('/matching/preferences', preferences);
    return response.data;
  },

  // Get compatibility score between users
  getCompatibilityScore: async (query: CompatibilityQuery): Promise<{
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
      stats: UserStats; // Type fixed here
    };
  }> => {
    const searchParams = new URLSearchParams();
    searchParams.set('targetUserId', query.targetUserId);
    if (query.useAI !== undefined) searchParams.set('useAI', query.useAI.toString());

    const response = await apiClient.get(`/matching/compatibility?${searchParams}`);
    return response.data;
  },

  // Get match history
  getMatchHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'viewed' | 'liked' | 'passed' | 'mutual' | 'all';
  }): Promise<PaginatedResponse<MatchSuggestion>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);

    const response = await apiClient.get(`/matching/history?${searchParams}`);
    return response.data;
  },

  // Update match status (like, pass, view)
  updateMatchStatus: async (matchId: string, action: MatchAction): Promise<{
    message: string;
    match: MatchSuggestion;
    isMutual: boolean;
  }> => {
    const response = await apiClient.put(`/matching/matches/${matchId}/action`, action);
    return response.data;
  },

  // Provide feedback on match
  provideFeedback: async (matchId: string, feedback: MatchFeedback): Promise<{
    message: string;
    match: MatchSuggestion;
  }> => {
    const response = await apiClient.post(`/matching/matches/${matchId}/feedback`, feedback);
    return response.data;
  },

  // Block a user
  blockUser: async (userId: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/matching/block', { userId });
    return response.data;
  },

  // Get user's Rizz Score
  getRizzScore: async (): Promise<{ rizzScore: RizzScore }> => {
    const response = await apiClient.get('/matching/rizz-score');
    return response.data;
  },

  // Recalculate Rizz Score
  recalculateRizzScore: async (): Promise<{
    message: string;
    rizzScore: RizzScore;
  }> => {
    const response = await apiClient.post('/matching/rizz-score/recalculate');
    return response.data;
  },

  // Get Rizz Score leaderboard
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
    if (query?.niche) searchParams.set('niche', query.niche);
    if (query?.location) searchParams.set('location', query.location);
    if (query?.limit) searchParams.set('limit', query.limit.toString());
    if (query?.timeframe) searchParams.set('timeframe', query.timeframe);

    const response = await apiClient.get(`/matching/leaderboard?${searchParams}`);
    return response.data;
  }
};

export default matchingApi;