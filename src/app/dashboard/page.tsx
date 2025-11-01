"use client";

import React from "react";
import Link from "next/link";
import Recommendations from "@/components/dashboard/Recommendations";
import Trending from "@/components/dashboard/Trending";
import { Zap, Rocket } from "lucide-react";

const MainContent: React.FC = () => {
  return (
    <div className="p-4 pb-16 w-full min-h-full bg-gradient-to-br from-gray-50 via-white transition-colors duration-200 to-purple-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10 lg:p-6 lg:pb-34">
      <div className="mx-auto space-y-8 max-w-full">
        {/* Welcome Header */}
        <div className="overflow-hidden relative p-8 rounded-2xl border border-gray-100 shadow-lg bg-background dark:border-gray-800 theme-transition">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-blue-700/10 dark:from-purple-600/20 dark:via-indigo-600/20 dark:to-blue-700/20"></div>

          <div className="relative z-10">
            <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-3">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Good morning, Creator!
                  </span>
                </div>
                <h1 className="mb-3 text-3xl font-bold leading-tight text-gray-900 dark:text-white lg:text-4xl">
                  Ready to create something
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-yellow-400 dark:to-pink-400">
                    amazing today?
                  </span>
                </h1>
                <p className="mb-6 max-w-xl text-lg text-gray-700 dark:text-white/80">
                  Discover new ideas, collaborations, and opportunities waiting for you.
                </p>

                {/* Get Started Button */}
                <Link
                  href="/profile"
                  className="inline-flex gap-2 items-center px-8 py-3 font-semibold text-purple-600 bg-white rounded-xl shadow-lg transition-all duration-200 transform dark:bg-gray-100 dark:text-purple-700 hover:bg-gray-100 dark:hover:bg-gray-200 hover:scale-105"
                >
                  <Rocket className="w-5 h-5" />
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full blur-2xl bg-purple-400/20 dark:bg-purple-400/10"></div>
          <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full blur-3xl bg-indigo-400/20 dark:bg-indigo-400/10"></div>
        </div>

        <Trending />

        <Recommendations />

        {/* Call to Action */}
        <div className="overflow-hidden relative rounded-2xl border border-gray-100 shadow-lg bg-background dark:border-gray-800 theme-transition">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-blue-700/10 dark:from-purple-600/20 dark:via-indigo-600/20 dark:to-blue-700/20"></div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full blur-2xl bg-purple-400/20 dark:bg-purple-400/10"></div>
          <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full blur-3xl bg-indigo-400/20 dark:bg-indigo-400/10"></div>

          <div className="relative z-10 p-8 text-center">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Ready to Start Your Next Collaboration?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-700 dark:text-gray-300">
              Join thousands of creators who&apos;ve found their perfect collaboration
              partners through HyperBuds.
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <button className="px-8 py-3 font-semibold text-purple-600 bg-white rounded-xl shadow-lg transition-all duration-200 transform cursor-pointer dark:bg-gray-100 dark:text-purple-700 hover:bg-gray-100 dark:hover:bg-gray-200 hover:scale-105">
                Browse Creators
              </button>
              <button className="px-8 py-3 font-semibold text-purple-600 bg-white rounded-xl border border-purple-200 shadow-lg transition-all duration-200 cursor-pointer dark:bg-gray-100 dark:text-purple-700 dark:border-purple-700 hover:bg-gray-100 dark:hover:bg-gray-200 hover:scale-105">
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MainContent;