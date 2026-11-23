'use client';

import React, { useState } from 'react';
import {
  BarChart2,
  Coins,
  Pin,
  Send,
  Shield,
  Sparkles,
  Trash2,
  VolumeX,
  X,
} from 'lucide-react';

export interface LiveChatItem {
  id: string;
  userId?: string;
  senderName: string;
  message: string;
  createdAt?: string;
}

export interface StreamPollItem {
  id: string;
  question: string;
  options: Array<{ index: number; label: string; votes: number }>;
  totalVotes: number;
  viewerVote?: number | null;
  status: 'active' | 'closed' | string;
}

interface LiveChatPanelProps {
  messages: LiveChatItem[];
  activePoll: StreamPollItem | null;
  slowModeSeconds: number;
  isHost: boolean;
  chatDraft: string;
  sendingChat: boolean;
  onChatDraftChange: (val: string) => void;
  onSendChat: (e: React.FormEvent) => void;
  onSendReaction: (emoji: string) => void;
  onSendSuperChat: (amountCredits: number, message: string) => Promise<void>;
  onVotePoll: (pollId: string, optionIndex: number) => void;
  onClosePoll: (pollId: string) => void;
  onPinMessage: (msg: LiveChatItem, superChat?: { amount: number; tier: string }) => void;
  onDeleteMessage: (messageId: string) => void;
  onMuteUser: (userId: string) => void;
  onToggleSlowMode: (seconds: number) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const REACTIONS = ['🔥', '❤️', '👏', '⚡', '😂', '💎'];
const SUPER_CHAT_AMOUNTS = [10, 25, 50, 100, 250, 500];

function parseSuperChat(raw: string): { amount: number; tier: string; text: string } | null {
  const m = raw.match(/^\[SUPERCHAT:(\d+):(\w+)\]\s*([\s\S]*)$/);
  if (!m) return null;
  return { amount: Number(m[1]), tier: m[2], text: m[3] };
}

function superChatTierStyle(tier: string) {
  switch (tier) {
    case 'diamond':
      return 'border-cyan-400/50 bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-50';
    case 'gold':
      return 'border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-50';
    case 'purple':
      return 'border-purple-400/50 bg-gradient-to-r from-purple-500/25 to-fuchsia-500/25 text-purple-50';
    default:
      return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50';
  }
}

export function LiveChatPanel({
  messages,
  activePoll,
  slowModeSeconds,
  isHost,
  chatDraft,
  sendingChat,
  onChatDraftChange,
  onSendChat,
  onSendReaction,
  onSendSuperChat,
  onVotePoll,
  onClosePoll,
  onPinMessage,
  onDeleteMessage,
  onMuteUser,
  onToggleSlowMode,
  chatEndRef,
}: LiveChatPanelProps) {
  const [superOpen, setSuperOpen] = useState(false);
  const [superAmount, setSuperAmount] = useState(25);
  const [superMsg, setSuperMsg] = useState('');
  const [sendingSuper, setSendingSuper] = useState(false);

  const handleSubmitSuper = async (e: React.FormEvent) => {
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
    <aside className="flex h-[540px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12141a] text-white lg:h-full">
      {/* Chat Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Live Chat</h3>
        </div>

        <div className="flex items-center gap-2">
          {slowModeSeconds > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
              Slow · {slowModeSeconds}s
            </span>
          )}
          {isHost && (
            <button
              type="button"
              onClick={() => onToggleSlowMode(slowModeSeconds > 0 ? 0 : 10)}
              title="Toggle 10s slow mode"
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                slowModeSeconds > 0
                  ? 'bg-amber-500/20 text-amber-200'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Shield className="h-3 w-3" />
              {slowModeSeconds > 0 ? 'Slow On' : 'Slow Mode'}
            </button>
          )}
        </div>
      </div>

      {/* Active Live Poll Card */}
      {activePoll && activePoll.status === 'active' && (
        <div className="shrink-0 border-b border-white/10 bg-white/[0.03] px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-300">
              <BarChart2 className="h-3.5 w-3.5" />
              Live Poll · {activePoll.totalVotes} {activePoll.totalVotes === 1 ? 'vote' : 'votes'}
            </div>
            {isHost && (
              <button
                type="button"
                onClick={() => onClosePoll(activePoll.id)}
                className="text-[11px] text-zinc-400 hover:text-white"
              >
                End poll
              </button>
            )}
          </div>
          <p className="mt-1 text-xs font-semibold text-white">{activePoll.question}</p>
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
                  className={`relative w-full overflow-hidden rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                    voted
                      ? 'border-purple-400/70 bg-purple-500/15 text-white'
                      : 'border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/25'
                  }`}
                >
                  <div
                    style={{ width: `${pct}%` }}
                    className="pointer-events-none absolute inset-y-0 left-0 bg-purple-500/20 transition-all duration-300"
                  />
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{opt.label}</span>
                    <span className="shrink-0 text-[11px] font-bold tabular-nums text-zinc-300">
                      {pct}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3.5 py-3">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-xs text-zinc-500">
            Welcome to the live chat! Say hi or send a reaction below.
          </p>
        ) : (
          messages.map((m) => {
            const sc = parseSuperChat(m.message);
            if (sc) {
              return (
                <div
                  key={m.id}
                  className={`group relative rounded-xl border px-3 py-2.5 ${superChatTierStyle(sc.tier)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      {m.senderName}
                    </span>
                    <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold tabular-nums">
                      {sc.amount} cr
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/95">{sc.text}</p>
                  {isHost && (
                    <div className="mt-1.5 flex items-center gap-1.5 opacity-80">
                      <button
                        type="button"
                        onClick={() => onPinMessage(m, { amount: sc.amount, tier: sc.tier })}
                        className="inline-flex items-center gap-1 rounded bg-black/30 px-2 py-0.5 text-[10px] font-semibold hover:bg-black/50"
                      >
                        <Pin className="h-2.5 w-2.5" /> Show on stage
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className="group flex items-start justify-between gap-2 rounded-lg px-2 py-1 transition hover:bg-white/[0.04]"
              >
                <div className="min-w-0 flex-1 text-xs leading-relaxed">
                  <span className="mr-1.5 font-semibold text-purple-300">{m.senderName}</span>
                  <span className="break-words text-zinc-200">{m.message}</span>
                </div>

                {isHost && (
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onPinMessage(m)}
                      title="Show message on stage"
                      className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-amber-300"
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(m.id)}
                      title="Delete message"
                      className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {m.userId && (
                      <button
                        type="button"
                        onClick={() => onMuteUser(m.userId!)}
                        title="Mute user"
                        className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-rose-400"
                      >
                        <VolumeX className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Super Chat Popover */}
      {superOpen && (
        <form
          onSubmit={handleSubmitSuper}
          className="shrink-0 space-y-2.5 border-t border-white/10 bg-[#181b23] px-3.5 py-3"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Coins className="h-3.5 w-3.5" />
              Send Super Chat (Credits)
            </span>
            <button
              type="button"
              onClick={() => setSuperOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {SUPER_CHAT_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSuperAmount(amt)}
                className={`rounded-lg py-1 text-[11px] font-bold transition ${
                  superAmount === amt
                    ? 'bg-amber-400 text-zinc-950'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={superMsg}
              onChange={(e) => setSuperMsg(e.target.value)}
              maxLength={280}
              placeholder="Write your highlighted message…"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sendingSuper || !superMsg.trim()}
              className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 disabled:opacity-50"
            >
              {sendingSuper ? '…' : `Send ${superAmount}`}
            </button>
          </div>
        </form>
      )}

      {/* Quick Reactions + Composer */}
      <div className="shrink-0 border-t border-white/10 bg-[#0e1015] px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSendReaction(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-sm transition hover:scale-110 hover:bg-white/15 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
          {!isHost && (
            <button
              type="button"
              onClick={() => setSuperOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-400/25"
            >
              <Coins className="h-3 w-3" />
              Super Chat
            </button>
          )}
        </div>

        <form onSubmit={onSendChat} className="flex items-center gap-2">
          <input
            type="text"
            value={chatDraft}
            onChange={(e) => onChatDraftChange(e.target.value)}
            placeholder="Say something in live chat…"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sendingChat || !chatDraft.trim()}
            aria-label="Send chat message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white transition hover:bg-purple-500 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
