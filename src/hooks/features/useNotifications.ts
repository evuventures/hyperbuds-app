// src/hooks/features/useNotifications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications.api';
import { useToast } from '../ui/useToast';
import type {
  GetNotificationsParams,
  UpdateNotificationPreferencesRequest,
} from '@/types/notifications.types';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: GetNotificationsParams) => [...notificationKeys.lists(), params] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

export const useNotifications = (params?: GetNotificationsParams) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.markAsRead(notificationId),
    onSuccess: (data, notificationId) => {
      // Invalidate notifications list to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(notificationId) });

      toast({
        title: 'Notification marked as read',
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark notification as read',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: (data) => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });

      toast({
        title: 'All notifications marked as read',
        description: `${data.count} notifications updated`,
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to mark all as read',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (notificationId: string) => notificationsApi.deleteNotification(notificationId),
    onSuccess: (data, notificationId) => {
      // Invalidate notifications list
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.removeQueries({ queryKey: notificationKeys.detail(notificationId) });

      toast({
        title: 'Notification deleted',
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete notification',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (preferences: UpdateNotificationPreferencesRequest) =>
      notificationsApi.updatePreferences(preferences),
    onSuccess: (data) => {
      // Update preferences cache
      queryClient.setQueryData(notificationKeys.preferences(), data);

      toast({
        title: 'Notification preferences updated',
        duration: 2000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update preferences',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
        duration: 3000,
      });
    },
  });
};

export const useUnreadNotificationCount = () => {
  const { data, ...rest } = useNotifications({ read: false, limit: 1 });

  return {
    unreadCount: data?.unreadCount || 0,
    ...rest,
  };
};

export default useNotifications;

