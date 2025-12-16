import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

const Trending: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:gap-4 justify-center items-center p-2 md:p-6 rounded-xl sm:flex-row sm:justify-center sm:p-6 theme-transition">
        <div className="flex gap-4 items-center">
          {/* Icon */}
          <div className="shrink-0 p-2.5 bg-linear-to-br from-orange-500 to-red-500 rounded-lg dark:from-orange-600 dark:to-red-600">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>

          {/* Title and Subtitle */}
          <div className="text-left md:text-center">
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
      <div className="p-10 space-y-6 text-center rounded-2xl text-white bg-gradient-to-r from-purple-600 to-indigo-600  shadow-lg dark:from-purple-700 dark:to-indigo-700">
        <Zap className="mx-auto w-12 h-12 text-purple-300 dark:text-blue-300" />
        <h3 className="text-3xl font-extrabold text-white dark:text-white">
          Get Ready to Connect!
        </h3>
        <p className="max-w-xl mx-auto text-lg text-gray-300 dark:text-gray-300">
          The Trending Collaborations feed is designed to help you discover top-tier creators, track viral content trends, and find the perfect co-creator for your next project.
        </p>

      </div>
    </div>
  );
};

export default Trending;