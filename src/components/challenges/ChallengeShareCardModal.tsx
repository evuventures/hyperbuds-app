'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Share2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export interface ShareableGameSummary {
  id: string;
  gameMode: string;
  region: string;
  difficulty?: string;
  title: string;
  premise: string;
  hashtag: string;
  trendingTags: string[];
  completedRounds: number;
  totalRounds: number;
  rewardCredits: number;
  rewardRizzBoost: number;
  username?: string;
  avatar?: string;
}

interface ChallengeShareCardModalProps {
  game: ShareableGameSummary | null;
  onClose: () => void;
}

function loadImg(src: string, crossOrigin = false): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function makeWhiteLogoCanvas(logoImg: HTMLImageElement, size: number): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (octx) {
    octx.drawImage(logoImg, 0, 0, size, size);
    octx.globalCompositeOperation = 'source-in';
    octx.fillStyle = '#ffffff';
    octx.fillRect(0, 0, size, size);
  }
  return off;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.closePath();
}

function drawTopNotchTrapezoid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  topW: number,
  botW: number,
  h: number,
) {
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(cx - topW / 2, topY);
  ctx.lineTo(cx + topW / 2, topY);
  ctx.lineTo(cx + botW / 2 + 6, topY + h - r);
  ctx.quadraticCurveTo(cx + botW / 2, topY + h, cx + botW / 2 - r, topY + h);
  ctx.lineTo(cx - botW / 2 + r, topY + h);
  ctx.quadraticCurveTo(cx - botW / 2, topY + h, cx - botW / 2 - 6, topY + h - r);
  ctx.closePath();
}

function drawBottomNotchTrapezoid(
  ctx: CanvasRenderingContext2D,
  cx: number,
  botY: number,
  botW: number,
  topW: number,
  h: number,
) {
  const r = 24;
  ctx.beginPath();
  ctx.moveTo(cx - botW / 2, botY);
  ctx.lineTo(cx + botW / 2, botY);
  ctx.lineTo(cx + topW / 2 + 6, botY - h + r);
  ctx.quadraticCurveTo(cx + topW / 2, botY - h, cx + topW / 2 - r, botY - h);
  ctx.lineTo(cx - topW / 2 + r, botY - h);
  ctx.quadraticCurveTo(cx - topW / 2, botY - h, cx - topW / 2 - 6, botY - h + r);
  ctx.closePath();
}

function drawFourPointSpark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx + size * 0.22, cy - size * 0.22, cx + size, cy);
  ctx.quadraticCurveTo(cx + size * 0.22, cy + size * 0.22, cx, cy + size);
  ctx.quadraticCurveTo(cx - size * 0.22, cy + size * 0.22, cx - size, cy);
  ctx.quadraticCurveTo(cx - size * 0.22, cy - size * 0.22, cx, cy - size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Collectible 9:16 (1080x1920) Challenge Card modeled on the user's collectible card reference,
 * styled in HyperBuds Purple + matte obsidian with the pure white HyperBuds logo.
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
    let cancelled = false;

    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const [logoImg, avatarImg] = await Promise.all([
        loadImg('/images/logo.png', false),
        game.avatar ? loadImg(game.avatar, true) : Promise.resolve(null),
      ]);
      if (cancelled) return;

      const whiteLogoLarge = logoImg ? makeWhiteLogoCanvas(logoImg, 128) : null;
      const whiteLogoSmall = logoImg ? makeWhiteLogoCanvas(logoImg, 56) : null;

      const W = 1080;
      const H = 1920;
      canvas.width = W;
      canvas.height = H;

      // 1. Vibrant HyperBuds Purple full-bleed backdrop (matches reference blue backdrop in HyperBuds purple)
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#7C3AED');
      bgGrad.addColorStop(0.5, '#5B21B6');
      bgGrad.addColorStop(1, '#3B0764');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Soft ambient backdrop orbs & floating translucent HyperBuds marks
      const aura1 = ctx.createRadialGradient(200, 320, 40, 200, 320, 440);
      aura1.addColorStop(0, 'rgba(196, 181, 253, 0.35)');
      aura1.addColorStop(1, 'rgba(124, 58, 237, 0)');
      ctx.fillStyle = aura1;
      ctx.fillRect(0, 0, W, H);

      const aura2 = ctx.createRadialGradient(880, 1520, 40, 880, 1520, 500);
      aura2.addColorStop(0, 'rgba(167, 139, 250, 0.32)');
      aura2.addColorStop(1, 'rgba(59, 7, 100, 0)');
      ctx.fillStyle = aura2;
      ctx.fillRect(0, 0, W, H);

      // Subtle floating sparks on the outer purple canvas
      const bgSparks: Array<[number, number, number, number]> = [
        [150, 260, 42, 0.18],
        [920, 290, 54, 0.16],
        [110, 1380, 48, 0.14],
        [940, 1460, 40, 0.16],
        [870, 520, 28, 0.14],
      ];
      for (const [sx, sy, sz, al] of bgSparks) {
        drawFourPointSpark(ctx, sx, sy, sz, '#ffffff', al);
      }

      // Top corner editorial labels (matches "UI UX" & "2023" in reference)
      if (whiteLogoSmall) {
        ctx.drawImage(whiteLogoSmall, 68, 70, 44, 44);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '700 30px system-ui, -apple-system, sans-serif';
      ctx.fillText('HYPERBUDS', whiteLogoSmall ? 124 : 72, 102);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = '600 30px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${game.region} · ${new Date().getFullYear()}`, W - 72, 102);
      ctx.textAlign = 'left';

      // 2. Centered Matte Obsidian Collectible Card (matches reference proportions & dark bezel)
      const cardX = 128;
      const cardY = 265;
      const cardW = W - 256; // 824
      const cardH = 1270;

      ctx.save();
      ctx.shadowColor = 'rgba(15, 5, 35, 0.55)';
      ctx.shadowBlur = 70;
      ctx.shadowOffsetY = 28;
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, 52);
      ctx.fillStyle = '#14151A';
      ctx.fill();
      ctx.restore();

      // Subtle card edge highlight
      drawRoundedRectPath(ctx, cardX, cardY, cardW, cardH, 52);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 3. Inner Artwork Window (top 60% of card)
      const artPad = 24;
      const artX = cardX + artPad;
      const artY = cardY + artPad;
      const artW = cardW - artPad * 2; // 776
      const artH = 740;

      ctx.save();
      drawRoundedRectPath(ctx, artX, artY, artW, artH, 36);
      ctx.clip();

      // Rich vibrant HyperBuds purple artwork backdrop
      const artGrad = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH);
      artGrad.addColorStop(0, '#8B5CF6');
      artGrad.addColorStop(0.52, '#6D28D9');
      artGrad.addColorStop(1, '#4C1D95');
      ctx.fillStyle = artGrad;
      ctx.fillRect(artX, artY, artW, artH);

      // Soft center spotlight behind portrait/emblem
      const spot = ctx.createRadialGradient(
        artX + artW / 2,
        artY + artH / 2 + 20,
        30,
        artX + artW / 2,
        artY + artH / 2 + 20,
        340,
      );
      spot.addColorStop(0, 'rgba(233, 213, 255, 0.45)');
      spot.addColorStop(1, 'rgba(109, 40, 217, 0)');
      ctx.fillStyle = spot;
      ctx.fillRect(artX, artY, artW, artH);

      // Floating collectible pattern sparks inside artwork window (HyperBuds equivalent of the reference's floating elements)
      const innerSparks: Array<[number, number, number, string, number]> = [
        [artX + 95, artY + 140, 26, '#FDE68A', 0.9],
        [artX + 670, artY + 150, 22, '#FDE68A', 0.85],
        [artX + 125, artY + 340, 18, '#FFFFFF', 0.65],
        [artX + 660, artY + 410, 28, '#FDE68A', 0.88],
        [artX + 95, artY + 560, 24, '#C4B5FD', 0.75],
        [artX + 630, artY + 585, 20, '#FFFFFF', 0.6],
        [artX + 215, artY + 200, 14, '#FFFFFF', 0.55],
        [artX + 560, artY + 230, 16, '#FDE68A', 0.7],
      ];
      for (const [sx, sy, sz, col, al] of innerSparks) {
        drawFourPointSpark(ctx, sx, sy, sz, col, al);
      }

      // Center Creator Portrait or Glowing White HyperBuds Emblem
      const centerX = artX + artW / 2;
      const centerY = artY + artH / 2 + 12;
      const avatarRadius = 175;

      // Glowing ring behind portrait
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarRadius + 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fill();

      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        const scale = Math.max((avatarRadius * 2) / avatarImg.width, (avatarRadius * 2) / avatarImg.height);
        const dw = avatarImg.width * scale;
        const dh = avatarImg.height * scale;
        ctx.drawImage(avatarImg, centerX - dw / 2, centerY - dh / 2, dw, dh);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
        const orbGrad = ctx.createLinearGradient(
          centerX - avatarRadius,
          centerY - avatarRadius,
          centerX + avatarRadius,
          centerY + avatarRadius,
        );
        orbGrad.addColorStop(0, '#2E1065');
        orbGrad.addColorStop(1, '#14151A');
        ctx.fillStyle = orbGrad;
        ctx.fill();

        if (whiteLogoLarge) {
          ctx.drawImage(whiteLogoLarge, centerX - 96, centerY - 96, 192, 192);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 110px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText((game.username || 'HB').slice(0, 2).toUpperCase(), centerX, centerY + 38);
          ctx.textAlign = 'left';
        }
      }

      // Crisp white portrait border
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Right-Edge Notched White HyperBuds Logo Badge (exact match to reference's right-side icon tab!)
      const badgeW = 104;
      const badgeH = 92;
      const badgeX = artX + artW - badgeW + 6;
      const badgeY = artY + 185;
      ctx.save();
      drawRoundedRectPath(ctx, badgeX - 10, badgeY - 10, badgeW + 20, badgeH + 20, 26);
      ctx.fillStyle = '#14151A';
      ctx.fill();
      drawRoundedRectPath(ctx, badgeX, badgeY, badgeW - 6, badgeH, 20);
      ctx.fillStyle = '#7C3AED';
      ctx.fill();
      if (whiteLogoLarge) {
        ctx.drawImage(whiteLogoLarge, badgeX + 18, badgeY + 16, 60, 60);
      }
      ctx.restore();

      // Top-Center Notched Rarity / Difficulty Trapezoid Tab (exact match to "Uncommon" tab!)
      const rarityLabel =
        game.completedRounds >= game.totalRounds
          ? 'Cleared'
          : game.difficulty === 'boss'
            ? 'Boss Mode'
            : game.difficulty === 'chill'
              ? 'Chill'
              : 'Hustle';
      drawTopNotchTrapezoid(ctx, artX + artW / 2, artY - 4, 420, 355, 92);
      ctx.fillStyle = '#14151A';
      ctx.fill();
      drawTopNotchTrapezoid(ctx, artX + artW / 2, artY - 4, 396, 336, 78);
      ctx.fillStyle = '#7C3AED';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rarityLabel, artX + artW / 2, artY + 48);

      // Bottom-Center Notched Reward Trapezoid Tab (exact match to "0.5 ETH" tab!)
      drawBottomNotchTrapezoid(ctx, artX + artW / 2, artY + artH + 4, 450, 385, 88);
      ctx.fillStyle = '#14151A';
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(`+${game.rewardCredits} CR · +${game.rewardRizzBoost} RIZZ`, artX + artW / 2, artY + artH - 26);
      ctx.textAlign = 'left';

      ctx.restore(); // end artwork clip

      // 4. Lower Obsidian Card Body (Title + White Logo Brand Row + Recessed Stats Box)
      const bodyX = cardX + 42;
      const titleY = artY + artH + 74;

      // Challenge Title (matches "HAPE #67")
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px system-ui, -apple-system, sans-serif';
      const displayTitle =
        game.title.length > 28 ? `${game.title.slice(0, 27).trim()}…` : game.title;
      ctx.fillText(displayTitle, bodyX, titleY);

      // White HyperBuds Logo + Brand / Handle Row (matches "H  HAPE PRIME")
      const brandY = titleY + 42;
      ctx.beginPath();
      ctx.arc(bodyX + 26, brandY + 8, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#7C3AED';
      ctx.fill();
      if (whiteLogoSmall) {
        ctx.drawImage(whiteLogoSmall, bodyX + 8, brandY - 10, 36, 36);
      }
      ctx.fillStyle = '#D4D4D8';
      ctx.font = '700 28px system-ui, -apple-system, sans-serif';
      const subBrand = game.username
        ? `HYPERBUDS · @${game.username.toUpperCase()}`
        : `HYPERBUDS · ${game.gameMode.replace(/_/g, ' ').toUpperCase()}`;
      ctx.fillText(subBrand.slice(0, 30), bodyX + 68, brandY + 18);

      // Recessed Dark Stats Pill Container (matches "Avg earnings | Distribution %" box!)
      const statsX = cardX + 32;
      const statsY = brandY + 62;
      const statsW = cardW - 64;
      const statsH = 225;

      drawRoundedRectPath(ctx, statsX, statsY, statsW, statsH, 32);
      ctx.fillStyle = '#1E2028';
      ctx.fill();

      // Left stat column: Progress / Hashtag
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('Rounds Cleared', statsX + 38, statsY + 72);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 44px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${game.completedRounds} / ${game.totalRounds}`, statsX + 38, statsY + 144);

      ctx.fillStyle = '#A78BFA';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${game.hashtag.replace(/^#/, '')}`, statsX + 38, statsY + 188);

      // Right stat column: Rizz & Credits split (matches green & purple glowing orb split!)
      const rightColX = statsX + statsW / 2 + 16;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('Rizz / Credits', rightColX, statsY + 72);

      // Green glowing dot
      ctx.save();
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(rightColX + 18, statsY + 130, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 40px system-ui, -apple-system, sans-serif';
      ctx.fillText(String(game.rewardRizzBoost), rightColX + 52, statsY + 143);

      // Vertical divider
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(rightColX + 126, statsY + 108, 2, 42);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(String(game.rewardCredits), rightColX + 148, statsY + 143);

      // Purple glowing dot
      ctx.save();
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(rightColX + 236, statsY + 130, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#8B5CF6';
      ctx.fill();
      ctx.restore();

      // Trending hashtag preview on right bottom
      const trendTag = game.trendingTags.find((t) => t !== game.hashtag) || 'LagosLife';
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`#${trendTag.replace(/^#/, '')}`, rightColX, statsY + 188);

      // 5. Bottom Canvas Footer CTA (on the purple backdrop)
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = '600 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('Play today’s challenge on HyperBuds', W / 2, cardY + cardH + 108);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('app.hyperbuds.cloud/challenges', W / 2, cardY + cardH + 156);
      ctx.textAlign = 'left';

      setDataUrl(canvas.toDataURL('image/png'));
    };

    void render();
    return () => {
      cancelled = true;
    };
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
    toast.success('Collectible Challenge Card saved! Ready for IG Stories, TikTok & WhatsApp Status.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Collectible Challenge Card
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
            <div className="mx-auto max-w-[235px] overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800">
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
