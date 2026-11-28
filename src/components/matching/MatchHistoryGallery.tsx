'use client';

import React, { useState } from 'react';
import { Eye, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import MatchCard from './MatchCard';
import type { MatchSuggestion } from '@/types/matching.types';

interface MatchHistoryGalleryProps {
  historyMatches: MatchSuggestion[];
  onMessage: (match: MatchSuggestion) => void;
  onViewProfile?: (match: MatchSuggestion) => void;
  onLike?: (match: MatchSuggestion) => void;
  onPass?: (match: MatchSuggestion) => void;
}

const getProfileAge = (profile?: MatchSuggestion['targetUser']): number | undefined => {
  const rawAge = (profile as { age?: unknown } | undefined)?.age;
  return typeof rawAge === 'number' && Number.isFinite(rawAge) && rawAge > 0
    ? Math.floor(rawAge)
    : undefined;
};

const MatchHistoryGallery: React.FC<MatchHistoryGalleryProps> = ({
  historyMatches,
  onMessage,
  onViewProfile,
  onLike,
  onPass,
}) => {
  const [showAllMatches, setShowAllMatches] = useState(false);

  const featuredMatches = historyMatches.slice(0, 3);
  const remainingMatches = historyMatches.slice(3);
  const visibleExtraMatches = showAllMatches ? remainingMatches : remainingMatches.slice(0, 4);

  if (!historyMatches.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] py-16 text-center backdrop-blur-xl">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-indigo-300" />
        <h3 className="text-xl font-semibold text-white">No matches available</h3>
        <p className="mt-3 text-sm text-slate-300/80">
          We&apos;ll show your strongest creator matches here as soon as they&apos;re ready.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Alternating Persona Showcase Cards */}
      <div className="mx-auto max-w-5xl space-y-8">
        {featuredMatches.map((match, index) => (
          <MatchCard
            key={match._id || match.id || `${match.targetUserId}-${index}`}
            match={match}
            rank={index}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
            onLike={onLike}
            onPass={onPass}
          />
        ))}
      </div>

      {/* Additional matches in dark frosted bento row */}
      {remainingMatches.length > 0 && (
        <section className="mx-auto max-w-5xl rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">More Matches</h2>
              <p className="text-xs text-slate-400">
                Keep exploring creators compatible with your style.
              </p>
            </div>
            {remainingMatches.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllMatches((current) => !current)}
                className="shrink-0 text-xs font-semibold text-indigo-300 transition-colors hover:text-white"
              >
                {showAllMatches ? 'Show Less' : 'See All'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {visibleExtraMatches.map((match, index) => {
              const profile = match.targetUser;
              const displayName = profile?.displayName || profile?.username || 'Unknown Creator';
              const age = getProfileAge(profile);

              return (
                <div
                  key={match._id || match.id || `${match.targetUserId}-${index + 3}`}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#181a24]/80 p-2.5 transition-colors hover:border-indigo-400/35 hover:bg-[#1f2230]"
                >
                  <button
                    type="button"
                    onClick={() => onViewProfile?.(match)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <Avatar className="h-12 w-12 shrink-0 border border-white/15">
                      <AvatarImage src={profile?.avatar} alt={displayName} className="object-cover" />
                      <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {age ? `${displayName}, ${age}` : displayName}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-indigo-300">
                        {match.compatibilityScore}% Match
                      </p>
                    </div>
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    {onLike && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={match.status === 'liked' || match.status === 'mutual'}
                        className={`h-8 w-8 cursor-pointer ${
                          match.status === 'mutual'
                            ? 'text-emerald-400'
                            : match.status === 'liked'
                              ? 'text-pink-400'
                              : 'text-pink-300 hover:bg-pink-500/20 hover:text-pink-200'
                        }`}
                        aria-label={`Match with ${displayName}`}
                        onClick={() => onLike(match)}
                      >
                        <Heart className={`h-4 w-4 ${match.status === 'liked' || match.status === 'mutual' ? 'fill-current' : ''}`} />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-slate-300 hover:bg-white/10 hover:text-white"
                      aria-label={`View profile of ${displayName}`}
                      onClick={() => onViewProfile?.(match)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer text-slate-300 hover:bg-white/10 hover:text-white"
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
        </section>
      )}
    </div>
  );
};

export default MatchHistoryGallery;
