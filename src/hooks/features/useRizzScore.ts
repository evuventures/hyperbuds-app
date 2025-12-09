import { useState } from 'react';
import { rizzApi } from '@/lib/api/rizz.api';
import type { RizzScoreResponse } from '@/lib/api/rizz.api';

export const useRizzScore = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rizzScoreData, setRizzScoreData] = useState<RizzScoreResponse | null>(null);

  /**
   * Get user's Rizz score (includes profileScore, matchingScore, and suggestions)
   * GET /api/v1/matchmaker/rizz-score/:userId
   */
  const getRizzScore = async (userId: string): Promise<RizzScoreResponse> => {
    if (!userId || userId.trim() === '') {
      throw new Error('UserId is required');
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await rizzApi.getRizzScore(userId.trim());
      setRizzScoreData(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch Rizz score');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getRizzScore,
    rizzScoreData,
    isLoading,
    error,
  };
};
