// src/lib/api/matching.mock.ts
// Mock data generators for matching features (AI matching and collaborations)

import type { MatchSuggestion, CreatorProfile, PaginatedResponse } from '../../types/matching.types';

// Sample data for realistic mock profiles
const SAMPLE_USERNAMES = [
  'creative_maya', 'tech_alex', 'fashion_luna', 'gaming_max', 'foodie_sarah',
  'travel_james', 'fitness_mike', 'art_emma', 'music_david', 'comedy_lisa',
  'beauty_sophia', 'lifestyle_tom', 'photography_nina', 'business_chris', 'wellness_anna'
];

const SAMPLE_DISPLAY_NAMES = [
  'Maya Creative', 'Alex Tech', 'Luna Fashion', 'Max Gaming', 'Sarah Foodie',
  'James Travel', 'Mike Fitness', 'Emma Art', 'David Music', 'Lisa Comedy',
  'Sophia Beauty', 'Tom Lifestyle', 'Nina Photography', 'Chris Business', 'Anna Wellness'
];

const SAMPLE_NICHES = [
  ['Lifestyle', 'Fashion'], ['Tech', 'Gaming'], ['Food', 'Travel'],
  ['Fitness', 'Wellness'], ['Art', 'Photography'], ['Music', 'Entertainment'],
  ['Beauty', 'Skincare'], ['Business', 'Marketing'], ['Comedy', 'Entertainment'],
  ['Education', 'Tech'], ['DIY', 'Crafts'], ['Sports', 'Gaming']
];

const SAMPLE_LOCATIONS = [
  { city: 'New York', state: 'NY', country: 'USA' },
  { city: 'Los Angeles', state: 'CA', country: 'USA' },
  { city: 'London', country: 'UK' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Paris', country: 'France' }
];

const SAMPLE_BIOS = [
  'Content creator passionate about sharing my journey 🌟',
  'Helping others grow their online presence 📈',
  'Living life one adventure at a time ✈️',
  'Creating content that inspires and entertains 🎬',
  'Building a community of like-minded creators 💪',
  'Sharing tips, tricks, and daily life 🎯',
  'Turning passion into content 📸',
  'Building bridges through creativity 🌉'
];

/**
 * Generate a deterministic hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a mock creator profile
 */
function generateMockProfile(index: number, userId: string): CreatorProfile {
  const usernameIndex = index % SAMPLE_USERNAMES.length;
  const nicheIndex = index % SAMPLE_NICHES.length;
  const locationIndex = index % SAMPLE_LOCATIONS.length;
  const bioIndex = index % SAMPLE_BIOS.length;

  // Generate deterministic stats based on index
  const hash = hashString(userId);
  const totalFollowers = 5000 + ((hash % 950000) * 10); // 5K - 9.5M
  const avgEngagement = 2.0 + ((hash % 80) / 10); // 2.0% - 10.0%
  const rizzScore = 40 + (hash % 60); // 40 - 100

  // Platform breakdown
  const platforms = ['tiktok', 'instagram', 'youtube', 'twitter', 'twitch'];
  const platformBreakdown: Record<string, { followers: number; engagement: number }> = {};
  
  platforms.forEach((platform, idx) => {
    const platformHash = hashString(`${userId}-${platform}`);
    const followers = Math.floor(totalFollowers * (0.15 + (platformHash % 30) / 100));
    const engagement = avgEngagement + ((platformHash % 20) / 10 - 1);
    platformBreakdown[platform] = { followers, engagement: Math.max(1.0, Math.min(15.0, engagement)) };
  });

  return {
    userId,
    username: SAMPLE_USERNAMES[usernameIndex],
    displayName: SAMPLE_DISPLAY_NAMES[usernameIndex],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    bio: SAMPLE_BIOS[bioIndex],
    niche: SAMPLE_NICHES[nicheIndex],
    location: SAMPLE_LOCATIONS[locationIndex],
    stats: {
      totalFollowers,
      avgEngagement,
      platformBreakdown
    },
    socialLinks: {
      tiktok: `https://tiktok.com/@${SAMPLE_USERNAMES[usernameIndex]}`,
      instagram: `https://instagram.com/${SAMPLE_USERNAMES[usernameIndex]}`,
      youtube: `https://youtube.com/@${SAMPLE_USERNAMES[usernameIndex]}`
    },
    rizzScore,
    isPublic: true,
    isActive: true
  };
}

/**
 * Generate mock match suggestions
 */
export function generateMockMatchSuggestions(
  limit: number = 10,
  page: number = 1,
  status?: 'pending' | 'viewed' | 'liked' | 'passed' | 'mutual' | 'all'
): PaginatedResponse<MatchSuggestion> {
  const matches: MatchSuggestion[] = [];
  const startIndex = (page - 1) * limit;

  for (let i = 0; i < limit; i++) {
    const index = startIndex + i;
    const userId = `user_${index}_${Date.now()}`;
    const targetUserId = `target_${index}_${Date.now()}`;
    
    // Generate deterministic compatibility score
    const hash = hashString(targetUserId);
    const compatibilityScore = 65 + (hash % 35); // 65 - 100
    
    // Determine status
    let matchStatus: MatchSuggestion['status'] = 'pending';
    if (status && status !== 'all') {
      matchStatus = status;
    } else {
      // Mix of statuses for variety
      const statusHash = hash % 100;
      if (statusHash < 30) matchStatus = 'pending';
      else if (statusHash < 50) matchStatus = 'viewed';
      else if (statusHash < 70) matchStatus = 'liked';
      else if (statusHash < 85) matchStatus = 'passed';
      else matchStatus = 'mutual';
    }

    // Generate score breakdown
    const baseScore = compatibilityScore;
    const scoreBreakdown = {
      audienceOverlap: baseScore - 10 + (hash % 20),
      nicheCompatibility: baseScore - 5 + (hash % 15),
      engagementStyle: baseScore - 8 + (hash % 16),
      geolocation: baseScore - 15 + (hash % 20),
      activityTime: baseScore - 12 + (hash % 18),
      rizzScoreCompatibility: baseScore - 3 + (hash % 12)
    };

    // Normalize breakdown scores
    Object.keys(scoreBreakdown).forEach(key => {
      const typedKey = key as keyof typeof scoreBreakdown;
      scoreBreakdown[typedKey] = Math.max(0, Math.min(100, scoreBreakdown[typedKey]));
    });

    // Generate match type
    const matchTypes: MatchSuggestion['matchType'][] = ['ai-suggested', 'niche-based', 'proximity-based', 'manual-search'];
    const matchType = matchTypes[hash % matchTypes.length];

    const createdAt = new Date(Date.now() - (hash % 30) * 24 * 60 * 60 * 1000).toISOString();
    const updatedAt = matchStatus !== 'pending' 
      ? new Date(Date.now() - (hash % 7) * 24 * 60 * 60 * 1000).toISOString()
      : createdAt;

    const match: MatchSuggestion = {
      _id: `match_${index}_${Date.now()}`,
      userId: `current_user_${Date.now()}`,
      targetUserId,
      compatibilityScore,
      matchType,
      scoreBreakdown,
      status: matchStatus,
      viewedAt: matchStatus !== 'pending' ? updatedAt : undefined,
      actionTakenAt: (matchStatus === 'liked' || matchStatus === 'passed' || matchStatus === 'mutual') ? updatedAt : undefined,
      metadata: {
        algorithm: 'ai-v2-enhanced',
        confidence: 0.7 + (hash % 30) / 100,
        features: ['niche_match', 'audience_overlap', 'engagement_similarity']
      },
      targetProfile: generateMockProfile(index, targetUserId),
      createdAt,
      updatedAt
    };

    matches.push(match);
  }

  // Calculate pagination
  const total = limit; // Mock total count matches the limit
  const pages = Math.ceil(total / limit);

  return {
    matches,
    pagination: {
      page,
      limit,
      total,
      pages
    }
  };
}

/**
 * Generate mock match history (for collaborations)
 */
export function generateMockMatchHistory(
  limit: number = 50,
  page: number = 1,
  status?: 'pending' | 'viewed' | 'liked' | 'passed' | 'mutual' | 'all'
): PaginatedResponse<MatchSuggestion> {
  // For collaborations, we want more mutual matches
  if (status === 'mutual') {
    return generateMockMatchSuggestions(limit, page, 'mutual');
  }
  
  // For all history, include variety of statuses
  return generateMockMatchSuggestions(limit, page, status || 'all');
}

