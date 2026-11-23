'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Share2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ShareableGameSummary {
  id: string;
  gameMode: string;
  region: string;
  title: string;
  premise: string;
  hashtag: string;
  trendingTags: string[];
  completedRounds: number;
  totalRounds: number;
  rewardCredits: number;
  rewardRizzBoost: number;
  username?: string;
}

interface ChallengeShareCardModalProps {
  game: ShareableGameSummary | null;
  onClose: () => void;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/);
  let line = '';
  let lines = 0;
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const test = line ? `${line} ${words[n]}` : words[n];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines += 1;
      if (lines >= maxLines) {
        ctx.fillText(`${line.slice(0, -1)}…`, x, curY);
        return curY + lineHeight;
      }
      ctx.fillText(line, x, curY);
      line = words[n];
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

/**
 * Generates a crisp 1080x1350 (4:5) Story/Post PNG card for TikTok, IG Stories,
 * WhatsApp Status, and X so creators can challenge their audience outside HyperBuds.
 */
export function ChallengeShareCardModal({ game, onClose }: ChallengeShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined' && game
      ? `${window.location.origin}/challenges${game.username ? `?ref=${encodeURIComponent(game.username)}` : ''}`
      : 'https://app.hyperbuds.cloud/challenges';

  useEffect(() => {
    if (!game) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // Deep obsidian editorial background
    ctx.fillStyle = '#0c0e14';
    ctx.fillRect(0, 0, W, H);

    // Subtle top-right HyperBuds purple aura
    const grad = ctx.createRadialGradient(880, 180, 40, 880, 180, 560);
    grad.addColorStop(0, 'rgba(124, 58, 237, 0.42)');
    grad.addColorStop(1, 'rgba(12, 14, 20, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Crisp outer frame
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // Top brand row
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 34px system-ui, -apple-system, sans-serif';
    ctx.fillText('HYPERBUDS', 96, 134);

    // Status pill
    const statusText =
      game.completedRounds >= game.totalRounds
        ? 'CHALLENGE CLEARED'
        : 'CHALLENGE ACCEPTED';
    ctx.fillStyle = game.completedRounds >= game.totalRounds ? '#10b981' : '#7c3aed';
    ctx.beginPath();
    ctx.roundRect(W - 430, 96, 334, 52, 26);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(statusText, W - 400, 130);

    // Game mode + region tag
    ctx.fillStyle = '#a78bfa';
    ctx.font = '700 26px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${game.gameMode.replace(/_/g, ' ').toUpperCase()}  ·  ${game.region}`, 96, 250);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px system-ui, -apple-system, sans-serif';
    const afterTitleY = wrapText(ctx, game.title, 96, 340, W - 192, 78, 3);

    // Premise
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 32px system-ui, -apple-system, sans-serif';
    wrapText(ctx, game.premise, 96, afterTitleY + 26, W - 192, 46, 4);

    // Stats strip box
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.roundRect(96, 820, W - 192, 165, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('ROUNDS', 140, 875);
    ctx.fillText('REWARD', 450, 875);
    ctx.fillText('CREATOR', 740, 875);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 40px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${game.completedRounds} / ${game.totalRounds}`, 140, 938);
    ctx.fillText(`+${game.rewardCredits} cr`, 450, 938);
    ctx.fillStyle = '#c4b5fd';
    ctx.font = '700 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(game.username ? `@${game.username.slice(0, 14)}` : 'HyperBuds', 740, 936);

    // Hashtags
    const tagsLine = (game.trendingTags.length ? game.trendingTags : [game.hashtag])
      .slice(0, 4)
      .map((t) => `#${t.replace(/^#/, '')}`)
      .join('   ');
    ctx.fillStyle = '#a78bfa';
    ctx.font = '700 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(tagsLine, 96, 1070);

    // Footer CTA
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Think you can beat this? Play today’s drop on:', 96, 1185);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px system-ui, -apple-system, sans-serif';
    ctx.fillText('app.hyperbuds.cloud/challenges', 96, 1235);

    setDataUrl(canvas.toDataURL('image/png'));
  }, [game]);

  if (!game) return null;

  const shareText = `I just took on "${game.title}" on HyperBuds! Think you can beat my run? ${game.trendingTags
    .slice(0, 3)
    .map((t) => `#${t.replace(/^#/, '')}`)
    .join(' ')} ${shareUrl}`;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `hyperbuds-${game.hashtag}.png`;
    a.click();
    toast.success('Challenge Card saved! Ready for IG Stories, TikTok & WhatsApp Status.');
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        if (dataUrl && navigator.canShare) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `hyperbuds-${game.hashtag}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title: game.title, text: shareText, files: [file] });
            return;
          }
        }
        await navigator.share({ title: game.title, text: shareText, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied!');
    } catch {
      // User dismissed share sheet
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareText).catch(() => null);
    setCopied(true);
    toast.success('Challenge invite copied!');
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Share Challenge Card
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <canvas ref={canvasRef} className="hidden" />
          {dataUrl && (
            <div className="mx-auto max-w-[260px] overflow-hidden rounded-xl border border-slate-200 shadow-md dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dataUrl} alt={game.title} className="h-auto w-full" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <Download className="h-3.5 w-3.5" />
              Save PNG Card
            </button>
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-purple-500"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share Now
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
