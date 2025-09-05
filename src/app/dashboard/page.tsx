"use client";

import React, { useState } from "react";
import {
  Video,
  Zap,
  Plus,
} from "lucide-react";
import Trending from "@/components/dashboard/Trending";
import Recommended from "@/components/dashboard/Recommended";

// Mock data for quick stats
const mockStats = {
  totalCollaborations: 1247,
  activeCreators: 567,
  avgResponseTime: "2.3h",
  successRate: "94%",
  newMatches: 12,
  pendingInvites: 5,
};

// Mock data for recent activity
const mockActivity = [
  {
    id: 1,
    type: "match",
    title: "New Match Found!",
    description: "Sarah Kim wants to collaborate",
    time: "2m ago",
    avatar: "SK",
    unread: true,
  },
  {
    id: 2,
    type: "collaboration",
    title: "Collaboration Request",
    description: "Gaming content proposal from Alex",
    time: "15m ago",
    avatar: "AR",
    unread: true,
  },
  {
    id: 3,
    type: "message",
    title: "New Message",
    description: "Emma Chen sent you a message",
    time: "1h ago",
    avatar: "EC",
    unread: false,
  },
];

export const MainContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10 p-4 lg:p-6 transition-colors duration-200">
      <div className="max-w-full mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-700 dark:via-blue-700 dark:to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-6 h-6 text-yellow-300 dark:text-yellow-400" />
                  <span className="text-lg font-semibold">
                    Good morning, Creator!
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                  Ready to create something
                  <br />
                  <span className="bg-gradient-to-r from-yellow-300 to-pink-300 dark:from-yellow-400 dark:to-pink-400 bg-clip-text text-transparent">
                    amazing today?
                  </span>
                </h1>
                <p className="text-lg text-white/90 dark:text-white/80 mb-6 max-w-xl">
                  You have {mockStats.newMatches} new matches and{" "}
                  {mockStats.pendingInvites} collaboration invites waiting for
                  you.
                </p>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="bg-white dark:bg-gray-100 text-purple-600 dark:text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Go Live
                  </button>
                  <button className="border-2 border-white/30 dark:border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-200 backdrop-blur-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Collab
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 w-20 h-20 bg-white/10 dark:bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-8 left-8 w-32 h-32 bg-yellow-300/20 dark:bg-yellow-400/10 rounded-full blur-2xl"></div>
        </div>
        
        <Trending />

        <Recommended />

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Start Your Next Collaboration?
          </h3>
          <p className="text-purple-100 dark:text-purple-200 mb-6 max-w-2xl mx-auto">
            Join thousands of creators who`&apos;`ve found their perfect collaboration
            partners through HyperBuds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white dark:bg-gray-100 text-purple-600 dark:text-purple-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-all duration-200 transform hover:scale-105">
              Browse Creators
            </button>
            <button className="border-2 border-white/30 dark:border-white/40 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 dark:hover:bg-white/20 transition-all duration-200">
              Create Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};