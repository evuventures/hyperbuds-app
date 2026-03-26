"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MatchCard from "./MatchCard";
import type { MatchSuggestion } from "@/types/matching.types";

interface MatchHistoryGalleryProps {
  historyMatches: MatchSuggestion[];
  onMessage: (match: MatchSuggestion) => void;
  onViewProfile?: (match: MatchSuggestion) => void;
}

const getProfileAge = (profile?: MatchSuggestion["targetUser"]): number | undefined => {
  const rawAge = (profile as { age?: unknown } | undefined)?.age;
  return typeof rawAge === "number" && Number.isFinite(rawAge) && rawAge > 0
    ? Math.floor(rawAge)
    : undefined;
};

const MatchHistoryGallery: React.FC<MatchHistoryGalleryProps> = ({
  historyMatches,
  onMessage,
  onViewProfile,
}) => {
  const [showAllMatches, setShowAllMatches] = useState(false);

  const featuredMatches = historyMatches.slice(0, 2);
  const remainingMatches = historyMatches.slice(2);
  const visibleSidebarMatches = showAllMatches ? remainingMatches : remainingMatches.slice(0, 4);

  if (!historyMatches.length) {
    return (
      <div className="py-16 text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-fuchsia-300" />
        <h3 className="text-xl font-semibold text-white">No matches available</h3>
        <p className="mt-3 text-sm text-slate-400">
          We&apos;ll show your strongest creator matches here as soon as they&apos;re ready.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        {featuredMatches.map((match, index) => (
          <MatchCard
            key={match._id || match.id || `${match.targetUserId}-${index}`}
            match={match}
            rank={index}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>

      {remainingMatches.length > 0 && (
        <aside className="h-fit rounded-[28px] border border-white/10 bg-[#1a1227]/88 p-5 shadow-[0_24px_70px_-36px_rgba(192,38,211,0.65)] backdrop-blur">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">More Matches</h2>
              <p className="mt-1 text-sm text-slate-400">Keep exploring your next best fits.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllMatches((current) => !current)}
              className="shrink-0 text-sm font-semibold text-fuchsia-300 transition-colors hover:text-white"
            >
              {showAllMatches ? "Show Less" : "See All"}
            </button>
          </div>

          <div className="space-y-3">
            {visibleSidebarMatches.map((match, index) => {
              const profile = match.targetUser;
              const displayName = profile?.displayName || profile?.username || "Unknown Creator";
              const age = getProfileAge(profile);

              return (
                <button
                  type="button"
                  onClick={() => onViewProfile?.(match)}
                  key={match._id || match.id || `${match.targetUserId}-${index + 2}`}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/6 bg-[#120d1d]/75 p-3 text-left transition-colors hover:border-fuchsia-400/25 hover:bg-[#181127]"
                >
                  <Avatar className="h-14 w-14 border border-fuchsia-500/20">
                    <AvatarImage src={profile?.avatar} alt={displayName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-pink-500 text-sm font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">
                      {age ? `${displayName}, ${age}` : displayName}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text">
                      {match.compatibilityScore}% Match
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
};

export default MatchHistoryGallery;
