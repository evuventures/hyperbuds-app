'use client';

import { useMatchSuggestions } from '@/hooks/features/useMatching';
import { Heart, Users, TrendingUp, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SuggestedMatches() {
  const { data, isLoading, error } = useMatchSuggestions({ limit: 6, enabled: true });

  const matches = data?.matches || [];

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
        <div className="flex gap-3 items-center mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg dark:from-pink-500/20 dark:to-purple-500/20">
            <Heart size={24} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Suggested Matches</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse dark:bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
        <div className="flex gap-3 items-center mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg dark:from-pink-500/20 dark:to-purple-500/20">
            <Heart size={24} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Suggested Matches</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Unable to load matches. Please try again later.</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
        <div className="flex gap-3 items-center mb-6">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg dark:from-pink-500/20 dark:to-purple-500/20">
            <Heart size={24} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Suggested Matches</h3>
        </div>
        <div className="flex flex-col gap-4 justify-center items-center py-12 text-center">
          <Users size={48} className="text-gray-400 dark:text-gray-500" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No matches found yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Complete your profile to get better matches!</p>
          <Link
            href="/matching"
            className="px-6 py-3 mt-4 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg transition-all transform cursor-pointer hover:scale-105 hover:from-pink-600 hover:to-purple-600"
          >
            Explore Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border shadow-lg backdrop-blur-sm dark:bg-gray-800/50 border-gray-200/60 dark:border-gray-700/60">
      <div className="flex gap-3 justify-between items-center mb-6">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg dark:from-pink-500/20 dark:to-purple-500/20">
            <Heart size={24} className="text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Suggested Matches</h3>
        </div>
        <Link
          href="/matching"
          className="text-sm font-medium text-pink-600 transition-colors dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.slice(0, 6).map((match, index) => {
          const profile = match.targetProfile || match.profile;
          const compatibilityScore = match.compatibilityScore || 0;
          const rizzScore = profile?.rizzScore || 0;

          return (
            <motion.div
              key={match._id || match.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:from-gray-800 dark:to-gray-900 dark:border-gray-700"
            >
              <Link href={`/creator/${profile?.username || match.targetUserId}`}>
                <div className="p-4">
                  {/* Avatar and Basic Info */}
                  <div className="flex gap-3 items-start mb-3">
                    <div className="relative flex-shrink-0">
                      {profile?.avatar ? (
                        <div className="relative overflow-hidden rounded-full ring-2 ring-pink-200 dark:ring-pink-800 w-14 h-14">
                          <Image
                            src={profile.avatar}
                            alt={profile.displayName || profile.username || 'User'}
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center text-lg font-bold text-white bg-gradient-to-br from-pink-400 via-purple-500 to-blue-400 rounded-full ring-2 ring-pink-200 dark:ring-pink-800 w-14 h-14">
                          {profile?.displayName?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate dark:text-white">
                        {profile?.displayName || profile?.username || 'Unknown User'}
                      </h4>
                      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                        @{profile?.username || 'username'}
                      </p>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="mb-3">
                    <div className="flex gap-2 items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Compatibility</span>
                      <span className="text-sm font-bold text-pink-600 dark:text-pink-400">
                        {compatibilityScore.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${compatibilityScore}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex gap-4 items-center text-xs">
                    {rizzScore > 0 && (
                      <div className="flex gap-1 items-center text-purple-600 dark:text-purple-400">
                        <Sparkles size={12} />
                        <span className="font-medium">{rizzScore}</span>
                      </div>
                    )}
                    {profile?.stats?.totalFollowers && (
                      <div className="flex gap-1 items-center text-gray-600 dark:text-gray-400">
                        <Users size={12} />
                        <span className="font-medium">
                          {profile.stats.totalFollowers >= 1000
                            ? `${(profile.stats.totalFollowers / 1000).toFixed(1)}k`
                            : profile.stats.totalFollowers}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Niches */}
                  {profile?.niche && profile.niche.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {profile.niche.slice(0, 2).map((niche, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full dark:text-blue-300 dark:bg-blue-500/20"
                        >
                          #{niche}
                        </span>
                      ))}
                      {profile.niche.length > 2 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full dark:text-gray-400 dark:bg-gray-700">
                          +{profile.niche.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

