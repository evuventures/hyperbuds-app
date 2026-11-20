'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import {
  Room,
  RoomEvent,
  Track,
  VideoPresets,
  createLocalVideoTrack,
  type LocalVideoTrack,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  type LocalTrackPublication,
} from 'livekit-client';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Gamepad2,
  Hash,
  LayoutGrid,
  LogOut,
  Mic,
  MicOff,
  MonitorUp,
  PictureInPicture2,
  Play,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Users,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';

interface StreamDetail {
  _id?: string;
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  playbackUrl?: string;
  ingestUrl?: string;
  viewersCurrent?: number;
  viewersPeak?: number;
  chatEnabled?: boolean;
  recordingEnabled?: boolean;
}

interface LiveKitTokenPayload {
  token: string;
  url: string;
  roomName: string;
  role: 'host' | 'viewer';
  identity: string;
  name: string;
}

interface VideoTile {
  id: string;
  identity: string;
  name: string;
  isLocal: boolean;
  isScreen: boolean;
  isConsole?: boolean;
  track: Track;
}

const CAPTURE_CARD_RE =
  /elgato|capture|hdmi|cam\s*link|avermedia|usb\s*video|game|uvc|evga|ripsaw|magewell|blackmagic|atem/i;

function isCaptureCardLabel(label: string): boolean {
  return CAPTURE_CARD_RE.test(label || '');
}

interface StreamChatItem {
  id: string;
  senderName: string;
  message: string;
  createdAt?: string;
}

function formatChatTime(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function VideoTrackView({
  tile,
  compact = false,
}: {
  tile: VideoTile;
  compact?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    tile.track.attach(el);
    return () => {
      tile.track.detach(el);
    };
  }, [tile.track]);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-[#090b0f] ${
        compact
          ? 'rounded-xl shadow-2xl ring-2 ring-purple-400/70'
          : 'rounded-lg ring-1 ring-white/10'
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={tile.isLocal}
        className={`h-full w-full ${tile.isScreen ? 'object-contain bg-black' : 'object-cover'}`}
      />
      <div
        className={`absolute flex items-center gap-1.5 rounded-md bg-black/75 font-medium text-zinc-100 ring-1 ring-white/10 backdrop-blur-xs ${
          compact ? 'bottom-1.5 left-1.5 px-1.5 py-0.5 text-[10px]' : 'bottom-2.5 left-2.5 px-2 py-1 text-[11px]'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="max-w-[120px] truncate">
          {tile.name}
          {tile.isLocal && !compact ? ' · Host' : ''}
        </span>
        {tile.isConsole ? (
          <span className="rounded bg-purple-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-purple-200">
            Console
          </span>
        ) : tile.isScreen ? (
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-zinc-200">
            Screen
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function StreamingRoomPage() {
  const params = useParams<{ id: string }>();
  const streamId = params?.id;

  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LiveKit state
  const roomRef = useRef<Room | null>(null);
  const consoleTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [lkRole, setLkRole] = useState<'host' | 'viewer' | null>(null);
  const [lkConnected, setLkConnected] = useState(false);
  const [lkConnecting, setLkConnecting] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [consoleEnabled, setConsoleEnabled] = useState(false);
  const [consoleBusy, setConsoleBusy] = useState(false);
  const [videoTiles, setVideoTiles] = useState<VideoTile[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Console / Gaming Mode & Device selector state
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamId, setSelectedCamId] = useState('');
  const [selectedMicId, setSelectedMicId] = useState('');
  const [selectedConsoleCamId, setSelectedConsoleCamId] = useState('');
  const [layoutMode, setLayoutMode] = useState<'pip' | 'grid'>('pip');
  const [showConsolePanel, setShowConsolePanel] = useState(false);
  const [consoleGuideTab, setConsoleGuideTab] = useState<'capture' | 'remoteplay'>('capture');

  // Live chat state
  const [chatMessages, setChatMessages] = useState<StreamChatItem[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages.length]);

  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');
      setVideoDevices(cams);
      setAudioDevices(mics);

      const captureCard = cams.find((d) => isCaptureCardLabel(d.label));
      const regularCam = cams.find((d) => !isCaptureCardLabel(d.label)) || cams[0];
      if (regularCam && !selectedCamId) setSelectedCamId(regularCam.deviceId);
      if (mics[0] && !selectedMicId) setSelectedMicId(mics[0].deviceId);
      if (captureCard) {
        setSelectedConsoleCamId((prev) => prev || captureCard.deviceId);
      } else if (cams.length > 1) {
        setSelectedConsoleCamId((prev) => prev || cams[1].deviceId);
      } else if (cams[0]) {
        setSelectedConsoleCamId((prev) => prev || cams[0].deviceId);
      }
    } catch {
      // Device enumeration unavailable before permissions
    }
  }, [selectedCamId, selectedMicId]);

  useEffect(() => {
    void refreshDevices();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.addEventListener) return;
    const handler = () => void refreshDevices();
    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handler);
    };
  }, [refreshDevices]);

  const rebuildTiles = useCallback((room: Room) => {
    const tiles: VideoTile[] = [];
    const local = room.localParticipant;
    local.videoTrackPublications.forEach((pub: LocalTrackPublication) => {
      if (pub.track && !pub.isMuted) {
        const isConsole = pub.trackName === 'console-feed';
        tiles.push({
          id: `local-${pub.trackSid || pub.trackName || pub.source}`,
          identity: local.identity,
          name: isConsole ? 'PlayStation / Console' : local.name || 'Host',
          isLocal: true,
          isScreen: pub.source === Track.Source.ScreenShare || isConsole,
          isConsole,
          track: pub.track,
        });
      }
    });
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      p.videoTrackPublications.forEach((pub: RemoteTrackPublication) => {
        if (pub.track && pub.isSubscribed) {
          const isConsole = pub.trackName === 'console-feed';
          tiles.push({
            id: `${p.identity}-${pub.trackSid}`,
            identity: p.identity,
            name: isConsole ? `${p.name || p.identity} · Console` : p.name || p.identity,
            isLocal: false,
            isScreen: pub.source === Track.Source.ScreenShare || isConsole,
            isConsole,
            track: pub.track,
          });
        }
      });
    });
    setVideoTiles(tiles);
    setParticipantCount(room.remoteParticipants.size + 1);
  }, []);

  const disconnectLiveKit = useCallback(() => {
    if (consoleTrackRef.current) {
      try {
        consoleTrackRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      consoleTrackRef.current = null;
    }
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = '';
    }
    setLkConnected(false);
    setCamEnabled(false);
    setMicEnabled(false);
    setScreenEnabled(false);
    setConsoleEnabled(false);
    setVideoTiles([]);
    setParticipantCount(0);
  }, []);

  const connectLiveKit = useCallback(async () => {
    if (!streamId || roomRef.current || lkConnecting) return;
    setLkConnecting(true);
    setError(null);
    try {
      const tokenRes = await apiClient.post<LiveKitTokenPayload>(`/streaming/streams/${streamId}/token`);
      const { token, url, role } = tokenRes.data;
      setLkRole(role);

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      const sync = () => rebuildTiles(room);
      room.on(RoomEvent.ParticipantConnected, sync);
      room.on(RoomEvent.ParticipantDisconnected, sync);
      room.on(RoomEvent.LocalTrackPublished, sync);
      room.on(RoomEvent.LocalTrackUnpublished, sync);
      room.on(RoomEvent.TrackMuted, sync);
      room.on(RoomEvent.TrackUnmuted, sync);
      room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio && audioContainerRef.current) {
          const el = track.attach();
          audioContainerRef.current.appendChild(el);
        }
        sync();
      });
      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        track.detach().forEach((el) => el.remove());
        sync();
      });
      room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
        try {
          const parsed = JSON.parse(new TextDecoder().decode(payload)) as {
            type?: string;
            id?: string;
            senderName?: string;
            message?: string;
            createdAt?: string;
          };
          if (parsed?.type === 'chat' && typeof parsed.message === 'string' && parsed.message.trim()) {
            const msgText = parsed.message;
            setChatMessages((prev) => [
              ...prev,
              {
                id: parsed.id || `${Date.now()}-${Math.random()}`,
                senderName: parsed.senderName || participant?.name || 'Viewer',
                message: msgText,
                createdAt: parsed.createdAt || new Date().toISOString(),
              },
            ]);
          }
        } catch {
          // Ignore non-JSON packets
        }
      });
      room.on(RoomEvent.Disconnected, () => {
        setLkConnected(false);
        setVideoTiles([]);
        setParticipantCount(0);
      });

      await room.connect(url, token);
      setLkConnected(true);
      sync();

      if (role === 'host') {
        try {
          await room.localParticipant.setCameraEnabled(true);
          setCamEnabled(true);
        } catch {
          // Camera permission may be denied or absent
        }
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          setMicEnabled(true);
        } catch {
          // Mic permission may be denied or absent
        }
        void refreshDevices();
        sync();
      }
    } catch (err) {
      disconnectLiveKit();
      setError((err as { message?: string })?.message || 'Unable to connect to LiveKit media room.');
    } finally {
      setLkConnecting(false);
    }
  }, [streamId, lkConnecting, rebuildTiles, disconnectLiveKit, refreshDevices]);

  useEffect(() => {
    if (!streamId) return;
    let active = true;
    (async () => {
      try {
        const [streamRes, chatRes] = await Promise.all([
          apiClient.get(`/streaming/streams/${streamId}`),
          apiClient.get(`/streaming/streams/${streamId}/chat`).catch(() => null),
        ]);
        if (!active) return;
        const s = streamRes.data?.stream ?? null;
        setStream(s);
        if (Array.isArray(chatRes?.data?.messages)) {
          setChatMessages(
            chatRes.data.messages.map(
              (m: { _id?: string; id?: string; senderName?: string; message?: string; createdAt?: string }) => ({
                id: m._id || m.id || String(Math.random()),
                senderName: m.senderName || 'Viewer',
                message: m.message || '',
                createdAt: m.createdAt,
              }),
            ),
          );
        }
      } catch (err) {
        if (active) {
          setError((err as { message?: string })?.message || 'Unable to load stream room.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      disconnectLiveKit();
    };
  }, [streamId, disconnectLiveKit]);

  const handleAction = async (action: 'start' | 'end') => {
    if (!streamId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiClient.put(`/streaming/streams/${streamId}/${action}`);
      if (res.data?.stream) setStream(res.data.stream);
      if (action === 'start' && !lkConnected) {
        await connectLiveKit();
      } else if (action === 'end') {
        disconnectLiveKit();
      }
    } catch (err) {
      setError((err as { message?: string })?.message || `Unable to ${action} stream.`);
    } finally {
      setBusy(false);
    }
  };

  const toggleCamera = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !camEnabled;
    try {
      await room.localParticipant.setCameraEnabled(next);
      setCamEnabled(next);
      rebuildTiles(room);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Camera access denied.');
    }
  };

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    try {
      await room.localParticipant.setMicrophoneEnabled(next);
      setMicEnabled(next);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Microphone access denied.');
    }
  };

  const stopConsoleFeed = async () => {
    const room = roomRef.current;
    const track = consoleTrackRef.current;
    if (track) {
      if (room) {
        try {
          await room.localParticipant.unpublishTrack(track, true);
        } catch {
          // Ignore unpublish error
        }
      }
      try {
        track.stop();
      } catch {
        // Ignore stop error
      }
      consoleTrackRef.current = null;
    }
    setConsoleEnabled(false);
    if (room) rebuildTiles(room);
  };

  const toggleScreen = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !screenEnabled;
    try {
      if (next && consoleEnabled) {
        await stopConsoleFeed();
      }
      await room.localParticipant.setScreenShareEnabled(next, { audio: true });
      setScreenEnabled(next);
      rebuildTiles(room);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Screen share cancelled or unavailable.');
    }
  };

  const toggleConsoleFeed = async () => {
    const room = roomRef.current;
    if (!room || consoleBusy) return;
    if (consoleEnabled) {
      setConsoleBusy(true);
      try {
        await stopConsoleFeed();
      } finally {
        setConsoleBusy(false);
      }
      return;
    }

    if (!selectedConsoleCamId) {
      setError('Select a Capture Card or second camera first.');
      setShowConsolePanel(true);
      return;
    }

    setConsoleBusy(true);
    setError(null);
    try {
      if (screenEnabled) {
        await room.localParticipant.setScreenShareEnabled(false).catch(() => {});
        setScreenEnabled(false);
      }
      let track: LocalVideoTrack;
      try {
        track = await createLocalVideoTrack({
          deviceId: { exact: selectedConsoleCamId },
          resolution: VideoPresets.h1080.resolution,
          frameRate: 60,
        });
      } catch {
        track = await createLocalVideoTrack({
          deviceId: selectedConsoleCamId,
        });
      }
      await room.localParticipant.publishTrack(track, {
        source: Track.Source.ScreenShare,
        name: 'console-feed',
        simulcast: true,
      });
      consoleTrackRef.current = track;
      setConsoleEnabled(true);
      setLayoutMode('pip');
      rebuildTiles(room);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ||
          'Unable to start Console / Capture Card video feed. Make sure no other app is locking the capture card.',
      );
    } finally {
      setConsoleBusy(false);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCamId(deviceId);
    const room = roomRef.current;
    if (!room || !deviceId) return;
    try {
      await room.switchActiveDevice('videoinput', deviceId);
      rebuildTiles(room);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Unable to switch facecam device.');
    }
  };

  const switchMic = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    const room = roomRef.current;
    if (!room || !deviceId) return;
    try {
      await room.switchActiveDevice('audioinput', deviceId);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Unable to switch microphone device.');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatDraft.trim();
    if (!text || !streamId || sendingChat) return;
    setSendingChat(true);
    try {
      await apiClient.post(`/streaming/streams/${streamId}/chat`, { message: text });
      const msgObj: StreamChatItem = {
        id: `${Date.now()}`,
        senderName: roomRef.current?.localParticipant?.name || 'You',
        message: text,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, msgObj]);
      setChatDraft('');
      if (roomRef.current?.localParticipant) {
        const encoded = new TextEncoder().encode(JSON.stringify({ type: 'chat', ...msgObj }));
        await roomRef.current.localParticipant.publishData(encoded, { reliable: true }).catch(() => {});
      }
    } catch (err) {
      setError((err as { message?: string })?.message || 'Unable to post chat message.');
    } finally {
      setSendingChat(false);
    }
  };

  const copyShareUrl = async () => {
    if (typeof window === 'undefined') return;
    await navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#f8f9fb] dark:bg-[#090b0f]">
        <div ref={audioContainerRef} className="hidden" />

        <div className="mx-auto max-w-7xl px-4 py-5 pb-20 sm:px-6 lg:px-8">
          {/* Linear-style Compact Top Navigation & Studio Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5 dark:border-zinc-800/90">
            <div className="flex items-center gap-3">
              <Link
                href="/streaming"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Studio
              </Link>
              <span className="text-slate-300 dark:text-zinc-700">/</span>
              <span className="truncate text-xs font-medium text-slate-600 dark:text-zinc-400">
                {stream?.title || 'Broadcast Room'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={copyShareUrl}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? 'Link copied' : 'Invite link'}
              </button>

              {stream && !lkConnected && stream.status !== 'ended' && stream.status !== 'cancelled' && (
                <button
                  type="button"
                  disabled={lkConnecting}
                  onClick={connectLiveKit}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Radio className="h-3.5 w-3.5" />
                  {lkConnecting ? 'Connecting...' : 'Enter studio'}
                </button>
              )}

              {stream?.status === 'scheduled' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction('start')}
                  className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Go live
                </button>
              )}

              {stream?.status === 'live' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction('end')}
                  className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                >
                  <Square className="h-3 w-3 fill-current" />
                  End broadcast
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-8" />
              <div className="h-[520px] animate-pulse rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-4" />
            </div>
          ) : stream ? (
            <div className="mt-4 space-y-4">
              {/* Compact Metadata Strip (Linear + Riverside status telemetry) */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 dark:border-zinc-800 dark:bg-[#111318]">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      stream.status === 'live'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        stream.status === 'live' ? 'animate-pulse bg-rose-500' : 'bg-slate-400 dark:bg-zinc-500'
                      }`}
                    />
                    {stream.status}
                  </span>

                  <h1 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 sm:text-base">
                    {stream.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    {lkConnected ? (
                      <>
                        <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          WebRTC live ({lkRole})
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3.5 w-3.5" />
                        <span>Standby</span>
                      </>
                    )}
                  </span>
                  <span className="h-3.5 w-px bg-slate-200 dark:bg-zinc-800" />
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Users className="h-3.5 w-3.5" />
                    {lkConnected ? participantCount : stream.viewersCurrent ?? 0} in room
                  </span>
                  {stream.recordingEnabled && (
                    <>
                      <span className="h-3.5 w-px bg-slate-200 dark:bg-zinc-800" />
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-300">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Recording consented
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Main Studio Workspace: Riverside Stage + Discord Chat */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* Broadcast Stage */}
                <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#0d1015] dark:border-zinc-800 lg:col-span-8">
                  <div className="flex-1 p-3 sm:p-4">
                    {videoTiles.length > 0 ? (() => {
                      const primaryStageTile = videoTiles.find((t) => t.isConsole || t.isScreen) ?? null;
                      const cameraTiles = primaryStageTile
                        ? videoTiles.filter((t) => t.id !== primaryStageTile.id)
                        : videoTiles;
                      const usePipLayout = Boolean(
                        layoutMode === 'pip' && primaryStageTile && cameraTiles.length > 0,
                      );

                      if (usePipLayout && primaryStageTile) {
                        return (
                          <div className="relative" data-testid="gaming-pip-stage">
                            <VideoTrackView tile={primaryStageTile} />
                            <div className="pointer-events-auto absolute bottom-3 right-3 z-20 flex flex-col gap-2">
                              {cameraTiles.map((camTile) => (
                                <div key={camTile.id} className="w-32 sm:w-44 md:w-52">
                                  <VideoTrackView tile={camTile} compact />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          className={`grid gap-3 ${
                            videoTiles.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                          }`}
                        >
                          {videoTiles.map((tile) => (
                            <VideoTrackView key={tile.id} tile={tile} />
                          ))}
                        </div>
                      );
                    })() : (
                      <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-zinc-800/90 bg-[#12151c] px-6 py-8 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200">
                          <Radio className="h-5 w-5" />
                        </div>
                        <p className="mt-3.5 text-sm font-semibold text-zinc-100">
                          {lkConnected
                            ? lkRole === 'host'
                              ? 'Studio connected · Camera muted'
                              : 'Connected · Waiting for host video feed'
                            : 'Studio Green Room'}
                        </p>
                        <p className="mt-1 max-w-md text-xs text-zinc-400">
                          {stream.description ||
                            'Check your audio and video tracks, or connect your PlayStation / Console before entering the broadcast stage.'}
                        </p>

                        {/* Riverside-style Pre-Flight Readiness Strip */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-400">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1">
                            {lkConnected ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            Media server
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1">
                            {micEnabled ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            Microphone
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1">
                            {camEnabled ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-zinc-600" />
                            )}
                            Camera
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1">
                            {consoleEnabled || screenEnabled ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                            ) : (
                              <Gamepad2 className="h-3.5 w-3.5 text-zinc-500" />
                            )}
                            Console / Capture
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                          {!lkConnected && stream.status !== 'ended' && stream.status !== 'cancelled' && (
                            <button
                              type="button"
                              disabled={lkConnecting}
                              onClick={connectLiveKit}
                              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
                            >
                              <Radio className="h-3.5 w-3.5" />
                              {lkConnecting ? 'Connecting to studio...' : 'Join Broadcast Room'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowConsolePanel((prev) => !prev)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-600/15 px-3.5 py-2 text-xs font-semibold text-purple-200 transition hover:bg-purple-600/25"
                          >
                            <Gamepad2 className="h-3.5 w-3.5" />
                            Connect PlayStation / Console
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collapsible PlayStation / Console Gaming Mode & Device Deck */}
                  {showConsolePanel && (
                    <div
                      data-testid="console-setup-panel"
                      className="border-t border-zinc-800 bg-[#12151e] px-4 py-3.5 text-xs text-zinc-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/90 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600/25 text-purple-300">
                            <Gamepad2 className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="font-semibold text-zinc-100">
                              PlayStation / Console Gaming Setup &amp; Devices
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Stream PS5, PS4, Xbox, or Switch gameplay with your Facecam overlay — no OBS required.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void refreshDevices()}
                            title="Refresh connected cameras & capture cards"
                            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Refresh devices
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConsolePanel(false)}
                            aria-label="Close console panel"
                            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Guide Tabs: USB HDMI Capture Card vs Free PS Remote Play */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setConsoleGuideTab('capture')}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                            consoleGuideTab === 'capture'
                              ? 'bg-purple-600 text-white'
                              : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <SlidersHorizontal className="h-3 w-3" />
                          USB HDMI Capture Card (1080p60 + Dual Cam)
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsoleGuideTab('remoteplay')}
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                            consoleGuideTab === 'remoteplay'
                              ? 'bg-purple-600 text-white'
                              : 'border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <MonitorUp className="h-3 w-3" />
                          Free ($0): PS Remote Play
                        </button>
                      </div>

                      {consoleGuideTab === 'capture' ? (
                        <div className="mt-3 space-y-3">
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium text-zinc-400">
                                Console / Capture Card (2nd Camera)
                              </span>
                              <select
                                value={selectedConsoleCamId}
                                onChange={(e) => setSelectedConsoleCamId(e.target.value)}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-purple-500"
                              >
                                {videoDevices.length === 0 ? (
                                  <option value="">Join room to detect devices</option>
                                ) : (
                                  videoDevices.map((d, idx) => (
                                    <option key={d.deviceId || idx} value={d.deviceId}>
                                      {isCaptureCardLabel(d.label) ? '🎮 ' : ''}
                                      {d.label || `Video Device ${idx + 1}`}
                                    </option>
                                  ))
                                )}
                              </select>
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium text-zinc-400">
                                Host Facecam
                              </span>
                              <select
                                value={selectedCamId}
                                onChange={(e) => void switchCamera(e.target.value)}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-purple-500"
                              >
                                {videoDevices.length === 0 ? (
                                  <option value="">Default camera</option>
                                ) : (
                                  videoDevices.map((d, idx) => (
                                    <option key={d.deviceId || idx} value={d.deviceId}>
                                      {d.label || `Camera ${idx + 1}`}
                                    </option>
                                  ))
                                )}
                              </select>
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-[11px] font-medium text-zinc-400">
                                Microphone / Headset
                              </span>
                              <select
                                value={selectedMicId}
                                onChange={(e) => void switchMic(e.target.value)}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-purple-500"
                              >
                                {audioDevices.length === 0 ? (
                                  <option value="">Default microphone</option>
                                ) : (
                                  audioDevices.map((d, idx) => (
                                    <option key={d.deviceId || idx} value={d.deviceId}>
                                      {d.label || `Microphone ${idx + 1}`}
                                    </option>
                                  ))
                                )}
                              </select>
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                            <p className="text-[11px] text-zinc-400">
                              Plug your PS5/PS4/Xbox HDMI into a USB capture card (Elgato, Cam Link, or UVC HDMI). Select it above and launch your dual-camera gameplay feed.
                            </p>
                            {lkConnected && lkRole === 'host' ? (
                              <button
                                type="button"
                                disabled={consoleBusy}
                                onClick={() => void toggleConsoleFeed()}
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                                  consoleEnabled
                                    ? 'bg-rose-600 text-white hover:bg-rose-500'
                                    : 'bg-purple-600 text-white hover:bg-purple-500'
                                } disabled:opacity-50`}
                              >
                                <Gamepad2 className="h-3.5 w-3.5" />
                                {consoleBusy
                                  ? 'Starting...'
                                  : consoleEnabled
                                    ? 'Stop Console Feed'
                                    : 'Start Console Feed'}
                              </button>
                            ) : (
                              <span className="text-[11px] font-medium text-purple-300">
                                Join the Broadcast Room as Host to start Console Feed
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2.5 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                          <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed text-zinc-300">
                            <li>
                              Open Sony&apos;s free <span className="font-semibold text-white">PS Remote Play</span> app on your Mac/PC and connect to your PS4 or PS5.
                            </li>
                            <li>
                              Click <span className="font-semibold text-white">Share PS Screen</span> below, pick the <span className="font-semibold text-white">PS Remote Play</span> window, and enable <span className="font-semibold text-white">Share audio</span>.
                            </li>
                            <li>
                              Keep your camera &amp; mic enabled — HyperBuds automatically switches to full-screen gameplay with your Facecam docked in Picture-in-Picture!
                            </li>
                          </ol>
                          {lkConnected && lkRole === 'host' && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => void toggleScreen()}
                                className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500"
                              >
                                <MonitorUp className="h-3.5 w-3.5" />
                                {screenEnabled ? 'Stop Sharing PS Screen' : 'Share PS Screen (with Audio)'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Docked Riverside-style Studio Control Deck */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/90 bg-[#111318] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {lkConnected && lkRole === 'host' ? (
                        <>
                          <button
                            type="button"
                            onClick={toggleMic}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                              micEnabled
                                ? 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                                : 'border-rose-700/70 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30'
                            }`}
                          >
                            {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                            {micEnabled ? 'Mic' : 'Muted'}
                          </button>
                          <button
                            type="button"
                            onClick={toggleCamera}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                              camEnabled
                                ? 'border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                                : 'border-rose-700/70 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30'
                            }`}
                          >
                            {camEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                            {camEnabled ? 'Camera' : 'Cam Off'}
                          </button>
                          <button
                            type="button"
                            onClick={toggleScreen}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                              screenEnabled
                                ? 'border-emerald-600/60 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                            }`}
                          >
                            <MonitorUp className="h-3.5 w-3.5" />
                            {screenEnabled ? 'Sharing screen' : 'Share screen'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConsolePanel((prev) => !prev)}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                              consoleEnabled || showConsolePanel
                                ? 'border-purple-500/70 bg-purple-600/25 text-purple-200 hover:bg-purple-600/35'
                                : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                            }`}
                          >
                            <Gamepad2 className="h-3.5 w-3.5" />
                            {consoleEnabled ? 'Console Live' : 'Console / PS5'}
                          </button>
                          {videoTiles.some((t) => t.isScreen || t.isConsole) && videoTiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLayoutMode((prev) => (prev === 'pip' ? 'grid' : 'pip'))}
                              title="Switch between Gaming PiP overlay and side-by-side grid"
                              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
                            >
                              {layoutMode === 'pip' ? (
                                <>
                                  <PictureInPicture2 className="h-3.5 w-3.5 text-purple-400" />
                                  PiP Gaming
                                </>
                              ) : (
                                <>
                                  <LayoutGrid className="h-3.5 w-3.5 text-zinc-300" />
                                  Grid
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-zinc-500">
                            {lkConnected
                              ? 'Viewer mode · Subscribed to host tracks'
                              : 'Click Join Broadcast Room to connect audio & video'}
                          </span>
                          {videoTiles.some((t) => t.isScreen || t.isConsole) && videoTiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLayoutMode((prev) => (prev === 'pip' ? 'grid' : 'pip'))}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700"
                            >
                              {layoutMode === 'pip' ? (
                                <>
                                  <PictureInPicture2 className="h-3 w-3 text-purple-400" />
                                  PiP
                                </>
                              ) : (
                                <>
                                  <LayoutGrid className="h-3 w-3" />
                                  Grid
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {lkConnected && (
                      <button
                        type="button"
                        onClick={disconnectLiveKit}
                        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-zinc-800"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Leave
                      </button>
                    )}
                  </div>
                </section>

                {/* Discord-style Separated Live Chat Sidebar */}
                <aside className="flex h-[500px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#111318] lg:col-span-4 lg:h-auto lg:min-h-[520px]">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                        live-chat
                      </h2>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {chatMessages.length} msgs
                    </span>
                  </div>

                  <div className="flex-1 divide-y divide-slate-100 overflow-y-auto px-4 py-2 text-xs dark:divide-zinc-800/60">
                    {chatMessages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-zinc-500">
                        <Hash className="mb-2 h-6 w-6 opacity-50" />
                        <p className="font-medium">Welcome to #live-chat</p>
                        <p className="mt-0.5 text-[11px]">Messages sync in real time with everyone in the room.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="py-2.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-zinc-100">
                              {msg.senderName}
                            </span>
                            {msg.createdAt && (
                              <span className="text-[10px] tabular-nums text-slate-400 dark:text-zinc-500">
                                {formatChatTime(msg.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 leading-relaxed text-slate-700 dark:text-zinc-300">
                            {msg.message}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {stream.chatEnabled !== false && (
                    <form
                      onSubmit={handleSendChat}
                      className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-[#0d1015]"
                    >
                      <input
                        type="text"
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        placeholder="Message #live-chat"
                        className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
                      />
                      <button
                        type="submit"
                        disabled={!chatDraft.trim() || sendingChat}
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        aria-label="Send message"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  )}
                </aside>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
