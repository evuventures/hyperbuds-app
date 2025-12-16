// src/hooks/features/useNiches.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateApi } from '../../lib/api/update.api';
import { useToast } from '../ui/useToast';
import type { UpdateNichesRequest } from '../../types/matching.types';

// Query Keys
const NICHE_KEYS = {
  all: ['niches'] as const,
  list: () => [...NICHE_KEYS.all, 'list'] as const,
};

/**
 * Hook for fetching all available niches
 * GET /api/v1/update/niches
 */
export const useNiches = () => {
  return useQuery({
    queryKey: NICHE_KEYS.list(),
    queryFn: () => updateApi.getNiches(),
    staleTime: 10 * 60 * 1000, // 10 minutes - niches don't change often
    select: (data) => data.niches,
  });
};

/**
 * Hook for updating user's selected niches
 * PUT /api/v1/update/niches
 */
export const useUpdateNiches = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: UpdateNichesRequest) => updateApi.updateNiches(request),
    onSuccess: (data) => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: 'Niches Updated!',
        description: data.message || 'Your niches have been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Update Niches',
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
};

export default useNiches;

