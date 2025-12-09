import { useState, useEffect } from 'react';
import { nicheApi } from '@/lib/api/niche.api';

export const useNiches = () => {
  const [niches, setNiches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await nicheApi.getNiches();
        setNiches(response.niches);
        // If we got niches (even from fallback), clear any previous errors
        if (response.niches && response.niches.length > 0) {
          setError(null);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch niches');
        setError(error);
        console.error('Error fetching niches:', error);
        // Fallback to empty array on error (shouldn't happen now with fallback list)
        setNiches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNiches();
  }, []);

  return { niches, isLoading, error };
};

