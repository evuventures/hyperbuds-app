'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api/client';
import { BellRing, Users } from 'lucide-react';

export interface MentionSuggestion {
  type: 'special' | 'user' | 'group';
  handle: string;
  label: string;
  subtitle: string;
  avatar?: string;
}

export function getTrailingMentionQuery(text: string): string | null {
  const match = text.match(/(?:^|[\s(])@([a-zA-Z0-9_.-]{0,32})$/);
  if (!match) return null;
  return match[1] ?? '';
}

export function applyMentionToText(text: string, handle: string): string {
  return text.replace(/((?:^|[\s(]))@[a-zA-Z0-9_.-]{0,32}$/, `$1@${handle} `);
}

export function MentionAutocomplete({
  text,
  onSelect,
  placement = 'bottom',
}: {
  text: string;
  onSelect: (nextText: string) => void;
  placement?: 'top' | 'bottom';
}) {
  const query = getTrailingMentionQuery(text);
  const [items, setItems] = useState<MentionSuggestion[]>([]);

  useEffect(() => {
    if (query === null) {
      setItems([]);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      apiClient
        .get(`/feed/mentions/suggest?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!active) return;
          setItems(Array.isArray(res.data?.suggestions) ? res.data.suggestions : []);
        })
        .catch(() => {
          if (active) setItems([]);
        });
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (query === null || items.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Mention suggestions"
      className={`absolute left-0 right-0 z-40 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900 ${
        placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
      }`}
    >
      {items.map((item) => (
        <button
          key={`${item.type}:${item.handle}`}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(applyMentionToText(text, item.handle));
          }}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition hover:bg-purple-50 dark:hover:bg-purple-950/40"
        >
          {item.type === 'special' ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <BellRing className="h-3.5 w-3.5" />
            </span>
          ) : item.type === 'group' ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              <Users className="h-3.5 w-3.5" />
            </span>
          ) : item.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.avatar}
              alt={item.label}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[11px] font-bold text-white">
              {item.label.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-slate-900 dark:text-white">{item.label}</p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{item.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-slate-800 dark:text-purple-300">
            @{item.handle}
          </span>
        </button>
      ))}
    </div>
  );
}

export default MentionAutocomplete;
