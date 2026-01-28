import { BASE_URL } from '@/config/baseUrl';
import { getAccessToken } from '@/stores/auth.store';

export interface RizzScoreResponse {
  userId: string;
  username: string;
  displayName: string;
  rizzScore: {
    profileScore: number;
    matchingScore: number;
  };
  profileUrl: string;
  suggestions: Array<{
    userId: string;
    username: string;
    displayName: string;
    matchingScore: number;
    niche: string[];
    profileUrl: string;
  }>;
}

export const rizzApi = {
  /**
   * Get user's Rizz score (profile score, matching score, and suggestions)
   * GET /api/v1/matchmaker/rizz-score/:userId
   * 
   * Returns both profileScore and matchingScore together
   * Includes suggestions with > 50% similarity
   * Requires authentication
   */
  getRizzScore: async (userId: string): Promise<RizzScoreResponse> => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/rizz-score/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch Rizz score: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching Rizz score:', error);
      throw error;
    }
  },
};


