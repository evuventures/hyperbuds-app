'use client';

import React from 'react';
import { Pin, Sparkles, Wifi, WifiOff, X } from 'lucide-react';

export interface FloatingReaction {
  id: string;
  emoji: string;
  offsetX: number;
}

export interface PinnedStageMessage {
  id: string;
  senderName: string;
  message: string;
  amountCredits?: number;
  tier?: string;
}

export interface StudioOverlayState {
  lowerThirdText: string;
  lowerThirdSubtext: string;
  lowerThirdVisible: boolean;
  pinnedMessage: PinnedStageMessage | null;
  layoutMode: 'pip' | 'grid' | 'split' | 'solo';
  stageUserIds: string[];
  slowModeSeconds: number;
}

interface StageOverlaysProps {
  studioState: StudioOverlayState;
  reactions: FloatingReaction[];
  connectionQuality: 'good' | 'fair' | 'reconnecting';
  isHost: boolean;
  onDismissPinned?: () => void;
}

export function StageOverlays({
  studioState,
  reactions,
  connectionQuality,
  isHost,
  onDismissPinned,
}: StageOverlaysProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Top-right subtle broadcast health pill */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-zinc-100 ring-1 ring-white/15 backdrop-blur-md">
        {connectionQuality === 'reconnecting' ? (
          <>
            <WifiOff className="h-3 w-3 text-rose-400" />
            <span className="text-rose-300">Reconnecting…</span>
          </>
        ) : (
          <>
            <Wifi
              className={`h-3 w-3 ${
                connectionQuality === 'good' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span>{connectionQuality === 'good' ? 'HD · Stable' : 'Fair signal'}</span>
          </>
        )}
      </div>

      {/* Floating Emoji Reactions */}
      <div className="absolute bottom-6 right-4 h-64 w-24 overflow-visible">
        {reactions.map((r) => (
          <span
            key={r.id}
            style={{ left: `${r.offsetX}%` }}
            className="hb-float-reaction absolute bottom-0 text-2xl drop-shadow-md select-none"
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Lower-Left Overlay Stack: Pinned Chat / Super Chat + Lower-Third Broadcast Banner */}
      <div className="absolute bottom-3 left-3 right-16 flex flex-col items-start gap-2 sm:bottom-4 sm:left-4 sm:max-w-lg">
        {studioState.pinnedMessage && (
          <div className="pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-xl border border-white/15 bg-black/80 px-3.5 py-2.5 text-white shadow-2xl backdrop-blur-md">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
              {studioState.pinnedMessage.amountCredits ? (
                <Sparkles className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-xs font-bold text-white">
                  {studioState.pinnedMessage.senderName}
                </span>
                {studioState.pinnedMessage.amountCredits ? (
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {studioState.pinnedMessage.amountCredits} cr Super Chat
                  </span>
                ) : (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs leading-snug text-zinc-200">
                {studioState.pinnedMessage.message}
              </p>
            </div>
            {isHost && onDismissPinned && (
              <button
                type="button"
                onClick={onDismissPinned}
                aria-label="Remove pinned overlay"
                className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {studioState.lowerThirdVisible && studioState.lowerThirdText.trim() && (
          <div className="overflow-hidden rounded-lg border-l-4 border-purple-500 bg-zinc-950/90 px-4 py-2 text-white shadow-xl backdrop-blur-md">
            <p className="text-sm font-bold tracking-tight text-white">
              {studioState.lowerThirdText}
            </p>
            {studioState.lowerThirdSubtext.trim() && (
              <p className="mt-0.5 text-xs text-zinc-300">{studioState.lowerThirdSubtext}</p>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .hb-float-reaction {
          animation: hbReactionRise 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes hbReactionRise {
          0% {
            transform: translateY(0) scale(0.75);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-24px) scale(1.1);
          }
          100% {
            transform: translateY(-210px) scale(0.95);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
