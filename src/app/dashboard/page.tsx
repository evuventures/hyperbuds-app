'use client';

import React, { useEffect, useState } from 'react';
import DynamicHeroHeader from '@/components/dashboard/DynamicHeroHeader';
import MessagesAndEventsPanel from '@/components/dashboard/MessagesAndEventsPanel';
import SocialFeedStream from '@/components/feed/SocialFeedStream';
import Trending from '@/components/dashboard/Trending';
import Recommendations from '@/components/dashboard/Recommendations';
import ActivityFeed from '@/components/dashboard/ActivityFeeds';
import FinishSettingUp, { useProfileCompletion } from '@/components/dashboard/FinishSettingUp';
import ReferralInviteCard from '@/components/referrals/ReferralInviteCard';
import { DashboardDataProvider } from '@/context/DashboardDataContext';
import apiClient from '@/lib/api/client';

interface CurrentUserSummary {
  id?: string;
  displayName?: string;
  username?: string;
  avatar?: string;
}

const MainContent: React.FC = () => {
  const { isComplete, isLoggedIn, totalCount } = useProfileCompletion();
  const showSetup = isLoggedIn && !isComplete && totalCount > 0;
  const [userSummary, setUserSummary] = useState<CurrentUserSummary>({});

  useEffect(() => {
    let active = true;
    apiClient
      .get('/users/me')
      .then((res) => {
        if (!active) return;
        const u = res.data?.user || res.data || {};
        const p = res.data?.profile || u.profile || {};
        setUserSummary({
          id: u._id || u.id || '',
          displayName: p.displayName || u.fullName || p.username || 'HyperBuds Creator',
          username: p.username || u.username || 'creator',
          avatar: p.avatar || u.avatar || '',
        });
      })
      .catch(() => {
        // Keep graceful defaults when unauthenticated in preview
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardDataProvider>
      <div
        aria-label="Creator command dashboard"
        className="min-h-full w-full bg-[var(--hb-canvas)] px-0 py-3 pb-20 transition-colors dark:bg-slate-950 sm:px-6 sm:py-5 lg:py-6"
      >
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
          {/* Dynamic Editorial Hero Header (replaces top story circles) */}
          <div className="px-3 sm:px-0">
            <DynamicHeroHeader />
          </div>

          {/* 2-Column Feed + Messages/Events Grid (single fixed AppSidebar on the left) */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Center Column: Hero & Endless Posts + Reels Feed (plus Discovery on Desktop) */}
            <main className="space-y-6 lg:col-span-8">
              <SocialFeedStream currentUser={userSummary} />

              <div className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block dark:border-slate-800 dark:bg-slate-900">
                <Recommendations />
              </div>

              <div className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block dark:border-slate-800 dark:bg-slate-900">
                <Trending />
              </div>
            </main>

            {/* Desktop Static Right Rail: Messages + Events + Invite Leaderboard + Activity */}
            <aside className="hidden space-y-4 lg:sticky lg:top-5 lg:col-span-4 lg:block lg:max-h-[calc(100dvh-88px)] lg:overflow-y-auto hb-scroll-hidden">
              {showSetup && <FinishSettingUp />}

              <ReferralInviteCard compact />

              <MessagesAndEventsPanel currentUserId={userSummary.id} />

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <ActivityFeed />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DashboardDataProvider>
  );
};

export default MainContent;
