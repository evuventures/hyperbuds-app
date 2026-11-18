'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Film,
  Layers,
  Newspaper,
  Package,
  Radio,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface DashboardLeftRailProps {
  user?: {
    displayName?: string;
    username?: string;
    avatar?: string;
    followersCount?: number;
    followingCount?: number;
    rizzScore?: number;
  };
  postsCount?: number;
}

function getInitials(name?: string) {
  if (!name) return 'HB';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardLeftRail({ user, postsCount = 0 }: DashboardLeftRailProps) {
  const displayName = user?.displayName || 'HyperBuds Creator';
  const username = user?.username || 'creator';
  const followers = user?.followersCount ?? 0;
  const following = user?.followingCount ?? 0;

  const navItems = [
    { label: 'Feed', href: '/dashboard', icon: Newspaper, active: true },
    { label: 'Watch Reels', href: '/reels', icon: Film },
    { label: 'Live Studio', href: '/streaming', icon: Radio },
    { label: 'AI Matches', href: '/ai-matches', icon: Sparkles },
    { label: 'Collaborations', href: '/collaborations', icon: Layers },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
    { label: 'Gear Hub', href: '/marketplace/gear', icon: Package },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const communities = [
    { label: 'Startup & Talent Hub', href: '/startup-talent', icon: BriefcaseBusiness, badge: 'Hub' },
    { label: 'Creator Discovery', href: '/matching/discover', icon: Compass, badge: 'AI' },
    { label: 'Gear & Gadgets', href: '/marketplace/gear', icon: Package, badge: 'Shop' },
  ];

  return (
    <aside className="space-y-4">
      {/* User Profile Card (matching left rail of reference image) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Link href="/profile" className="flex items-center gap-3 group">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-11 w-11 rounded-full border border-slate-200 object-cover dark:border-slate-700"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-bold text-slate-950 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
              <span className="truncate">{displayName}</span>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">@{username}</p>
          </div>
        </Link>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
          <div>
            <p className="text-sm font-bold tabular-nums text-slate-950 dark:text-white">
              {followers}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Follower</p>
          </div>
          <div>
            <p className="text-sm font-bold tabular-nums text-slate-950 dark:text-white">
              {following}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Following</p>
          </div>
          <div>
            <p className="text-sm font-bold tabular-nums text-slate-950 dark:text-white">
              {postsCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Posts</p>
          </div>
        </div>
      </div>

      {/* Left Rail Navigation Card */}
      <nav
        aria-label="Homepage sections"
        className="rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900"
      >
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    item.active
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Communities / Workspaces Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </p>
          <Link
            href="/collaborations"
            className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View All
          </Link>
        </div>

        <ul className="space-y-2">
          {communities.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.label}>
                <Link
                  href={c.href}
                  className="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{c.label}</span>
                  </span>
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {c.badge}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
