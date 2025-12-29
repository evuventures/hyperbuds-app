import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingApi, adaptRizzScoreResponse } from '../../lib/api/matching.api';
import { updateApi } from '../../lib/api/update.api';
import { useToast } from '../ui/useToast';
import type {
  LeaderboardQuery,
  CalculateProfileRizzScoreRequest,
  CalculateMatchingRizzScoreRequest,
} from '../../types/matching.types';

// Query Keys
const RIZZ_KEYS = {
  all: ['rizzScore'] as const,
  score: () => [...RIZZ_KEYS.all, 'score'] as const,
  leaderboard: (query?: LeaderboardQuery) => [...RIZZ_KEYS.all, 'leaderboard', query] as const,
};

/**
 * Main hook for fetching Rizz Score
 * GET /api/v1/update/rizz-score
 */
export const useRizzScore = () => {
  return useQuery({
    queryKey: RIZZ_KEYS.score(),
    queryFn: async () => {
      const apiResponse = await matchingApi.getRizzScore();
      // Get userId from localStorage if available
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('userId') || ''
        : '';
      return adaptRizzScoreResponse(apiResponse, userId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for recalculating Rizz Score
 * POST /api/v1/matching/rizz-score/recalculate
 */
export const useRecalculateRizzScore = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const apiResponse = await matchingApi.recalculateRizzScore();
      // Get userId from localStorage if available
      const userId = typeof window !== 'undefined' 
        ? localStorage.getItem('userId') || ''
        : '';
      return adaptRizzScoreResponse(apiResponse, userId);
    },
    onSuccess: (adaptedScore) => {
      queryClient.setQueryData(RIZZ_KEYS.score(), adaptedScore);
      toast({
        title: 'Rizz Score Recalculated!',
        description: 'Your Rizz Score has been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Recalculate',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for Rizz Score Leaderboard
 * GET /api/v1/matching/rizz-score/leaderboard
 */
export const useRizzLeaderboard = (query?: LeaderboardQuery) => {
  return useQuery({
    queryKey: RIZZ_KEYS.leaderboard(query),
    queryFn: () => matchingApi.getRizzLeaderboard(query),
    select: (data) => data.leaderboard || [],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for Rizz Score Analytics
 */
export const useRizzScoreAnalytics = () => {
  const { data: score } = useRizzScore();

  const analytics = score
    ? {
        engagement: score.factors?.engagement?.engagementRate || 0,
        growth: score.factors?.growth?.followerGrowthRate || 0,
        collaboration: score.factors?.collaboration?.completionRate || 0,
        quality: score.factors?.quality?.contentScore || 0,
        trending: score.trending?.trendingScore || 0,
      }
    : null;

  return { analytics };
};

// Hook for comparing Rizz Scores
export const useRizzScoreComparison = () => {
  const { data: myScore } = useRizzScore();

  // In a real app, you'd fetch the target user's public score
  // For now, we'll just provide comparison utilities

  const compareScores = (targetScore: number) => {
    if (!myScore) return null;

    const difference = myScore.currentScore - targetScore;
    const percentage = ((difference / targetScore) * 100);

    return {
      difference: Math.abs(difference),
      isHigher: difference > 0,
      percentageDiff: Math.abs(percentage),
      compatibility: Math.max(0, 100 - Math.abs(difference)), // Higher when scores are similar
    };
  };

  return {
    myScore,
    compareScores,
  };
};

// Main Rizz Score hook
export const useRizzScoreFeatures = () => {
  const rizzScore = useRizzScore();
  const recalculate = useRecalculateRizzScore();
  const analytics = useRizzScoreAnalytics();
  const leaderboard = useRizzLeaderboard();

  return {
    // Score data
    score: rizzScore.data,
    isLoading: rizzScore.isLoading,
    error: rizzScore.error,

    // Actions
    recalculateScore: recalculate.mutate,
    isRecalculating: recalculate.isPending,

    // Analytics
    analytics: analytics.analytics,

    // Leaderboard
    leaderboard: leaderboard.data || [],
    isLeaderboardLoading: leaderboard.isLoading,

    // Refetch
    refetch: rizzScore.refetch,
  };
};

// Hook for calculating Profile Rizz Score
// POST /api/v1/update/rizz/profile-score
// Score = niches × 5
export const useCalculateProfileRizzScore = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CalculateProfileRizzScoreRequest) =>
      updateApi.calculateProfileRizzScore(request),
    onSuccess: (data) => {
      toast({
        title: 'Profile Rizz Score Calculated',
        description: `Your profile rizz score is ${data.profileRizzScore}`,
      });
      queryClient.invalidateQueries({ queryKey: RIZZ_KEYS.score() });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Calculate Profile Rizz Score',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};

// Hook for calculating Matching Rizz Score between two users
// POST /api/v1/update/rizz/matching-score
// Based on niche overlap + location
export const useCalculateMatchingRizzScore = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: CalculateMatchingRizzScoreRequest) =>
      updateApi.calculateMatchingRizzScore(request),
    onSuccess: (data) => {
      toast({
        title: 'Matching Rizz Score Calculated',
        description: `Matching rizz score is ${data.matchingRizzScore}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Calculate Matching Rizz Score',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    },
  });
};
