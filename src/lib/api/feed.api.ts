import axios from 'axios';
import { apiClient } from './client';

export type FeedPostKind = 'post' | 'reel';
export type FeedVisibility = 'public' | 'followers' | 'private';

export interface UploadedFeedMedia {
  type: 'image' | 'video';
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  aspectRatio?: string;
}

export interface FeedPostMediaInput {
  type: 'image' | 'video';
  url: string;
  publicId?: string;
  aspectRatio?: string;
  durationSeconds?: number;
}

export interface FeedPromoLink {
  platform: string;
  url: string;
  label: string;
  clicksCount: number;
}

export interface CreateFeedPostRequest {
  kind: FeedPostKind;
  body: string;
  media?: FeedPostMediaInput[];
  tags?: string[];
  visibility?: FeedVisibility;
  externalPromoUrl?: string;
}

export interface FeedAuthor {
  id?: string;
  _id?: string;
  displayName?: string;
  username?: string;
  avatar?: string;
  niche?: string;
}

export interface FeedPostRecord {
  _id: string;
  kind: FeedPostKind;
  body: string;
  media: FeedPostMediaInput[];
  tags: string[];
  visibility: FeedVisibility;
  likes: string[];
  comments: Array<{
    _id: string;
    userId: string;
    text: string;
    createdAt: string;
    author?: FeedAuthor;
  }>;
  bookmarks: string[];
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  promoLink?: FeedPromoLink | null;
  createdAt: string;
  author?: FeedAuthor;
  authorId?: string | FeedAuthor;
}

export const FEED_IMAGE_MAX_BYTES = 15 * 1024 * 1024;
export const FEED_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const ALLOWED_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-m4v',
]);

export const FEED_MEDIA_ACCEPT_POST =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/x-m4v';
export const FEED_MEDIA_ACCEPT_REEL =
  'video/mp4,video/webm,video/quicktime,video/x-m4v';

export function validateFeedMediaFile(
  file: File,
  options?: { kind?: FeedPostKind }
): { valid: boolean; mediaKind?: 'image' | 'video'; error?: string } {
  const kind = options?.kind ?? 'post';
  const mime = (file.type || '').toLowerCase();

  const isImage = ALLOWED_IMAGE_MIME_TYPES.has(mime);
  const isVideo = ALLOWED_VIDEO_MIME_TYPES.has(mime);

  if (kind === 'reel') {
    if (!isVideo) {
      return {
        valid: false,
        error: 'Reels require a vertical video file (MP4, WebM, MOV, or M4V).',
      };
    }
    if (file.size > FEED_VIDEO_MAX_BYTES) {
      return {
        valid: false,
        error: 'Reel videos must be 100 MB or smaller.',
      };
    }
    return { valid: true, mediaKind: 'video' };
  }

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: 'Please choose an image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV).',
    };
  }

  if (isImage && file.size > FEED_IMAGE_MAX_BYTES) {
    return {
      valid: false,
      error: 'Images must be 15 MB or smaller.',
    };
  }

  if (isVideo && file.size > FEED_VIDEO_MAX_BYTES) {
    return {
      valid: false,
      error: 'Videos must be 100 MB or smaller.',
    };
  }

  return { valid: true, mediaKind: isImage ? 'image' : 'video' };
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export async function uploadStudioMediaToCloudinary(
  file: File,
  kind: 'podcast' | 'recording',
  onProgress?: (percent: number) => void,
): Promise<UploadedFeedMedia & { sizeMb?: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);

  const response = await apiClient.post<{ media: UploadedFeedMedia & { sizeMb?: number } }>(
    '/feed/upload-media',
    formData,
    {
      timeout: 180000,
      onUploadProgress: (progressEvent) => {
        if (!onProgress || !progressEvent.total) return;
        onProgress(Math.min(100, Math.round((progressEvent.loaded * 100) / progressEvent.total)));
      },
    },
  );
  if (!response.data?.media?.url) {
    throw new Error('Media upload succeeded without returning a URL.');
  }
  return response.data.media;
}

export async function uploadFeedMediaToCloudinary(
  file: File,
  options?: {
    kind?: FeedPostKind;
    onProgress?: (percent: number) => void;
  }
): Promise<UploadedFeedMedia> {
  const kind = options?.kind ?? 'post';
  const validation = validateFeedMediaFile(file, { kind });
  if (!validation.valid) {
    throw new Error(validation.error || 'Unsupported media file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('kind', kind);

  try {
    const response = await apiClient.post<{ media: UploadedFeedMedia }>(
      '/feed/upload-media',
      formData,
      {
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (!options?.onProgress || !progressEvent.total) return;
          const percent = Math.min(
            99,
            Math.max(1, Math.round((progressEvent.loaded * 100) / progressEvent.total))
          );
          options.onProgress(percent);
        },
      }
    );

    if (!response.data?.media?.url) {
      throw new Error('Media upload completed without a URL.');
    }

    options?.onProgress?.(100);
    return response.data.media;
  } catch (err) {
    throw new Error(
      extractApiErrorMessage(err, 'Failed to upload media. Please try again.')
    );
  }
}

export async function createFeedPost(
  payload: CreateFeedPostRequest
): Promise<FeedPostRecord> {
  try {
    const response = await apiClient.post<{ post: Partial<FeedPostRecord> & { id?: string } }>(
      '/feed/posts',
      payload
    );
    const raw = response.data?.post;
    const postId = raw?._id || raw?.id;
    if (!postId) {
      throw new Error('Post was created without an identifier.');
    }
    return {
      _id: postId,
      kind: raw.kind ?? payload.kind,
      body: raw.body ?? payload.body,
      media: Array.isArray(raw.media) ? raw.media : payload.media ?? [],
      tags: Array.isArray(raw.tags) ? raw.tags : payload.tags ?? [],
      visibility: raw.visibility ?? payload.visibility ?? 'public',
      likes: Array.isArray(raw.likes) ? raw.likes : [],
      comments: Array.isArray(raw.comments) ? raw.comments : [],
      bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks : [],
      likesCount: typeof raw.likesCount === 'number' ? raw.likesCount : 0,
      commentsCount: typeof raw.commentsCount === 'number' ? raw.commentsCount : 0,
      bookmarksCount: typeof raw.bookmarksCount === 'number' ? raw.bookmarksCount : 0,
      isLiked: raw.isLiked,
      isBookmarked: raw.isBookmarked,
      promoLink: raw.promoLink ?? null,
      createdAt: raw.createdAt ?? new Date().toISOString(),
      author: raw.author,
      authorId: raw.authorId,
    };
  } catch (err) {
    throw new Error(extractApiErrorMessage(err, 'Failed to publish post. Please try again.'));
  }
}
