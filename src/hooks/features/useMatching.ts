// src/hooks/features/useMatching.ts

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingApi } from '../../lib/api/matching.api';
import { useToast } from '../ui/useToast';
import type {
  MatchSuggestion,
  MatchPreferences,
  CompatibilityQuery,
  MatchAction,
  MatchFeedback,
  RizzScore,
  LeaderboardQuery,
  MatchFilters,
  SwipeResult,
  MatchHistoryFilters
} from '../../types/matching.types';

// Query Keys
const MATCHING_KEYS = {
  suggestions: ['matching', 'suggestions'] as const,
  history: ['matching', 'history'] as const,
  compatibility: ['matching', 'compatibility'] as const,
  rizzScore: ['matching', 'rizz-score'] as const,
  leaderboard: ['matching', 'leaderboard'] as const,
};

// Hook for match suggestions
export const useMatchSuggestions = (params?: {
  page?: number;
  limit?: number;
  enabled?: boolean;
}) => {
  const { page = 1, limit = 10, enabled = true } = params || {};
  
  return useQuery({
    queryKey: [...MATCHING_KEYS.suggestions, page, limit],
    queryFn: () => matchingApi.getSuggestions({ page, limit }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for refreshing match suggestions
export const useRefreshMatches = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params?: { limit?: number }) =>
      matchingApi.getSuggestions({ ...params, refresh: true }),
    onSuccess: (data) => {
      // Update the cache with new suggestions
      queryClient.setQueryData(MATCHING_KEYS.suggestions, data);
      toast({
        title: "Matches refreshed!",
        description: `Found ${data.matches.length} new potential collaborators`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to refresh matches",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for match history - FIXED TYPE
export const useMatchHistory = (params?: {
  page?: number;
  limit?: number;
  status?: 'all' | MatchSuggestion['status'];
  dateRange?: {
    from: string;
    to: string;
  };
  sortBy?: 'date' | 'compatibility' | 'status';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: [...MATCHING_KEYS.history, params],
    queryFn: () => matchingApi.getMatchHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for compatibility score
export const useCompatibilityScore = (query: CompatibilityQuery, enabled = false) => {
  return useQuery({
    queryKey: [...MATCHING_KEYS.compatibility, query.targetUserId, query.useAI],
    queryFn: () => matchingApi.getCompatibilityScore(query),
    enabled: enabled && !!query.targetUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for match actions (like, pass, view)
export const useMatchAction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ matchId, action }: { matchId: string; action: MatchAction }) =>
      matchingApi.updateMatchStatus(matchId, action),
    onSuccess: (data, variables) => {
      // Update suggestions cache by removing the acted-upon match
      queryClient.setQueryData(MATCHING_KEYS.suggestions, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          matches: old.matches.filter((match: MatchSuggestion) => 
            match._id !== variables.matchId
          ),
        };
      });

      // Invalidate history to show updated status
      queryClient.invalidateQueries({ queryKey: MATCHING_KEYS.history });

      // Show success message
      if (data.isMutual) {
        toast({
          title: "It's a match! 🎉",
          description: "You both liked each other! Start collaborating now.",
        });
      } else if (variables.action.action === 'like') {
        toast({
          title: "Profile liked!",
          description: "Waiting for them to see your profile.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for swipe actions (mobile-friendly)
export const useSwipeActions = () => {
  const matchAction = useMatchAction();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSwipe = useCallback(async (
    matchId: string, 
    action: 'like' | 'pass' | 'super-like'
  ): Promise<SwipeResult> => {
    setIsProcessing(true);
    
    try {
      const apiAction: MatchAction = {
        action: action === 'super-like' ? 'like' : action,
        feedback: action === 'super-like' ? { rating: 5 } : undefined,
      };

      const result = await matchAction.mutateAsync({ matchId, action: apiAction });
      
      return {
        action,
        matchId,
        isMutual: result.isMutual,
      };
    } finally {
      setIsProcessing(false);
    }
  }, [matchAction]);

  return {
    handleSwipe,
    isProcessing,
  };
};

// Hook for match feedback
export const useMatchFeedback = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ matchId, feedback }: { matchId: string; feedback: MatchFeedback }) =>
      matchingApi.provideFeedback(matchId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCHING_KEYS.history });
      toast({
        title: "Feedback submitted",
        description: "Thank you for helping us improve our matching algorithm!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for setting match preferences
export const useMatchPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (preferences: MatchPreferences) =>
      matchingApi.setPreferences(preferences),
    onSuccess: () => {
      // Invalidate suggestions to get new matches based on preferences
      queryClient.invalidateQueries({ queryKey: MATCHING_KEYS.suggestions });
      toast({
        title: "Preferences updated!",
        description: "Your match suggestions will be updated based on your new preferences.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update preferences",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for blocking users
export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => matchingApi.blockUser(userId),
    onSuccess: (_, userId) => {
      // Remove blocked user from all cached data
      queryClient.setQueryData(MATCHING_KEYS.suggestions, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          matches: old.matches.filter((match: MatchSuggestion) => 
            match.targetUserId !== userId
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: MATCHING_KEYS.history });
      
      toast({
        title: "User blocked",
        description: "You won't see this user in your matches anymore.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to block user",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook for managing match filters - ENHANCED
export const useMatchFilters = (initialFilters: MatchFilters = {}) => {
  const [filters, setFilters] = useState<MatchFilters>(initialFilters);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const updateFilters = useCallback((newFilters: Partial<MatchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Enhanced active filters detection
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (!value) return false;
      
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      if (typeof value === 'object' && value !== null) {
        if ('min' in value && 'max' in value) {
          // For range filters, check if they differ from defaults
          return true; // You might want to compare against initial values
        }
        return Object.keys(value).length > 0;
      }
      
      if (typeof value === 'boolean') {
        return value === true;
      }
      
      if (typeof value === 'string') {
        return value !== '' && value !== 'any';
      }
      
      return false;
    });
  }, [filters]);

  const getActiveFilterCount = useCallback(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (!value) return count;
      
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      }
      
      if (typeof value === 'object' && value !== null) {
        return count + (Object.keys(value).length > 0 ? 1 : 0);
      }
      
      if (typeof value === 'boolean') {
        return count + (value ? 1 : 0);
      }
      
      if (typeof value === 'string') {
        return count + (value !== '' && value !== 'any' ? 1 : 0);
      }
      
      return count;
    }, 0);
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: getActiveFilterCount(),
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
  };
};

// Main matching hook that combines multiple functionalities
export const useMatching = () => {
  const suggestions = useMatchSuggestions();
  const refreshMatches = useRefreshMatches();
  const matchAction = useMatchAction();
  const swipeActions = useSwipeActions();
  const blockUser = useBlockUser();
  const matchFilters = useMatchFilters();

  return {
    // Data
    suggestions: suggestions.data?.matches || [],
    isLoading: suggestions.isLoading,
    error: suggestions.error,
    pagination: suggestions.data?.pagination,
    
    // Actions
    refreshMatches: refreshMatches.mutate,
    isRefreshing: refreshMatches.isPending,
    handleMatchAction: matchAction.mutate,
    handleSwipe: swipeActions.handleSwipe,
    isProcessingSwipe: swipeActions.isProcessing,
    blockUser: blockUser.mutate,
    
    // Filters
    ...matchFilters,
    
    // Refetch
    refetch: suggestions.refetch,
  };
};

export default useMatching;