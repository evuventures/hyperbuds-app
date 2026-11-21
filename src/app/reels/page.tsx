'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Film,
  Flag,
  Heart,
  MessageSquare,
  Play,
  Plus,
  Repeat,
  Send,
  Share2,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  CreatorStudioModal,
  type CreatorStudioUserSummary,
} from '@/components/feed/CreatorStudioModal';
import type { FeedPostRecord } from '@/lib/api/feed.api';
import { deriveVideoPoster, withVideoPreviewFragment } from '@/lib/utils/mediaThumbnail';
import { formatCompactCount } from '@/lib/utils/formatCount';
import { markReelsSeenNow } from '@/hooks/useNavBadges';

interface ReelComment {
  _id: string;
  id?: string;
  text: string;
  createdAt?: string;
  author?: {
    _id?: string;
    displayName?: string;
    fullName?: string;
    username?: string;
    avatar?: string;
  } | string;
}

interface ReelItem {
  _id: string;
  body: string;
  thumbnailUrl?: string | null;
  media?: Array<{ type: string; url: string; thumbnailUrl?: string }>;
  tags?: string[];
  likes?: string[];
  bookmarks?: string[];
  comments?: ReelComment[];
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  author?: { _id?: string; displayName?: string; fullName?: string; username?: string; avatar?: string } | string;
  createdAt?: string;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingMoreRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const userMutedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<CreatorStudioUserSummary | undefined>(undefined);
  const [studioOpen, setStudioOpen] = useState(false);

  const touchStartYRef = useRef<number | null>(null);
  const lastWheelAtRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isVideoPost = (p: ReelItem & { kind?: string }) =>
    p.kind === 'reel' || (Array.isArray(p.media) && p.media.some((m) => m.type === 'video' && m.url));

  const getReelVideoMedia = (r: ReelItem | null | undefined) =>
    r?.media?.find((m) => m.type === 'video' && m.url) ?? r?.media?.[0];

  const loadReels = useCallback(async () => {
    setLoading(true);
    // Load user metadata in the background so it never delays the first reel frame
    void Promise.all([
      apiClient.get('/users/me').catch(() => null),
      apiClient.get('/profiles/me').catch(() => null),
    ]).then(([meRes, profileRes]) => {
      const me = meRes?.data?.user ?? meRes?.data ?? null;
      const profile = profileRes?.data?.profile ?? profileRes?.data ?? null;
      const resolvedId = String(me?._id || me?.id || profile?.userId || '');
      if (resolvedId) setCurrentUserId(resolvedId);
      if (me || profile) {
        setCurrentUser({
          id: resolvedId || undefined,
          displayName: me?.displayName || profile?.displayName || me?.fullName || me?.username,
          username: me?.username || profile?.username,
          avatar: me?.avatar || profile?.avatar,
        });
      }
    });

    try {
      // Fetch both dedicated reels and all video posts so every single reel/video is shown
      const [reelsRes, allRes] = await Promise.all([
        apiClient.get('/feed/posts?kind=reel&limit=50&page=1').catch(() => null),
        apiClient.get('/feed/posts?limit=50&page=1').catch(() => null),
      ]);
      const reelPosts: ReelItem[] = Array.isArray(reelsRes?.data?.posts) ? reelsRes.data.posts : [];
      const allPosts: ReelItem[] = Array.isArray(allRes?.data?.posts) ? allRes.data.posts : [];

      const seen = new Set<string>();
      const combined: ReelItem[] = [];
      for (const item of [...reelPosts, ...allPosts]) {
        if (!item?._id || seen.has(item._id)) continue;
        if (!isVideoPost(item as ReelItem & { kind?: string })) continue;
        seen.add(item._id);
        combined.push(item);
      }

      const targetId =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('id')?.trim() || ''
          : '';
      let ordered = combined;
      if (targetId) {
        const hit = combined.find((r) => r._id === targetId);
        if (hit) {
          ordered = [hit, ...combined.filter((r) => r._id !== targetId)];
        } else {
          const singleRes = await apiClient
            .get(`/feed/public/posts/${encodeURIComponent(targetId)}`)
            .catch(() => null);
          const singlePost = singleRes?.data?.post as ReelItem | undefined;
          if (singlePost && singlePost._id) {
            ordered = [singlePost, ...combined.filter((r) => r._id !== singlePost._id)];
          }
        }
      }
      setReels(ordered);
      setActiveIndex(0);
      setPage(1);
      setHasMore(allPosts.length >= 50 || reelPosts.length >= 50);
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to load reels.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    markReelsSeenNow();
    void loadReels();
  }, [loadReels]);

  // Silently load additional pages when scrolling close to the end
  useEffect(() => {
    if (!hasMore || loading || loadingMoreRef.current || reels.length === 0) return;
    if (activeIndex < reels.length - 4) return;
    loadingMoreRef.current = true;
    const nextPage = page + 1;
    void apiClient
      .get(`/feed/posts?limit=50&page=${nextPage}`)
      .then((res) => {
        const batch: ReelItem[] = Array.isArray(res.data?.posts) ? res.data.posts : [];
        if (batch.length < 50) setHasMore(false);
        const videoBatch = batch.filter((p) => isVideoPost(p as ReelItem & { kind?: string }));
        if (videoBatch.length > 0) {
          setReels((prev) => {
            const existing = new Set(prev.map((r) => r._id));
            const fresh = videoBatch.filter((r) => r._id && !existing.has(r._id));
            return fresh.length > 0 ? [...prev, ...fresh] : prev;
          });
        }
        setPage(nextPage);
      })
      .catch(() => setHasMore(false))
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [activeIndex, reels.length, hasMore, loading, page]);

  // Synchronously swap source & play on the SAME persistent <video> element inside user gestures
  // so mobile Safari & Chrome never re-mute or pause on scroll/swipe!
  const switchToReel = useCallback(
    (targetIdx: number) => {
      if (reels.length === 0) return;
      const clamped = Math.max(0, Math.min(reels.length - 1, targetIdx));
      if (clamped === activeIndex) return;
      setActiveIndex(clamped);
      setPaused(false);

      const nextReel = reels[clamped];
      const nextMedia = getReelVideoMedia(nextReel);
      const nextRawUrl = nextMedia?.url || '';
      const el = videoRef.current;
      if (el && nextRawUrl) {
        const nextPoster = deriveVideoPoster(nextRawUrl, nextMedia?.thumbnailUrl || nextReel?.thumbnailUrl);
        const nextSrc = withVideoPreviewFragment(nextRawUrl, nextPoster);
        el.src = nextSrc;
        if (nextPoster) el.poster = nextPoster;
        el.currentTime = 0;
        el.muted = userMutedRef.current;
        setMuted(userMutedRef.current);
        el.load();
        void el.play().catch(() => {
          el.muted = true;
          setMuted(true);
          void el.play().catch(() => {});
        });
      }
    },
    [reels, activeIndex],
  );

  const goNext = useCallback(() => {
    switchToReel(activeIndex + 1);
  }, [switchToReel, activeIndex]);

  const goPrev = useCallback(() => {
    switchToReel(activeIndex - 1);
  }, [switchToReel, activeIndex]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (showComments) return;
      const now = Date.now();
      if (now - lastWheelAtRef.current < 450) return;
      if (Math.abs(e.deltaY) < 28) return;
      lastWheelAtRef.current = now;
      if (e.deltaY > 0) goNext();
      else goPrev();
    },
    [goNext, goPrev, showComments],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const activeReel = reels[activeIndex] ?? null;

  // Auto-play the initial reel on first load (subsequent swipes play synchronously inside switchToReel)
  const initializedVideoRef = useRef<string>('');
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !activeReel?._id) return;
    if (initializedVideoRef.current === activeReel._id) return;
    initializedVideoRef.current = activeReel._id;
    setPaused(false);
    el.muted = userMutedRef.current;
    setMuted(userMutedRef.current);
    const attemptPlay = async () => {
      try {
        await el.play();
      } catch {
        el.muted = true;
        setMuted(true);
        await el.play().catch(() => {});
      }
    };
    void attemptPlay();
  }, [activeReel?._id]);

  const handleToggleMute = () => {
    const next = !muted;
    userMutedRef.current = next;
    setMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
      if (!next && videoRef.current.paused) {
        void videoRef.current.play().catch(() => {});
        setPaused(false);
      }
    }
  };

  const togglePlayPause = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => {});
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  };

  const handleVideoEnded = useCallback(() => {
    if (!autoAdvance || reels.length <= 1) return;
    const nextIdx = activeIndex + 1 < reels.length ? activeIndex + 1 : 0;
    switchToReel(nextIdx);
  }, [autoAdvance, reels.length, activeIndex, switchToReel]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const delta = touchStartYRef.current - endY;
    touchStartYRef.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) goNext();
    else goPrev();
  };

  const handleLike = async (reelId: string) => {
    try {
      const res = await apiClient.post(`/feed/posts/${reelId}/like`);
      const liked = Boolean(res.data?.liked);
      const serverLikes: string[] | null = Array.isArray(res.data?.likes)
        ? res.data.likes.map((id: unknown) => String(id))
        : null;
      setReels((prev) =>
        prev.map((r) => {
          if (r._id !== reelId) return r;
          const existing = r.likes ?? [];
          const nextLikes =
            serverLikes ??
            (liked
              ? [...new Set([...existing, currentUserId || 'me'])]
              : existing.filter((id) => id !== currentUserId && id !== 'me'));
          return {
            ...r,
            likes: nextLikes,
            likesCount:
              typeof res.data?.likesCount === 'number' ? res.data.likesCount : nextLikes.length,
            isLiked: liked,
          };
        }),
      );
    } catch {
      toast.error('Sign in to like reels.');
    }
  };

  const handleSave = async (reelId: string) => {
    try {
      const res = await apiClient.post(`/feed/posts/${reelId}/bookmark`);
      const bookmarked = Boolean(res.data?.bookmarked);
      const serverBookmarks: string[] | null = Array.isArray(res.data?.bookmarks)
        ? res.data.bookmarks.map((id: unknown) => String(id))
        : null;
      setReels((prev) =>
        prev.map((r) => {
          if (r._id !== reelId) return r;
          const existing = r.bookmarks ?? [];
          const nextBookmarks =
            serverBookmarks ??
            (bookmarked
              ? [...new Set([...existing, currentUserId || 'me'])]
              : existing.filter((id) => id !== currentUserId && id !== 'me'));
          return { ...r, bookmarks: nextBookmarks, isBookmarked: bookmarked };
        }),
      );
      toast.success(bookmarked ? 'Saved to bookmarks.' : 'Removed from bookmarks.');
    } catch {
      toast.error('Unable to save reel.');
    }
  };

  const handleShare = async (reel: ReelItem) => {
    if (typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/post/${encodeURIComponent(reel._id)}`;
    const shareData = {
      title: 'HyperBuds Reel',
      text: reel.body?.slice(0, 120) || 'Watch this reel on HyperBuds',
      url: shareUrl,
    };
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Shareable reel link copied! Anyone can open it and join HyperBuds.');
        return;
      }
    } catch {
      // Fallback below
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Shareable reel link copied!');
    } catch {
      toast.error('Unable to copy link.');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReel || !commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await apiClient.post(`/feed/posts/${activeReel._id}/comments`, {
        text: commentText.trim(),
      });
      const raw = res.data?.comment;
      const created: ReelComment = raw
        ? {
            _id: String(raw._id || raw.id || `c-${Date.now()}`),
            text: String(raw.text ?? commentText.trim()),
            createdAt: String(raw.createdAt ?? new Date().toISOString()),
            author: raw.author ?? {
              _id: currentUserId || undefined,
              displayName: currentUser?.displayName || currentUser?.username || 'You',
              username: currentUser?.username,
            },
          }
        : {
            _id: `c-${Date.now()}`,
            text: commentText.trim(),
            createdAt: new Date().toISOString(),
            author: {
              displayName: currentUser?.displayName || currentUser?.username || 'You',
              username: currentUser?.username,
            },
          };
      setReels((prev) =>
        prev.map((r) =>
          r._id === activeReel._id
            ? {
                ...r,
                comments: [...(r.comments ?? []), created],
                commentsCount:
                  typeof res.data?.commentsCount === 'number'
                    ? res.data.commentsCount
                    : (r.comments ?? []).length + 1,
              }
            : r,
        ),
      );
      setCommentText('');
    } catch {
      toast.error('Unable to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReport = async (reelId: string) => {
    try {
      await apiClient.post(`/feed/posts/${reelId}/report`, {
        reason: 'inappropriate',
        details: 'Reported from Reels player',
      });
      toast.success('Reel reported for moderation review.');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to report reel.');
    }
  };

  const handleReelCreated = (reel: FeedPostRecord) => {
    setReels((prev) => [reel as unknown as ReelItem, ...prev]);
    setActiveIndex(0);
    setBanner({ type: 'success', text: 'Reel published and ready to watch.' });
  };

  const activeAuthorObj =
    activeReel && typeof activeReel.author === 'object' && activeReel.author
      ? activeReel.author
      : null;
  const activeAuthorName =
    activeAuthorObj?.displayName ||
    activeAuthorObj?.fullName ||
    activeAuthorObj?.username ||
    'Creator';
  const activeAuthorUsername = activeAuthorObj?.username || '';
  const activeMedia = getReelVideoMedia(activeReel);
  const activeMediaUrl = activeMedia?.url || '';
  const activePoster = activeMediaUrl
    ? deriveVideoPoster(activeMediaUrl, activeMedia?.thumbnailUrl || activeReel?.thumbnailUrl)
    : undefined;

  const isActiveLiked = Boolean(
    activeReel &&
      (activeReel.isLiked ||
        (activeReel.likes ?? []).some((id) => id === currentUserId || id === 'me')),
  );
  const isActiveSaved = Boolean(
    activeReel &&
      (activeReel.isBookmarked ||
        (activeReel.bookmarks ?? []).some((id) => id === currentUserId || id === 'me')),
  );
  const likeCount = activeReel
    ? Math.max((activeReel.likes ?? []).length, activeReel.likesCount ?? 0)
    : 0;
  const commentCount = activeReel
    ? Math.max((activeReel.comments ?? []).length, activeReel.commentsCount ?? 0)
    : 0;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-black lg:bg-[#fafafa] dark:lg:bg-slate-950">
        <div className="mx-auto max-w-5xl px-0 py-0 pb-0 lg:px-8 lg:py-6 lg:pb-20">
          {/* Desktop Header (mobile uses sleek floating overlay directly over full-bleed reel) */}
          <div className="hidden flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5 dark:border-slate-800 lg:flex">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Vertical Video
              </p>
              <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                Reels
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoAdvance((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  autoAdvance
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                }`}
                title="Automatically advance to next reel when video ends"
              >
                {autoAdvance ? <SkipForward className="h-3.5 w-3.5" /> : <Repeat className="h-3.5 w-3.5" />}
                <span>{autoAdvance ? 'Auto-scroll' : 'Loop'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Upload Reel
              </button>
            </div>
          </div>

          {banner && (
            <div
              className={`mx-3 mt-3 flex items-center justify-between rounded-lg border px-4 py-2.5 text-xs lg:mx-0 lg:mt-4 ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button type="button" onClick={() => setBanner(null)} className="ml-3 underline">
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center lg:mt-6">
              <div className="h-[calc(100dvh-56px)] w-full animate-pulse bg-slate-900 lg:h-[660px] lg:max-w-[372px] lg:rounded-2xl lg:bg-slate-200 dark:lg:bg-slate-800" />
            </div>
          ) : !activeReel ? (
            <div className="mx-4 mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900 lg:mx-0">
              <Film className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                No reels published yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Upload a short vertical video to start the Reels feed.
              </p>
              <button
                type="button"
                onClick={() => setStudioOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <Plus className="h-3.5 w-3.5" />
                Upload First Reel
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 lg:mt-5 lg:flex-row lg:items-start">
              {/* Reel Player + Desktop External Rail */}
              <div className="flex w-full justify-center lg:w-auto lg:items-end lg:gap-4">
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  className="relative flex h-[calc(100dvh-56px)] w-full items-center justify-center overflow-hidden bg-black lg:h-[660px] lg:w-[372px] lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-lg dark:lg:border-slate-800"
                >
                  {activeMediaUrl ? (
                    <video
                      ref={videoRef}
                      src={withVideoPreviewFragment(activeMediaUrl, activePoster)}
                      poster={activePoster}
                      autoPlay
                      loop={!autoAdvance || reels.length <= 1}
                      muted={muted}
                      playsInline
                      preload="auto"
                      onClick={togglePlayPause}
                      onEnded={handleVideoEnded}
                      className="h-full w-full cursor-pointer bg-black object-cover lg:object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-white">
                      {activeReel.body}
                    </div>
                  )}

                  {/* Subtle centered Play indicator only when paused */}
                  {paused && (
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      aria-label="Resume reel"
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/30 backdrop-blur-sm">
                        <Play className="ml-1 h-7 w-7 fill-current" />
                      </span>
                    </button>
                  )}

                  {/* Top overlay controls: counter + mobile upload + mute */}
                  <div className="pointer-events-none absolute top-3 right-3 left-3 z-20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-tight text-white drop-shadow lg:hidden">
                        Reels
                      </span>
                      <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md tabular-nums">
                        {activeIndex + 1} / {reels.length}
                      </span>
                    </div>
                    <div className="pointer-events-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStudioOpen(true)}
                        className="inline-flex h-9 items-center gap-1 rounded-full bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-black/75 lg:hidden"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75"
                        aria-label={muted ? 'Unmute' : 'Mute'}
                      >
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Facebook-Reels-style right-edge action overlay directly ON the video */}
                  <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-3.5 lg:hidden">
                    <button
                      type="button"
                      onClick={() => handleLike(activeReel._id)}
                      className="flex flex-col items-center gap-1 text-white drop-shadow"
                      aria-label="Like reel"
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition ${
                          isActiveLiked
                            ? 'bg-rose-600/90 text-white'
                            : 'bg-black/45 text-white active:scale-95'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isActiveLiked ? 'fill-current' : ''}`} />
                      </span>
                      <span className="text-[11px] font-semibold tabular-nums">{formatCompactCount(likeCount)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowComments((v) => !v)}
                      className="flex flex-col items-center gap-1 text-white drop-shadow"
                      aria-label="Open comments"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md active:scale-95">
                        <MessageSquare className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-semibold tabular-nums">{formatCompactCount(commentCount)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(activeReel)}
                      className="flex flex-col items-center gap-1 text-white drop-shadow"
                      aria-label="Share reel"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md active:scale-95">
                        <Share2 className="h-5 w-5" />
                      </span>
                      <span className="text-[11px] font-semibold">Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave(activeReel._id)}
                      className="flex flex-col items-center gap-1 text-white drop-shadow"
                      aria-label="Save reel"
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition ${
                          isActiveSaved
                            ? 'bg-amber-500/90 text-white'
                            : 'bg-black/45 text-white active:scale-95'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${isActiveSaved ? 'fill-current' : ''}`} />
                      </span>
                      <span className="text-[11px] font-semibold">Save</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReport(activeReel._id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-md"
                      aria-label="Report reel"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Bottom-left Author & Caption Overlay (padded right on mobile to clear overlay buttons) */}
                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 bg-linear-to-t from-black/85 via-black/40 to-transparent px-4 pt-12 pb-14 pr-18 text-white lg:pb-12 lg:pr-4">
                    {activeAuthorUsername ? (
                      <Link
                        href={`/profile/${encodeURIComponent(activeAuthorUsername)}`}
                        className="pointer-events-auto inline-flex items-center gap-2 text-xs font-semibold hover:underline"
                      >
                        <span>{activeAuthorName}</span>
                        <span className="font-normal text-white/75">@{activeAuthorUsername}</span>
                      </Link>
                    ) : (
                      <p className="text-xs font-semibold">{activeAuthorName}</p>
                    )}
                    {activeReel.body && (
                      <p className="mt-1 line-clamp-3 text-xs text-white/90">{activeReel.body}</p>
                    )}
                    {Array.isArray(activeReel.tags) && activeReel.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {activeReel.tags.slice(0, 4).map((t) => (
                          <span key={t} className="text-[11px] font-medium text-white/80">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Side Action Rail */}
                <div className="hidden flex-col items-center gap-3 pb-3 lg:flex">
                  <button
                    type="button"
                    onClick={() => handleLike(activeReel._id)}
                    className={`flex h-11 w-11 flex-col items-center justify-center rounded-full border transition ${
                      isActiveLiked
                        ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                    aria-label="Like reel"
                  >
                    <Heart className={`h-4 w-4 ${isActiveLiked ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-semibold tabular-nums">{likeCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowComments((v) => !v)}
                    className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    aria-label="Toggle comments"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-[10px] font-semibold tabular-nums">{commentCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(activeReel)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    aria-label="Share reel"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave(activeReel._id)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      isActiveSaved
                        ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                    aria-label="Save reel"
                  >
                    <Bookmark className={`h-4 w-4 ${isActiveSaved ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReport(activeReel._id)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                    aria-label="Report reel"
                  >
                    <Flag className="h-4 w-4" />
                  </button>

                  <div className="my-1 h-px w-6 bg-slate-200 dark:bg-slate-800" />

                  <button
                    type="button"
                    disabled={activeIndex === 0}
                    onClick={goPrev}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    aria-label="Previous reel"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex >= reels.length - 1}
                    onClick={goNext}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    aria-label="Next reel"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hidden next-reel preloader for instant 0ms swipe transitions */}
              {(() => {
                const nextReel = reels[activeIndex + 1];
                const nextUrl = getReelVideoMedia(nextReel)?.url;
                if (!nextUrl) return null;
                return (
                  <video
                    key={`preload-${nextReel._id}`}
                    src={withVideoPreviewFragment(nextUrl)}
                    preload="auto"
                    muted
                    playsInline
                    aria-hidden="true"
                    className="hidden"
                  />
                );
              })()}

              {/* Comments Drawer / Side Panel */}
              {showComments && (
                <div className="w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:w-84">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Comments ({commentCount})
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowComments(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                      aria-label="Close comments"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 max-h-80 space-y-2.5 overflow-y-auto pr-1">
                    {(activeReel.comments ?? []).length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-500">
                        No comments yet. Start the conversation.
                      </p>
                    ) : (
                      (activeReel.comments ?? []).map((c) => {
                        const authorLabel =
                          typeof c.author === 'object' && c.author
                            ? c.author.displayName || c.author.fullName || c.author.username || 'Creator'
                            : 'Creator';
                        return (
                          <div
                            key={c._id || c.id}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/70"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">{authorLabel}</p>
                            <p className="mt-0.5 text-slate-700 dark:text-slate-200">{c.text}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form onSubmit={handleComment} className="mt-3 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                      aria-label="Send comment"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreatorStudioModal
        open={studioOpen}
        onOpenChange={setStudioOpen}
        initialMode="reel"
        autoFocusUpload
        currentUser={currentUser}
        onReelCreated={handleReelCreated}
      />
    </DashboardLayout>
  );
}
