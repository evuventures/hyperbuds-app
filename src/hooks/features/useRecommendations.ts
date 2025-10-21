import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi } from '@/lib/api/recommendations.api';
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

   // Fetch recommendations from backend API directly
   const {
      data: recommendationsData,
      isLoading: isLoadingRecommendations,
      error: recommendationsError,
      refetch: refetchRecommendations,
   } = useQuery<RecommendationsResponse>({
      queryKey: ['recommendations', { limit, offset }],
      queryFn: async () => {
         try {
            const response = await recommendationsApi.getRecommendations({ limit, offset });
            return response;
         } catch (error: unknown) {
            // If backend doesn't have endpoint yet, return empty data
            console.warn('Recommendations API not available yet:', error);
            return {
               success: true,
               data: {
                  recommendations: [],
                  total: 0,
                  hasMore: false,
                  pagination: {
                     limit,
                     offset,
                     totalPages: 0,
                     currentPage: 1,
                  }
               }
            };
         }
      },
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduced retries since backend might not be ready
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
   });

   // Give another chance mutation
   const likeRecommendationMutation = useMutation<GiveChanceResponse, Error, number>({
      mutationFn: async (creatorId: number) => {
         return await recommendationsApi.giveAnotherChance(creatorId);
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
         return await recommendationsApi.permanentlyPass(creatorId);
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
      refetch: refetchRecommendations,
   };
};