/**
 * Platform API Service
 * Integrates with Backend API (SocialData.Tools) for TikTok, Instagram, YouTube, Twitter, and Twitch data
 */

// TEMPORARILY COMMENTED OUT - Backend not ready yet
// import axios, { AxiosError } from 'axios';
import type {
   UnifiedPlatformData,
   PlatformAPIResponse,
   PlatformType,
} from '@/types/platform.types';
// TEMPORARILY COMMENTED OUT - Backend not ready yet
// import { BASE_URL } from '@/config/baseUrl';

// Backend API Configuration
// TEMPORARILY COMMENTED OUT - Backend not ready yet
// const BACKEND_API_URL = `${BASE_URL}/api/v1/social/fetch`;

// Cache duration (5 minutes)
// TEMPORARILY COMMENTED OUT - Backend not ready yet
// const CACHE_DURATION = 5 * 60 * 1000;
// const platformCache = new Map<string, { data: unknown; timestamp: number }>();

// Backend API Response Interface
interface BackendSocialResponse {
   success: boolean;
   data?: {
      followers: number;
      engagement: number;
   };
   error?: string;
   message?: string;
}

/**
 * Get cached data if available and not expired
 * TEMPORARILY COMMENTED OUT - Backend not ready yet
 */
// function getCachedData<T>(key: string): T | null {
//    const cached = platformCache.get(key);
//    if (!cached) return null;
//
//    const now = Date.now();
//    if (now - cached.timestamp > CACHE_DURATION) {
//       platformCache.delete(key);
//       return null;
//    }
//
//    return cached.data as T;
// }

/**
 * Set cache data
 * TEMPORARILY COMMENTED OUT - Backend not ready yet
 */
// function setCachedData<T>(key: string, data: T): void {
//    platformCache.set(key, {
//       data,
//       timestamp: Date.now(),
//    });
// }

/**
 * Fetch social media data from backend API (SocialData.Tools)
 * This is a unified function that works for all supported platforms
 * 
 * TEMPORARILY COMMENTED OUT - Backend not ready yet
 * TODO: Uncomment when backend is working
 */
async function fetchSocialDataFromBackend(
   platform: PlatformType,
   username: string,
   _authToken?: string
): Promise<PlatformAPIResponse<BackendSocialResponse['data']>> {
   // TEMPORARILY DISABLED - Backend not ready
   // TODO: Uncomment when backend is working
   console.log(`📡 Social media API call disabled for ${platform}/${username} - backend not ready`);
   
   return {
      success: false,
      error: 'Social media API is temporarily disabled - backend not ready',
   };
   
   // try {
   //    const cacheKey = `${platform}:${username}`;
   //    const cached = getCachedData<BackendSocialResponse['data']>(cacheKey);
   // 
   //    if (cached) {
   //       return { success: true, data: cached };
   //    }
   // 
   //    // Map platform names (backend uses 'twitter' but we might need 'x' for some cases)
   //    const backendPlatform = platform === 'twitter' ? 'twitter' : platform;
   // 
   //    // Validate platform is supported by backend
   //    const supportedPlatforms = ['tiktok', 'instagram', 'youtube', 'twitter', 'twitch'];
   //    if (!supportedPlatforms.includes(backendPlatform)) {
   //       return {
   //          success: false,
   //          error: `Platform ${platform} is not supported by the backend API. Supported platforms: ${supportedPlatforms.join(', ')}`,
   //       };
   //    }
   // 
   //    // Get authentication token if not provided (for client-side calls)
   //    let token = authToken;
   //    if (!token && typeof window !== 'undefined') {
   //       token = localStorage.getItem('accessToken') || undefined;
   //    }
   // 
   //    const headers: Record<string, string> = {
   //       'Content-Type': 'application/json',
   //    };
   // 
   //    // Add authentication if token is available
   //    if (token) {
   //       headers['Authorization'] = `Bearer ${token}`;
   //    }
   // 
   //    console.log(`📡 Calling backend API: ${BACKEND_API_URL}`);
   //    console.log(`📤 Request payload:`, { platform: backendPlatform, username: username.trim() });
   //    console.log(`📤 Request headers:`, { ...headers, Authorization: token ? 'Bearer ***' : 'None' });
   // 
   //    const response = await axios.post<BackendSocialResponse>(
   //       BACKEND_API_URL,
   //       {
   //          platform: backendPlatform,
   //          username: username.trim(),
   //       },
   //       {
   //          headers,
   //       }
   //    );
   // 
   //    console.log(`📥 Backend API response:`, {
   //       status: response.status,
   //       success: response.data.success,
   //       hasData: !!response.data.data,
   //       error: response.data.error,
   //       message: response.data.message,
   //       fullResponse: response.data
   //    });
   // 
   //    if (response.data.success && response.data.data) {
   //       setCachedData(cacheKey, response.data.data);
   //       return { success: true, data: response.data.data };
   //    }
   // 
   //    const errorMessage = response.data.error || response.data.message || 'Failed to fetch social media data';
   //    console.error(`❌ Backend API error for ${platform}/${username}:`, errorMessage);
   //    return { success: false, error: errorMessage };
   // } catch (error) {
   //    const axiosError = error as AxiosError;
   //    console.error(`❌ Backend API request failed for ${platform}/${username}:`, {
   //       status: axiosError.response?.status,
   //       statusText: axiosError.response?.statusText,
   //       data: axiosError.response?.data,
   //       message: axiosError.message,
   //       url: BACKEND_API_URL
   //    });
   // 
   //    const errorData = axiosError.response?.data as BackendSocialResponse | { error?: string; message?: string } | undefined;
   //    const errorMessage = errorData?.error || errorData?.message || axiosError.message || 'Failed to fetch social media data';
   // 
   //    // Check if it's a rate limit error
   //    const isRateLimit = axiosError.response?.status === 429 ||
   //       errorMessage.toLowerCase().includes('rate limit') ||
   //       errorMessage.toLowerCase().includes('quota') ||
   //       errorMessage.toLowerCase().includes('exceeded');
   // 
   //    // Check if it's a network/connection error
   //    if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
   //       return {
   //          success: false,
   //          error: `Cannot connect to backend API. Please check if the backend server is running.`,
   //       };
   //    }
   // 
   //    // Check if it's a 404 (route not found on backend)
   //    if (axiosError.response?.status === 404) {
   //       // Log detailed info for debugging, but return user-friendly message
   //       console.warn(`⚠️ Backend API endpoint not found (404): ${BACKEND_API_URL}`);
   //       console.warn(`   This is expected until the backend endpoint is deployed.`);
   //       console.warn(`   See: docs/platform-integration/BACKEND-REQUIREMENTS.md`);
   //       return {
   //          success: false,
   //          error: `Backend API endpoint not found: ${BACKEND_API_URL}. Please verify the endpoint URL.`,
   //       };
   //    }
   // 
   //    return {
   //       success: false,
   //       error: isRateLimit
   //          ? `Rate limit exceeded: ${errorMessage}. Please try again later.`
   //          : errorMessage,
   //    };
   // }
}

/**
 * Normalize backend API response to unified format
 * Backend returns: { followers: number, engagement: number }
 * We convert this to UnifiedPlatformData format
 */
export function normalizePlatformData(
   platform: PlatformType,
   backendData: BackendSocialResponse['data'],
   username: string
): UnifiedPlatformData {
   if (!backendData) {
      throw new Error('No data provided for normalization');
   }

   const followers = backendData.followers || 0;
   const engagement = backendData.engagement || 0;

   // Calculate estimated metrics based on engagement rate
   // Engagement rate is typically a percentage, so we use it to estimate total engagement
   const estimatedTotalEngagement = Math.round(followers * (engagement / 100));

   // Platform-specific display names
   const getDisplayName = (platform: PlatformType, username: string): string => {
      // Capitalize first letter and remove special characters for display
      return username.charAt(0).toUpperCase() + username.slice(1).replace(/[^a-zA-Z0-9]/g, '');
   };

   return {
      platform,
      username: username,
      displayName: getDisplayName(platform, username),
      profileImage: '', // Backend doesn't provide profile images
      bio: '', // Backend doesn't provide bio
      verified: false, // Backend doesn't provide verification status
      followers: followers,
      following: 0, // Backend doesn't provide following count
      totalContent: 0, // Backend doesn't provide content count
      totalEngagement: estimatedTotalEngagement,
      averageEngagement: engagement, // Use engagement rate directly
      lastFetched: new Date(),
      raw: backendData, // Store raw backend data
   };
}

/**
 * Fetch and normalize platform data from backend API
 * Supports: tiktok, instagram, youtube, twitter, twitch
 */
export async function fetchPlatformData(
   platform: PlatformType,
   username: string,
   authToken?: string
): Promise<PlatformAPIResponse<UnifiedPlatformData>> {
   try {
      // Check if platform is supported by backend
      const supportedPlatforms = ['tiktok', 'instagram', 'youtube', 'twitter', 'twitch'];

      if (!supportedPlatforms.includes(platform)) {
         return {
            success: false,
            error: `Platform ${platform} is not supported. Supported platforms: ${supportedPlatforms.join(', ')}`,
         };
      }

      // Fetch data from backend (auth token is optional)
      const response = await fetchSocialDataFromBackend(platform, username, authToken);

      if (!response.success || !response.data) {
         return { success: false, error: response.error || 'Failed to fetch platform data' };
      }

      // Normalize the backend response to UnifiedPlatformData format
      const normalizedData = normalizePlatformData(platform, response.data, username);

      return { success: true, data: normalizedData };
   } catch (error) {
      const err = error as Error;
      return {
         success: false,
         error: err.message || 'Failed to fetch platform data',
      };
   }
}

/**
 * Fetch data for multiple platforms
 */
export async function fetchMultiplePlatformData(
   platforms: Array<{ type: PlatformType; username: string }>
): Promise<Record<PlatformType, UnifiedPlatformData | null>> {
   const results = await Promise.allSettled(
      platforms.map(({ type, username }) => fetchPlatformData(type, username))
   );

   const platformData: Record<string, UnifiedPlatformData | null> = {};

   results.forEach((result, index) => {
      const platform = platforms[index].type;

      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
         platformData[platform] = result.value.data;
      } else {
         platformData[platform] = null;
      }
   });

   return platformData as Record<PlatformType, UnifiedPlatformData | null>;
}

/**
 * Calculate combined metrics from multiple platforms
 */
export function calculateCombinedMetrics(
   platforms: Record<string, UnifiedPlatformData | null>
) {
   const validPlatforms = Object.values(platforms).filter(
      (p): p is UnifiedPlatformData => p !== null
   );

   if (validPlatforms.length === 0) {
      return {
         totalFollowers: 0,
         totalEngagement: 0,
         averageEngagementRate: 0,
         platformCount: 0,
      };
   }

   const totalFollowers = validPlatforms.reduce((sum, p) => sum + p.followers, 0);
   const totalEngagement = validPlatforms.reduce((sum, p) => sum + p.totalEngagement, 0);
   const averageEngagementRate = validPlatforms.reduce((sum, p) => sum + p.averageEngagement, 0) / validPlatforms.length;

   return {
      totalFollowers,
      totalEngagement,
      averageEngagementRate,
      platformCount: validPlatforms.length,
   };
}

/**
 * Clear cache for a specific platform and username
 */
// TEMPORARILY COMMENTED OUT - Backend not ready yet
export function clearPlatformCache(_platform: PlatformType, _username: string): void {
   // TEMPORARILY DISABLED - Backend not ready
   // const cacheKey = `${platform}:${username}`;
   // platformCache.delete(cacheKey);
}

/**
 * Clear all platform caches
 * TEMPORARILY COMMENTED OUT - Backend not ready yet
 */
export function clearAllPlatformCaches(): void {
   // TEMPORARILY DISABLED - Backend not ready
   // platformCache.clear();
}

