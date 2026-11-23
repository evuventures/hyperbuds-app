'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AtSign, Loader2, Search, X } from 'lucide-react';
import apiClient from '@/lib/api/client';

export interface CreatorHandleSuggestion {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

interface CreatorHandlePickerProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (creator: CreatorHandleSuggestion) => void;
  excludeHandles?: string[];
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Clean @profile creator lookup input powered by GET /feed/mentions/suggest.
 * Allows typing "@username" or display name and picking a verified HyperBuds creator.
 */
export function CreatorHandlePicker({
  value,
  onChange,
  onSelect,
  excludeHandles = [],
  placeholder = 'Search by @username or name…',
  disabled = false,
}: CreatorHandlePickerProps) {
  const [suggestions, setSuggestions] = useState<CreatorHandleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedQuery = value.replace(/^@+/, '').trim();
  const excludedSet = new Set(excludeHandles.map((h) => h.replace(/^@+/, '').toLowerCase()));

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(
          `/feed/mentions/suggest?q=${encodeURIComponent(normalizedQuery)}`,
        );
        if (cancelled) return;
        const raw = Array.isArray(res.data?.suggestions) ? res.data.suggestions : [];
        const users: CreatorHandleSuggestion[] = raw
          .filter((item: { type?: string; handle?: string }) => item?.type === 'user' && item?.handle)
          .map((item: { id?: string; handle: string; label?: string; avatar?: string }) => ({
            id: String(item.id || item.handle),
            username: String(item.handle),
            displayName: String(item.label || item.handle),
            avatar: item.avatar ? String(item.avatar) : undefined,
          }))
          .filter((u: CreatorHandleSuggestion) => !excludedSet.has(u.username.toLowerCase()));
        setSuggestions(users);
        setActiveIdx(0);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedQuery, open, excludeHandles.join(',')]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pick = (creator: CreatorHandleSuggestion) => {
    onSelect(creator);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <AtSign className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open || suggestions.length === 0) return;
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIdx((i) => (i + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter' && suggestions[activeIdx]) {
              e.preventDefault();
              pick(suggestions[activeIdx]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-white/10"
        />
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-3 h-4 w-4 animate-spin text-slate-400" />
        ) : value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 rounded p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Search className="pointer-events-none absolute right-3 h-4 w-4 text-slate-300 dark:text-slate-600" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {suggestions.length === 0 ? (
            <p className="px-3 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
              {loading
                ? 'Searching creators…'
                : normalizedQuery
                  ? `No creator found matching "@${normalizedQuery}"`
                  : 'Start typing a @username or name'}
            </p>
          ) : (
            suggestions.map((creator, idx) => (
              <button
                key={`${creator.id}-${creator.username}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(creator);
                }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition ${
                  idx === activeIdx
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {creator.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.avatar}
                    alt={creator.displayName}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {creator.displayName.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {creator.displayName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    @{creator.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
