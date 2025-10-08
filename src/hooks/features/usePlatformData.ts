/**
 * Custom Hook for fetching and managing platform data
 */

import { useState, useEffect, useCallback } from 'react';
import type { PlatformType, UnifiedPlatformData, PlatformAPIError } from '@/types/platform.types';

interface UsePlatformDataOptions {
   enabled?: boolean;
   refetchInterval?: number;
}

interface UsePlatformDataResult {
   data: UnifiedPlatformData | null;
   loading: boolean;
   error: PlatformAPIError | null;
   refetch: () => Promise<void>;
}

/**
 * Hook to fetch single platform data
 */
export function usePlatformData(
   platform: PlatformType | null,
   username: string | null,
   options: UsePlatformDataOptions = {}
): UsePlatformDataResult {
   const { enabled = true, refetchInterval } = options;

   const [data, setData] = useState<UnifiedPlatformData | null>(null);
   const [loading, setLoading] = useState<boolean>(false);
   const [error, setError] = useState<PlatformAPIError | null>(null);

   const fetchData = useCallback(async () => {
      if (!platform || !username || !enabled) {
         console.log('⏭️ Skipping fetch:', { platform, username, enabled });
         return;
      }

      console.log(`🚀 Fetching ${platform} data for @${username}`);
      setLoading(true);
      setError(null);

      try {
         const url = `/api/platform/${platform}?username=${encodeURIComponent(username)}`;
         console.log(`📡 API URL: ${url}`);

         const response = await fetch(url);
         const result = await response.json();

         console.log(`📥 Response for ${platform}:`, {
            status: response.status,
            ok: response.ok,
            result
         });

         if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to fetch platform data');
         }

         console.log(`✅ Successfully fetched ${platform} data:`, result.data);
         setData(result.data);
      } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Unknown error';
         console.error(`❌ Error fetching ${platform} data:`, errorMessage);
         setError({
            platform,
            error: errorMessage,
         });
         setData(null);
      } finally {
         setLoading(false);
      }
   }, [platform, username, enabled]);

   useEffect(() => {
      fetchData();

      // Set up interval if specified
      if (refetchInterval && refetchInterval > 0) {
         const intervalId = setInterval(fetchData, refetchInterval);
         return () => clearInterval(intervalId);
      }
   }, [fetchData, refetchInterval]);

   return {
      data,
      loading,
      error,
      refetch: fetchData,
   };
}

/**
 * Hook to fetch multiple platform data
 */
export function useMultiplePlatformData(
   platforms: Array<{ type: PlatformType; username: string }>,
   options: UsePlatformDataOptions = {}
): {
   data: Record<PlatformType, UnifiedPlatformData | null>;
   loading: boolean;
   errors: PlatformAPIError[];
   refetch: () => Promise<void>;
} {
   const { enabled = true } = options;

   const [data, setData] = useState<Record<string, UnifiedPlatformData | null>>({});
   const [loading, setLoading] = useState<boolean>(false);
   const [errors, setErrors] = useState<PlatformAPIError[]>([]);

   const fetchData = useCallback(async () => {
      if (!enabled || platforms.length === 0) {
         console.log('⏭️ Skipping multiple fetch - enabled:', enabled, 'platforms:', platforms.length);
         return;
      }

      console.log('🚀 Fetching multiple platforms:', platforms);
      setLoading(true);
      setErrors([]);

      const results: Record<string, UnifiedPlatformData | null> = {};
      const fetchErrors: PlatformAPIError[] = [];

      // Fetch all platforms in parallel
      await Promise.all(
         platforms.map(async ({ type, username }) => {
            try {
               const url = `/api/platform/${type}?username=${encodeURIComponent(username)}`;
               console.log(`📡 Fetching ${type}: ${url}`);

               const response = await fetch(url);
               const result = await response.json();

               console.log(`📥 ${type} response:`, {
                  status: response.status,
                  ok: response.ok,
                  success: result.success,
                  hasData: !!result.data
               });

               if (!response.ok || !result.success) {
                  throw new Error(result.error || 'Failed to fetch platform data');
               }

               results[type] = result.data;
               console.log(`✅ ${type} data stored successfully`);
            } catch (err) {
               const errorMessage = err instanceof Error ? err.message : 'Unknown error';
               console.error(`❌ ${type} error:`, errorMessage);
               fetchErrors.push({
                  platform: type,
                  error: errorMessage,
               });
               results[type] = null;
            }
         })
      );

      console.log('📊 Final multiple platform results:', {
         results,
         errors: fetchErrors,
         successCount: Object.values(results).filter(v => v !== null).length
      });

      setData(results);
      setErrors(fetchErrors);
      setLoading(false);
   }, [platforms, enabled]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   return {
      data: data as Record<PlatformType, UnifiedPlatformData | null>,
      loading,
      errors,
      refetch: fetchData,
   };
}

/**
 * Hook to calculate combined metrics from multiple platforms
 */
export function useCombinedPlatformMetrics(
   platforms: Record<string, UnifiedPlatformData | null>
) {
   const [metrics, setMetrics] = useState({
      totalFollowers: 0,
      totalEngagement: 0,
      averageEngagementRate: 0,
      platformCount: 0,
   });

   useEffect(() => {
      const validPlatforms = Object.values(platforms).filter(
         (p): p is UnifiedPlatformData => p !== null
      );

      if (validPlatforms.length === 0) {
         setMetrics({
            totalFollowers: 0,
            totalEngagement: 0,
            averageEngagementRate: 0,
            platformCount: 0,
         });
         return;
      }

      const totalFollowers = validPlatforms.reduce((sum, p) => sum + p.followers, 0);
      const totalEngagement = validPlatforms.reduce((sum, p) => sum + p.totalEngagement, 0);
      const averageEngagementRate =
         validPlatforms.reduce((sum, p) => sum + p.averageEngagement, 0) / validPlatforms.length;

      setMetrics({
         totalFollowers,
         totalEngagement,
         averageEngagementRate,
         platformCount: validPlatforms.length,
      });
   }, [platforms]);

   return metrics;
}

