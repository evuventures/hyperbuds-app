// src/lib/api/profile.api.ts

import { apiClient } from './client';

export interface SocialSyncRequest {
  usernameOrId: string;
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

export interface ProfileByUsernameResponse {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  niche?: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  socialLinks?: Record<string, string>;
  profileRizzScore?: number;
  [key: string]: unknown;
}

export const profileApi = {
  /**
   * Sync TikTok follower data to database
   */
  syncTikTok: async (
    data: SocialSyncRequest
  ): Promise<SocialSyncResponse> => {
    const response = await apiClient.post("/profiles/social-sync/tiktok", data);
    return response.data;
  },

  /**
   * Sync Twitch follower data to database
   */
  syncTwitch: async (
    data: SocialSyncRequest
  ): Promise<SocialSyncResponse> => {
    const response = await apiClient.post("/profiles/social-sync/twitch", data);
    return response.data;
  },

  /**
   * Sync Twitter follower data to database
   */
  syncTwitter: async (
    data: SocialSyncRequest
  ): Promise<SocialSyncResponse> => {
    const response = await apiClient.post("/profiles/social-sync/twitter", data);
    return response.data;
  },

  /**
   * Sync Instagram follower data to database
   */
  syncInstagram: async (
    data: SocialSyncRequest
  ): Promise<SocialSyncResponse> => {
    const response = await apiClient.post("/profiles/social-sync/instagram", data);
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
          case "tiktok":
            result = await profileApi.syncTikTok(data);
            break;
          case "twitch":
            result = await profileApi.syncTwitch(data);
            break;
          case "twitter":
            result = await profileApi.syncTwitter(data);
            break;
          case "instagram":
            result = await profileApi.syncInstagram(data);
            break;
          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }
        results[platform] = result;
      } catch (error) {
        results[platform] = {
          error: error instanceof Error ? error.message : "Sync failed",
        };
      }
    });

    await Promise.all(syncPromises);

    return {
      success: Object.values(results).some(
        (result) => "success" in result && result.success
      ),
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

  /**
   * Update avatar URL in backend
   */
  updateAvatar: async (avatarUrl: string) => {
    const response = await apiClient.put('/profiles/me', { avatar: avatarUrl });
    return response.data;
  },

  /**
   * Get profile by username (public profile)
   * Endpoint: GET /api/v1/update/profile/@:username
   * Auth: Not required (public access)
   */
  getProfileByUsername: async (username: string): Promise<ProfileByUsernameResponse> => {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }

    try {
      // Decode username just in case it's still URL encoded (e.g. %40 for @)
      const decodedUsername = decodeURIComponent(username.trim());
      console.log('Fetching profile for:', { original: username, decoded: decodedUsername });

      const cleanUsername = decodedUsername.startsWith('@')
        ? decodedUsername.slice(1)
        : decodedUsername;

      // Endpoint expects: /update/profile/@username
      const response = await apiClient.get(`/update/profile/@${encodeURIComponent(cleanUsername)}`);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 400) {
          throw new Error('Username is missing or invalid');
        }
        if (axiosError.response?.status === 404) {
          throw new Error('Profile not found');
        }
        if (axiosError.response?.status === 500) {
          throw new Error('Server error while fetching profile');
        }
      }
      console.error('Error fetching profile by username:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch profile');
    }
  },
};

export default profileApi;
