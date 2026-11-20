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
  const [muted, setMuted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<CreatorStudioUserSummary | undefined>(undefined);
  const [studioOpen, setStudioOpen] = useState(false);

  const touchStartYRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadReels = useCallback(async () => {
    setLoading(true);
    try {
      const [res, meRes, profileRes] = await Promise.all([
        apiClient.get('/feed/posts?kind=reel&limit=30'),
        apiClient.get('/users/me').catch(() => null),
        apiClient.get('/profiles/me').catch(() => null),
      ]);
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
      const list: ReelItem[] = Array.isArray(res.data?.posts) ? res.data.posts : [];
      setReels(list);
      setActiveIndex(0);
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
    void loadReels();
  }, [loadReels]);

  const goNext = useCallback(() => {
    setActiveIndex((idx) => (reels.length > 0 ? Math.min(reels.length - 1, idx + 1) : 0));
  }, [reels.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((idx) => Math.max(0, idx - 1));
  }, []);

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

  const handleVideoEnded = useCallback(() => {
    if (!autoAdvance || reels.length <= 1) return;
    setActiveIndex((idx) => (idx + 1 < reels.length ? idx + 1 : 0));
  }, [autoAdvance, reels.length]);

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
    const shareUrl = `${window.location.origin}/reels?id=${encodeURIComponent(reel._id)}`;
    const shareData = {
      title: 'HyperBuds Reel',
      text: reel.body?.slice(0, 120) || 'Watch this reel on HyperBuds',
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Reel link copied to clipboard.');
      }
    } catch {
      await navigator.clipboard?.writeText(shareUrl).catch(() => {});
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
    setBanner({ type: 'success', text: 'Reel uploaded to Cloudinary and ready to watch.' });
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
  const activeMedia = activeReel?.media?.[0];
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
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-3 py-4 pb-20 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5 dark:border-slate-800">
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
              className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-xs ${
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
            <div className="mt-6 flex justify-center">
              <div className="h-[calc(100dvh-180px)] max-h-[660px] w-full max-w-[390px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : !activeReel ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <Film className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                No reels published yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Upload a video directly to Cloudinary to start the Reels feed.
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
            <div className="mt-5 flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-start">
              {/* Reel Player + Desktop External Rail */}
              <div className="flex w-full justify-center lg:w-auto lg:items-end lg:gap-4">
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative flex h-[calc(100dvh-165px)] min-h-[500px] max-h-[700px] w-full max-w-[400px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-lg dark:border-slate-800 lg:h-[660px] lg:w-[372px]"
                >
                  {activeMediaUrl ? (
                    <video
                      ref={videoRef}
                      key={activeReel._id}
                      src={withVideoPreviewFragment(activeMediaUrl, activePoster)}
                      poster={activePoster}
                      autoPlay
                      loop={!autoAdvance || reels.length <= 1}
                      muted={muted}
                      playsInline
                      preload="metadata"
                      controls
                      onEnded={handleVideoEnded}
                      className="h-full w-full object-contain bg-black"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-white">
                      {activeReel.body}
                    </div>
                  )}

                  {/* Top overlay controls: counter + mute */}
                  <div className="pointer-events-none absolute top-3 right-3 left-3 z-20 flex items-center justify-between">
                    <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md tabular-nums">
                      {activeIndex + 1} / {reels.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMuted((m) => !m)}
                      className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75"
                      aria-label={muted ? 'Unmute' : 'Mute'}
                    >
                      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
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
                      <span className="text-[11px] font-semibold tabular-nums">{likeCount}</span>
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
                      <span className="text-[11px] font-semibold tabular-nums">{commentCount}</span>
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

              {/* Mobile Prev / Next Quick Bar */}
              {reels.length > 1 && (
                <div className="flex w-full max-w-[400px] items-center justify-between gap-2 lg:hidden">
                  <button
                    type="button"
                    disabled={activeIndex === 0}
                    onClick={goPrev}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ChevronUp className="h-4 w-4" /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex >= reels.length - 1}
                    onClick={goNext}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Next <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}

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
