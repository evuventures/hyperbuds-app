"use client";

import React, { useState } from "react";
import { Eye, MessageCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-fuchsia-400 dark:text-fuchsia-300" />
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No matches available</h3>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
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
        <aside className="h-fit rounded-[28px] border border-fuchsia-200/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1a1227]/88 dark:shadow-none">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">More Matches</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Keep exploring your next best fits.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllMatches((current) => !current)}
              className="shrink-0 text-sm font-semibold text-fuchsia-600 transition-colors hover:text-fuchsia-700 dark:text-fuchsia-300 dark:hover:text-white"
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
                <div
                  key={match._id || match.id || `${match.targetUserId}-${index + 2}`}
                  className="flex w-full items-center gap-2 rounded-2xl border border-fuchsia-200/60 bg-white/95 p-2 pr-1 transition-colors hover:border-fuchsia-300/80 hover:bg-fuchsia-50 dark:border-white/6 dark:bg-[#120d1d]/75 dark:hover:border-fuchsia-400/25 dark:hover:bg-[#181127]"
                >
                  <button
                    type="button"
                    onClick={() => onViewProfile?.(match)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1 text-left outline-none ring-offset-white focus-visible:ring-2 focus-visible:ring-fuchsia-500 dark:ring-offset-[#120d1d]"
                  >
                    <Avatar className="h-14 w-14 shrink-0 border border-fuchsia-500/20">
                      <AvatarImage src={profile?.avatar} alt={displayName} className="object-cover" />
                      <AvatarFallback className="bg-linear-to-br from-fuchsia-500 to-pink-500 text-sm font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {age ? `${displayName}, ${age}` : displayName}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-transparent bg-linear-to-r from-fuchsia-400 to-pink-400 bg-clip-text">
                        {match.compatibilityScore}% Match
                      </p>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-pointer text-fuchsia-600 hover:bg-fuchsia-100 hover:text-fuchsia-800 dark:text-fuchsia-300 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label={`View profile of ${displayName}`}
                      onClick={() => onViewProfile?.(match)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 cursor-pointer text-fuchsia-600 hover:bg-fuchsia-100 hover:text-fuchsia-800 dark:text-fuchsia-300 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label={`Message ${displayName}`}
                      onClick={() => onMessage(match)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
};

export default MatchHistoryGallery;
