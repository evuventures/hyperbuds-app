import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
   RecommendationsResponse,
   GiveChanceResponse,
   PermanentlyPassResponse
} from '@/types/recommendation.types';

interface UseRecommendationsOptions {
   enabled?: boolean;
   limit?: number;
   offset?: number;
}

export const useRecommendations = (options: UseRecommendationsOptions = {}) => {
   const { enabled = true, limit = 10, offset = 0 } = options;
   const queryClient = useQueryClient();

   // Fetch recommendations from API
   const {
      data: recommendationsData,
      isLoading: isLoadingRecommendations,
      error: recommendationsError,
      refetch: refetchRecommendations,
   } = useQuery<RecommendationsResponse>({
      queryKey: ['recommendations', { limit, offset }],
      queryFn: async () => {
         const response = await fetch(`/api/recommendations?limit=${limit}&offset=${offset}`);

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch recommendations');
         }

         const data = await response.json();
         return data;
      },
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
   });

   // Give another chance mutation
   const likeRecommendationMutation = useMutation<GiveChanceResponse, Error, number>({
      mutationFn: async (creatorId: number) => {
         const response = await fetch('/api/recommendations/give-chance', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creatorId }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to give creator another chance');
         }

         return response.json();
      },
      onSuccess: (data) => {
         // Invalidate and refetch recommendations
         queryClient.invalidateQueries({ queryKey: ['recommendations'] });

         // Also invalidate matches to show the liked creator in matches
         queryClient.invalidateQueries({ queryKey: ['matches'] });

         console.log(`✅ ${data.data.message}`);
      },
      onError: (error) => {
         console.error('❌ Failed to give another chance:', error.message);
      },
   });

   // Permanently pass mutation
   const removeRecommendationMutation = useMutation<PermanentlyPassResponse, Error, number>({
      mutationFn: async (creatorId: number) => {
         const response = await fetch('/api/recommendations/permanently-pass', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creatorId }),
         });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to permanently pass creator');
         }

         return response.json();
      },
      onSuccess: (data) => {
         // Invalidate and refetch recommendations
         queryClient.invalidateQueries({ queryKey: ['recommendations'] });

         console.log(`✅ ${data.data.message}`);
      },
      onError: (error) => {
         console.error('❌ Failed to permanently pass:', error.message);
      },
   });

   // Get fresh matches (navigate to matching page)
   const getFreshMatches = useCallback(() => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });

      // Navigate to matching page
      window.location.href = '/matching';
   }, [queryClient]);

   return {
      // Data
      recommendations: recommendationsData?.data?.recommendations || [],
      total: recommendationsData?.data?.total || 0,
      hasMore: recommendationsData?.data?.hasMore || false,

      // Loading states
      isLoading: isLoadingRecommendations,
      isLiking: likeRecommendationMutation.isPending,
      isRemoving: removeRecommendationMutation.isPending,

      // Errors
      error: recommendationsError,

      // Actions
      giveAnotherChance: likeRecommendationMutation.mutate,
      permanentlyPass: removeRecommendationMutation.mutate,
      getFreshMatches,
      refetch: refetchRecommendations,
   };
};