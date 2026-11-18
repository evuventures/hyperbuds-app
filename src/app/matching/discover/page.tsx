'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { SlidersHorizontal } from 'lucide-react';

interface SuggestionItem {
  _id?: string;
  userId?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  niche?: string[];
  stats?: {
    totalFollowers?: number;
    avgEngagement?: number;
    rizzScore?: number;
  };
  matchReasons?: string[];
}

export default function MatchingDiscoverPage() {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get('/matching/suggestions?limit=20');
        const list = Array.isArray(res.data?.suggestions)
          ? res.data.suggestions
          : Array.isArray(res.data?.matches)
            ? res.data.matches
            : [];
        if (active) setSuggestions(list);
      } catch (err) {
        if (active) {
          setError(
            (err as { message?: string })?.message || 'Unable to load match suggestions.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suggestions;
    return suggestions.filter((item) => {
      const text = [
        item.displayName,
        item.username,
        item.bio,
        ...(item.niche ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
  }, [suggestions, query]);

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Creator Matching
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Discover Collaborators
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Browse ranked creator suggestions based on niche overlap and measured engagement.
              </p>
            </div>
            <Link
              href="/matching/preferences"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Preferences
            </Link>
          </div>

          <div className="mt-5">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, handle, or niche..."
              className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No matching creators found. Adjust your{' '}
              <Link href="/matching/preferences" className="underline">
                matching preferences
              </Link>
              .
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, idx) => (
                <article
                  key={item._id || item.userId || idx}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {item.displayName || item.username || 'Creator'}
                        </h2>
                        {item.username && (
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            @{item.username}
                          </p>
                        )}
                      </div>
                      {typeof item.stats?.rizzScore === 'number' && (
                        <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          Rizz {Math.round(item.stats.rizzScore)}
                        </span>
                      )}
                    </div>

                    {item.bio && (
                      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.bio}
                      </p>
                    )}

                    {Array.isArray(item.niche) && item.niche.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.niche.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs dark:border-slate-800">
                    <span className="tabular-nums text-slate-500 dark:text-slate-400">
                      {(item.stats?.totalFollowers ?? 0).toLocaleString()} followers
                    </span>
                    {item.username ? (
                      <Link
                        href={`/profile/${item.username}`}
                        className="font-medium text-slate-900 hover:underline dark:text-white"
                      >
                        View profile
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
