'use client';

import React from 'react';

function Bone({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`}
    />
  );
}

/** Full-page route transition skeleton (replaces global "Loading…") */
export function PageShellSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      <Bone className="h-36 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Bone className="h-24 rounded-2xl" />
        <Bone className="h-24 rounded-2xl" />
        <Bone className="h-24 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <FeedPostSkeleton />
        <FeedPostSkeleton />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Social feed post / reel card skeleton */
export function FeedPostSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="status"
      aria-label="Loading post"
      className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <Bone className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Bone className="h-3.5 w-36 rounded-md" />
          <Bone className="h-2.5 w-24 rounded-md" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Bone className="h-3 w-full rounded-md" />
        <Bone className="h-3 w-4/5 rounded-md" />
      </div>
      {!compact && <Bone className="mt-3 h-56 w-full rounded-xl" />}
      <div className="mt-3 flex items-center gap-4">
        <Bone className="h-6 w-14 rounded-full" />
        <Bone className="h-6 w-16 rounded-full" />
        <Bone className="h-6 w-14 rounded-full" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Responsive card grid skeleton for Matches, Collaborations, Bookings, Startup Hub */
export function CardGridSkeleton({
  count = 4,
  columns = 2,
  darkSurface = false,
}: {
  count?: number;
  columns?: 1 | 2 | 3;
  darkSurface?: boolean;
}) {
  const gridClass =
    columns === 1
      ? 'grid-cols-1'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';
  const cardClass = darkSurface
    ? 'border-white/10 bg-white/[0.04]'
    : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900';

  return (
    <div
      role="status"
      aria-label="Loading items"
      className={`grid gap-4 ${gridClass}`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`space-y-4 rounded-2xl border p-5 ${cardClass}`}
        >
          <div className="flex items-center gap-3">
            <Bone className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-2/3 rounded-md" />
              <Bone className="h-3 w-1/3 rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <Bone className="h-3 w-full rounded-md" />
            <Bone className="h-3 w-5/6 rounded-md" />
          </div>
          <div className="flex gap-2 pt-1">
            <Bone className="h-8 flex-1 rounded-xl" />
            <Bone className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Profile page / Rizz Score skeleton */
export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Bone className="h-36 w-full rounded-none" />
        <div className="p-6">
          <div className="-mt-14 flex items-end gap-4">
            <Bone className="h-24 w-24 rounded-full ring-4 ring-white dark:ring-slate-900" />
            <div className="flex-1 space-y-2 pb-1">
              <Bone className="h-5 w-44 rounded-md" />
              <Bone className="h-3.5 w-28 rounded-md" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Bone className="h-3.5 w-full rounded-md" />
            <Bone className="h-3.5 w-3/4 rounded-md" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Bone className="h-16 rounded-2xl" />
            <Bone className="h-16 rounded-2xl" />
            <Bone className="h-16 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Bone className="h-44 rounded-2xl" />
        <Bone className="h-44 rounded-2xl" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Chat message bubbles skeleton */
export function MessageListSkeleton() {
  return (
    <div role="status" aria-label="Loading messages" className="space-y-4 py-2">
      {[false, true, false, true, false].map((isMe, i) => (
        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
          <div className={`space-y-1.5 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
            <Bone
              className={`h-11 rounded-2xl ${
                isMe ? 'w-52 rounded-br-sm bg-purple-200/70 dark:bg-purple-900/40' : 'w-64 rounded-bl-sm'
              }`}
            />
            <Bone className="h-2.5 w-14 rounded-md" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Notification rows skeleton */
export function NotificationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading notifications" className="divide-y divide-slate-100 p-3 dark:divide-slate-800">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3">
          <Bone className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Bone className="h-3.5 w-3/4 rounded-md" />
            <Bone className="h-3 w-1/2 rounded-md" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}
