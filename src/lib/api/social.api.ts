import { BASE_URL } from '@/config/baseUrl';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';

export interface SocialConnectRequest {
  platform: SocialPlatform;
  url: string;
}

export interface SocialConnectResponse {
  success: boolean;
  message: string;
}

export const socialApi = {
  /**
   * Connect a social media account to user profile
   * POST /api/v1/social/connect
   * Requires authentication
   */
  connectSocial: async (
    platform: SocialPlatform,
    url: string
  ): Promise<SocialConnectResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      if (!platform || !url || url.trim() === '') {
        throw new Error('Platform and URL are required');
      }

      const response = await fetch(`${BASE_URL}/api/v1/social/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ platform, url }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 'Missing platform or URL'
          );
        }
        if (response.status === 500) {
          throw new Error('Could not connect social media account');
        }
        throw new Error(`Failed to connect social account: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error connecting social media:', error);
      throw error;
    }
  },
};

export default socialApi;


