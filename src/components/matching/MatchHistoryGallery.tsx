"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import MatchCard from "./MatchCard";
import ProfileModal from "./ProfileModal";
import type { MatchSuggestion, CreatorProfile } from "@/types/matching.types";

interface MatchHistoryGalleryProps {
  historyMatches: MatchSuggestion[];
  onMessage: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
  likedMatches?: Set<string>;
}

const MatchHistoryGallery: React.FC<MatchHistoryGalleryProps> = ({
  historyMatches,
  onMessage,
  onViewProfile,
  likedMatches = new Set()
}) => {
  const [selectedProfile, setSelectedProfile] = useState<CreatorProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'liked' | 'mutual'>('all');

  const handleViewProfileInternal = (userId: string) => {
    if (onViewProfile) {
      onViewProfile(userId);
    } else {
      const match = historyMatches.find(m => m.targetUser?.userId === userId);
      if (match?.targetUser) {
        setSelectedProfile(match.targetUser);
        setIsProfileModalOpen(true);
      }
    }
  };

  const handleMessage = (userId: string) => {
    onMessage(userId);
    console.log("Opening chat with user:", userId);
  };

  // Filter matches based on selected filter
  const filteredMatches = historyMatches.filter(match => {
    if (filter === 'liked') return match.status === 'liked';
    if (filter === 'mutual') return match.status === 'mutual';
    return true; // 'all'
  });

  // Calculate stats
  const stats = {
    total: historyMatches.length,
    liked: historyMatches.filter(m => m.status === 'liked').length,
    mutual: historyMatches.filter(m => m.status === 'mutual').length,
  };

  // Stats data for mapping
  const statsData = [
    {
      key: 'total',
      value: stats.total,
      label: 'Total',
      icon: '👥',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      textGradient: 'from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400',
      shadow: 'hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10'
    },
    {
      key: 'liked',
      value: stats.liked,
      label: 'Liked',
      icon: '❤️',
      gradient: 'from-green-500/20 to-emerald-500/20',
      textGradient: 'from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400',
      shadow: 'hover:shadow-green-500/20 dark:hover:shadow-green-500/10'
    },
    {
      key: 'mutual',
      value: stats.mutual,
      label: 'Mutual',
      icon: '🤝',
      gradient: 'from-purple-500/20 to-pink-500/20',
      textGradient: 'from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400',
      shadow: 'hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards (Left) and Filter Tabs (Right) */}
      <div className="flex flex-col gap-4 justify-between items-center lg:flex-row lg:gap-0">
        {/* Left Side - Enhanced Stats Cards */}
        <div className="flex flex-wrap gap-2 justify-center sm:gap-3 lg:justify-start">
          {statsData.map((stat, index) => (
            <div
              key={stat.key}
              className="relative cursor-pointer group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 blur-xl transition-all duration-500 ${stat.gradient} group-hover:opacity-30 dark:group-hover:opacity-60 group-hover:blur-lg`}></div>

              {/* Glowing border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:group-hover:opacity-20`}
                style={{ padding: '1px' }}>
                <div className="w-full h-full bg-white rounded-2xl dark:bg-slate-900"></div>
              </div>

              {/* Main card */}
              <div className={`relative p-4 rounded-2xl border backdrop-blur-xl transition-all duration-500 bg-white/90 dark:bg-slate-800/90 border-gray-300 dark:border-white/20 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/15 dark:hover:shadow-purple-500/15 hover:-translate-y-1 ${stat.shadow}`}>
                <div className="text-center">
                  {/* Number with enhanced gradient */}
                  <div className={`text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r mb-1 transition-all duration-300 group-hover:scale-110 ${stat.textGradient}`}>
                    {stat.value}
                  </div>

                  {/* Label with subtle animation */}
                  <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase transition-colors duration-300 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-100">
                    {stat.label}
                  </div>
                </div>

                {/* Subtle inner glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-3 dark:group-hover:opacity-5`}></div>
              </div>

              {/* Floating particles effect */}
              <div className="overflow-hidden absolute inset-0 rounded-2xl pointer-events-none">
                <div className="absolute w-1 h-1 bg-gray-600 rounded-full opacity-0 transition-all duration-1000 dark:bg-white group-hover:opacity-80 dark:group-hover:opacity-100"
                  style={{
                    top: '20%',
                    left: '20%',
                    animationDelay: '0ms',
                    animation: 'float 3s ease-in-out infinite'
                  }}></div>
                <div className="absolute w-1 h-1 bg-gray-600 rounded-full opacity-0 transition-all duration-1000 dark:bg-white group-hover:opacity-80 dark:group-hover:opacity-100"
                  style={{
                    top: '60%',
                    right: '20%',
                    animationDelay: '1s',
                    animation: 'float 3s ease-in-out infinite'
                  }}></div>
                <div className="absolute w-1 h-1 bg-gray-700 rounded-full opacity-0 transition-all duration-1000 dark:bg-white group-hover:opacity-80 dark:group-hover:opacity-100"
                  style={{
                    bottom: '20%',
                    left: '60%',
                    animationDelay: '2s',
                    animation: 'float 3s ease-in-out infinite'
                  }}></div>
                <div className="absolute w-1 h-1 bg-gray-800 rounded-full opacity-0 transition-all duration-1000 dark:bg-white group-hover:opacity-80 dark:group-hover:opacity-100"
                  style={{
                    bottom: '60%',
                    right: '60%',
                    animationDelay: '1.5s',
                    animation: 'float 3s ease-in-out infinite'
                  }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Filter Tabs */}
        <div className="inline-flex relative rounded-2xl border shadow-lg backdrop-blur-sm bg-white/80 dark:bg-slate-800/50 border-gray-300 dark:border-white/10 px-1 sm:px-1.5">
          {/* Animated background for active tab */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-lg"
            style={{
              width: 'calc(33.333% - 0.5rem)',
              left: `calc(${(['all', 'liked', 'mutual'].indexOf(filter) * 33.333)}% + 0.25rem)`,
            }}
          />

          {[
            { key: 'all', label: 'All Matches', icon: '👥' },
            { key: 'liked', label: 'Liked', icon: '❤️' },
            { key: 'mutual', label: 'Mutual', icon: '🤝' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'liked' | 'mutual')}
              className={`relative z-10 flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-300 cursor-pointer min-w-0 ${filter === tab.key
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <span className="flex gap-1 justify-center items-center sm:gap-2">
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden whitespace-nowrap xs:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Simple Match Cards Grid */}
      <div>
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match._id}
                match={match}
                onAction={() => { }} // Not used in gallery context
                onCollaboration={() => { }} // Not used in gallery context
                onMessage={handleMessage}
                onViewProfile={handleViewProfileInternal}
                isLiked={match.targetUser ? likedMatches.has(match.targetUser.userId) : false}
                isSidebarContext={true}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Heart className="mx-auto mb-4 w-12 h-12 text-gray-500 dark:text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              {filter === 'all' ? 'No matches yet' : `No ${filter} matches`}
            </h3>
            <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
              {filter === 'all'
                ? 'Start exploring to find amazing creators and build meaningful connections!'
                : `You haven't ${filter} any profiles yet. Keep exploring to find your perfect matches!`
              }
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal for View Profile */}
      <ProfileModal
        profile={selectedProfile}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfile(null);
        }}
        onAction={() => { }} // Not used in gallery context
        onCollaboration={() => { }} // Not used in gallery context
        isLiked={selectedProfile ? likedMatches.has(selectedProfile.userId) : false}
      />
    </div>
  );
};

export default MatchHistoryGallery;
