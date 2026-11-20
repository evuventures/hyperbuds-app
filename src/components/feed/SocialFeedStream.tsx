'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import {
  Bookmark,
  Check,
  Film,
  Flag,
  Heart,
  Loader2,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
  Trash2,
  UserPlus,
} from 'lucide-react';
import {
  CreatorStudioModal,
  type CreatorStudioMode,
  type CreatorStudioUserSummary,
} from './CreatorStudioModal';
import type { FeedPostRecord } from '@/lib/api/feed.api';
import type { Stream } from '@/types/streaming.types';
import { deriveVideoPoster, withVideoPreviewFragment } from '@/lib/utils/mediaThumbnail';

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
  thumbnailUrl?: string;
}

export interface MatchCardUser {
  _id?: string;
  id: string;
  displayName: string;
  fullName?: string;
  username?: string;
  avatar?: string;
  isFollowing?: boolean;
}

export interface FeedMatchCard {
  matchId?: string | null;
  compatibilityScore?: number | null;
  userA: MatchCardUser;
  userB: MatchCardUser;
}

export interface FeedPost {
  _id: string;
  author?: FeedAuthor | string;
  kind: 'post' | 'reel' | 'match';
  body: string;
  thumbnailUrl?: string | null;
  matchCard?: FeedMatchCard | null;
  media?: FeedMedia[];
  tags?: string[];
  visibility: 'public' | 'followers' | 'private';
  likes?: string[];
  bookmarks?: string[];
  comments?: FeedComment[];
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
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

type FeedTab = 'all' | 'post' | 'reel' | 'match' | 'saved';

const FEED_PAGE_SIZE = 10;

const FEED_TABS: Array<{ id: FeedTab; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'post', label: 'Posts' },
  { id: 'reel', label: 'Reels' },
  { id: 'match', label: 'Matches' },
  { id: 'saved', label: 'Saved' },
];

function buildFeedQuery(tab: FeedTab, search: string, pageNum: number): string {
  const params = new URLSearchParams({
    limit: String(FEED_PAGE_SIZE),
    page: String(pageNum),
  });
  if (tab === 'post' || tab === 'reel' || tab === 'match') params.set('kind', tab);
  if (tab === 'saved') params.set('saved', 'true');
  if (search.trim()) params.set('q', search.trim());
  return params.toString();
}

function MatchCardPortrait({
  user,
  tilt,
}: {
  user: MatchCardUser;
  tilt: 'left' | 'right';
}) {
  const href = user.username ? `/profile/${encodeURIComponent(user.username)}` : '/discover';
  const name = user.displayName || user.username || 'Creator';
  return (
    <Link
      href={href}
      title={`View ${name}'s profile`}
      className={`group relative block aspect-[4/4.65] w-[132px] overflow-hidden rounded-[22px] border-[4px] border-white bg-gradient-to-br from-[#8B2DFF] via-[#7A1EF2] to-[#5F10D6] shadow-[0_14px_30px_rgba(88,16,214,0.28)] transition duration-200 hover:z-20 hover:scale-[1.04] sm:w-[162px] ${
        tilt === 'left' ? '-rotate-6 hover:-rotate-3' : 'rotate-6 hover:rotate-3'
      }`}
    >
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#9747FF] via-[#7C22F5] to-[#570FC7] p-3 text-center text-white">
          <span className="text-3xl font-black tracking-tight drop-shadow-xs sm:text-4xl">
            {getInitials(name)}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#240950]/85 via-[#240950]/30 to-transparent px-2.5 pb-2 pt-6 text-center">
        <span className="block truncate text-[11px] font-bold text-white drop-shadow-xs">
          {name}
        </span>
      </div>
    </Link>
  );
}

function MatchFeedVisualCard({
  matchCard,
  currentUserId,
  followingBusy,
  onFollowBoth,
}: {
  matchCard: FeedMatchCard;
  currentUserId: string;
  followingBusy: boolean;
  onFollowBoth: (userIds: string[]) => void;
}) {
  const { userA, userB, compatibilityScore } = matchCard;
  const isViewerA = Boolean(currentUserId && userA.id === currentUserId);
  const isViewerB = Boolean(currentUserId && userB.id === currentUserId);
  const isViewerParticipant = isViewerA || isViewerB;
  const otherUser = isViewerA ? userB : userA;

  const targetIds = isViewerParticipant
    ? [otherUser.id]
    : [userA.id, userB.id].filter(Boolean);

  const alreadyFollowingAll = isViewerParticipant
    ? Boolean(otherUser.isFollowing)
    : Boolean(userA.isFollowing && userB.isFollowing);

  const userAHref = userA.username ? `/profile/${encodeURIComponent(userA.username)}` : '/discover';
  const userBHref = userB.username ? `/profile/${encodeURIComponent(userB.username)}` : '/discover';

  return (
    <div
      data-testid="match-feed-card"
      className="relative overflow-hidden rounded-[26px] border border-purple-200/80 bg-gradient-to-b from-[#F5EEFF] via-[#FDFBFF] to-[#ECE0FF] px-5 pb-7 pt-6 text-center shadow-[0_12px_36px_rgba(107,18,224,0.12)] sm:px-8 sm:pb-8 sm:pt-7 dark:border-purple-900/60"
    >
      {/* Top-left organic purple wave accent */}
      <svg
        viewBox="0 0 220 170"
        aria-hidden="true"
        className="pointer-events-none absolute -left-2 -top-2 h-36 w-44 sm:h-44 sm:w-56"
      >
        <defs>
          <linearGradient id="hbMatchWaveTL1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D12E8" />
            <stop offset="100%" stopColor="#A64DFF" />
          </linearGradient>
          <linearGradient id="hbMatchWaveTL2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B86BFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#DFB8FF" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path d="M0,0 L210,0 C175,65 110,115 0,150 Z" fill="url(#hbMatchWaveTL2)" />
        <path d="M0,0 L145,0 C115,48 68,85 0,112 Z" fill="url(#hbMatchWaveTL1)" />
      </svg>

      {/* Bottom-right organic purple wave accent */}
      <svg
        viewBox="0 0 220 170"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 -right-2 h-36 w-44 sm:h-44 sm:w-56"
      >
        <defs>
          <linearGradient id="hbMatchWaveBR1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B3DFF" />
            <stop offset="100%" stopColor="#5D0ED6" />
          </linearGradient>
          <linearGradient id="hbMatchWaveBR2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C992FF" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#892BFF" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path d="M220,170 L10,170 C55,112 125,70 220,30 Z" fill="url(#hbMatchWaveBR2)" />
        <path d="M220,170 L75,170 C112,128 158,96 220,74 Z" fill="url(#hbMatchWaveBR1)" />
      </svg>

      {/* Top Centered HyperBuds Brand Mark */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5">
          <svg viewBox="0 0 64 42" className="h-8 w-12 sm:h-9 sm:w-14" aria-hidden="true">
            <defs>
              <linearGradient id="hbMatchLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9C38FF" />
                <stop offset="100%" stopColor="#5B0FD4" />
              </linearGradient>
            </defs>
            <path
              d="M11 6C11 3.8 12.8 2 15 2C17.2 2 19 3.8 19 6V17.5C22.4 16.5 25.5 14 27 10.2C27.9 7.8 28.5 5.4 29 3.8C29.4 2.7 30.4 2 31.6 2H45.5C51.6 2 56 5.8 56 11.4C56 15.1 53.8 18.1 50.5 19.6C54.6 21.1 57.5 24.5 57.5 29.1C57.5 35.3 52.5 39.5 45.8 39.5H31.8C29.6 39.5 27.8 37.7 27.8 35.5V22.8C24.5 25 21.1 26.8 19 29.5V35.5C19 37.7 17.2 39.5 15 39.5C12.8 39.5 11 37.7 11 35.5V27.6C11 21.8 15.6 18.4 21.4 16.5C17.6 18.5 11 19 11 13.5V6ZM36 9.5V16.8H44.6C47 16.8 48.6 15.4 48.6 13.1C48.6 10.9 47 9.5 44.6 9.5H36ZM36 23.6V32H45.2C48 32 49.8 30.4 49.8 27.8C49.8 25.2 48 23.6 45.2 23.6H36Z"
              fill="url(#hbMatchLogoGrad)"
            />
          </svg>
        </div>
        <span className="mt-0.5 text-[11px] font-black tracking-[0.22em] text-[#5B12C8]">
          HYPERBUDS
        </span>
      </div>

      {/* Dual Tilted Portrait Cards + Floating Heart Medallion */}
      <div className="relative z-10 mx-auto mt-5 flex max-w-[360px] items-center justify-center py-2">
        {/* Decorative floating hearts & burst ticks */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-1 top-1 -rotate-12 text-lg text-[#7E22F8] drop-shadow-xs sm:left-0 sm:text-xl"
        >
          💜
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1 left-0 -rotate-12 text-lg text-[#7E22F8] drop-shadow-xs sm:left-1 sm:text-xl"
        >
          💜
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-1/2 rotate-12 text-lg text-[#7E22F8] drop-shadow-xs sm:right-1 sm:text-xl"
        >
          💜
        </span>
        <svg
          viewBox="0 0 42 42"
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 right-4 h-9 w-9 text-[#6C14E6] sm:right-6"
        >
          <path d="M12 18 L17 4" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M20 22 L31 12" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M24 30 L38 26" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
        </svg>

        <div className="flex items-center justify-center -space-x-3 sm:-space-x-4">
          <MatchCardPortrait user={userA} tilt="left" />
          <MatchCardPortrait user={userB} tilt="right" />
        </div>

        {/* Floating White Heart Badge Centered Between Portraits */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 z-30 flex h-14 w-14 -translate-x-1/2 translate-y-1.5 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(88,16,214,0.28)] ring-1 ring-purple-100 sm:h-16 sm:w-16"
        >
          <Heart className="h-7 w-7 fill-[#6E12EC] text-[#6E12EC] sm:h-8 sm:w-8" />
        </div>
      </div>

      {/* Bold Headline */}
      <div className="relative z-10 mt-6">
        <p className="text-2xl font-black uppercase leading-none tracking-tight text-[#250A54] sm:text-3xl">
          IT&apos;S A
        </p>
        <div className="mt-0.5 inline-flex items-center justify-center gap-2.5 sm:gap-3">
          <svg viewBox="0 0 22 26" aria-hidden="true" className="h-6 w-5 text-[#6E12EC]">
            <path d="M18 5 L6 2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M17 13 L3 13" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M18 21 L6 24" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
          <h3 className="bg-gradient-to-b from-[#6B12EC] to-[#490AA8] bg-clip-text text-4xl font-black uppercase leading-none tracking-tight text-transparent sm:text-5xl">
            MATCH!
          </h3>
          <svg viewBox="0 0 22 26" aria-hidden="true" className="h-6 w-5 text-[#6E12EC]">
            <path d="M4 5 L16 2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M5 13 L19 13" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M4 21 L16 24" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mt-2.5 max-w-sm text-sm font-semibold text-[#311263] sm:text-base">
          {isViewerParticipant ? (
            <>
              You and{' '}
              <Link
                href={isViewerA ? userBHref : userAHref}
                className="font-bold text-[#5E11D6] underline decoration-purple-300 underline-offset-2 hover:text-[#4409A8]"
              >
                {otherUser.displayName}
              </Link>{' '}
              are a match 💜
            </>
          ) : (
            <>
              <Link
                href={userAHref}
                className="font-bold text-[#5E11D6] underline decoration-purple-300 underline-offset-2 hover:text-[#4409A8]"
              >
                {userA.displayName}
              </Link>{' '}
              &amp;{' '}
              <Link
                href={userBHref}
                className="font-bold text-[#5E11D6] underline decoration-purple-300 underline-offset-2 hover:text-[#4409A8]"
              >
                {userB.displayName}
              </Link>{' '}
              are a match 💜
            </>
          )}
        </p>

        {typeof compatibilityScore === 'number' && compatibilityScore > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-100/90 px-3 py-0.5 text-[11px] font-bold text-[#5B12C8]">
            <Sparkles className="h-3 w-3" />
            {compatibilityScore}% Creator Match
          </div>
        )}
      </div>

      {/* Action Pill Buttons */}
      <div className="relative z-10 mx-auto mt-5 flex max-w-xs flex-col gap-2.5">
        <button
          type="button"
          disabled={followingBusy || alreadyFollowingAll || targetIds.length === 0}
          onClick={() => onFollowBoth(targetIds)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-[0_10px_22px_rgba(98,16,224,0.34)] transition ${
            alreadyFollowingAll
              ? 'bg-emerald-600 text-white shadow-emerald-600/25'
              : 'bg-gradient-to-r from-[#8521F8] via-[#6D12E8] to-[#520CC4] text-white hover:brightness-110 active:scale-[0.99]'
          } disabled:cursor-default disabled:opacity-90`}
        >
          {followingBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Following...
            </>
          ) : alreadyFollowingAll ? (
            <>
              <Check className="h-4 w-4" />
              {isViewerParticipant ? `Following ${otherUser.displayName}` : 'Following Both'}
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              {isViewerParticipant ? `Follow ${otherUser.displayName}` : 'Follow Both'}
            </>
          )}
        </button>

        <Link
          href="/ai-matches"
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#6D12E8]/65 bg-white/80 px-6 py-2.5 text-sm font-bold text-[#5B12C8] backdrop-blur-xs transition hover:border-[#6D12E8] hover:bg-white"
        >
          Keep Exploring
        </Link>
      </div>
    </div>
  );
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

  // Comment & match-card action state
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [followBothBusy, setFollowBothBusy] = useState<Record<string, boolean>>({});

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
      const serverLikes: string[] | null = Array.isArray(res.data?.likes)
        ? res.data.likes.map((id: unknown) => String(id))
        : null;
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const existing = p.likes ?? [];
          const nextLikes =
            serverLikes ??
            (liked
              ? [...new Set([...existing, currentUserId || 'me'])]
              : existing.filter((id) => id !== currentUserId && id !== 'me'));
          return {
            ...p,
            likes: nextLikes,
            likesCount:
              typeof res.data?.likesCount === 'number' ? res.data.likesCount : nextLikes.length,
            isLiked: liked,
          };
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
      const serverBookmarks: string[] | null = Array.isArray(res.data?.bookmarks)
        ? res.data.bookmarks.map((id: unknown) => String(id))
        : null;
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const existing = p.bookmarks ?? [];
          const next =
            serverBookmarks ??
            (bookmarked
              ? [...new Set([...existing, currentUserId || 'me'])]
              : existing.filter((id) => id !== currentUserId && id !== 'me'));
          return { ...p, bookmarks: next, isBookmarked: bookmarked };
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
      const rawComment = res.data?.comment;
      const created: FeedComment = rawComment
        ? {
            _id: String(rawComment._id || rawComment.id || `c-${Date.now()}`),
            author: rawComment.author ?? {
              _id: currentUserId || undefined,
              fullName: resolvedUser?.displayName || resolvedUser?.username || 'You',
              username: resolvedUser?.username,
              avatar: resolvedUser?.avatar,
            },
            text: String(rawComment.text ?? text),
            createdAt: String(rawComment.createdAt ?? new Date().toISOString()),
          }
        : {
            _id: `c-${Date.now()}`,
            author: {
              _id: currentUserId || undefined,
              fullName: resolvedUser?.displayName || resolvedUser?.username || 'You',
              username: resolvedUser?.username,
              avatar: resolvedUser?.avatar,
            },
            text,
            createdAt: new Date().toISOString(),
          };
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: [...(p.comments ?? []), created],
                commentsCount:
                  typeof res.data?.commentsCount === 'number'
                    ? res.data.commentsCount
                    : (p.comments ?? []).length + 1,
              }
            : p,
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

  const handleFollowBoth = async (postId: string, userIds: string[]) => {
    const cleanIds = userIds.filter(Boolean);
    if (cleanIds.length === 0 || followBothBusy[postId]) return;
    setFollowBothBusy((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await apiClient.post('/profiles/follow-both', { userIds: cleanIds });
      const followedSet = new Set<string>(
        Array.isArray(res.data?.followedIds)
          ? res.data.followedIds.map((id: unknown) => String(id))
          : cleanIds,
      );
      setPosts((prev) =>
        prev.map((p) => {
          if (!p.matchCard) return p;
          return {
            ...p,
            matchCard: {
              ...p.matchCard,
              userA: followedSet.has(p.matchCard.userA.id)
                ? { ...p.matchCard.userA, isFollowing: true }
                : p.matchCard.userA,
              userB: followedSet.has(p.matchCard.userB.id)
                ? { ...p.matchCard.userB, isFollowing: true }
                : p.matchCard.userB,
            },
          };
        }),
      );
      setBanner({
        type: 'success',
        text:
          followedSet.size > 1
            ? 'You are now following both matched creators!'
            : 'You are now following this creator!',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to follow matched creators.',
      });
    } finally {
      setFollowBothBusy((prev) => ({ ...prev, [postId]: false }));
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
            {tab === 'saved'
              ? 'No saved posts yet'
              : tab === 'match'
                ? 'No match celebrations yet'
                : 'No posts in the feed yet'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tab === 'saved'
              ? 'Bookmark any post in the feed to keep it here.'
              : tab === 'match'
                ? 'When two creators mutually match on HyperBuds, their celebration card appears here.'
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
            const isMatchCard = post.kind === 'match' && Boolean(post.matchCard);

            return (
              <article
                key={post._id}
                id={post._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                {isMatchCard && post.matchCard ? (
                  <>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-800 dark:bg-purple-950/70 dark:text-purple-200">
                          <Heart className="h-3 w-3 fill-current" />
                          New Match
                        </span>
                        <span>· {formatTime(post.createdAt)}</span>
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

                    <MatchFeedVisualCard
                      matchCard={post.matchCard}
                      currentUserId={currentUserId}
                      followingBusy={Boolean(followBothBusy[post._id])}
                      onFollowBoth={(ids) => void handleFollowBoth(post._id, ids)}
                    />
                  </>
                ) : (
                  <>
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
                        {post.media.map((m, idx) => {
                          if (m.type === 'video') {
                            const posterUrl = deriveVideoPoster(m.url, m.thumbnailUrl || post.thumbnailUrl);
                            return (
                              <div
                                key={`${post._id}-m-${idx}`}
                                className="flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-800"
                              >
                                <video
                                  src={withVideoPreviewFragment(m.url, posterUrl)}
                                  poster={posterUrl}
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
                              key={`${post._id}-m-${idx}`}
                              className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.url}
                                alt="Post attachment"
                                loading="lazy"
                                className="mx-auto block h-auto max-h-[640px] w-full object-contain"
                              />
                            </div>
                          );
                        })}
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
                  </>
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
