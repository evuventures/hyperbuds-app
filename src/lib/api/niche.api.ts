import { BASE_URL } from '@/config/baseUrl';

export interface NichesResponse {
  niches: string[];
}

/**
 * Fallback niche list (100+ niches) - Used when backend endpoints are not available
 * This matches the expected format from the backend API documentation
 */
const FALLBACK_NICHES = [
  "Lifestyle", "Tech", "Beauty", "Finance", "Vlogging", "Comedy", "Business",
  "Travel", "Fashion", "Food", "Music", "Gaming", "Fitness", "Education",
  "Photography", "Motivation", "Cars", "Sports", "Health", "Real Estate",
  "Parenting", "Art", "Dance", "Reviews", "DIY", "Spirituality", "Movies",
  "Marketing", "Crypto", "AI", "Productivity", "Cooking", "Career", "Luxury",
  "Environment", "Gardening", "Pets", "Mental Health", "Self Improvement",
  "Science", "Tech Reviews", "Startups", "Entrepreneurship", "Investing",
  "Writing", "Books", "Podcasts", "Languages", "Culture", "History",
  "Political Commentary", "Philosophy", "Minimalism", "Home Decor",
  "Fitness Challenges", "Yoga", "Meditation", "Nutrition", "Diet Plans",
  "Streetwear", "Sneakers", "Jewelry", "Interior Design", "Architecture",
  "Web Development", "Mobile Apps", "Software Tutorials", "Gadgets",
  "AR/VR", "Blockchain", "NFTs", "Stock Market", "Trading", "Economics",
  "Legal Advice", "Relationships", "Dating", "Marriage", "Parenting Tips",
  "Travel Vlogs", "Adventure Sports", "Hiking", "Camping", "Photography Tips",
  "Film Reviews", "TV Shows", "Streaming Recommendations", "Anime", "Comics",
  "Board Games", "Card Games", "Esports", "Motorsports", "Luxury Cars",
  "Watches", "Fashion Hacks", "Beauty Tutorials", "Skincare", "Haircare",
  "Makeup", "Mental Exercises", "Life Hacks", "Motivational Stories",
  "Social Media Tips", "SEO", "Content Creation", "Affiliate Marketing",
  "Dropshipping", "E-commerce", "Cooking Hacks", "Recipes", "Baking",
  "Smoothies", "Veganism", "Sustainable Living", "Charity", "Non-profits"
];

export interface UpdateNichesRequest {
  userId: string;
  niches: string[];
}

export interface UpdateNichesResponse {
  message: string;
  niches: string[];
}

export const nicheApi = {
  /**
   * Fetch all available niches from backend (100+ AI-generated niches)
   * Tries multiple endpoints as fallback:
   * 1. GET /api/v1/matchmaker/niches (preferred)
   * 2. GET /api/v1/niches (fallback)
   * 
   * Note: Niches are returned capitalized (e.g., "Gaming", "Tech Reviews")
   */
  getNiches: async (): Promise<NichesResponse> => {
    const endpoints = [
      `${BASE_URL}/api/v1/matchmaker/niches`,
      `${BASE_URL}/api/v1/niches`,
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Successfully fetched niches from: ${endpoint}`);
          return data;
        }

        // If 404, try next endpoint
        if (response.status === 404) {
          console.warn(`⚠️ Endpoint not found: ${endpoint}, trying fallback...`);
          lastError = new Error(`Endpoint not found: ${endpoint}`);
          continue;
        }

        // For other errors, throw immediately
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch niches: ${response.statusText} (${response.status})`
        );
      } catch (error) {
        // If it's a network error or non-404, throw immediately
        if (error instanceof TypeError || (error instanceof Error && !error.message.includes('not found'))) {
          console.error(`❌ Error fetching niches from ${endpoint}:`, error);
          throw error;
        }
        lastError = error as Error;
      }
    }

    // If all endpoints failed, use fallback list
    console.warn('⚠️ All niche endpoints failed, using fallback list');
    console.warn('💡 Backend endpoints not implemented yet. Using hardcoded niche list.');
    console.warn('📝 Contact backend team to implement: GET /api/v1/matchmaker/niches');
    
    return {
      niches: FALLBACK_NICHES,
    };
  },

  /**
   * Update user's selected niches
   * POST /api/v1/matchmaker/niches/update
   * 
   * Note: This is separate from /api/v1/profiles/me endpoint
   * Niches should be capitalized (e.g., "Gaming", "Tech Reviews")
   * Requires authentication
   */
  updateNiches: async (
    userId: string,
    niches: string[]
  ): Promise<UpdateNichesResponse> => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${BASE_URL}/api/v1/matchmaker/niches/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          niches,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update niches: ${response.statusText}`;
        const error = new Error(errorMessage);
        // Add status code to error for easier detection
        (error as any).status = response.status;
        (error as any).statusCode = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      console.error('Error updating niches:', error);
      throw error;
    }
  },
};

