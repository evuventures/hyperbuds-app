'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import { CreatorStudioModal } from '@/components/feed/CreatorStudioModal';
import apiClient from '@/lib/api/client';
import type { FeedPostRecord } from '@/lib/api/feed.api';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  MessageSquare,
  Plus,
  Send,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ReelItem {
  _id: string;
  author?: { _id?: string; fullName?: string; username?: string } | string;
  body: string;
  media?: Array<{ type: 'image' | 'video'; url: string }>;
  tags?: string[];
  likes?: string[];
  bookmarks?: string[];
  comments?: Array<{
    _id: string;
    author?: { fullName?: string; username?: string } | string;
    text: string;
  }>;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const loadReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/feed/posts?kind=reel&limit=20');
      setReels(Array.isArray(res.data?.posts) ? res.data.posts : []);
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
    loadReels();
  }, [loadReels]);

  const activeReel = reels[activeIndex] ?? null;

  const handleReelCreated = (post: FeedPostRecord) => {
    setReels((prev) => [post as ReelItem, ...prev]);
    setActiveIndex(0);
    setBanner({ type: 'success', text: 'Reel uploaded to Cloudinary and published.' });
  };

  const handleLike = async () => {
    if (!activeReel) return;
    try {
      const res = await apiClient.post(`/feed/posts/${activeReel._id}/like`);
      const liked = Boolean(res.data?.liked);
      setReels((prev) =>
        prev.map((r) => {
          if (r._id !== activeReel._id) return r;
          const likes = r.likes ?? [];
          return {
            ...r,
            likes: liked ? [...new Set([...likes, 'me'])] : likes.filter((id) => id !== 'me'),
          };
        }),
      );
    } catch {
      setBanner({ type: 'error', text: 'Unable to update reaction.' });
    }
  };

  const handleSave = async () => {
    if (!activeReel) return;
    try {
      await apiClient.post(`/feed/posts/${activeReel._id}/bookmark`);
      setBanner({ type: 'success', text: 'Updated saved reels.' });
    } catch {
      setBanner({ type: 'error', text: 'Unable to save reel.' });
    }
  };

  const handleComment = async () => {
    if (!activeReel || !commentText.trim()) return;
    try {
      const res = await apiClient.post(`/feed/posts/${activeReel._id}/comments`, {
        text: commentText.trim(),
      });
      const created = res.data?.comment ?? {
        _id: `c-${Date.now()}`,
        text: commentText.trim(),
      };
      setReels((prev) =>
        prev.map((r) =>
          r._id === activeReel._id
            ? { ...r, comments: [...(r.comments ?? []), created] }
            : r,
        ),
      );
      setCommentText('');
    } catch {
      setBanner({ type: 'error', text: 'Unable to post comment.' });
    }
  };

  const handleReport = async () => {
    if (!activeReel) return;
    try {
      await apiClient.post(`/feed/posts/${activeReel._id}/report`, {
        reason: 'inappropriate',
      });
      setBanner({ type: 'success', text: 'Reel reported for moderation review.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to report reel.',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Link
                href="/feed"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Feed
              </Link>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Reels
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setShowComposer((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <Plus className="h-3.5 w-3.5" />
              {showComposer ? 'Close' : 'New Reel'}
            </button>
          </div>

          {banner && (
            <div
              role="status"
              className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="ml-4 text-xs font-medium underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <CreatorStudioModal
            open={showComposer}
            onOpenChange={setShowComposer}
            initialMode="reel"
            onReelCreated={handleReelCreated}
          />

          {loading ? (
            <div className="mx-auto mt-8 h-[560px] max-w-sm animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ) : !activeReel ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No reels published yet. Click <strong>New Reel</strong> to add the first clip.
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center gap-6 lg:flex-row lg:items-start">
              {/* Vertical 9:16 Reel Player */}
              <div className="flex items-end gap-3">
                <div className="relative aspect-[9/16] w-[300px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 sm:w-[340px]">
                  <video
                    key={activeReel._id}
                    src={activeReel.media?.[0]?.url}
                    controls
                    playsInline
                    muted={muted}
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => setMuted((m) => !m)}
                    aria-label={muted ? 'Unmute reel' : 'Mute reel'}
                    className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
                    <p className="text-xs font-semibold">
                      @{typeof activeReel.author === 'object' ? activeReel.author?.username || 'creator' : 'creator'}
                    </p>
                    {activeReel.body && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-200">{activeReel.body}</p>
                    )}
                  </div>
                </div>

                {/* Right-rail Controls */}
                <div className="flex flex-col items-center gap-3 pb-2">
                  <button
                    type="button"
                    disabled={activeIndex <= 0}
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    aria-label="Previous reel"
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex >= reels.length - 1}
                    onClick={() => setActiveIndex((i) => Math.min(reels.length - 1, i + 1))}
                    aria-label="Next reel"
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLike}
                    aria-label="Like reel"
                    className="flex flex-col items-center gap-0.5 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <span className="rounded-full border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                      <Heart className="h-4 w-4" />
                    </span>
                    <span className="tabular-nums">{activeReel.likes?.length ?? 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComments((v) => !v)}
                    aria-label="Toggle reel comments"
                    className="flex flex-col items-center gap-0.5 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <span className="rounded-full border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <span className="tabular-nums">{activeReel.comments?.length ?? 0}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    aria-label="Save reel"
                    className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReport}
                    aria-label="Report reel"
                    className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Side Comments Panel */}
              {showComments && (
                <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
                    Comments ({activeReel.comments?.length ?? 0})
                  </h2>
                  <div className="my-3 max-h-72 space-y-2 overflow-y-auto">
                    {(activeReel.comments ?? []).length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No comments yet.
                      </p>
                    ) : (
                      (activeReel.comments ?? []).map((c) => (
                        <div
                          key={c._id}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {typeof c.author === 'object'
                              ? c.author?.fullName || c.author?.username || 'Creator'
                              : 'Creator'}
                            :{' '}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      aria-label="Add reel comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleComment}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-slate-900"
                    >
                      <Send className="h-3 w-3" />
                      Post
                    </button>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
