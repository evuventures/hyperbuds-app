/**
 * TikTok API Service - Comprehensive Integration
 * Using TikTok API23 from RapidAPI
 */

import axios, { AxiosError } from 'axios';

const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';

// Base request configuration (matching RapidAPI format)
const createRequestConfig = (url: string, params: Record<string, string | number>) => ({
   method: 'GET' as const,
   url: `https://${RAPIDAPI_HOST}${url}`,
   params,
   headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
   },
});

// ==================== USER ENDPOINTS ====================

/**
 * Get User Info
 */
export async function getTikTokUserInfo(uniqueId: string) {
   try {
      const options = createRequestConfig('/api/user/info', { uniqueId });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get User Info by ID
 */
export async function getTikTokUserInfoById(userId: string) {
   try {
      const options = createRequestConfig('/api/user/info', { user_id: userId });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get User Followers
 */
export async function getTikTokUserFollowers(userId: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/user/followers', {
         user_id: userId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get User Followings
 */
export async function getTikTokUserFollowings(userId: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/user/followings', {
         user_id: userId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get User Posts (Videos)
 */
export async function getTikTokUserPosts(userId: string, count: number = 20, cursor?: string) {
   try {
      const params: Record<string, string | number> = { user_id: userId, count };
      if (cursor) params.cursor = cursor;

      const options = createRequestConfig('/api/user/posts', params);
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get User Popular Posts
 */
export async function getTikTokUserPopularPosts(userId: string, count: number = 10) {
   try {
      const options = createRequestConfig('/api/user/posts/popular', {
         user_id: userId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get User Liked Posts
 */
export async function getTikTokUserLikedPosts(userId: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/user/posts/liked', {
         user_id: userId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== SEARCH ENDPOINTS ====================

/**
 * Search General (Top Results)
 */
export async function searchTikTokGeneral(query: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/search/general', {
         query,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Search Videos
 */
export async function searchTikTokVideos(query: string, count: number = 20, cursor?: string) {
   try {
      const params: Record<string, string | number> = { query, count };
      if (cursor) params.cursor = cursor;

      const options = createRequestConfig('/api/search/video', params);
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Search Accounts (Users)
 */
export async function searchTikTokAccounts(query: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/search/account', {
         query,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== POST (VIDEO) ENDPOINTS ====================

/**
 * Get Post Detail
 */
export async function getTikTokPostDetail(videoId: string) {
   try {
      const options = createRequestConfig('/api/post/info', { video_id: videoId });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Comments of Post
 */
export async function getTikTokPostComments(videoId: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/post/comments', {
         video_id: videoId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Related Posts
 */
export async function getTikTokRelatedPosts(videoId: string, count: number = 10) {
   try {
      const options = createRequestConfig('/api/post/related', {
         video_id: videoId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Trending Posts
 */
export async function getTikTokTrendingPosts(count: number = 20) {
   try {
      const options = createRequestConfig('/api/post/trending', { count });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== TRENDING / ADS ENDPOINTS ====================

/**
 * Get Trending Videos
 */
export async function getTikTokTrendingVideos(count: number = 20) {
   try {
      const options = createRequestConfig('/api/trending/video', { count });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Trending Creators
 */
export async function getTikTokTrendingCreators(count: number = 20) {
   try {
      const options = createRequestConfig('/api/trending/creator', { count });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Trending Hashtags
 */
export async function getTikTokTrendingHashtags(count: number = 20) {
   try {
      const options = createRequestConfig('/api/trending/hashtag', { count });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Trending Videos by Keyword
 */
export async function getTikTokTrendingVideosByKeyword(keyword: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/trending/video/keyword', {
         keyword,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== CHALLENGE (HASHTAG) ENDPOINTS ====================

/**
 * Get Challenge Info
 */
export async function getTikTokChallengeInfo(challengeId: string) {
   try {
      const options = createRequestConfig('/api/challenge/info', { challenge_id: challengeId });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Challenge Posts
 */
export async function getTikTokChallengePosts(challengeId: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/challenge/posts', {
         challenge_id: challengeId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== MUSIC ENDPOINTS ====================

/**
 * Get Music Info
 */
export async function getTikTokMusicInfo(musicId: string) {
   try {
      const options = createRequestConfig('/api/music/info', { music_id: musicId });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Music Posts
 */
export async function getTikTokMusicPosts(musicId: string, count: number = 20) {
   try {
      const options = createRequestConfig('/api/music/posts', {
         music_id: musicId,
         count
      });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== DOWNLOAD ENDPOINTS ====================

/**
 * Download Video (Get Download URL)
 */
export async function getTikTokVideoDownloadUrl(videoUrl: string) {
   try {
      const options = createRequestConfig('/api/download/video', { video_url: videoUrl });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Download Music (Get Download URL)
 */
export async function getTikTokMusicDownloadUrl(musicUrl: string) {
   try {
      const options = createRequestConfig('/api/download/music', { music_url: musicUrl });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== ANALYTICS & INSIGHTS ====================

/**
 * Get User Analytics for AI Collaboration
 * Combines multiple endpoints to create comprehensive user analytics
 */
export async function getTikTokUserAnalytics(uniqueId: string) {
   try {
      // Fetch user info first
      const userInfoResult = await getTikTokUserInfo(uniqueId);
      if (!userInfoResult.success || !userInfoResult.data) {
         return { success: false, error: 'Failed to fetch user info' };
      }

      const userId = userInfoResult.data.user?.id;
      if (!userId) {
         return { success: false, error: 'User ID not found' };
      }

      // Fetch additional data in parallel
      const [postsResult, popularPostsResult] = await Promise.allSettled([
         getTikTokUserPosts(userId, 10),
         getTikTokUserPopularPosts(userId, 5),
      ]);

      return {
         success: true,
         data: {
            userInfo: userInfoResult.data,
            recentPosts: postsResult.status === 'fulfilled' ? postsResult.value.data : null,
            popularPosts: popularPostsResult.status === 'fulfilled' ? popularPostsResult.value.data : null,
            analytics: {
               totalFollowers: userInfoResult.data.stats?.followerCount || 0,
               totalLikes: userInfoResult.data.stats?.heartCount || 0,
               totalVideos: userInfoResult.data.stats?.videoCount || 0,
               engagementRate: calculateEngagementRate(userInfoResult.data.stats),
            },
         },
      };
   } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
   }
}

/**
 * Calculate engagement rate from stats
 */
function calculateEngagementRate(stats: { followerCount?: number; heartCount?: number; videoCount?: number } | null | undefined): number {
   if (!stats || !stats.followerCount || stats.followerCount === 0) return 0;

   const totalEngagement = (stats.heartCount || 0) + (stats.videoCount || 0) * 100;
   return (totalEngagement / stats.followerCount) * 100;
}

// ==================== EXPORT ALL ====================

export const TikTokAPI = {
   // User
   getUserInfo: getTikTokUserInfo,
   getUserInfoById: getTikTokUserInfoById,
   getUserFollowers: getTikTokUserFollowers,
   getUserFollowings: getTikTokUserFollowings,
   getUserPosts: getTikTokUserPosts,
   getUserPopularPosts: getTikTokUserPopularPosts,
   getUserLikedPosts: getTikTokUserLikedPosts,

   // Search
   searchGeneral: searchTikTokGeneral,
   searchVideos: searchTikTokVideos,
   searchAccounts: searchTikTokAccounts,

   // Post
   getPostDetail: getTikTokPostDetail,
   getPostComments: getTikTokPostComments,
   getRelatedPosts: getTikTokRelatedPosts,
   getTrendingPosts: getTikTokTrendingPosts,

   // Trending
   getTrendingVideos: getTikTokTrendingVideos,
   getTrendingCreators: getTikTokTrendingCreators,
   getTrendingHashtags: getTikTokTrendingHashtags,
   getTrendingVideosByKeyword: getTikTokTrendingVideosByKeyword,

   // Challenge
   getChallengeInfo: getTikTokChallengeInfo,
   getChallengePosts: getTikTokChallengePosts,

   // Music
   getMusicInfo: getTikTokMusicInfo,
   getMusicPosts: getTikTokMusicPosts,

   // Download
   getVideoDownloadUrl: getTikTokVideoDownloadUrl,
   getMusicDownloadUrl: getTikTokMusicDownloadUrl,

   // Analytics
   getUserAnalytics: getTikTokUserAnalytics,
};

