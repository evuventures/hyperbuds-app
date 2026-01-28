// src/stores/matching.store.ts

import { create } from 'zustand';
import { useMemo } from 'react';
import type { MatchFilters, MatchSuggestion, RizzScore, SwipeAction } from '@/types/matching.types';

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  score: number;
}

export interface MatchingState {
  suggestions: MatchSuggestion[];
  currentMatchIndex: number;
  isLoading: boolean;
  error: string | null;
  filters: MatchFilters;
  isFilterPanelOpen: boolean;
  history: MatchSuggestion[];
  historyFilters: {
    status: string;
    page: number;
    limit: number;
  };
  rizzScore: RizzScore | null;
  leaderboard: LeaderboardEntry[];
  isRizzScoreLoading: boolean;
  swipeDirection: 'left' | 'right' | null;
  showMatchAnimation: boolean;
  isMutualMatch: boolean;
  // Actions
  setSuggestions: (suggestions: MatchSuggestion[]) => void;
  setCurrentMatchIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFilters: (filters: Partial<MatchFilters>) => void;
  resetFilters: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  handleSwipe: (direction: SwipeAction, matchId: string) => void;
  removeMatch: (matchId: string) => void;
  addToHistory: (match: MatchSuggestion) => void;
  setHistory: (history: MatchSuggestion[]) => void;
  updateHistoryFilters: (filters: Partial<{ status: string; page: number; limit: number }>) => void;
  setRizzScore: (score: RizzScore | null) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setRizzScoreLoading: (loading: boolean) => void;
  showMutualMatchAnimation: () => void;
  hideMutualMatchAnimation: () => void;
  resetMatchingState: () => void;
}

export const initialFilters: MatchFilters = {
  audienceSize: { min: 1000, max: 1000000 },
  rizzScore: { min: 50, max: 100 },
  location: {},
  niche: [],
  platforms: [],
  engagementRate: { min: 0, max: 100 },
  collaborationHistory: 'any',
  verified: false,
  premium: false,
};

export const initialHistoryFilters = {
  status: 'all',
  page: 1,
  limit: 20,
};

export const useMatchingStore = create<MatchingState>((set, get) => ({
  suggestions: [],
  currentMatchIndex: 0,
  isLoading: false,
  error: null,
  filters: initialFilters,
  isFilterPanelOpen: false,
  history: [],
  historyFilters: initialHistoryFilters,
  rizzScore: null,
  leaderboard: [],
  isRizzScoreLoading: false,
  swipeDirection: null,
  showMatchAnimation: false,
  isMutualMatch: false,

  setSuggestions: (suggestions) => set({ suggestions, currentMatchIndex: 0 }),
  setCurrentMatchIndex: (index) => set({ currentMatchIndex: index }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  updateFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: initialFilters }),
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
  handleSwipe: (direction, matchId) => {
    const state = get();
    const currentMatch = state.suggestions[state.currentMatchIndex];
    if (!currentMatch || currentMatch._id !== matchId) {
      return;
    }
    const updatedMatch: MatchSuggestion = {
      ...currentMatch,
      status: direction === 'like' ? 'liked' : 'passed',
      actionTakenAt: new Date().toISOString(),
    };
    const newSuggestions = state.suggestions.filter((_, index) => index !== state.currentMatchIndex);
    set({
      history: [updatedMatch, ...state.history.filter((h) => h._id !== updatedMatch._id)],
      suggestions: newSuggestions,
      currentMatchIndex: Math.min(state.currentMatchIndex, newSuggestions.length - 1),
      swipeDirection: direction === 'like' ? 'right' : 'left',
    });
    // Reset swipe direction after animation
    setTimeout(() => {
      set({ swipeDirection: null });
    }, 300);
  },
  removeMatch: (matchId) => set((state) => ({
    suggestions: state.suggestions.filter((match) => match._id !== matchId),
  })),
  addToHistory: (match) => set((state) => ({
    history: [match, ...state.history.filter((h) => h._id !== match._id)],
  })),
  setHistory: (history) => set({ history }),
  updateHistoryFilters: (filters) => set((state) => ({
    historyFilters: { ...state.historyFilters, ...filters },
  })),
  setRizzScore: (score) => set({ rizzScore: score }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setRizzScoreLoading: (loading) => set({ isRizzScoreLoading: loading }),
  showMutualMatchAnimation: () => set({ showMatchAnimation: true, isMutualMatch: true }),
  hideMutualMatchAnimation: () => set({ showMatchAnimation: false, isMutualMatch: false }),
  resetMatchingState: () => set({
    suggestions: [],
    currentMatchIndex: 0,
    isLoading: false,
    error: null,
    filters: initialFilters,
    isFilterPanelOpen: false,
    swipeDirection: null,
    showMatchAnimation: false,
    isMutualMatch: false,
  }),
}));

export const useMatchingSelectors = () => {
  const store = useMatchingStore();

  return useMemo(() => {
    const hasActiveFilters = Object.keys(store.filters).some((key) => {
      const value = store.filters[key as keyof MatchFilters];
      const initialValue = initialFilters[key as keyof MatchFilters];
      if (key === 'audienceSize' || key === 'rizzScore' || key === 'engagementRate') {
        const rangeValue = value as { min: number; max: number } | undefined;
        const initialRangeValue = initialValue as { min: number; max: number } | undefined;
        return (
          rangeValue &&
          initialRangeValue &&
          (rangeValue.min !== initialRangeValue.min || rangeValue.max !== initialRangeValue.max)
        );
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      if (typeof value === 'boolean') {
        return value !== (initialValue as boolean);
      }
      if (typeof value === 'string') {
        return value !== (initialValue as string);
      }
      return false;
    });

    const likedMatches = store.history.filter((m) => m.status === 'liked').length;
    const mutualMatches = store.history.filter((m) => m.status === 'mutual').length;
    const passedMatches = store.history.filter((m) => m.status === 'passed').length;

    return {
      currentMatch: store.suggestions[store.currentMatchIndex],
      hasMoreMatches: store.currentMatchIndex < store.suggestions.length - 1,
      matchesRemaining: store.suggestions.length - store.currentMatchIndex - 1,
      hasActiveFilters,
      totalMatches: store.history.length,
      likedMatches,
      mutualMatches,
      passedMatches,
      rizzScorePercentile: store.rizzScore
        ? Math.round((store.rizzScore.currentScore / 100) * 100)
        : 0,
      isRizzScoreImproving:
        store.rizzScore?.scoreHistory && store.rizzScore.scoreHistory.length > 1
          ? store.rizzScore.scoreHistory.slice(-2).reduce((acc, curr, index, arr) =>
              index === 1 ? curr.score > arr[0].score : acc,
            false)
          : false,
      successRate:
        store.history.length > 0
          ? (mutualMatches / likedMatches) * 100 || 0
          : 0,
    };
  }, [store]);
};

export const useMatchingActions = () => {
  const store = useMatchingStore();

  return {
    refreshAllMatches: (newMatches: MatchSuggestion[]) => {
      store.setSuggestions(newMatches);
      store.setError(null);
      store.setCurrentMatchIndex(0);
    },
    applyFilters: (newFilters: Partial<MatchFilters>) => {
      store.updateFilters(newFilters);
      store.setFilterPanelOpen(false);
      store.setCurrentMatchIndex(0);
    },
    clearHistory: () => {
      store.setHistory([]);
    },
    loadMoreHistory: () => {
      store.updateHistoryFilters({ page: store.historyFilters.page + 1 });
    },
    superLike: (matchId: string) => {
      store.handleSwipe('super-like' as SwipeAction, matchId);
    },
    nextMatch: () => {
      if (store.currentMatchIndex < store.suggestions.length - 1) {
        store.setCurrentMatchIndex(store.currentMatchIndex + 1);
      }
    },
    previousMatch: () => {
      if (store.currentMatchIndex > 0) {
        store.setCurrentMatchIndex(store.currentMatchIndex - 1);
      }
    },
    getMatchingInsights: () => {
      const totalLikes = store.history.filter((m) => m.status === 'liked').length;
      const totalPasses = store.history.filter((m) => m.status === 'passed').length;
      const totalMutual = store.history.filter((m) => m.status === 'mutual').length;
      return {
        totalInteractions: store.history.length,
        likeRate: totalLikes + totalPasses > 0 ? (totalLikes / (totalLikes + totalPasses)) * 100 : 0,
        mutualMatchRate: totalLikes > 0 ? (totalMutual / totalLikes) * 100 : 0,
        currentRizzScore: store.rizzScore?.currentScore || 0,
        rizzTrend:
          store.rizzScore?.scoreHistory && store.rizzScore.scoreHistory.length > 1
            ? store.rizzScore.scoreHistory[store.rizzScore.scoreHistory.length - 1].score -
              store.rizzScore.scoreHistory[store.rizzScore.scoreHistory.length - 2].score
            : 0,
      };
    },
  };
};
