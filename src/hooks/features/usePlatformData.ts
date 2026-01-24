/**
 * Custom Hook for fetching and managing platform data
 */

import { useState, useEffect, useCallback } from 'react';
import type { PlatformType, UnifiedPlatformData, PlatformAPIError } from '@/types/platform.types';
import { getAccessToken } from '@/store/authSelectors';

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

         // Get auth token from localStorage for client-side requests
         const token = getAccessToken();

         const headers: Record<string, string> = {
            'Content-Type': 'application/json',
         };

         // Add auth token if available
         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }

         const response = await fetch(url, {
            headers,
         });

         // Check if response is actually JSON before parsing
         const contentType = response.headers.get('content-type');
         if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`❌ Non-JSON response for ${platform}:`, text);
            throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
         }

         const result = await response.json();

         console.log(`📥 Response for ${platform}:`, {
            status: response.status,
            ok: response.ok,
            success: result.success,
            hasData: !!result.data,
            error: result.error
         });

         if (!response.ok) {
            // If response is not ok, it might be a Next.js route error
            if (response.status === 404) {
               throw new Error(`Route not found: ${url}. Please restart the dev server if you just added this route.`);
            }
            throw new Error(result.error || result.message || `HTTP ${response.status}: Failed to fetch platform data`);
         }

         if (!result.success) {
            throw new Error(result.error || result.message || 'Failed to fetch platform data');
         }

         console.log(`✅ Successfully fetched ${platform} data:`, result.data);
         setData(result.data);
      } catch (err) {
         const errorMessage = err instanceof Error ? err.message : 'Unknown error';

         // Handle specific error types
         if (errorMessage.includes('Backend API endpoint not found') || errorMessage.includes('endpoint not found')) {
            // Backend endpoint not deployed yet - log as warning, not error
            console.warn(`⚠️ ${platform}: Backend API endpoint not yet available. Using stored profile data as fallback.`);
            setError({
               platform,
               error: 'Platform integration pending. Using stored profile data.',
               type: 'endpoint_not_available'
            });
         } else if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
            console.warn(`⚠️ ${platform} API quota exceeded. Consider upgrading plan or using cached data.`);
            setError({
               platform,
               error: 'API quota exceeded. Please try again later or upgrade your plan.',
               type: 'quota_error'
            });
         } else {
            console.error(`❌ Error fetching ${platform} data:`, errorMessage);
            setError({
               platform,
               error: errorMessage,
               type: 'api_error'
            });
         }
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

      // Get auth token from localStorage for client-side requests (same as single platform hook)
      const token = getAccessToken();

      const headers: Record<string, string> = {
         'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
         headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch all platforms in parallel
      await Promise.all(
         platforms.map(async ({ type, username }) => {
            try {
               const url = `/api/platform/${type}?username=${encodeURIComponent(username)}`;
               console.log(`📡 Fetching ${type}: ${url}`);

               const response = await fetch(url, {
                  headers,
               });
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

               // Handle specific API quota errors
               if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
                  console.warn(`⚠️ ${type} API quota exceeded. Consider upgrading plan or using cached data.`);
                  fetchErrors.push({
                     platform: type,
                     error: 'API quota exceeded. Please try again later or upgrade your plan.',
                     type: 'quota_error'
                  });
               } else if (errorMessage.includes('Backend API endpoint not found') || errorMessage.includes('endpoint not found')) {
                  // Backend endpoint not deployed yet - log as warning, not error
                  console.warn(`⚠️ ${type}: Backend API endpoint not yet available. Using stored profile data as fallback.`);
                  fetchErrors.push({
                     platform: type,
                     error: 'Platform integration pending. Using stored profile data.',
                     type: 'endpoint_not_available'
                  });
               } else {
                  console.error(`❌ ${type} error:`, errorMessage);
                  fetchErrors.push({
                     platform: type,
                     error: errorMessage,
                     type: 'api_error'
                  });
               }

               results[type] = null;
            }
         })
      );

      console.log('📊 Final multiple platform results:', {
         results,
         errors: fetchErrors,
         successCount: Object.values(results).filter(v => v !== null).length
      });

      // Log quota errors for monitoring
      const quotaErrors = fetchErrors.filter(error => error.type === 'quota_error');
      if (quotaErrors.length > 0) {
         console.warn('🚨 API Quota Issues Detected:', quotaErrors.map(e => e.platform));
      }

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
