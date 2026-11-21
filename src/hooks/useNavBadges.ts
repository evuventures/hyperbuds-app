'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import apiClient from '@/lib/api/client';
import notificationSocket from '@/lib/socket/notificationSocket';
import { getAccessToken } from '@/store/authSelectors';

const LAST_SEEN_REELS_KEY = 'hb_last_seen_reels_at';

export function markReelsSeenNow() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SEEN_REELS_KEY, new Date().toISOString());
    window.dispatchEvent(new Event('hb:reels-seen'));
  } catch {
    // Ignore storage errors
  }
}

export function useNavBadges() {
  const pathname = usePathname();
  const [unseenReelsCount, setUnseenReelsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const refreshBadges = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = getAccessToken() || localStorage.getItem('accessToken');
    if (!token) return;

    const [reelsRes, convosRes] = await Promise.all([
      apiClient.get('/feed/posts?kind=reel&limit=20').catch(() => null),
      apiClient.get('/messaging/conversations').catch(() => null),
    ]);

    // 1. Unseen Reels count (never show stale count on first visit or while already on Home/Reels)
    const isOnHomeOrReels =
      pathname === '/' || pathname === '/dashboard' || pathname?.startsWith('/reels');
    if (isOnHomeOrReels) {
      markReelsSeenNow();
      setUnseenReelsCount(0);
    } else {
      const reels: Array<{ createdAt?: string }> = Array.isArray(reelsRes?.data?.posts)
        ? reelsRes.data.posts
        : [];
      const lastSeenRaw = localStorage.getItem(LAST_SEEN_REELS_KEY);
      if (!lastSeenRaw) {
        // Initialize baseline on first load so old reels do not show a phantom unread count
        markReelsSeenNow();
        setUnseenReelsCount(0);
      } else {
        const lastSeenTs = new Date(lastSeenRaw).getTime();
        const newer = reels.filter((r) => {
          const ts = r.createdAt ? new Date(r.createdAt).getTime() : 0;
          return ts > lastSeenTs;
        }).length;
        setUnseenReelsCount(newer);
      }
    }

    // 2. Unread DM count
    const convos: Array<{ unreadCount?: number }> = Array.isArray(convosRes?.data?.conversations)
      ? convosRes.data.conversations
      : Array.isArray(convosRes?.data)
        ? convosRes.data
        : [];
    const totalUnread = convos.reduce((sum, c) => sum + Math.max(0, Number(c?.unreadCount ?? 0)), 0);
    setUnreadMessagesCount(totalUnread);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/' || pathname === '/dashboard' || pathname?.startsWith('/reels')) {
      markReelsSeenNow();
      setUnseenReelsCount(0);
    }
    void refreshBadges();
  }, [pathname, refreshBadges]);

  useEffect(() => {
    const onReelsSeen = () => setUnseenReelsCount(0);
    const onNewMessage = () => {
      if (!pathname?.startsWith('/messages')) {
        setUnreadMessagesCount((c) => c + 1);
      } else {
        void refreshBadges();
      }
    };
    const onNotification = (payload?: unknown) => {
      if (!payload || typeof payload !== 'object') return;
      const p = payload as { type?: string; data?: { kind?: string } };
      if (p.type === 'new_post' && p.data?.kind === 'reel' && !pathname?.startsWith('/reels')) {
        setUnseenReelsCount((c) => c + 1);
      }
      if (p.type === 'new_message' && !pathname?.startsWith('/messages')) {
        void refreshBadges();
      }
    };

    window.addEventListener('hb:reels-seen', onReelsSeen);
    notificationSocket.on('new-message', onNewMessage);
    notificationSocket.on('notification:new', onNotification);
    return () => {
      window.removeEventListener('hb:reels-seen', onReelsSeen);
      notificationSocket.off('new-message', onNewMessage);
      notificationSocket.off('notification:new', onNotification);
    };
  }, [pathname, refreshBadges]);

  return { unseenReelsCount, unreadMessagesCount };
}
