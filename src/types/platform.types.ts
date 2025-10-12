// Platform API Types
export type PlatformType = 'tiktok' | 'twitter' | 'twitch';

export interface PlatformCredentials {
   tiktok?: string;
   twitter?: string;
   twitch?: string;
}

// TikTok API Types (based on TikTok API23)
export interface TikTokUserInfo {
   user: {
      id: string;
      uniqueId: string;
      nickname: string;
      avatarThumb: string;
      signature: string;
      verified: boolean;
      secUid: string;
      followerCount: number;
      followingCount: number;
      heartCount: number;
      videoCount: number;
      diggCount: number;
   };
   stats: {
      followerCount: number;
      followingCount: number;
      heart: number;
      heartCount: number;
      videoCount: number;
      diggCount: number;
   };
}

export interface TikTokVideo {
   id: string;
   desc: string;
   createTime: number;
   video: {
      duration: number;
      ratio: string;
      cover: string;
      downloadAddr: string;
   };
   author: {
      id: string;
      uniqueId: string;
      nickname: string;
   };
   stats: {
      diggCount: number;
      shareCount: number;
      commentCount: number;
      playCount: number;
   };
}

// Twitter API Types (based on Twitter241 API)
export interface TwitterUserInfo {
   data: {
      id: string;
      name: string;
      username: string;
      created_at: string;
      description: string;
      profile_image_url: string;
      verified: boolean;
      public_metrics: {
         followers_count: number;
         following_count: number;
         tweet_count: number;
         listed_count: number;
      };
   };
}

export interface TwitterTweet {
   id: string;
   text: string;
   created_at: string;
   author_id: string;
   public_metrics: {
      retweet_count: number;
      reply_count: number;
      like_count: number;
      quote_count: number;
   };
}

// Twitch API Types (based on Twitch Scraper2)
export interface TwitchChannelInfo {
   data: {
      id: string;
      login: string;
      display_name: string;
      description: string;
      profile_image_url: string;
      offline_image_url: string;
      view_count: number;
      created_at: string;
      broadcaster_type: string;
   };
   followers: number;
   total_views: number;
}

export interface TwitchStream {
   id: string;
   user_id: string;
   user_login: string;
   user_name: string;
   game_id: string;
   game_name: string;
   type: string;
   title: string;
   viewer_count: number;
   started_at: string;
   language: string;
   thumbnail_url: string;
}

// Unified Platform Data Interface
export interface UnifiedPlatformData {
   platform: PlatformType;
   username: string;
   displayName: string;
   profileImage: string;
   bio: string;
   verified: boolean;
   followers: number;
   following: number;
   totalContent: number;
   totalEngagement: number;
   averageEngagement: number;
   lastFetched: Date;
   raw?: unknown;
}

// API Response Types
export interface PlatformAPIResponse<T> {
   success: boolean;
   data?: T;
   error?: string;
   message?: string;
}

// Error Types
export interface PlatformAPIError {
   platform: PlatformType;
   error: string;
   type?: 'quota_error' | 'api_error' | 'network_error' | 'unknown';
   code?: string;
   details?: unknown;
}

// Collaboration Enhancement Types
export interface CollaborationPlatformData {
   userId: string;
   platforms: {
      tiktok?: UnifiedPlatformData;
      twitter?: UnifiedPlatformData;
      twitch?: UnifiedPlatformData;
   };
   combinedMetrics: {
      totalFollowers: number;
      totalEngagement: number;
      averageEngagementRate: number;
      platformCount: number;
   };
   lastUpdated: Date;
}

// Rate Limiting
export interface RateLimitInfo {
   platform: PlatformType;
   remaining: number;
   reset: Date;
   limit: number;
}

// Cache Types
export interface CachedPlatformData {
   data: UnifiedPlatformData;
   cachedAt: Date;
   expiresAt: Date;
}

