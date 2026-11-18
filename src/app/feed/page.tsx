'use client';

import React from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import SocialFeedStream from '@/components/feed/SocialFeedStream';
import { Film } from 'lucide-react';

export default function SocialFeedPage() {
  return (
    <DashboardLayout>
      <div className="min-h-full w-full bg-slate-50/60 px-4 py-6 pb-20 dark:bg-slate-950 sm:px-6 lg:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                Creator Feed
              </h1>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Share updates, photos, studio clips, and collaborate with creators across HyperBuds.
              </p>
            </div>
            <Link
              href="/reels"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Film className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Watch Reels
            </Link>
          </header>

          <SocialFeedStream />
        </div>
      </div>
    </DashboardLayout>
  );
}
