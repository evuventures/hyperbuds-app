// src/lib/api/recommendations.api.ts

import { apiClient } from './client';
import type { RecommendationsResponse, GiveChanceResponse, PermanentlyPassResponse } from '@/types/recommendation.types';

export const recommendationsApi = {
   // Get recommendations (creators user passed on)
   getRecommendations: async (params?: {
      limit?: number;
      offset?: number;
   }): Promise<RecommendationsResponse> => {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());

      const response = await apiClient.get(`/recommendations?${searchParams}`);
      return response.data;
   },

   // Give another chance to a creator (move to matches)
   giveAnotherChance: async (creatorId: number): Promise<GiveChanceResponse> => {
      const response = await apiClient.post(`/recommendations/${creatorId}/give-chance`);
      return response.data;
   },

   // Permanently pass on a creator (remove from recommendations)
   permanentlyPass: async (creatorId: number): Promise<PermanentlyPassResponse> => {
      const response = await apiClient.delete(`/recommendations/${creatorId}/permanently-pass`);
      return response.data;
   },
};

export default recommendationsApi;

