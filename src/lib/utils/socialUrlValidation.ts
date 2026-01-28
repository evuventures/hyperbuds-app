/**
 * Social URL Validation Utilities
 * 
 * Validates and formats social media URLs for various platforms
 */

export interface PlatformRules {
  domains: string[];
  pathPattern: RegExp;
}

export const platformRules: Record<string, PlatformRules> = {
  tiktok: {
    domains: ['tiktok.com', 'www.tiktok.com'],
    pathPattern: /^\/@?[a-zA-Z0-9._-]+$/,
  },
  instagram: {
    domains: ['instagram.com', 'www.instagram.com'],
    pathPattern: /^\/[a-zA-Z0-9._-]+$/,
  },
  youtube: {
    domains: ['youtube.com', 'www.youtube.com', 'youtu.be', 'www.youtu.be'],
    pathPattern: /^\/@?[a-zA-Z0-9._-]+$|^\/c\/[a-zA-Z0-9._-]+$|^\/channel\/[a-zA-Z0-9._-]+$|^\/watch\?v=[a-zA-Z0-9_-]+$/,
  },
  twitch: {
    domains: ['twitch.tv', 'www.twitch.tv'],
    pathPattern: /^\/[a-zA-Z0-9._-]+$/,
  },
  twitter: {
    domains: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
    pathPattern: /^\/[a-zA-Z0-9._-]+$/,
  },
  facebook: {
    domains: ['facebook.com', 'www.facebook.com', 'fb.com', 'www.fb.com'],
    pathPattern: /^\/[a-zA-Z0-9._-]+$/,
  },
  snapchat: {
    domains: ['snapchat.com', 'www.snapchat.com'],
    pathPattern: /^\/add\/[a-zA-Z0-9._-]+$/,
  },
  discord: {
    domains: ['discord.gg', 'www.discord.gg', 'discord.com'],
    pathPattern: /^\/[a-zA-Z0-9_-]+$|^\/invite\/[a-zA-Z0-9_-]+$/,
  },
  telegram: {
    domains: ['t.me', 'telegram.me', 'www.telegram.me'],
    pathPattern: /^\/[a-zA-Z0-9._-]+$/,
  },
  reddit: {
    domains: ['reddit.com', 'www.reddit.com'],
    pathPattern: /^\/u\/[a-zA-Z0-9._-]+$|^\/user\/[a-zA-Z0-9._-]+$/,
  },
  pinterest: {
    domains: ['pinterest.com', 'www.pinterest.com'],
    pathPattern: /^\/[a-zA-Z0-9._-]+$/,
  },
};

/**
 * Validates a social media URL format for a given platform
 */
export const isValidSocialUrl = (url: string, platform: string): boolean => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    const rules = platformRules[platform.toLowerCase()];
    if (!rules) return false;

    // Check domain
    const isValidDomain = rules.domains.some(validDomain =>
      domain === validDomain || domain.endsWith('.' + validDomain)
    );

    // Check path pattern
    const isValidPath = rules.pathPattern.test(pathname);

    return isValidDomain && isValidPath;
  } catch {
    return false;
  }
};

/**
 * Extracts username from a social media URL
 */
export const extractUsernameFromUrl = (url: string, platform: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    switch (platform.toLowerCase()) {
      case 'tiktok':
        const tiktokMatch = pathname.match(/\/@?([^/?]+)/);
        return tiktokMatch ? tiktokMatch[1] : null;
      
      case 'twitter':
      case 'x':
        const twitterMatch = pathname.match(/\/([^/?]+)/);
        return twitterMatch ? twitterMatch[1] : null;
      
      case 'twitch':
        const twitchMatch = pathname.match(/\/([^/?]+)/);
        return twitchMatch ? twitchMatch[1] : null;
      
      case 'instagram':
        const instagramMatch = pathname.match(/\/([^/?]+)/);
        return instagramMatch ? instagramMatch[1] : null;
      
      case 'youtube':
        const youtubeMatch = pathname.match(/(?:youtube\.com\/@|youtube\.com\/c\/)([^/?]+)/) ||
                           pathname.match(/youtube\.com\/user\/([^/?]+)/) ||
                           pathname.match(/\/([^/?]+)/);
        return youtubeMatch ? youtubeMatch[1] : null;
      
      default:
        const defaultMatch = pathname.match(/\/([^/?]+)/);
        return defaultMatch ? defaultMatch[1] : null;
    }
  } catch {
    return null;
  }
};
