'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BarChart2,
  Coins,
  Radio,
  Send,
  Share2,
  Smile,
  Sparkles,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { Track } from 'livekit-client';
import type { FloatingReaction, StudioOverlayState } from './StageOverlays';
import type { LiveChatItem, StreamPollItem } from './LiveChatPanel';

export interface ViewerVideoTile {
  id: string;
  name: string;
  isScreen: boolean;
  track: Track;
}

const LIVE_STICKERS: Array<{ id: string; emoji: string; label: string }> = [
  { id: 'fire', emoji: '🔥', label: 'Fire' },
  { id: 'love', emoji: '❤️', label: 'Love' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'rocket', emoji: '🚀', label: 'Boost' },
  { id: 'gem', emoji: '💎', label: 'Diamond' },
  { id: 'hype', emoji: '⚡', label: 'Hype' },
  { id: 'mic', emoji: '🎤', label: 'Bars' },
  { id: 'party', emoji: '🎉', label: 'Party' },
  { id: 'clap', emoji: '👏', label: 'Clap' },
  { id: 'laugh', emoji: '😂', label: 'LOL' },
  { id: '100', emoji: '💯', label: '100%' },
  { id: 'hands', emoji: '🙌', label: 'Respect' },
];

const SUPER_AMOUNTS = [10, 25, 50, 100, 250, 500];

interface ViewerReelsLiveStageProps {
  streamTitle: string;
  streamStatus: string;
  recordingUrl?: string | null;
  viewerCount: number;
  lkConnected: boolean;
  lkConnecting: boolean;
  primaryTile: ViewerVideoTile | null;
  studioState: StudioOverlayState;
  reactions: FloatingReaction[];
  messages: LiveChatItem[];
  activePoll: StreamPollItem | null;
  chatDraft: string;
  sendingChat: boolean;
  muted: boolean;
  cohostRequestStatus: 'idle' | 'pending' | 'admitted';
  onBack: () => void;
  onToggleMute: () => void;
  onJoinWatch: () => void;
  onChatDraftChange: (v: string) => void;
  onSendChat: (e: React.FormEvent) => void;
  onSendSticker: (emoji: string, label: string) => void;
  onSendSuperChat: (amount: number, message: string) => Promise<void>;
  onVotePoll: (pollId: string, optionIndex: number) => void;
  onRequestCohost: () => void;
  onShare: () => void;
}

function FullBleedTrackVideo({ tile }: { tile: ViewerVideoTile }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    tile.track.attach(el);
    return () => {
      tile.track.detach(el);
    };
  }, [tile.track]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className={`h-full w-full ${tile.isScreen ? 'object-contain bg-black' : 'object-cover'}`}
    />
  );
}

/**
 * TikTok / IG Live Reels-format vertical watch experience for viewers.
 * Includes back navigation, translucent scrolling chat, animated sticker tray,
 * Super Chat tipping, live polls, and 1-tap Co-Host request.
 */
export function ViewerReelsLiveStage({
  streamTitle,
  streamStatus,
  recordingUrl,
  viewerCount,
  lkConnected,
  lkConnecting,
  primaryTile,
  studioState,
  reactions,
  messages,
  activePoll,
  chatDraft,
  sendingChat,
  muted,
  cohostRequestStatus,
  onBack,
  onToggleMute,
  onJoinWatch,
  onChatDraftChange,
  onSendChat,
  onSendSticker,
  onSendSuperChat,
  onVotePoll,
  onRequestCohost,
  onShare,
}: ViewerReelsLiveStageProps) {
  const [stickerOpen, setStickerOpen] = useState(false);
  const [superOpen, setSuperOpen] = useState(false);
  const [superAmount, setSuperAmount] = useState(25);
  const [superMsg, setSuperMsg] = useState('');
  const [sendingSuper, setSendingSuper] = useState(false);

  const recentMessages = messages.slice(-6);

  const handleSuperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superMsg.trim()) return;
    setSendingSuper(true);
    try {
      await onSendSuperChat(superAmount, superMsg.trim());
      setSuperMsg('');
      setSuperOpen(false);
    } finally {
      setSendingSuper(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-56px)] w-full items-center justify-center bg-[#090a0f] px-0 py-0 sm:py-5">
      <div className="relative flex h-[calc(100dvh-56px)] w-full flex-col overflow-hidden bg-black sm:h-[780px] sm:max-h-[88dvh] sm:w-[420px] sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
        {/* Full-bleed vertical video canvas */}
        <div className="absolute inset-0">
          {primaryTile ? (
            <FullBleedTrackVideo tile={primaryTile} />
          ) : !lkConnected && recordingUrl ? (
            <video
              src={recordingUrl}
              controls
              playsInline
              className="h-full w-full object-contain bg-black"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#10121a] px-6 text-center text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                <Radio className="h-6 w-6 text-purple-400" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">
                {lkConnecting
                  ? 'Connecting to live stream…'
                  : lkConnected
                    ? 'Waiting for host camera…'
                    : streamStatus === 'ended'
                      ? 'This live stream has ended'
                      : 'Live stream ready'}
              </p>
              {!lkConnected && streamStatus !== 'ended' && (
                <button
                  type="button"
                  onClick={onJoinWatch}
                  className="mt-4 rounded-full bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-500"
                >
                  Tap to Watch Live
                </button>
              )}
            </div>
          )}
        </div>

        {/* Top & Bottom legibility gradients */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/75 via-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

        {/* TOP BAR: Back button + Stream Title + LIVE count + Audio mute */}
        <header className="relative z-20 flex items-center justify-between gap-2 px-3.5 pt-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/75"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 rounded-full bg-black/45 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md">
              <p className="truncate text-xs font-semibold text-white">{streamTitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {streamStatus === 'live' ? 'LIVE' : streamStatus.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md tabular-nums">
              <Users className="h-3 w-3" />
              {viewerCount}
            </span>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/75"
            >
              {muted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Active Live Poll Floating Card (Top-below header) */}
        {activePoll && activePoll.status === 'active' && (
          <div className="relative z-20 mx-3.5 mt-3 rounded-2xl bg-black/65 p-3 text-white ring-1 ring-white/15 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
              <span className="inline-flex items-center gap-1">
                <BarChart2 className="h-3.5 w-3.5" /> Live Poll
              </span>
              <span>{activePoll.totalVotes} votes</span>
            </div>
            <p className="mt-1 text-xs font-semibold">{activePoll.question}</p>
            <div className="mt-2 space-y-1.5">
              {activePoll.options.map((opt) => {
                const pct =
                  activePoll.totalVotes > 0
                    ? Math.round((opt.votes / activePoll.totalVotes) * 100)
                    : 0;
                const voted = activePoll.viewerVote === opt.index;
                return (
                  <button
                    key={opt.index}
                    type="button"
                    onClick={() => onVotePoll(activePoll.id, opt.index)}
                    className={`relative w-full overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs ${
                      voted ? 'border-purple-400 bg-purple-600/25' : 'border-white/15 bg-white/5'
                    }`}
                  >
                    <div
                      style={{ width: `${pct}%` }}
                      className="pointer-events-none absolute inset-y-0 left-0 bg-purple-500/30"
                    />
                    <div className="relative flex justify-between">
                      <span className="truncate">{opt.label}</span>
                      <span className="font-bold tabular-nums">{pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Host Lower-Third / Pinned Overlay */}
        {(studioState.pinnedMessage || (studioState.lowerThirdVisible && studioState.lowerThirdText)) && (
          <div className="relative z-20 mx-3.5 mt-2 space-y-1.5">
            {studioState.pinnedMessage && (
              <div className="rounded-xl bg-black/70 px-3 py-2 text-xs text-white ring-1 ring-amber-400/40 backdrop-blur-md">
                <span className="font-bold text-amber-300">
                  {studioState.pinnedMessage.senderName}
                  {studioState.pinnedMessage.amountCredits
                    ? ` · ${studioState.pinnedMessage.amountCredits} cr`
                    : ''}
                </span>
                <p className="mt-0.5 text-zinc-100">{studioState.pinnedMessage.message}</p>
              </div>
            )}
            {studioState.lowerThirdVisible && studioState.lowerThirdText && (
              <div className="rounded-lg border-l-2 border-purple-500 bg-black/70 px-3 py-1.5 text-white backdrop-blur-md">
                <p className="text-xs font-bold">{studioState.lowerThirdText}</p>
                {studioState.lowerThirdSubtext && (
                  <p className="text-[11px] text-zinc-300">{studioState.lowerThirdSubtext}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Floating Animated Stickers / Reactions */}
        <div className="pointer-events-none absolute bottom-28 right-14 z-20 h-60 w-24 overflow-visible">
          {reactions.map((r) => (
            <span
              key={r.id}
              style={{ left: `${r.offsetX}%` }}
              className="hb-viewer-float absolute bottom-0 text-3xl drop-shadow-lg select-none"
            >
              {r.emoji}
            </span>
          ))}
        </div>

        {/* Spacer pushes bottom chat + rails to bottom */}
        <div className="mt-auto relative z-20 px-3.5 pb-3.5">
          <div className="flex items-end justify-between gap-3">
            {/* Bottom-Left Translucent Live Chat Feed */}
            <div className="max-h-44 flex-1 space-y-1.5 overflow-y-auto pr-1 [mask-image:linear-gradient(to_bottom,transparent,black_22%)]">
              {recentMessages.map((m) => {
                const sc = m.message.match(/^\[SUPERCHAT:(\d+):(\w+)\]\s*([\s\S]*)$/);
                if (sc) {
                  return (
                    <div
                      key={m.id}
                      className="inline-block max-w-full rounded-xl bg-amber-500/25 px-3 py-1.5 text-xs text-amber-50 ring-1 ring-amber-400/40 backdrop-blur-md"
                    >
                      <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                        <Sparkles className="h-3 w-3" /> {m.senderName} · {sc[1]} cr
                      </span>
                      <p className="break-words text-white">{sc[3]}</p>
                    </div>
                  );
                }
                return (
                  <div
                    key={m.id}
                    className="inline-block max-w-full rounded-2xl bg-black/45 px-3 py-1.5 text-xs text-white backdrop-blur-xs"
                  >
                    <span className="mr-1.5 font-semibold text-purple-300">{m.senderName}</span>
                    <span className="break-words text-zinc-100">{m.message}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom-Right Vertical Action Rail (Reels style) */}
            <div className="flex shrink-0 flex-col items-center gap-3 pb-1">
              <button
                type="button"
                onClick={() => {
                  setStickerOpen((v) => !v);
                  setSuperOpen(false);
                }}
                aria-label="Send sticker"
                className="flex flex-col items-center gap-1 text-white"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/15 backdrop-blur-md transition ${
                    stickerOpen ? 'bg-purple-600 text-white' : 'bg-black/50 hover:bg-black/75'
                  }`}
                >
                  <Smile className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium">Stickers</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuperOpen((v) => !v);
                  setStickerOpen(false);
                }}
                aria-label="Send Super Chat"
                className="flex flex-col items-center gap-1 text-white"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/15 backdrop-blur-md transition ${
                    superOpen ? 'bg-amber-400 text-zinc-950' : 'bg-black/50 text-amber-300 hover:bg-black/75'
                  }`}
                >
                  <Coins className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium">Gift</span>
              </button>

              <button
                type="button"
                disabled={cohostRequestStatus === 'pending'}
                onClick={onRequestCohost}
                aria-label="Request to Co-Host"
                className="flex flex-col items-center gap-1 text-white disabled:opacity-70"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/15 backdrop-blur-md transition ${
                    cohostRequestStatus === 'pending'
                      ? 'bg-purple-600/80 text-white'
                      : 'bg-black/50 hover:bg-purple-600'
                  }`}
                >
                  <UserPlus className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium">
                  {cohostRequestStatus === 'pending' ? 'Pending' : 'Co-Host'}
                </span>
              </button>

              <button
                type="button"
                onClick={onShare}
                aria-label="Share stream"
                className="flex flex-col items-center gap-1 text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/75">
                  <Share2 className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Interactive Sticker Tray Popover */}
          {stickerOpen && (
            <div className="mt-2.5 rounded-2xl bg-[#14161f]/95 p-3 ring-1 ring-white/15 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-200">
                <span>Tap a Sticker</span>
                <button type="button" onClick={() => setStickerOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {LIVE_STICKERS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSendSticker(s.emoji, s.label)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white/[0.05] py-2 transition hover:bg-white/15 active:scale-95"
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[10px] font-medium text-zinc-300">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Super Chat Credit Tip Popover */}
          {superOpen && (
            <form
              onSubmit={handleSuperSubmit}
              className="mt-2.5 space-y-2 rounded-2xl bg-[#14161f]/95 p-3 ring-1 ring-amber-400/30 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                <span>Send Super Chat (Credits)</span>
                <button type="button" onClick={() => setSuperOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {SUPER_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSuperAmount(amt)}
                    className={`rounded-lg py-1 text-[11px] font-bold ${
                      superAmount === amt ? 'bg-amber-400 text-zinc-950' : 'bg-white/10 text-zinc-200'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={superMsg}
                  onChange={(e) => setSuperMsg(e.target.value)}
                  maxLength={280}
                  placeholder="Write your highlighted message…"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingSuper || !superMsg.trim()}
                  className="rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 disabled:opacity-50"
                >
                  {sendingSuper ? '…' : `Send ${superAmount}`}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Comment Input */}
          <form onSubmit={onSendChat} className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={chatDraft}
              onChange={(e) => onChatDraftChange(e.target.value)}
              placeholder="Add a comment…"
              className="min-w-0 flex-1 rounded-full bg-black/55 px-4 py-2.5 text-xs text-white ring-1 ring-white/15 backdrop-blur-md placeholder:text-zinc-400 focus:outline-none focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatDraft.trim()}
              aria-label="Send comment"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white transition hover:bg-purple-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <style jsx>{`
          .hb-viewer-float {
            animation: hbViewerFloat 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          @keyframes hbViewerFloat {
            0% {
              transform: translateY(0) scale(0.7);
              opacity: 0;
            }
            18% {
              opacity: 1;
              transform: translateY(-28px) scale(1.15);
            }
            100% {
              transform: translateY(-230px) scale(0.95);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
