'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mic, Radio, Sparkles, Zap } from 'lucide-react';

const SPLASH_SEEN_KEY = 'hb_splash_seen';

const SLIDES = [
  {
    id: 'clarity',
    title: 'Collaborate, With Deeper Clarity.',
    subtitle:
      'Go beyond cold DMs. Discover how niche, audience, and creative chemistry spark real creator partnerships.',
    cta: 'Continue',
  },
  {
    id: 'compatibility',
    title: 'Compatibility, Explained Simply.',
    subtitle:
      'Our AI Rizz Score breaks down audience overlap and collab energy—so you know why a match works before you pitch.',
    cta: 'Continue',
  },
  {
    id: 'studio',
    title: 'Go Live, Podcast & Earn Together.',
    subtitle:
      'Co-stream in HD, record podcasts straight from your browser, and grow your creator business all in one place.',
    cta: 'Get Started',
  },
] as const;

export function HyperBudsSplash() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const finishSplash = (target: '/auth/signin' | '/auth/signup') => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SPLASH_SEEN_KEY, '1');
      } catch {
        // Ignore storage errors
      }
    }
    router.push(target);
  };

  const handleNext = () => {
    if (step < SLIDES.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishSplash('/auth/signup');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const diff = touchStartX.current - endX;
    touchStartX.current = null;
    if (Math.abs(diff) < 42) return;
    if (diff > 0 && step < SLIDES.length - 1) setStep((s) => s + 1);
    if (diff < 0 && step > 0) setStep((s) => s - 1);
  };

  const activeSlide = SLIDES[step];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-white text-slate-950 dark:bg-[#0B0614] dark:text-white"
    >
      {/* Luminous Top Aura (HyperBuds Lavender + Warm Peach + Rose + Mint) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[62%] opacity-95 dark:opacity-35"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, rgba(254, 215, 170, 0.72) 0%, transparent 52%), radial-gradient(circle at 86% 16%, rgba(244, 180, 232, 0.65) 0%, transparent 48%), radial-gradient(circle at 52% 40%, rgba(196, 165, 255, 0.45) 0%, transparent 58%), radial-gradient(circle at 82% 48%, rgba(187, 247, 208, 0.45) 0%, transparent 45%)',
        }}
      />

      {/* Centered Mobile-Proportioned Splash Canvas */}
      <div className="relative z-10 flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-between px-6 pt-5 pb-8 sm:my-6 sm:min-h-[780px] sm:rounded-[40px] sm:border sm:border-purple-200/70 sm:bg-white/75 sm:shadow-[0_24px_80px_rgba(91,33,182,0.14)] sm:backdrop-blur-xl dark:sm:border-purple-500/20 dark:sm:bg-[#120A21]/85">
        {/* Top Bar: Back Button + Brand / SKIP */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-md transition hover:bg-white dark:bg-white/10 dark:text-white dark:ring-white/15"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold tracking-tight text-purple-900 shadow-xs ring-1 ring-purple-200/70 backdrop-blur-md dark:bg-white/10 dark:text-purple-200 dark:ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
              HyperBuds
            </div>
          )}

          <button
            type="button"
            onClick={() => finishSplash('/auth/signin')}
            className="rounded-full bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-slate-600 shadow-xs ring-1 ring-slate-200/70 backdrop-blur-md transition hover:bg-white hover:text-slate-900 dark:bg-white/10 dark:text-slate-300 dark:ring-white/15 dark:hover:text-white"
          >
            SKIP
          </button>
        </div>

        {/* Visual Hero Stage */}
        <div className="relative my-auto flex h-[340px] w-full items-center justify-center sm:h-[360px]">
          {step === 0 && (
            <div className="relative h-full w-full">
              {/* Top-left creator bubble */}
              <div className="absolute top-6 left-3 h-28 w-28 overflow-hidden rounded-full border-[3px] border-white shadow-[0_14px_34px_rgba(88,28,135,0.16)] sm:h-30 sm:w-30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80"
                  alt="Creator portrait"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Top-right large creator bubble */}
              <div className="absolute top-2 right-2 h-40 w-40 overflow-hidden rounded-full border-[4px] border-white shadow-[0_18px_40px_rgba(88,28,135,0.18)] sm:h-44 sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  alt="Creator portrait"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Bottom-left large creator bubble */}
              <div className="absolute bottom-3 left-5 h-36 w-36 overflow-hidden rounded-full border-[4px] border-white shadow-[0_18px_40px_rgba(88,28,135,0.18)] sm:h-40 sm:w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
                  alt="Creator portrait"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Bottom-right small creator bubble */}
              <div className="absolute right-8 bottom-7 h-24 w-24 overflow-hidden rounded-full border-[3px] border-white shadow-[0_14px_30px_rgba(88,28,135,0.16)] sm:h-26 sm:w-26">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
                  alt="Creator portrait"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Playful Vector Sparkles & Petals (Matching Reference) */}
              <svg
                viewBox="0 0 48 48"
                className="absolute top-3 right-3 h-11 w-11 text-purple-400/90 drop-shadow-xs"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M24 2L28.5 19.5L46 24L28.5 28.5L24 46L19.5 28.5L2 24L19.5 19.5L24 2Z" />
              </svg>
              <div
                aria-hidden="true"
                className="absolute top-[116px] left-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-300/90 text-amber-800 shadow-sm"
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div
                aria-hidden="true"
                className="absolute top-[148px] left-[45%] h-9 w-9 rotate-12 rounded-tl-full rounded-br-full bg-rose-300/80 blur-[0.3px]"
              />
              <div
                aria-hidden="true"
                className="absolute right-7 bottom-[102px] h-7 w-7 rotate-45 rounded-md bg-emerald-300/85 shadow-xs"
              />
            </div>
          )}

          {step === 1 && (
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Left Tilted Creator Card */}
              <div className="absolute left-2 top-12 h-52 w-36 -rotate-10 overflow-hidden rounded-[26px] border-[3px] border-white bg-slate-900 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=360&q=80"
                  alt="Olivia creator"
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3 text-white">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/90 px-2 py-0.5 text-[9px] font-semibold">
                    ✓ Verified
                  </span>
                  <p className="mt-1 text-xs font-bold">Olivia</p>
                  <p className="text-[10px] text-white/75">Podcaster</p>
                </div>
              </div>

              {/* Right Tilted Creator Card */}
              <div className="absolute right-2 top-9 h-52 w-36 rotate-10 overflow-hidden rounded-[26px] border-[3px] border-white bg-slate-900 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=360&q=80"
                  alt="Creator collab"
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                  <p className="text-xs font-bold">Marcus</p>
                  <p className="text-[10px] text-white/75">Filmmaker</p>
                </div>
              </div>

              {/* Center Hero Compatibility Card */}
              <div className="relative z-10 h-60 w-48 overflow-hidden rounded-[28px] border-[4px] border-white bg-purple-950 shadow-[0_24px_50px_rgba(88,28,135,0.28)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=420&q=80"
                  alt="Milan creator"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 text-white">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/95 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    <Zap className="h-3 w-3 fill-current text-amber-300" />
                    92% Rizz Match
                  </span>
                  <p className="mt-1.5 text-sm font-bold leading-tight">Milan, 26</p>
                  <p className="text-[11px] text-white/80">Visual Creator</p>
                </div>
              </div>

              {/* Floating Frosted-Glass Reaction Bubbles */}
              <span className="absolute top-12 left-10 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm shadow-md ring-1 ring-white backdrop-blur-md">
                ✨
              </span>
              <span className="absolute top-7 right-9 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm shadow-md ring-1 ring-white backdrop-blur-md">
                😍
              </span>
              <span className="absolute right-8 top-36 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm shadow-md ring-1 ring-white backdrop-blur-md">
                👍
              </span>
              <span className="absolute bottom-11 left-12 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm shadow-md ring-1 ring-white backdrop-blur-md">
                🔥
              </span>
              <span className="absolute right-14 bottom-8 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-base shadow-md ring-1 ring-white backdrop-blur-md">
                ❤️
              </span>
            </div>
          )}

          {step === 2 && (
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Background Studio Glow Card */}
              <div className="relative z-10 w-[290px] overflow-hidden rounded-[30px] border-[4px] border-white bg-gradient-to-br from-[#2E0F5E] via-[#1B083B] to-[#0D041F] p-5 text-white shadow-[0_24px_60px_rgba(88,28,135,0.34)]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    LIVE STUDIO
                  </span>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-purple-100">
                    2.4k watching
                  </span>
                </div>

                {/* Co-Host Bubbles */}
                <div className="mt-5 flex items-center justify-center -space-x-3">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-purple-300 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=220&q=80"
                      alt="Host"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-amber-300 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=220&q=80"
                      alt="Co-host"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm font-bold">Creator Economy Live Pod</p>
                  <p className="mt-0.5 text-[11px] text-purple-200/80">
                    Co-Streaming + Browser Podcast Recorder
                  </p>
                </div>

                {/* Stylized Audio Waveform */}
                <div className="mt-4 flex h-9 items-end justify-center gap-1.5 rounded-2xl bg-white/10 px-4 py-2">
                  {[35, 65, 90, 50, 80, 100, 60, 85, 45, 70, 95, 55, 40].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-full bg-gradient-to-t from-purple-400 to-fuchsia-200"
                    />
                  ))}
                </div>
              </div>

              {/* Floating Studio Badges */}
              <span className="absolute top-10 left-5 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-purple-700 shadow-lg ring-1 ring-purple-100 backdrop-blur-md">
                <Radio className="h-5 w-5" />
              </span>
              <span className="absolute right-5 bottom-12 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-purple-700 shadow-lg ring-1 ring-purple-100 backdrop-blur-md">
                <Mic className="h-5 w-5" />
              </span>
            </div>
          )}
        </div>

        {/* Bottom Copy, Dots & Primary Pill CTA */}
        <div className="mt-2 flex flex-col items-center text-center">
          <h1 className="max-w-[300px] text-[28px] font-bold leading-[1.15] tracking-tight text-slate-950 dark:text-white">
            {activeSlide.title}
          </h1>
          <p className="mt-3 max-w-[310px] text-sm leading-relaxed text-slate-500 dark:text-slate-300">
            {activeSlide.subtitle}
          </p>

          {/* Progress Dots */}
          <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding steps">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={idx === step}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setStep(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === step
                    ? 'w-5 bg-slate-900 dark:bg-purple-400'
                    : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Sleek Dark / Brand Pill CTA */}
          <button
            type="button"
            onClick={handleNext}
            className="mt-5 w-full rounded-full bg-gradient-to-b from-slate-800 to-slate-950 py-3.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition hover:from-purple-700 hover:to-purple-900 active:scale-[0.99] dark:from-purple-600 dark:to-purple-800"
          >
            {activeSlide.cta}
          </button>

          <button
            type="button"
            onClick={() => finishSplash('/auth/signin')}
            className="mt-3 text-xs font-medium text-slate-500 transition hover:text-purple-700 dark:text-slate-400 dark:hover:text-purple-300"
          >
            Already have an account? <span className="font-semibold text-slate-800 dark:text-white">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HyperBudsSplash;
