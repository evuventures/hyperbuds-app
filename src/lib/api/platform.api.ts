/**
 * Platform API Service
 * Integrates with RapidAPI for TikTok, Twitter, and Twitch data
 */

import axios, { AxiosError } from 'axios';
import type {
   TikTokUserInfo,
   TwitterUserInfo,
   TwitchChannelInfo,
   UnifiedPlatformData,
   PlatformAPIResponse,
   PlatformType,
} from '@/types/platform.types';

// RapidAPI Configuration
const RAPIDAPI_HOST = {
   tiktok: 'tiktok-api23.p.rapidapi.com',
   twitter: 'twitter241.p.rapidapi.com',
   twitch: 'twitch-scraper2.p.rapidapi.com',
};

// API Keys from environment
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
const platformCache = new Map<string, { data: unknown; timestamp: number }>();

/**
 * Get cached data if available and not expired
 */
function getCachedData<T>(key: string): T | null {
   const cached = platformCache.get(key);
   if (!cached) return null;

   const now = Date.now();
   if (now - cached.timestamp > CACHE_DURATION) {
      platformCache.delete(key);
      return null;
   }

   return cached.data as T;
}

/**
 * Set cache data
 */
function setCachedData(key: string, data: unknown): void {
   platformCache.set(key, {
      data,
      timestamp: Date.now(),
   });
}

/**
 * Fetch TikTok user information
 */
export async function fetchTikTokUserInfo(username: string): Promise<PlatformAPIResponse<TikTokUserInfo>> {
   try {
      const cacheKey = `tiktok:${username}`;
      const cached = getCachedData<TikTokUserInfo>(cacheKey);

      if (cached) {
         return { success: true, data: cached };
      }

      const options = {
         method: 'GET',
         url: `https://${RAPIDAPI_HOST.tiktok}/api/user/info`,
         params: { uniqueId: username },
         headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST.tiktok,
         },
      };

      const response = await axios.request<TikTokUserInfo>(options);

      if (response.data) {
         setCachedData(cacheKey, response.data);
         return { success: true, data: response.data };
      }

      return { success: false, error: 'No data returned from TikTok API' };
   } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { message?: string } | undefined;
      const errorMessage = errorData?.message || axiosError.message || 'Failed to fetch TikTok user info';
      
      // Check if it's a quota error
      const isQuotaError = errorMessage.toLowerCase().includes('quota') || 
                          errorMessage.toLowerCase().includes('exceeded') ||
                          axiosError.response?.status === 429;
      
      return {
         success: false,
         error: isQuotaError 
            ? `API quota exceeded: ${errorMessage}` 
            : errorMessage,
      };
   }
}

/**
 * Fetch Twitter user information
 */
export async function fetchTwitterUserInfo(username: string): Promise<PlatformAPIResponse<TwitterUserInfo>> {
   try {
      const cacheKey = `twitter:${username}`;
      const cached = getCachedData<TwitterUserInfo>(cacheKey);

      if (cached) {
         return { success: true, data: cached };
      }

      const options = {
         method: 'GET',
         url: `https://${RAPIDAPI_HOST.twitter}/user`,
         params: { username },
         headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST.twitter,
         },
      };

      const response = await axios.request<TwitterUserInfo>(options);

      if (response.data) {
         setCachedData(cacheKey, response.data);
         return { success: true, data: response.data };
      }

      return { success: false, error: 'No data returned from Twitter API' };
   } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { message?: string } | undefined;
      return {
         success: false,
         error: errorData?.message || axiosError.message || 'Failed to fetch Twitter user info',
      };
   }
}

/**
 * Fetch Twitch channel information
 */
export async function fetchTwitchChannelInfo(channelName: string): Promise<PlatformAPIResponse<TwitchChannelInfo>> {
   try {
      const cacheKey = `twitch:${channelName}`;
      const cached = getCachedData<TwitchChannelInfo>(cacheKey);

      if (cached) {
         return { success: true, data: cached };
      }

      const options = {
         method: 'GET',
         url: `https://${RAPIDAPI_HOST.twitch}/api/channels/info`,
         params: { channel: channelName },
         headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST.twitch,
         },
      };

      const response = await axios.request<TwitchChannelInfo>(options);

      if (response.data) {
         setCachedData(cacheKey, response.data);
         return { success: true, data: response.data };
      }

      return { success: false, error: 'No data returned from Twitch API' };
   } catch (error) {
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as { message?: string } | undefined;
      return {
         success: false,
         error: errorData?.message || axiosError.message || 'Failed to fetch Twitch channel info',
      };
   }
}

/**
 * Normalize platform data to unified format
 * Note: Uses 'any' type to handle dynamic API response structures
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function normalizePlatformData(
   platform: PlatformType,
   data: TikTokUserInfo | TwitterUserInfo | TwitchChannelInfo,
   username: string
): UnifiedPlatformData {
   switch (platform) {
      case 'tiktok': {
         const tiktokData = data as unknown as Record<string, any>;

         // Log raw response for debugging
         console.log('🔍 TikTok API Raw Response:', JSON.stringify(tiktokData, null, 2));

         // TikTok API structure: response contains userInfo object
         const userInfo = (tiktokData.userInfo || tiktokData) as Record<string, any>;
         const user = (userInfo.user || tiktokData.user || tiktokData) as Record<string, any>;
         
         // Use statsV2 for accurate large numbers (avoids integer overflow)
         const statsV2 = (userInfo.statsV2 || {}) as Record<string, any>;
         const stats = (userInfo.stats || tiktokData.stats || {}) as Record<string, any>;
         
         // Log extracted values for debugging
         console.log('📊 TikTok Data Extraction:', {
            hasUserInfo: !!tiktokData.userInfo,
            hasUser: !!user,
            statsV2: statsV2,
            stats: stats,
            user: user
         });
         
         // Parse followers and engagement (prefer statsV2 for accuracy)
         const followerCount = parseInt(String(statsV2.followerCount || stats.followerCount || user?.followerCount || '0'));
         const followingCount = parseInt(String(statsV2.followingCount || stats.followingCount || user?.followingCount || '0'));
         const videoCount = parseInt(String(statsV2.videoCount || stats.videoCount || user?.videoCount || '0'));
         const heartCount = parseInt(String(statsV2.heartCount || statsV2.heart || stats.heart || stats.heartCount || user?.heartCount || '0'));

         console.log('✅ TikTok Normalized Values:', {
            followers: followerCount,
            following: followingCount,
            videos: videoCount,
            hearts: heartCount
         });

         return {
            platform: 'tiktok',
            username: user?.uniqueId || username,
            displayName: user?.nickname || user?.uniqueId || username,
            profileImage: user?.avatarThumb || user?.avatarMedium || user?.avatarLarger || '',
            bio: user?.signature || '',
            verified: user?.verified || false,
            followers: followerCount,
            following: followingCount,
            totalContent: videoCount,
            totalEngagement: heartCount,
            averageEngagement: videoCount > 0 ? heartCount / videoCount : 0,
            lastFetched: new Date(),
            raw: tiktokData,
         };
      }

      case 'twitter': {
         const twitterData = data as unknown as Record<string, any>;

         // Twitter API structure: result.data.user.result contains the user data
         const userResult = (twitterData?.result?.data?.user?.result || twitterData) as Record<string, any>;
         const core = (userResult?.core || {}) as Record<string, any>;
         const legacy = (userResult?.legacy || {}) as Record<string, any>;
         const avatar = (userResult?.avatar || {}) as Record<string, any>;

         // Extract metrics from legacy object
         const followers = legacy.followers_count || legacy.followersCount || 0;
         const following = legacy.friends_count || legacy.friendsCount || 0;
         const tweets = legacy.statuses_count || legacy.statusesCount || 0;
         const likes = legacy.favourites_count || legacy.favoritesCount || 0;

         const totalEngagement = likes + (tweets * 10);

         return {
            platform: 'twitter',
            username: core.screen_name || legacy.screen_name || username,
            displayName: core.name || legacy.name || username,
            profileImage: avatar.image_url || legacy.profile_image_url_https || '',
            bio: legacy.description || '',
            verified: userResult?.is_blue_verified || legacy.verified || false,
            followers: followers,
            following: following,
            totalContent: tweets,
            totalEngagement: totalEngagement,
            averageEngagement: tweets > 0 ? totalEngagement / tweets : 0,
            lastFetched: new Date(),
            raw: twitterData,
         };
      }

      case 'twitch': {
         const twitchData = data as unknown as Record<string, any>;

         // Twitch API structure: data.user contains the channel data
         const user = (twitchData?.data?.user || twitchData?.user || twitchData) as Record<string, any>;
         const followers = (user?.followers || {}) as Record<string, any>;
         const roles = (user?.roles || {}) as Record<string, any>;

         return {
            platform: 'twitch',
            username: user?.login || username,
            displayName: user?.displayName || user?.display_name || username,
            profileImage: user?.profileImageURL || user?.profile_image_url || '',
            bio: user?.description || user?.bio || '',
            verified: roles.isPartner || roles.is_partner || false,
            followers: followers.totalCount || followers.total_count || 0,
            following: 0, // Twitch doesn't provide following count
            totalContent: 0, // Would need additional API call
            totalEngagement: user?.view_count || 0,
            averageEngagement: user?.view_count || 0,
            lastFetched: new Date(),
            raw: twitchData,
         };
      }

      default:
         throw new Error(`Unsupported platform: ${platform}`);
   }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Fetch and normalize platform data
 */
export async function fetchPlatformData(
   platform: PlatformType,
   username: string
): Promise<PlatformAPIResponse<UnifiedPlatformData>> {
   try {
      let response;

      switch (platform) {
         case 'tiktok':
            response = await fetchTikTokUserInfo(username);
            break;
         case 'twitter':
            response = await fetchTwitterUserInfo(username);
            break;
         case 'twitch':
            response = await fetchTwitchChannelInfo(username);
            break;
         default:
            return { success: false, error: `Unsupported platform: ${platform}` };
      }

      if (!response.success || !response.data) {
         return { success: false, error: response.error };
      }

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
export function clearPlatformCache(platform: PlatformType, username: string): void {
   const cacheKey = `${platform}:${username}`;
   platformCache.delete(cacheKey);
}

/**
 * Clear all platform caches
 */
export function clearAllPlatformCaches(): void {
   platformCache.clear();
}

