'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SlidersHorizontal, Sparkles, Users, Volume2, VolumeX } from 'lucide-react';

const MATCHMAKING_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

interface AuthSplitShowcaseProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Shared split-card authentication shell matching the dark blurred backdrop,
 * sculpted white pill form column, and creator matchmaking video column.
 */
export default function AuthSplitShowcase({
  title,
  subtitle,
  children,
}: AuthSplitShowcaseProps) {
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#12131c] p-4 sm:p-8">
      {/* Moody blurred ambient glow backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-700/30 blur-[130px]" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/25 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[120px]" />
      </div>

      {/* Main split showcase card */}
      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-stretch gap-3 rounded-[32px] bg-white p-3 shadow-[0_32px_90px_-18px_rgba(0,0,0,0.65)] sm:p-4 lg:grid-cols-12">
        {/* Left column: Sculpted pill form */}
        <div className="flex flex-col justify-center px-4 py-8 sm:px-8 lg:col-span-5 lg:py-10">
          <div className="mx-auto w-full max-w-[300px]">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/images/logo.png"
                alt="HyperBuds"
                width={22}
                height={22}
                className="h-5 w-5 object-contain"
              />
              <span className="text-sm font-extrabold tracking-tight text-purple-700">
                hyperbuds
              </span>
            </div>

            <h1 className="mt-4 text-center text-3xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-[34px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-center text-xs text-slate-500">{subtitle}</p>
            )}

            {children}
          </div>
        </div>

        {/* Right column: Looping video showcase with creator matchmaking & sorting pins */}
        <div className="relative min-h-[360px] overflow-hidden rounded-[24px] bg-slate-950 lg:col-span-7 lg:min-h-[540px]">
          <video
            src={MATCHMAKING_VIDEO_SRC}
            poster="/images/hero/photo-1522071820081-009f0129c71c.png"
            autoPlay
            muted={muted}
            loop
            playsInline
            preload="metadata"
            aria-label="Creator matchmaking and smart collaboration sorting preview video"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-purple-950/25 to-slate-950/35" />

          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? 'Unmute background video' : 'Mute background video'}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2.5 text-white backdrop-blur-md transition hover:bg-black/65"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Top-left floating match callout pin */}
          <div className="absolute left-6 top-10 z-10 flex flex-col items-start">
            <div className="ml-6 flex flex-col items-center">
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
              <span className="h-7 w-px bg-white/60" />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-slate-950/55 px-4 py-3 text-white shadow-xl backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/80 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">AI Match · 96%</p>
                <p className="text-[11px] text-white/80">Design &amp; Live Creators</p>
              </div>
            </div>
          </div>

          {/* Right-middle floating smart sorting pin */}
          <div className="absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end sm:flex">
            <div className="rounded-2xl border border-white/25 bg-slate-950/55 px-4 py-3 text-white shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-purple-300" />
                <p className="text-sm font-extrabold">Smart Sorting</p>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-white/80">
                Ranked by niche, audience &amp; Rizz
              </p>
            </div>
            <div className="mr-8 flex flex-col items-center">
              <span className="h-8 w-px bg-white/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
            </div>
          </div>

          {/* Bottom-center white landmark tag */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-slate-950 shadow-xl">
              <Users className="h-3.5 w-3.5 text-purple-700" />
              <span>Creator Matchmaking Hub</span>
            </div>
            <span className="h-4 w-px bg-white/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
