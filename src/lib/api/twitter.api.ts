/**
 * Twitter (X) API Service - Complete Integration
 * Using Twitter241 API from RapidAPI
 * Full endpoint coverage for AI collaboration analytics
 */

import axios, { AxiosError } from 'axios';

const RAPIDAPI_HOST = 'twitter241.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY || '';

// Base request configuration
const createRequestConfig = (url: string, params?: Record<string, string | number | boolean>) => ({
  method: 'GET' as const,
  url: `https://${RAPIDAPI_HOST}${url}`,
  params: params || {},
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
});

// ==================== USER ENDPOINTS ====================

/**
 * Get User By Username
 */
export async function getTwitterUserByUsername(username: string) {
  try {
    const options = createRequestConfig('/user', { username });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Users By IDs
 */
export async function getTwitterUsersByIds(ids: string) {
  try {
    const options = createRequestConfig('/users', { ids });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Users By IDs V2
 */
export async function getTwitterUsersByIdsV2(ids: string) {
  try {
    const options = createRequestConfig('/users/v2', { ids });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Replies
 */
export async function getTwitterUserReplies(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/replies', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Replies V2
 */
export async function getTwitterUserRepliesV2(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/replies/v2', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Media
 */
export async function getTwitterUserMedia(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/media', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Tweets
 */
export async function getTwitterUserTweets(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/tweets', { username, limit });
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
export async function getTwitterUserFollowings(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/followings', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Following IDs
 */
export async function getTwitterUserFollowingIds(username: string) {
  try {
    const options = createRequestConfig('/user/following-ids', { username });
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
export async function getTwitterUserFollowers(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/followers', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Verified Followers
 */
export async function getTwitterUserVerifiedFollowers(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/verified-followers', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Followers IDs
 */
export async function getTwitterUserFollowerIds(username: string) {
  try {
    const options = createRequestConfig('/user/follower-ids', { username });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Highlights
 */
export async function getTwitterUserHighlights(username: string) {
  try {
    const options = createRequestConfig('/user/highlights', { username });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get User Likes (Deprecated but still available)
 */
export async function getTwitterUserLikes(username: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/user/likes', { username, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== POSTS (TWEETS) ENDPOINTS ====================

/**
 * Get Post Comments
 */
export async function getTwitterPostComments(tweetId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/post/comments', { tweet_id: tweetId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Post Comments V2
 */
export async function getTwitterPostCommentsV2(tweetId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/post/comments/v2', { tweet_id: tweetId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Post Quotes
 */
export async function getTwitterPostQuotes(tweetId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/post/quotes', { tweet_id: tweetId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Post Retweets
 */
export async function getTwitterPostRetweets(tweetId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/post/retweets', { tweet_id: tweetId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Tweet Details
 */
export async function getTwitterTweetDetails(tweetId: string) {
  try {
    const options = createRequestConfig('/tweet/details', { tweet_id: tweetId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Tweet Details V2
 */
export async function getTwitterTweetDetailsV2(tweetId: string) {
  try {
    const options = createRequestConfig('/tweet/details/v2', { tweet_id: tweetId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Tweets Details By IDs
 */
export async function getTwitterTweetsDetailsByIds(ids: string) {
  try {
    const options = createRequestConfig('/tweets/details', { ids });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Post Likes (Deprecated but still available)
 */
export async function getTwitterPostLikes(tweetId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/post/likes', { tweet_id: tweetId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== EXPLORE (SEARCH) ENDPOINTS ====================

/**
 * Search Twitter V2
 */
export async function searchTwitterV2(query: string, limit: number = 20, section?: string) {
  try {
    const params: Record<string, string | number> = { query, limit };
    if (section) params.section = section;

    const options = createRequestConfig('/search/v2', params);
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Search Twitter
 */
export async function searchTwitter(query: string, limit: number = 20, section?: string) {
  try {
    const params: Record<string, string | number> = { query, limit };
    if (section) params.section = section;

    const options = createRequestConfig('/search', params);
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Autocomplete Search
 */
export async function getTwitterAutocomplete(query: string) {
  try {
    const options = createRequestConfig('/autocomplete', { query });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== SPACES ENDPOINTS ====================

/**
 * Get Space Details
 */
export async function getTwitterSpaceDetails(spaceId: string) {
  try {
    const options = createRequestConfig('/space/details', { space_id: spaceId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== ORGANIZATION ENDPOINTS ====================

/**
 * Get Organization Affiliates
 */
export async function getTwitterOrganizationAffiliates(orgId: string) {
  try {
    const options = createRequestConfig('/organization/affiliates', { org_id: orgId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== LISTS ENDPOINTS ====================

/**
 * Search Lists
 */
export async function searchTwitterLists(query: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/lists/search', { query, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get List Details
 */
export async function getTwitterListDetails(listId: string) {
  try {
    const options = createRequestConfig('/list/details', { list_id: listId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get List Timeline
 */
export async function getTwitterListTimeline(listId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/list/timeline', { list_id: listId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get List Followers
 */
export async function getTwitterListFollowers(listId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/list/followers', { list_id: listId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get List Members
 */
export async function getTwitterListMembers(listId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/list/members', { list_id: listId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== COMMUNITY ENDPOINTS ====================

/**
 * Search Community
 */
export async function searchTwitterCommunity(query: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/community/search', { query, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community Topics
 */
export async function getTwitterCommunityTopics(communityId: string) {
  try {
    const options = createRequestConfig('/community/topics', { community_id: communityId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community Timeline
 */
export async function getTwitterCommunityTimeline(communityId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/community/timeline', { community_id: communityId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Fetch Popular Community
 */
export async function getTwitterPopularCommunities(limit: number = 20) {
  try {
    const options = createRequestConfig('/community/popular', { limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community Members
 */
export async function getTwitterCommunityMembers(communityId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/community/members', { community_id: communityId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community Moderators
 */
export async function getTwitterCommunityModerators(communityId: string) {
  try {
    const options = createRequestConfig('/community/moderators', { community_id: communityId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community Tweets
 */
export async function getTwitterCommunityTweets(communityId: string, limit: number = 20) {
  try {
    const options = createRequestConfig('/community/tweets', { community_id: communityId, limit });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community About
 */
export async function getTwitterCommunityAbout(communityId: string) {
  try {
    const options = createRequestConfig('/community/about', { community_id: communityId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Community Details
 */
export async function getTwitterCommunityDetails(communityId: string) {
  try {
    const options = createRequestConfig('/community/details', { community_id: communityId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== JOBS ENDPOINTS ====================

/**
 * Search Job Locations
 */
export async function searchTwitterJobLocations(query: string) {
  try {
    const options = createRequestConfig('/jobs/locations', { query });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Search Jobs
 */
export async function searchTwitterJobs(query: string, location?: string) {
  try {
    const params: Record<string, string> = { query };
    if (location) params.location = location;

    const options = createRequestConfig('/jobs/search', params);
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Job Details
 */
export async function getTwitterJobDetails(jobId: string) {
  try {
    const options = createRequestConfig('/jobs/details', { job_id: jobId });
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

// ==================== TRENDS ENDPOINTS ====================

/**
 * Get Available Trends Locations
 */
export async function getTwitterTrendsLocations() {
  try {
    const options = createRequestConfig('/trends/locations', {});
    const response = await axios.request(options);
    return { success: true, data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError.message };
  }
}

/**
 * Get Trends By Location
 */
export async function getTwitterTrendsByLocation(woeid: string) {
  try {
    const options = createRequestConfig('/trends/location', { woeid });
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
export async function getTwitterUserAnalytics(username: string) {
  try {
    // Fetch user info first
    const userInfoResult = await getTwitterUserByUsername(username);
    if (!userInfoResult.success || !userInfoResult.data) {
      return { success: false, error: 'Failed to fetch user info' };
    }

    // Fetch additional data in parallel
    const [
      tweetsResult,
      mediaResult,
      followersResult,
      highlightsResult
    ] = await Promise.allSettled([
      getTwitterUserTweets(username, 10),
      getTwitterUserMedia(username, 5),
      getTwitterUserFollowers(username, 5),
      getTwitterUserHighlights(username),
    ]);

    return {
      success: true,
      data: {
        userInfo: userInfoResult.data,
        recentTweets: tweetsResult.status === 'fulfilled' ? tweetsResult.value.data : null,
        mediaContent: mediaResult.status === 'fulfilled' ? mediaResult.value.data : null,
        topFollowers: followersResult.status === 'fulfilled' ? followersResult.value.data : null,
        highlights: highlightsResult.status === 'fulfilled' ? highlightsResult.value.data : null,
        analytics: {
          totalFollowers: userInfoResult.data.data?.public_metrics?.followers_count || 0,
          totalTweets: userInfoResult.data.data?.public_metrics?.tweet_count || 0,
          verified: userInfoResult.data.data?.verified || false,
          engagementRate: calculateEngagementRate(userInfoResult.data.data),
        },
      },
    };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

/**
 * Calculate engagement rate from user metrics
 */
function calculateEngagementRate(userData: { public_metrics?: { followers_count?: number; like_count?: number; tweet_count?: number } } | null | undefined): number {
  if (!userData?.public_metrics) return 0;

  const metrics = userData.public_metrics;
  const followers = metrics.followers_count || 0;

  if (followers === 0) return 0;

  const totalEngagement = (metrics.like_count || 0) + (metrics.tweet_count || 0) * 10;
  return (totalEngagement / followers) * 100;
}

// ==================== EXPORT ALL ====================

export const TwitterAPI = {
  // User Endpoints
  getUserByUsername: getTwitterUserByUsername,
  getUsersByIds: getTwitterUsersByIds,
  getUsersByIdsV2: getTwitterUsersByIdsV2,
  getUserReplies: getTwitterUserReplies,
  getUserRepliesV2: getTwitterUserRepliesV2,
  getUserMedia: getTwitterUserMedia,
  getUserTweets: getTwitterUserTweets,
  getUserFollowings: getTwitterUserFollowings,
  getUserFollowingIds: getTwitterUserFollowingIds,
  getUserFollowers: getTwitterUserFollowers,
  getUserVerifiedFollowers: getTwitterUserVerifiedFollowers,
  getUserFollowerIds: getTwitterUserFollowerIds,
  getUserHighlights: getTwitterUserHighlights,
  getUserLikes: getTwitterUserLikes,

  // Posts Endpoints
  getPostComments: getTwitterPostComments,
  getPostCommentsV2: getTwitterPostCommentsV2,
  getPostQuotes: getTwitterPostQuotes,
  getPostRetweets: getTwitterPostRetweets,
  getTweetDetails: getTwitterTweetDetails,
  getTweetDetailsV2: getTwitterTweetDetailsV2,
  getTweetsDetailsByIds: getTwitterTweetsDetailsByIds,
  getPostLikes: getTwitterPostLikes,

  // Explore (Search) Endpoints
  searchV2: searchTwitterV2,
  search: searchTwitter,
  autocomplete: getTwitterAutocomplete,

  // Spaces Endpoints
  getSpaceDetails: getTwitterSpaceDetails,

  // Organization Endpoints
  getOrganizationAffiliates: getTwitterOrganizationAffiliates,

  // Lists Endpoints
  searchLists: searchTwitterLists,
  getListDetails: getTwitterListDetails,
  getListTimeline: getTwitterListTimeline,
  getListFollowers: getTwitterListFollowers,
  getListMembers: getTwitterListMembers,

  // Community Endpoints
  searchCommunity: searchTwitterCommunity,
  getCommunityTopics: getTwitterCommunityTopics,
  getCommunityTimeline: getTwitterCommunityTimeline,
  getPopularCommunities: getTwitterPopularCommunities,
  getCommunityMembers: getTwitterCommunityMembers,
  getCommunityModerators: getTwitterCommunityModerators,
  getCommunityTweets: getTwitterCommunityTweets,
  getCommunityAbout: getTwitterCommunityAbout,
  getCommunityDetails: getTwitterCommunityDetails,

  // Jobs Endpoints
  searchJobLocations: searchTwitterJobLocations,
  searchJobs: searchTwitterJobs,
  getJobDetails: getTwitterJobDetails,

  // Trends Endpoints
  getTrendsLocations: getTwitterTrendsLocations,
  getTrendsByLocation: getTwitterTrendsByLocation,

  // Analytics
  getUserAnalytics: getTwitterUserAnalytics,
};
