'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const SESSION_KEY = 'hb_pwa_preloader_shown_v1';

/**
 * White-background PWA / initial boot preloader with subtle repeating HyperBuds
 * creator-ecosystem pattern icons and an animated HyperBuds emblem.
 */
export default function PwaPreloader() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') return;
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Proceed even if sessionStorage is restricted
    }

    setVisible(true);
    const fadeTimer = window.setTimeout(() => setFading(true), 780);
    const hideTimer = window.setTimeout(() => setVisible(false), 1120);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading HyperBuds"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-white transition-opacity duration-300 ease-out ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      {/* Subtle repeating HyperBuds creator-icon pattern on crisp white */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-purple-900/[0.055]"
      >
        <defs>
          <pattern
            id="hb-brand-pattern"
            width="144"
            height="144"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-12)"
          >
            {/* Video camera (Reels & Video Collab) */}
            <g transform="translate(18, 18)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="0" y="3" width="14" height="10" rx="2.5" />
              <path d="M14 6.5l4.5-2.5v8L14 9.5" />
            </g>

            {/* Microphone (Podcasts & Live Studio) */}
            <g transform="translate(86, 16)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="1" width="6" height="10" rx="3" />
              <path d="M2 8a6 6 0 0 0 12 0" />
              <line x1="8" y1="14" x2="8" y2="17" />
              <line x1="5" y1="17" x2="11" y2="17" />
            </g>

            {/* Spark / AI Match */}
            <g transform="translate(52, 62)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 1l2 5.5L16.5 8.5 11 10.5 9 16l-2-5.5L1.5 8.5 7 6.5 9 1z" />
            </g>

            {/* Collaborators / Community */}
            <g transform="translate(110, 68)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="5" r="3" />
              <path d="M1 15v-1.2A3.8 3.8 0 0 1 4.8 10h2.4A3.8 3.8 0 0 1 11 13.8V15" />
              <circle cx="14" cy="6" r="2.2" />
              <path d="M14.5 10.5a3.2 3.2 0 0 1 3 3.2V15" />
            </g>

            {/* Play / Reels */}
            <g transform="translate(16, 98)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="1" width="15" height="15" rx="4" />
              <polygon points="7,5.5 12,8.5 7,11.5" />
            </g>

            {/* Growth / Rising arrow */}
            <g transform="translate(76, 108)" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,13 6,8 10,11 16,3" />
              <polyline points="11,3 16,3 16,8" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hb-brand-pattern)" />
      </svg>

      {/* Soft radial white center vignette so the animated logo stands out cleanly */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.65) 38%, rgba(255,255,255,0) 72%)',
        }}
      />

      {/* Centered animated logo mark */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px] border border-purple-200/80 bg-purple-50/40 animate-ping"
            style={{ animationDuration: '1.8s' }}
          />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.08)] hb-preloader-logo">
            <Image
              src="/images/logo.png"
              alt="HyperBuds"
              width={52}
              height={52}
              priority
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>

        <p className="mt-5 text-lg font-bold tracking-tight text-slate-900">HyperBuds</p>
        <div className="mt-3 h-1 w-24 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 rounded-full bg-purple-600 hb-preloader-bar" />
        </div>
      </div>

      <style jsx>{`
        .hb-preloader-logo {
          animation: hbLogoFloat 1.5s ease-in-out infinite;
        }
        .hb-preloader-bar {
          animation: hbBarSlide 1.05s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes hbLogoFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-4px) scale(1.04);
          }
        }
        @keyframes hbBarSlide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  );
}
