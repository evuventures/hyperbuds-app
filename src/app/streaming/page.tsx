'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Mic,
  Play,
  Plus,
  Radio,
  Shield,
  Sparkles,
  Square,
  Trash2,
  XCircle,
} from 'lucide-react';

type StreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

interface StreamRecord {
  _id: string;
  title: string;
  description?: string;
  status: StreamStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  streamKey?: string;
  ingestUrl?: string;
  playbackUrl?: string;
  recordingEnabled?: boolean;
  recordingConsent?: boolean;
  chatEnabled?: boolean;
  viewersCurrent?: number;
  viewersPeak?: number;
  tags?: string[];
  createdAt?: string;
}

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
  title: string;
  description?: string;
  status: string;
  recordingConsent: boolean;
  maxDurationMinutes: number;
  storageMb: number;
  tracks?: Array<{ label: string; codec: string; sizeMb: number }>;
  transcript?: { text?: string };
  highlights?: Array<{ title: string; startSeconds: number; endSeconds: number }>;
}

const STATUS_TABS: Array<{ key: 'all' | StreamStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'ended', label: 'Ended' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_STYLES: Record<StreamStatus, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  scheduled:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
  ended:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  cancelled:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
};

function formatDateTime(value?: string) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StreamingPage() {
  const [streams, setStreams] = useState<StreamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | StreamStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [busyStreamId, setBusyStreamId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [submitting, setSubmitting] = useState(false);

  // Studio tabs, tier quotas, live chat moderation, and Podcast Studio
  const [studioMode, setStudioMode] = useState<'live' | 'podcast'>('live');
  const [quota, setQuota] = useState<MediaQuota | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisodeItem[]>([]);
  const [epTitle, setEpTitle] = useState('');
  const [epConsent, setEpConsent] = useState(false);
  const [epDuration, setEpDuration] = useState(30);
  const [epBusyId, setEpBusyId] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');
  const [modUserId, setModUserId] = useState('');

  const loadStreams = useCallback(async () => {
    setLoading(true);
    try {
      const [streamsRes, quotaRes, episodesRes] = await Promise.all([
        apiClient.get('/streaming/streams'),
        apiClient.get('/streaming/quotas').catch(() => null),
        apiClient.get('/podcasts/episodes').catch(() => null),
      ]);
      const list: StreamRecord[] = Array.isArray(streamsRes.data?.streams)
        ? streamsRes.data.streams
        : [];
      setStreams(list);
      setSelectedId((prev) => prev ?? list[0]?._id ?? null);
      if (quotaRes?.data?.quota) setQuota(quotaRes.data.quota);
      if (Array.isArray(episodesRes?.data?.episodes)) setEpisodes(episodesRes.data.episodes);
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Unable to load streams.';
      setBanner({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  const filteredStreams = useMemo(() => {
    if (statusFilter === 'all') return streams;
    return streams.filter((item) => item.status === statusFilter);
  }, [streams, statusFilter]);

  const selectedStream = useMemo(
    () => streams.find((s) => s._id === selectedId) ?? filteredStreams[0] ?? null,
    [streams, selectedId, filteredStreams],
  );

  const handleCreateStream = async (event: React.FormEvent) => {
    event.preventDefault();
    setBanner(null);

    if (!title.trim()) {
      setBanner({ type: 'error', text: 'Stream title is required.' });
      return;
    }

    if (recordingEnabled && !recordingConsent) {
      setBanner({
        type: 'error',
        text: 'Confirm recording consent before enabling stream recording.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const response = await apiClient.post('/streaming/streams', {
        title: title.trim(),
        description: description.trim() || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        tags,
        chatEnabled,
        recordingEnabled,
        recordingConsent,
        resolution,
      });

      const created: StreamRecord | undefined = response.data?.stream;
      if (created) {
        setStreams((prev) => [created, ...prev]);
        setSelectedId(created._id);
      } else {
        await loadStreams();
      }

      setTitle('');
      setDescription('');
      setScheduledAt('');
      setTagsInput('');
      setRecordingEnabled(false);
      setRecordingConsent(false);
      setBanner({ type: 'success', text: 'Stream scheduled.' });
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Failed to schedule stream.';
      setBanner({ type: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLifecycleAction = async (
    streamId: string,
    action: 'start' | 'end' | 'cancel',
  ) => {
    setBanner(null);
    setBusyStreamId(streamId);
    try {
      const response = await apiClient.put(`/streaming/streams/${streamId}/${action}`);
      const updated: StreamRecord | undefined = response.data?.stream;
      if (updated) {
        setStreams((prev) => prev.map((s) => (s._id === streamId ? updated : s)));
      } else {
        await loadStreams();
      }
      const actionLabel =
        action === 'start' ? 'Stream is now live.' : action === 'end' ? 'Stream ended.' : 'Stream cancelled.';
      setBanner({ type: 'success', text: actionLabel });
    } catch (error) {
      const message =
        (error as { message?: string })?.message || `Unable to ${action} stream.`;
      setBanner({ type: 'error', text: message });
    } finally {
      setBusyStreamId(null);
    }
  };

  const handleCopy = async (label: string, value?: string) => {
    if (!value) return;
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
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Broadcast & Podcast Console
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {studioMode === 'live' ? 'Live Studio' : 'Podcast Studio'}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Tier-enforced session quotas, consented multi-track recording, live chat controls, and AI transcripts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStudioMode('live')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                    studioMode === 'live'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5" />
                  Live Streams
                </button>
                <button
                  type="button"
                  onClick={() => setStudioMode('podcast')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors ${
                    studioMode === 'podcast'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Mic className="h-3.5 w-3.5" />
                  Podcast Studio
                </button>
              </div>
              {studioMode === 'live' && (
                <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Stream status filter">
                  {STATUS_TABS.map((tab) => {
                    const active = statusFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {quota && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Active Plan Tier</p>
                <p className="mt-0.5 font-semibold text-purple-600 dark:text-purple-400">{quota.tierName}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Max Session & Hosts</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {quota.maxStreamDurationMinutes}m · up to {quota.maxHosts} hosts
                </p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Max Resolution</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{quota.maxResolution}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Studio Storage Used</p>
                <p className="mt-0.5 font-semibold tabular-nums text-slate-900 dark:text-white">
                  {quota.usedStorageMb} / {quota.storageLimitMb} MB
                </p>
              </div>
            </div>
          )}

          {banner && (
            <div
              role="status"
              className={`mt-5 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="ml-4 text-xs font-medium underline underline-offset-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {studioMode === 'podcast' ? (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-8">
                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Podcast Studio Episodes ({episodes.length})
                    </h2>
                    <span className="text-xs text-slate-500">Multi-track audio · AI transcription</span>
                  </div>

                  {episodes.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No podcast episodes created yet. Start a consent-verified episode on the right.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {episodes.map((ep) => (
                        <div
                          key={ep._id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{ep.title}</h3>
                              <p className="text-xs text-slate-500">
                                {ep.maxDurationMinutes}m cap · {ep.storageMb} MB · {(ep.tracks?.length || 0)} track(s) · Consent signed
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <button
                                type="button"
                                disabled={epBusyId === `tx-${ep._id}`}
                                onClick={async () => {
                                  setEpBusyId(`tx-${ep._id}`);
                                  setBanner(null);
                                  try {
                                    const res = await apiClient.post(`/podcasts/episodes/${ep._id}/transcribe`);
                                    setBanner({
                                      type: 'success',
                                      text: `AI Transcript generated (${res.data?.creditsCharged ?? 4} credits).`,
                                    });
                                    await loadStreams();
                                  } catch (err) {
                                    setBanner({
                                      type: 'error',
                                      text: err instanceof Error ? err.message : 'Transcription failed.',
                                    });
                                  } finally {
                                    setEpBusyId(null);
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1.5 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Transcript (4 cr)
                              </button>
                              <button
                                type="button"
                                disabled={epBusyId === `hl-${ep._id}`}
                                onClick={async () => {
                                  setEpBusyId(`hl-${ep._id}`);
                                  setBanner(null);
                                  try {
                                    const res = await apiClient.post(`/podcasts/episodes/${ep._id}/highlights`);
                                    setBanner({
                                      type: 'success',
                                      text: `Highlight markers extracted (${res.data?.creditsCharged ?? 5} credits).`,
                                    });
                                    await loadStreams();
                                  } catch (err) {
                                    setBanner({
                                      type: 'error',
                                      text: err instanceof Error ? err.message : 'Highlight extraction failed.',
                                    });
                                  } finally {
                                    setEpBusyId(null);
                                  }
                                }}
                                className="rounded-lg border border-purple-200 dark:border-purple-800 px-2.5 py-1.5 font-medium text-purple-700 dark:text-purple-300"
                              >
                                AI Highlights (5 cr)
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await apiClient.delete(`/podcasts/episodes/${ep._id}`);
                                  setBanner({ type: 'success', text: 'Episode deleted and storage quota reclaimed.' });
                                  await loadStreams();
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>

                          {ep.transcript?.text && (
                            <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 dark:bg-slate-950 p-3 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                              {ep.transcript.text}
                            </pre>
                          )}
                          {(ep.highlights?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {ep.highlights!.map((hl) => (
                                <span
                                  key={hl.title}
                                  className="rounded-md bg-purple-50 dark:bg-purple-950/40 px-2 py-1 text-[11px] text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                >
                                  {hl.startSeconds}s–{hl.endSeconds}s · {hl.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <aside className="lg:col-span-4">
                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
                    New Podcast Episode
                  </h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setBanner(null);
                      try {
                        await apiClient.post('/podcasts/episodes', {
                          title: epTitle.trim(),
                          recordingConsent: epConsent,
                          maxDurationMinutes: Number(epDuration),
                          storageMb: 40,
                        });
                        setEpTitle('');
                        setEpConsent(false);
                        setBanner({ type: 'success', text: 'Podcast Studio episode initialized.' });
                        await loadStreams();
                      } catch (err) {
                        setBanner({
                          type: 'error',
                          text: err instanceof Error ? err.message : 'Unable to create episode.',
                        });
                      }
                    }}
                    className="mt-4 space-y-3.5 text-xs"
                  >
                    <div>
                      <label htmlFor="podcast-ep-title" className="block font-medium text-slate-700 dark:text-slate-300">
                        Episode Title
                      </label>
                      <input
                        id="podcast-ep-title"
                        type="text"
                        value={epTitle}
                        onChange={(e) => setEpTitle(e.target.value)}
                        placeholder="Creator Economics Ep. 12"
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="podcast-ep-duration" className="block font-medium text-slate-700 dark:text-slate-300">
                        Max Session Minutes (Tier limit: {quota?.maxStreamDurationMinutes ?? 30}m)
                      </label>
                      <input
                        id="podcast-ep-duration"
                        type="number"
                        min={5}
                        max={240}
                        value={epDuration}
                        onChange={(e) => setEpDuration(Number(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                      />
                    </div>
                    <label className="flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 text-amber-900 dark:text-amber-200">
                      <input
                        type="checkbox"
                        checked={epConsent}
                        onChange={(e) => setEpConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded"
                      />
                      <span>All hosts & guests consented to multi-track recording and AI processing.</span>
                    </label>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700"
                    >
                      Create Studio Episode
                    </button>
                  </form>
                </section>
              </aside>
            </div>
          ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left column: Stream Queue & Ingest Inspector */}
            <div className="space-y-6 lg:col-span-8">
              <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Sessions
                  </h2>
                  <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {filteredStreams.length} {filteredStreams.length === 1 ? 'stream' : 'streams'}
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3 p-5">
                    {[1, 2, 3].map((row) => (
                      <div
                        key={row}
                        className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
                      />
                    ))}
                  </div>
                ) : filteredStreams.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Radio className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
                      No streams in this view
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Schedule a new broadcast from the studio panel to generate an RTMP ingest key.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredStreams.map((stream) => {
                      const isSelected = selectedStream?._id === stream._id;
                      const isBusy = busyStreamId === stream._id;

                      return (
                        <li
                          key={stream._id}
                          className={`p-4 transition-colors sm:px-5 ${
                            isSelected
                              ? 'bg-slate-50/80 dark:bg-slate-800/40'
                              : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                          }`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedId(stream._id);
                                setRevealKey(false);
                              }}
                              className="min-w-0 flex-1 text-left"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                  {stream.title}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize ${
                                    STATUS_STYLES[stream.status]
                                  }`}
                                >
                                  {stream.status === 'live' && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  )}
                                  {stream.status}
                                </span>
                                {stream.recordingEnabled && (
                                  <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                    Recording consented
                                  </span>
                                )}
                              </div>
                              {stream.description && (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
                                  {stream.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                                <span>Scheduled: {formatDateTime(stream.scheduledAt)}</span>
                                {stream.startedAt && (
                                  <span>Started: {formatDateTime(stream.startedAt)}</span>
                                )}
                                <span>Peak viewers: {stream.viewersPeak ?? 0}</span>
                              </div>
                            </button>

                            <div className="flex shrink-0 items-center gap-2">
                              {stream.status === 'scheduled' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleLifecycleAction(stream._id, 'start')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                    Go live
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleLifecycleAction(stream._id, 'cancel')}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Cancel
                                  </button>
                                </>
                              )}
                              {stream.status === 'live' && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleLifecycleAction(stream._id, 'end')}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                                >
                                  <Square className="h-3.5 w-3.5" />
                                  End stream
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {selectedStream && (
                <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Encoder & Playback
                      </p>
                      <h3 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedStream.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRevealKey((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {revealKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {revealKey ? 'Hide key' : 'Reveal key'}
                    </button>
                  </div>

                  <dl className="mt-4 space-y-3 text-xs">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="font-medium text-slate-500 dark:text-slate-400">
                        Ingest URL
                      </dt>
                      <dd className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200">
                        <span className="truncate max-w-xs sm:max-w-sm">
                          {revealKey
                            ? selectedStream.ingestUrl || 'rtmp://localhost/live'
                            : 'rtmp://localhost/live/••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('ingest', selectedStream.ingestUrl)}
                          className="rounded border border-slate-200 p-1 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:hover:text-white"
                          aria-label="Copy ingest URL"
                        >
                          {copiedField === 'ingest' ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </dd>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="font-medium text-slate-500 dark:text-slate-400">
                        Stream Key
                      </dt>
                      <dd className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200">
                        <span>
                          {revealKey
                            ? selectedStream.streamKey || 'Unavailable'
                            : '••••••••••••••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy('key', selectedStream.streamKey)}
                          className="rounded border border-slate-200 p-1 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:hover:text-white"
                          aria-label="Copy stream key"
                        >
                          {copiedField === 'key' ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </dd>
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="font-medium text-slate-500 dark:text-slate-400">
                        Playback URL
                      </dt>
                      <dd className="truncate max-w-xs sm:max-w-sm font-mono text-slate-700 dark:text-slate-300">
                        {selectedStream.playbackUrl || 'Generated on start'}
                      </dd>
                    </div>
                  </dl>

                  {/* Live Chat Moderation & Recording Delete */}
                  <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                        <Shield className="h-3.5 w-3.5 text-purple-600" />
                        Live Chat & Recording Controls
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiClient.delete(`/streaming/streams/${selectedStream._id}/recording`);
                          setBanner({ type: 'success', text: 'Stream VOD recording removed.' });
                          await loadStreams();
                        }}
                        className="inline-flex items-center gap-1 rounded border border-rose-200 px-2.5 py-1 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Recording
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={modUserId}
                        onChange={(e) => setModUserId(e.target.value)}
                        placeholder="Target userId to mute / ban"
                        className="flex-1 min-w-[180px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!modUserId.trim()) return;
                          await apiClient.post(`/streaming/streams/${selectedStream._id}/moderate-chat`, {
                            action: 'mute',
                            targetUserId: modUserId.trim(),
                          });
                          setBanner({ type: 'success', text: `Muted user ${modUserId.trim()} in stream chat.` });
                        }}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 font-medium"
                      >
                        Mute User
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await apiClient.post(`/streaming/streams/${selectedStream._id}/moderate-chat`, {
                            action: 'toggle_slow_mode',
                            slowModeSeconds: 10,
                          });
                          setBanner({ type: 'success', text: 'Slow mode toggled on stream chat.' });
                        }}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 font-medium"
                      >
                        Toggle Slow Mode
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                        placeholder="Send host announcement in stream chat..."
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!chatText.trim()) return;
                          try {
                            await apiClient.post(`/streaming/streams/${selectedStream._id}/chat`, {
                              text: chatText.trim(),
                            });
                            setChatText('');
                            setBanner({ type: 'success', text: 'Chat announcement posted.' });
                          } catch (err) {
                            setBanner({
                              type: 'error',
                              text: err instanceof Error ? err.message : 'Unable to send chat message.',
                            });
                          }
                        }}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 font-semibold text-white hover:bg-purple-700"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Right column: Schedule New Broadcast */}
            <aside className="lg:col-span-4">
              <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Schedule stream
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Generates a dedicated RTMP key for OBS or Studio.
                  </p>
                </div>

                <form onSubmit={handleCreateStream} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="stream-title"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Title
                    </label>
                    <input
                      id="stream-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Weekly product teardown"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="stream-description"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Notes
                    </label>
                    <textarea
                      id="stream-description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Agenda, guests, or collaboration topic"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="stream-scheduled-at"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Start time
                    </label>
                    <input
                      id="stream-scheduled-at"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="stream-tags"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Resolution & Tags (comma-separated)
                    </label>
                    <select
                      aria-label="Stream resolution"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as '720p' | '1080p')}
                      className="mt-1 mb-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="720p">720p HD (All Tiers)</option>
                      <option value="1080p">1080p Full HD (Pro & Creator Max)</option>
                    </select>
                    <input
                      id="stream-tags"
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="design, studio, qa"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-400"
                    />
                  </div>

                  <div className="space-y-2.5 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={chatEnabled}
                        onChange={(e) => setChatEnabled(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300"
                      />
                      <span>Enable live chat for participants</span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={recordingEnabled}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRecordingEnabled(checked);
                          if (!checked) setRecordingConsent(false);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300"
                      />
                      <span>Save VOD recording after broadcast ends</span>
                    </label>

                    {recordingEnabled && (
                      <label className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                        <input
                          type="checkbox"
                          checked={recordingConsent}
                          onChange={(e) => setRecordingConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-amber-400"
                        />
                        <span>
                          I confirm all co-hosts and participants have consented to recording.
                        </span>
                      </label>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                    {submitting ? 'Scheduling...' : 'Create stream'}
                  </button>
                </form>
              </section>
            </aside>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
