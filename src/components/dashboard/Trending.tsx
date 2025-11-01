import React from 'react';
import { TrendingUp, Sparkles, Clock } from 'lucide-react';

const Trending: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 justify-center items-center p-6 rounded-xl sm:flex-row sm:justify-center sm:p-6 theme-transition">
        <div className="flex gap-4 items-center">
          {/* Icon */}
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg dark:from-orange-600 dark:to-red-600">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              Trending Collaborations
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Most watched content this week
            </p>
          </div>
        </div>

        {/* Badge */}
        <div className="flex gap-2 items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Coming Soon Container */}
      <div className="overflow-hidden relative rounded-2xl border border-gray-100 shadow-lg bg-background dark:border-gray-800 theme-transition">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-blue-700/10 dark:from-purple-600/20 dark:via-indigo-600/20 dark:to-blue-700/20"></div>

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-32 h-32 rounded-full blur-2xl bg-purple-400/20 dark:bg-purple-400/10"></div>
        <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full blur-3xl bg-indigo-400/20 dark:bg-indigo-400/10"></div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center p-12 text-center min-h-[400px] sm:p-16 lg:min-h-[500px]">
          {/* Icon Container */}
          <div className="relative mb-6">
            <div className="flex justify-center items-center w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg dark:from-purple-600 dark:to-indigo-700">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-2 animate-ping border-purple-400/30"></div>
            <div className="absolute inset-0 rounded-full border-2 animate-ping border-indigo-400/30" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Title */}
          <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl lg:text-5xl">
            Coming Soon
          </h3>

          {/* Description */}
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300 sm:text-xl">
            We&apos;re working hard to bring you the most exciting trending collaborations.
            Stay tuned for amazing content from top creators!
          </p>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 gap-4 w-full max-w-3xl sm:grid-cols-3">
            <div className="p-6 rounded-xl border border-gray-200 backdrop-blur-sm dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 theme-transition">
              <div className="flex justify-center mb-3 text-3xl">🔥</div>
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Hot Content</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Trending collaborations
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 backdrop-blur-sm dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 theme-transition">
              <div className="flex justify-center mb-3 text-3xl">📊</div>
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Real-time Stats</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Live viewer counts
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 backdrop-blur-sm dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 theme-transition">
              <div className="flex justify-center mb-3 text-3xl">🎯</div>
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Top Creators</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Best collaborations
              </p>
            </div>
          </div>

          {/* Notification Badge */}
          <div className="flex gap-2 items-center px-4 py-2 mt-8 text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">We&apos;ll notify you when it&apos;s ready!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
