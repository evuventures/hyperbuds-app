"use client";

import React from "react";
//import Recommended from "@/components/dashboard/Recommended";
import Recommendations from "@/components/dashboard/Recommendations";
import { ComingSoon } from "@/components/ui/ComingSoon";

const MainContent: React.FC = () => {
  return (
    <div className="p-4 pb-16 w-full min-h-full bg-gradient-to-br from-gray-50 via-white transition-colors duration-200 to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10 lg:p-6 lg:pb-34">
      <div className="mx-auto space-y-8 max-w-full">
        {/* Welcome Header - Coming Soon */}
        <ComingSoon
          variant="gradient"
          icon="zap"
          title="Welcome Dashboard & Quick Actions"
          description="We're working on an amazing personalized dashboard experience with quick actions, live streaming, new collaboration features, and real-time stats. Stay tuned for updates on HyperBuds!"
        />

        {/* Trending Collaborations - Coming Soon */}
        <ComingSoon
          variant="gradient"
          icon="trending"
          title="Trending Collaborations"
          description="Discover the most watched content this week, trending creators in your niche, and hot collaboration opportunities. Get recent updates on viral events happening now on HyperBuds!"
        />

        {/* <Recommended />*/}

        <Recommendations />

        {/* Call to Action - Coming Soon */}
        <ComingSoon
          variant="gradient"
          icon="rocket"
          title="Browse Creators & Start Collaborating"
          description="Soon you'll be able to browse thousands of creators, discover perfect collaboration partners, create your profile, and start amazing projects together on HyperBuds!"
        />

      </div>
    </div>
  );
};
export default MainContent;