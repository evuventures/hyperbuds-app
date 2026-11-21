'use client';

import React from 'react';
import {
  Bell,
  BellRing,
  Eye,
  Heart,
  Image as ImageIcon,
  Play,
  Radio,
  Share2,
  Sparkles,
} from 'lucide-react';

export interface ReusableStreamItem {
  _id: string;
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled' | string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  streamKey?: string;
  ingestUrl?: string;
  playbackUrl?: string | null;
  recordingUrl?: string | null;
  chatEnabled?: boolean;
  viewersCurrent?: number;
  viewersPeak?: number;
  tags?: string[];
  thumbnailUrl?: string | null;
  category?: string;
  likesCount?: number;
  subscribersCount?: number;
  sharesCount?: number;
  viewsCount?: number;
  isLiked?: boolean;
  isSubscribed?: boolean;
  host?: {
    _id?: string;
    id?: string;
    displayName?: string;
    username?: string;
    avatar?: string;
  };
  createdAt?: string;
}

export const STREAM_FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80',
];

export function resolveStreamThumbnail(stream: ReusableStreamItem, index = 0): string {
  if (typeof stream.thumbnailUrl === 'string' && stream.thumbnailUrl.trim()) {
    return stream.thumbnailUrl.trim();
  }
  const seedSource = String(stream._id || stream.id || stream.title || index);
  let hash = 0;
  for (let i = 0; i < seedSource.length; i += 1) {
    hash = (hash * 31 + seedSource.charCodeAt(i)) >>> 0;
  }
  return STREAM_FALLBACK_THUMBNAILS[(hash + index) % STREAM_FALLBACK_THUMBNAILS.length];
}

export function formatCompactMetric(value?: number): string {
  const n = Math.max(0, Number(value ?? 0) || 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

export interface StreamCardProps {
  stream: ReusableStreamItem;
  index?: number;
  isSelected?: boolean;
  isOwner?: boolean;
  busyAction?: string | null;
  onSelect?: (stream: ReusableStreamItem) => void;
  onWatch: (stream: ReusableStreamItem) => void;
  onLike: (stream: ReusableStreamItem) => void;
  onSubscribe: (stream: ReusableStreamItem) => void;
  onShare: (stream: ReusableStreamItem) => void;
  onGoLiveAgain?: (stream: ReusableStreamItem) => void;
  onEditThumbnail?: (stream: ReusableStreamItem) => void;
}

export function StreamCard({
  stream,
  index = 0,
  isSelected = false,
  isOwner = false,
  busyAction = null,
  onSelect,
  onWatch,
  onLike,
  onSubscribe,
  onShare,
  onGoLiveAgain,
  onEditThumbnail,
}: StreamCardProps) {
  const thumb = resolveStreamThumbnail(stream, index);
  const category =
    stream.category ||
    (Array.isArray(stream.tags) && stream.tags.length > 0 ? stream.tags[0] : 'Live Studio');
  const isLive = stream.status === 'live';
  const likesCount = Number(stream.likesCount ?? 0);
  const subscribersCount = Number(stream.subscribersCount ?? 0);
  const sharesCount = Number(stream.sharesCount ?? 0);
  const viewsCount = Math.max(
    Number(stream.viewsCount ?? 0),
    Number(stream.viewersPeak ?? 0),
    Number(stream.viewersCurrent ?? 0),
  );
  const hostName =
    stream.host?.displayName ||
    stream.host?.username ||
    (isOwner ? 'You (Host)' : 'HyperBuds Creator');

  return (
    <div
      data-testid={`stream-card-${stream._id}`}
      onClick={() => onSelect?.(stream)}
      className={`group relative flex min-h-[440px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[28px] border transition-all duration-300 ${
        isSelected
          ? 'border-[#A855F7] ring-2 ring-[#8B3DFF]/50 shadow-[0_22px_55px_rgba(139,61,255,0.42)]'
          : 'border-purple-300/20 hover:border-purple-400/45 shadow-[0_18px_45px_rgba(15,5,32,0.65)]'
      }`}
    >
      {/* Full-bleed background thumbnail */}
      <img
        src={thumb}
        alt={stream.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* HyperBuds brand deep-violet & black multi-stop gradient overlay for crisp text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D041C] via-[#170830]/75 to-black/30" />

      {/* Top row: status badge + host/thumbnail quick actions */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-4 sm:p-5">
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-lg">
              <span className="h-2 w-2 animate-ping rounded-full bg-white" />
              LIVE
              {Number(stream.viewersCurrent ?? 0) > 0 && (
                <span className="ml-0.5 text-white/95">· {formatCompactMetric(stream.viewersCurrent)}</span>
              )}
            </span>
          ) : stream.status === 'scheduled' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300/35 bg-[#1E0B3B]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300/30 bg-[#1E0B3B]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-purple-100 backdrop-blur-md">
              <Radio className="h-3.5 w-3.5 text-purple-300" />
              Reusable Stream
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isOwner && onEditThumbnail && (
            <button
              type="button"
              onClick={() => onEditThumbnail(stream)}
              title="Change stream thumbnail"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-purple-300/30 bg-[#1E0B3B]/80 text-purple-100 backdrop-blur-md transition hover:bg-purple-600/40"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onSubscribe(stream)}
            title={
              stream.isSubscribed
                ? 'Subscribed — you will be notified when this stream goes live again'
                : 'Subscribe to get notified when this stream goes live'
            }
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold backdrop-blur-md transition ${
              stream.isSubscribed
                ? 'border-purple-300/70 bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] text-white shadow-md'
                : 'border-purple-300/30 bg-[#1E0B3B]/80 text-purple-100 hover:bg-purple-600/35'
            }`}
          >
            {stream.isSubscribed ? (
              <>
                <BellRing className="h-3.5 w-3.5 text-white" />
                Subscribed
              </>
            ) : (
              <>
                <Bell className="h-3.5 w-3.5" />
                Notify Me
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom content block with generous room for Title, Description, 4 Metrics, and Actions */}
      <div className="relative z-10 flex flex-col justify-end p-5 pt-3">
        {/* Frosted brand purple category pill + host name */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-purple-300/35 bg-purple-500/25 px-3 py-1 text-xs font-bold text-purple-100 backdrop-blur-md">
            {category}
          </span>
          <span className="truncate text-xs font-semibold text-purple-200/90">
            {hostName}
          </span>
        </div>

        {/* Stream Title (2 full lines supported without clipping) */}
        <h3 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-tight text-white drop-shadow-sm sm:text-xl">
          {stream.title}
        </h3>

        {/* Stream Description */}
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-purple-100/80 sm:text-[13px]">
          {stream.description ||
            `Subscribe to ${hostName}'s "${stream.title}" stream to get notified every time it goes live.`}
        </p>

        {/* 4 Required Live Metrics Bar: Total Likes, Total Subscribers, Total Shares, Total Views */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 grid grid-cols-4 gap-1.5 rounded-2xl border border-purple-300/25 bg-[#140729]/85 p-2 text-white backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => onLike(stream)}
            title="Total Likes for this stream"
            className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-1 transition hover:bg-purple-500/20 ${
              stream.isLiked ? 'text-pink-400 font-extrabold' : 'text-white'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-bold">
              <Heart className={`h-3.5 w-3.5 shrink-0 ${stream.isLiked ? 'fill-pink-500 text-pink-400' : 'text-pink-300'}`} />
              <span>{formatCompactMetric(likesCount)}</span>
            </div>
            <span className="mt-0.5 text-[10px] font-medium text-purple-200/75">Likes</span>
          </button>

          <button
            type="button"
            onClick={() => onSubscribe(stream)}
            title="Total Subscribers notified when this stream is live"
            className={`flex flex-col items-center justify-center rounded-xl py-1.5 px-1 transition hover:bg-purple-500/20 ${
              stream.isSubscribed ? 'text-purple-300 font-extrabold' : 'text-white'
            }`}
          >
            <div className="flex items-center gap-1 text-xs font-bold">
              <Bell className={`h-3.5 w-3.5 shrink-0 ${stream.isSubscribed ? 'fill-purple-400 text-purple-300' : 'text-purple-300'}`} />
              <span>{formatCompactMetric(subscribersCount)}</span>
            </div>
            <span className="mt-0.5 text-[10px] font-medium text-purple-200/75">Subscribers</span>
          </button>

          <button
            type="button"
            onClick={() => onShare(stream)}
            title="Share stream link"
            className="flex flex-col items-center justify-center rounded-xl py-1.5 px-1 text-white transition hover:bg-purple-500/20"
          >
            <div className="flex items-center gap-1 text-xs font-bold">
              <Share2 className="h-3.5 w-3.5 shrink-0 text-violet-300" />
              <span>{formatCompactMetric(sharesCount)}</span>
            </div>
            <span className="mt-0.5 text-[10px] font-medium text-purple-200/75">Shares</span>
          </button>

          <div
            title="Total Views for this stream"
            className="flex flex-col items-center justify-center rounded-xl py-1.5 px-1 text-white"
          >
            <div className="flex items-center gap-1 text-xs font-bold">
              <Eye className="h-3.5 w-3.5 shrink-0 text-sky-300" />
              <span>{formatCompactMetric(viewsCount)}</span>
            </div>
            <span className="mt-0.5 text-[10px] font-medium text-purple-200/75">Views</span>
          </div>
        </div>

        {/* Bottom row: "See more..." / "Go Live Again" on left + Circular Play button on right */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex items-center justify-between gap-3"
        >
          {isOwner && !isLive && onGoLiveAgain ? (
            <button
              type="button"
              disabled={busyAction === `start-${stream._id}`}
              onClick={() => onGoLiveAgain(stream)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#EC4899] px-4 py-2 text-xs font-extrabold text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
            >
              <Radio className="h-3.5 w-3.5" />
              {busyAction === `start-${stream._id}` ? 'Starting...' : 'Go Live Again'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelect?.(stream)}
              className="text-xs font-bold text-purple-200 transition hover:text-white"
            >
              See more...
            </button>
          )}

          <button
            type="button"
            onClick={() => onWatch(stream)}
            aria-label={`Watch ${stream.title}`}
            title={isLive ? 'Watch live stream' : isOwner ? 'Launch studio room' : 'Open stream room'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#2A0948] shadow-[0_8px_25px_rgba(139,61,255,0.5)] transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Play className="ml-0.5 h-4 w-4 fill-[#2A0948] text-[#2A0948]" />
          </button>
        </div>
      </div>
    </div>
  );
}
