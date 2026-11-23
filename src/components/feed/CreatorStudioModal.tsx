'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  Globe,
  Hash,
  ImagePlus,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  Video,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createFeedPost,
  extractApiErrorMessage,
  FEED_MEDIA_ACCEPT_POST,
  FEED_MEDIA_ACCEPT_REEL,
  type FeedPostRecord,
  type FeedVisibility,
  formatFileSize,
  type UploadedFeedMedia,
  uploadFeedMediaToCloudinary,
} from '@/lib/api/feed.api';
import { streamingApi } from '@/lib/api/streaming.api';
import { MentionAutocomplete } from './MentionAutocomplete';
import type { Stream } from '@/types/streaming.types';

export type CreatorStudioMode = 'post' | 'reel' | 'livestream';

export interface CreatorStudioUserSummary {
  id?: string;
  displayName?: string;
  username?: string;
  avatar?: string;
}

export interface CreatorStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode: CreatorStudioMode;
  autoFocusUpload?: boolean;
  currentUser?: CreatorStudioUserSummary;
  onPostCreated?: (post: FeedPostRecord) => void;
  onReelCreated?: (reel: FeedPostRecord) => void;
  onStreamCreated?: (stream: Stream) => void;
}

const MODE_CONFIG: Record<
  CreatorStudioMode,
  {
    title: string;
    subtitle: string;
    steps: [string, string, string];
    badgeBg: string;
    badgeText: string;
    accentRing: string;
    submitLabel: string;
  }
> = {
  post: {
    title: 'Create Post',
    subtitle: 'Share an update, photo, or video with your creator feed.',
    steps: ['Write & Upload', 'Audience & Tags', 'Preview & Publish'],
    badgeBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    accentRing: 'ring-emerald-500/30',
    submitLabel: 'Publish Post',
  },
  reel: {
    title: 'Create Reel',
    subtitle: 'Upload a vertical 9:16 clip for your Reels feed.',
    steps: ['Upload Video', 'Caption & Tags', 'Preview & Publish'],
    badgeBg: 'bg-rose-500/15 dark:bg-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
    accentRing: 'ring-rose-500/30',
    submitLabel: 'Publish Reel',
  },
  livestream: {
    title: 'Set Up Live Stream',
    subtitle: 'Configure your broadcast details, timing, and safety controls.',
    steps: ['Stream Details', 'Schedule & Safety', 'Review & Launch'],
    badgeBg: 'bg-red-500/15 dark:bg-red-500/20',
    badgeText: 'text-red-600 dark:text-red-400',
    accentRing: 'ring-red-500/30',
    submitLabel: 'Launch Live Stream',
  },
};

const QUICK_TAGS_BY_MODE: Record<CreatorStudioMode, string[]> = {
  post: [
    'CreatorCollab',
    'BehindTheScenes',
    'StudioSetup',
    'GrowthTips',
    'DailyVibe',
    'CollabCall',
  ],
  reel: [
    'Reels',
    'CreatorDaily',
    'CollabClip',
    'EditingTips',
    'Highlight',
    'Tutorial',
  ],
  livestream: [
    'LiveQA',
    'CollabSession',
    'AMA',
    'FounderChat',
    'MusicSession',
    'WatchParty',
  ],
};

const VISIBILITY_OPTIONS: Array<{
  value: FeedVisibility;
  label: string;
  description: string;
  icon: typeof Globe;
}> = [
  {
    value: 'public',
    label: 'Public',
    description: 'Anyone on HyperBuds can discover and react to this.',
    icon: Globe,
  },
  {
    value: 'followers',
    label: 'Followers Only',
    description: 'Visible only to creators and supporters following you.',
    icon: Users,
  },
  {
    value: 'private',
    label: 'Only Me',
    description: 'Saved privately in your studio archive.',
    icon: Lock,
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'HB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getDefaultScheduleInputValue(): string {
  const dt = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
}

export function CreatorStudioModal({
  open,
  onOpenChange,
  initialMode,
  autoFocusUpload = false,
  currentUser,
  onPostCreated,
  onReelCreated,
  onStreamCreated,
}: CreatorStudioModalProps) {
  const fileInputId = useId();
  const captionInputId = useId();
  const streamTitleId = useId();
  const streamDescId = useId();
  const scheduleInputId = useId();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captionRef = useRef<HTMLTextAreaElement | null>(null);
  const streamTitleRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Shared Post / Reel state
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<FeedVisibility>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [externalPromoUrl, setExternalPromoUrl] = useState('');
  const [publishedPost, setPublishedPost] = useState<FeedPostRecord | null>(null);
  const [copiedShareKit, setCopiedShareKit] = useState<'caption' | 'link' | null>(null);

  // Cloudinary Upload state
  const [selectedFileMeta, setSelectedFileMeta] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedFeedMedia | null>(null);
  const [uploadedMediaList, setUploadedMediaList] = useState<UploadedFeedMedia[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Live Stream Setup state
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [timingMode, setTimingMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledAt, setScheduledAt] = useState(getDefaultScheduleInputValue);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [createdStream, setCreatedStream] = useState<Stream | null>(null);
  const [revealStreamKey, setRevealStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState<'ingest' | 'key' | null>(null);

  const modeMeta = MODE_CONFIG[initialMode];
  const quickTags = QUICK_TAGS_BY_MODE[initialMode];
  const creatorName =
    currentUser?.displayName || currentUser?.username || 'HyperBuds Creator';

  // Reset modal cleanly every time it opens
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError(null);
    setSubmitting(false);
    setCaption('');
    setVisibility('public');
    setTags([]);
    setCustomTagInput('');
    setExternalPromoUrl('');
    setPublishedPost(null);
    setCopiedShareKit(null);
    setSelectedFileMeta(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadedMedia(null);
    setUploadedMediaList([]);
    setIsDragging(false);
    setStreamTitle('');
    setStreamDescription('');
    setTimingMode('now');
    setScheduledAt(getDefaultScheduleInputValue());
    setChatEnabled(true);
    setRecordingEnabled(false);
    setRecordingConsent(false);
    setCreatedStream(null);
    setRevealStreamKey(false);
    setCopiedField(null);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (initialMode === 'livestream') {
        streamTitleRef.current?.focus();
      } else if (initialMode === 'post' && !autoFocusUpload) {
        captionRef.current?.focus();
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [open, initialMode, autoFocusUpload]);

  const canProceedStep1 = useMemo(() => {
    if (uploading) return false;
    if (initialMode === 'post') {
      return caption.trim().length > 0 || uploadedMedia !== null || uploadedMediaList.length > 0;
    }
    if (initialMode === 'reel') {
      return uploadedMedia !== null && uploadedMedia.type === 'video';
    }
    return streamTitle.trim().length >= 3;
  }, [uploading, initialMode, caption, uploadedMedia, streamTitle]);

  const canProceedStep2 = useMemo(() => {
    if (initialMode !== 'livestream') return true;
    if (timingMode === 'scheduled' && !scheduledAt.trim()) return false;
    if (recordingEnabled && !recordingConsent) return false;
    return true;
  }, [initialMode, timingMode, scheduledAt, recordingEnabled, recordingConsent]);

  const handleToggleTag = (rawTag: string) => {
    const clean = rawTag.replace(/^#/, '').trim();
    if (!clean) return;
    setTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === clean.toLowerCase());
      if (exists) {
        return prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      }
      if (prev.length >= 10) return prev;
      return [...prev, clean];
    });
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.replace(/^#/, '').trim();
    if (!clean) return;
    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase()) && tags.length < 10) {
      setTags((prev) => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    const isMultiPost = initialMode === 'post';
    const remainingSlots = isMultiPost ? Math.max(0, 10 - uploadedMediaList.length) : 1;
    const batch = isMultiPost ? files.slice(0, remainingSlots) : [files[0]];
    if (batch.length === 0) {
      setError('You can attach up to 10 photos/videos per post.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    try {
      const newlyUploaded: UploadedFeedMedia[] = [];
      for (let i = 0; i < batch.length; i += 1) {
        const file = batch[i];
        setSelectedFileMeta({ name: file.name, size: file.size });
        const uploaded = await uploadFeedMediaToCloudinary(file, {
          kind: initialMode === 'reel' ? 'reel' : 'post',
          onProgress: (pct) => {
            const overall = Math.round(((i + pct / 100) / batch.length) * 100);
            setUploadProgress(overall);
          },
        });
        newlyUploaded.push(uploaded);
      }

      if (isMultiPost) {
        setUploadedMediaList((prev) => {
          const next = [...prev, ...newlyUploaded].slice(0, 10);
          setUploadedMedia(next[0] ?? null);
          return next;
        });
      } else {
        setUploadedMedia(newlyUploaded[0] ?? null);
        setUploadedMediaList(newlyUploaded.slice(0, 1));
      }
      setUploadProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not upload media. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    await handleUploadFiles(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length === 0) return;
    await handleUploadFiles(files);
  };

  const handleRemoveMedia = (index?: number) => {
    if (typeof index === 'number') {
      setUploadedMediaList((prev) => {
        const next = prev.filter((_, i) => i !== index);
        setUploadedMedia(next[0] ?? null);
        return next;
      });
      setError(null);
      return;
    }
    setUploadedMedia(null);
    setUploadedMediaList([]);
    setSelectedFileMeta(null);
    setUploadProgress(0);
    setError(null);
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (uploading) {
        setError('Please wait for your media upload to finish.');
        return;
      }
      if (initialMode === 'post' && !caption.trim() && !uploadedMedia) {
        setError('Write a quick caption or upload a photo/video to continue.');
        return;
      }
      if (initialMode === 'reel' && (!uploadedMedia || uploadedMedia.type !== 'video')) {
        setError('Please upload a vertical video file first.');
        return;
      }
      if (initialMode === 'livestream' && streamTitle.trim().length < 3) {
        setError('Enter a stream title (at least 3 characters) to continue.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (initialMode === 'livestream') {
        if (timingMode === 'scheduled' && !scheduledAt.trim()) {
          setError('Choose a date and time for your scheduled stream.');
          return;
        }
        if (recordingEnabled && !recordingConsent) {
          setError(
            'Recording consent is required whenever stream recording is enabled.'
          );
          return;
        }
      }
      setStep(3);
    }
  };

  const handlePublish = async () => {
    if (submitting || uploading) return;
    setError(null);
    setSubmitting(true);

    try {
      if (initialMode === 'post' || initialMode === 'reel') {
        const mediaItems =
          uploadedMediaList.length > 0
            ? uploadedMediaList
            : uploadedMedia
              ? [uploadedMedia]
              : [];
        const post = await createFeedPost({
          kind: initialMode,
          body: caption.trim(),
          media: mediaItems.map((m) => ({
            type: m.type,
            url: m.url,
            publicId: m.publicId,
            aspectRatio: m.aspectRatio ?? (initialMode === 'reel' ? '9:16' : undefined),
            durationSeconds: m.durationSeconds,
          })),
          tags,
          visibility,
          externalPromoUrl: externalPromoUrl.trim() || undefined,
        });

        if (initialMode === 'reel') {
          onReelCreated?.(post);
        } else {
          onPostCreated?.(post);
        }
        setPublishedPost(post);
        return;
      }

      // Live Stream setup submission
      const { stream: created } = await streamingApi.createStream({
        title: streamTitle.trim(),
        description: streamDescription.trim() || undefined,
        scheduledAt:
          timingMode === 'scheduled' && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
        tags: tags.length > 0 ? tags : undefined,
        thumbnailUrl: uploadedMedia?.url || undefined,
        category: tags[0] || 'Live',
        chatEnabled,
        recordingEnabled,
        recordingConsent: recordingEnabled ? recordingConsent : false,
      });

      const createdId = created?._id || (created as unknown as { id?: string })?.id;
      let finalStream: Stream = createdId ? { ...created, _id: createdId } : created;
      if (timingMode === 'now' && createdId) {
        const started = await streamingApi.startStream(createdId);
        if (started.stream) {
          const startedId = started.stream._id || (started.stream as unknown as { id?: string }).id || createdId;
          finalStream = { ...started.stream, _id: startedId };
        }
      }

      setCreatedStream(finalStream);
      onStreamCreated?.(finalStream);
    } catch (err) {
      setError(
        extractApiErrorMessage(
          err,
          initialMode === 'livestream'
            ? 'Failed to set up live stream. Please try again.'
            : `Failed to publish ${initialMode}. Please try again.`
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = async (field: 'ingest' | 'key', value?: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Clipboard write optional in headless contexts
    }
  };

  const renderModeIcon = () => {
    if (initialMode === 'livestream') {
      return <Radio className="h-5 w-5" />;
    }
    if (initialMode === 'reel') {
      return <Film className="h-5 w-5" />;
    }
    return <ImagePlus className="h-5 w-5" />;
  };

  const renderCloudinaryUploadPanel = () => {
    const isReel = initialMode === 'reel';
    const accept = isReel ? FEED_MEDIA_ACCEPT_REEL : FEED_MEDIA_ACCEPT_POST;

    return (
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          id={fileInputId}
          data-testid="creator-media-input"
          type="file"
          multiple={initialMode === 'post'}
          accept={accept}
          onChange={handleFileInputChange}
          className="sr-only"
        />

        {!uploadedMedia && !uploading && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-950/30'
                : autoFocusUpload
                  ? 'border-emerald-400 bg-emerald-50/40 dark:border-emerald-500/60 dark:bg-emerald-950/20'
                  : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-slate-600'
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
              {isReel ? (
                <Video className="h-6 w-6 text-rose-500" />
              ) : (
                <UploadCloud className="h-6 w-6 text-emerald-500" />
              )}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              {isReel
                ? 'Upload vertical video'
                : 'Drag & drop photo or video to upload'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {isReel
                ? '9:16 portrait recommended · MP4, WebM, MOV up to 100 MB'
                : 'JPG, PNG, WebP, GIF (15 MB) or MP4, WebM, MOV (100 MB)'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <UploadCloud className="h-4 w-4" />
                {isReel ? 'Choose Video File' : 'Choose Photo or Video'}
              </button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-600 dark:text-indigo-400" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    Uploading media...
                  </p>
                  {selectedFileMeta && (
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedFileMeta.name} ({formatFileSize(selectedFileMeta.size)})
                    </p>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/50">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-200 dark:bg-indigo-400"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {uploadedMedia && !uploading && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/5 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {uploadedMediaList.length > 1
                    ? `${uploadedMediaList.length} photos/videos ready (Carousel)`
                    : 'Media uploaded'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {initialMode === 'post' && uploadedMediaList.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                  >
                    <Plus className="h-3 w-3" />
                    Add More ({uploadedMediaList.length}/10)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia()}
                  aria-label="Remove uploaded media"
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>
            </div>

            {uploadedMediaList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                {uploadedMediaList.map((item, idx) => (
                  <div key={`${item.url}-${idx}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
                    {item.type === 'video' ? (
                      <video src={item.url} className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      aria-label={`Remove media ${idx + 1}`}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center bg-slate-900/95 p-3">
              {uploadedMedia.type === 'video' ? (
                <video
                  src={uploadedMedia.url}
                  controls
                  playsInline
                  className={
                    isReel
                      ? 'aspect-[9/16] max-h-64 rounded-xl bg-black object-cover'
                      : 'max-h-64 w-full rounded-xl bg-black object-contain'
                  }
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadedMedia.url}
                  alt={selectedFileMeta?.name || 'Uploaded post preview'}
                  className="max-h-64 w-auto rounded-xl object-contain"
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTagsSection = () => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          Topics & Hashtags ({tags.length}/10)
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickTags.map((tag) => {
          const active = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggleTag(tag)}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customTagInput}
          onChange={(e) => setCustomTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomTag();
            }
          }}
          placeholder="Add a custom tag (e.g. Podcasting)"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
        />
        <button
          type="button"
          onClick={handleAddCustomTag}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleToggleTag(tag)}
                aria-label={`Remove ${tag}`}
                className="rounded-full p-0.5 hover:bg-indigo-200/60 dark:hover:bg-indigo-800/60"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {(initialMode === 'post' || initialMode === 'reel') && (
        <div className="mt-3 space-y-1.5 rounded-xl border border-purple-200/70 bg-purple-50/40 p-3 dark:border-purple-900/50 dark:bg-purple-950/20">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-purple-900 dark:text-purple-200">
            <ExternalLink className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Promote External Post (Optional — Cross-Platform Growth)
          </label>
          <input
            type="url"
            value={externalPromoUrl}
            onChange={(e) => setExternalPromoUrl(e.target.value)}
            placeholder="https://youtube.com/... or TikTok / Instagram / X / Twitch link"
            className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-purple-800 dark:bg-slate-900 dark:text-white"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Adds a clean native button (e.g. &ldquo;Watch on YouTube ↗&rdquo;) below your post to send HyperBuds viewers straight to your other platforms.
          </p>
        </div>
      )}
    </div>
  );

  const renderVisibilitySection = () => (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        Who can see this?
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {VISIBILITY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = visibility === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVisibility(opt.value)}
              aria-pressed={selected}
              className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                selected
                  ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900 dark:border-white dark:bg-white/10 dark:ring-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                {selected && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {opt.label}
              </span>
              <span className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPostBody = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {currentUser?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.avatar}
                alt={creatorName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">
                {getInitials(creatorName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {creatorName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sharing to {visibility}
              </p>
            </div>
          </div>

          <div className="relative">
            <label htmlFor={captionInputId} className="sr-only">
              Post caption
            </label>
            <textarea
              ref={captionRef}
              id={captionInputId}
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={`What's on your mind, ${creatorName.split(' ')[0]}? Tip: type @ to tag creators, @groups, or @followers`}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-white dark:focus:bg-slate-900"
            />
            <MentionAutocomplete text={caption} onSelect={setCaption} />
          </div>

          {renderCloudinaryUploadPanel()}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          {renderVisibilitySection()}
          {renderTagsSection()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {currentUser?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatar}
                  alt={creatorName}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">
                  {getInitials(creatorName)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {creatorName}
                </p>
                <p className="text-[11px] capitalize text-slate-500 dark:text-slate-400">
                  Just now · {visibility}
                </p>
              </div>
            </div>
            {uploadedMedia && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Media Ready
              </span>
            )}
          </div>

          {caption.trim() && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {caption.trim()}
            </p>
          )}

          {uploadedMedia && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
              {uploadedMedia.type === 'video' ? (
                <video
                  src={uploadedMedia.url}
                  controls
                  playsInline
                  className="max-h-60 w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadedMedia.url}
                  alt="Post preview"
                  className="max-h-60 w-full object-contain"
                />
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReelBody = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          {renderCloudinaryUploadPanel()}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <label
              htmlFor={captionInputId}
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Reel Caption
            </label>
            <textarea
              id={captionInputId}
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a hook, story, or collab shoutout for this Reel..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-white dark:focus:bg-slate-900"
            />
          </div>
          {renderTagsSection()}
          {renderVisibilitySection()}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-[9/16] w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-black shadow-lg">
          {uploadedMedia && (
            <video
              src={uploadedMedia.url}
              controls
              playsInline
              className="h-full w-full object-cover"
            />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
            <p className="text-xs font-semibold">@{currentUser?.username || 'creator'}</p>
            {caption.trim() && (
              <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-200">
                {caption.trim()}
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Ready to publish to Reels
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Storage</dt>
              <dd className="font-medium text-slate-900 dark:text-white">HD Video</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Aspect</dt>
              <dd className="font-medium text-slate-900 dark:text-white">
                {uploadedMedia?.aspectRatio || '9:16'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500 dark:text-slate-400">Audience</dt>
              <dd className="font-medium capitalize text-slate-900 dark:text-white">
                {visibility}
              </dd>
            </div>
          </dl>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLiveStreamBody = () => {
    if (createdStream) {
      const ingestValue = createdStream.ingestUrl || 'rtmp://localhost/live';
      const streamKeyValue = createdStream.streamKey || '';
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {createdStream.title}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                      createdStream.status === 'live'
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    {createdStream.status === 'live' && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    )}
                    {createdStream.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {createdStream.status === 'live'
                    ? 'Your broadcast room is active. Open the Live Studio or paste the RTMP credentials into OBS.'
                    : 'Your stream is scheduled and ready in your Studio.'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Encoder Credentials
              </span>
              <button
                type="button"
                onClick={() => setRevealStreamKey((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {revealStreamKey ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
                {revealStreamKey ? 'Hide credentials' : 'Reveal credentials'}
              </button>
            </div>

            <dl className="mt-3 space-y-2.5 text-xs">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Ingest URL</dt>
                <dd className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200">
                  <span className="max-w-[220px] truncate">
                    {revealStreamKey ? ingestValue : 'rtmp://••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText('ingest', ingestValue)}
                    aria-label="Copy ingest URL"
                    className="rounded border border-slate-200 p-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {copiedField === 'ingest' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </dd>
              </div>

              {streamKeyValue && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Stream Key</dt>
                  <dd className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200">
                    <span className="max-w-[220px] truncate">
                      {revealStreamKey ? streamKeyValue : '••••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText('key', streamKeyValue)}
                      aria-label="Copy stream key"
                      className="rounded border border-slate-200 p-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {copiedField === 'key' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/streaming"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Manage Streams
            </Link>
            <Link
              href={
                createdStream._id || (createdStream as unknown as { id?: string }).id
                  ? `/streaming/room/${createdStream._id || (createdStream as unknown as { id?: string }).id}`
                  : '/streaming'
              }
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Open Live Studio
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={streamTitleId}
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Stream Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={streamTitleRef}
              id={streamTitleId}
              type="text"
              maxLength={120}
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="e.g. Late Night Creator Collab Q&A"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor={streamDescId}
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Topic & Description
            </label>
            <textarea
              id={streamDescId}
              rows={3}
              value={streamDescription}
              onChange={(e) => setStreamDescription(e.target.value)}
              placeholder="Tell viewers what you will cover or who is co-hosting..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Stream Thumbnail (Optional)
            </p>
            {renderCloudinaryUploadPanel()}
          </div>

          {renderTagsSection()}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              When do you want to broadcast?
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setTimingMode('now')}
                aria-pressed={timingMode === 'now'}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  timingMode === 'now'
                    ? 'border-red-500 bg-red-50/60 ring-1 ring-red-500 dark:bg-red-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <Radio className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Go Live Now
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Start your live room immediately and generate your stream key.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTimingMode('scheduled')}
                aria-pressed={timingMode === 'scheduled'}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  timingMode === 'scheduled'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500 dark:bg-indigo-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Schedule for Later
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Reserve a time slot so followers can set reminders.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {timingMode === 'scheduled' && (
            <div>
              <label
                htmlFor={scheduleInputId}
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Scheduled Date & Time
              </label>
              <input
                id={scheduleInputId}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              />
            </div>
          )}

          <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/40">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                Enable audience live chat
              </span>
              <input
                type="checkbox"
                checked={chatEnabled}
                onChange={(e) => setChatEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                Save cloud recording for replays
              </span>
              <input
                type="checkbox"
                checked={recordingEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRecordingEnabled(checked);
                  if (!checked) setRecordingConsent(false);
                }}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
            </label>

            {recordingEnabled && (
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={recordingConsent}
                  onChange={(e) => setRecordingConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-400"
                />
                <span>
                  I confirm all co-hosts and participants have granted consent to record this broadcast.
                </span>
              </label>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Broadcast Summary
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
              {streamTitle.trim()}
            </h3>
          </div>
          <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
            {timingMode === 'now' ? 'Going Live Immediately' : 'Scheduled Stream'}
          </span>
        </div>

        {streamDescription.trim() && (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {streamDescription.trim()}
          </p>
        )}

        <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900">
            <dt className="text-slate-500 dark:text-slate-400">Live Chat</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
              {chatEnabled ? 'Enabled' : 'Disabled'}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-2.5 dark:bg-slate-900">
            <dt className="text-slate-500 dark:text-slate-400">Recording</dt>
            <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
              {recordingEnabled ? 'Enabled (Consent Verified)' : 'Off'}
            </dd>
          </div>
          {timingMode === 'scheduled' && scheduledAt && (
            <div className="rounded-xl bg-white p-2.5 sm:col-span-2 dark:bg-slate-900">
              <dt className="text-slate-500 dark:text-slate-400">Scheduled Start</dt>
              <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                {new Date(scheduledAt).toLocaleString()}
              </dd>
            </div>
          )}
        </dl>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFinalCtaLabel = () => {
    if (submitting) {
      if (initialMode === 'livestream') {
        return timingMode === 'now' ? 'Starting stream...' : 'Scheduling stream...';
      }
      return initialMode === 'reel' ? 'Publishing reel...' : 'Publishing post...';
    }
    if (initialMode === 'livestream') {
      return timingMode === 'now' ? 'Start Live Stream' : 'Schedule Live Stream';
    }
    return modeMeta.submitLabel;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="creator-studio-modal"
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3 pr-8">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${modeMeta.badgeBg} ${modeMeta.badgeText} ${modeMeta.accentRing}`}
            >
              {renderModeIcon()}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
                {modeMeta.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {modeMeta.subtitle}
              </DialogDescription>
            </div>
          </div>

          {/* 3-Step Horizontal Stepper */}
          {!createdStream && (
            <nav
              aria-label="Creation steps"
              className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-800/80"
            >
              {modeMeta.steps.map((label, idx) => {
                const stepNum = (idx + 1) as 1 | 2 | 3;
                const isActive = step === stepNum;
                const isCompleted = step > stepNum;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={stepNum > step}
                    onClick={() => {
                      if (stepNum < step) {
                        setError(null);
                        setStep(stepNum);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                        : isCompleted
                          ? 'text-emerald-700 hover:bg-white/60 dark:text-emerald-400 dark:hover:bg-slate-900/50'
                          : 'cursor-default text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-300/70 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="h-2.5 w-2.5" /> : stepNum}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="py-1">
          {publishedPost ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Published to HyperBuds! Boost your reach everywhere:
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      Use this One-Tap Cross-Post Kit to share your caption, #hashtags, and HyperBuds link across your other platforms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    const tagStr = (publishedPost.tags ?? []).map((t) => `#${t.replace(/^#/, '')}`).join(' ');
                    const fullText = [publishedPost.body, tagStr].filter(Boolean).join('\n\n');
                    void navigator.clipboard?.writeText(fullText);
                    setCopiedShareKit('caption');
                    setTimeout(() => setCopiedShareKit(null), 1800);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {copiedShareKit === 'caption' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-purple-600" />}
                  {copiedShareKit === 'caption' ? 'Copied Caption & Tags!' : 'Copy Caption + #Hashtags'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const postUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.hyperbuds.cloud'}/post/${encodeURIComponent(publishedPost._id)}`;
                    void navigator.clipboard?.writeText(postUrl);
                    setCopiedShareKit('link');
                    setTimeout(() => setCopiedShareKit(null), 1800);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {copiedShareKit === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <ExternalLink className="h-4 w-4 text-purple-600" />}
                  {copiedShareKit === 'link' ? 'Copied Post Link!' : 'Copy HyperBuds Link'}
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `${(publishedPost.body || 'Check out my new post on HyperBuds!').slice(0, 200)}`,
                  )}&url=${encodeURIComponent(`https://app.hyperbuds.cloud/post/${publishedPost._id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  Share to X (Twitter) ↗
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `${(publishedPost.body || 'Check out my new post on HyperBuds!').slice(0, 160)} https://app.hyperbuds.cloud/post/${publishedPost._id}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Share to WhatsApp ↗
                </a>
              </div>
            </div>
          ) : (
            <>
              {initialMode === 'post' && renderPostBody()}
              {initialMode === 'reel' && renderReelBody()}
              {initialMode === 'livestream' && renderLiveStreamBody()}
            </>
          )}
        </div>

        <DialogFooter className="mt-2 flex-row items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {createdStream || publishedPost ? (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              Done
            </button>
          ) : (
            <>
              <div>
                {step > 1 ? (
                  <button
                    type="button"
                    data-testid="creator-step-back"
                    disabled={submitting}
                    onClick={() => {
                      setError(null);
                      setStep((prev) => (prev === 3 ? 2 : 1));
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {step < 3 ? (
                  <button
                    type="button"
                    data-testid="creator-step-next"
                    disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Continue
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="creator-submit-btn"
                    disabled={submitting || uploading}
                    onClick={handlePublish}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      initialMode === 'livestream'
                        ? 'bg-red-600 hover:bg-red-700'
                        : initialMode === 'reel'
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                    }`}
                  >
                    {submitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {renderFinalCtaLabel()}
                  </button>
                )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreatorStudioModal;
