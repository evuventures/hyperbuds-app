/**
 * Resolves a poster/thumbnail URL for video & reel posts.
 * If no explicit thumbnailUrl is set and the media lives on Cloudinary,
 * automatically derives a first-second JPEG frame (`so_1,f_jpg,q_auto`).
 */
export function deriveVideoPoster(
  mediaUrl?: string | null,
  explicitThumbnail?: string | null,
): string | undefined {
  if (typeof explicitThumbnail === 'string' && explicitThumbnail.trim()) {
    return explicitThumbnail.trim();
  }
  const clean = (mediaUrl || '').trim();
  if (!clean) return undefined;
  if (/\/video\/upload\//i.test(clean)) {
    const [base, query] = clean.split('?');
    const withTransform = base.replace(/\/video\/upload\//i, '/video/upload/so_1,f_jpg,q_auto/');
    const jpgBase = /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(withTransform)
      ? withTransform.replace(/\.(mp4|webm|mov|m4v|mkv|avi)$/i, '.jpg')
      : `${withTransform}.jpg`;
    return query ? `${jpgBase}?${query}` : jpgBase;
  }
  return undefined;
}

/**
 * Appends `#t=0.5` when a video has no poster URL so browsers eagerly paint
 * an initial video frame instead of a blank black rectangle.
 */
export function withVideoPreviewFragment(mediaUrl: string, poster?: string): string {
  const safeUrl = deriveChromeSafeVideoUrl(mediaUrl);
  if (poster || !safeUrl || safeUrl.includes('#')) return safeUrl;
  return `${safeUrl}#t=0.5`;
}

/**
 * Ensures Cloudinary videos (especially iPhone HEVC .mov uploads) are delivered
 * as H.264/AAC MP4 so Chrome on Android/Windows and Safari on iOS all play cleanly.
 */
export function deriveChromeSafeVideoUrl(mediaUrl: string): string {
  const clean = (mediaUrl || '').trim();
  if (!clean) return '';
  if (/\/video\/upload\//i.test(clean) && !/\/video\/upload\/[^/]*f_mp4/i.test(clean)) {
    const [base, query] = clean.split('?');
    const transformed = base.replace(
      /\/video\/upload\//i,
      '/video/upload/f_mp4,vc_h264,ac_aac,q_auto/',
    );
    const mp4Base = /\.(mov|mkv|avi|m4v|webm)$/i.test(transformed)
      ? transformed.replace(/\.(mov|mkv|avi|m4v|webm)$/i, '.mp4')
      : transformed;
    return query ? `${mp4Base}?${query}` : mp4Base;
  }
  return clean;
}
