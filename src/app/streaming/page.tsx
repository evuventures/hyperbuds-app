'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { streamingApi } from '@/lib/api/streaming.api';
import {
  formatFileSize,
  uploadFeedMediaToCloudinary,
} from '@/lib/api/feed.api';
import {
  formatCompactMetric,
  resolveStreamThumbnail,
  STREAM_FALLBACK_THUMBNAILS,
  StreamCard,
  type ReusableStreamItem,
} from '@/components/streaming/StreamCard';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  Bell,
  BellRing,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Flame,
  Headphones,
  Heart,
  ImagePlus,
  Loader2,
  Mic,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat,
  Search,
  Share2,
  Shield,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  Users,
  X,
} from 'lucide-react';

type StreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

interface MediaQuota {
  tier: string;
  tierName: string;
  maxStreamDurationMinutes: number;
  maxHosts: number;
  maxResolution: string;
  storageLimitMb: number;
  usedStorageMb: number;
  remainingStorageMb: number;
}

interface PodcastEpisodeItem {
  _id: string;
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  status: string;
  recordingConsent: boolean;
  maxDurationMinutes: number;
  storageMb: number;
  thumbnailUrl?: string | null;
  audioUrl?: string | null;
  category?: string;
  durationSeconds?: number | null;
  playsCount?: number;
  likesCount?: number;
  isLiked?: boolean;
  author?: {
    _id?: string;
    id?: string;
    displayName?: string;
    username?: string;
    avatar?: string;
    followersCount?: number;
  };
  tracks?: Array<{ label?: string; speakerName?: string; url?: string; storageMb?: number }>;
  transcript?: string | { text?: string } | null;
  highlights?: Array<{ title?: string; label?: string; startSeconds?: number; startSec?: number; endSeconds?: number; endSec?: number }>;
}

const STREAM_CATEGORIES = [
  'Live',
  'Animation',
  'Gaming',
  'Music',
  'Creator Talk',
  'Tech & AI',
  'Design',
  'Q&A',
];

const PODCAST_CATEGORIES = [
  'Creator Talk',
  'Dance Beat',
  'Electro Pop',
  'Tech & AI',
  'Storytelling',
  'Lo-fi & Chill',
];

const PODCAST_FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1614613535768-56854d5e5f1b?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=700&q=80',
];

const WAVEFORM_BARS = [
  24, 42, 68, 52, 85, 96, 60, 44, 78, 92, 65, 38, 72, 88, 54, 46, 80, 94, 62, 48, 76, 58, 40, 66,
  84, 50, 36, 62, 44, 28,
];

function formatDurationClock(seconds = 200): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

function resolvePodcastCover(ep: PodcastEpisodeItem, index = 0): string {
  if (typeof ep.thumbnailUrl === 'string' && ep.thumbnailUrl.trim()) {
    return ep.thumbnailUrl.trim();
  }
  return PODCAST_FALLBACK_COVERS[index % PODCAST_FALLBACK_COVERS.length];
}

export default function StreamingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = String((user as { _id?: string; id?: string } | null)?._id ?? (user as { id?: string } | null)?.id ?? '');

  // Mode & Data
  const [studioMode, setStudioMode] = useState<'live' | 'podcast'>('live');
  const [myStreams, setMyStreams] = useState<ReusableStreamItem[]>([]);
  const [discoverStreams, setDiscoverStreams] = useState<ReusableStreamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState<MediaQuota | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisodeItem[]>([]);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Studio UI state
  const [statusFilter, setStatusFilter] = useState<'all' | StreamStatus>('all');
  const [sortBy, setSortBy] = useState<'today' | 'popular' | 'live'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [busyStreamId, setBusyStreamId] = useState<string | null>(null);
  const [showHostConsole, setShowHostConsole] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');
  const [modUserId, setModUserId] = useState('');

  // Stream Create / Edit Thumbnail Modal
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDesc, setStreamDesc] = useState('');
  const [streamCategory, setStreamCategory] = useState('Live');
  const [streamThumbnailUrl, setStreamThumbnailUrl] = useState('');
  const [streamScheduledAt, setStreamScheduledAt] = useState('');
  const [streamTagsInput, setStreamTagsInput] = useState('');
  const [streamChatEnabled, setStreamChatEnabled] = useState(true);
  const [streamRecordingEnabled, setStreamRecordingEnabled] = useState(false);
  const [streamRecordingConsent, setStreamRecordingConsent] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [streamSubmitting, setStreamSubmitting] = useState(false);

  // Podcast Create Modal & Player State
  const [podcastModalOpen, setPodcastModalOpen] = useState(false);
  const [epTitle, setEpTitle] = useState('');
  const [epCategory, setEpCategory] = useState('Creator Talk');
  const [epThumbnailUrl, setEpThumbnailUrl] = useState('');
  const [epAudioUrl, setEpAudioUrl] = useState('');
  const [epDurationMin, setEpDurationMin] = useState(30);
  const [epConsent, setEpConsent] = useState(false);
  const [epCoverUploading, setEpCoverUploading] = useState(false);
  const [epSubmitting, setEpSubmitting] = useState(false);
  const [epBusyId, setEpBusyId] = useState<string | null>(null);
  const [selectedPlaylistCat, setSelectedPlaylistCat] = useState<string | null>(null);

  // Dark-Purple Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgressSec, setPlayProgressSec] = useState(80);
  const [repeatOn, setRepeatOn] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mineRes, discoverRes, quotaRes, episodesRes] = await Promise.all([
        apiClient.get('/streaming/streams').catch(() => null),
        streamingApi.discoverStreams().catch(() => null),
        apiClient.get('/streaming/quotas').catch(() => null),
        apiClient.get('/podcasts/episodes').catch(() => null),
      ]);

      const mineList: ReusableStreamItem[] = Array.isArray(mineRes?.data?.streams)
        ? mineRes.data.streams
        : [];
      const discList: ReusableStreamItem[] = Array.isArray(discoverRes?.streams)
        ? discoverRes.streams
        : [];

      setMyStreams(mineList);
      setDiscoverStreams(discList);

      const mergedIds = [...discList, ...mineList];
      setSelectedId((prev) => prev ?? mergedIds[0]?._id ?? null);

      if (quotaRes?.data?.quota) setQuota(quotaRes.data.quota);
      if (Array.isArray(episodesRes?.data?.episodes)) {
        const eps: PodcastEpisodeItem[] = episodesRes.data.episodes;
        setEpisodes(eps);
        setActiveEpisodeId((prev) => prev ?? eps[0]?._id ?? null);
      }
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to load Streaming & Podcast Studio.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Merge user's own streams (with streamKey) and community discover streams without duplicates
  const allStreams = useMemo(() => {
    const map = new Map<string, ReusableStreamItem>();
    for (const s of discoverStreams) {
      const id = String(s._id || s.id || '');
      if (id) map.set(id, { ...s, _id: id });
    }
    for (const s of myStreams) {
      const id = String(s._id || s.id || '');
      if (!id) continue;
      const prev = map.get(id);
      map.set(id, {
        ...(prev ?? {}),
        ...s,
        _id: id,
      });
    }
    return Array.from(map.values());
  }, [discoverStreams, myStreams]);

  const filteredStreams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = allStreams.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (q) {
        const hay = `${s.title} ${s.description ?? ''} ${s.category ?? ''} ${s.host?.displayName ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'popular') {
      list = [...list].sort(
        (a, b) =>
          (Number(b.viewsCount ?? 0) + Number(b.likesCount ?? 0) * 3 + Number(b.subscribersCount ?? 0) * 5) -
          (Number(a.viewsCount ?? 0) + Number(a.likesCount ?? 0) * 3 + Number(a.subscribersCount ?? 0) * 5),
      );
    } else if (sortBy === 'live') {
      list = [...list].sort((a, b) => {
        const rank = (st: string) => (st === 'live' ? 0 : st === 'scheduled' ? 1 : 2);
        return rank(a.status) - rank(b.status);
      });
    }
    return list;
  }, [allStreams, statusFilter, searchQuery, sortBy]);

  const heroStreams = useMemo(
    () => (filteredStreams.length > 0 ? filteredStreams : allStreams).slice(0, 6),
    [filteredStreams, allStreams],
  );

  const featuredStream = heroStreams[heroIndex % Math.max(1, heroStreams.length)] ?? null;

  const leftUpcomingStreams = useMemo(
    () => filteredStreams.slice(0, 4),
    [filteredStreams],
  );

  const subscribedOrRecentStreams = useMemo(() => {
    const subs = allStreams.filter((s) => s.isSubscribed);
    return (subs.length > 0 ? subs : allStreams).slice(0, 4);
  }, [allStreams]);

  const selectedStream = useMemo(
    () => allStreams.find((s) => s._id === selectedId) ?? myStreams[0] ?? allStreams[0] ?? null,
    [allStreams, myStreams, selectedId],
  );

  const isSelectedOwner = Boolean(
    selectedStream &&
      (selectedStream.userId === currentUserId ||
        myStreams.some((m) => String(m._id || m.id) === selectedStream._id)),
  );

  // Optimistically update a stream across both state arrays
  const patchStreamLocal = useCallback(
    (streamId: string, updater: (cur: ReusableStreamItem) => ReusableStreamItem) => {
      setMyStreams((prev) => prev.map((s) => (String(s._id || s.id) === streamId ? updater(s) : s)));
      setDiscoverStreams((prev) => prev.map((s) => (String(s._id || s.id) === streamId ? updater(s) : s)));
    },
    [],
  );

  const handleWatchStream = async (stream: ReusableStreamItem) => {
    const id = String(stream._id || stream.id || '');
    if (!id) return;
    const isOwner = stream.userId === currentUserId || myStreams.some((m) => String(m._id || m.id) === id);
    try {
      const viewRes = await streamingApi.recordView(id).catch(() => null);
      if (viewRes?.viewsCount !== undefined) {
        patchStreamLocal(id, (cur) => ({ ...cur, viewsCount: viewRes.viewsCount }));
      }
      if (stream.status !== 'live' && isOwner) {
        const started = await streamingApi.startStream(id).catch(() => null);
        if (started?.stream) {
          patchStreamLocal(id, (cur) => ({ ...cur, ...started.stream, status: 'live' }));
        }
      }
    } finally {
      router.push(`/streaming/room/${id}`);
    }
  };

  const handleLikeStream = async (stream: ReusableStreamItem) => {
    const id = String(stream._id || stream.id || '');
    if (!id) return;
    try {
      const res = await streamingApi.toggleLike(id);
      patchStreamLocal(id, (cur) => ({
        ...cur,
        isLiked: res.liked,
        likesCount: res.likesCount,
      }));
    } catch {
      setBanner({ type: 'error', text: 'Could not update stream like.' });
    }
  };

  const handleSubscribeStream = async (stream: ReusableStreamItem) => {
    const id = String(stream._id || stream.id || '');
    if (!id) return;
    try {
      const res = await streamingApi.toggleSubscribe(id);
      patchStreamLocal(id, (cur) => ({
        ...cur,
        isSubscribed: res.subscribed,
        subscribersCount: res.subscribersCount,
      }));
      setBanner({
        type: 'success',
        text: res.subscribed
          ? `Subscribed to "${stream.title}" — you'll be notified whenever it goes live!`
          : `Unsubscribed from "${stream.title}".`,
      });
    } catch {
      setBanner({ type: 'error', text: 'Could not update stream subscription.' });
    }
  };

  const handleShareStream = async (stream: ReusableStreamItem) => {
    const id = String(stream._id || stream.id || '');
    if (!id) return;
    const url =
      typeof window !== 'undefined' ? `${window.location.origin}/streaming/room/${id}` : `/streaming/room/${id}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: stream.title,
          text: `Watch "${stream.title}" live on HyperBuds!`,
          url,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      const res = await streamingApi.recordShare(id).catch(() => null);
      if (res?.sharesCount !== undefined) {
        patchStreamLocal(id, (cur) => ({ ...cur, sharesCount: res.sharesCount }));
      }
      setBanner({ type: 'success', text: 'Stream link copied & share recorded!' });
    } catch {
      // User cancelled native share or clipboard unavailable
    }
  };

  const handleLifecycleAction = async (streamId: string, action: 'start' | 'end' | 'cancel') => {
    setBanner(null);
    setBusyStreamId(`${action}-${streamId}`);
    try {
      const response = await apiClient.put(`/streaming/streams/${streamId}/${action}`);
      const updated: ReusableStreamItem | undefined = response.data?.stream;
      if (updated) {
        patchStreamLocal(streamId, (cur) => ({ ...cur, ...updated }));
      } else {
        await loadData();
      }
      setBanner({
        type: 'success',
        text:
          action === 'start'
            ? 'Stream is LIVE! All stream subscribers have been notified.'
            : action === 'end'
              ? 'Stream ended. You can reuse this card anytime with "Go Live Again".'
              : 'Stream cancelled.',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : `Unable to ${action} stream.`,
      });
    } finally {
      setBusyStreamId(null);
    }
  };

  const openCreateStreamModal = () => {
    setEditingStreamId(null);
    setStreamTitle('');
    setStreamDesc('');
    setStreamCategory('Live');
    setStreamThumbnailUrl('');
    setStreamScheduledAt('');
    setStreamTagsInput('');
    setStreamChatEnabled(true);
    setStreamRecordingEnabled(false);
    setStreamRecordingConsent(false);
    setStreamModalOpen(true);
  };

  const openEditThumbnailModal = (stream: ReusableStreamItem) => {
    setEditingStreamId(stream._id);
    setStreamTitle(stream.title || '');
    setStreamDesc(stream.description || '');
    setStreamCategory(stream.category || 'Live');
    setStreamThumbnailUrl(stream.thumbnailUrl || '');
    setStreamTagsInput(Array.isArray(stream.tags) ? stream.tags.join(', ') : '');
    setStreamModalOpen(true);
  };

  const handleUploadStreamThumbnail = async (file: File) => {
    setThumbUploading(true);
    try {
      const uploaded = await uploadFeedMediaToCloudinary(file, { kind: 'post' });
      setStreamThumbnailUrl(uploaded.url);
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload stream thumbnail.',
      });
    } finally {
      setThumbUploading(false);
    }
  };

  const handleSaveStreamModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamTitle.trim()) {
      setBanner({ type: 'error', text: 'Stream title is required.' });
      return;
    }
    if (!editingStreamId && streamRecordingEnabled && !streamRecordingConsent) {
      setBanner({ type: 'error', text: 'Confirm recording consent before enabling recording.' });
      return;
    }

    setStreamSubmitting(true);
    try {
      const tags = streamTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingStreamId) {
        const res = await streamingApi.updateStream(editingStreamId, {
          title: streamTitle.trim(),
          description: streamDesc.trim() || undefined,
          category: streamCategory,
          thumbnailUrl: streamThumbnailUrl.trim() || undefined,
          tags: tags.length > 0 ? tags : [streamCategory],
        });
        if (res.stream) {
          patchStreamLocal(editingStreamId, (cur) => ({ ...cur, ...res.stream }));
        }
        setBanner({ type: 'success', text: 'Stream card & thumbnail updated!' });
      } else {
        const res = await streamingApi.createStream({
          title: streamTitle.trim(),
          description: streamDesc.trim() || undefined,
          category: streamCategory,
          thumbnailUrl: streamThumbnailUrl.trim() || undefined,
          scheduledAt: streamScheduledAt ? new Date(streamScheduledAt).toISOString() : undefined,
          tags: tags.length > 0 ? tags : [streamCategory],
          chatEnabled: streamChatEnabled,
          recordingEnabled: streamRecordingEnabled,
          recordingConsent: streamRecordingEnabled ? streamRecordingConsent : false,
        });
        if (res.stream) {
          const s = res.stream as ReusableStreamItem;
          setMyStreams((prev) => [s, ...prev]);
          setDiscoverStreams((prev) => [s, ...prev]);
          setSelectedId(s._id);
        }
        setBanner({ type: 'success', text: 'Stream card created with custom thumbnail!' });
      }
      setStreamModalOpen(false);
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to save stream.',
      });
    } finally {
      setStreamSubmitting(false);
    }
  };

  // Podcast Playback Controls
  const filteredEpisodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return episodes.filter((ep) => {
      if (selectedPlaylistCat && (ep.category || 'Creator Talk') !== selectedPlaylistCat) {
        return false;
      }
      if (q) {
        const hay = `${ep.title} ${ep.category ?? ''} ${ep.author?.displayName ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [episodes, selectedPlaylistCat, searchQuery]);

  const activeEpisode = useMemo(
    () => episodes.find((e) => e._id === activeEpisodeId) ?? episodes[0] ?? null,
    [episodes, activeEpisodeId],
  );

  const activeDuration = Math.max(30, Number(activeEpisode?.durationSeconds ?? 210));

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setPlayProgressSec((prev) => {
        if (prev + 1 >= activeDuration) {
          if (repeatOn) return 0;
          setIsPlaying(false);
          return activeDuration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, activeDuration, repeatOn]);

  const handleTogglePlayEpisode = async (ep: PodcastEpisodeItem) => {
    const isSame = activeEpisodeId === ep._id;
    if (isSame) {
      const next = !isPlaying;
      setIsPlaying(next);
      if (audioRef.current && ep.audioUrl) {
        if (next) void audioRef.current.play().catch(() => {});
        else audioRef.current.pause();
      }
      return;
    }

    setActiveEpisodeId(ep._id);
    setPlayProgressSec(0);
    setIsPlaying(true);

    if (audioRef.current) {
      if (ep.audioUrl) {
        audioRef.current.src = ep.audioUrl;
        void audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    const res = await apiClient.post(`/podcasts/episodes/${ep._id}/play`).catch(() => null);
    if (res?.data?.playsCount !== undefined) {
      setEpisodes((prev) =>
        prev.map((item) => (item._id === ep._id ? { ...item, playsCount: res.data.playsCount } : item)),
      );
    }
  };

  const handleStepEpisode = (dir: -1 | 1) => {
    if (episodes.length === 0) return;
    const curIdx = episodes.findIndex((e) => e._id === activeEpisodeId);
    const nextIdx = shuffleOn
      ? Math.floor(Math.random() * episodes.length)
      : (Math.max(0, curIdx) + dir + episodes.length) % episodes.length;
    void handleTogglePlayEpisode(episodes[nextIdx]);
  };

  const podcastPlaylists = useMemo(() => {
    return PODCAST_CATEGORIES.slice(0, 4).map((cat, idx) => {
      const count = episodes.filter((e) => (e.category || 'Creator Talk') === cat).length;
      return {
        category: cat,
        title: cat,
        count,
        cover: PODCAST_FALLBACK_COVERS[idx % PODCAST_FALLBACK_COVERS.length],
      };
    });
  }, [episodes]);

  const topPodcasters = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; avatar: string; plays: number; followers: number }
    >();
    for (const ep of episodes) {
      const uid = ep.author?.id || ep.userId || ep._id;
      const name = ep.author?.displayName || ep.author?.username || 'HyperBuds Creator';
      const existing = map.get(uid);
      if (existing) {
        existing.plays += Number(ep.playsCount ?? 0);
      } else {
        map.set(uid, {
          id: uid,
          name,
          avatar: ep.author?.avatar || PODCAST_FALLBACK_COVERS[map.size % PODCAST_FALLBACK_COVERS.length],
          plays: Number(ep.playsCount ?? 0),
          followers: Number(ep.author?.followersCount ?? 0),
        });
      }
    }
    return Array.from(map.values()).slice(0, 4);
  }, [episodes]);

  const handleUploadEpisodeCover = async (file: File) => {
    setEpCoverUploading(true);
    try {
      const uploaded = await uploadFeedMediaToCloudinary(file, { kind: 'post' });
      setEpThumbnailUrl(uploaded.url);
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload episode cover.',
      });
    } finally {
      setEpCoverUploading(false);
    }
  };

  const handleCreatePodcastEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epTitle.trim()) {
      setBanner({ type: 'error', text: 'Episode title is required.' });
      return;
    }
    if (!epConsent) {
      setBanner({ type: 'error', text: 'Confirm recording consent to publish an episode.' });
      return;
    }
    setEpSubmitting(true);
    try {
      const created = await apiClient.post('/podcasts/episodes', {
        title: epTitle.trim(),
        recordingConsent: epConsent,
        maxDurationMinutes: Number(epDurationMin) || 30,
        storageMb: 40,
      });
      const newId = created.data?.episode?.id || created.data?.episode?._id;
      if (newId) {
        await apiClient
          .put(`/podcasts/episodes/${newId}/metadata`, {
            thumbnailUrl: epThumbnailUrl.trim() || undefined,
            audioUrl: epAudioUrl.trim() || undefined,
            category: epCategory,
            durationSeconds: Math.min(3600, Math.max(60, Number(epDurationMin) * 60)),
          })
          .catch(() => {});
      }
      setEpTitle('');
      setEpThumbnailUrl('');
      setEpAudioUrl('');
      setEpConsent(false);
      setPodcastModalOpen(false);
      setBanner({ type: 'success', text: 'Podcast episode published to Studio!' });
      await loadData();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to create episode.',
      });
    } finally {
      setEpSubmitting(false);
    }
  };

  const handleCopy = async (label: string, value?: string) => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setBanner({ type: 'error', text: 'Clipboard access was denied.' });
    }
  };

  return (
    <DashboardLayout>
      <div
        className={`min-h-full transition-colors duration-300 ${
          studioMode === 'live'
            ? 'bg-gradient-to-br from-[#240B48] via-[#15072C] to-[#0A0318] text-white'
            : 'bg-[#F8F7FC] text-slate-900 dark:bg-slate-950 dark:text-white'
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-4 py-5 pb-24 sm:px-6 lg:px-8">
          {/* Unified Studio Top Navigation Bar */}
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex rounded-full p-1 text-xs font-semibold ${
                  studioMode === 'live'
                    ? 'border border-white/15 bg-white/10 backdrop-blur-md'
                    : 'border border-purple-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setStudioMode('live')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${
                    studioMode === 'live'
                      ? 'bg-white text-slate-950 shadow'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 text-red-500" />
                  Live Streams
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode('podcast')}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${
                    studioMode === 'podcast'
                      ? 'bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] text-white shadow'
                      : studioMode === 'live'
                        ? 'text-white/80 hover:text-white'
                        : 'text-slate-600'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Podcasts
                </button>
              </div>

              {studioMode === 'live' && (
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'live', 'scheduled', 'ended'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                        statusFilter === tab
                          ? 'bg-white text-slate-950 shadow'
                          : 'border border-white/15 bg-white/10 text-white/80 hover:bg-white/20'
                      }`}
                    >
                      {tab === 'ended' ? 'Replays' : tab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className={`relative flex items-center rounded-full px-3.5 py-2 text-xs ${
                  studioMode === 'live'
                    ? 'border border-white/15 bg-white/10 text-white backdrop-blur-md'
                    : 'border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white'
                }`}
              >
                <Search className="mr-2 h-3.5 w-3.5 opacity-60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type here to search..."
                  className="w-44 bg-transparent text-xs outline-none placeholder:text-current placeholder:opacity-55 sm:w-56"
                />
              </div>

              {studioMode === 'live' ? (
                <>
                  {selectedStream && (
                    <button
                      type="button"
                      onClick={() => setShowHostConsole((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Studio Keys
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openCreateStreamModal}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-lg transition hover:scale-[1.02]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Stream
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPodcastModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:opacity-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Episode
                </button>
              )}
            </div>
          </div>

          {banner && (
            <div
              role="status"
              className={`mb-5 flex items-center justify-between rounded-2xl border px-4 py-3 text-xs font-medium backdrop-blur-md ${
                banner.type === 'error'
                  ? 'border-rose-400/40 bg-rose-500/15 text-rose-100'
                  : studioMode === 'live'
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="ml-4 font-bold underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ================================================================
              VIEW 1: CINEMATIC LIVE STREAMING HUB (Matches media_1795210598819_1bb18c77.jpg)
             ================================================================ */}
          {studioMode === 'live' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* LEFT COLUMN: 2 Stacked Glass Panels (New/Live + Continue Watching / Subscribed) */}
                <aside className="flex flex-col gap-5 lg:col-span-3">
                  {/* Top Glass Panel: 🔥 Live & Upcoming */}
                  <section className="rounded-[26px] border border-purple-300/20 bg-purple-500/[0.08] p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-3.5 flex items-center justify-between gap-2">
                      <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-white">
                        <Flame className="h-4 w-4 text-purple-300" />
                        Live & Upcoming
                      </h2>
                      <button
                        type="button"
                        onClick={() =>
                          setSortBy((prev) =>
                            prev === 'today' ? 'popular' : prev === 'popular' ? 'live' : 'today',
                          )
                        }
                        className="text-[11px] font-medium text-purple-200/75 transition hover:text-white"
                      >
                        Sort by:{' '}
                        <span className="font-bold text-white capitalize">{sortBy} ↑↓</span>
                      </button>
                    </div>

                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-28 animate-pulse rounded-2xl bg-purple-400/15" />
                        ))}
                      </div>
                    ) : leftUpcomingStreams.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-purple-300/25 p-5 text-center text-xs text-purple-100/75">
                        No streams yet. Click <span className="font-bold text-white">+ New Stream</span>{' '}
                        with a custom thumbnail!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leftUpcomingStreams.slice(0, 3).map((stream, idx) => (
                          <div
                            key={stream._id}
                            onClick={() => setSelectedId(stream._id)}
                            className="group relative h-28 w-full cursor-pointer overflow-hidden rounded-2xl border border-purple-300/20"
                          >
                            <img
                              src={resolveStreamThumbnail(stream, idx)}
                              alt={stream.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D041C]/95 via-[#180832]/40 to-transparent" />
                            <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-white">
                                  {stream.title}
                                </p>
                                <p className="text-[10px] text-purple-200/80">
                                  {stream.status === 'live'
                                    ? `🔴 Live · ${formatCompactMetric(stream.viewsCount)} views`
                                    : `${stream.category || 'Stream'} · ${formatCompactMetric(stream.subscribersCount)} subs`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleWatchStream(stream);
                                }}
                                aria-label={`Play ${stream.title}`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-300/35 bg-purple-500/30 text-white backdrop-blur-md transition hover:scale-110 hover:bg-white hover:text-[#240B48]"
                              >
                                <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Bottom Glass Panel: Subscribed & Continue Watching */}
                  <section className="flex-1 rounded-[26px] border border-purple-300/20 bg-purple-500/[0.08] p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-extrabold text-white">
                        Subscribed & Watching
                      </h2>
                      <span className="text-[11px] text-purple-300 font-semibold">
                        Live Alerts
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {subscribedOrRecentStreams.map((stream, idx) => (
                        <div
                          key={`sub-${stream._id}`}
                          onClick={() => setSelectedId(stream._id)}
                          className="flex cursor-pointer items-center justify-between gap-2.5 rounded-2xl border border-purple-300/15 bg-purple-500/[0.08] p-2 transition hover:bg-purple-500/[0.18]"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <img
                              src={resolveStreamThumbnail(stream, idx + 2)}
                              alt={stream.title}
                              className="h-11 w-11 shrink-0 rounded-xl object-cover"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-white">
                                {stream.title}
                              </p>
                              <p className="truncate text-[10px] text-purple-200/75">
                                {stream.host?.displayName || 'Creator'} ·{' '}
                                {stream.isSubscribed ? '🔔 Subscribed' : `${formatCompactMetric(stream.viewsCount)} views`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleWatchStream(stream);
                            }}
                            aria-label={`Watch ${stream.title}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-purple-300/30 bg-purple-500/25 text-white transition hover:bg-white hover:text-[#240B48]"
                          >
                            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                      ))}
                      {subscribedOrRecentStreams.length === 0 && (
                        <p className="py-4 text-center text-xs text-purple-200/65">
                          Subscribe to any stream card to get instant alerts when it goes live.
                        </p>
                      )}
                    </div>
                  </section>
                </aside>

                {/* RIGHT COLUMN: Featured Hero Banner + 3-Column Spacious Reusable StreamCards Grid */}
                <main className="flex flex-col gap-5 lg:col-span-9">
                  {/* Featured Hero Banner */}
                  <section className="relative min-h-[300px] overflow-hidden rounded-[28px] border border-purple-300/25 shadow-[0_24px_60px_rgba(20,6,42,0.75)] sm:min-h-[340px]">
                    <img
                      src={
                        featuredStream
                          ? resolveStreamThumbnail(featuredStream, heroIndex)
                          : STREAM_FALLBACK_THUMBNAILS[0]
                      }
                      alt={featuredStream?.title || 'HyperBuds Live Studio'}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#110424]/95 via-[#1C0938]/65 to-[#240B48]/25" />
                    <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between p-6 sm:min-h-[340px] sm:p-8">
                      {/* Top badge */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300/35 bg-[#1B0836]/75 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                          {featuredStream?.status === 'live' ? (
                            <>
                              <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                              Live Now
                            </>
                          ) : (
                            <>
                              <Flame className="h-3.5 w-3.5 text-purple-300" />
                              Now Trending
                            </>
                          )}
                        </span>

                        {quota && (
                          <span className="hidden rounded-full border border-purple-300/25 bg-[#1B0836]/70 px-3 py-1 text-[11px] font-medium text-purple-100 backdrop-blur-md sm:inline-flex">
                            {quota.tierName} · Up to {quota.maxHosts} hosts · {quota.maxResolution}
                          </span>
                        )}
                      </div>

                      {/* Main Title, Category Pills, and Action Row */}
                      <div className="max-w-2xl">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-purple-300/35 bg-purple-500/25 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                            {featuredStream?.category || 'Live Studio'}
                          </span>
                          {featuredStream?.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-purple-300/25 bg-purple-500/15 px-3 py-1 text-[11px] font-medium text-purple-100 backdrop-blur-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
                          {featuredStream?.title || 'Create Your First Live Stream Card'}
                        </h1>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-purple-100/85 sm:text-sm">
                          {featuredStream?.description ||
                            'Upload a custom stream thumbnail, go live with dual cameras or OBS, and notify every stream subscriber automatically whenever you broadcast again.'}
                        </p>

                        {/* Hero Action Buttons + Carousel Arrows */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {featuredStream ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleWatchStream(featuredStream)}
                                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#240B48] shadow-xl transition hover:scale-[1.03]"
                                >
                                  <Play className="h-3.5 w-3.5 fill-[#240B48]" />
                                  Watch
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleSubscribeStream(featuredStream)}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-bold backdrop-blur-md transition ${
                                    featuredStream.isSubscribed
                                      ? 'border-purple-300/70 bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] text-white shadow-lg'
                                      : 'border-purple-300/35 bg-purple-500/20 text-white hover:bg-purple-500/35'
                                  }`}
                                >
                                  {featuredStream.isSubscribed ? (
                                    <>
                                      <BellRing className="h-3.5 w-3.5 text-white" />
                                      Subscribed ({formatCompactMetric(featuredStream.subscribersCount)})
                                    </>
                                  ) : (
                                    <>
                                      <Bell className="h-3.5 w-3.5" />
                                      Subscribe ({formatCompactMetric(featuredStream.subscribersCount)})
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleShareStream(featuredStream)}
                                  aria-label="Share featured stream"
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-300/35 bg-purple-500/20 text-white backdrop-blur-md transition hover:bg-purple-500/35"
                                >
                                  <Share2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={openCreateStreamModal}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#240B48] shadow-xl"
                              >
                                <Plus className="h-4 w-4" />
                                Set Up First Stream
                              </button>
                            )}
                          </div>

                          {heroStreams.length > 1 && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setHeroIndex((i) => (i - 1 + heroStreams.length) % heroStreams.length)
                                }
                                aria-label="Previous featured stream"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-300/30 bg-[#1B0836]/70 text-white backdrop-blur-md transition hover:bg-purple-500/30"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setHeroIndex((i) => (i + 1) % heroStreams.length)}
                                aria-label="Next featured stream"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-300/30 bg-[#1B0836]/70 text-white backdrop-blur-md transition hover:bg-purple-500/30"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 3-Column Spacious Reusable Portrait Stream Cards Grid */}
                  <section>
                    {loading ? (
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="min-h-[440px] animate-pulse rounded-[28px] bg-purple-400/15"
                          />
                        ))}
                      </div>
                    ) : filteredStreams.length === 0 ? (
                      <div className="rounded-[28px] border border-purple-300/20 bg-purple-500/[0.08] p-12 text-center backdrop-blur-md">
                        <p className="text-sm font-bold text-white">No stream cards match this filter</p>
                        <p className="mt-1 text-xs text-purple-200/75">
                          Create a reusable stream card with a custom thumbnail to start growing subscribers.
                        </p>
                        <button
                          type="button"
                          onClick={openCreateStreamModal}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] px-5 py-2 text-xs font-bold text-white shadow-lg"
                        >
                          <Plus className="h-4 w-4" />
                          Create Stream Card
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredStreams.map((stream, idx) => {
                          const isOwner =
                            stream.userId === currentUserId ||
                            myStreams.some((m) => String(m._id || m.id) === stream._id);
                          return (
                            <StreamCard
                              key={stream._id}
                              stream={stream}
                              index={idx}
                              isSelected={selectedStream?._id === stream._id}
                              isOwner={isOwner}
                              busyAction={busyStreamId}
                              onSelect={(s) => setSelectedId(s._id)}
                              onWatch={(s) => void handleWatchStream(s)}
                              onLike={(s) => void handleLikeStream(s)}
                              onSubscribe={(s) => void handleSubscribeStream(s)}
                              onShare={(s) => void handleShareStream(s)}
                              onGoLiveAgain={(s) => void handleLifecycleAction(s._id, 'start')}
                              onEditThumbnail={openEditThumbnailModal}
                            />
                          );
                        })}
                      </div>
                    )}
                  </section>

                  {/* Collapsible Host Studio Keys & Chat Moderation Drawer */}
                  {showHostConsole && selectedStream && (
                    <section className="rounded-[24px] border border-white/15 bg-black/45 p-5 backdrop-blur-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            Studio Broadcast Console — {selectedStream.title}
                          </h3>
                          <p className="text-xs text-white/65">
                            RTMP ingest credentials, lifecycle controls, and live chat moderation
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isSelectedOwner && selectedStream.status !== 'live' && (
                            <button
                              type="button"
                              onClick={() => void handleLifecycleAction(selectedStream._id, 'start')}
                              className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white"
                            >
                              <Radio className="h-3.5 w-3.5" />
                              Go Live & Notify Subscribers
                            </button>
                          )}
                          {isSelectedOwner && selectedStream.status === 'live' && (
                            <button
                              type="button"
                              onClick={() => void handleLifecycleAction(selectedStream._id, 'end')}
                              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white"
                            >
                              <Square className="h-3.5 w-3.5" />
                              End Stream
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowHostConsole(false)}
                            className="rounded-full p-1 text-white/70 hover:bg-white/10"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs">
                        <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white/80">RTMP & Stream Key</span>
                            <button
                              type="button"
                              onClick={() => setRevealKey((v) => !v)}
                              className="inline-flex items-center gap-1 text-white/70 hover:text-white"
                            >
                              {revealKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              {revealKey ? 'Hide' : 'Reveal'}
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2 font-mono text-white/90">
                            <span className="truncate">{selectedStream.ingestUrl || 'rtmp://ingest.hyperbuds.cloud/live'}</span>
                            <button
                              type="button"
                              onClick={() => void handleCopy('ingest', selectedStream.ingestUrl)}
                              className="rounded border border-white/15 p-1 hover:bg-white/10"
                            >
                              {copiedField === 'ingest' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          {selectedStream.streamKey && (
                            <div className="flex items-center justify-between gap-2 font-mono text-white/90">
                              <span className="truncate">
                                {revealKey ? selectedStream.streamKey : '••••••••••••••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => void handleCopy('key', selectedStream.streamKey)}
                                className="rounded border border-white/15 p-1 hover:bg-white/10"
                              >
                                {copiedField === 'key' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                          <span className="flex items-center gap-1.5 font-semibold text-white/80">
                            <Shield className="h-3.5 w-3.5 text-purple-300" />
                            Chat & Moderation Controls
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={modUserId}
                              onChange={(e) => setModUserId(e.target.value)}
                              placeholder="User ID to mute"
                              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                if (!modUserId.trim()) return;
                                await apiClient.post(`/streaming/streams/${selectedStream._id}/moderate-chat`, {
                                  action: 'mute',
                                  targetUserId: modUserId.trim(),
                                });
                                setBanner({ type: 'success', text: `Muted ${modUserId.trim()}.` });
                              }}
                              className="rounded-xl border border-white/20 px-3 py-1.5 font-semibold hover:bg-white/10"
                            >
                              Mute
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatText}
                              onChange={(e) => setChatText(e.target.value)}
                              placeholder="Post host announcement..."
                              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-2.5 py-1.5 text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                if (!chatText.trim()) return;
                                await apiClient.post(`/streaming/streams/${selectedStream._id}/chat`, {
                                  text: chatText.trim(),
                                });
                                setChatText('');
                                setBanner({ type: 'success', text: 'Announcement posted.' });
                              }}
                              className="rounded-xl bg-purple-600 px-3.5 py-1.5 font-bold text-white"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </main>
              </div>
            </div>
          )}

          {/* ================================================================
              VIEW 2: VIBRANT PURPLE PODCAST HUB (Matches media_1795211072119_d6b10c32.jpg)
             ================================================================ */}
          {studioMode === 'podcast' && (
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
              <audio ref={audioRef} className="hidden" />

              {/* LEFT MAIN COLUMN (8 cols) */}
              <div className="space-y-7 lg:col-span-8">
                {/* Vibrant Purple Hero Banner */}
                <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#8B3DFF] via-[#9D50FF] to-[#B774FF] p-6 text-white shadow-[0_20px_50px_rgba(139,61,255,0.28)] sm:p-8">
                  <div className="relative z-10 max-w-md">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-100/90">
                      HyperBuds Studio
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                      Listen to trending podcasts all the time
                    </h1>
                    <p className="mt-2.5 text-xs leading-relaxed text-purple-100/90 sm:text-sm">
                      Stream creator interviews, multi-track sessions, AI transcripts, and highlight clips anywhere, anytime.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (episodes[0]) void handleTogglePlayEpisode(episodes[0]);
                          else setPodcastModalOpen(true);
                        }}
                        className="rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#7B2CBF] shadow-lg transition hover:scale-[1.03]"
                      >
                        Explore Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setPodcastModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        Record Episode
                      </button>
                    </div>
                  </div>

                  {/* Right-side creator with headphones accent */}
                  <div className="pointer-events-none absolute -right-4 bottom-0 hidden h-full w-64 items-end justify-end sm:flex">
                    <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                      <Headphones className="h-28 w-28 text-white/90 drop-shadow-xl" />
                    </div>
                  </div>
                </section>

                {/* Playlist / Series Row */}
                <section>
                  <div className="mb-3.5 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Playlist
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedPlaylistCat(null)}
                      className="text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
                    >
                      {selectedPlaylistCat ? 'Show All' : 'See More'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {podcastPlaylists.map((pl) => {
                      const active = selectedPlaylistCat === pl.category;
                      return (
                        <div
                          key={pl.category}
                          onClick={() =>
                            setSelectedPlaylistCat((cur) => (cur === pl.category ? null : pl.category))
                          }
                          className={`group relative aspect-square cursor-pointer overflow-hidden rounded-[22px] border transition ${
                            active
                              ? 'border-purple-500 ring-2 ring-purple-500/40'
                              : 'border-purple-200/60 dark:border-slate-800'
                          }`}
                        >
                          <img
                            src={pl.cover}
                            alt={pl.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2A0948]/95 via-[#8B3DFF]/20 to-transparent" />
                          <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 rounded-2xl bg-black/35 px-3 py-2 text-white backdrop-blur-md">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">{pl.title}</p>
                              <p className="text-[10px] text-purple-200">🎵 {pl.count} Tracks</p>
                            </div>
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#7B2CBF] shadow">
                              <Play className="ml-0.5 h-3 w-3 fill-current" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Trending Episodes List */}
                <section>
                  <div className="mb-3.5 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Trending
                    </h2>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {filteredEpisodes.length} episode(s)
                    </span>
                  </div>

                  {filteredEpisodes.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-purple-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        No podcast episodes yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Create your first episode with cover art and AI transcription.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPodcastModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#8B3DFF] px-5 py-2 text-xs font-bold text-white"
                      >
                        <Plus className="h-4 w-4" />
                        New Episode
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredEpisodes.map((ep, idx) => {
                        const isEpActive = activeEpisode?._id === ep._id;
                        const epPlaying = isEpActive && isPlaying;
                        const isOwner = ep.userId === currentUserId;
                        const transcriptText =
                          typeof ep.transcript === 'string'
                            ? ep.transcript
                            : ep.transcript?.text || '';

                        return (
                          <div
                            key={ep._id}
                            className={`rounded-2xl border p-3 transition ${
                              isEpActive
                                ? 'border-purple-300 bg-purple-50/70 dark:border-purple-800 dark:bg-purple-950/30'
                                : 'border-slate-200/70 bg-white hover:border-purple-200 dark:border-slate-800 dark:bg-slate-900'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                                <span className="w-6 text-center text-xs font-bold tabular-nums text-slate-400">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <img
                                  src={resolvePodcastCover(ep, idx)}
                                  alt={ep.title}
                                  className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                    {ep.title}
                                  </p>
                                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    🎙 {ep.author?.displayName || 'Creator'} · {ep.category || 'Creator Talk'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                                  {formatDurationClock(ep.durationSeconds ?? 200)}
                                </span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const res = await apiClient
                                      .post(`/podcasts/episodes/${ep._id}/like`)
                                      .catch(() => null);
                                    if (res?.data?.likesCount !== undefined) {
                                      setEpisodes((prev) =>
                                        prev.map((item) =>
                                          item._id === ep._id
                                            ? {
                                                ...item,
                                                likesCount: res.data.likesCount,
                                                isLiked:
                                                  typeof res.data.liked === 'boolean'
                                                    ? res.data.liked
                                                    : !item.isLiked,
                                              }
                                            : item,
                                        ),
                                      );
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                                    ep.isLiked
                                      ? 'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-300'
                                      : 'text-slate-500 hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-950'
                                  }`}
                                >
                                  <Heart className={`h-3.5 w-3.5 ${ep.isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                                  {ep.likesCount ?? 0}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleTogglePlayEpisode(ep)}
                                  aria-label={epPlaying ? `Pause ${ep.title}` : `Play ${ep.title}`}
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] text-white shadow-md transition hover:scale-105"
                                >
                                  {epPlaying ? (
                                    <Pause className="h-4 w-4 fill-white" />
                                  ) : (
                                    <Play className="ml-0.5 h-4 w-4 fill-white" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* AI Studio Controls for Episode Owner */}
                            {isOwner && (
                              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5 text-[11px] dark:border-slate-800">
                                <button
                                  type="button"
                                  disabled={epBusyId === `tx-${ep._id}`}
                                  onClick={async () => {
                                    setEpBusyId(`tx-${ep._id}`);
                                    try {
                                      const res = await apiClient.post(`/podcasts/episodes/${ep._id}/transcribe`);
                                      setBanner({
                                        type: 'success',
                                        text: `AI Transcript generated (${res.data?.creditsCharged ?? 4} credits).`,
                                      });
                                      await loadData();
                                    } catch (err) {
                                      setBanner({
                                        type: 'error',
                                        text: err instanceof Error ? err.message : 'Transcription failed.',
                                      });
                                    } finally {
                                      setEpBusyId(null);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 font-semibold text-purple-700 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  AI Transcript (4 cr)
                                </button>
                                <button
                                  type="button"
                                  disabled={epBusyId === `hl-${ep._id}`}
                                  onClick={async () => {
                                    setEpBusyId(`hl-${ep._id}`);
                                    try {
                                      const res = await apiClient.post(`/podcasts/episodes/${ep._id}/highlights`);
                                      setBanner({
                                        type: 'success',
                                        text: `Highlights extracted (${res.data?.creditsCharged ?? 5} credits).`,
                                      });
                                      await loadData();
                                    } catch (err) {
                                      setBanner({
                                        type: 'error',
                                        text: err instanceof Error ? err.message : 'Highlight extraction failed.',
                                      });
                                    } finally {
                                      setEpBusyId(null);
                                    }
                                  }}
                                  className="rounded-full border border-purple-200 px-2.5 py-1 font-semibold text-purple-700 dark:border-purple-800 dark:text-purple-300"
                                >
                                  AI Highlights (5 cr)
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await apiClient.delete(`/podcasts/episodes/${ep._id}`);
                                    setBanner({ type: 'success', text: 'Episode deleted.' });
                                    await loadData();
                                  }}
                                  className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </button>
                              </div>
                            )}

                            {transcriptText && (
                              <p className="mt-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                                {transcriptText}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* RIGHT SIDEBAR (4 cols): Top Podcasters + Dark-Purple Now-Playing Card */}
              <aside className="space-y-6 lg:col-span-4">
                {/* Top Podcasters */}
                <section className="rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Top Podcasters
                    </h2>
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      See More
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {topPodcasters.map((pod) => (
                      <div key={pod.id} className="flex items-center gap-3">
                        <img
                          src={pod.avatar}
                          alt={pod.name}
                          className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {pod.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {formatCompactMetric(pod.followers)} Followers
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {formatCompactMetric(pod.plays)} Plays
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                    {topPodcasters.length === 0 && (
                      <p className="text-xs text-slate-500">Publish an episode to appear on Top Podcasters.</p>
                    )}
                  </div>
                </section>

                {/* Dark-Purple Now-Playing Card with Waveform Scrub Bar */}
                <section className="rounded-[30px] bg-gradient-to-b from-[#2A0948] via-[#21063B] to-[#160329] p-5 text-white shadow-[0_24px_60px_rgba(33,6,59,0.45)]">
                  <div className="overflow-hidden rounded-[22px]">
                    <img
                      src={
                        activeEpisode
                          ? resolvePodcastCover(activeEpisode, 0)
                          : PODCAST_FALLBACK_COVERS[0]
                      }
                      alt={activeEpisode?.title || 'Now Playing'}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="truncate text-base font-extrabold text-white">
                      {activeEpisode?.title || 'Select a Podcast Episode'}
                    </h3>
                    <p className="mt-0.5 text-xs text-purple-200/75">
                      {activeEpisode?.author?.displayName || 'HyperBuds Podcast Studio'}
                    </p>
                  </div>

                  {/* Interactive Waveform Scrub Bar */}
                  <div className="mt-5 flex items-center gap-2.5">
                    <span className="w-9 text-[11px] font-medium tabular-nums text-purple-200/80">
                      {formatDurationClock(playProgressSec)}
                    </span>
                    <div className="flex flex-1 items-center justify-between gap-[3px] py-2">
                      {WAVEFORM_BARS.map((heightPct, idx) => {
                        const barProgress = (idx + 1) / WAVEFORM_BARS.length;
                        const curProgress = playProgressSec / Math.max(1, activeDuration);
                        const lit = barProgress <= curProgress;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              setPlayProgressSec(Math.round(barProgress * activeDuration))
                            }
                            aria-label={`Seek to ${Math.round(barProgress * 100)}%`}
                            style={{ height: `${Math.max(8, Math.round(heightPct * 0.38))}px` }}
                            className={`w-[3px] rounded-full transition-all ${
                              lit ? 'bg-white' : 'bg-white/25 hover:bg-white/50'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="w-9 text-right text-[11px] font-medium tabular-nums text-purple-200/80">
                      {formatDurationClock(activeDuration)}
                    </span>
                  </div>

                  {/* Transport Controls */}
                  <div className="mt-4 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => setRepeatOn((v) => !v)}
                      aria-label="Toggle repeat"
                      className={`p-2 transition ${
                        repeatOn ? 'text-purple-300' : 'text-white/55 hover:text-white'
                      }`}
                    >
                      <Repeat className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepEpisode(-1)}
                      aria-label="Previous episode"
                      className="p-2 text-white/85 transition hover:text-white"
                    >
                      <SkipBack className="h-5 w-5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeEpisode) void handleTogglePlayEpisode(activeEpisode);
                      }}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#21063B] shadow-[0_0_25px_rgba(255,255,255,0.45)] transition hover:scale-105"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepEpisode(1)}
                      aria-label="Next episode"
                      className="p-2 text-white/85 transition hover:text-white"
                    >
                      <SkipForward className="h-5 w-5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShuffleOn((v) => !v)}
                      aria-label="Toggle shuffle"
                      className={`p-2 transition ${
                        shuffleOn ? 'text-purple-300' : 'text-white/55 hover:text-white'
                      }`}
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          MODAL: CREATE / EDIT STREAM WITH CUSTOM THUMBNAIL UPLOAD
         ================================================================ */}
      {streamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-purple-300/25 bg-[#16082A] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-300/15 pb-3">
              <div>
                <h2 className="text-base font-extrabold">
                  {editingStreamId ? 'Edit Stream Card & Thumbnail' : 'Create Reusable Stream Card'}
                </h2>
                <p className="text-xs text-purple-200/75">
                  Upload a custom thumbnail so subscribers recognize your stream anytime you go live.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStreamModalOpen(false)}
                className="rounded-full p-1.5 text-purple-200/80 hover:bg-purple-500/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStreamModal} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="mb-1.5 block font-semibold text-purple-100">
                  Stream Thumbnail
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-purple-300/30 bg-purple-500/10">
                    <img
                      src={streamThumbnailUrl || STREAM_FALLBACK_THUMBNAILS[0]}
                      alt="Stream thumbnail preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] px-3.5 py-2 text-xs font-bold text-white shadow transition hover:opacity-95">
                      {thumbUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="h-3.5 w-3.5" />
                      )}
                      {thumbUploading ? 'Uploading...' : 'Upload Thumbnail'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) void handleUploadStreamThumbnail(file);
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={streamThumbnailUrl}
                      onChange={(e) => setStreamThumbnailUrl(e.target.value)}
                      placeholder="Or paste custom thumbnail URL..."
                      className="w-full rounded-xl border border-purple-300/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-purple-100">Title *</label>
                  <input
                    type="text"
                    required
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    placeholder="Spider-Verse Live Breakdown"
                    className="w-full rounded-xl border border-purple-300/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-purple-100">Category</label>
                  <select
                    value={streamCategory}
                    onChange={(e) => setStreamCategory(e.target.value)}
                    className="w-full rounded-xl border border-purple-300/20 bg-black/40 px-3 py-2 text-white outline-none"
                  >
                    {STREAM_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-purple-100">Description</label>
                <textarea
                  rows={2}
                  value={streamDesc}
                  onChange={(e) => setStreamDesc(e.target.value)}
                  placeholder="What is this stream about?"
                  className="w-full rounded-xl border border-purple-300/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-purple-400"
                />
              </div>

              {!editingStreamId && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block font-semibold text-purple-100">
                        Schedule Time (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={streamScheduledAt}
                        onChange={(e) => setStreamScheduledAt(e.target.value)}
                        className="w-full rounded-xl border border-purple-300/20 bg-black/40 px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-purple-100">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={streamTagsInput}
                        onChange={(e) => setStreamTagsInput(e.target.value)}
                        placeholder="Animation, Collab"
                        className="w-full rounded-xl border border-purple-300/20 bg-black/40 px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-purple-300/15 bg-purple-500/10 p-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={streamChatEnabled}
                        onChange={(e) => setStreamChatEnabled(e.target.checked)}
                      />
                      <span>Enable live chat</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={streamRecordingEnabled}
                        onChange={(e) => {
                          setStreamRecordingEnabled(e.target.checked);
                          if (!e.target.checked) setStreamRecordingConsent(false);
                        }}
                      />
                      <span>Save VOD recording</span>
                    </label>
                    {streamRecordingEnabled && (
                      <label className="flex items-center gap-2 text-purple-200">
                        <input
                          type="checkbox"
                          checked={streamRecordingConsent}
                          onChange={(e) => setStreamRecordingConsent(e.target.checked)}
                        />
                        <span>All co-hosts & participants consent to recording</span>
                      </label>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStreamModalOpen(false)}
                  className="rounded-full border border-purple-300/25 px-4 py-2 font-semibold text-purple-100 hover:bg-purple-500/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={streamSubmitting || thumbUploading}
                  className="rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] px-5 py-2 font-extrabold text-white shadow-lg disabled:opacity-50"
                >
                  {streamSubmitting
                    ? 'Saving...'
                    : editingStreamId
                      ? 'Save Thumbnail'
                      : 'Create Stream Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: CREATE PODCAST EPISODE WITH COVER ART UPLOAD
         ================================================================ */}
      {podcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-purple-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold">New Podcast Episode</h2>
              <button
                type="button"
                onClick={() => setPodcastModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePodcastEpisode} className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={epThumbnailUrl || PODCAST_FALLBACK_COVERS[0]}
                  alt="Cover preview"
                  className="h-16 w-16 rounded-2xl object-cover border border-purple-200"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#8B3DFF] px-3.5 py-1.5 font-bold text-white">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {epCoverUploading ? 'Uploading...' : 'Upload Cover Art'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) void handleUploadEpisodeCover(file);
                      }}
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Optional square cover art ({formatFileSize(1024 * 1024 * 15)} max)
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold">Episode Title *</label>
                <input
                  type="text"
                  required
                  value={epTitle}
                  onChange={(e) => setEpTitle(e.target.value)}
                  placeholder="Creator Economics Ep. 12"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold">Category</label>
                  <select
                    value={epCategory}
                    onChange={(e) => setEpCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  >
                    {PODCAST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold">Max Minutes</label>
                  <input
                    type="number"
                    min={5}
                    max={quota?.maxStreamDurationMinutes ?? 240}
                    value={epDurationMin}
                    onChange={(e) => setEpDurationMin(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold">Audio Track URL (Optional)</label>
                <input
                  type="url"
                  value={epAudioUrl}
                  onChange={(e) => setEpAudioUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-purple-200 bg-purple-50 p-2.5 text-purple-900 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-200">
                <input
                  type="checkbox"
                  checked={epConsent}
                  onChange={(e) => setEpConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>All speakers have signed multi-track recording consent.</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPodcastModalOpen(false)}
                  className="rounded-full border border-slate-200 px-4 py-2 font-semibold dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={epSubmitting || epCoverUploading}
                  className="rounded-full bg-gradient-to-r from-[#8B3DFF] to-[#A855F7] px-5 py-2 font-bold text-white disabled:opacity-50"
                >
                  {epSubmitting ? 'Publishing...' : 'Publish Episode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
