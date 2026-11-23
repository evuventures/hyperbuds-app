'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import apiClient from '@/lib/api/client';
import notificationSocket from '@/lib/socket/notificationSocket';
import { getAccessToken } from '@/store/authSelectors';

const LAST_SEEN_REELS_KEY = 'hb_last_seen_reels_at';
const LAST_SEEN_HOME_KEY = 'hb_last_seen_home_at';

export function markReelsSeenNow() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SEEN_REELS_KEY, new Date().toISOString());
    window.dispatchEvent(new Event('hb:reels-seen'));
  } catch {
    // Ignore storage errors
  }
}

export function markHomeSeenNow() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_SEEN_HOME_KEY, new Date().toISOString());
    window.dispatchEvent(new Event('hb:home-seen'));
  } catch {
    // Ignore storage errors
  }
}

export function triggerHomeRefresh() {
  if (typeof window === 'undefined') return;
  markHomeSeenNow();
  window.dispatchEvent(new Event('hb:home-refresh'));
}

export function useNavBadges() {
  const pathname = usePathname();
  const [unseenPostsCount, setUnseenPostsCount] = useState(0);
  const [unseenReelsCount, setUnseenReelsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const refreshBadges = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const token = getAccessToken() || localStorage.getItem('accessToken');
    if (!token) return;

    const [postsRes, reelsRes, convosRes] = await Promise.all([
      apiClient.get('/feed/posts?limit=20').catch(() => null),
      apiClient.get('/feed/posts?kind=reel&limit=20').catch(() => null),
      apiClient.get('/messaging/conversations').catch(() => null),
    ]);

    // 1. Unseen Home Posts count (tracks any new post since last Home view/refresh)
    const recentPosts: Array<{ createdAt?: string }> = Array.isArray(postsRes?.data?.posts)
      ? postsRes.data.posts
      : [];
    const lastHomeSeenRaw = localStorage.getItem(LAST_SEEN_HOME_KEY);
    if (!lastHomeSeenRaw) {
      markHomeSeenNow();
      setUnseenPostsCount(0);
    } else {
      const lastHomeTs = new Date(lastHomeSeenRaw).getTime();
      const newerPosts = recentPosts.filter((p) => {
        const ts = p.createdAt ? new Date(p.createdAt).getTime() : 0;
        return ts > lastHomeTs;
      }).length;
      setUnseenPostsCount(newerPosts);
    }

    // 2. Unseen Reels count
    const isOnReels = Boolean(pathname?.startsWith('/reels'));
    if (isOnReels) {
      markReelsSeenNow();
      setUnseenReelsCount(0);
    } else {
      const reels: Array<{ createdAt?: string }> = Array.isArray(reelsRes?.data?.posts)
        ? reelsRes.data.posts
        : [];
      const lastSeenRaw = localStorage.getItem(LAST_SEEN_REELS_KEY);
      if (!lastSeenRaw) {
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

    // 3. Unread DM count
    const convos: Array<{ unreadCount?: number }> = Array.isArray(convosRes?.data?.conversations)
      ? convosRes.data.conversations
      : Array.isArray(convosRes?.data)
        ? convosRes.data
        : [];
    const totalUnread = convos.reduce((sum, c) => sum + Math.max(0, Number(c?.unreadCount ?? 0)), 0);
    setUnreadMessagesCount(totalUnread);
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith('/reels')) {
      markReelsSeenNow();
      setUnseenReelsCount(0);
    }
    void refreshBadges();
    const poll = window.setInterval(() => {
      void refreshBadges();
    }, 45_000);
    return () => window.clearInterval(poll);
  }, [pathname, refreshBadges]);

  useEffect(() => {
    const onReelsSeen = () => setUnseenReelsCount(0);
    const onHomeSeen = () => setUnseenPostsCount(0);
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
      if (p.type === 'new_post') {
        setUnseenPostsCount((c) => c + 1);
        if (p.data?.kind === 'reel' && !pathname?.startsWith('/reels')) {
          setUnseenReelsCount((c) => c + 1);
        }
      }
      if (p.type === 'new_message' && !pathname?.startsWith('/messages')) {
        void refreshBadges();
      }
    };

    window.addEventListener('hb:reels-seen', onReelsSeen);
    window.addEventListener('hb:home-seen', onHomeSeen);
    notificationSocket.on('new-message', onNewMessage);
    notificationSocket.on('notification:new', onNotification);
    return () => {
      window.removeEventListener('hb:reels-seen', onReelsSeen);
      window.removeEventListener('hb:home-seen', onHomeSeen);
      notificationSocket.off('new-message', onNewMessage);
      notificationSocket.off('notification:new', onNotification);
    };
  }, [pathname, refreshBadges]);

  return { unseenPostsCount, unseenReelsCount, unreadMessagesCount };
}
