'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Volume2, VolumeX, X } from 'lucide-react';

interface ShowcaseSlide {
  id: string;
  tabLabel: string;
  badge: string;
  headline: string;
  subtitle: string;
  mediaType: 'video' | 'image';
  src: string;
  poster?: string;
}

const SLIDE_DURATION_MS = 6000;

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'live-studio',
    tabLabel: 'Live Studio 4K',
    badge: 'LiveKit WebRTC',
    headline: 'LIVE CO-STREAMING',
    subtitle: 'Broadcast multi-guest WebRTC sessions with studio audio and real-time chat.',
    mediaType: 'video',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'ai-match',
    tabLabel: 'AI Matchmaking',
    badge: 'Rizz Score 2.0',
    headline: 'SMART CREATOR MATCH',
    subtitle: 'Explainable AI pairing ranked by niche, engagement velocity, and audience fit.',
    mediaType: 'image',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=90',
  },
  {
    id: 'creator-reels',
    tabLabel: 'Creator Reels',
    badge: '9:16 Vertical',
    headline: 'CINEMATIC REELS',
    subtitle: 'Publish behind-the-scenes clips and creator stories directly on global CDN.',
    mediaType: 'video',
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'startup-hub',
    tabLabel: 'Startup Hub',
    badge: 'Transparent Offers',
    headline: 'STARTUP & TALENT HUB',
    subtitle: 'Pitch ventures, invite top talent, and negotiate salary and equity in the open.',
    mediaType: 'image',
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=90',
  },
];

interface AuthSplitShowcaseProps {
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Higgsfield-inspired full-bleed dark split authentication shell:
 * Left: high-impact image & video carousel with bottom segmented progress tabs.
 * Right: centered dark auth column with clean brand header and legal footer.
 */
export default function AuthSplitShowcase({
  title,
  subtitle,
  children,
}: AuthSplitShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setProgress(0);
    const stepMs = 50;
    const increment = (stepMs / SLIDE_DURATION_MS) * 100;
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          setActiveIndex((idx) => (idx + 1) % SHOWCASE_SLIDES.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [activeIndex]);

  const currentSlide = SHOWCASE_SLIDES[activeIndex];

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 bg-[#0b0b0e] text-white lg:grid-cols-2">
      {/* Left Column: Full-bleed Higgsfield-style high-res image & video carousel */}
      <div className="relative order-2 p-3 sm:p-4 lg:order-1 lg:h-screen lg:sticky lg:top-0">
        <div className="relative flex h-[440px] w-full flex-col justify-end overflow-hidden rounded-[22px] bg-zinc-950 ring-1 ring-white/10 lg:h-full">
          {/* Active slide media */}
          {SHOWCASE_SLIDES.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={slide.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  isActive ? 'z-0 opacity-100' : 'pointer-events-none z-0 opacity-0'
                }`}
              >
                {slide.mediaType === 'video' ? (
                  <video
                    src={slide.src}
                    poster={slide.poster}
                    autoPlay
                    muted={muted}
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.src}
                    alt={slide.headline}
                    className="h-full w-full object-cover object-center"
                  />
                )}
              </div>
            );
          })}

          {/* Moody cinema gradient overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/95 via-black/35 to-black/20" />

          {/* Audio toggle for video slides */}
          {currentSlide.mediaType === 'video' && (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute preview video' : 'Mute preview video'}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/75"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}

          {/* Bottom editorial caption + Higgsfield segmented tab bar */}
          <div className="relative z-20 p-5 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-purple-300" />
              {currentSlide.badge}
            </span>

            <h2 className="mt-3 text-3xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-4xl xl:text-[42px]">
              {currentSlide.headline}
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-300">
              {currentSlide.subtitle}
            </p>

            {/* 4 Segmented Progress Tabs */}
            <div
              role="tablist"
              aria-label="HyperBuds highlights"
              className="mt-6 grid grid-cols-4 gap-2.5 sm:gap-3"
            >
              {SHOWCASE_SLIDES.map((slide, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveIndex(idx);
                      setProgress(0);
                    }}
                    className="group flex flex-col text-left focus:outline-none"
                  >
                    <span className="h-[3px] w-full overflow-hidden rounded-full bg-white/20">
                      <span
                        className="block h-full rounded-full bg-white transition-[width] duration-75"
                        style={{
                          width: isActive ? `${progress}%` : isPast ? '100%' : '0%',
                        }}
                      />
                    </span>
                    <span
                      className={`mt-2 truncate text-[11px] font-medium transition sm:text-xs ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      {slide.tabLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Centered dark Higgsfield-style auth panel */}
      <div className="relative order-1 flex min-h-[540px] flex-col justify-center px-6 py-12 sm:px-10 lg:order-2 lg:min-h-screen">
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Link>

        <div className="mx-auto w-full max-w-[360px]">
          <div className="text-center">
            <h1 className="text-[28px] font-bold leading-[1.18] tracking-tight text-white sm:text-[32px]">
              {title}
              <span className="mt-1 inline-flex items-center justify-center gap-2 align-middle">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 ring-1 ring-purple-400/40">
                  <Image
                    src="/images/logo.png"
                    alt="HyperBuds"
                    width={22}
                    height={22}
                    className="h-5 w-5 object-contain"
                  />
                </span>
                <span className="bg-linear-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text font-extrabold text-transparent">
                  HyperBuds
                </span>
              </span>
            </h1>
            {subtitle && (
              <p className="mt-2 text-xs text-zinc-400">{subtitle}</p>
            )}
          </div>

          {children}

          <p className="mt-7 text-center text-[11px] leading-relaxed text-zinc-500">
            By continuing, you agree to the{' '}
            <Link href="/about" className="underline underline-offset-2 transition hover:text-zinc-300">
              Terms of Use
            </Link>
            , acknowledge the{' '}
            <Link href="/about" className="underline underline-offset-2 transition hover:text-zinc-300">
              Privacy Policy
            </Link>{' '}
            and confirm that you are at least 18 years old.
          </p>
        </div>
      </div>
    </div>
  );
}
