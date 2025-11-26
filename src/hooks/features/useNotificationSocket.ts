// src/hooks/features/useNotificationSocket.ts

'use client';

import { useEffect} from 'react';
import { notificationSocket } from '@/lib/socket/notificationSocket';
import { useQueryClient } from '@tanstack/react-query';
import { useUnreadNotificationCount, notificationKeys } from './useNotifications';
import type { Notification } from '@/types/notifications.types';

interface UseNotificationSocketOptions {
   enabled?: boolean;
   onNewNotification?: (notification: Notification) => void;
}

export const useNotificationSocket = (options: UseNotificationSocketOptions = {}) => {
   const {
      enabled = true,
      onNewNotification,
   } = options;

   const queryClient = useQueryClient();
   const { refetch: refetchUnreadCount } = useUnreadNotificationCount();

   // Connect to socket and set up listeners
   useEffect(() => {
      if (!enabled) return;

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
         if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No access token found, cannot connect to notification socket');
         }
         return;
      }

      // Attempt to connect (will fail silently if backend is not ready)
      try {
         notificationSocket.connect(token);
      } catch (error) {
         // Silently handle connection failures when backend is not ready
         if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ Failed to connect to notification socket (backend may not be ready):', error);
         }
      }

      const handleNewNotification = (data?: unknown) => {
         const notification = data as Notification;
         console.log('🔔 New notification via WebSocket:', notification);

         // Invalidate notifications query to refetch
         queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
         queryClient.invalidateQueries({ queryKey: notificationKeys.detail(notification.id) });

         // Refetch unread count (this will update the red dot indicator)
         refetchUnreadCount();

         // Call custom callback
         onNewNotification?.(notification);
      };

      const handleUpdatedNotification = (data?: unknown) => {
         const notification = data as Notification;
         console.log('📝 Notification updated via WebSocket:', notification);

         // Invalidate queries to refetch
         queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
         queryClient.invalidateQueries({ queryKey: notificationKeys.detail(notification.id) });
         refetchUnreadCount();
      };

      const handleDeletedNotification = (data?: unknown) => {
         const notificationId = data as string;
         console.log('🗑️ Notification deleted via WebSocket:', notificationId);

         // Remove from cache and invalidate
         queryClient.removeQueries({ queryKey: notificationKeys.detail(notificationId) });
         queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
         refetchUnreadCount();
      };

      const handleReadAll = () => {
         console.log('✅ All notifications marked as read via WebSocket');

         // Invalidate all notification queries
         queryClient.invalidateQueries({ queryKey: notificationKeys.all });
         refetchUnreadCount();
      };

      // Subscribe to events
      notificationSocket.on('notification:new', handleNewNotification);
      notificationSocket.on('notification:updated', handleUpdatedNotification);
      notificationSocket.on('notification:deleted', handleDeletedNotification);
      notificationSocket.on('notifications:read-all', handleReadAll);

      // Cleanup
      return () => {
         notificationSocket.off('notification:new', handleNewNotification);
         notificationSocket.off('notification:updated', handleUpdatedNotification);
         notificationSocket.off('notification:deleted', handleDeletedNotification);
         notificationSocket.off('notifications:read-all', handleReadAll);
      };
   }, [enabled, queryClient, refetchUnreadCount, onNewNotification]);

   return {
      isConnected: notificationSocket.isConnected(),
      disconnect: () => notificationSocket.disconnect(),
   };
};

export default useNotificationSocket;

