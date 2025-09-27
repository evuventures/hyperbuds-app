# Rizz Score Integration Guide
## HyperBuds User Profile Enhancement

---

## 📋 Implementation Overview

This document outlines how to integrate the Rizz Score API into the user profile page, making it readable, consistent, and following best practices.

### 🎯 **Goals**
- Fetch Rizz Score data from API
- Display comprehensive Rizz Score information in user profile
- Create reusable components for Rizz Score display
- Implement proper error handling and loading states
- Add interactive features for score analysis

---

## 🏗️ **Implementation Plan**

### **Phase 1: API Integration (Week 1)**
- Create Rizz Score service layer
- Implement data fetching with error handling
- Add loading states and caching

### **Phase 2: UI Components (Week 2)**
- Create Rizz Score display components
- Integrate with existing profile layout
- Add interactive features

### **Phase 3: Testing & Optimization (Week 3)**
- Unit tests for components
- Integration tests for API
- Performance optimization

---

## 🛠️ **Technical Implementation**

### **1. Rizz Score Service Layer**

```typescript
// src/services/rizzScore.service.ts
import { matchingApi } from '@/lib/api/matching.api';
import type { RizzScore } from '@/types/matching.types';

export class RizzScoreService {
  private static instance: RizzScoreService;
  private cache: Map<string, RizzScore> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): RizzScoreService {
    if (!RizzScoreService.instance) {
      RizzScoreService.instance = new RizzScoreService();
    }
    return RizzScoreService.instance;
  }

  async getRizzScore(userId?: string): Promise<RizzScore> {
    const cacheKey = userId || 'current-user';
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    try {
      const response = await matchingApi.getRizzScore();
      const rizzScore = response.rizzScore;
      
      this.cache.set(cacheKey, rizzScore);
      return rizzScore;
    } catch (error) {
      console.error('Failed to fetch Rizz Score:', error);
      throw new Error('Unable to load Rizz Score data');
    }
  }

  async recalculateRizzScore(): Promise<RizzScore> {
    try {
      const response = await matchingApi.recalculateRizzScore();
      const rizzScore = response.rizzScore;
      
      // Update cache
      this.cache.set('current-user', rizzScore);
      return rizzScore;
    } catch (error) {
      console.error('Failed to recalculate Rizz Score:', error);
      throw new Error('Unable to recalculate Rizz Score');
    }
  }

  private isCacheValid(rizzScore: RizzScore): boolean {
    const now = Date.now();
    const lastCalculated = new Date(rizzScore.lastCalculated).getTime();
    return (now - lastCalculated) < this.cacheTimeout;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const rizzScoreService = RizzScoreService.getInstance();
```

### **2. Custom Hook for Rizz Score**

```typescript
// src/hooks/useRizzScore.ts
import { useState, useEffect, useCallback } from 'react';
import { rizzScoreService } from '@/services/rizzScore.service';
import type { RizzScore } from '@/types/matching.types';

interface UseRizzScoreReturn {
  rizzScore: RizzScore | null;
  loading: boolean;
  error: string | null;
  recalculate: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useRizzScore = (userId?: string): UseRizzScoreReturn => {
  const [rizzScore, setRizzScore] = useState<RizzScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRizzScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const score = await rizzScoreService.getRizzScore(userId);
      setRizzScore(score);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Rizz Score');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const recalculate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const score = await rizzScoreService.recalculateRizzScore();
      setRizzScore(score);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recalculate Rizz Score');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    rizzScoreService.clearCache();
    await fetchRizzScore();
  }, [fetchRizzScore]);

  useEffect(() => {
    fetchRizzScore();
  }, [fetchRizzScore]);

  return {
    rizzScore,
    loading,
    error,
    recalculate,
    refetch
  };
};
```

### **3. Rizz Score Display Component**

```typescript
// src/components/profile/RizzScoreDisplay.tsx
import React, { useState } from 'react';
import { 
  Star, 
  TrendingUp, 
  Users, 
  Target, 
  Activity,
  RefreshCw,
  BarChart3,
  Zap,
  Eye,
  MessageCircle,
  Share2,
  Heart,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useRizzScore } from '@/hooks/useRizzScore';
import type { RizzScore } from '@/types/matching.types';

interface RizzScoreDisplayProps {
  userId?: string;
  showDetails?: boolean;
  className?: string;
}

export const RizzScoreDisplay: React.FC<RizzScoreDisplayProps> = ({
  userId,
  showDetails = true,
  className = ''
}) => {
  const { rizzScore, loading, error, recalculate, refetch } = useRizzScore(userId);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await recalculate();
    } finally {
      setIsRecalculating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'from-green-100 to-green-200 dark:from-green-500/20 dark:to-green-600/20';
    if (score >= 80) return 'from-blue-100 to-blue-200 dark:from-blue-500/20 dark:to-blue-600/20';
    if (score >= 70) return 'from-yellow-100 to-yellow-200 dark:from-yellow-500/20 dark:to-yellow-600/20';
    if (score >= 60) return 'from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20';
    return 'from-red-100 to-red-200 dark:from-red-500/20 dark:to-red-600/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Elite Creator';
    if (score >= 80) return 'Top Performer';
    if (score >= 70) return 'Rising Star';
    if (score >= 60) return 'Growing Creator';
    return 'Emerging Creator';
  };

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
            <div className="w-32 h-6 bg-gray-300 rounded dark:bg-gray-700"></div>
          </div>
          <div className="w-24 h-12 bg-gray-300 rounded-lg dark:bg-gray-700 mb-2"></div>
          <div className="w-48 h-4 bg-gray-300 rounded dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg dark:bg-red-500/20">
            <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Rizz Score
          </h3>
        </div>
        <div className="text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  if (!rizzScore) {
    return null;
  }

  return (
    <div className={`p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-br ${getScoreBgColor(rizzScore.currentScore)} rounded-lg`}>
            <Star size={24} className={getScoreColor(rizzScore.currentScore)} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Rizz Score
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(rizzScore.lastCalculated).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Recalculate Score"
          >
            <RefreshCw size={18} className={isRecalculating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBgColor(rizzScore.currentScore)} border-4 border-white shadow-xl dark:border-gray-800`}>
          <span className={`text-3xl font-bold ${getScoreColor(rizzScore.currentScore)}`}>
            {rizzScore.currentScore}
          </span>
        </div>
        <div className="mt-3">
          <div className={`text-lg font-semibold ${getScoreColor(rizzScore.currentScore)}`}>
            {getScoreLabel(rizzScore.currentScore)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {rizzScore.trending.isViral ? '🔥 Viral Content Detected' : 'Steady Growth'}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Score Breakdown
          </h4>
          
          {/* Engagement Factors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-red-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {rizzScore.factors.engagement.engagementRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Avg {rizzScore.factors.engagement.avgLikes.toLocaleString()} likes
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {rizzScore.factors.growth.followerGrowthRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {rizzScore.factors.growth.contentFrequency} posts/week
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Collaboration</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {rizzScore.factors.collaboration.successfulCollabs}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {rizzScore.factors.collaboration.completionRate.toFixed(1)}% completion rate
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl dark:bg-gray-700/40">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-purple-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {rizzScore.factors.quality.contentScore.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Content quality score
              </div>
            </div>
          </div>

          {/* Trending Status */}
          {rizzScore.trending.isViral && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 dark:from-orange-500/10 dark:to-red-500/10 dark:border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Viral Content Alert</span>
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Trending score: {rizzScore.trending.trendingScore}/100
              </div>
              {rizzScore.trending.viralContent.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">Viral content:</div>
                  <div className="flex flex-wrap gap-1">
                    {rizzScore.trending.viralContent.slice(0, 3).map((content, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-500/20 dark:text-orange-300">
                        {content}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Score History */}
          {rizzScore.scoreHistory && rizzScore.scoreHistory.length > 0 && (
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Recent Score History
              </h5>
              <div className="space-y-2">
                {rizzScore.scoreHistory.slice(0, 3).map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-gray-700/40">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getScoreColor(entry.score).replace('text-', 'bg-')}`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getScoreColor(entry.score)}`}>
                        {entry.score}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.calculationMethod}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RizzScoreDisplay;
```

### **4. Enhanced Profile Page Integration**

```typescript
// src/app/profile/page.jsx (Updated)
'use client'

import DashboardLayout from "@/components/layout/Dashboard/Dashboard";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/utils/api";
import UserProfileHeader from "@/components/profile/ProfileCard";
import RizzScoreDisplay from "@/components/profile/RizzScoreDisplay";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const data = await apiFetch("/api/v1/profiles/me");
        console.log("API Response:", data);
        
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProfile();
  }, []);

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="">
            <p className="text-red-400">Error loading profile: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <UserProfileHeader 
          userData={user} 
          isDark={true}
          isLoading={isLoading}
        />
        
        {/* Rizz Score Section */}
        <RizzScoreDisplay 
          userId={user?.profile?.userId}
          showDetails={true}
        />
      </div>
    </DashboardLayout>
  );
}
```

### **5. Enhanced ProfileCard with Rizz Score**

```typescript
// Update the ProfileCard.jsx to include Rizz Score in stats
// In the stats section, update the Rizz Score stat:

{
  label: "Rizz Score",
  value: user.rizzScore || "0",
  color: "purple",
  icon: Star,
  change: "+8%",
  // Add click handler to show detailed view
  onClick: () => {
    // Could open a modal or navigate to detailed view
    console.log('Show detailed Rizz Score');
  }
}
```

---

## 🧪 **Testing Implementation**

### **1. Unit Tests**

```typescript
// src/services/__tests__/rizzScore.service.test.ts
import { rizzScoreService } from '@/services/rizzScore.service';
import { matchingApi } from '@/lib/api/matching.api';

jest.mock('@/lib/api/matching.api');

describe('RizzScoreService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rizzScoreService.clearCache();
  });

  test('should fetch and cache Rizz Score', async () => {
    const mockRizzScore = {
      _id: '1',
      userId: 'user1',
      currentScore: 85,
      factors: {
        engagement: { engagementRate: 12.5, avgLikes: 1000 },
        growth: { followerGrowthRate: 15.2, contentFrequency: 5 },
        collaboration: { successfulCollabs: 10, completionRate: 95 },
        quality: { contentScore: 8.5, technicalQuality: 9, originality: 8 }
      },
      trending: { isViral: false, trendingScore: 45 },
      lastCalculated: new Date().toISOString(),
      calculationVersion: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    (matchingApi.getRizzScore as jest.Mock).mockResolvedValue({
      rizzScore: mockRizzScore
    });

    const result = await rizzScoreService.getRizzScore();
    
    expect(result).toEqual(mockRizzScore);
    expect(matchingApi.getRizzScore).toHaveBeenCalledTimes(1);
  });

  test('should use cache for subsequent calls', async () => {
    const mockRizzScore = {
      _id: '1',
      userId: 'user1',
      currentScore: 85,
      factors: {
        engagement: { engagementRate: 12.5, avgLikes: 1000 },
        growth: { followerGrowthRate: 15.2, contentFrequency: 5 },
        collaboration: { successfulCollabs: 10, completionRate: 95 },
        quality: { contentScore: 8.5, technicalQuality: 9, originality: 8 }
      },
      trending: { isViral: false, trendingScore: 45 },
      lastCalculated: new Date().toISOString(),
      calculationVersion: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    (matchingApi.getRizzScore as jest.Mock).mockResolvedValue({
      rizzScore: mockRizzScore
    });

    // First call
    await rizzScoreService.getRizzScore();
    
    // Second call should use cache
    await rizzScoreService.getRizzScore();
    
    expect(matchingApi.getRizzScore).toHaveBeenCalledTimes(1);
  });

  test('should handle API errors gracefully', async () => {
    (matchingApi.getRizzScore as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    await expect(rizzScoreService.getRizzScore()).rejects.toThrow(
      'Unable to load Rizz Score data'
    );
  });
});
```

### **2. Component Tests**

```typescript
// src/components/profile/__tests__/RizzScoreDisplay.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RizzScoreDisplay } from '@/components/profile/RizzScoreDisplay';
import { useRizzScore } from '@/hooks/useRizzScore';

jest.mock('@/hooks/useRizzScore');

describe('RizzScoreDisplay', () => {
  const mockRizzScore = {
    _id: '1',
    userId: 'user1',
    currentScore: 85,
    factors: {
      engagement: { engagementRate: 12.5, avgLikes: 1000 },
      growth: { followerGrowthRate: 15.2, contentFrequency: 5 },
      collaboration: { successfulCollabs: 10, completionRate: 95 },
      quality: { contentScore: 8.5, technicalQuality: 9, originality: 8 }
    },
    trending: { isViral: false, trendingScore: 45 },
    lastCalculated: new Date().toISOString(),
    calculationVersion: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    (useRizzScore as jest.Mock).mockReturnValue({
      rizzScore: mockRizzScore,
      loading: false,
      error: null,
      recalculate: jest.fn(),
      refetch: jest.fn()
    });
  });

  test('should render Rizz Score display correctly', () => {
    render(<RizzScoreDisplay />);
    
    expect(screen.getByText('Rizz Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Top Performer')).toBeInTheDocument();
  });

  test('should show loading state', () => {
    (useRizzScore as jest.Mock).mockReturnValue({
      rizzScore: null,
      loading: true,
      error: null,
      recalculate: jest.fn(),
      refetch: jest.fn()
    });

    render(<RizzScoreDisplay />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should show error state', () => {
    (useRizzScore as jest.Mock).mockReturnValue({
      rizzScore: null,
      loading: false,
      error: 'Failed to load',
      recalculate: jest.fn(),
      refetch: jest.fn()
    });

    render(<RizzScoreDisplay />);
    
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('should call recalculate when button is clicked', async () => {
    const mockRecalculate = jest.fn();
    (useRizzScore as jest.Mock).mockReturnValue({
      rizzScore: mockRizzScore,
      loading: false,
      error: null,
      recalculate: mockRecalculate,
      refetch: jest.fn()
    });

    render(<RizzScoreDisplay />);
    
    const recalculateButton = screen.getByTitle('Recalculate Score');
    fireEvent.click(recalculateButton);
    
    await waitFor(() => {
      expect(mockRecalculate).toHaveBeenCalled();
    });
  });
});
```

### **3. Integration Tests**

```typescript
// src/__tests__/integration/rizzScore.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import { ProfilePage } from '@/app/profile/page';
import { apiFetch } from '@/lib/utils/api';

jest.mock('@/lib/utils/api');
jest.mock('@/services/rizzScore.service');

describe('Rizz Score Integration', () => {
  test('should load profile with Rizz Score', async () => {
    const mockProfile = {
      profile: {
        userId: 'user1',
        username: 'testuser',
        displayName: 'Test User',
        rizzScore: 85
      }
    };

    const mockRizzScore = {
      _id: '1',
      userId: 'user1',
      currentScore: 85,
      factors: {
        engagement: { engagementRate: 12.5, avgLikes: 1000 },
        growth: { followerGrowthRate: 15.2, contentFrequency: 5 },
        collaboration: { successfulCollabs: 10, completionRate: 95 },
        quality: { contentScore: 8.5, technicalQuality: 9, originality: 8 }
      },
      trending: { isViral: false, trendingScore: 45 },
      lastCalculated: new Date().toISOString(),
      calculationVersion: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    (apiFetch as jest.Mock).mockResolvedValue(mockProfile);
    (rizzScoreService.getRizzScore as jest.Mock).mockResolvedValue(mockRizzScore);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Rizz Score')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 **Best Practices & Performance**

### **1. Caching Strategy**
- **Client-side caching**: 5-minute cache for Rizz Score data
- **Cache invalidation**: Clear cache on recalculate
- **Memory management**: Clear cache on component unmount

### **2. Error Handling**
- **Graceful degradation**: Show fallback UI on errors
- **Retry mechanisms**: Allow users to retry failed requests
- **Error boundaries**: Catch and handle component errors

### **3. Performance Optimization**
- **Lazy loading**: Load Rizz Score component only when needed
- **Memoization**: Use React.memo for expensive calculations
- **Debouncing**: Debounce recalculate requests

### **4. Accessibility**
- **ARIA labels**: Proper labeling for screen readers
- **Keyboard navigation**: Support keyboard interactions
- **Color contrast**: Ensure proper contrast ratios

---

## 📊 **Testing Checklist**

### **Manual Testing**
- [ ] Load profile page and verify Rizz Score displays
- [ ] Test recalculate functionality
- [ ] Test error states (network failure, API errors)
- [ ] Test loading states
- [ ] Test responsive design on mobile/tablet
- [ ] Test dark mode compatibility

### **Automated Testing**
- [ ] Unit tests for service layer
- [ ] Component tests for UI
- [ ] Integration tests for API
- [ ] E2E tests for user flows

### **Performance Testing**
- [ ] Measure API response times
- [ ] Test with slow network connections
- [ ] Verify caching effectiveness
- [ ] Test memory usage

---

## 🎯 **Implementation Timeline**

### **Week 1: Foundation**
- Day 1-2: Create service layer and hooks
- Day 3-4: Build RizzScoreDisplay component
- Day 5: Basic integration testing

### **Week 2: Enhancement**
- Day 1-2: Add detailed breakdown and interactive features
- Day 3-4: Integrate with profile page
- Day 5: Error handling and edge cases

### **Week 3: Testing & Polish**
- Day 1-2: Write comprehensive tests
- Day 3-4: Performance optimization
- Day 5: Documentation and deployment

---

This implementation provides a robust, scalable, and user-friendly way to integrate Rizz Score data into the user profile, following React and Next.js best practices while maintaining excellent performance and user experience.
