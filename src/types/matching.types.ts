// src/types/matching.types.ts

export interface MatchSuggestion {
  _id: string;
  userId: string;
  targetUserId: string;
  compatibilityScore: number;
  matchType: 'ai-suggested' | 'manual-search' | 'proximity-based' | 'niche-based';
  scoreBreakdown: {
    audienceOverlap: number;
    nicheCompatibility: number;
    engagementStyle: number;
    geolocation: number;
    activityTime: number;
    rizzScoreCompatibility: number;
  };
  status: 'pending' | 'viewed' | 'liked' | 'passed' | 'mutual';
  viewedAt?: string;
  actionTakenAt?: string;
  feedback?: MatchFeedback;
  metadata: {
    algorithm: string;
    confidence: number;
    features: string[];
  };
  targetProfile?: CreatorProfile;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  niche: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  stats: {
    totalFollowers: number;
    avgEngagement: number;
    platformBreakdown: Record<string, { followers: number; engagement: number }>;
  };
  socialLinks?: Record<string, string>;
  rizzScore?: number;
  isPublic: boolean;
  isActive: boolean;
}

export interface MatchPreferences {
  collaborationTypes: string[];
  audienceSize: {
    min?: number;
    max?: number;
  };
  locations: string[];
}

export interface CompatibilityQuery {
  targetUserId: string;
  useAI?: boolean;
}

export interface MatchAction {
  action: 'like' | 'pass' | 'view';
  feedback?: {
    rating?: number;
    reasons?: string[];
    comment?: string;
  };
}

export interface MatchFeedback {
  rating: number; // 1-5 stars
  reasons: string[];
  comment?: string;
}

export interface RizzScore {
  _id: string;
  userId: string;
  currentScore: number;
  scoreHistory?: Array<{
    score: number;
    date: string;
    factors: {
      engagement: number;
      followerGrowth: number;
      contentQuality: number;
      collaborationSuccess: number;
      communityInteraction: number;
    };
    calculationMethod: string;
  }>;
  factors: {
    engagement: {
      avgLikes: number;
      avgComments: number;
      avgShares: number;
      avgViews: number;
      engagementRate: number;
    };
    growth: {
      followerGrowthRate: number;
      contentFrequency: number;
      consistencyScore: number;
    };
    collaboration: {
      successfulCollabs: number;
      avgPartnerRating: number;
      responseRate: number;
      completionRate: number;
    };
    quality: {
      contentScore: number;
      technicalQuality: number;
      originality: number;
    };
  };
  trending: {
    isViral: boolean;
    trendingScore: number;
    viralContent: string[];
  };
  lastCalculated: string;
  calculationVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardQuery {
  niche?: string;
  location?: string;
  limit?: number;
  timeframe?: 'current' | 'weekly' | 'monthly';
}

export interface PaginatedResponse<T> {
  matches: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse {
  message: string;
  success?: boolean;
}

// Filter types for the UI - UPDATED with more comprehensive filtering
export interface MatchFilters {
  niche?: string[];
  audienceSize?: {
    min: number;
    max: number;
  };
  location?: {
    country?: string;
    state?: string;
    city?: string;
    radius?: number; // km
  };
  rizzScore?: {
    min: number;
    max: number;
  };
  status?: MatchSuggestion['status'][];
  // NEW ADDITIONS from store implementation:
  platforms?: string[];
  engagementRate?: {
    min: number;
    max: number;
  };
  collaborationHistory?: 'any' | 'none' | 'successful';
  verified?: boolean;
  premium?: boolean;
  matchType?: MatchSuggestion['matchType'][];
  compatibilityThreshold?: number;
  // Location-specific filters
  withinRadius?: {
    center: [number, number]; // [longitude, latitude]
    radius: number; // km
  };
  timezone?: string[];
  language?: string[];
}

// UI State types - ENHANCED
export interface MatchingState {
  suggestions: MatchSuggestion[];
  loading: boolean;
  error: string | null;
  filters: MatchFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  currentMatch?: MatchSuggestion;
  // NEW ADDITIONS:
  currentMatchIndex: number;
  isFilterPanelOpen: boolean;
  swipeDirection: 'left' | 'right' | null;
  showMatchAnimation: boolean;
  isMutualMatch: boolean;
}

export interface RizzScoreState {
  currentScore: RizzScore | null;
  leaderboard: Array<{
    userId: string;
    currentScore: number;
    trending: {
      isViral: boolean;
      trendingScore: number;
    };
    profile: {
      username: string;
      displayName: string;
      avatar?: string;
      niche: string[];
    };
  }>;
  loading: boolean;
  error: string | null;
  // NEW ADDITION:
  isRecalculating: boolean;
}

// Swipe actions for mobile UI
export type SwipeAction = 'like' | 'pass' | 'super-like';

export interface SwipeResult {
  action: SwipeAction;
  matchId: string;
  isMutual?: boolean;
}

// Notification types
export interface MatchNotification {
  id: string;
  type: 'new-match' | 'mutual-match' | 'match-message';
  userId: string;
  matchId?: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// NEW TYPES ADDED based on store implementation:

// Location filter with more granular control
export interface LocationFilter {
  country?: string;
  state?: string;
  city?: string;
  radius?: number;
  coordinates?: [number, number];
  timezone?: string;
}

// Score history entry for analytics
export interface ScoreHistoryEntry {
    
  score: number;
  date: string;
  factors: {
    engagement: number;
    followerGrowth: number;
    contentQuality: number;
    collaborationSuccess: number;
    communityInteraction: number;
  };
  calculationMethod: string;
}

// Rizz Score factors for detailed breakdown
export interface RizzFactors {
  engagement: {
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    avgViews: number;
    engagementRate: number;
  };
  growth: {
    followerGrowthRate: number;
    contentFrequency: number;
    consistencyScore: number;
  };
  collaboration: {
    successfulCollabs: number;
    avgPartnerRating: number;
    responseRate: number;
    completionRate: number;
  };
  quality: {
    contentScore: number;
    technicalQuality: number;
    originality: number;
  };
}



// Match metadata for AI algorithm insights
export interface MatchMetadata {
  algorithm: string;
  confidence: number;
  features: string[];
  processingTime?: number;
  aiVersion?: string;
}

// Compatibility breakdown for detailed analysis
export interface CompatibilityBreakdown {
  audienceOverlap: number;
  nicheCompatibility: number;
  engagementStyle: number;
  geolocation: number;
  activityTime: number;
  rizzScoreCompatibility: number;
  // Additional metrics:
  platformCompatibility?: number;
  contentStyleAlignment?: number;
  collaborationPotential?: number;
}

// Analytics and insights types
export interface MatchingAnalytics {
  totalInteractions: number;
  likeRate: number;
  mutualMatchRate: number;
  successRate: number;
  averageCompatibilityScore: number;
  topNiches: string[];
  peakActivityTimes: string[];
  geograficDistribution: Record<string, number>;
}

export interface MatchingInsights {
  totalInteractions: number;
  likeRate: number;
  mutualMatchRate: number;
  currentRizzScore: number;
  rizzTrend: number;
  topPerformingNiches: string[];
  recommendedImprovements: string[];
}

// Filter validation and constraints
export interface FilterConstraints {
  audienceSize: {
    absoluteMin: number;
    absoluteMax: number;
    defaultMin: number;
    defaultMax: number;
  };
  rizzScore: {
    min: number;
    max: number;
    defaultMin: number;
    defaultMax: number;
  };
  radius: {
    min: number;
    max: number;
    default: number;
  };
}

// History filters for match history management
export interface MatchHistoryFilters {
  status: 'all' | MatchSuggestion['status'];
  page: number;
  limit: number;
  dateRange?: {
    from: string;
    to: string;
  };
  sortBy?: 'date' | 'compatibility' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// API Response types for different endpoints
export interface MatchSuggestionsResponse extends PaginatedResponse<MatchSuggestion> {
  totalNewMatches: number;
  refreshedAt: string;
}

export interface RizzScoreResponse {
  rizzScore: RizzScore;
  rank: number;
  percentile: number;
}

export interface LeaderboardResponse {
  leaderboard: Array<{
    userId: string;
    currentScore: number;
    rank: number;
    trending: {
      isViral: boolean;
      trendingScore: number;
    };
    profile: Pick<CreatorProfile, 'username' | 'displayName' | 'avatar' | 'niche'>;
  }>;
  userRank?: number;
  totalUsers: number;
}

export interface MatchActionResponse extends ApiResponse {
  isMutual: boolean;
  mutualMatchId?: string;
}

// Error types for better error handling
export interface MatchingError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Preferences for matching algorithm
export interface AlgorithmPreferences {
  prioritizeNiche: boolean;
  prioritizeLocation: boolean;
  prioritizeAudienceSize: boolean;
  prioritizeEngagement: boolean;
  weights: {
    nicheCompatibility: number;
    audienceOverlap: number;
    geolocation: number;
    engagementStyle: number;
    rizzScore: number;
  };
}

// Types for real-time features
export interface RealtimeMatchEvent {
  type: 'new-match' | 'mutual-match' | 'match-expired' | 'profile-updated';
  data: any;
  timestamp: string;
}

export interface MatchExpiry {
  matchId: string;
  expiresAt: string;
  warningAt: string;
}