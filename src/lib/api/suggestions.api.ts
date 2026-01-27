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
   * Get matchmaker suggestions for the current user (users with > 50% matching score)
   * GET /api/v1/matching/suggestions
   * 
   * Returns users with matchingScore > 50%
   * Includes sharedNiches array
   * Requires authentication (user identified from token)
   */
  getSuggestions: async (userId?: string): Promise<SuggestionsResponse> => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/v1/matching/suggestions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to extract error message from response body
        let errorMessage = `Failed to fetch suggestions (${response.status})`;
        
        try {
          const errorData = await response.json().catch(() => null);
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (response.statusText) {
            errorMessage = `${response.statusText} (${response.status})`;
          }
        } catch {
          // If JSON parsing fails, use status text or status code
          if (response.statusText) {
            errorMessage = `${response.statusText} (${response.status})`;
          }
        }

        // Provide specific error messages for common status codes
        if (response.status === 400) {
          throw new Error(errorMessage || 'User ID is missing or invalid');
        }
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to access suggestions.');
        }
        if (response.status === 404) {
          throw new Error('Suggestions endpoint not found.');
        }
        if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Transform API response to match expected format
      // API returns PaginatedResponse with 'matches' array
      // We need SuggestionsResponse with 'suggestions' array
      if (data.matches && Array.isArray(data.matches)) {
        return {
          userId: userId || '',
          suggestions: data.matches,
        };
      }
      
      // Fallback: if response already has 'suggestions' array, use it
      if (data.suggestions && Array.isArray(data.suggestions)) {
        return {
          userId: userId || data.userId || '',
          suggestions: data.suggestions,
        };
      }
      
      // If no matches found, return empty array
      return {
        userId: userId || '',
        suggestions: [],
      };
    } catch (error) {
      // Handle network errors and other fetch failures
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error fetching suggestions:', error);
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Re-throw if it's already an Error with a message
      if (error instanceof Error) {
        console.error('Error fetching suggestions:', error);
        throw error;
      }
      
      // Fallback for unknown errors
      console.error('Unknown error fetching suggestions:', error);
      throw new Error('An unexpected error occurred while fetching suggestions.');
    }
  },
};


