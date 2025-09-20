// src/hooks/features/useRizzScore.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingApi } from '../../lib/api/matching.api';
import { useToast } from '../ui/useToast';
import type { RizzScore, LeaderboardQuery } from '../../types/matching.types';



// Query Keys
const RIZZ_KEYS = {
  score: ['rizz-score'] as const,
  leaderboard: ['rizz-score', 'leaderboard'] as const,
};

// Hook for getting user's Rizz Score
export const useRizzScore = (enabled = true) => {
  return useQuery({
    queryKey: RIZZ_KEYS.score,
    queryFn: () => matchingApi.getRizzScore(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.rizzScore,
  });
};

// Hook for recalculating Rizz Score
export const useRecalculateRizzScore = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => matchingApi.recalculateRizzScore(),
    onSuccess: (data) => {
      // Update the cached score
      queryClient.setQueryData(RIZZ_KEYS.score, data.rizzScore);
      
      // Invalidate leaderboard to reflect updated score
      queryClient.invalidateQueries({ queryKey: RIZZ_KEYS.leaderboard });

      toast({
        title: "Rizz Score Updated!",
        description: `Your new score is ${data.rizzScore.currentScore}`,
      });
    },
    onError: (error) => {
      toast({
        title:  "Failed to update Rizz Score",
        description: error.message
      });
    },
  });
};

// Hook for Rizz Score leaderboard
export const useRizzLeaderboard = (query?: LeaderboardQuery, enabled = true) => {
  return useQuery({
    queryKey: [...RIZZ_KEYS.leaderboard, query],
    queryFn: () => matchingApi.getRizzLeaderboard(query),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data.leaderboard,
  });
};

// Hook for Rizz Score analytics
export const useRizzScoreAnalytics = () => {
  const { data: rizzScore, isLoading, error } = useRizzScore();

  // Calculate score trends
  const getScoreTrend = () => {
    if (!rizzScore?.scoreHistory || rizzScore.scoreHistory.length < 2) {
      return { trend: 'neutral', change: 0 };
    }

    const recent = rizzScore.scoreHistory.slice(-7); // Last 7 entries
    const latestScore = recent[recent.length - 1]?.score || 0;
    const previousScore = recent[recent.length - 2]?.score || 0;
    const change = latestScore - previousScore;

    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      change: Math.abs(change),
      percentage: previousScore > 0 ? ((change / previousScore) * 100) : 0,
    };
  };

  // Get strongest factors
  const getStrongestFactors = () => {
    if (!rizzScore?.factors) return [];

    const factors = [
      { name: 'Engagement', score: rizzScore.factors.engagement.engagementRate * 20 },
      { name: 'Growth', score: rizzScore.factors.growth.consistencyScore },
      { name: 'Collaboration', score: (rizzScore.factors.collaboration.avgPartnerRating / 5) * 100 },
      { name: 'Quality', score: rizzScore.factors.quality.contentScore },
    ];

    return factors
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  // Get improvement suggestions
  const getImprovementSuggestions = () => {
    if (!rizzScore?.factors) return [];

    const suggestions = [];
    const factors = rizzScore.factors;

    // Check engagement
    if (factors.engagement.engagementRate < 3) {
      suggestions.push({
        category: 'engagement',
        title: 'Boost Your Engagement',
        description: 'Create more interactive content and respond to comments regularly',
        impact: 'high',
      });
    }

    // Check collaboration
    if (factors.collaboration.successfulCollabs < 5) {
      suggestions.push({
        category: 'collaboration',
        title: 'Collaborate More',
        description: 'Reach out to other creators and complete more collaborative projects',
        impact: 'medium',
      });
    }

    // Check consistency
    if (factors.growth.consistencyScore < 70) {
      suggestions.push({
        category: 'consistency',
        title: 'Be More Consistent',
        description: 'Maintain a regular posting schedule to improve your growth score',
        impact: 'medium',
      });
    }

    // Check content quality
    if (factors.quality.contentScore < 75) {
      suggestions.push({
        category: 'quality',
        title: 'Enhance Content Quality',
        description: 'Focus on creating higher quality, original content',
        impact: 'high',
      });
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  };

  // Calculate percentile ranking
  const getPercentileRank = () => {
    if (!rizzScore) return 0;
    
    // This would typically come from the backend, but we can estimate
    // based on the score distribution
    const score = rizzScore.currentScore;
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 70;
    if (score >= 60) return 55;
    if (score >= 50) return 40;
    if (score >= 40) return 25;
    return 10;
  };

  return {
    rizzScore,
    isLoading,
    error,
    analytics: {
      scoreTrend: getScoreTrend(),
      strongestFactors: getStrongestFactors(),
      improvementSuggestions: getImprovementSuggestions(),
      percentileRank: getPercentileRank(),
    },
  };
};

// Hook for comparing Rizz Scores
export const useRizzScoreComparison = (targetUserId?: string) => {
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

// export {
//   useRizzScore,
//   useRecalculateRizzScore,
//   useRizzLeaderboard,
//   useRizzScoreAnalytics,
//   useRizzScoreComparison,
// };