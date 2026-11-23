'use client';

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface PendingCohostRequest {
  userId: string;
  displayName?: string | null;
  username?: string | null;
  avatar?: string | null;
}

interface PendingCohostCardProps {
  requests: PendingCohostRequest[];
  busyUserId: string | null;
  onAdmit: (userId: string) => void;
  onDeny: (userId: string) => void;
}

/**
 * Floating "Pending" co-host admission card styled in HyperBuds dark obsidian + purple/rose theme.
 */
export function PendingCohostCard({
  requests,
  busyUserId,
  onAdmit,
  onDeny,
}: PendingCohostCardProps) {
  if (requests.length === 0) return null;
  const active = requests[0];
  const name = active.displayName || active.username || 'Creator';
  const busy = busyUserId === active.userId;

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-[#161923] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold tracking-tight text-white">Pending</h3>
          {requests.length > 1 && (
            <span className="rounded-full bg-purple-600/25 px-2 py-0.5 text-[10px] font-bold text-purple-300">
              +{requests.length - 1} more
            </span>
          )}
        </div>
        <MoreHorizontal className="h-4 w-4 text-zinc-500" />
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        {active.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.avatar}
            alt={name}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-purple-500/40"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600/30 text-xs font-bold text-purple-200 ring-1 ring-purple-500/40">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          {active.username && (
            <p className="truncate text-[11px] text-zinc-400">@{active.username}</p>
          )}
        </div>
      </div>

      <p className="mt-2.5 text-xs text-zinc-300">Wants to co-host this live stream!</p>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => onAdmit(active.userId)}
          className="rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-purple-500 disabled:opacity-50"
        >
          {busy ? '…' : 'Admit'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDeny(active.userId)}
          className="rounded-xl bg-rose-500 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-400 disabled:opacity-50"
        >
          Deny
        </button>
      </div>
    </div>
  );
}
