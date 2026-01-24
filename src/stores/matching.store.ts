// src/stores/matching.store.ts

import { useMemo } from 'react';
import type { MatchFilters, MatchSuggestion, RizzScore, SwipeAction } from '@/types/matching.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addToHistory,
  initialFilters,
  resetFilters,
  setCurrentMatchIndex,
  setError,
  setFilterPanelOpen,
  setHistory,
  setLeaderboard,
  setLoading,
  setRizzScore,
  setRizzScoreLoading,
  setSuggestions,
  updateFilters,
  updateHistoryFilters,
  removeMatch,
  showMutualMatchAnimation,
  hideMutualMatchAnimation,
  resetMatchingState,
} from '@/store/slices/matchingSlice';
import { handleSwipe as handleSwipeThunk } from '@/store/thunks/matchingThunks';

export const useMatchingStore = () => {
  const state = useAppSelector((store) => store.matching);
  const dispatch = useAppDispatch();

  return {
    ...state,
    setSuggestions: (suggestions: MatchSuggestion[]) => dispatch(setSuggestions(suggestions)),
    setCurrentMatchIndex: (index: number) => dispatch(setCurrentMatchIndex(index)),
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    updateFilters: (filters: Partial<MatchFilters>) => dispatch(updateFilters(filters)),
    resetFilters: () => dispatch(resetFilters()),
    setFilterPanelOpen: (open: boolean) => dispatch(setFilterPanelOpen(open)),
    handleSwipe: (direction: SwipeAction, matchId: string) =>
      dispatch(handleSwipeThunk(direction, matchId)),
    removeMatch: (matchId: string) => dispatch(removeMatch(matchId)),
    addToHistory: (match: MatchSuggestion) => dispatch(addToHistory(match)),
    setHistory: (history: MatchSuggestion[]) => dispatch(setHistory(history)),
    updateHistoryFilters: (filters: Partial<{ status: string; page: number; limit: number }>) =>
      dispatch(updateHistoryFilters(filters)),
    setRizzScore: (score: RizzScore | null) => dispatch(setRizzScore(score)),
    setLeaderboard: (leaderboard: unknown[]) => dispatch(setLeaderboard(leaderboard as any)),
    setRizzScoreLoading: (loading: boolean) => dispatch(setRizzScoreLoading(loading)),
    showMutualMatchAnimation: () => dispatch(showMutualMatchAnimation()),
    hideMutualMatchAnimation: () => dispatch(hideMutualMatchAnimation()),
    resetMatchingState: () => dispatch(resetMatchingState()),
  };
};

export const useMatchingSelectors = () => {
  const store = useAppSelector((state) => state.matching);

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
  const dispatch = useAppDispatch();
  const state = useAppSelector((store) => store.matching);

  return {
    refreshAllMatches: (newMatches: MatchSuggestion[]) => {
      dispatch(setSuggestions(newMatches));
      dispatch(setError(null));
      dispatch(setCurrentMatchIndex(0));
    },
    applyFilters: (newFilters: Partial<MatchFilters>) => {
      dispatch(updateFilters(newFilters));
      dispatch(setFilterPanelOpen(false));
      dispatch(setCurrentMatchIndex(0));
    },
    clearHistory: () => {
      dispatch(setHistory([]));
    },
    loadMoreHistory: () => {
      dispatch(updateHistoryFilters({ page: state.historyFilters.page + 1 }));
    },
    superLike: (matchId: string) => {
      dispatch(handleSwipeThunk('super-like' as SwipeAction, matchId));
    },
    nextMatch: () => {
      if (state.currentMatchIndex < state.suggestions.length - 1) {
        dispatch(setCurrentMatchIndex(state.currentMatchIndex + 1));
      }
    },
    previousMatch: () => {
      if (state.currentMatchIndex > 0) {
        dispatch(setCurrentMatchIndex(state.currentMatchIndex - 1));
      }
    },
    getMatchingInsights: () => {
      const totalLikes = state.history.filter((m) => m.status === 'liked').length;
      const totalPasses = state.history.filter((m) => m.status === 'passed').length;
      const totalMutual = state.history.filter((m) => m.status === 'mutual').length;
      return {
        totalInteractions: state.history.length,
        likeRate: totalLikes + totalPasses > 0 ? (totalLikes / (totalLikes + totalPasses)) * 100 : 0,
        mutualMatchRate: totalLikes > 0 ? (totalMutual / totalLikes) * 100 : 0,
        currentRizzScore: state.rizzScore?.currentScore || 0,
        rizzTrend:
          state.rizzScore?.scoreHistory && state.rizzScore.scoreHistory.length > 1
            ? state.rizzScore.scoreHistory[state.rizzScore.scoreHistory.length - 1].score -
              state.rizzScore.scoreHistory[state.rizzScore.scoreHistory.length - 2].score
            : 0,
      };
    },
  };
};
