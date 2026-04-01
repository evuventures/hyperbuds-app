"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchSuggestion } from "@/types/matching.types";

interface MatchCardProps {
  match: MatchSuggestion;
  rank: number;
  onMessage?: (match: MatchSuggestion) => void;
  onViewProfile?: (match: MatchSuggestion) => void;
}

const BADGE_LABELS = ["ULTIMATE MATCH", "TOP COMPATIBILITY"] as const;

const getProfileAge = (profile?: MatchSuggestion["targetUser"]): number | undefined => {
  const rawAge = (profile as { age?: unknown } | undefined)?.age;
  return typeof rawAge === "number" && Number.isFinite(rawAge) && rawAge > 0
    ? Math.floor(rawAge)
    : undefined;
};

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  rank,
  onMessage,
  onViewProfile,
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const profile = match.targetUser;

  if (!profile) {
    return null;
  }

  const locationLabel = [profile.location?.city, profile.location?.state, profile.location?.country]
    .filter(Boolean)
    .join(", ");

  const age = getProfileAge(profile);
  const badgeLabel = BADGE_LABELS[rank];
  const bioText = profile.bio?.trim() || "Bio not available yet.";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      <div className="overflow-hidden rounded-[30px] border border-fuchsia-200/60 bg-white/90 shadow-sm dark:border-white/10 dark:bg-[#101827]/95 dark:shadow-none">
        <div className="grid min-h-105 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="relative min-h-80 overflow-hidden bg-linear-to-br from-[#5d304c] via-[#cb9c73] to-[#1c1632]">
            {profile.avatar && !hasImageError ? (
              // We use a direct img here because some remote avatar URLs fail through Next image optimization.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.displayName}
                onError={() => setHasImageError(true)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-fuchsia-600/35 to-pink-500/25">
                <span className="text-7xl font-black text-white/90">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-linear-to-t from-[#0d111f]/95 via-[#0d111f]/25 to-transparent" />

            {badgeLabel && (
              <div className="absolute left-5 top-5 rounded-full bg-linear-to-r from-fuchsia-500 to-pink-500 px-4 py-1.5 text-[11px] font-black tracking-[0.28em] text-white shadow-[0_14px_32px_-12px_rgba(217,70,239,0.9)]">
                {badgeLabel}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {age ? `${profile.displayName}, ${age}` : profile.displayName}
              </h3>

              {locationLabel && (
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <MapPin className="h-4 w-4 shrink-0 text-fuchsia-300" />
                  <span className="truncate">{locationLabel}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="min-w-29.5 rounded-2xl border border-fuchsia-300/40 bg-fuchsia-50/80 px-5 py-4 dark:border-fuchsia-500/15 dark:bg-[#171127]">
                  <div className="text-4xl font-black text-transparent bg-linear-to-r from-fuchsia-400 to-pink-500 bg-clip-text">
                    {match.compatibilityScore}%
                  </div>
                  <div className="mt-1 text-xs font-semibold tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    MATCH
                  </div>
                </div>

                <div className="min-w-25.5 rounded-2xl border border-fuchsia-300/35 bg-fuchsia-50/70 px-5 py-4 dark:border-fuchsia-500/10 dark:bg-[#18132a]">
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {profile.rizzScore ?? "—"}
                  </div>
                  <div className="mt-1 text-xs font-semibold tracking-[0.28em] text-fuchsia-300">
                    RIZZ
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => onMessage?.(match)}
                  className="h-12 cursor-pointer rounded-full border border-fuchsia-300/60 bg-white px-5 text-sm font-semibold text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-400/25 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>

                <Button
                  type="button"
                  onClick={() => onViewProfile?.(match)}
                  className="h-12 cursor-pointer rounded-full bg-linear-to-r from-fuchsia-500 to-pink-500 px-5 text-sm font-semibold text-white shadow-[0_14px_32px_-14px_rgba(217,70,239,0.9)] hover:from-fuchsia-400 hover:to-pink-500"
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-500">
                @{profile.username || "user"}
              </p>
              <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{bioText}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default MatchCard;
