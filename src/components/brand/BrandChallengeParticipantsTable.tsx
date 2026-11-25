'use client';

import React from 'react';
import Link from 'next/link';
import { formatCompactCount } from '@/lib/utils/formatCount';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MousePointerClick,
  Search,
} from 'lucide-react';

export interface BrandChallengeParticipantRow {
  entryId: string;
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  rizzScore: number;
  followersCount: number;
  status: 'joined' | 'verified' | string;
  joinedAt: string;
  verifiedAt?: string | null;
  rewardedCredits: number;
  rewardedRizz: number;
  postsCount: number;
  latestPostId?: string | null;
  latestPostKind?: string;
  latestPostCaption?: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  bookmarksCount: number;
  engagementsCount: number;
  engagementRate: number;
  clicksCount: number;
  clickRate: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

interface BrandChallengeParticipantsTableProps {
  participants: BrandChallengeParticipantRow[];
  pagination: PaginationInfo;
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'verified' | 'joined';
  onStatusFilterChange: (val: 'all' | 'verified' | 'joined') => void;
  sortBy: 'views' | 'engagements' | 'ctr' | 'recent';
  onSortByChange: (val: 'views' | 'engagements' | 'ctr' | 'recent') => void;
  pageSize: number;
  onPageSizeChange: (val: number) => void;
  onPageChange: (nextPage: number) => void;
}

export function BrandChallengeParticipantsTable({
  participants,
  pagination,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: BrandChallengeParticipantsTableProps) {
  const startIdx = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endIdx = Math.min(pagination.total, pagination.page * pagination.limit);

  // Build compact visible page numbers around current page (handles 50+ pages for 1,000+ influencers)
  const pageNumbers: number[] = [];
  const totalPages = Math.max(1, pagination.pages);
  const winStart = Math.max(1, pagination.page - 2);
  const winEnd = Math.min(totalPages, pagination.page + 2);
  for (let p = winStart; p <= winEnd; p++) pageNumbers.push(p);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
            Creators Who Hopped On This Challenge
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Per-influencer views, engagements, engagement rate, post link clicks, and click-through rate (CTR %).
          </p>
        </div>

        {/* Search + Filters + Sort + Page Size */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search @creator..."
              className="w-40 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-48"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'verified' | 'joined')}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Posts</option>
            <option value="joined">Joined (Pending Post)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'views' | 'engagements' | 'ctr' | 'recent')}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="views">Sort: Highest Views</option>
            <option value="engagements">Sort: Highest Engagements</option>
            <option value="ctr">Sort: Highest Click Rate (CTR)</option>
            <option value="recent">Sort: Most Recent</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          ))}
        </div>
      ) : participants.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-500 dark:border-slate-800">
          No creators match this filter yet. Share your challenge hashtag so micro-influencers can hop on!
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                <th className="pb-2.5 pr-3">Creator</th>
                <th className="pb-2.5 px-2">Status &amp; Post</th>
                <th className="pb-2.5 px-2 text-right">Views</th>
                <th className="pb-2.5 px-2 text-right">Engagements</th>
                <th className="pb-2.5 px-2 text-right">Eng. Rate</th>
                <th className="pb-2.5 px-2 text-right">Post Clicks</th>
                <th className="pb-2.5 px-2 text-right">Click Rate (CTR)</th>
                <th className="pb-2.5 pl-2 text-right">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {participants.map((row) => (
                <tr key={row.entryId || row.userId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      {row.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.avatar}
                          alt={row.displayName}
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                          {(row.displayName || 'C').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={row.username ? `/creator/${encodeURIComponent(row.username)}` : '#'}
                          className="block truncate font-bold text-slate-900 hover:text-purple-600 dark:text-white dark:hover:text-purple-400"
                        >
                          {row.displayName}
                        </Link>
                        <span className="block truncate text-[11px] text-slate-400">
                          {row.username ? `@${row.username}` : 'Creator'} · Rizz {Math.round(row.rizzScore || 0)} ·{' '}
                          {formatCompactCount(row.followersCount || 0)} followers
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {row.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> Verified ({row.postsCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          <Clock className="h-3 w-3" /> Joined
                        </span>
                      )}
                      {row.latestPostId && (
                        <Link
                          href={`/post/${encodeURIComponent(row.latestPostId)}`}
                          className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-100 dark:bg-slate-800 dark:text-purple-300"
                        >
                          View Post <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCompactCount(row.viewsCount)}
                  </td>

                  <td className="py-3 px-2 text-right font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    <div>{formatCompactCount(row.engagementsCount)}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      {formatCompactCount(row.likesCount)}L · {formatCompactCount(row.commentsCount)}C ·{' '}
                      {formatCompactCount(row.repostsCount + row.bookmarksCount)}S
                    </div>
                  </td>

                  <td className="py-3 px-2 text-right font-semibold text-purple-600 dark:text-purple-400 tabular-nums">
                    {row.engagementRate}%
                  </td>

                  <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                    <span className="inline-flex items-center justify-end gap-1">
                      <MousePointerClick className="h-3 w-3 text-orange-500" />
                      {formatCompactCount(row.clicksCount)}
                    </span>
                  </td>

                  <td className="py-3 px-2 text-right tabular-nums">
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                      {row.clickRate}%
                    </span>
                  </td>

                  <td className="py-3 pl-2 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {row.rewardedCredits > 0 ? `+${row.rewardedCredits} CR` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Pagination Bar for 1,000+ Influencers */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
          Showing <strong>{startIdx}</strong>–<strong>{endIdx}</strong> of{' '}
          <strong>{pagination.total.toLocaleString()}</strong> creators
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>

          {winStart > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                1
              </button>
              {winStart > 2 && <span className="px-1 text-slate-400">…</span>}
            </>
          )}

          {pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`rounded-lg px-2.5 py-1.5 font-bold transition ${
                num === pagination.page
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {num}
            </button>
          ))}

          {winEnd < totalPages && (
            <>
              {winEnd < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            disabled={!pagination.hasMore}
            onClick={() => onPageChange(pagination.page + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
