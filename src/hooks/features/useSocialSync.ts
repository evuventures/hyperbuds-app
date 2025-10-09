// src/hooks/features/useSocialSync.ts

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, type SocialSyncRequest } from '@/lib/api/profile.api';
import { useToast } from '../ui/useToast';
import type { PlatformType, UnifiedPlatformData } from '@/types/platform.types';

interface SyncPlatformParams {
  platform: PlatformType;
  platformData: UnifiedPlatformData;
}

export const useSocialSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [syncingPlatforms, setSyncingPlatforms] = useState<Set<string>>(new Set());

  // Mutation for syncing a single platform
  const syncMutation = useMutation({
    mutationFn: async ({ platform, platformData }: SyncPlatformParams) => {
      const syncData: SocialSyncRequest = {
        follow: platformData.followers,  // Backend expects "follow" field
        engagement: platformData.averageEngagement,
      };

      switch (platform) {
        case 'tiktok':
          return await profileApi.syncTikTok(syncData);
        case 'twitch':
          return await profileApi.syncTwitch(syncData);
        case 'twitter':
          return await profileApi.syncTwitter(syncData);
        default:
          throw new Error(`Sync not supported for ${platform}`);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Sync successful!",
        description: `${variables.platform.toUpperCase()} data synced to your profile`,
      });

      // Remove from syncing set
      setSyncingPlatforms(prev => {
        const updated = new Set(prev);
        updated.delete(variables.platform);
        return updated;
      });
    },
    onError: (error: Error, variables) => {
      toast({
        title: "Sync failed",
        description: error.message || `Failed to sync ${variables.platform} data`,
        variant: "destructive",
      });

      // Remove from syncing set
      setSyncingPlatforms(prev => {
        const updated = new Set(prev);
        updated.delete(variables.platform);
        return updated;
      });
    },
  });

  // Function to sync a platform
  const syncPlatform = useCallback(async (platform: PlatformType, platformData: UnifiedPlatformData) => {
    setSyncingPlatforms(prev => new Set(prev).add(platform));
    await syncMutation.mutateAsync({ platform, platformData });
  }, [syncMutation]);

  // Function to sync all platforms
  const syncAllPlatforms = useCallback(async (
    platformsData: Record<PlatformType, UnifiedPlatformData | null>
  ) => {
    const syncData: Record<string, SocialSyncRequest> = {};
    
    Object.entries(platformsData).forEach(([platform, data]) => {
      if (data) {
        syncData[platform] = {
          follow: data.followers,  // Backend expects "follow" field
          engagement: data.averageEngagement,
        };
        setSyncingPlatforms(prev => new Set(prev).add(platform));
      }
    });

    try {
      const result = await profileApi.syncAllPlatforms(syncData);
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast({
          title: "Sync completed!",
          description: "All platforms have been synced to your profile",
        });
      }
      
      setSyncingPlatforms(new Set());
      return result;
    } catch (error) {
      setSyncingPlatforms(new Set());
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync platforms",
        variant: "destructive",
      });
      throw error;
    }
  }, [queryClient, toast]);

  return {
    syncPlatform,
    syncAllPlatforms,
    isSyncing: syncMutation.isPending,
    syncingPlatforms,
    isSyncingPlatform: (platform: string) => syncingPlatforms.has(platform),
  };
};

export default useSocialSync;

