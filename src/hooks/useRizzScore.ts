import { useState, useEffect, useCallback } from 'react';
import { rizzScoreService } from '@/services/rizzScore.service';
import type { RizzScore } from '@/types/matching.types';

interface UseRizzScoreReturn {
   rizzScore: RizzScore | null;
   loading: boolean;
   error: string | null;
   recalculate: () => Promise<void>;
   refetch: () => Promise<void>;
}

export const useRizzScore = (userId?: string): UseRizzScoreReturn => {
   const [rizzScore, setRizzScore] = useState<RizzScore | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchRizzScore = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         const score = await rizzScoreService.getRizzScore(userId);
         setRizzScore(score);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to load Rizz Score');
      } finally {
         setLoading(false);
      }
   }, [userId]);

   const recalculate = useCallback(async () => {
      try {
         setLoading(true);
         setError(null);
         // Don't clear existing score - keep it visible during recalculation
         const score = await rizzScoreService.recalculateRizzScore();
         setRizzScore(score);
      } catch (err) {
         // Set error but don't clear existing score
         const errorMessage = err instanceof Error ? err.message : 'Failed to recalculate Rizz Score';
         setError(errorMessage);
         console.error('Recalculate error:', err);
         // Keep existing rizzScore so content doesn't disappear
      } finally {
         setLoading(false);
      }
   }, []);

   const refetch = useCallback(async () => {
      rizzScoreService.clearCache();
      await fetchRizzScore();
   }, [fetchRizzScore]);

   useEffect(() => {
      fetchRizzScore();
   }, [fetchRizzScore]);

   return {
      rizzScore,
      loading,
      error,
      recalculate,
      refetch
   };
};
