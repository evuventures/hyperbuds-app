'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Cast,
  Check,
  Cloud,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Radio,
  RefreshCw,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

interface IngressConfig {
  ingressId: string;
  inputType: 'rtmp' | 'whip';
  url: string;
  streamKey: string;
  status: 'active' | 'inactive' | string;
}

interface RestreamDestination {
  id: string;
  platform: 'youtube' | 'twitch' | 'kick' | 'facebook' | 'custom';
  label: string;
  rtmpUrl: string;
  streamKeyMasked: string;
  enabled: boolean;
}

interface EgressJob {
  id: string;
  egressId: string;
  kind: 'rtmp_restream' | 'vod_recording' | string;
  status: string;
  outputUrl?: string | null;
}

interface BroadcastInfraDrawerProps {
  streamId: string;
  onClose: () => void;
}

const PLATFORM_PRESETS: Record<
  'youtube' | 'twitch' | 'kick' | 'facebook' | 'custom',
  { label: string; rtmpUrl: string }
> = {
  youtube: { label: 'YouTube Live', rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2' },
  twitch: { label: 'Twitch', rtmpUrl: 'rtmp://live.twitch.tv/app' },
  kick: { label: 'Kick', rtmpUrl: 'rtmps://fa723fc1b171.global-contribute.live-video.net/app' },
  facebook: { label: 'Facebook Live', rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp' },
  custom: { label: 'Custom RTMP', rtmpUrl: '' },
};

export function BroadcastInfraDrawer({ streamId, onClose }: BroadcastInfraDrawerProps) {
  const [tab, setTab] = useState<'obs' | 'restream'>('obs');
  const [loading, setLoading] = useState(true);

  // OBS / RTMP Ingress state
  const [ingress, setIngress] = useState<IngressConfig | null>(null);
  const [inputType, setInputType] = useState<'rtmp' | 'whip'>('rtmp');
  const [provisioning, setProvisioning] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [copiedField, setCopiedField] = useState<'url' | 'key' | null>(null);

  // Multi-stream & Cloud VOD state
  const [destinations, setDestinations] = useState<RestreamDestination[]>([]);
  const [egressJobs, setEgressJobs] = useState<EgressJob[]>([]);
  const [cloudVodConfigured, setCloudVodConfigured] = useState(false);
  const [newPlatform, setNewPlatform] = useState<'youtube' | 'twitch' | 'kick' | 'facebook' | 'custom'>('youtube');
  const [newLabel, setNewLabel] = useState('YouTube Live');
  const [newRtmpUrl, setNewRtmpUrl] = useState(PLATFORM_PRESETS.youtube.rtmpUrl);
  const [newStreamKey, setNewStreamKey] = useState('');
  const [addingDest, setAddingDest] = useState(false);
  const [restreamBusy, setRestreamBusy] = useState(false);
  const [cloudVodBusy, setCloudVodBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ingRes, restreamRes] = await Promise.all([
        apiClient.get(`/streaming/streams/${streamId}/ingress`).catch(() => null),
        apiClient.get(`/streaming/streams/${streamId}/restream`).catch(() => null),
      ]);
      if (ingRes?.data?.ingress) setIngress(ingRes.data.ingress);
      if (restreamRes?.data) {
        setDestinations(Array.isArray(restreamRes.data.destinations) ? restreamRes.data.destinations : []);
        setEgressJobs(Array.isArray(restreamRes.data.egressJobs) ? restreamRes.data.egressJobs : []);
        setCloudVodConfigured(Boolean(restreamRes.data.cloudVodConfigured));
      }
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const activeRestreamJob = egressJobs.find(
    (j) => j.kind === 'rtmp_restream' && (j.status === 'active' || j.status === 'starting'),
  );
  const activeVodJob = egressJobs.find(
    (j) => j.kind === 'vod_recording' && (j.status === 'active' || j.status === 'starting'),
  );

  const handleCopy = async (text: string, field: 'url' | 'key') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1500);
    } catch {
      toast.error('Unable to copy');
    }
  };

  const handleProvisionIngress = async () => {
    setProvisioning(true);
    try {
      const res = await apiClient.post(`/streaming/streams/${streamId}/ingress`, { inputType });
      if (res.data?.ingress) {
        setIngress(res.data.ingress);
        toast.success(`${inputType.toUpperCase()} stream key ready for OBS!`);
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Could not generate stream key';
      toast.error(msg);
    } finally {
      setProvisioning(false);
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRtmpUrl.trim() || !newStreamKey.trim()) return;
    setAddingDest(true);
    try {
      await apiClient.post(`/streaming/streams/${streamId}/restream/destinations`, {
        platform: newPlatform,
        label: newLabel.trim() || PLATFORM_PRESETS[newPlatform].label,
        rtmpUrl: newRtmpUrl.trim(),
        streamKey: newStreamKey.trim(),
      });
      setNewStreamKey('');
      toast.success('Destination added.');
      await loadAll();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        'Could not add destination';
      toast.error(msg);
    } finally {
      setAddingDest(false);
    }
  };

  const handleDeleteDestination = async (destId: string) => {
    await apiClient.delete(`/streaming/streams/${streamId}/restream/destinations/${destId}`).catch(() => null);
    setDestinations((prev) => prev.filter((d) => d.id !== destId));
  };

  const handleToggleRestream = async () => {
    setRestreamBusy(true);
    try {
      if (activeRestreamJob) {
        await apiClient.post(`/streaming/streams/${streamId}/restream/stop`);
        toast.success('Multi-stream stopped.');
      } else {
        await apiClient.post(`/streaming/streams/${streamId}/restream/start`);
        toast.success('Multi-stream started across all destinations!');
      }
      await loadAll();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        'Multi-stream action failed';
      toast.error(msg);
    } finally {
      setRestreamBusy(false);
    }
  };

  const handleToggleCloudVod = async () => {
    setCloudVodBusy(true);
    try {
      if (activeVodJob) {
        await apiClient.post(`/streaming/streams/${streamId}/egress-recording/stop`);
        toast.success('Cloud VOD recording finishing…');
      } else {
        await apiClient.post(`/streaming/streams/${streamId}/egress-recording/start`);
        toast.success('Cloud VOD recording started!');
      }
      await loadAll();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        'Cloud VOD action failed';
      toast.error(msg);
    } finally {
      setCloudVodBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151821] p-4 text-white shadow-xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTab('obs')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tab === 'obs' ? 'bg-purple-600 text-white' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            OBS / RTMP Ingress
          </button>
          <button
            type="button"
            onClick={() => setTab('restream')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tab === 'restream' ? 'bg-purple-600 text-white' : 'bg-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Cast className="h-3.5 w-3.5" />
            Multi-Stream &amp; Cloud VOD
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : tab === 'obs' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-400">
              Stream directly from OBS Studio, Streamlabs, or Prism Live into this HyperBuds room.
            </p>
            <div className="flex items-center gap-2">
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as 'rtmp' | 'whip')}
                className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs text-white"
              >
                <option value="rtmp">RTMP (OBS / Streamlabs)</option>
                <option value="whip">WHIP (Ultra-Low Latency)</option>
              </select>
              <button
                type="button"
                disabled={provisioning}
                onClick={() => void handleProvisionIngress()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
              >
                {provisioning ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {ingress ? 'Rotate Key' : 'Generate Key'}
              </button>
            </div>
          </div>

          {ingress ? (
            <div className="space-y-2.5 rounded-xl border border-white/10 bg-zinc-950/70 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">
                  {ingress.inputType.toUpperCase()} Credentials
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    ingress.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      ingress.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  {ingress.status === 'active' ? 'OBS Connected' : 'Waiting for OBS'}
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2">
                  <span className="block text-[10px] uppercase text-zinc-500">Server URL</span>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <code className="truncate text-xs text-zinc-200">{ingress.url}</code>
                    <button
                      type="button"
                      onClick={() => void handleCopy(ingress.url, 'url')}
                      className="shrink-0 text-zinc-400 hover:text-white"
                    >
                      {copiedField === 'url' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2">
                  <span className="block text-[10px] uppercase text-zinc-500">Stream Key</span>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <code className="truncate text-xs text-zinc-200">
                      {revealKey ? ingress.streamKey : '••••••••••••••••••••'}
                    </code>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRevealKey((v) => !v)}
                        className="text-zinc-400 hover:text-white"
                      >
                        {revealKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCopy(ingress.streamKey, 'key')}
                        className="text-zinc-400 hover:text-white"
                      >
                        {copiedField === 'key' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-zinc-500">
              Click <span className="font-semibold text-zinc-300">Generate Key</span> to get your dedicated OBS RTMP / WHIP server URL and key.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cloud Server-Side VOD Recording */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950/60 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <Cloud className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-white">Server-Side Cloud VOD Recording</p>
                <p className="text-[11px] text-zinc-400">
                  {cloudVodConfigured
                    ? 'Records directly on the media server even if your browser closes.'
                    : 'Requires S3/R2 storage env vars on server (Browser Record VOD works without setup).'}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={cloudVodBusy || (!cloudVodConfigured && !activeVodJob)}
              onClick={() => void handleToggleCloudVod()}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                activeVodJob
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cloudVodBusy ? '…' : activeVodJob ? 'Stop Cloud VOD' : 'Start Cloud VOD'}
            </button>
          </div>

          {/* Multi-Platform Restreaming */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-zinc-200">
                Multi-Stream Destinations ({destinations.length})
              </p>
              <button
                type="button"
                disabled={restreamBusy || (!activeRestreamJob && destinations.length === 0)}
                onClick={() => void handleToggleRestream()}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                  activeRestreamJob
                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {activeRestreamJob ? <Square className="h-3 w-3" /> : <Cast className="h-3.5 w-3.5" />}
                {restreamBusy ? 'Working…' : activeRestreamJob ? 'Stop Multi-Stream' : 'Go Live to All Destinations'}
              </button>
            </div>

            {destinations.length > 0 && (
              <div className="space-y-1.5">
                {destinations.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-white">{d.label}</span>
                      <span className="ml-2 text-[11px] text-zinc-400">
                        {d.rtmpUrl} · {d.streamKeyMasked}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteDestination(d.id)}
                      className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddDestination} className="grid gap-2 pt-1 sm:grid-cols-12">
              <select
                value={newPlatform}
                onChange={(e) => {
                  const p = e.target.value as keyof typeof PLATFORM_PRESETS;
                  setNewPlatform(p);
                  setNewLabel(PLATFORM_PRESETS[p].label);
                  setNewRtmpUrl(PLATFORM_PRESETS[p].rtmpUrl);
                }}
                className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-2 text-xs text-white sm:col-span-3"
              >
                <option value="youtube">YouTube Live</option>
                <option value="twitch">Twitch</option>
                <option value="kick">Kick</option>
                <option value="facebook">Facebook Live</option>
                <option value="custom">Custom RTMP</option>
              </select>
              <input
                value={newRtmpUrl}
                onChange={(e) => setNewRtmpUrl(e.target.value)}
                required
                placeholder="rtmp://..."
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 sm:col-span-4"
              />
              <input
                type="password"
                value={newStreamKey}
                onChange={(e) => setNewStreamKey(e.target.value)}
                required
                placeholder="Destination stream key"
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 sm:col-span-3"
              />
              <button
                type="submit"
                disabled={addingDest}
                className="inline-flex items-center justify-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 sm:col-span-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
