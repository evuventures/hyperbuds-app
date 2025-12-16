// src/lib/api/update.api.ts

import { apiClient } from './client';
import type { RizzScore } from '../../types/matching.types';

// Type definitions for update API endpoints
export interface CalculateProfileRizzScoreRequest {
  niches: string[];
}

export interface CalculateProfileRizzScoreResponse {
  profileRizzScore: number;
}

export interface CalculateMatchingRizzScoreRequest {
  userA: string;
  userB: string;
}

export interface CalculateMatchingRizzScoreResponse {
  matchingRizzScore: number;
}

export interface GetNichesResponse {
  niches: string[];
}

export interface UpdateNichesRequest {
  niches: string[];
}

export interface UpdateNichesResponse {
  message: string;
  niches: string[];
}

export interface ConnectSocialMediaRequest {
  platform: string;
  url: string;
}

export interface ConnectSocialMediaResponse {
  message: string;
}

/**
 * Update API Module
 * Handles all /api/v1/update/* endpoints
 */
export const updateApi = {
  /**
   * Get user's Rizz Score
   * GET /api/v1/update/rizz-score
   */
  getRizzScore: async (): Promise<{ rizzScore: RizzScore }> => {
    const response = await apiClient.get('/update/rizz-score');
    const data = response.data;
    
    // Handle case where backend returns just a number: { rizzScore: 37 }
    // Convert it to full RizzScore object structure
    if (typeof data.rizzScore === 'number') {
      const scoreValue = data.rizzScore;
      const now = new Date().toISOString();
      
      // Create a normalized RizzScore object with default values
      const normalizedRizzScore: RizzScore = {
        _id: '',
        userId: '',
        currentScore: scoreValue,
        factors: {
          engagement: {
            avgLikes: 0,
            avgComments: 0,
            avgShares: 0,
            avgViews: 0,
            engagementRate: 0,
          },
          growth: {
            followerGrowthRate: 0,
            contentFrequency: 0,
            consistencyScore: 0,
          },
          collaboration: {
            successfulCollabs: 0,
            avgPartnerRating: 0,
            responseRate: 0,
            completionRate: 0,
          },
          quality: {
            contentScore: 0,
            technicalQuality: 0,
            originality: 0,
          },
        },
        trending: {
          isViral: false,
          trendingScore: 0,
          viralContent: [],
        },
        lastCalculated: now,
        calculationVersion: '1.0',
        createdAt: now,
        updatedAt: now,
      };
      
      return { rizzScore: normalizedRizzScore };
    }
    
    // If it's already a full object, return as is
    return data;
  },

  /**
   * Calculate Profile Rizz Score
   * POST /api/v1/update/rizz/profile-score
   * Score = niches × 5
   */
  calculateProfileRizzScore: async (
    request: CalculateProfileRizzScoreRequest
  ): Promise<CalculateProfileRizzScoreResponse> => {
    const response = await apiClient.post('/update/rizz/profile-score', request);
    return response.data;
  },

  /**
   * Calculate Matching Rizz Score between two users
   * POST /api/v1/update/rizz/matching-score
   * Based on niche overlap + location
   */
  calculateMatchingRizzScore: async (
    request: CalculateMatchingRizzScoreRequest
  ): Promise<CalculateMatchingRizzScoreResponse> => {
    const response = await apiClient.post('/update/rizz/matching-score', request);
    return response.data;
  },

  /**
   * Get all available niches (100+)
   * GET /api/v1/update/niches
   */
  getNiches: async (): Promise<GetNichesResponse> => {
    const response = await apiClient.get('/update/niches');
    return response.data;
  },

  /**
   * Update user's selected niches
   * PUT /api/v1/update/niches
   */
  updateNiches: async (
    request: UpdateNichesRequest
  ): Promise<UpdateNichesResponse> => {
    const response = await apiClient.put('/update/niches', request);
    return response.data;
  },

  /**
   * Connect social media account
   * POST /api/v1/update/social/connect
   */
  connectSocialMedia: async (
    request: ConnectSocialMediaRequest
  ): Promise<ConnectSocialMediaResponse> => {
    const response = await apiClient.post('/update/social/connect', request);
    return response.data;
  },
};

export default updateApi;

