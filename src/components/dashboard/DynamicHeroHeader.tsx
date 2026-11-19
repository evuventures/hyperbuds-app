'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HERO_AVATARS, HERO_SLIDES, type HeroSlide, type HeroTone } from './heroSlides';

const SLIDE_DURATION_MS = 7000;
type HeroSize = 'sm' | 'md' | 'lg';

/** Card palettes are built only from the HyperBuds purple / indigo / blue identity. */
const TONES: Record<HeroTone, { card: string; stroke: string; text: string; solid: string }> = {
  purple: {
    card: 'bg-linear-to-br from-[#6b21a8] via-[#7e22ce] to-[#a855f7]',
    stroke: 'bg-[#e9d5ff] dark:bg-[#7e22ce]/55',
    text: 'text-[#7e22ce]',
    solid: 'bg-[#7e22ce]',
  },
  indigo: {
    card: 'bg-linear-to-br from-[#3730a3] via-[#4f46e5] to-[#6366f1]',
    stroke: 'bg-[#e0e7ff] dark:bg-[#4f46e5]/55',
    text: 'text-[#4f46e5]',
    solid: 'bg-[#4f46e5]',
  },
  violet: {
    card: 'bg-linear-to-br from-[#4c1d95] via-[#6d28d9] to-[#8b5cf6]',
    stroke: 'bg-[#ede9fe] dark:bg-[#6d28d9]/55',
    text: 'text-[#6d28d9]',
    solid: 'bg-[#6d28d9]',
  },
  fuchsia: {
    card: 'bg-linear-to-br from-[#701a75] via-[#a21caf] to-[#c026d3]',
    stroke: 'bg-[#fae8ff] dark:bg-[#a21caf]/55',
    text: 'text-[#a21caf]',
    solid: 'bg-[#a21caf]',
  },
  blue: {
    card: 'bg-linear-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]',
    stroke: 'bg-[#dbeafe] dark:bg-[#2563eb]/55',
    text: 'text-[#2563eb]',
    solid: 'bg-[#2563eb]',
  },
  ink: {
    card: 'bg-linear-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',
    stroke: 'bg-[#e0e7ff] dark:bg-[#4338ca]/55',
    text: 'text-[#312e81]',
    solid: 'bg-[#312e81]',
  },
};

const OVERLAP_VARIANTS: HeroSlide['variant'][] = ['split', 'mirror', 'reel', 'duo'];

/** Crisp 8-direction pure white die-cut contour + dark studio elevation shadow for floating hero cutouts. */
const CUTOUT_BORDER_SHADOW =
  '[filter:drop-shadow(2.5px_0_0_#ffffff)_drop-shadow(-2.5px_0_0_#ffffff)_drop-shadow(0_2.5px_0_#ffffff)_drop-shadow(0_-2.5px_0_#ffffff)_drop-shadow(1.8px_1.8px_0_#ffffff)_drop-shadow(-1.8px_-1.8px_0_#ffffff)_drop-shadow(1.8px_-1.8px_0_#ffffff)_drop-shadow(-1.8px_1.8px_0_#ffffff)_drop-shadow(0_1px_2px_rgba(15,23,42,0.22))_drop-shadow(0_14px_26px_rgba(15,23,42,0.34))]';

/** Bottom-anchored variant for portraits standing flush on the bottom edge of the hero card (no downward lip overhang). */
const CUTOUT_ANCHORED_SHADOW =
  '[filter:drop-shadow(2.5px_0_0_#ffffff)_drop-shadow(-2.5px_0_0_#ffffff)_drop-shadow(0_-2.5px_0_#ffffff)_drop-shadow(1.8px_-1.8px_0_#ffffff)_drop-shadow(-1.8px_-1.8px_0_#ffffff)_drop-shadow(4px_0_12px_rgba(15,23,42,0.22))_drop-shadow(-4px_0_12px_rgba(15,23,42,0.22))_drop-shadow(0_-3px_10px_rgba(15,23,42,0.16))]';

/** Crisp white die-cut outline + tactile studio shadow visible even against the white Featured card surface. */
const MINI_CUTOUT_BORDER_SHADOW =
  '[filter:drop-shadow(2px_0_0_#ffffff)_drop-shadow(-2px_0_0_#ffffff)_drop-shadow(0_2px_0_#ffffff)_drop-shadow(0_-2px_0_#ffffff)_drop-shadow(1.4px_1.4px_0_#ffffff)_drop-shadow(-1.4px_-1.4px_0_#ffffff)_drop-shadow(1.4px_-1.4px_0_#ffffff)_drop-shadow(-1.4px_1.4px_0_#ffffff)_drop-shadow(0_1px_2px_rgba(15,23,42,0.26))_drop-shadow(0_8px_16px_rgba(15,23,42,0.24))]';

const delay = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` });

/* ------------------------------------------------------------------ */
/* Media primitives                                                    */
/* ------------------------------------------------------------------ */

function SafeHeroImage({
  src,
  alt,
  fallbackTitle,
  className = '',
}: {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle}
        className={`flex items-center justify-center p-4 text-center text-white/95 ${className}`}
      >
        <div className="space-y-1">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xs font-bold tracking-wider ring-1 ring-white/40">
            HB
          </span>
          <p className="text-xs font-semibold leading-snug">{fallbackTitle}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function AvatarChip({ src, index }: { src: string; index: number }) {
  const [failed, setFailed] = useState(false);
  const initials = ['MC', 'JK', 'AL', 'DR'][index % 4];

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold text-white ring-2 ring-white/80 backdrop-blur-sm">
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      className="h-8 w-8 rounded-full bg-transparent object-cover object-top ring-2 ring-white shadow-[0_4px_10px_rgba(15,23,42,0.3)]"
    />
  );
}

function CutoutImage({
  src,
  alt,
  anchored = false,
  className = '',
}: {
  src: string;
  alt: string;
  anchored?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative flex items-end justify-center bg-transparent px-2 pt-2 ${className}`}>
      <SafeHeroImage
        src={src}
        alt={alt}
        fallbackTitle={alt || 'HyperBuds Spotlight'}
        className={`h-full w-full select-none object-cover object-top ${
          anchored
            ? `rounded-t-2xl ${CUTOUT_ANCHORED_SHADOW}`
            : `rounded-2xl ${CUTOUT_BORDER_SHADOW}`
        }`}
      />
    </div>
  );
}

function AutoVideo({
  slide,
  muted,
  onToggleMute,
  className = '',
}: {
  slide: HeroSlide;
  muted: boolean;
  onToggleMute: () => void;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-black shadow-2xl shadow-black/30 ${className}`}>
      <video
        key={slide.media.src}
        src={slide.media.src}
        poster={slide.media.poster}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={slide.media.alt}
        className="h-full w-full object-cover"
      />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
        Now playing
      </span>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute spotlight video' : 'Mute spotlight video'}
        className="absolute bottom-3 right-3 rounded-full bg-black/55 p-2 text-white backdrop-blur-sm transition hover:bg-black/75"
      >
        {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function FeaturedCard({ slide, toneText, compact = false }: { slide: HeroSlide; toneText: string; compact?: boolean }) {
  return (
    <Link
      href={slide.featured.href}
      className={`group block rounded-[20px] bg-white p-2.5 text-center shadow-xl shadow-black/15 transition hover:-translate-y-0.5 dark:bg-slate-950 ${
        compact ? 'w-[176px]' : 'w-[196px]'
      }`}
    >
      <div className="flex h-[126px] items-center justify-center overflow-hidden rounded-[14px] bg-slate-100 dark:bg-slate-900">
        <SafeHeroImage
          src={slide.featured.image}
          alt={slide.featured.title}
          fallbackTitle={slide.featured.title}
          className={`h-full w-full rounded-[14px] object-cover object-top ${MINI_CUTOUT_BORDER_SHADOW}`}
        />
      </div>
      <p className="mt-2.5 truncate text-sm font-bold text-slate-900 dark:text-white">{slide.featured.title}</p>
      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{slide.featured.subtitle}</p>
      <span
        className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-current py-1 pl-1 pr-3 text-[11px] font-semibold ${toneText} dark:text-white`}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current">
          <ArrowUpRight className="h-3 w-3 text-white dark:text-slate-900" />
        </span>
        {slide.featured.action}
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function DynamicHeroHeader() {
  const rootRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState<HeroSize>('lg');
  const [index, setIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  // Respect reduced-motion: no automatic rotation.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setAutoAdvance(false);
  }, []);

  // The hero lives in a fluid column, so lay out against its own width.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const update = () => {
      const w = el.clientWidth;
      setSize(w >= 880 ? 'lg' : w >= 600 ? 'md' : 'sm');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const running = autoAdvance && !paused;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(
      () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
      SLIDE_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, index]);

  const slide = HERO_SLIDES[index];
  const tone = TONES[slide.tone];
  const lg = size === 'lg';
  const overlap = lg && OVERLAP_VARIANTS.includes(slide.variant);

  const go = (next: number) => setIndex((next + HERO_SLIDES.length) % HERO_SLIDES.length);

  /* ---------------- Headline (left reference: "Own the EDGE · Keep the VIBE") */
  const lightCls =
    size === 'lg'
      ? 'text-[26px]'
      : size === 'md'
      ? 'text-lg'
      : 'text-base';
  const boldCls =
    size === 'lg'
      ? 'text-[58px]'
      : size === 'md'
      ? 'text-[40px]'
      : 'text-[34px]';

  // Plain render helper (not a nested component) so hover re-renders never replay the animation.
  const renderHeadline = (light: string, bold: string, ms: number) => (
    <div className="animate-hb-slide-left isolate flex items-baseline gap-2.5" style={delay(ms)}>
      <span className={`font-semibold italic tracking-tight text-slate-800 dark:text-slate-200 ${lightCls}`}>
        {light}
      </span>
      <span className={`hb-display relative leading-[0.9] text-slate-950 dark:text-white ${boldCls}`}>
        <span
          aria-hidden="true"
          className={`absolute -bottom-0.5 left-[-6%] -z-10 h-[34%] w-[112%] -rotate-2 rounded-full ${tone.stroke}`}
        />
        {bold}
      </span>
    </div>
  );

  /* ---------------- Text column (slides in from the left) */
  const textColumn = (
    <div key={`text-${slide.id}`} className="flex h-full min-w-0 flex-col">
      <p className="animate-hb-slide-left text-xs font-semibold tracking-wide text-white/80" style={delay(40)}>
        {slide.eyebrow}
      </p>
      <h2
        className={`animate-hb-slide-left mt-2 font-bold leading-[1.12] tracking-tight text-white ${
          lg ? 'text-[34px]' : size === 'md' ? 'text-[28px]' : 'text-2xl'
        }`}
        style={delay(100)}
      >
        {slide.title}
      </h2>
      <p
        className={`animate-hb-slide-left mt-3 max-w-[34ch] leading-relaxed text-white/85 ${lg ? 'text-[15px]' : 'text-sm'}`}
        style={delay(160)}
      >
        {slide.subtitle}
      </p>

      <div className="animate-hb-slide-left mt-5" style={delay(220)}>
        <Link
          href={slide.cta.href}
          className={`inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold transition hover:bg-slate-50 ${tone.text}`}
        >
          {slide.cta.label}
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${tone.solid}`}>
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <div
        className={`animate-hb-slide-left ${lg ? 'mt-auto pt-6' : 'mt-5'} `}
        style={delay(300)}
      >
        <div className="inline-flex items-center gap-3 rounded-2xl bg-white/12 p-2.5 pr-4 ring-1 ring-white/20 backdrop-blur-sm">
          <div className="flex -space-x-2">
            {HERO_AVATARS.map((src, i) => (
              <AvatarChip key={src} src={src} index={i} />
            ))}
          </div>
          <p className="flex items-start gap-1.5 text-[11px] font-medium leading-snug text-white/90">
            <Star className="mt-px h-3.5 w-3.5 shrink-0 fill-current" />
            <span className="max-w-[16ch]">{slide.socialProof}</span>
          </p>
        </div>
      </div>
    </div>
  );

  /* ---------------- Overlapping media (slides in from the bottom) — large layouts only */
  const overlapMedia = (
    <div className="relative min-h-[290px]">
      <div className="absolute bottom-[-28px] left-1/2 h-[calc(100%+136px)] -translate-x-1/2">
        <div key={`media-${slide.id}`} className="animate-hb-slide-bottom h-full" style={delay(80)}>
          {slide.variant === 'reel' ? (
            <AutoVideo
              slide={slide}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              className="aspect-[9/16] h-full rounded-[28px] ring-2 ring-white shadow-[0_14px_30px_rgba(15,23,42,0.34)]"
            />
          ) : slide.variant === 'duo' ? (
            <div className="relative aspect-[0.98] h-full">
              <div className="absolute bottom-0 left-[-4%] h-[76%] w-[62%]">
                <CutoutImage
                  src={slide.media.secondarySrc || slide.media.src}
                  alt=""
                  anchored
                  className="h-full w-full opacity-95"
                />
              </div>
              <div className="absolute bottom-0 right-[-4%] h-full w-[66%]">
                <CutoutImage src={slide.media.src} alt={slide.media.alt} anchored className="h-full w-full" />
              </div>
            </div>
          ) : (
            <CutoutImage
              src={slide.media.src}
              alt={slide.media.alt}
              anchored={!slide.media.floating}
              className="aspect-[0.88] h-full"
            />
          )}
        </div>
      </div>
    </div>
  );

  /* ---------------- Right column for overlap layouts: featured card only (tags removed) */
  const sideColumn = (
    <div key={`side-${slide.id}`} className="animate-hb-slide-right flex h-full flex-col items-end justify-end gap-6" style={delay(160)}>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-white">{slide.featured.label}</p>
        <FeaturedCard slide={slide} toneText={tone.text} />
      </div>
    </div>
  );

  /* ---------------- In-flow media for stage / tiles / compact sizes */
  const inflowMedia = () => {
    const isVideo = slide.media.type === 'video';
    if (lg && slide.variant === 'stage') {
      return (
        <div key={`media-${slide.id}`} className="animate-hb-slide-bottom flex h-full items-center" style={delay(80)}>
          <AutoVideo
            slide={slide}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            className="aspect-video w-full rounded-[22px] ring-2 ring-white shadow-[0_14px_28px_rgba(15,23,42,0.34)]"
          />
        </div>
      );
    }
    if (lg && slide.variant === 'tiles') {
      return (
        <div
          key={`media-${slide.id}`}
          className="animate-hb-slide-bottom relative flex h-full min-h-[300px] items-end justify-center -mb-7 pt-2"
          style={delay(80)}
        >
          <SafeHeroImage
            src={slide.media.src}
            alt={slide.media.alt}
            fallbackTitle={slide.title}
            className={`max-h-[312px] w-auto max-w-full object-contain object-bottom ${CUTOUT_ANCHORED_SHADOW}`}
          />
          <div className="animate-hb-slide-right absolute bottom-10 right-3" style={delay(200)}>
            <FeaturedCard slide={slide} toneText={tone.text} compact />
          </div>
        </div>
      );
    }
    // md / sm sizes
    const aspect =
      slide.variant === 'reel'
        ? size === 'sm'
          ? 'aspect-[4/5]'
          : 'aspect-[9/14]'
        : isVideo
        ? 'aspect-video'
        : size === 'sm'
        ? 'aspect-[16/10]'
        : 'aspect-[4/5]';
    if (isVideo) {
      return (
        <div key={`media-${slide.id}`} className="animate-hb-slide-bottom flex items-center" style={delay(80)}>
          <AutoVideo
            slide={slide}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            className={`w-full rounded-[20px] ring-2 ring-white shadow-[0_12px_24px_rgba(15,23,42,0.3)] ${aspect}`}
          />
        </div>
      );
    }
    if (size === 'md') {
      const floating = Boolean(slide.media.floating);
      return (
        <div
          key={`media-${slide.id}`}
          className={`animate-hb-slide-bottom flex justify-center ${
            floating ? 'items-center py-2' : '-mb-6 items-end self-end pt-2'
          }`}
          style={delay(80)}
        >
          <SafeHeroImage
            src={slide.media.src}
            alt={slide.media.alt}
            fallbackTitle={slide.title}
            className={`w-auto max-w-full select-none object-contain object-bottom ${
              floating ? `h-[240px] ${CUTOUT_BORDER_SHADOW}` : `h-[268px] ${CUTOUT_ANCHORED_SHADOW}`
            }`}
          />
        </div>
      );
    }
    return (
      <div key={`media-${slide.id}`} className="animate-hb-slide-bottom flex items-center justify-center py-1" style={delay(80)}>
        <SafeHeroImage
          src={slide.media.src}
          alt={slide.media.alt}
          fallbackTitle={slide.title}
          className={`h-[192px] w-auto max-w-full select-none rounded-b-2xl object-contain object-bottom ${CUTOUT_BORDER_SHADOW}`}
        />
      </div>
    );
  };

  /* ---------------- Grid composition per layout variant */
  let gridCols = 'grid-cols-1';
  let columns: React.ReactNode;
  if (lg && overlap) {
    gridCols =
      slide.variant === 'mirror'
        ? 'grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,0.8fr)]'
        : 'grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.8fr)]';
    columns =
      slide.variant === 'mirror' ? (
        <>
          {overlapMedia}
          {textColumn}
          {sideColumn}
        </>
      ) : (
        <>
          {textColumn}
          {overlapMedia}
          {sideColumn}
        </>
      );
  } else if (lg) {
    gridCols =
      slide.variant === 'stage'
        ? 'grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]'
        : 'grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]';
    columns = (
      <>
        {textColumn}
        {inflowMedia()}
      </>
    );
  } else if (size === 'md') {
    gridCols = 'grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]';
    columns = (
      <>
        {textColumn}
        {inflowMedia()}
      </>
    );
  } else {
    columns = (
      <>
        {inflowMedia()}
        {textColumn}
      </>
    );
  }

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="HyperBuds spotlight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 ${
        lg ? 'px-6 pb-5 pt-6' : 'p-4 sm:p-5'
      }`}
    >
      {/* Editorial headline row */}
      <div
        key={`headline-${slide.id}`}
        className={`relative flex ${
          size === 'sm'
            ? 'flex-col gap-1'
            : slide.variant === 'mirror' && lg
            ? 'items-end justify-end gap-12'
            : 'items-end justify-between gap-6'
        }`}
      >
        {overlap && slide.variant !== 'mirror' && (
          <span
            aria-hidden="true"
            className={`absolute bottom-1 left-[24%] right-[26%] h-5 -rotate-1 rounded-full opacity-80 ${tone.stroke}`}
          />
        )}
        {renderHeadline(slide.headline.leftLight, slide.headline.leftBold, 0)}
        {renderHeadline(slide.headline.rightLight, slide.headline.rightBold, 90)}
      </div>

      {/* Brand card */}
      <div
        aria-live={running ? 'off' : 'polite'}
        className={`relative z-10 rounded-[24px] text-white ${tone.card} ${
          lg ? 'mt-4 min-h-[340px] p-7' : size === 'md' ? 'mt-4 p-6' : 'mt-3 p-4'
        }`}
      >
        {/* Soft brand swooshes */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
          <span className="absolute -left-10 top-10 h-20 w-80 -rotate-12 rounded-full bg-white/10" />
          <span className="absolute left-[34%] top-[46%] h-14 w-72 rotate-[-8deg] rounded-full bg-white/10" />
          <span className="absolute -right-16 bottom-8 h-24 w-96 -rotate-6 rounded-full bg-white/[0.07]" />
          <span className="absolute left-[40%] -top-10 h-40 w-40 rounded-full bg-white/[0.06]" />
        </div>

        <div className={`relative grid gap-6 ${gridCols} ${lg ? 'min-h-[284px]' : ''}`}>{columns}</div>
      </div>

      {/* Minimal previous/next arrows without tags, progress bar, or pause toggle */}
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous spotlight"
          className="rounded-full border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next spotlight"
          className="rounded-full border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
