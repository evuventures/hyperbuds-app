'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import {
  Bookmark,
  Film,
  Flag,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import {
  CreatorStudioModal,
  type CreatorStudioMode,
  type CreatorStudioUserSummary,
} from './CreatorStudioModal';
import type { FeedPostRecord } from '@/lib/api/feed.api';
import type { Stream } from '@/types/streaming.types';

function LiveStreamActionIcon() {
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
      <rect x="2" y="6" width="17" height="16" rx="4" fill="#F32B44" />
      <path
        d="M20 11.2L25.1 8.2C25.7 7.85 26.5 8.28 26.5 8.98V19.02C26.5 19.72 25.7 20.15 25.1 19.8L20 16.8V11.2Z"
        fill="#F32B44"
      />
      <path
        d="M10.5 10.6C7.6 10.6 5.2 12.5 4.3 14C5.2 15.5 7.6 17.4 10.5 17.4C13.4 17.4 15.8 15.5 16.7 14C15.8 12.5 13.4 10.6 10.5 10.6Z"
        fill="#FFFFFF"
      />
      <circle cx="10.5" cy="14" r="1.95" fill="#F32B44" />
    </svg>
  );
}

function PhotoVideoActionIcon() {
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
      <g transform="rotate(-9 10 15)">
        <rect
          x="3"
          y="6.5"
          width="15"
          height="15"
          rx="3"
          fill="#2EA843"
          stroke="#FFFFFF"
          strokeWidth="1.4"
        />
      </g>
      <rect
        x="7"
        y="6.5"
        width="18"
        height="16.5"
        rx="3.2"
        fill="#34B84A"
        stroke="#FFFFFF"
        strokeWidth="1.4"
      />
      <circle cx="12.2" cy="11.5" r="1.7" fill="#FFFFFF" />
      <path
        d="M9.5 19.8L13.5 15.2C14 14.65 14.85 14.68 15.3 15.26L17.2 17.65L18.9 15.7C19.38 15.15 20.22 15.16 20.68 15.73L22.5 19.8H9.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function ReelsActionIcon() {
  return (
    <svg viewBox="0 0 28 28" className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true">
      <rect x="4" y="4.5" width="20" height="19" rx="5.2" fill="#FF4B6E" />
      <path d="M4 9.5H24" stroke="#FFFFFF" strokeWidth="1.6" />
      <path d="M9.2 4.5L11.4 9.5" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16.2 4.5L18.4 9.5" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M11.8 13.1C11.8 12.45 12.52 12.06 13.07 12.41L18.1 15.51C18.62 15.83 18.62 16.59 18.1 16.91L13.07 20.01C12.52 20.35 11.8 19.96 11.8 19.31V13.1Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export interface FeedAuthor {
  _id?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
}

export interface FeedComment {
  _id: string;
  author?: FeedAuthor | string;
  text: string;
  createdAt?: string;
}

export interface FeedMedia {
  type: 'image' | 'video';
  url: string;
}

export interface FeedPost {
  _id: string;
  author?: FeedAuthor | string;
  kind: 'post' | 'reel';
  body: string;
  media?: FeedMedia[];
  tags?: string[];
  visibility: 'public' | 'followers' | 'private';
  likes?: string[];
  bookmarks?: string[];
  comments?: FeedComment[];
  createdAt?: string;
}

interface SocialFeedStreamProps {
  currentUser?: {
    id?: string;
    displayName?: string;
    username?: string;
    avatar?: string;
  };
  showSearchBar?: boolean;
  onPostCountChange?: (count: number) => void;
}

function getInitials(name?: string) {
  if (!name) return 'HB';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(value?: string) {
  if (!value) return 'Just now';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Just now';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type FeedTab = 'all' | 'post' | 'reel' | 'saved';

const FEED_PAGE_SIZE = 10;

const FEED_TABS: Array<{ id: FeedTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'post', label: 'Posts' },
  { id: 'reel', label: 'Reels' },
  { id: 'saved', label: 'Saved' },
];

function buildFeedQuery(tab: FeedTab, search: string, pageNum: number): string {
  const params = new URLSearchParams({
    limit: String(FEED_PAGE_SIZE),
    page: String(pageNum),
  });
  if (tab === 'post' || tab === 'reel') params.set('kind', tab);
  if (tab === 'saved') params.set('saved', 'true');
  if (search.trim()) params.set('q', search.trim());
  return params.toString();
}

export default function SocialFeedStream({
  currentUser,
  showSearchBar = true,
  onPostCountChange,
}: SocialFeedStreamProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(currentUser?.id || '');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [tab, setTab] = useState<FeedTab>('all');
  const [search, setSearch] = useState('');
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    text: string;
    actionHref?: string;
    actionLabel?: string;
  } | null>(null);
  const [resolvedUser, setResolvedUser] = useState<CreatorStudioUserSummary | undefined>(
    currentUser
  );

  // Multi-step Creator Studio modal state
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioMode, setStudioMode] = useState<CreatorStudioMode>('post');
  const [studioAutoFocusUpload, setStudioAutoFocusUpload] = useState(false);

  // Comment state
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    if (currentUser?.id) setCurrentUserId(currentUser.id);
  }, [currentUser?.id]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setPage(1);
    setHasMore(false);
    try {
      const query = buildFeedQuery(tab, search, 1);

      const [meRes, feedRes] = await Promise.all([
        currentUser?.id ? Promise.resolve(null) : apiClient.get('/users/me').catch(() => null),
        apiClient.get(`/feed/posts?${query}`),
      ]);

      const resolvedMe = meRes?.data?.user || meRes?.data;
      const resolvedProfile = meRes?.data?.profile || resolvedMe?.profile;
      const resolvedId =
        currentUser?.id ||
        resolvedMe?._id ||
        resolvedMe?.id ||
        '';
      if (resolvedId) setCurrentUserId(String(resolvedId));

      if (currentUser?.id || currentUser?.displayName || currentUser?.avatar) {
        setResolvedUser(currentUser);
      } else if (resolvedMe || resolvedProfile) {
        setResolvedUser({
          id: resolvedId ? String(resolvedId) : undefined,
          displayName:
            resolvedMe?.displayName ||
            resolvedProfile?.displayName ||
            resolvedMe?.name ||
            resolvedMe?.fullName,
          username: resolvedMe?.username || resolvedProfile?.username,
          avatar:
            resolvedMe?.avatar ||
            resolvedProfile?.avatar ||
            resolvedMe?.profilePicture,
        });
      }

      const nextPosts = Array.isArray(feedRes.data?.posts) ? feedRes.data.posts : [];
      const totalPages = Number(feedRes.data?.pagination?.pages ?? 1);
      setPosts(nextPosts);
      setPage(1);
      setHasMore(1 < totalPages);
      onPostCountChange?.(nextPosts.length);
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to load social feed.',
      });
    } finally {
      setLoading(false);
    }
  }, [tab, search, currentUser, onPostCountChange]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const query = buildFeedQuery(tab, search, nextPage);
      const feedRes = await apiClient.get(`/feed/posts?${query}`);
      const incoming: FeedPost[] = Array.isArray(feedRes.data?.posts) ? feedRes.data.posts : [];
      const totalPages = Number(feedRes.data?.pagination?.pages ?? nextPage);

      setPosts((prev) => {
        const seen = new Set(prev.map((item) => item._id));
        const unique = incoming.filter((item) => !seen.has(item._id));
        const updated = [...prev, ...unique];
        onPostCountChange?.(updated.length);
        return updated;
      });
      setPage(nextPage);
      setHasMore(nextPage < totalPages && incoming.length > 0);
    } catch {
      setHasMore(false);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [loading, hasMore, page, tab, search, onPostCountChange]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, posts.length]);

  const openStudio = (mode: CreatorStudioMode, autoFocusUpload = false) => {
    setStudioMode(mode);
    setStudioAutoFocusUpload(autoFocusUpload);
    setStudioOpen(true);
  };

  const handlePostCreated = (post: FeedPostRecord) => {
    setPosts((prev) => {
      const updated = [post as FeedPost, ...prev];
      onPostCountChange?.(updated.length);
      return updated;
    });
    setBanner({ type: 'success', text: 'Post published to your feed.' });
  };

  const handleReelCreated = (reel: FeedPostRecord) => {
    if (tab === 'all' || tab === 'reel') {
      setPosts((prev) => {
        const updated = [reel as FeedPost, ...prev];
        onPostCountChange?.(updated.length);
        return updated;
      });
    }
    setBanner({
      type: 'success',
      text: 'Reel uploaded to Cloudinary and published.',
      actionHref: '/reels',
      actionLabel: 'Watch in Reels',
    });
  };

  const handleStreamCreated = (stream: Stream) => {
    setBanner({
      type: 'success',
      text:
        stream.status === 'live'
          ? `Live stream "${stream.title}" is now live.`
          : `Live stream "${stream.title}" is scheduled.`,
      actionHref: `/streaming/room/${stream._id}`,
      actionLabel: 'Open Live Studio',
    });
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res = await apiClient.post(`/feed/posts/${postId}/like`);
      const liked = Boolean(res.data?.liked);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const existing = p.likes ?? [];
          const nextLikes = liked
            ? [...new Set([...existing, currentUserId || 'me'])]
            : existing.filter((id) => id !== currentUserId && id !== 'me');
          return { ...p, likes: nextLikes };
        }),
      );
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to update reaction.',
      });
    }
  };

  const handleToggleBookmark = async (postId: string) => {
    try {
      const res = await apiClient.post(`/feed/posts/${postId}/bookmark`);
      const bookmarked = Boolean(res.data?.bookmarked);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const existing = p.bookmarks ?? [];
          const next = bookmarked
            ? [...new Set([...existing, currentUserId || 'me'])]
            : existing.filter((id) => id !== currentUserId && id !== 'me');
          return { ...p, bookmarks: next };
        }),
      );
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to save post.',
      });
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    try {
      const res = await apiClient.post(`/feed/posts/${postId}/comments`, { text });
      const created: FeedComment = res.data?.comment ?? {
        _id: `c-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: [...(p.comments ?? []), created] } : p,
        ),
      );
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to post comment.',
      });
    }
  };

  const handleReport = async (postId: string) => {
    try {
      await apiClient.post(`/feed/posts/${postId}/report`, {
        reason: 'inappropriate',
        details: 'Flagged from feed',
      });
      setBanner({ type: 'success', text: 'Post reported for moderation review.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to report post.',
      });
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await apiClient.delete(`/feed/posts/${postId}`);
      setPosts((prev) => {
        const updated = prev.filter((p) => p._id !== postId);
        onPostCountChange?.(updated.length);
        return updated;
      });
      setBanner({ type: 'success', text: 'Post removed.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to delete post.',
      });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const shareUrl = `${window.location.origin}/feed#${postId}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setBanner({ type: 'success', text: 'Post link copied to clipboard.' });
    } catch {
      setBanner({ type: 'success', text: 'Share link ready.' });
    }
  };

  const creatorProfile = currentUser || resolvedUser;
  const firstName = creatorProfile?.displayName?.trim().split(/\s+/)[0] || '';
  const composerPrompt = firstName
    ? `What's on your mind, ${firstName}?`
    : "What's on your mind?";

  return (
    <div className="space-y-4">
      {banner && (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            banner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <span>{banner.text}</span>
          <div className="flex items-center gap-3">
            {banner.actionHref && banner.actionLabel && (
              <Link
                href={banner.actionHref}
                className="font-semibold underline underline-offset-2 hover:opacity-80"
              >
                {banner.actionLabel}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="text-[11px] font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Homepage Compact Composer Bar */}
      <div
        data-testid="homepage-composer-bar"
        className="rounded-3xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_2px_14px_rgba(15,23,42,0.06)] sm:px-4 sm:py-3 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => openStudio('post')}
            aria-label="Create a new post"
            className="shrink-0 rounded-full ring-2 ring-amber-400/80 ring-offset-2 ring-offset-white transition hover:scale-[1.03] focus:outline-none focus-visible:ring-indigo-500 dark:ring-offset-slate-900"
          >
            {creatorProfile?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creatorProfile.avatar}
                alt={creatorProfile.displayName || 'Creator'}
                className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white sm:h-11 sm:w-11 dark:bg-slate-700">
                {getInitials(creatorProfile?.displayName || 'HyperBuds Creator')}
              </div>
            )}
          </button>

          <button
            type="button"
            data-testid="composer-mind-trigger"
            onClick={() => openStudio('post')}
            className="min-w-0 flex-1 truncate rounded-full bg-slate-100 px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 sm:px-5 sm:text-[15px] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
          >
            {composerPrompt}
          </button>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <button
              type="button"
              data-testid="composer-livestream-btn"
              onClick={() => openStudio('livestream')}
              aria-label="Set up live stream"
              title="Live stream"
              className="rounded-xl p-1.5 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-950/40"
            >
              <LiveStreamActionIcon />
            </button>

            <button
              type="button"
              data-testid="composer-media-btn"
              onClick={() => openStudio('post', true)}
              aria-label="Upload photo or video"
              title="Photo / Video"
              className="rounded-xl p-1.5 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <PhotoVideoActionIcon />
            </button>

            <button
              type="button"
              data-testid="composer-reel-btn"
              onClick={() => openStudio('reel')}
              aria-label="Create reel"
              title="Reels"
              className="rounded-xl p-1.5 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:hover:bg-rose-950/40"
            >
              <ReelsActionIcon />
            </button>
          </div>
        </div>
      </div>

      <CreatorStudioModal
        open={studioOpen}
        onOpenChange={setStudioOpen}
        initialMode={studioMode}
        autoFocusUpload={studioAutoFocusUpload}
        currentUser={creatorProfile}
        onPostCreated={handlePostCreated}
        onReelCreated={handleReelCreated}
        onStreamCreated={handleStreamCreated}
      />

      {/* Feed Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Feed filter"
          className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
          {FEED_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-purple-700 text-white shadow-xs dark:bg-purple-600'
                    : 'text-slate-600 hover:text-purple-700 dark:text-slate-400 dark:hover:text-purple-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {showSearchBar && (
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter feed..."
              aria-label="Filter feed"
              className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {tab === 'saved' ? 'No saved posts yet' : 'No posts in the feed yet'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tab === 'saved'
              ? 'Bookmark any post in the feed to keep it here.'
              : 'Share an update, photo, or studio clip above to kick off the conversation.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorObj = typeof post.author === 'object' && post.author ? post.author : null;
            const authorId =
              typeof post.author === 'string' ? post.author : authorObj?._id || '';
            const authorName =
              authorObj?.fullName || authorObj?.username || 'HyperBuds Creator';
            const liked = (post.likes ?? []).some(
              (id) => id === currentUserId || id === 'me',
            );
            const bookmarked = (post.bookmarks ?? []).some(
              (id) => id === currentUserId || id === 'me',
            );
            const isOwner = Boolean(currentUserId && authorId === currentUserId);
            const commentsOpen = Boolean(openComments[post._id]);

            return (
              <article
                key={post._id}
                id={post._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {authorObj?.avatar ? (
                      <img
                        src={authorObj.avatar}
                        alt={authorName}
                        className="h-10 w-10 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-indigo-600">
                        {getInitials(authorName)}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {authorName}
                        </p>
                        {post.kind === 'reel' && (
                          <Link
                            href="/reels"
                            className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800 transition hover:bg-purple-200 dark:bg-purple-950/70 dark:text-purple-200"
                          >
                            <Film className="h-3 w-3" />
                            Reel
                          </Link>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatTime(post.createdAt)} · {post.visibility}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleReport(post._id)}
                      title="Report post"
                      aria-label="Report post"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post._id)}
                        title="Delete post"
                        aria-label="Delete post"
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {post.body && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                    {post.body}
                  </p>
                )}

                {Array.isArray(post.media) && post.media.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 gap-2 overflow-hidden rounded-xl">
                    {post.media.map((m, idx) =>
                      m.type === 'video' ? (
                        <div
                          key={`${post._id}-m-${idx}`}
                          className={`overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-800 ${
                            post.kind === 'reel' ? 'flex justify-center' : ''
                          }`}
                        >
                          <video
                            src={m.url}
                            controls
                            playsInline
                            preload="metadata"
                            className={
                              post.kind === 'reel'
                                ? 'aspect-[9/16] max-h-[460px] w-auto object-cover'
                                : 'max-h-96 w-full object-cover'
                            }
                          />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={`${post._id}-m-${idx}`}
                          src={m.url}
                          alt="Post attachment"
                          className="max-h-96 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-800"
                        />
                      ),
                    )}
                  </div>
                )}

                {Array.isArray(post.tags) && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post._id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                        liked
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                      <span className="tabular-nums">{(post.likes ?? []).length}</span> Like
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOpenComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="tabular-nums">{(post.comments ?? []).length}</span> Comment
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(post._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(post._id)}
                    aria-label="Bookmark post"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      bookmarked
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {commentsOpen && (
                  <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {(post.comments ?? []).length > 0 ? (
                      <div className="space-y-2">
                        {(post.comments ?? []).map((c) => {
                          const cAuthor =
                            typeof c.author === 'object' && c.author
                              ? c.author.fullName || c.author.username || 'Creator'
                              : 'Creator';
                          return (
                            <div
                              key={c._id}
                              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                            >
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {cAuthor}
                              </span>{' '}
                              <span className="text-slate-700 dark:text-slate-300">{c.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No comments yet. Be the first to reply.</p>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentDrafts[post._id] || ''}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post._id);
                          }
                        }}
                        placeholder="Write a comment..."
                        aria-label="Write a comment"
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post._id)}
                        className="rounded-xl bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {/* Endless Facebook-style scroll sentinel */}
          <div ref={sentinelRef} data-testid="feed-scroll-sentinel" className="pt-2">
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                Loading more posts & reels...
              </div>
            ) : hasMore ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  className="rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                >
                  Load more posts & reels
                </button>
              </div>
            ) : (
              page > 1 && (
                <p className="py-3 text-center text-xs text-slate-400">
                  You&apos;re all caught up
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
