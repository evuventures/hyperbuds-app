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
      console.log(`🔄 Sync mutation called for ${platform}:`, { platform, platformData });

      const syncData: SocialSyncRequest = {
        followers: platformData.followers,
        engagement: platformData.averageEngagement,  // Add engagement field
      };

      console.log(`📤 Sending sync data for ${platform}:`, syncData);

      try {
        let result;
        switch (platform) {
          case 'tiktok':
            result = await profileApi.syncTikTok(syncData);
            break;
          case 'twitch':
            result = await profileApi.syncTwitch(syncData);
            break;
          case 'twitter':
            result = await profileApi.syncTwitter(syncData);
            break;
          case 'instagram':
            result = await profileApi.syncInstagram(syncData);
            break;
          default:
            throw new Error(`Sync not supported for ${platform}`);
        }

        console.log(`✅ Sync API response for ${platform}:`, result);
        return result;
      } catch (error) {
        console.error(`❌ Sync API error for ${platform}:`, error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate profile queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast({
        title: "🎉 Sync Successful!",
        description: `${variables.platform.charAt(0).toUpperCase() + variables.platform.slice(1)} data has been synced to your profile`,
        duration: 4000,
        variant: "success",
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
        title: "❌ Sync Failed",
        description: error.message || `Failed to sync ${variables.platform.charAt(0).toUpperCase() + variables.platform.slice(1)} data. Please try again.`,
        variant: "destructive",
        duration: 5000,
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
          followers: data.followers,
          engagement: data.averageEngagement,  // Add engagement field
        };
        setSyncingPlatforms(prev => new Set(prev).add(platform));
      }
    });

    try {
      const result = await profileApi.syncAllPlatforms(syncData);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast({
          title: "🚀 All Platforms Synced!",
          description: "All your social media data has been successfully synced to your profile",
          duration: 4000,
          variant: "success",
        });
      }

      setSyncingPlatforms(new Set());
      return result;
    } catch (error) {
      setSyncingPlatforms(new Set());
      toast({
        title: "❌ Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync platforms. Please try again.",
        variant: "destructive",
        duration: 5000,
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

