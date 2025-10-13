export interface RecommendationCard {
   id: number;
   name: string;
   role: string;
   followers: string;
   overlap: string;
   synergy: string;
   img: string;
   location: string;
   responseTime: string;
   collaborationRate: string;
   rizzScore: number;
   verified: boolean;
   online: boolean;
   specialties: string[];
   recentWork: string;
   passedAt: string; // Key field showing when they were passed
}

export interface RecommendationsResponse {
   success: boolean;
   data: {
      recommendations: RecommendationCard[];
      total: number;
      hasMore: boolean;
      pagination: {
         limit: number;
         offset: number;
         totalPages: number;
         currentPage: number;
      };
   };
   error?: string;
   message?: string;
}

export interface GiveChanceResponse {
   success: boolean;
   data: {
      creatorId: number;
      message: string;
      timestamp: string;
   };
   error?: string;
   message?: string;
}

export interface PermanentlyPassResponse {
   success: boolean;
   data: {
      creatorId: number;
      message: string;
      timestamp: string;
   };
   error?: string;
   message?: string;
}

export interface ApiError {
   success: false;
   error: string;
   message: string;
}
