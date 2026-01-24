import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MatchSuggestion, MatchFilters, RizzScore, SwipeAction } from '@/types/matching.types';

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

const initialState: MatchingState = {
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
};

const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    setSuggestions(state, action: PayloadAction<MatchSuggestion[]>) {
      state.suggestions = action.payload;
      state.currentMatchIndex = 0;
    },
    setCurrentMatchIndex(state, action: PayloadAction<number>) {
      state.currentMatchIndex = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateFilters(state, action: PayloadAction<Partial<MatchFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialFilters;
    },
    setFilterPanelOpen(state, action: PayloadAction<boolean>) {
      state.isFilterPanelOpen = action.payload;
    },
    applySwipe(state, action: PayloadAction<{ direction: SwipeAction; matchId: string }>) {
      const { direction, matchId } = action.payload;
      const currentMatch = state.suggestions[state.currentMatchIndex];
      if (!currentMatch || currentMatch._id !== matchId) {
        return;
      }
      const updatedMatch: MatchSuggestion = {
        ...currentMatch,
        status: direction === 'like' ? 'liked' : 'passed',
        actionTakenAt: new Date().toISOString(),
      };
      state.history = [updatedMatch, ...state.history.filter((h) => h._id !== updatedMatch._id)];
      const newSuggestions = state.suggestions.filter((_, index) => index !== state.currentMatchIndex);
      state.suggestions = newSuggestions;
      state.currentMatchIndex = Math.min(state.currentMatchIndex, newSuggestions.length - 1);
      state.swipeDirection = direction === 'like' ? 'right' : 'left';
    },
    removeMatch(state, action: PayloadAction<string>) {
      state.suggestions = state.suggestions.filter((match) => match._id !== action.payload);
    },
    addToHistory(state, action: PayloadAction<MatchSuggestion>) {
      state.history = [action.payload, ...state.history.filter((h) => h._id !== action.payload._id)];
    },
    setHistory(state, action: PayloadAction<MatchSuggestion[]>) {
      state.history = action.payload;
    },
    updateHistoryFilters(state, action: PayloadAction<Partial<{ status: string; page: number; limit: number }>>) {
      state.historyFilters = { ...state.historyFilters, ...action.payload };
    },
    setRizzScore(state, action: PayloadAction<RizzScore | null>) {
      state.rizzScore = action.payload;
    },
    setLeaderboard(state, action: PayloadAction<LeaderboardEntry[]>) {
      state.leaderboard = action.payload;
    },
    setRizzScoreLoading(state, action: PayloadAction<boolean>) {
      state.isRizzScoreLoading = action.payload;
    },
    setSwipeDirection(state, action: PayloadAction<'left' | 'right' | null>) {
      state.swipeDirection = action.payload;
    },
    showMutualMatchAnimation(state) {
      state.showMatchAnimation = true;
      state.isMutualMatch = true;
    },
    hideMutualMatchAnimation(state) {
      state.showMatchAnimation = false;
      state.isMutualMatch = false;
    },
    resetMatchingState(state) {
      state.suggestions = [];
      state.currentMatchIndex = 0;
      state.isLoading = false;
      state.error = null;
      state.filters = initialFilters;
      state.isFilterPanelOpen = false;
      state.swipeDirection = null;
      state.showMatchAnimation = false;
      state.isMutualMatch = false;
    },
  },
});

export const {
  setSuggestions,
  setCurrentMatchIndex,
  setLoading,
  setError,
  updateFilters,
  resetFilters,
  setFilterPanelOpen,
  applySwipe,
  removeMatch,
  addToHistory,
  setHistory,
  updateHistoryFilters,
  setRizzScore,
  setLeaderboard,
  setRizzScoreLoading,
  setSwipeDirection,
  showMutualMatchAnimation,
  hideMutualMatchAnimation,
  resetMatchingState,
} = matchingSlice.actions;

export default matchingSlice.reducer;
