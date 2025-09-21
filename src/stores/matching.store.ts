// src/stores/matching.store.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  MatchSuggestion,
  MatchFilters,
  RizzScore,
  SwipeAction,
} from '../types/matching.types';

// New interface for a leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string;
  score: number;
}

interface MatchingState {
  // Match suggestions
  suggestions: MatchSuggestion[];
  currentMatchIndex: number;
  isLoading: boolean;
  error: string | null;
  // Filters
  filters: MatchFilters;
  isFilterPanelOpen: boolean;
  // Match history
  history: MatchSuggestion[];
  historyFilters: {
    status: string;
    page: number;
    limit: number;
  };
  // Rizz Score
  rizzScore: RizzScore | null;
  leaderboard: LeaderboardEntry[]; // Type fixed here
  isRizzScoreLoading: boolean;
  // UI State
  swipeDirection: 'left' | 'right' | null;
  showMatchAnimation: boolean;
  isMutualMatch: boolean;
  // Actions
  setSuggestions: (suggestions: MatchSuggestion[]) => void;
  setCurrentMatchIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Filter actions
  updateFilters: (filters: Partial<MatchFilters>) => void;
  resetFilters: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  // Match actions
  handleSwipe: (direction: SwipeAction, matchId: string) => void;
  removeMatch: (matchId: string) => void;
  addToHistory: (match: MatchSuggestion) => void;
  // History actions
  setHistory: (history: MatchSuggestion[]) => void;
  updateHistoryFilters: (filters: Partial<{ status: string; page: number; limit: number }>) => void;
  // Rizz Score actions
  setRizzScore: (score: RizzScore) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void; // Type fixed here
  setRizzScoreLoading: (loading: boolean) => void;
  // UI actions
  setSwipeDirection: (direction: 'left' | 'right' | null) => void;
  showMutualMatchAnimation: () => void;
  hideMutualMatchAnimation: () => void;
  // Reset functions
  resetMatchingState: () => void;
}

const initialFilters: MatchFilters = {
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

const initialHistoryFilters = {
  status: 'all',
  page: 1,
  limit: 20,
};

export const useMatchingStore = create<MatchingState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        suggestions: [],
        currentMatchIndex: 0,
        isLoading: false,
        error: null,
        // Filters
        filters: initialFilters,
        isFilterPanelOpen: false,
        // History
        history: [],
        historyFilters: initialHistoryFilters,
        // Rizz Score
        rizzScore: null,
        leaderboard: [],
        isRizzScoreLoading: false,
        // UI State
        swipeDirection: null,
        showMatchAnimation: false,
        isMutualMatch: false,
        // Actions
        setSuggestions: (suggestions) =>
          set({ suggestions, currentMatchIndex: 0 }, false, 'setSuggestions'),
        setCurrentMatchIndex: (index) =>
          set({ currentMatchIndex: index }, false, 'setCurrentMatchIndex'),
        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),
        setError: (error) =>
          set({ error }, false, 'setError'),
        // Filter actions
        updateFilters: (newFilters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...newFilters },
            }),
            false,
            'updateFilters'
          ),
        resetFilters: () =>
          set({ filters: initialFilters }, false, 'resetFilters'),
        setFilterPanelOpen: (open) =>
          set({ isFilterPanelOpen: open }, false, 'setFilterPanelOpen'),
        // Match actions
        handleSwipe: (direction, matchId) => {
          const state = get();
          const currentMatch = state.suggestions[state.currentMatchIndex];
          if (currentMatch && currentMatch._id === matchId) {
            // Update match status based on swipe direction
            const updatedMatch = {
              ...currentMatch,
              status: direction === 'like' ? 'liked' as const : 'passed' as const,
              actionTakenAt: new Date().toISOString(),
            };
            // Add to history
            get().addToHistory(updatedMatch);
            // Remove from suggestions and move to next
            const newSuggestions = state.suggestions.filter((_, index) =>
              index !== state.currentMatchIndex
            );
            set({
              suggestions: newSuggestions,
              currentMatchIndex: Math.min(state.currentMatchIndex, newSuggestions.length - 1),
              swipeDirection: direction === 'like' ? 'right' : 'left',
            }, false, 'handleSwipe');
            // Clear swipe direction after animation
            setTimeout(() => {
              set({ swipeDirection: null }, false, 'clearSwipeDirection');
            }, 300);
          }
        },
        removeMatch: (matchId) =>
          set(
            (state) => ({
              suggestions: state.suggestions.filter(match => match._id !== matchId),
            }),
            false,
            'removeMatch'
          ),
        addToHistory: (match) =>
          set(
            (state) => ({
              history: [match, ...state.history.filter(h => h._id !== match._id)],
            }),
            false,
            'addToHistory'
          ),
        // History actions
        setHistory: (history) =>
          set({ history }, false, 'setHistory'),
        updateHistoryFilters: (newFilters) =>
          set(
            (state) => ({
              historyFilters: { ...state.historyFilters, ...newFilters },
            }),
            false,
            'updateHistoryFilters'
          ),
        // Rizz Score actions
        setRizzScore: (score) =>
          set({ rizzScore: score }, false, 'setRizzScore'),
        setLeaderboard: (leaderboard) =>
          set({ leaderboard }, false, 'setLeaderboard'),
        setRizzScoreLoading: (loading) =>
          set({ isRizzScoreLoading: loading }, false, 'setRizzScoreLoading'),
        // UI actions
        setSwipeDirection: (direction) =>
          set({ swipeDirection: direction }, false, 'setSwipeDirection'),
        showMutualMatchAnimation: () =>
          set(
            { showMatchAnimation: true, isMutualMatch: true },
            false,
            'showMutualMatchAnimation'
          ),
        hideMutualMatchAnimation: () =>
          set(
            { showMatchAnimation: false, isMutualMatch: false },
            false,
            'hideMutualMatchAnimation'
          ),
        // Reset function
        resetMatchingState: () =>
          set(
            {
              suggestions: [],
              currentMatchIndex: 0,
              isLoading: false,
              error: null,
              filters: initialFilters,
              isFilterPanelOpen: false,
              swipeDirection: null,
              showMatchAnimation: false,
              isMutualMatch: false,
            },
            false,
            'resetMatchingState'
          ),
      }),
      {
        name: 'matching-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          filters: state.filters,
          history: state.history.slice(0, 50), // Keep last 50 history items
          rizzScore: state.rizzScore,
        }),
      }
    ),
    { name: 'MatchingStore' }
  )
);

// Selectors for derived state
export const useMatchingSelectors = () => {
  const store = useMatchingStore();
  return {
    // Current match
    currentMatch: store.suggestions[store.currentMatchIndex],
    hasMoreMatches: store.currentMatchIndex < store.suggestions.length - 1,
    matchesRemaining: store.suggestions.length - store.currentMatchIndex - 1,
    // Filter state
    hasActiveFilters: Object.keys(store.filters).some(key => {
      const value = store.filters[key as keyof MatchFilters];
      const initialValue = initialFilters[key as keyof MatchFilters];
      if (key === 'audienceSize' || key === 'rizzScore' || key === 'engagementRate') {
        const rangeValue = value as { min: number; max: number } | undefined;
        const initialRangeValue = initialValue as { min: number; max: number } | undefined;
        return rangeValue && initialRangeValue &&
          (rangeValue.min !== initialRangeValue.min || rangeValue.max !== initialRangeValue.max);
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
    }),
    // History stats
    totalMatches: store.history.length,
    likedMatches: store.history.filter(m => m.status === 'liked').length,
    mutualMatches: store.history.filter(m => m.status === 'mutual').length,
    passedMatches: store.history.filter(m => m.status === 'passed').length,
    // Rizz Score insights
    rizzScorePercentile: store.rizzScore ?
      Math.round((store.rizzScore.currentScore / 100) * 100) : 0,
    isRizzScoreImproving: store.rizzScore?.scoreHistory && store.rizzScore.scoreHistory.length > 1 ?
      store.rizzScore.scoreHistory.slice(-2).reduce((acc, curr, index, arr) =>
        index === 1 ? curr.score > arr[0].score : acc, false
      ) : false,
    // Match statistics
    successRate: store.history.length > 0 ?
      (store.history.filter(m => m.status === 'mutual').length / store.history.filter(m => m.status === 'liked').length) * 100 || 0 : 0,
  };
};

// Action creators for complex operations
export const useMatchingActions = () => {
  const store = useMatchingStore();
  return {
    // Bulk operations
    refreshAllMatches: (newMatches: MatchSuggestion[]) => {
      store.setSuggestions(newMatches);
      store.setError(null);
      store.setCurrentMatchIndex(0);
    },
    // Filter operations
    applyFilters: (newFilters: Partial<MatchFilters>) => {
      store.updateFilters(newFilters);
      store.setFilterPanelOpen(false);
      // Reset to first match when filters change
      store.setCurrentMatchIndex(0);
    },
    // Batch history operations
    clearHistory: () => {
      store.setHistory([]);
    },
    loadMoreHistory: () => {
      const { historyFilters } = store;
      store.updateHistoryFilters({
        page: historyFilters.page + 1
      });
    },
    // Match interaction helpers
    superLike: (matchId: string) => {
      store.handleSwipe('super-like' as SwipeAction, matchId);
    },
    // UI state management
    nextMatch: () => {
      const { currentMatchIndex, suggestions } = useMatchingStore.getState();
      if (currentMatchIndex < suggestions.length - 1) {
        store.setCurrentMatchIndex(currentMatchIndex + 1);
      }
    },
    previousMatch: () => {
      const { currentMatchIndex } = useMatchingStore.getState();
      if (currentMatchIndex > 0) {
        store.setCurrentMatchIndex(currentMatchIndex - 1);
      }
    },
    // Analytics helpers
    getMatchingInsights: () => {
      const { history, rizzScore } = useMatchingStore.getState();
      const totalLikes = history.filter(m => m.status === 'liked').length;
      const totalPasses = history.filter(m => m.status === 'passed').length;
      const totalMutual = history.filter(m => m.status === 'mutual').length;
      return {
        totalInteractions: history.length,
        likeRate: totalLikes + totalPasses > 0 ? (totalLikes / (totalLikes + totalPasses)) * 100 : 0,
        mutualMatchRate: totalLikes > 0 ? (totalMutual / totalLikes) * 100 : 0,
        currentRizzScore: rizzScore?.currentScore || 0,
        rizzTrend: rizzScore?.scoreHistory && rizzScore.scoreHistory.length > 1 ?
          rizzScore.scoreHistory[rizzScore.scoreHistory.length - 1].score -
          rizzScore.scoreHistory[rizzScore.scoreHistory.length - 2].score : 0,
      };
    },
  };
};