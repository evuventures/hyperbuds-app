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
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  syncTikTok: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.post('/profiles/social-sync/tiktok', data);
    // return response.data;
    
    // Return mock response until backend is ready
    return {
      success: false,
      message: 'Social media sync is temporarily disabled - backend not ready',
      profile: {
        stats: {
          platformBreakdown: {},
          totalFollowers: 0,
          avgEngagement: 0,
        },
      },
    };
  },

  /**
   * Sync Twitch follower data to database
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  syncTwitch: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.post('/profiles/social-sync/twitch', data);
    // return response.data;
    
    // Return mock response until backend is ready
    return {
      success: false,
      message: 'Social media sync is temporarily disabled - backend not ready',
      profile: {
        stats: {
          platformBreakdown: {},
          totalFollowers: 0,
          avgEngagement: 0,
        },
      },
    };
  },

  /**
   * Sync Twitter follower data to database
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  syncTwitter: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.post('/profiles/social-sync/twitter', data);
    // return response.data;
    
    // Return mock response until backend is ready
    return {
      success: false,
      message: 'Social media sync is temporarily disabled - backend not ready',
      profile: {
        stats: {
          platformBreakdown: {},
          totalFollowers: 0,
          avgEngagement: 0,
        },
      },
    };
  },

  /**
   * Sync Instagram follower data to database
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  syncInstagram: async (data: SocialSyncRequest): Promise<SocialSyncResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.post('/profiles/social-sync/instagram', data);
    // return response.data;
    
    // Return mock response until backend is ready
    return {
      success: false,
      message: 'Social media sync is temporarily disabled - backend not ready',
      profile: {
        stats: {
          platformBreakdown: {},
          totalFollowers: 0,
          avgEngagement: 0,
        },
      },
    };
  },

  /**
   * Sync all platforms at once
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  syncAllPlatforms: async (platformData: Record<string, SocialSyncRequest>): Promise<{
    success: boolean;
    results: Record<string, SocialSyncResponse | { error: string }>;
  }> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const results: Record<string, SocialSyncResponse | { error: string }> = {};
    // 
    // const syncPromises = Object.entries(platformData).map(async ([platform, data]) => {
    //   try {
    //     let result;
    //     switch (platform) {
    //       case 'tiktok':
    //         result = await profileApi.syncTikTok(data);
    //         break;
    //       case 'twitch':
    //         result = await profileApi.syncTwitch(data);
    //         break;
    //       case 'twitter':
    //         result = await profileApi.syncTwitter(data);
    //         break;
    //       case 'instagram':
    //         result = await profileApi.syncInstagram(data);
    //         break;
    //       default:
    //         throw new Error(`Unsupported platform: ${platform}`);
    //     }
    //     results[platform] = result;
    //   } catch (error) {
    //     results[platform] = {
    //       error: error instanceof Error ? error.message : 'Sync failed'
    //     };
    //   }
    // });
    // 
    // await Promise.all(syncPromises);
    // 
    // return {
    //   success: Object.values(results).some(r => 'success' in r && r.success),
    //   results,
    // };
    
    // Return mock response until backend is ready
    const results: Record<string, SocialSyncResponse | { error: string }> = {};
    Object.keys(platformData).forEach(platform => {
      results[platform] = {
        error: 'Social media sync is temporarily disabled - backend not ready'
      };
    });
    
    return {
      success: false,
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
   * Endpoint: GET /profile/:username
   */
  getProfileByUsername: async (username: string): Promise<ProfileByUsernameResponse> => {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }

    try {
      const response = await apiClient.get(`/profile/${encodeURIComponent(username.trim())}`);
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

