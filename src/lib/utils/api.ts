// utils/api.ts
import { BASE_URL } from '@/config/baseUrl';
import { getAccessToken as getStoreAccessToken, useAuthStore } from '@/stores/auth.store';

/**
 * Get access token from Zustand store
 * Note: Tokens now last 3 days - no refresh needed
 */
async function getAccessToken() {
  return getStoreAccessToken();
}

/**
 * Clear authentication and redirect to login
 */
function clearAuthAndRedirect() {
  useAuthStore.getState().clearAuth();
  
  // Only redirect if we're in the browser and not already on auth pages
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/auth/')) {
      window.location.href = '/auth/signin';
    }
  }
}

/**
 * API fetch with automatic token handling
 * Note: Tokens last 3 days - no refresh logic needed
 * On 401, token is cleared and user is redirected to login
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  // If no token, return early
  if (!token) {
    clearAuthAndRedirect();
    throw new Error('No access token available');
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  // If token expired or invalid → clear token and redirect to login
  // No refresh attempt since tokens now last 3 days
  if (res.status === 401) {
    clearAuthAndRedirect();
    throw new Error('Unauthorized - please log in again');
  }

  return res.json();
}
