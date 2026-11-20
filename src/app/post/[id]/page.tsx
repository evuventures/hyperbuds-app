'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Copy,
  Film,
  Heart,
  MessageSquare,
  Repeat2,
  Share2,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/endpoints';
import { deriveVideoPoster, withVideoPreviewFragment } from '@/lib/utils/mediaThumbnail';

interface PublicAuthor {
  _id?: string;
  id?: string;
  displayName?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
}

interface PublicMedia {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
}

interface PublicPost {
  _id: string;
  id?: string;
  kind: 'post' | 'reel' | 'match' | 'repost' | string;
  body: string;
  thumbnailUrl?: string | null;
  media?: PublicMedia[];
  tags?: string[];
  likesCount?: number;
  commentsCount?: number;
  repostsCount?: number;
  repostThought?: string;
  repostedPost?: PublicPost | null;
  matchCard?: {
    compatibilityScore?: number | null;
    userA: PublicAuthor;
    userB: PublicAuthor;
  } | null;
  createdAt?: string;
  author?: PublicAuthor;
}

function getInitials(name?: string) {
  if (!name) return 'HB';
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return 'Just now';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Just now';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function copyTextReliable(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to execCommand below
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.top = '-9999px';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export default function PublicSharedPostPage() {
  const params = useParams<{ id: string }>();
  const postId = params?.id;

  const [post, setPost] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setIsSignedIn(Boolean(window.localStorage.getItem('accessToken')));
    } catch {
      setIsSignedIn(false);
    }
  }, []);

  useEffect(() => {
    if (!postId) return;
    let active = true;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`${API_BASE_URL}/feed/public/posts/${encodeURIComponent(postId)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          if (active) setNotFound(true);
          return;
        }
        const data = (await res.json()) as { post?: PublicPost };
        if (active) {
          if (data?.post) setPost(data.post);
          else setNotFound(true);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [postId]);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const ok = await copyTextReliable(window.location.href);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const authorName =
    post?.author?.displayName || post?.author?.fullName || post?.author?.username || 'HyperBuds Creator';
  const signupUrl = `/auth/signup?redirect=${encodeURIComponent(`/post/${postId || ''}`)}`;
  const signinUrl = `/auth/signin?redirect=${encodeURIComponent(`/post/${postId || ''}`)}`;

  const renderMedia = (media?: PublicMedia[], fallbackThumb?: string | null) => {
    if (!Array.isArray(media) || media.length === 0) return null;
    return (
      <div className="mt-3 space-y-2 overflow-hidden rounded-xl">
        {media.map((m, idx) => {
          if (m.type === 'video') {
            const poster = deriveVideoPoster(m.url, m.thumbnailUrl || fallbackThumb);
            return (
              <div
                key={`pm-${idx}`}
                className="flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-800"
              >
                <video
                  src={withVideoPreviewFragment(m.url, poster)}
                  poster={poster}
                  controls
                  playsInline
                  preload="metadata"
                  className="mx-auto block h-auto max-h-[580px] w-full object-contain"
                />
              </div>
            );
          }
          return (
            <div
              key={`pm-${idx}`}
              className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt="Shared post media"
                className="mx-auto block h-auto max-h-[640px] w-full object-contain"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Top Public Brand Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <Link href={isSignedIn ? '/feed' : '/'} className="flex items-center gap-2.5">
            <Image
              src="/android-chrome-192x192.png"
              alt="HyperBuds"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-base font-black tracking-tight text-purple-800 dark:text-purple-300">
              HyperBuds
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <Link
                href={`/feed#${postId || ''}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-800"
              >
                Open in Feed
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href={signinUrl}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  href={signupUrl}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-purple-800"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 pb-20">
        {loading ? (
          <div className="h-80 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ) : notFound || !post ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-base font-bold text-slate-900 dark:text-white">
              This post is unavailable or private
            </p>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              The creator may have removed it or changed its visibility. Join HyperBuds to explore live creator feeds, reels, and matches.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href={signupUrl}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-800"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Create Free Account
              </Link>
              <Link
                href={signinUrl}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {post.kind === 'repost' && post.repostedPost ? (
                <>
                  <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
                      <Repeat2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{authorName}</span>
                    <span>reposted · {formatDate(post.createdAt)}</span>
                  </div>
                  {(post.repostThought || post.body) && (
                    <p className="mb-3 rounded-2xl bg-purple-50/80 px-3.5 py-2 text-sm text-slate-800 dark:bg-purple-950/40 dark:text-purple-100">
                      {post.repostThought || post.body}
                    </p>
                  )}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex items-center gap-2.5">
                      {post.repostedPost.author?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.repostedPost.author.avatar}
                          alt={post.repostedPost.author.displayName || 'Creator'}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                          {getInitials(post.repostedPost.author?.displayName || 'Creator')}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {post.repostedPost.author?.displayName ||
                            post.repostedPost.author?.username ||
                            'Creator'}
                        </p>
                        <p className="text-[11px] text-slate-500">{formatDate(post.repostedPost.createdAt)}</p>
                      </div>
                    </div>
                    {post.repostedPost.body && (
                      <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                        {post.repostedPost.body}
                      </p>
                    )}
                    {renderMedia(post.repostedPost.media, post.repostedPost.thumbnailUrl)}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {post.author?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.author.avatar}
                          alt={authorName}
                          className="h-11 w-11 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-700 text-xs font-bold text-white">
                          {getInitials(authorName)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{authorName}</p>
                          {post.kind === 'reel' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800">
                              <Film className="h-3 w-3" />
                              Reel
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleCopyLink()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Link copied' : 'Copy link'}
                    </button>
                  </div>

                  {post.kind === 'match' && post.matchCard ? (
                    <div className="mt-4 rounded-2xl border border-purple-200 bg-gradient-to-b from-[#F5EEFF] via-[#FDFBFF] to-[#ECE0FF] p-6 text-center">
                      <p className="text-xs font-black tracking-[0.2em] text-purple-700">HYPERBUDS MATCH</p>
                      <h1 className="mt-2 text-3xl font-black text-[#490AA8]">IT&apos;S A MATCH!</h1>
                      <p className="mt-1.5 text-sm font-semibold text-[#311263]">
                        {post.matchCard.userA.displayName || 'Creator'} &amp;{' '}
                        {post.matchCard.userB.displayName || 'Creator'} matched 💜
                      </p>
                      {typeof post.matchCard.compatibilityScore === 'number' && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800">
                          <Sparkles className="h-3 w-3" />
                          {post.matchCard.compatibilityScore}% Creator Match
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      {post.body && (
                        <p className="mt-3.5 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">
                          {post.body}
                        </p>
                      )}
                      {renderMedia(post.media, post.thumbnailUrl)}
                    </>
                  )}
                </>
              )}

              {/* Read-only Engagement Stats Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <strong className="tabular-nums text-slate-700 dark:text-slate-200">
                      {post.likesCount ?? 0}
                    </strong>{' '}
                    likes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <strong className="tabular-nums text-slate-700 dark:text-slate-200">
                      {post.commentsCount ?? 0}
                    </strong>{' '}
                    comments
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 className="h-4 w-4" />
                    <strong className="tabular-nums text-slate-700 dark:text-slate-200">
                      {post.repostsCount ?? 0}
                    </strong>{' '}
                    reposts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:underline dark:text-purple-400"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
              </div>
            </article>

            {/* Registration / Login Conversion Banner for Non-Users */}
            {!isSignedIn && (
              <div className="rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 p-6 text-white shadow-lg">
                <h2 className="text-lg font-extrabold tracking-tight">
                  Like, comment, and collaborate on HyperBuds
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-purple-100 sm:text-sm">
                  Create your free creator account to follow {authorName}, repost content, match with collaborators, and go live.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <Link
                    href={signupUrl}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-purple-800 shadow-xs transition hover:bg-purple-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Free Account
                  </Link>
                  <Link
                    href={signinUrl}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
