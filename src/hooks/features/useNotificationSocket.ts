// src/hooks/features/useNotificationSocket.ts

'use client';

import type { Notification } from '@/types/notifications.types';

interface UseNotificationSocketOptions {
   enabled?: boolean;
   onNewNotification?: (notification: Notification) => void;
}

/**
 * No-op hook - WebSocket removed per project guidelines.
 * Notifications now use polling via React Query (see useNotifications hook).
 */
export const useNotificationSocket = (options: UseNotificationSocketOptions = {}) => {
   // No-op: WebSocket removed, notifications use polling
   return {
      isConnected: false,
      disconnect: () => {},
   };
};

export default useNotificationSocket;

