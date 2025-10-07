/**
 * Twitch API Service - Complete Integration
 * Using Twitch Scraper2 API from RapidAPI
 * Matching exact endpoint structure from RapidAPI documentation
 */

import axios, { AxiosError } from 'axios';

const RAPIDAPI_HOST = 'twitch-scraper2.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';

// Base request configuration matching RapidAPI format
const createRequestConfig = (url: string, params?: Record<string, string | number>) => ({
   method: 'GET' as const,
   url: `https://${RAPIDAPI_HOST}${url}`,
   params: params || {},
   headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
   },
});

// ==================== CHANNEL ENDPOINTS ====================

/**
 * Get Channel Info
 * Endpoint: /api/channels/info
 */
export async function getTwitchChannelInfo(channel: string) {
   try {
      const options = createRequestConfig('/api/channels/info', { channel });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Search Channels
 * Endpoint: /api/channels/search
 */
export async function searchTwitchChannels(query: string, limit: number = 20) {
   try {
      const options = createRequestConfig('/api/channels/search', { query, limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Channel Videos
 * Endpoint: /api/channels/videos
 */
export async function getTwitchChannelVideos(channel: string, limit: number = 20) {
   try {
      const options = createRequestConfig('/api/channels/videos', { channel, limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Channel Clips
 * Endpoint: /api/channels/clips
 * Example: /api/channels/clips?channel=ninja
 */
export async function getTwitchChannelClips(channel: string, limit: number = 20) {
   try {
      const options = createRequestConfig('/api/channels/clips', { channel, limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== STREAM ENDPOINTS ====================

/**
 * Get Stream Info (Live status)
 * Endpoint: /api/streams/info
 */
export async function getTwitchStreamInfo(channel: string) {
   try {
      const options = createRequestConfig('/api/streams/info', { channel });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Stream View Count
 * Endpoint: /api/streams/viewcount
 */
export async function getTwitchStreamViewCount(channel: string) {
   try {
      const options = createRequestConfig('/api/streams/viewcount', { channel });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Stream Tags
 * Endpoint: /api/streams/tags
 */
export async function getTwitchStreamTags(channel: string) {
   try {
      const options = createRequestConfig('/api/streams/tags', { channel });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== ADDITIONAL ENDPOINTS ====================

/**
 * Get Channel Followers (if available)
 */
export async function getTwitchChannelFollowers(channel: string, limit: number = 20) {
   try {
      const options = createRequestConfig('/api/channels/followers', { channel, limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Channel Schedule (if available)
 */
export async function getTwitchChannelSchedule(channel: string) {
   try {
      const options = createRequestConfig('/api/channels/schedule', { channel });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Top Live Streams (if available)
 */
export async function getTwitchTopLiveStreams(limit: number = 20) {
   try {
      const options = createRequestConfig('/api/streams/top', { limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Live Streams by Game (if available)
 */
export async function getTwitchLiveStreamsByGame(gameId: string, limit: number = 20) {
   try {
      const options = createRequestConfig('/api/streams/game', { game_id: gameId, limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Video Info (if available)
 */
export async function getTwitchVideoInfo(videoId: string) {
   try {
      const options = createRequestConfig('/api/videos/info', { video_id: videoId });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Clip Info (if available)
 */
export async function getTwitchClipInfo(clipSlug: string) {
   try {
      const options = createRequestConfig('/api/clips/info', { clip_slug: clipSlug });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Trending Clips (if available)
 */
export async function getTwitchTrendingClips(limit: number = 20) {
   try {
      const options = createRequestConfig('/api/clips/trending', { limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Search Games (if available)
 */
export async function searchTwitchGames(query: string, limit: number = 20) {
   try {
      const options = createRequestConfig('/api/games/search', { query, limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

/**
 * Get Top Games (if available)
 */
export async function getTwitchTopGames(limit: number = 20) {
   try {
      const options = createRequestConfig('/api/games/top', { limit });
      const response = await axios.request(options);
      return { success: true, data: response.data };
   } catch (error) {
      const axiosError = error as AxiosError;
      return { success: false, error: axiosError.message };
   }
}

// ==================== ANALYTICS & INSIGHTS ====================

/**
 * Get Channel Analytics for AI Collaboration
 * Combines multiple endpoints to create comprehensive channel analytics
 */
export async function getTwitchChannelAnalytics(channel: string) {
   try {
      // Fetch channel info first
      const channelInfoResult = await getTwitchChannelInfo(channel);
      if (!channelInfoResult.success || !channelInfoResult.data) {
         return { success: false, error: 'Failed to fetch channel info' };
      }

      // Fetch additional data in parallel
      const [
         videosResult,
         clipsResult,
         streamResult,
         viewCountResult,
         tagsResult,
      ] = await Promise.allSettled([
         getTwitchChannelVideos(channel, 5),
         getTwitchChannelClips(channel, 5),
         getTwitchStreamInfo(channel),
         getTwitchStreamViewCount(channel),
         getTwitchStreamTags(channel),
      ]);

      // Calculate analytics
      const channelData = channelInfoResult.data;
      const isLive = streamResult.status === 'fulfilled' &&
         streamResult.value.data?.type === 'live';
      const currentViewers = viewCountResult.status === 'fulfilled'
         ? viewCountResult.value.data?.viewers || 0
         : 0;

      return {
         success: true,
         data: {
            channelInfo: channelData,
            recentVideos: videosResult.status === 'fulfilled' ? videosResult.value.data : null,
            topClips: clipsResult.status === 'fulfilled' ? clipsResult.value.data : null,
            liveStatus: streamResult.status === 'fulfilled' ? streamResult.value.data : null,
            currentViewers: currentViewers,
            streamTags: tagsResult.status === 'fulfilled' ? tagsResult.value.data : null,
            analytics: {
               totalFollowers: channelData.followers || 0,
               totalViews: channelData.total_views || 0,
               isLive: isLive,
               currentViewers: currentViewers,
               broadcasterType: channelData.broadcaster_type || 'normal',
               partner: channelData.broadcaster_type === 'partner',
               affiliate: channelData.broadcaster_type === 'affiliate',
            },
         },
      };
   } catch (error) {
      const err = error as Error;
      return { success: false, error: err.message };
   }
}

// ==================== EXPORT ALL ====================

export const TwitchAPI = {
   // Channel Endpoints (Confirmed from API docs)
   getChannelInfo: getTwitchChannelInfo,
   searchChannels: searchTwitchChannels,
   getChannelVideos: getTwitchChannelVideos,
   getChannelClips: getTwitchChannelClips,

   // Stream Endpoints (Confirmed from API docs)
   getStreamInfo: getTwitchStreamInfo,
   getStreamViewCount: getTwitchStreamViewCount,
   getStreamTags: getTwitchStreamTags,

   // Additional Channel Features
   getChannelFollowers: getTwitchChannelFollowers,
   getChannelSchedule: getTwitchChannelSchedule,

   // Stream Features
   getTopLiveStreams: getTwitchTopLiveStreams,
   getLiveStreamsByGame: getTwitchLiveStreamsByGame,

   // Video Features
   getVideoInfo: getTwitchVideoInfo,

   // Clip Features
   getClipInfo: getTwitchClipInfo,
   getTrendingClips: getTwitchTrendingClips,

   // Game Features
   searchGames: searchTwitchGames,
   getTopGames: getTwitchTopGames,

   // Analytics
   getChannelAnalytics: getTwitchChannelAnalytics,
};
