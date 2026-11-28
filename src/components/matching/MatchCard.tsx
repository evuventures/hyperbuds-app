'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Heart, MapPin, MessageCircle, Sparkles, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchSuggestion } from '@/types/matching.types';

interface MatchCardProps {
  match: MatchSuggestion;
  rank: number;
  onMessage?: (match: MatchSuggestion) => void;
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

const compactNumber = (n?: number) => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
};

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  rank,
  onMessage,
  onViewProfile,
  onLike,
  onPass,
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const profile = match.targetUser;

  if (!profile) {
    return null;
  }

  const flipOrder = rank % 2 === 1;
  const locationLabel = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter(Boolean)
    .join(', ');
  const age = getProfileAge(profile);
  const bioText =
    profile.bio?.trim() ||
    'Creator open to high-impact collabs, co-streaming, and multi-channel storytelling.';
  const niches = Array.isArray(profile.niche) ? profile.niche : [];
  const followers = compactNumber(profile.stats?.totalFollowers);
  const engagement =
    typeof profile.stats?.avgEngagement === 'number' && profile.stats.avgEngagement > 0
      ? `${profile.stats.avgEngagement.toFixed(1)}% avg engagement`
      : null;

  const strengthBullets = [
    Number.isFinite(match.compatibilityScore)
      ? `${match.compatibilityScore}% AI compatibility score`
      : null,
    typeof profile.rizzScore === 'number' && profile.rizzScore > 0
      ? `Rizz Score ${profile.rizzScore} creator rating`
      : null,
    ...(Array.isArray(match.metadata?.features) ? match.metadata.features.slice(0, 2) : []),
    locationLabel ? `Based in ${locationLabel}` : null,
  ].filter(Boolean) as string[];

  const nicheSignals = [
    ...niches.slice(0, 4).map((n) => `${n} creator focus`),
    followers ? `${followers} combined followers` : null,
    engagement,
  ].filter(Boolean) as string[];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="grid grid-cols-1 items-center lg:grid-cols-12">
        {/* Neon violet/cobalt studio portrait block */}
        <div
          className={`relative z-10 aspect-[4/4.4] min-h-[280px] overflow-hidden rounded-[24px] bg-linear-to-b from-[#7c3aed] via-[#4338ca] to-[#1d4ed8] shadow-[0_24px_60px_-20px_rgba(37,99,235,0.55)] ring-1 ring-white/15 lg:col-span-5 ${
            flipOrder ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          {profile.avatar && !hasImageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={profile.displayName}
              onError={() => setHasImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#6d28d9] via-[#4338ca] to-[#1e3a8a]">
              <span className="text-7xl font-black text-white/90">
                {(profile.displayName || profile.username || '?').charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Moody violet/blue portrait sheen */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-tr from-[#2563eb]/45 via-transparent to-[#7c3aed]/35" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0b0d14]/90 via-transparent to-transparent" />

          {/* Bottom floating frosted nameplate (reference Sofia/Michael pill) */}
          <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/15 bg-[#0f111a]/75 px-4 py-3 backdrop-blur-md">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                  {age ? `${profile.displayName}, ${age}` : profile.displayName}
                </h3>
                <p className="mt-0.5 truncate text-xs text-slate-300">
                  {niches[0] || `@${profile.username || 'creator'}`}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-500/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-100 ring-1 ring-indigo-300/30">
                <Sparkles className="h-3 w-3 text-indigo-300" />
                {Number.isFinite(match.compatibilityScore) ? `${match.compatibilityScore}%` : 'Match'}
              </span>
            </div>
          </div>
        </div>

        {/* Attached dark frosted slate persona details panel */}
        <div
          className={`relative rounded-b-[22px] border border-white/10 bg-[#32343e]/55 p-6 backdrop-blur-xl shadow-[0_24px_56px_-24px_rgba(0,0,0,0.8)] lg:col-span-7 lg:rounded-[22px] lg:py-7 ${
            flipOrder ? 'lg:order-1 lg:-mr-5 lg:pr-10 lg:pl-7' : 'lg:order-2 lg:-ml-5 lg:pl-10 lg:pr-7'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium tracking-wide text-indigo-200/80">
              @{profile.username || 'creator'}
            </span>
            {locationLabel && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-300/80">
                <MapPin className="h-3 w-3 text-indigo-400" />
                {locationLabel}
              </span>
            )}
          </div>

          <p className="mt-2.5 break-words text-sm leading-relaxed text-slate-200/90">
            {bioText}
          </p>

          {niches.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Creator niches">
              {niches.map((niche) => (
                <span
                  key={niche}
                  className="rounded-full border border-indigo-400/25 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-medium text-indigo-200"
                >
                  {niche}
                </span>
              ))}
            </div>
          )}

          {/* Persona Goals / Match Signals bullets */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Match Highlights:
              </h4>
              <ul className="mt-2.5 space-y-1.5">
                {strengthBullets.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400/35">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {nicheSignals.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Creator Focus:
                </h4>
                <ul className="mt-2.5 space-y-1.5">
                  {nicheSignals.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-purple-500/30 text-purple-200 ring-1 ring-purple-400/35">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sleek Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-4">
            {onLike && (
              <Button
                type="button"
                disabled={match.status === 'liked' || match.status === 'mutual'}
                onClick={() => onLike(match)}
                className={`h-10 cursor-pointer rounded-full px-5 text-xs font-semibold text-white shadow-lg transition ${
                  match.status === 'mutual'
                    ? 'bg-emerald-600 shadow-emerald-600/30'
                    : match.status === 'liked'
                      ? 'bg-purple-600/60 shadow-purple-600/20'
                      : 'bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 shadow-purple-600/35 hover:opacity-95'
                }`}
              >
                <Heart className="mr-1.5 h-3.5 w-3.5 fill-current" />
                {match.status === 'mutual'
                  ? 'Matched! 🎉'
                  : match.status === 'liked'
                    ? 'Liked ✓'
                    : 'Match'}
              </Button>
            )}

            <Button
              type="button"
              disabled={!onMessage}
              onClick={() => onMessage?.(match)}
              className="h-10 cursor-pointer rounded-full border border-white/15 bg-white/[0.06] px-4 text-xs font-semibold text-white transition hover:bg-white/[0.14]"
            >
              <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              Message
            </Button>

            <Button
              type="button"
              disabled={!onViewProfile}
              onClick={() => onViewProfile?.(match)}
              className="h-10 cursor-pointer rounded-full bg-linear-to-r from-[#4f46e5] to-[#7c3aed] px-5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:opacity-95"
            >
              <UserRound className="mr-1.5 h-3.5 w-3.5" />
              View Profile
            </Button>

            {onPass && match.status !== 'mutual' && (
              <Button
                type="button"
                variant="ghost"
                aria-label={`Pass on ${profile.displayName || profile.username || 'creator'}`}
                onClick={() => onPass(match)}
                className="ml-auto h-10 w-10 cursor-pointer rounded-full border border-white/10 bg-white/[0.04] p-0 text-slate-300 hover:border-rose-400/40 hover:bg-rose-500/20 hover:text-rose-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default MatchCard;
