// src/hooks/features/useNotificationSocket.ts

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { notificationSocket, type NotificationData } from '@/lib/socket/notificationSocket';
import { useQueryClient } from '@tanstack/react-query';
import { notificationKeys, useUnreadNotificationCount } from './useNotifications';
import { getAccessToken } from '@/store/authSelectors';
import type { Notification } from '@/types/notifications.types';

interface UseNotificationSocketOptions {
  enabled?: boolean;
  showToast?: boolean;
  onNewNotification?: (notification: Notification) => void;
}

const recentNotificationIds = new Set<string>();

function triggerBrowserNotification(payload: NotificationData) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (!document.hidden) return;

  const title = payload.title || 'HyperBuds';
  const body = payload.message || payload.content || 'You have a new update.';
  const actionUrl = payload.actionUrl || '/notifications';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) =>
        reg.showNotification(title, {
          body,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          data: { actionUrl },
        }),
      )
      .catch(() => {
        try {
          new Notification(title, { body, icon: '/android-chrome-192x192.png' });
        } catch {
          // Ignore browser notification errors
        }
      });
    return;
  }

  try {
    new Notification(title, { body, icon: '/android-chrome-192x192.png' });
  } catch {
    // Ignore browser notification errors
  }
}

export const useNotificationSocket = (options: UseNotificationSocketOptions = {}) => {
  const { enabled = true, showToast = true, onNewNotification } = options;

  const router = useRouter();
  const queryClient = useQueryClient();
  const { refetch: refetchUnreadCount } = useUnreadNotificationCount();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const token = getAccessToken() || window.localStorage.getItem('accessToken');
    if (!token) return;

    try {
      notificationSocket.connect(token);
    } catch {
      return;
    }

    const handleNewNotification = (data?: unknown) => {
      if (!data || typeof data !== 'object') return;
      const raw = data as NotificationData;
      const id = String(raw._id || raw.id || '');

      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void refetchUnreadCount();

      // Deduplicate live toast/OS notification across multiple mounted hook instances
      if (id && recentNotificationIds.has(id)) {
        onNewNotification?.(raw as unknown as Notification);
        return;
      }
      if (id) {
        recentNotificationIds.add(id);
        setTimeout(() => recentNotificationIds.delete(id), 10000);
      }

      if (showToast) {
        const headline = raw.title || 'New notification';
        const body = raw.message || raw.content || '';
        const actionUrl = raw.actionUrl || '/notifications';
        const isDm = raw.type === 'new_message';
        const dmConvoId =
          raw.data && typeof raw.data === 'object'
            ? String((raw.data as Record<string, unknown>).conversationId || '')
            : '';
        const alreadyInThisDm =
          isDm &&
          dmConvoId &&
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith(`/messages/${dmConvoId}`);

        if (!alreadyInThisDm) {
          const isMatchReq =
            raw.type === 'match' &&
            raw.data &&
            typeof raw.data === 'object' &&
            (raw.data as Record<string, unknown>).kind === 'match_request';
          const isMatch = raw.type === 'match';
          toast(
            (t) =>
              React.createElement(
                'div',
                {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => {
                    toast.dismiss(t.id);
                    if (actionUrl) router.push(actionUrl);
                  },
                  onKeyDown: (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toast.dismiss(t.id);
                      if (actionUrl) router.push(actionUrl);
                    }
                  },
                  className: 'cursor-pointer',
                },
                React.createElement('p', { className: 'font-semibold text-slate-900' }, headline),
                body && body !== headline
                  ? React.createElement('p', { className: 'mt-0.5 text-xs text-slate-600' }, body.slice(0, 110))
                  : null,
                isMatchReq
                  ? React.createElement(
                      'p',
                      { className: 'mt-1 text-[11px] font-semibold text-purple-600' },
                      'Tap to Match Back →',
                    )
                  : null,
              ),
            {
              id: id || undefined,
              duration: isMatchReq ? 8000 : 5000,
              icon: isDm ? '💬' : isMatchReq ? '❤️' : isMatch ? '🎉' : raw.type === 'follow' ? '👤' : '🔔',
              style: { cursor: 'pointer', maxWidth: '390px', fontSize: '13px' },
            },
          );
        }
        if (actionUrl && typeof window !== 'undefined' && (raw.type === 'stream_live' || raw.type === 'match' || isDm)) {
          void router.prefetch?.(actionUrl);
        }
      }

      if (raw.type === 'match') {
        queryClient.invalidateQueries({ queryKey: ['matching'] });
      }
      if (raw.type === 'new_message') {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['messages'] });
      }

      triggerBrowserNotification(raw);
      onNewNotification?.(raw as unknown as Notification);
    };

    const handleRealtimeDm = (payload?: unknown) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      if (!payload || typeof payload !== 'object') return;
      const p = payload as {
        conversationId?: string;
        message?: {
          _id?: string;
          id?: string;
          content?: string;
          sender?: { displayName?: string; username?: string; _id?: string; id?: string } | string;
        };
      };
      const msg = p.message;
      const msgId = String(msg?._id || msg?.id || '');
      if (!msg || !msgId) return;
      // Fallback toast only if notification:new hasn't already displayed this message
      const dedupKey = `dm:${msgId}`;
      if (recentNotificationIds.has(dedupKey)) return;
      recentNotificationIds.add(dedupKey);
      setTimeout(() => recentNotificationIds.delete(dedupKey), 10000);
      void refetchUnreadCount();
    };

    const handleUpdatedNotification = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void refetchUnreadCount();
    };

    const handleDeletedNotification = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void refetchUnreadCount();
    };

    const handleReadAll = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      void refetchUnreadCount();
    };

    notificationSocket.on('notification:new', handleNewNotification);
    notificationSocket.on('notification:updated', handleUpdatedNotification);
    notificationSocket.on('notification:deleted', handleDeletedNotification);
    notificationSocket.on('notifications:read-all', handleReadAll);
    notificationSocket.on('new-message', handleRealtimeDm);

    return () => {
      notificationSocket.off('notification:new', handleNewNotification);
      notificationSocket.off('notification:updated', handleUpdatedNotification);
      notificationSocket.off('notification:deleted', handleDeletedNotification);
      notificationSocket.off('notifications:read-all', handleReadAll);
      notificationSocket.off('new-message', handleRealtimeDm);
    };
  }, [enabled, showToast, queryClient, refetchUnreadCount, onNewNotification, router]);

  return {
    isConnected: notificationSocket.isConnected(),
    disconnect: () => notificationSocket.disconnect(),
  };
};

export default useNotificationSocket;
