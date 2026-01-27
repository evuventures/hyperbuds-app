// src/lib/api/user.api.ts
import { BASE_URL } from "@/config/baseUrl";
import { getAccessToken } from "@/store/authSelectors";
import { apiClient } from "./client";

export interface UserSearchResult {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
}

export interface UserSearchResponse {
  users: UserSearchResult[];
  total?: number;
}

export async function getCurrentUser() {
  // Get token from localStorage only if running in browser
  const token = getAccessToken();

  if (!token) throw new Error("No access token found");

  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to fetch user profile";
      try {
        const errorData = await res.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        // ignore if no JSON response
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ getCurrentUser error:", message);
    throw new Error(message);
  }
}

/**
 * Search users by username or display name
 * Endpoint: GET /users/search?q={query}
 * Auth: Required (uses token from apiClient interceptor)
 */
export async function searchUsers(query: string): Promise<UserSearchResponse> {
  if (!query || query.trim() === '') {
    return { users: [], total: 0 };
  }

  try {
    // Clean query - remove @ symbol if present
    const cleanQuery = query.trim().replace(/^@/, '');

    const response = await apiClient.get<UserSearchResponse>('/users/search', {
      params: {
        q: cleanQuery,
        limit: 20, // Limit results to top 20 matches
      },
    });

    return response.data;
  } catch (error: unknown) {
    const errorResponse = handleSearchError(error);
    if (errorResponse) {
      return errorResponse;
    }

    console.error('Error searching users:', error);
    throw error instanceof Error ? error : new Error('Failed to search users');
  }
}

/**
 * Handle search API errors gracefully
 */
function handleSearchError(error: unknown): UserSearchResponse | null {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return null;
  }

  const axiosError = error as { response?: { status?: number } };
  const status = axiosError.response?.status;

  // If endpoint doesn't exist (404) or server error (500), return empty results
  if (status === 404 || status === 500) {
    console.warn('User search endpoint not available:', status);
    return { users: [], total: 0 };
  }

  // For other errors (400, 401, etc.), throw to let component handle
  if (status === 401) {
    throw new Error('Unauthorized - please log in again');
  }
  if (status === 400) {
    throw new Error('Invalid search query');
  }

  return null;
}
