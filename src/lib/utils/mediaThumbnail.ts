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
  if (poster || !mediaUrl || mediaUrl.includes('#')) return mediaUrl;
  return `${mediaUrl}#t=0.5`;
}
