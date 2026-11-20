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
      onClick={() => onSelect?.(stream)}
      className={`group relative flex aspect-[3/4.25] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[26px] border transition-all duration-300 ${
        isSelected
          ? 'border-amber-300/80 ring-2 ring-amber-300/40 shadow-[0_20px_50px_rgba(0,0,0,0.55)]'
          : 'border-white/15 hover:border-white/35 shadow-[0_16px_40px_rgba(0,0,0,0.45)]'
      }`}
    >
      {/* Full-bleed background thumbnail */}
      <img
        src={thumb}
        alt={stream.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Multi-stop cinematic dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/25" />

      {/* Top row: status badge + host/thumbnail quick actions */}
      <div className="relative z-10 flex items-center justify-between gap-2 p-3.5">
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white" />
              LIVE
              {Number(stream.viewersCurrent ?? 0) > 0 && (
                <span className="ml-0.5 text-white/90">· {formatCompactMetric(stream.viewersCurrent)}</span>
              )}
            </span>
          ) : stream.status === 'scheduled' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/85 backdrop-blur-md">
              <Radio className="h-3 w-3 text-emerald-300" />
              Replay / Reusable
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isOwner && onEditThumbnail && (
            <button
              type="button"
              onClick={() => onEditThumbnail(stream)}
              title="Change stream thumbnail"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white/90 backdrop-blur-md transition hover:bg-white/20"
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
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur-md transition ${
              stream.isSubscribed
                ? 'border-amber-300/70 bg-amber-400/25 text-amber-100'
                : 'border-white/25 bg-black/45 text-white/90 hover:bg-white/20'
            }`}
          >
            {stream.isSubscribed ? (
              <>
                <BellRing className="h-3 w-3 text-amber-300" />
                Subscribed
              </>
            ) : (
              <>
                <Bell className="h-3 w-3" />
                Notify Me
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom content block matching the reference card layout */}
      <div className="relative z-10 flex flex-col justify-end p-4 pt-2">
        {/* Frosted category pill + host name */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-0.5 text-[11px] font-semibold text-white/95 backdrop-blur-md">
            {category}
          </span>
          <span className="truncate text-[11px] font-medium text-white/75">
            {hostName}
          </span>
        </div>

        {/* Stream Title */}
        <h3 className="line-clamp-1 text-base font-extrabold tracking-tight text-white drop-shadow-sm sm:text-lg">
          {stream.title}
        </h3>

        {/* Stream Description */}
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/75">
          {stream.description ||
            `Subscribe to ${hostName}'s "${stream.title}" stream to get notified every time it goes live.`}
        </p>

        {/* 4 Required Live Metrics Bar: Total Likes, Total Subscribes, Total Shares, Total Views */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 grid grid-cols-4 gap-1 rounded-2xl border border-white/15 bg-black/45 px-2 py-1.5 text-[11px] text-white/90 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => onLike(stream)}
            title="Total Likes for this stream"
            className={`flex flex-col items-center justify-center rounded-xl py-1 transition hover:bg-white/10 ${
              stream.isLiked ? 'text-rose-400 font-bold' : 'text-white/90'
            }`}
          >
            <div className="flex items-center gap-1">
              <Heart className={`h-3.5 w-3.5 ${stream.isLiked ? 'fill-rose-500 text-rose-400' : ''}`} />
              <span>{formatCompactMetric(likesCount)}</span>
            </div>
            <span className="text-[9px] text-white/60">Likes</span>
          </button>

          <button
            type="button"
            onClick={() => onSubscribe(stream)}
            title="Total Subscribers notified when this stream is live"
            className={`flex flex-col items-center justify-center rounded-xl py-1 transition hover:bg-white/10 ${
              stream.isSubscribed ? 'text-amber-300 font-bold' : 'text-white/90'
            }`}
          >
            <div className="flex items-center gap-1">
              <Bell className={`h-3.5 w-3.5 ${stream.isSubscribed ? 'fill-amber-300 text-amber-300' : ''}`} />
              <span>{formatCompactMetric(subscribersCount)}</span>
            </div>
            <span className="text-[9px] text-white/60">Subscribes</span>
          </button>

          <button
            type="button"
            onClick={() => onShare(stream)}
            title="Share stream link"
            className="flex flex-col items-center justify-center rounded-xl py-1 text-white/90 transition hover:bg-white/10"
          >
            <div className="flex items-center gap-1">
              <Share2 className="h-3.5 w-3.5" />
              <span>{formatCompactMetric(sharesCount)}</span>
            </div>
            <span className="text-[9px] text-white/60">Shares</span>
          </button>

          <div
            title="Total Views for this stream"
            className="flex flex-col items-center justify-center rounded-xl py-1 text-white/90"
          >
            <div className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-sky-300" />
              <span>{formatCompactMetric(viewsCount)}</span>
            </div>
            <span className="text-[9px] text-white/60">Views</span>
          </div>
        </div>

        {/* Bottom row: "See more..." / "Go Live Again" on left + White circular Play button on right */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center justify-between gap-2"
        >
          {isOwner && !isLive && onGoLiveAgain ? (
            <button
              type="button"
              disabled={busyAction === `start-${stream._id}`}
              onClick={() => onGoLiveAgain(stream)}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-red-500 disabled:opacity-50"
            >
              <Radio className="h-3.5 w-3.5" />
              {busyAction === `start-${stream._id}` ? 'Starting...' : 'Go Live Again'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelect?.(stream)}
              className="text-xs font-semibold text-white/85 transition hover:text-white"
            >
              See more...
            </button>
          )}

          <button
            type="button"
            onClick={() => onWatch(stream)}
            title={isLive ? 'Watch live stream' : isOwner ? 'Launch studio room' : 'Open stream room'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 shadow-xl transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Play className="ml-0.5 h-4 w-4 fill-slate-950 text-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
}
