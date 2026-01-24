import { BASE_URL } from '@/config/baseUrl';
import { getAccessToken } from '@/store/authSelectors';

export interface MatchSuggestion {
  userId: string;
  username: string;
  matchingScore: number;
  sharedNiches: string[];
}

export interface SuggestionsResponse {
  userId: string;
  suggestions: MatchSuggestion[];
}

export const suggestionsApi = {
  /**
   * Get matchmaker suggestions for a user (users with > 50% matching score)
   * GET /api/v1/matchmaker/suggestions/:userId
   * 
   * Returns users with matchingScore > 50%
   * Includes sharedNiches array
   * Requires authentication
   */
  getSuggestions: async (userId: string): Promise<SuggestionsResponse> => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/suggestions/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('User ID is missing or invalid');
        }
        if (response.status === 500) {
          throw new Error('Failed to fetch suggestions from server');
        }
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },
};


