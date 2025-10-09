// src/lib/api/profile.api.ts

import { apiClient } from './client';

export interface SocialSyncRequest {
  followers?: number;  // Backend expects "followers" field
  engagement?: number;
}

export interface SocialSyncResponse {
  success: boolean;
  message: string;
  profile: {
    stats: {
      platformBreakdown: {
        tiktok?: { followers: number; engagement: number };
        instagram?: { followers: number; engagement: number };
        youtube?: { followers: number; engagement: number };
        twitch?: { followers: number; engagement: number };
      };
      totalFollowers: number;
      avgEngagement: number;
    };
    [key: string]: unknown;
  };
}

export const profileApi = {
  /**
   * Sync TikTok follower data to database
   */
  syncTikTok: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    const response = await apiClient.post('/profiles/social-sync/tiktok', data);
    return response.data;
  },

  /**
   * Sync Twitch follower data to database
   */
  syncTwitch: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    const response = await apiClient.post('/profiles/social-sync/twitch', data);
    return response.data;
  },

  /**
   * Sync Twitter follower data to database
   */
  syncTwitter: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    const response = await apiClient.post('/profiles/social-sync/twitter', data);
    return response.data;
  },

  /**
   * Sync Instagram follower data to database
   */
  syncInstagram: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    const response = await apiClient.post('/profiles/social-sync/instagram', data);
    return response.data;
  },

  /**
   * Sync all platforms at once
   */
  syncAllPlatforms: async (platformData: Record<string, SocialSyncRequest>): Promise<{
    success: boolean;
    results: Record<string, SocialSyncResponse | { error: string }>;
  }> => {
    const results: Record<string, SocialSyncResponse | { error: string }> = {};

    const syncPromises = Object.entries(platformData).map(async ([platform, data]) => {
      try {
        let result;
        switch (platform) {
          case 'tiktok':
            result = await profileApi.syncTikTok(data);
            break;
          case 'twitch':
            result = await profileApi.syncTwitch(data);
            break;
          case 'twitter':
            result = await profileApi.syncTwitter(data);
            break;
          case 'instagram':
            result = await profileApi.syncInstagram(data);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
        results[platform] = result;
      } catch (error) {
        results[platform] = {
          error: error instanceof Error ? error.message : 'Sync failed'
        };
      }
    });

    await Promise.all(syncPromises);

    return {
      success: Object.values(results).some(r => 'success' in r && r.success),
      results,
    };
  },

  /**
   * Get current profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/profiles/me');
    return response.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (profileData: Record<string, unknown>) => {
    const response = await apiClient.put('/profiles/me', profileData);
    return response.data;
  },
};

export default profileApi;

