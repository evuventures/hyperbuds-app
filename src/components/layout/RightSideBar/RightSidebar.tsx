'use client'
import React from 'react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export const RightSidebar = () => {
  return (
    <aside className="p-4 pb-28 space-y-6 text-foreground">
      {/* Coming Soon: Recent Activities */}
      <ComingSoon
        variant="feature"
        icon="bell"
        title="Recent Activities"
        description="Stay updated with friend requests, collaboration invites, live sessions, achievements, and all your important notifications on HyperBuds"
      />

      {/* Coming Soon: Today's Summary */}
      <ComingSoon
        variant="feature"
        icon="trending"
        title="Today's Summary"
        description="Get quick stats on your daily sessions, new updates, live events, and collaboration activities all in one place"
      />

      {/* Coming Soon: Trending Topics */}
      <ComingSoon
        variant="feature"
        icon="sparkles"
        title="Trending Now"
        description="Discover what's hot in your niche, trending hashtags, and popular topics across the HyperBuds community"
      />

      {/* Coming Soon: Live Events */}
      <ComingSoon
        variant="feature"
        icon="rocket"
        title="Live Events"
        description="Get real-time updates on live sessions, creator spotlights, and community events happening now on HyperBuds"
      />

      {/* Coming Soon: Upcoming Collaborations */}
      <ComingSoon
        variant="feature"
        icon="calendar"
        title="Scheduled Sessions"
        description="Stay updated with upcoming collaboration sessions, workshops, and scheduled content from your favorite creators"
      />

      {/* Coming Soon: Community Feed */}
      <ComingSoon
        variant="feature"
        icon="zap"
        title="Community Updates"
        description="Never miss important announcements, platform updates, and exclusive features coming to HyperBuds"
      />
    </aside>
  );
};
