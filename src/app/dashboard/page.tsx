"use client";

import React from "react";
import { Zap, Plus } from "lucide-react";
import Trending from "@/components/dashboard/Trending";
import Recommendations from "@/components/dashboard/Recommendations";
import ActivityFeed from "@/components/dashboard/ActivityFeeds";
import { DashboardDataProvider } from "@/context/DashboardDataContext";
import Link from "next/link";

const MainContent: React.FC = () => {
  return (
    
    <DashboardDataProvider>
      <div className="p-4 pb-16 w-full min-h-full bg-linear-to-br from-gray-50 via-white to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10 transition-colors duration-200 lg:p-6 lg:pb-34">
        <div className="mx-auto space-y-8 max-w-full">

          {/* ── Welcome Header ────────────────────────────────────────── */}
          <div className="overflow-hidden relative p-8 text-white bg-linear-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-700 dark:via-blue-700 dark:to-indigo-700 rounded-3xl shadow-xl">
            <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
            <div className="relative z-10">
              <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-3">
                    <Zap className="w-6 h-6 text-yellow-300 dark:text-yellow-400" />
                    <span className="text-lg font-semibold">Hello Creator!</span>
                  </div>
                  <h1 className="mb-3 text-3xl font-bold leading-tight lg:text-4xl">
                    Ready to create something
                    <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300 dark:from-yellow-400 dark:to-pink-400">
                      amazing today?
                    </span>
                  </h1>
                  <p className="mb-6 max-w-xl text-lg text-white/90 dark:text-white/80">
                    Discover new ideas, Collaborations, and opportunities waiting for you.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex gap-2 items-center px-6 py-3 font-semibold text-purple-600 dark:text-purple-700 bg-white dark:bg-gray-100 rounded-xl shadow-lg transition-all duration-200 transform hover:bg-gray-100 dark:hover:bg-gray-200 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full blur-xl bg-white/10 dark:bg-white/5" />
            <div className="absolute bottom-8 left-8 w-32 h-32 rounded-full blur-2xl bg-yellow-300/20 dark:bg-yellow-400/10" />
          </div>

          {/* ── Trending ──────────────────────────────────────────────── */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <Trending />
          </div>

          {/* ── AI Recommendations ────────────────────────────────────── */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <Recommendations />
          </div>

          {/* ── Activity Feed ─────────────────────────────────────────── */}
          <div className="p-6 rounded-3xl bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm dark:shadow-none">
            <ActivityFeed />
          </div>

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <div className="p-8 text-center text-white bg-linear-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-2xl shadow-lg">
            <h3 className="mb-4 text-2xl font-bold">
              Ready to Start Your Next Collaboration?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-purple-100 dark:text-purple-200">
              Join thousands of creators who&apos;ve found their perfect collaboration partners through HyperBuds.
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <Link
                href="/ai-matches"
                className="px-8 py-3 font-semibold text-purple-600 dark:text-purple-700 bg-white dark:bg-gray-100 rounded-xl transition-all duration-200 transform hover:bg-gray-100 dark:hover:bg-gray-200 hover:scale-105"
              >
                Get Match
              </Link>
              <Link
                href="/profile"
                className="px-8 py-3 font-semibold text-white rounded-xl border-2 border-white/30 dark:border-white/40 transition-all duration-200 hover:bg-white/10 dark:hover:bg-white/20"
              >
                Create Profile
              </Link>
            </div>
          </div>

        </div>
      </div>
    </DashboardDataProvider>
  );
};

export default MainContent;