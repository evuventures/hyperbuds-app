'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import {
  Bookmark,
  Check,
  Copy,
  Film,
  Flag,
  Heart,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Play,
  RefreshCw,
  Repeat2,
  Search,
  SendHorizontal,
  Share2,
  Sparkles,
  ThumbsUp,
  Trash2,
  UserPlus,
  Volume2,
  VolumeX,
  BarChart3,
  ExternalLink,
  Eye,
  Flame,
  Hash,
  X,
} from 'lucide-react';
import { formatCompactCount } from '@/lib/utils/formatCount';
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
  id?: string;
  displayName?: string;
  fullName?: string;
  username?: string;
  avatar?: string;
}

export interface FeedComment {
  _id: string;
  id?: string;
  author?: FeedAuthor | string;
  text: string;
  parentCommentId?: string | null;
  likes?: string[];
  likesCount?: number;
  isLiked?: boolean;
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

export interface RepostedPostSnapshot {
  _id: string;
  id?: string;
  kind: 'post' | 'reel' | 'match' | string;
  body: string;
  caption?: string;
  thumbnailUrl?: string | null;
  media?: FeedMedia[];
  tags?: string[];
  createdAt?: string;
  author?: FeedAuthor | string;
}

export interface FeedPost {
  _id: string;
  author?: FeedAuthor | string;
  kind: 'post' | 'reel' | 'match' | 'repost';
  body: string;
  thumbnailUrl?: string | null;
  matchCard?: FeedMatchCard | null;
  originalPostId?: string | null;
  repostThought?: string;
  repostedPost?: RepostedPostSnapshot | null;
  repostsCount?: number;
  isReposted?: boolean;
  media?: FeedMedia[];
  tags?: string[];
  visibility: 'public' | 'followers' | 'private';
  likes?: string[];
  bookmarks?: string[];
  comments?: FeedComment[];
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  promoLink?: {
    platform: string;
    url: string;
    label: string;
    clicksCount: number;
  } | null;
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

function formatRelativeShort(value?: string) {
  if (!value) return 'Just now';
  const ts = new Date(value).getTime();
  if (Number.isNaN(ts)) return 'Just now';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
  return `${Math.floor(diffSec / 604800)}w`;
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

function buildFeedQuery(tab: FeedTab, search: string, pageNum: number, activeTag?: string): string {
  const params = new URLSearchParams({
    limit: String(FEED_PAGE_SIZE),
    page: String(pageNum),
  });
  if (tab === 'post' || tab === 'reel' || tab === 'match') params.set('kind', tab);
  if (tab === 'saved') params.set('saved', 'true');
  if (search.trim()) params.set('q', search.trim());
  if (activeTag && activeTag.trim()) params.set('tag', activeTag.replace(/^#/, '').trim());
  return params.toString();
}

function renderCaptionWithHashtags(
  text: string,
  onSelectTag: (tag: string) => void,
): React.ReactNode {
  const parts = text.split(/(#[a-zA-Z0-9_]{2,32})/g);
  return parts.map((part, i) => {
    if (/^#[a-zA-Z0-9_]{2,32}$/.test(part)) {
      const clean = part.slice(1).toLowerCase();
      return (
        <button
          key={`${clean}-${i}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTag(clean);
          }}
          className="inline font-semibold text-purple-600 hover:underline dark:text-purple-400"
        >
          {part}
        </button>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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
          href={isViewerParticipant ? '/challenges' : '/ai-matches'}
          className="inline-flex w-full items-center justify-center rounded-full border-2 border-[#6D12E8]/65 bg-white/80 px-6 py-2.5 text-sm font-bold text-[#5B12C8] backdrop-blur-xs transition hover:border-[#6D12E8] hover:bg-white"
        >
          {isViewerParticipant ? '✨ Start Grow Together Challenge' : 'Keep Exploring'}
        </Link>
      </div>
    </div>
  );
}

function FeedAutoPlayVideo({
  postId,
  src,
  poster,
  maxHeightClass = 'max-h-[580px]',
  isRepost = false,
}: {
  postId: string;
  src: string;
  poster?: string;
  maxHeightClass?: string;
  isRepost?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(false);
  const userMutedRef = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.muted = userMutedRef.current;
            void el.play().catch(() => {
              // Browser autoplay policy blocked unmuted playback before user gesture
              el.muted = true;
              setMuted(true);
              void el.play().catch(() => {});
            });
          } else {
            el.pause();
          }
        });
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !muted;
    userMutedRef.current = next;
    setMuted(next);
    if (videoRef.current) {
      videoRef.current.muted = next;
      if (!next && videoRef.current.paused) {
        void videoRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <Link
      href={`/reels?id=${encodeURIComponent(postId)}`}
      data-testid={isRepost ? 'repost-reel-card-link' : 'home-reel-card-link'}
      aria-label="Open in Reels"
      className="group relative block w-full overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="auto"
        className={`pointer-events-none block h-auto ${maxHeightClass} w-full object-cover sm:object-contain`}
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute video' : 'Mute video'}
        className="absolute bottom-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white ring-1 ring-white/20 backdrop-blur-xs transition hover:bg-black/80"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-xs">
        <Film className="h-3 w-3 text-purple-300" />
        Reels
      </span>
    </Link>
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

  // Comment, repost & match-card action state
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [openAnalytics, setOpenAnalytics] = useState<Record<string, boolean>>({});
  const viewedPostsRef = useRef<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, { commentId: string; authorName: string } | null>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [repostSheetPostId, setRepostSheetPostId] = useState<string | null>(null);
  const [repostThoughtDraft, setRepostThoughtDraft] = useState('');
  const [repostBusy, setRepostBusy] = useState<Record<string, boolean>>({});
  const [sharePost, setSharePost] = useState<FeedPost | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [followBothBusy, setFollowBothBusy] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>('');
  const [trendingWindow, setTrendingWindow] = useState<'24h' | '7d'>('7d');
  const [trendingTags, setTrendingTags] = useState<
    Array<{ tag: string; postsCount: number; viewsCount: number; engagementsCount: number }>
  >([]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    let active = true;
    apiClient
      .get(`/feed/trending-tags?window=${trendingWindow}&limit=8`)
      .then((res) => {
        if (!active) return;
        setTrendingTags(Array.isArray(res.data?.tags) ? res.data.tags : []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [trendingWindow]);

  useEffect(() => {
    if (currentUser?.id) setCurrentUserId(currentUser.id);
  }, [currentUser?.id]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setPage(1);
    setHasMore(false);
    const query = buildFeedQuery(tab, search, 1, activeTag);

    const fetchFeedOnce = async () => {
      const [meRes, feedRes] = await Promise.all([
        currentUser?.id ? Promise.resolve(null) : apiClient.get('/users/me').catch(() => null),
        apiClient.get(`/feed/posts?${query}`),
      ]);
      return { meRes, feedRes };
    };

    try {
      let result: Awaited<ReturnType<typeof fetchFeedOnce>>;
      try {
        result = await fetchFeedOnce();
      } catch (firstErr) {
        const status = (firstErr as { status?: number })?.status;
        // Retry once automatically for Chrome/mobile network wake-up or transient hiccups
        if (!status || status >= 500 || status === 408) {
          await new Promise((resolve) => setTimeout(resolve, 650));
          result = await fetchFeedOnce();
        } else {
          throw firstErr;
        }
      }

      const { meRes, feedRes } = result;
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
      const message = (err as { message?: string })?.message || 'Unable to load social feed.';
      setLoadError(message);
      setBanner({
        type: 'error',
        text: message,
      });
    } finally {
      setLoading(false);
    }
  }, [tab, search, activeTag, currentUser, onPostCountChange]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const query = buildFeedQuery(tab, search, nextPage, activeTag);
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
      text: 'Reel published.',
      actionHref: `/reels?id=${encodeURIComponent(reel._id)}`,
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

  const handleAddComment = async (postId: string, parentCommentId?: string | null) => {
    const draftKey = parentCommentId ? `${postId}:${parentCommentId}` : postId;
    const text = (parentCommentId ? replyDrafts[draftKey] : commentDrafts[postId] || '').trim();
    if (!text) return;
    try {
      const res = await apiClient.post(`/feed/posts/${postId}/comments`, {
        text,
        ...(parentCommentId ? { parentCommentId } : {}),
      });
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
            parentCommentId: rawComment.parentCommentId ?? parentCommentId ?? null,
            likes: Array.isArray(rawComment.likes) ? rawComment.likes : [],
            likesCount: Number(rawComment.likesCount ?? 0),
            isLiked: Boolean(rawComment.isLiked),
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
            parentCommentId: parentCommentId ?? null,
            likes: [],
            likesCount: 0,
            isLiked: false,
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
      if (parentCommentId) {
        setReplyDrafts((prev) => ({ ...prev, [draftKey]: '' }));
        setReplyingTo((prev) => ({ ...prev, [postId]: null }));
      } else {
        setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to post comment.',
      });
    }
  };

  const handleToggleCommentLike = async (postId: string, commentId: string) => {
    try {
      const res = await apiClient.post(`/feed/posts/${postId}/comments/${commentId}/like`);
      const liked = Boolean(res.data?.liked);
      const serverLikes: string[] | null = Array.isArray(res.data?.likes)
        ? res.data.likes.map((id: unknown) => String(id))
        : null;
      const likesCount =
        typeof res.data?.likesCount === 'number'
          ? res.data.likesCount
          : serverLikes?.length ?? (liked ? 1 : 0);

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          return {
            ...p,
            comments: (p.comments ?? []).map((c) => {
              if (c._id !== commentId) return c;
              const existing = c.likes ?? [];
              const nextLikes =
                serverLikes ??
                (liked
                  ? [...new Set([...existing, currentUserId || 'me'])]
                  : existing.filter((id) => id !== currentUserId && id !== 'me'));
              return {
                ...c,
                likes: nextLikes,
                likesCount,
                isLiked: liked,
              };
            }),
          };
        }),
      );
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to update comment reaction.',
      });
    }
  };

  const handleRepost = async (post: FeedPost, thought?: string) => {
    const targetId = post.originalPostId || post._id;
    if (repostBusy[post._id]) return;
    setRepostBusy((prev) => ({ ...prev, [post._id]: true }));
    try {
      const payload = typeof thought === 'string' && thought.trim()
        ? { thought: thought.trim(), action: 'repost' }
        : {};
      const res = await apiClient.post(`/feed/posts/${targetId}/repost`, payload);
      const reposted = Boolean(res.data?.reposted);
      const repostsCount = Number(res.data?.repostsCount ?? 0);
      const canonicalId = String(res.data?.originalPostId || targetId);

      setPosts((prev) =>
        prev.map((p) => {
          const pCanonical = p.originalPostId || p._id;
          if (pCanonical !== canonicalId) return p;
          return { ...p, isReposted: reposted, repostsCount };
        }),
      );
      setRepostSheetPostId(null);
      setRepostThoughtDraft('');
      setBanner({
        type: 'success',
        text: reposted
          ? 'Reposted to your feed!'
          : 'Removed from your reposts.',
      });
      if (reposted) {
        void loadFeed();
      }
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to repost right now.',
      });
    } finally {
      setRepostBusy((prev) => ({ ...prev, [post._id]: false }));
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

  const getShareUrl = (postId: string) => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://app.hyperbuds.cloud';
    return `${origin}/post/${encodeURIComponent(postId)}`;
  };

  const copyTextReliable = async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback below
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  const handleShare = (post: FeedPost) => {
    setShareCopied(false);
    setSharePost(post);
  };

  const handleCopyShareLink = async (postId: string) => {
    const url = getShareUrl(postId);
    const ok = await copyTextReliable(url);
    if (ok) {
      setShareCopied(true);
      setBanner({ type: 'success', text: 'Shareable post link copied! Anyone can open it and join HyperBuds.' });
      setTimeout(() => setShareCopied(false), 2200);
    } else {
      setBanner({ type: 'error', text: 'Tap the link box below to copy manually.' });
    }
  };

  const handleNativeShare = async (post: FeedPost) => {
    const url = getShareUrl(post._id);
    const authorObj = typeof post.author === 'object' && post.author ? post.author : null;
    const authorLabel =
      authorObj?.displayName || authorObj?.fullName || authorObj?.username || 'HyperBuds Creator';
    const text = post.body
      ? `${authorLabel} on HyperBuds: "${post.body.slice(0, 120)}"`
      : `Check out ${authorLabel}'s post on HyperBuds!`;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `${authorLabel} on HyperBuds`, text, url });
        setSharePost(null);
        return;
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return;
      }
    }
    await handleCopyShareLink(post._id);
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

      {/* Twitter/X-Style Trending Hashtags Bar */}
      {(trendingTags.length > 0 || activeTag) && (
        <div className="px-3 sm:px-0">
          <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Flame className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                Trending on HyperBuds
              </span>
              <div className="inline-flex rounded-full bg-slate-100 p-0.5 text-[10px] font-semibold dark:bg-slate-800">
                {(['24h', '7d'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTrendingWindow(w)}
                    className={`rounded-full px-2 py-0.5 transition ${
                      trendingWindow === w
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {w === '24h' ? '24h' : '7d'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hb-scroll-hidden">
              {activeTag && (
                <button
                  type="button"
                  onClick={() => setActiveTag('')}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  #{activeTag}
                  <X className="h-3 w-3" />
                </button>
              )}
              {trendingTags
                .filter((item) => item.tag.toLowerCase() !== activeTag.toLowerCase())
                .map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setActiveTag(item.tag)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-purple-600 dark:hover:text-purple-300"
                  >
                    <Hash className="h-3 w-3 text-purple-500" />
                    {item.tag}
                    <span className="text-[10px] font-normal text-slate-400">
                      {formatCompactCount(item.postsCount)}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-0">
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
      ) : loadError && posts.length === 0 ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center dark:border-rose-900/50 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Could not load the feed
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {loadError}
          </p>
          <button
            type="button"
            onClick={() => void loadFeed()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry loading feed
          </button>
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
        <div className="border-t border-slate-200 dark:border-slate-800">
          {posts.map((post) => {
            const authorObj = typeof post.author === 'object' && post.author ? post.author : null;
            const authorId =
              typeof post.author === 'string' ? post.author : authorObj?._id || authorObj?.id || '';
            const authorName =
              authorObj?.displayName || authorObj?.fullName || authorObj?.username || 'HyperBuds Creator';
            const authorHref = authorObj?.username
              ? `/profile/${encodeURIComponent(authorObj.username)}`
              : null;
            const liked = (post.likes ?? []).some(
              (id) => id === currentUserId || id === 'me',
            );
            const bookmarked = (post.bookmarks ?? []).some(
              (id) => id === currentUserId || id === 'me',
            );
            const isReposted = Boolean(post.isReposted);
            const likesTotal = (post.likes ?? []).length;
            const commentsList = post.comments ?? [];
            const commentsTotal = commentsList.length;
            const repostsTotal = Number(post.repostsCount ?? 0);
            const isOwner = Boolean(currentUserId && authorId === currentUserId);
            const commentsOpen = Boolean(openComments[post._id]);
            const isMatchCard = post.kind === 'match' && Boolean(post.matchCard);
            const isRepostCard = post.kind === 'repost' && Boolean(post.repostedPost);
            const activeReplyTarget = replyingTo[post._id] ?? null;

            const rootComments = commentsList.filter((c) => !c.parentCommentId);
            const repliesByParent = new Map<string, FeedComment[]>();
            for (const c of commentsList) {
              if (!c.parentCommentId) continue;
              const bucket = repliesByParent.get(c.parentCommentId) ?? [];
              bucket.push(c);
              repliesByParent.set(c.parentCommentId, bucket);
            }

            const renderFacebookComment = (c: FeedComment, isReply = false) => {
              const cObj = typeof c.author === 'object' && c.author ? c.author : null;
              const cName = cObj?.displayName || cObj?.fullName || cObj?.username || 'Creator';
              const cAvatar = cObj?.avatar || '';
              const cHref = cObj?.username ? `/profile/${encodeURIComponent(cObj.username)}` : null;
              const cLiked =
                Boolean(c.isLiked) ||
                (c.likes ?? []).some((id) => id === currentUserId || id === 'me');
              const cLikesCount =
                typeof c.likesCount === 'number' ? c.likesCount : (c.likes ?? []).length;
              const avatarSize = isReply ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-[11px]';

              return (
                <div key={c._id} className="flex items-start gap-2">
                  {cHref ? (
                    <Link href={cHref} className="mt-0.5 shrink-0">
                      {cAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cAvatar}
                          alt={cName}
                          className={`${avatarSize} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700`}
                        />
                      ) : (
                        <div
                          className={`${avatarSize} flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 font-bold text-white`}
                        >
                          {getInitials(cName)}
                        </div>
                      )}
                    </Link>
                  ) : cAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cAvatar}
                      alt={cName}
                      className={`${avatarSize} mt-0.5 shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700`}
                    />
                  ) : (
                    <div
                      className={`${avatarSize} mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 font-bold text-white`}
                    >
                      {getInitials(cName)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="relative inline-block max-w-full rounded-[18px] bg-[#F0F2F5] px-3.5 py-2 dark:bg-slate-800/90">
                      {cHref ? (
                        <Link
                          href={cHref}
                          className="block text-[13px] font-semibold leading-tight text-slate-900 hover:underline dark:text-white"
                        >
                          {cName}
                        </Link>
                      ) : (
                        <p className="text-[13px] font-semibold leading-tight text-slate-900 dark:text-white">
                          {cName}
                        </p>
                      )}
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-snug text-slate-800 dark:text-slate-100">
                        {c.text}
                      </p>

                      {cLikesCount > 0 && (
                        <span
                          aria-label={`${cLikesCount} likes`}
                          className="absolute -bottom-2 -right-2 inline-flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
                        >
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white">
                            <ThumbsUp className="h-2 w-2 fill-current" />
                          </span>
                          <span className="tabular-nums">{cLikesCount}</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3.5 px-3 text-[12px] text-slate-500 dark:text-slate-400">
                      <span>{formatRelativeShort(c.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => void handleToggleCommentLike(post._id, c._id)}
                        className={`font-semibold transition hover:underline ${
                          cLiked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Like
                      </button>
                      {!isReply && (
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingTo((prev) => ({
                              ...prev,
                              [post._id]:
                                prev[post._id]?.commentId === c._id
                                  ? null
                                  : { commentId: c._id, authorName: cName },
                            }))
                          }
                          className="font-semibold text-slate-600 transition hover:underline dark:text-slate-400"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            };

            return (
              <article
                key={post._id}
                id={post._id}
                className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5 dark:border-slate-800 dark:bg-slate-900"
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
                ) : isRepostCard && post.repostedPost ? (
                  <>
                    {/* Instagram-style Repost Banner */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">
                          <Repeat2 className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 text-xs text-slate-600 dark:text-slate-300">
                          {authorHref ? (
                            <Link
                              href={authorHref}
                              className="font-semibold text-slate-900 hover:underline dark:text-white"
                            >
                              {authorName}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {authorName}
                            </span>
                          )}{' '}
                          <span>reposted</span>
                          <span className="text-slate-400"> · {formatRelativeShort(post.createdAt)}</span>
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
                            title="Remove repost"
                            aria-label="Remove repost"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Instagram-style Floating Thought Bubble if Reposter Added a Note */}
                    {(post.repostThought || post.body) && (
                      <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-2xl rounded-tl-sm border border-purple-200/80 bg-purple-50/80 px-3.5 py-2 text-sm text-slate-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-100">
                        {authorObj?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={authorObj.avatar}
                            alt={authorName}
                            className="h-6 w-6 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-700 text-[10px] font-bold text-white">
                            {getInitials(authorName)}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words leading-snug">
                          {post.repostThought || post.body}
                        </p>
                      </div>
                    )}

                    {/* Embedded Original Creator Card */}
                    {(() => {
                      const orig = post.repostedPost;
                      const origAuthorObj =
                        typeof orig.author === 'object' && orig.author ? orig.author : null;
                      const origAuthorName =
                        origAuthorObj?.displayName ||
                        origAuthorObj?.fullName ||
                        origAuthorObj?.username ||
                        'HyperBuds Creator';
                      const origAuthorHref = origAuthorObj?.username
                        ? `/profile/${encodeURIComponent(origAuthorObj.username)}`
                        : null;

                      return (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                          <div className="flex items-center gap-2.5">
                            {origAuthorObj?.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={origAuthorObj.avatar}
                                alt={origAuthorName}
                                className="h-9 w-9 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-indigo-600">
                                {getInitials(origAuthorName)}
                              </div>
                            )}
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                {origAuthorHref ? (
                                  <Link
                                    href={origAuthorHref}
                                    className="text-sm font-semibold text-slate-900 hover:underline dark:text-white"
                                  >
                                    {origAuthorName}
                                  </Link>
                                ) : (
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {origAuthorName}
                                  </p>
                                )}
                                {orig.kind === 'reel' && (
                                  <Link
                                    href={`/reels?id=${encodeURIComponent(orig._id)}`}
                                    className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800 dark:bg-purple-950/70 dark:text-purple-200"
                                  >
                                    <Film className="h-3 w-3" />
                                    Reel
                                  </Link>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {formatTime(orig.createdAt)}
                              </p>
                            </div>
                          </div>

                          {orig.body && (
                            <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                              {orig.body}
                            </p>
                          )}

                          {Array.isArray(orig.media) && orig.media.length > 0 && (
                            <div className="-mx-3.5 mt-3 grid grid-cols-1 gap-1 overflow-hidden">
                              {orig.media.map((m, idx) => {
                                if (m.type === 'video') {
                                  const posterUrl = deriveVideoPoster(
                                    m.url,
                                    m.thumbnailUrl || orig.thumbnailUrl,
                                  );
                                  return (
                                    <FeedAutoPlayVideo
                                      key={`${orig._id}-rm-${idx}`}
                                      postId={orig._id}
                                      src={withVideoPreviewFragment(m.url, posterUrl)}
                                      poster={posterUrl}
                                      maxHeightClass="max-h-[540px]"
                                      isRepost
                                    />
                                  );
                                }
                                return (
                                  <div
                                    key={`${orig._id}-rm-${idx}`}
                                    className="w-full overflow-hidden bg-slate-100/70 dark:bg-slate-950"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={m.url}
                                      alt="Reposted media"
                                      loading="lazy"
                                      className="block h-auto max-h-[580px] w-full object-cover sm:object-contain"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {authorObj?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
                            {authorHref ? (
                              <Link
                                href={authorHref}
                                className="text-sm font-semibold text-slate-900 hover:underline dark:text-white"
                              >
                                {authorName}
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {authorName}
                              </p>
                            )}
                            {post.kind === 'reel' && (
                              <Link
                                href={`/reels?id=${encodeURIComponent(post._id)}`}
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
                        {renderCaptionWithHashtags(post.body, (tag) => setActiveTag(tag))}
                      </p>
                    )}

                    {post.promoLink?.url && (
                      <div className="mt-2.5">
                        <a
                          href={post.promoLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            void apiClient.post(`/feed/posts/${post._id}/promo-click`).catch(() => {});
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/80 px-3.5 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-800/70 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-950/70"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>{post.promoLink.label || 'Watch Full Post'}</span>
                          {post.promoLink.clicksCount > 0 && (
                            <span className="rounded-full bg-purple-200/70 px-1.5 py-0.5 text-[10px] dark:bg-purple-900">
                              {formatCompactCount(post.promoLink.clicksCount)}
                            </span>
                          )}
                        </a>
                      </div>
                    )}

                    {Array.isArray(post.media) && post.media.length > 0 && (
                      <div className="-mx-4 mt-3 grid grid-cols-1 gap-1 overflow-hidden sm:-mx-5">
                        {post.media.map((m, idx) => {
                          if (m.type === 'video') {
                            const posterUrl = deriveVideoPoster(m.url, m.thumbnailUrl || post.thumbnailUrl);
                            return (
                              <FeedAutoPlayVideo
                                key={`${post._id}-m-${idx}`}
                                postId={post._id}
                                src={withVideoPreviewFragment(m.url, posterUrl)}
                                poster={posterUrl}
                                maxHeightClass="max-h-[620px]"
                              />
                            );
                          }
                          return (
                            <div
                              key={`${post._id}-m-${idx}`}
                              className="w-full overflow-hidden bg-slate-100/70 dark:bg-slate-950"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.url}
                                alt="Post attachment"
                                loading="lazy"
                                className="block h-auto max-h-[680px] w-full object-cover sm:object-contain"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => {
                          const clean = tag.replace(/^#/, '').toLowerCase();
                          const isSelected = activeTag.toLowerCase() === clean;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setActiveTag(isSelected ? '' : clean)}
                              className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition ${
                                isSelected
                                  ? 'border-purple-600 bg-purple-600 text-white'
                                  : 'border-slate-200 bg-slate-50 text-purple-700 hover:border-purple-300 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300'
                              }`}
                            >
                              #{clean}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Facebook-style Engagement & Post Insights Summary Strip */}
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {likesTotal > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white">
                          <Heart className="h-2.5 w-2.5 fill-current" />
                        </span>
                        <span className="tabular-nums">{formatCompactCount(likesTotal)}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Eye className="h-3.5 w-3.5" />
                      {formatCompactCount(post.viewsCount ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {commentsTotal > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))
                        }
                        className="hover:underline"
                      >
                        {formatCompactCount(commentsTotal)} {commentsTotal === 1 ? 'comment' : 'comments'}
                      </button>
                    )}
                    {repostsTotal > 0 && (
                      <span>
                        {formatCompactCount(repostsTotal)} {repostsTotal === 1 ? 'repost' : 'reposts'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const nextOpen = !openAnalytics[post._id];
                        setOpenAnalytics((prev) => ({ ...prev, [post._id]: nextOpen }));
                        if (nextOpen && !viewedPostsRef.current.has(post._id)) {
                          viewedPostsRef.current.add(post._id);
                          apiClient
                            .post(`/feed/posts/${post._id}/view`)
                            .then((res) => {
                              const vc = res.data?.viewsCount;
                              if (typeof vc === 'number') {
                                setPosts((prev) =>
                                  prev.map((item) =>
                                    item._id === post._id ? { ...item, viewsCount: vc } : item,
                                  ),
                                );
                              }
                            })
                            .catch(() => {});
                        }
                      }}
                      className="inline-flex items-center gap-1 font-medium text-purple-600 hover:underline dark:text-purple-400"
                      title="View post analytics"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>Insights</span>
                    </button>
                  </div>
                </div>

                {openAnalytics[post._id] && (() => {
                  const views = Number(post.viewsCount ?? 0);
                  const engagements = likesTotal + commentsTotal + repostsTotal;
                  const rate = views > 0 ? ((engagements / views) * 100).toFixed(1) : engagements > 0 ? '100' : '0';
                  return (
                    <div className="mt-2.5 grid grid-cols-4 gap-2 rounded-xl border border-purple-100 bg-purple-50/50 p-2.5 text-center dark:border-purple-900/40 dark:bg-purple-950/20">
                      <div>
                        <p className="text-[10px] font-medium uppercase text-slate-500">Views</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatCompactCount(views)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-slate-500">Likes</p>
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                          {formatCompactCount(likesTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-slate-500">Engagements</p>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300 tabular-nums">
                          {formatCompactCount(engagements)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase text-slate-500">Rate</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {rate}%
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Facebook-style Full-Width Action Bar + Instagram Repost */}
                <div className="mt-3 flex items-center justify-between gap-1 border-y border-slate-100 py-1 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post._id)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      liked
                        ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))
                    }
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      commentsOpen
                        ? 'text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/40'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Comment</span>
                  </button>

                  {post.visibility === 'public' && (
                    <button
                      type="button"
                      disabled={Boolean(repostBusy[post._id])}
                      onClick={() => {
                        setRepostThoughtDraft('');
                        setRepostSheetPostId((prev) => (prev === post._id ? null : post._id));
                      }}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                        isReposted
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Repeat2 className="h-4 w-4" />
                      <span>{isReposted ? 'Reposted' : 'Repost'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleShare(post)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(post._id)}
                    aria-label="Bookmark post"
                    className={`rounded-lg p-2 text-xs font-semibold transition ${
                      bookmarked
                        ? 'text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/40'
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Instagram-style Inline Repost Popover (Instant Repost or Thought Bubble) */}
                {repostSheetPostId === post._id && (
                  <div
                    data-testid="instagram-repost-bar"
                    className="mt-2.5 rounded-2xl border border-purple-200/80 bg-purple-50/70 p-3 dark:border-purple-900/60 dark:bg-purple-950/30"
                  >
                    {isReposted ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          You reposted this post to your feed.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRepostSheetPostId(null)}
                            className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white/70 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(repostBusy[post._id])}
                            onClick={() => void handleRepost(post)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3.5 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                          >
                            Remove repost
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={240}
                            value={repostThoughtDraft}
                            onChange={(e) => setRepostThoughtDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                void handleRepost(post, repostThoughtDraft);
                              }
                            }}
                            placeholder="Add a thought (optional, Instagram-style)..."
                            className="flex-1 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none dark:border-purple-800 dark:bg-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            disabled={Boolean(repostBusy[post._id])}
                            onClick={() => void handleRepost(post, repostThoughtDraft)}
                            className="inline-flex items-center gap-1 rounded-full bg-purple-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-800 disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-500"
                          >
                            {repostBusy[post._id] ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Repeat2 className="h-3.5 w-3.5" />
                            )}
                            Repost
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Facebook-style Comment Section (Bubbles, Nested Replies, Comment Likes, Rounded Pill Composer) */}
                {commentsOpen && (
                  <div
                    data-testid="facebook-comment-section"
                    className="mt-3 space-y-3 pt-1"
                  >
                    {rootComments.length > 0 ? (
                      <div className="space-y-3">
                        {rootComments.map((root) => {
                          const replies = repliesByParent.get(root._id) ?? [];
                          const isReplyingHere = activeReplyTarget?.commentId === root._id;
                          const replyKey = `${post._id}:${root._id}`;

                          return (
                            <div key={root._id} className="space-y-2">
                              {renderFacebookComment(root, false)}

                              {(replies.length > 0 || isReplyingHere) && (
                                <div className="ml-6 space-y-2.5 border-l-2 border-slate-200 pl-3.5 dark:border-slate-700/80">
                                  {replies.map((reply) => renderFacebookComment(reply, true))}

                                  {isReplyingHere && (
                                    <div className="flex items-center gap-2 pt-0.5">
                                      {creatorProfile?.avatar ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={creatorProfile.avatar}
                                          alt={creatorProfile.displayName || 'You'}
                                          className="h-6 w-6 shrink-0 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-700 text-[10px] font-bold text-white">
                                          {getInitials(creatorProfile?.displayName || 'You')}
                                        </div>
                                      )}
                                      <div className="relative flex flex-1 items-center">
                                        <input
                                          type="text"
                                          value={replyDrafts[replyKey] || ''}
                                          onChange={(e) =>
                                            setReplyDrafts((prev) => ({
                                              ...prev,
                                              [replyKey]: e.target.value,
                                            }))
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              void handleAddComment(post._id, root._id);
                                            }
                                          }}
                                          placeholder={`Reply to ${activeReplyTarget?.authorName || 'comment'}...`}
                                          aria-label={`Reply to ${activeReplyTarget?.authorName || 'comment'}`}
                                          className="w-full rounded-full bg-[#F0F2F5] py-1.5 pl-3.5 pr-9 text-[13px] text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => void handleAddComment(post._id, root._id)}
                                          disabled={!(replyDrafts[replyKey] || '').trim()}
                                          aria-label="Send reply"
                                          className="absolute right-1.5 rounded-full p-1 text-purple-700 transition hover:bg-purple-100 disabled:opacity-40 dark:text-purple-400 dark:hover:bg-purple-950/60"
                                        >
                                          <SendHorizontal className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="px-1 text-xs text-slate-400">
                        No comments yet. Be the first to comment.
                      </p>
                    )}

                    {/* Facebook-style Bottom Comment Composer */}
                    <div className="flex items-center gap-2 pt-1">
                      {creatorProfile?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={creatorProfile.avatar}
                          alt={creatorProfile.displayName || 'You'}
                          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-700 text-[11px] font-bold text-white">
                          {getInitials(creatorProfile?.displayName || 'You')}
                        </div>
                      )}
                      <div className="relative flex flex-1 items-center">
                        <input
                          type="text"
                          value={commentDrafts[post._id] || ''}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleAddComment(post._id);
                            }
                          }}
                          placeholder="Write a comment..."
                          aria-label="Write a comment"
                          className="w-full rounded-full bg-[#F0F2F5] py-2 pl-4 pr-10 text-[14px] text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => void handleAddComment(post._id)}
                          disabled={!(commentDrafts[post._id] || '').trim()}
                          aria-label="Post comment"
                          className="absolute right-2 rounded-full p-1.5 text-purple-700 transition hover:bg-purple-100 disabled:opacity-35 dark:text-purple-400 dark:hover:bg-purple-950/60"
                        >
                          <SendHorizontal className="h-4 w-4" />
                        </button>
                      </div>
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

      {/* Popular Social Media Share Sheet Modal */}
      {sharePost && (() => {
        const shareUrl = getShareUrl(sharePost._id);
        const sAuthorObj = typeof sharePost.author === 'object' && sharePost.author ? sharePost.author : null;
        const sAuthorName =
          sAuthorObj?.displayName || sAuthorObj?.fullName || sAuthorObj?.username || 'HyperBuds Creator';
        const shareMessage = sharePost.body
          ? `${sAuthorName} on HyperBuds: "${sharePost.body.slice(0, 120)}"`
          : `Check out ${sAuthorName}'s post on HyperBuds!`;
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareMessage);
        const encodedCombined = encodeURIComponent(`${shareMessage} ${shareUrl}`);
        const supportsNativeShare =
          typeof navigator !== 'undefined' && typeof navigator.share === 'function';

        const socialTargets = [
          {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodedCombined}`,
            bg: 'bg-[#25D366] text-white',
            badge: 'WA',
          },
          {
            label: 'X / Twitter',
            href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            bg: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950',
            badge: 'X',
          },
          {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            bg: 'bg-[#1877F2] text-white',
            badge: 'f',
          },
          {
            label: 'Telegram',
            href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            bg: 'bg-[#229ED9] text-white',
            badge: 'TG',
          },
          {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            bg: 'bg-[#0A66C2] text-white',
            badge: 'in',
          },
        ];

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Share post"
            data-testid="social-share-modal"
            onClick={() => setSharePost(null)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-xs sm:items-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Share post</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Anyone with this link can view this post and join HyperBuds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSharePost(null)}
                  aria-label="Close share dialog"
                  className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 p-5">
                {/* One-Tap Social Targets Grid */}
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {socialTargets.map((target) => (
                    <a
                      key={target.label}
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSharePost(null)}
                      className="flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                    >
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black shadow-xs ${target.bg}`}
                      >
                        {target.badge}
                      </span>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {target.label}
                      </span>
                    </a>
                  ))}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`${sAuthorName} on HyperBuds`)}&body=${encodedCombined}`}
                    onClick={() => setSharePost(null)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-700 text-white shadow-xs">
                      <Mail className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Email
                    </span>
                  </a>
                </div>

                {/* Native Device Share (iOS / Android / Modern Browsers) */}
                {supportsNativeShare && (
                  <button
                    type="button"
                    onClick={() => void handleNativeShare(sharePost)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50 py-2.5 text-xs font-bold text-purple-800 transition hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-200"
                  >
                    <Share2 className="h-4 w-4" />
                    Share via Device Apps (Instagram, Messages, AirDrop...)
                  </button>
                )}

                {/* Copyable Public Link Bar */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Post link
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pl-3 dark:border-slate-700 dark:bg-slate-950">
                    <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label="Shareable post URL"
                      className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 focus:outline-none dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => void handleCopyShareLink(sharePost._id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        shareCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-700 text-white hover:bg-purple-800 dark:bg-purple-600'
                      }`}
                    >
                      {shareCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
