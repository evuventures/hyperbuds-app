'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { uploadStudioMediaToCloudinary } from '@/lib/api/feed.api';
import { useAuth } from '@/hooks/auth/useAuth';
import toast from 'react-hot-toast';
import {
  StageOverlays,
  type FloatingReaction,
  type StudioOverlayState,
} from '@/components/streaming/studio/StageOverlays';
import { GreenRoomPreview } from '@/components/streaming/studio/GreenRoomPreview';
import {
  LiveChatPanel,
  type StreamPollItem,
} from '@/components/streaming/studio/LiveChatPanel';
import { StudioControlsDrawer } from '@/components/streaming/studio/StudioControlsDrawer';
import { BroadcastInfraDrawer } from '@/components/streaming/studio/BroadcastInfraDrawer';
import {
  PendingCohostCard,
  type PendingCohostRequest,
} from '@/components/streaming/studio/PendingCohostCard';
import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '@/config/baseUrl';
import { getAccessToken } from '@/store/authSelectors';
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
  BarChart2,
  Cast,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Disc,
  Film,
  Gamepad2,
  Hash,
  Layers,
  LayoutGrid,
  Link2,
  Loader2,
  LogOut,
  Maximize2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  PictureInPicture2,
  Play,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Trash2,
  Type,
  UserPlus,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
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
  recordingUrl?: string | null;
  viewersCurrent?: number;
  viewersPeak?: number;
  chatEnabled?: boolean;
  recordingEnabled?: boolean;
}

interface LiveKitTokenPayload {
  token: string;
  url: string;
  roomName: string;
  role: 'host' | 'cohost' | 'viewer';
  identity: string;
  name: string;
}

interface StreamCohost {
  id: string;
  streamId: string;
  userId: string;
  username?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  status: string;
  createdAt?: string;
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
  userId?: string;
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
  const { user } = useAuth();

  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LiveKit state
  const roomRef = useRef<Room | null>(null);
  const consoleTrackRef = useRef<LocalVideoTrack | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [lkRole, setLkRole] = useState<'host' | 'cohost' | 'viewer' | null>(null);
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

  // Co-Host Invites & Pending Requests state
  const [cohosts, setCohosts] = useState<StreamCohost[]>([]);
  const [showCohostPanel, setShowCohostPanel] = useState(false);
  const [cohostUsername, setCohostUsername] = useState('');
  const [cohostBusy, setCohostBusy] = useState(false);
  const [cohostNotice, setCohostNotice] = useState<string | null>(null);
  const [pendingActionUserId, setPendingActionUserId] = useState<string | null>(null);
  const [viewerRequestStatus, setViewerRequestStatus] = useState<'idle' | 'pending' | 'admitted'>('idle');
  const [stageVolume, setStageVolume] = useState(85);
  const heroStageRef = useRef<HTMLDivElement | null>(null);

  // Browser-Side VOD Recording state
  const [isRecordingVod, setIsRecordingVod] = useState(false);
  const [vodSeconds, setVodSeconds] = useState(0);
  const [vodUploading, setVodUploading] = useState(false);
  const [vodNotice, setVodNotice] = useState<string | null>(null);
  const vodRecorderRef = useRef<MediaRecorder | null>(null);
  const vodChunksRef = useRef<BlobPart[]>([]);
  const vodTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vodFallbackStreamRef = useRef<MediaStream | null>(null);

  // Derived role helpers
  const currentUserId = user?._id || (user as { id?: string } | null)?.id || null;
  const isStreamHost = Boolean(
    lkRole === 'host' || (stream?.userId && currentUserId && stream.userId === currentUserId),
  );
  const canPublish = lkRole === 'host' || lkRole === 'cohost';

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

  // Phase 1 Broadcast Studio state (overlays, polls, reactions, backstage stage queue)
  const [studioState, setStudioState] = useState<StudioOverlayState>({
    lowerThirdText: '',
    lowerThirdSubtext: '',
    lowerThirdVisible: false,
    pinnedMessage: null,
    layoutMode: 'pip',
    stageUserIds: [],
    slowModeSeconds: 0,
  });
  const [activePoll, setActivePoll] = useState<StreamPollItem | null>(null);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [activeStudioDrawer, setActiveStudioDrawer] = useState<'overlays' | 'poll' | 'backstage' | 'infra' | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'reconnecting'>('good');

  const spawnFloatingReaction = useCallback((emoji: string, id?: string) => {
    const rid = id || `${Date.now()}-${Math.random()}`;
    const offsetX = 12 + Math.floor(Math.random() * 68);
    setFloatingReactions((prev) => [...prev.slice(-18), { id: rid, emoji, offsetX }]);
    window.setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== rid));
    }, 2500);
  }, []);

  const handleUpdateStudioState = useCallback(
    async (patch: Partial<StudioOverlayState>) => {
      if (!streamId) return;
      try {
        const res = await apiClient.put(`/streaming/streams/${streamId}/studio-state`, patch);
        if (res.data?.studioState) {
          setStudioState((prev) => ({ ...prev, ...res.data.studioState }));
        }
      } catch (err) {
        toast.error((err as { message?: string })?.message || 'Could not update studio overlays');
      }
    },
    [streamId],
  );

  const handleSendReaction = useCallback(
    async (emoji: string) => {
      if (!streamId) return;
      spawnFloatingReaction(emoji);
      await apiClient.post(`/streaming/streams/${streamId}/reactions`, { emoji }).catch(() => null);
    },
    [streamId, spawnFloatingReaction],
  );

  const handleCreatePoll = useCallback(
    async (question: string, options: string[]) => {
      if (!streamId) return;
      try {
        const res = await apiClient.post(`/streaming/streams/${streamId}/polls`, { question, options });
        if (res.data?.poll) setActivePoll(res.data.poll);
        toast.success('Live poll launched!');
      } catch (err) {
        toast.error((err as { message?: string })?.message || 'Could not create poll');
      }
    },
    [streamId],
  );

  const handleVotePoll = useCallback(
    async (pollId: string, optionIndex: number) => {
      if (!streamId) return;
      try {
        const res = await apiClient.post(`/streaming/streams/${streamId}/polls/${pollId}/vote`, { optionIndex });
        if (res.data?.poll) setActivePoll(res.data.poll);
      } catch (err) {
        toast.error((err as { message?: string })?.message || 'Could not vote');
      }
    },
    [streamId],
  );

  const handleClosePoll = useCallback(
    async (pollId: string) => {
      if (!streamId) return;
      await apiClient.put(`/streaming/streams/${streamId}/polls/${pollId}/close`).catch(() => null);
      setActivePoll(null);
    },
    [streamId],
  );

  const handleSendSuperChat = useCallback(
    async (amountCredits: number, message: string) => {
      if (!streamId) return;
      try {
        await apiClient.post(`/streaming/streams/${streamId}/super-chat`, { amountCredits, message });
        toast.success(`Sent ${amountCredits} cr Super Chat!`);
      } catch (err) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Could not send Super Chat';
        toast.error(msg);
      }
    },
    [streamId],
  );

  const handleDeleteChatMessage = useCallback(
    async (messageId: string) => {
      if (!streamId) return;
      await apiClient.delete(`/streaming/streams/${streamId}/chat/${messageId}`).catch(() => null);
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
    },
    [streamId],
  );

  const handleMuteChatUser = useCallback(
    async (targetUserId: string) => {
      if (!streamId) return;
      await apiClient
        .post(`/streaming/streams/${streamId}/moderate-chat`, { action: 'mute', targetUserId })
        .catch(() => null);
      toast.success('User muted in stream chat.');
    },
    [streamId],
  );

  const handleToggleSlowMode = useCallback(
    async (seconds: number) => {
      if (!streamId) return;
      await apiClient
        .post(`/streaming/streams/${streamId}/moderate-chat`, { action: 'slow_mode', slowModeSeconds: seconds })
        .catch(() => null);
      setStudioState((prev) => ({ ...prev, slowModeSeconds: seconds }));
      toast.success(seconds > 0 ? `Slow mode set to ${seconds}s.` : 'Slow mode turned off.');
    },
    [streamId],
  );

  const pendingCohostRequests: PendingCohostRequest[] = cohosts
    .filter((c) => c.status === 'pending')
    .map((c) => ({
      userId: c.userId,
      displayName: c.displayName,
      username: c.username,
      avatar: c.avatar,
    }));

  const approvedCohosts = cohosts.filter((c) => c.status !== 'pending');

  const handleRequestToCohost = useCallback(async () => {
    if (!streamId || viewerRequestStatus === 'pending') return;
    try {
      await apiClient.post(`/streaming/streams/${streamId}/cohosts/request`);
      setViewerRequestStatus('pending');
      toast.success('Co-host request sent! Waiting for host to admit you.');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Could not send co-host request');
    }
  }, [streamId, viewerRequestStatus]);

  const handleAdmitCohost = useCallback(
    async (targetUserId: string) => {
      if (!streamId) return;
      setPendingActionUserId(targetUserId);
      try {
        await apiClient.post(`/streaming/streams/${streamId}/cohosts/${targetUserId}/admit`);
        setCohosts((prev) =>
          prev.map((c) => (c.userId === targetUserId ? { ...c, status: 'approved' } : c)),
        );
        toast.success('Co-host admitted to the stage!');
      } catch (err) {
        toast.error((err as { message?: string })?.message || 'Could not admit co-host');
      } finally {
        setPendingActionUserId(null);
      }
    },
    [streamId],
  );

  const handleDenyCohost = useCallback(
    async (targetUserId: string) => {
      if (!streamId) return;
      setPendingActionUserId(targetUserId);
      try {
        await apiClient.post(`/streaming/streams/${streamId}/cohosts/${targetUserId}/deny`);
        setCohosts((prev) => prev.filter((c) => c.userId !== targetUserId));
        toast.success('Request declined.');
      } catch (err) {
        toast.error((err as { message?: string })?.message || 'Could not decline request');
      } finally {
        setPendingActionUserId(null);
      }
    },
    [streamId],
  );

  useEffect(() => {
    if (!audioContainerRef.current) return;
    const audios = audioContainerRef.current.querySelectorAll('audio');
    const vol = Math.max(0, Math.min(1, stageVolume / 100));
    audios.forEach((el) => {
      el.volume = vol;
      el.muted = vol === 0;
    });
  }, [stageVolume, participantCount]);

  const handleToggleFullscreen = () => {
    const el = heroStageRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => null);
    } else {
      void el.requestFullscreen?.().catch(() => null);
    }
  };

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
            const msgId = parsed.id || `${Date.now()}-${Math.random()}`;
            const msgText = parsed.message;
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === msgId)) return prev;
              return [
                ...prev,
                {
                  id: msgId,
                  senderName: parsed.senderName || participant?.name || 'Viewer',
                  message: msgText,
                  createdAt: parsed.createdAt || new Date().toISOString(),
                },
              ];
            });
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

      if (role === 'host' || role === 'cohost') {
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
      setError((err as { message?: string })?.message || 'Unable to connect to the live studio room.');
    } finally {
      setLkConnecting(false);
    }
  }, [streamId, lkConnecting, rebuildTiles, disconnectLiveKit, refreshDevices]);

  useEffect(() => {
    if (!streamId) return;
    let active = true;
    let streamSocket: Socket | null = null;

    (async () => {
      try {
        const [streamRes, chatRes, cohostsRes] = await Promise.all([
          apiClient.get(`/streaming/streams/${streamId}`),
          apiClient.get(`/streaming/streams/${streamId}/chat`).catch(() => null),
          apiClient.get(`/streaming/streams/${streamId}/cohosts`).catch(() => null),
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
        if (Array.isArray(cohostsRes?.data?.cohosts)) {
          setCohosts(cohostsRes.data.cohosts);
        }

        // Track live viewer presence
        apiClient
          .post(`/streaming/streams/${streamId}/presence`, { action: 'join' })
          .then((res) => {
            if (!active) return;
            const vc = res.data?.viewersCurrent;
            const vp = res.data?.viewersPeak;
            if (typeof vc === 'number') {
              setStream((prev) => (prev ? { ...prev, viewersCurrent: vc, viewersPeak: vp ?? prev.viewersPeak } : prev));
            }
          })
          .catch(() => {});

        // Subscribe to real-time Socket.IO stream chat & viewer count updates
        const token = getAccessToken();
        if (token) {
          const socketUrl = process.env.NEXT_PUBLIC_API_URL ?? BASE_URL;
          streamSocket = io(socketUrl, {
            auth: { token },
            transports: ['polling', 'websocket'],
            reconnection: true,
          });
          streamSocket.on('connect', () => {
            streamSocket?.emit('join-stream', streamId);
          });
          streamSocket.on(
            'stream:viewers',
            (payload: { streamId?: string; viewersCurrent?: number; viewersPeak?: number }) => {
              if (!active || payload?.streamId !== streamId) return;
              if (typeof payload.viewersCurrent === 'number') {
                setStream((prev) =>
                  prev
                    ? {
                        ...prev,
                        viewersCurrent: payload.viewersCurrent,
                        viewersPeak: payload.viewersPeak ?? prev.viewersPeak,
                      }
                    : prev,
                );
              }
            },
          );
          streamSocket.on(
            'stream:chat',
            (payload: {
              _id?: string;
              id?: string;
              userId?: string;
              senderName?: string;
              message?: string;
              createdAt?: string;
            }) => {
              if (!active || !payload?.message) return;
              const msgId = payload._id || payload.id || `${Date.now()}-${Math.random()}`;
              setChatMessages((prev) => {
                if (prev.some((m) => m.id === msgId)) return prev;
                return [
                  ...prev,
                  {
                    id: msgId,
                    userId: payload.userId,
                    senderName: payload.senderName || 'Viewer',
                    message: payload.message || '',
                    createdAt: payload.createdAt || new Date().toISOString(),
                  },
                ];
              });
            },
          );
          streamSocket.on('stream:chat-deleted', (payload: { messageId?: string }) => {
            if (!active || !payload?.messageId) return;
            setChatMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
          });
          streamSocket.on('stream:studio-state', (payload: Partial<StudioOverlayState>) => {
            if (!active || !payload) return;
            setStudioState((prev) => ({ ...prev, ...payload }));
            if (payload.layoutMode === 'pip' || payload.layoutMode === 'grid') {
              setLayoutMode(payload.layoutMode);
            }
          });
          streamSocket.on('stream:reaction', (payload: { id?: string; emoji?: string }) => {
            if (!active || !payload?.emoji) return;
            spawnFloatingReaction(payload.emoji, payload.id);
          });
          streamSocket.on('stream:poll', (payload: StreamPollItem) => {
            if (!active || !payload?.id) return;
            setActivePoll((prev) => ({
              ...payload,
              viewerVote: prev?.id === payload.id ? prev.viewerVote : null,
            }));
          });
          streamSocket.on('stream:poll-closed', () => {
            if (!active) return;
            setActivePoll(null);
          });
          streamSocket.on('stream:moderation', (payload: { action?: string; slowModeSeconds?: number }) => {
            if (!active || !payload) return;
            if (payload.action === 'slow_mode' && typeof payload.slowModeSeconds === 'number') {
              setStudioState((prev) => ({ ...prev, slowModeSeconds: payload.slowModeSeconds! }));
            }
          });
          streamSocket.on('stream:status', (payload: { streamId?: string; status?: StreamDetail['status'] }) => {
            if (!active || payload?.streamId !== streamId || !payload.status) return;
            setStream((prev) => (prev ? { ...prev, status: payload.status! } : prev));
          });
          streamSocket.on('stream:ingress-status', (payload: { status?: string }) => {
            if (!active || !payload?.status) return;
            toast.success(payload.status === 'active' ? 'OBS / RTMP feed connected!' : 'OBS / RTMP feed disconnected.');
          });
          streamSocket.on('stream:egress', (payload: { kind?: string; status?: string; outputUrl?: string }) => {
            if (!active || !payload?.status) return;
            if (payload.kind === 'vod_recording' && payload.outputUrl) {
              setStream((prev) => (prev ? { ...prev, recordingUrl: payload.outputUrl! } : prev));
              toast.success('Cloud VOD recording is ready!');
            }
          });
          streamSocket.on('stream:cohost-request', (payload: { requester?: StreamCohost }) => {
            if (!active || !payload?.requester?.userId) return;
            const reqObj = payload.requester;
            setCohosts((prev) => {
              if (prev.some((c) => c.userId === reqObj.userId)) {
                return prev.map((c) => (c.userId === reqObj.userId ? { ...c, ...reqObj, status: 'pending' } : c));
              }
              return [...prev, { ...reqObj, id: reqObj.id || reqObj.userId, streamId: streamId || '', status: 'pending' }];
            });
          });
          streamSocket.on('stream:cohost-admitted', (payload: { userId?: string }) => {
            if (!active || !payload?.userId) return;
            setCohosts((prev) =>
              prev.map((c) => (c.userId === payload.userId ? { ...c, status: 'approved' } : c)),
            );
            if (currentUserId && payload.userId === currentUserId) {
              setViewerRequestStatus('admitted');
              toast.success('Host admitted you! Connecting as Co-Host…');
              disconnectLiveKit();
              window.setTimeout(() => void connectLiveKit(), 400);
            }
          });
          streamSocket.on('stream:cohost-denied', (payload: { userId?: string }) => {
            if (!active || !payload?.userId) return;
            setCohosts((prev) => prev.filter((c) => c.userId !== payload.userId));
            if (currentUserId && payload.userId === currentUserId) {
              setViewerRequestStatus('idle');
              toast.error('The host declined your co-host request.');
            }
          });
          streamSocket.on('disconnect', () => {
            if (active) setConnectionQuality('reconnecting');
          });
          streamSocket.on('connect', () => {
            if (active) setConnectionQuality('good');
          });
        }

        // Load initial studio overlays & active poll
        void Promise.all([
          apiClient.get(`/streaming/streams/${streamId}/studio-state`).catch(() => null),
          apiClient.get(`/streaming/streams/${streamId}/polls`).catch(() => null),
        ]).then(([stRes, pollRes]) => {
          if (!active) return;
          if (stRes?.data?.studioState) {
            setStudioState((prev) => ({ ...prev, ...stRes.data.studioState }));
          }
          const pollsList: StreamPollItem[] = Array.isArray(pollRes?.data?.polls) ? pollRes.data.polls : [];
          const livePoll = pollsList.find((p) => p.status === 'active') ?? null;
          setActivePoll(livePoll);
        });
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
      if (vodTimerRef.current) {
        clearInterval(vodTimerRef.current);
        vodTimerRef.current = null;
      }
      if (streamSocket) {
        streamSocket.emit('leave-stream', streamId);
        streamSocket.disconnect();
      }
      apiClient.post(`/streaming/streams/${streamId}/presence`, { action: 'leave' }).catch(() => {});
      disconnectLiveKit();
    };
  }, [streamId, disconnectLiveKit]);

  const handleInviteCohost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cohostUsername.trim().replace(/^@/, '');
    if (!cleaned || !streamId || cohostBusy) return;
    setCohostBusy(true);
    setCohostNotice(null);
    setError(null);
    try {
      const res = await apiClient.post(`/streaming/streams/${streamId}/cohosts`, { username: cleaned });
      if (res.data?.cohost) {
        setCohosts((prev) => {
          const exists = prev.some((c) => c.userId === res.data.cohost.userId);
          return exists ? prev : [res.data.cohost, ...prev];
        });
      }
      setCohostUsername('');
      setCohostNotice(`Invited @${cleaned} as co-host! They can join with camera & mic controls.`);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Unable to invite co-host.');
    } finally {
      setCohostBusy(false);
    }
  };

  const handleRemoveCohost = async (targetUserId: string) => {
    if (!streamId || cohostBusy) return;
    setCohostBusy(true);
    setError(null);
    try {
      await apiClient.delete(`/streaming/streams/${streamId}/cohosts/${targetUserId}`);
      setCohosts((prev) => prev.filter((c) => c.userId !== targetUserId));
    } catch (err) {
      setError((err as { message?: string })?.message || 'Unable to remove co-host.');
    } finally {
      setCohostBusy(false);
    }
  };

  const formatVodTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const stopVodRecording = useCallback(() => {
    if (vodTimerRef.current) {
      clearInterval(vodTimerRef.current);
      vodTimerRef.current = null;
    }
    if (vodRecorderRef.current && vodRecorderRef.current.state !== 'inactive') {
      vodRecorderRef.current.stop();
    }
    setIsRecordingVod(false);
  }, []);

  const startVodRecording = async () => {
    if (!streamId || isRecordingVod || vodUploading) return;
    setError(null);
    setVodNotice(null);
    try {
      const tracks: MediaStreamTrack[] = [];
      const local = roomRef.current?.localParticipant;
      if (local) {
        local.videoTrackPublications.forEach((pub) => {
          if (pub.track?.mediaStreamTrack && !pub.isMuted && pub.track.mediaStreamTrack.readyState === 'live') {
            tracks.push(pub.track.mediaStreamTrack);
          }
        });
        local.audioTrackPublications.forEach((pub) => {
          if (pub.track?.mediaStreamTrack && !pub.isMuted && pub.track.mediaStreamTrack.readyState === 'live') {
            tracks.push(pub.track.mediaStreamTrack);
          }
        });
      }

      let recordStream: MediaStream;
      if (tracks.length > 0) {
        recordStream = new MediaStream(tracks);
      } else {
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        vodFallbackStreamRef.current = display;
        recordStream = display;
      }

      const preferredMime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : '';
      const recorder = preferredMime
        ? new MediaRecorder(recordStream, { mimeType: preferredMime })
        : new MediaRecorder(recordStream);

      vodChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) vodChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        if (vodFallbackStreamRef.current) {
          vodFallbackStreamRef.current.getTracks().forEach((t) => t.stop());
          vodFallbackStreamRef.current = null;
        }
        const blob = new Blob(vodChunksRef.current, { type: preferredMime || 'video/webm' });
        vodChunksRef.current = [];
        if (blob.size === 0) return;

        setVodUploading(true);
        try {
          const file = new File([blob], `stream-${streamId}-${Date.now()}.webm`, {
            type: 'video/webm',
          });
          const uploaded = await uploadStudioMediaToCloudinary(file, 'recording');
          const savedRes = await apiClient.put(`/streaming/streams/${streamId}/recording`, {
            recordingUrl: uploaded.url,
          });
          if (savedRes.data?.stream) {
            setStream(savedRes.data.stream);
          } else {
            setStream((prev) => (prev ? { ...prev, recordingUrl: uploaded.url } : prev));
          }
          setVodNotice('VOD recording saved! Viewers can replay it when the broadcast ends.');
        } catch (err) {
          setError((err as { message?: string })?.message || 'Failed to upload VOD recording.');
        } finally {
          setVodUploading(false);
        }
      };

      vodRecorderRef.current = recorder;
      recorder.start(1000);
      setVodSeconds(0);
      setIsRecordingVod(true);
      vodTimerRef.current = setInterval(() => {
        setVodSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setError(
        (err as { message?: string })?.message ||
          'Unable to start VOD recording. Enable your camera/mic or allow screen capture.',
      );
    }
  };

  const handleAction = async (action: 'start' | 'end') => {
    if (!streamId) return;
    setBusy(true);
    setError(null);
    try {
      if (action === 'end' && isRecordingVod) {
        stopVodRecording();
      }
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
      const res = await apiClient.post(`/streaming/streams/${streamId}/chat`, { message: text });
      const saved = res.data?.message as
        | { _id?: string; id?: string; senderName?: string; message?: string; createdAt?: string }
        | undefined;
      const msgObj: StreamChatItem = {
        id: saved?._id || saved?.id || `${Date.now()}`,
        senderName: saved?.senderName || roomRef.current?.localParticipant?.name || 'You',
        message: saved?.message || text,
        createdAt: saved?.createdAt || new Date().toISOString(),
      };
      setChatMessages((prev) => (prev.some((m) => m.id === msgObj.id) ? prev : [...prev, msgObj]));
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
              {isStreamHost && stream && stream.status !== 'ended' && stream.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setShowCohostPanel((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                    showCohostPanel || cohosts.length > 0
                      ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-700/70 dark:bg-purple-950/50 dark:text-purple-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Co-Hosts{cohosts.length > 0 ? ` (${cohosts.length})` : ''}
                </button>
              )}

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

          {vodNotice && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
              <span className="inline-flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5" />
                {vodNotice}
              </span>
              <button type="button" onClick={() => setVodNotice(null)} className="opacity-70 hover:opacity-100">
                <X className="h-3.5 w-3.5" />
              </button>
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

              {/* Main Studio Workspace: Reference-Inspired Broadcast Layout in HyperBuds Dark + Purple Theme */}
              <div className="grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-[#0b0d13] p-3 text-white shadow-2xl sm:p-4 lg:grid-cols-12">
                {/* Left Broadcast Column: Co-Host Strip + Hero Stage + Bottom Participant Dock */}
                <section className="flex flex-col gap-3 lg:col-span-8">
                  {/* Top Co-Host / Participant Thumbnail Strip (matches reference top strip) */}
                  {(approvedCohosts.length > 0 || videoTiles.length > 1) && (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {videoTiles.slice(1, 5).map((tile) => (
                        <div
                          key={`strip-${tile.id}`}
                          className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#151823] ring-1 ring-white/10"
                        >
                          <VideoTrackView tile={tile} compact />
                        </div>
                      ))}
                      {approvedCohosts
                        .filter((c) => !videoTiles.some((t) => t.identity === c.userId))
                        .slice(0, Math.max(0, 4 - Math.max(0, videoTiles.length - 1)))
                        .map((c) => {
                          const label = c.displayName || c.username || 'Co-Host';
                          return (
                            <div
                              key={`cohost-strip-${c.userId}`}
                              className="relative flex aspect-[16/10] flex-col items-center justify-center overflow-hidden rounded-2xl bg-[#151823] ring-1 ring-white/10"
                            >
                              {c.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={c.avatar}
                                  alt={label}
                                  className="h-11 w-11 rounded-full object-cover ring-2 ring-purple-500/40"
                                />
                              ) : (
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600/30 text-sm font-bold text-purple-200 ring-1 ring-purple-500/40">
                                  {label.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                <span className="max-w-[90px] truncate">{label}</span>
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Hero Broadcast Video Container */}
                  <div
                    ref={heroStageRef}
                    className="relative overflow-hidden rounded-2xl bg-[#090b10] ring-1 ring-white/10"
                  >
                    {/* Top-Left Live / Recording Pill & Top-Right Fullscreen Button (matches reference) */}
                    {lkConnected && (
                      <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex items-center justify-between">
                        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isRecordingVod
                                ? 'animate-pulse bg-rose-500'
                                : stream.status === 'live'
                                  ? 'animate-pulse bg-purple-400'
                                  : 'bg-zinc-400'
                            }`}
                          />
                          <span className="tabular-nums">
                            {isRecordingVod
                              ? `Recording ${formatVodTimer(vodSeconds)}`
                              : stream.status === 'live'
                                ? 'LIVE'
                                : 'Standby'}
                          </span>
                          {isStreamHost && (
                            <button
                              type="button"
                              disabled={vodUploading}
                              onClick={() => (isRecordingVod ? stopVodRecording() : void startVodRecording())}
                              title={isRecordingVod ? 'Stop recording' : 'Start VOD recording'}
                              className="ml-1 rounded-full bg-white/10 p-1 text-zinc-200 hover:bg-white/20"
                            >
                              {isRecordingVod ? (
                                <Square className="h-2.5 w-2.5 fill-current text-rose-400" />
                              ) : (
                                <Disc className="h-3 w-3 text-rose-400" />
                              )}
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleToggleFullscreen}
                          aria-label="Toggle fullscreen"
                          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-zinc-200 ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/80 hover:text-white"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      {lkConnected && (
                        <StageOverlays
                          studioState={studioState}
                          reactions={floatingReactions}
                          connectionQuality={connectionQuality}
                          isHost={isStreamHost}
                          onDismissPinned={() => void handleUpdateStudioState({ pinnedMessage: null })}
                        />
                      )}
                      {videoTiles.length > 0 ? (() => {
                      // Respect host Backstage stage queue for remote co-hosts when configured
                      const visibleTiles =
                        studioState.stageUserIds.length > 0
                          ? videoTiles.filter(
                              (t) =>
                                t.isLocal ||
                                t.identity === stream.userId ||
                                studioState.stageUserIds.includes(t.identity),
                            )
                          : videoTiles;
                      const stageTiles = visibleTiles.length > 0 ? visibleTiles : videoTiles;
                      const primaryStageTile = stageTiles.find((t) => t.isConsole || t.isScreen) ?? null;
                      const cameraTiles = primaryStageTile
                        ? stageTiles.filter((t) => t.id !== primaryStageTile.id)
                        : stageTiles;
                      const usePipLayout = Boolean(
                        layoutMode === 'pip' && primaryStageTile && cameraTiles.length > 0,
                      );

                      if (usePipLayout && primaryStageTile) {
                        return (
                          <div className="relative" data-testid="gaming-pip-stage">
                            <VideoTrackView tile={primaryStageTile} />
                            <div className="pointer-events-auto absolute bottom-16 right-3 z-10 flex flex-col gap-2">
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
                            stageTiles.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                          }`}
                        >
                          {stageTiles.map((tile) => (
                            <VideoTrackView key={tile.id} tile={tile} />
                          ))}
                        </div>
                      );
                    })() : !lkConnected && isStreamHost && stream.status !== 'ended' && stream.status !== 'cancelled' ? (
                      <GreenRoomPreview
                        streamTitle={stream.title}
                        roleLabel="Host"
                        videoDevices={videoDevices}
                        audioDevices={audioDevices}
                        selectedCamId={selectedCamId}
                        selectedMicId={selectedMicId}
                        onSelectCam={setSelectedCamId}
                        onSelectMic={setSelectedMicId}
                        onEnterStudio={() => void connectLiveKit()}
                        connecting={lkConnecting}
                      />
                    ) : !lkConnected && stream.recordingUrl ? (
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-purple-500/30 bg-purple-950/30 px-3 py-2 text-xs text-purple-200">
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <Film className="h-3.5 w-3.5 text-purple-400" />
                            Recorded VOD Replay
                          </span>
                          <a
                            href={stream.recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-medium text-purple-300 underline hover:text-white"
                          >
                            Open full video
                          </a>
                        </div>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
                          <video
                            src={stream.recordingUrl}
                            controls
                            playsInline
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-zinc-800/90 bg-[#12151c] px-6 py-8 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200">
                          <Radio className="h-5 w-5" />
                        </div>
                        <p className="mt-3.5 text-sm font-semibold text-zinc-100">
                          {lkConnected
                            ? canPublish
                              ? 'Studio connected · Camera muted'
                              : 'Connected · Waiting for host video feed'
                            : stream.status === 'ended'
                              ? 'Broadcast Ended'
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

                  {/* Collapsible Co-Host Invites & Multi-Host Panel */}
                  {showCohostPanel && isStreamHost && (
                    <div className="border-t border-zinc-800 bg-[#12151e] px-4 py-3.5 text-xs text-zinc-200">
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/90 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600/25 text-purple-300">
                            <UserPlus className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p className="font-semibold text-zinc-100">Invite Co-Hosts on Stage</p>
                            <p className="text-[11px] text-zinc-400">
                              Approved co-hosts receive camera, microphone &amp; screen-share publishing controls when they enter this room.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCohostPanel(false)}
                          aria-label="Close co-host panel"
                          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <form onSubmit={handleInviteCohost} className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={cohostUsername}
                          onChange={(e) => setCohostUsername(e.target.value)}
                          placeholder="Creator @username (e.g. alexcreator)"
                          className="min-w-[200px] flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-purple-500"
                        />
                        <button
                          type="submit"
                          disabled={!cohostUsername.trim() || cohostBusy}
                          className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                        >
                          {cohostBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                          Invite Co-Host
                        </button>
                      </form>

                      {cohostNotice && (
                        <p className="mt-2 text-[11px] text-emerald-400">{cohostNotice}</p>
                      )}

                      {cohosts.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {cohosts.map((c) => (
                            <div
                              key={c.userId}
                              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs"
                            >
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <span className="font-medium text-zinc-100">
                                {c.displayName || (c.username ? `@${c.username}` : c.userId)}
                              </span>
                              {c.username && c.displayName && (
                                <span className="text-[11px] text-zinc-400">@{c.username}</span>
                              )}
                              <button
                                type="button"
                                disabled={cohostBusy}
                                onClick={() => void handleRemoveCohost(c.userId)}
                                title="Remove co-host"
                                className="ml-1 rounded p-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2.5 text-[11px] text-zinc-500">
                          No co-hosts invited yet. Share the invite link and add their @username above.
                        </p>
                      )}
                    </div>
                  )}

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
                            {lkConnected && canPublish ? (
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
                                Join the Broadcast Room as Host or Co-Host to start Console Feed
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
                          {lkConnected && canPublish && (
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

                  {/* Clean Single Studio Control Bar (below video — never overlays video frame) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#12151e] px-4 py-3">
                    {/* Left: Volume Slider */}
                    <div className="hidden items-center gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => setStageVolume((v) => (v === 0 ? 85 : 0))}
                        aria-label="Toggle volume"
                        className="text-zinc-300 hover:text-white"
                      >
                        {stageVolume === 0 ? (
                          <VolumeX className="h-4 w-4 text-rose-400" />
                        ) : (
                          <Volume2 className="h-4 w-4 text-purple-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stageVolume}
                        onChange={(e) => setStageVolume(Number(e.target.value))}
                        className="h-1 w-20 cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Center: Circular Broadcast Call Controls */}
                    <div className="mx-auto flex items-center gap-2.5">
                      {lkConnected ? (
                        <>
                          {isStreamHost && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveStudioDrawer((p) => (p === 'overlays' ? null : 'overlays'))
                              }
                              title="Overlays & Lower-Thirds"
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                activeStudioDrawer === 'overlays' || studioState.lowerThirdVisible
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/10 text-zinc-200 hover:bg-white/20'
                              }`}
                            >
                              <Type className="h-4 w-4" />
                            </button>
                          )}
                          {canPublish && (
                            <button
                              type="button"
                              onClick={toggleMic}
                              title={micEnabled ? 'Mute mic' : 'Unmute mic'}
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                micEnabled
                                  ? 'bg-white/10 text-white hover:bg-white/20'
                                  : 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                              }`}
                            >
                              {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={disconnectLiveKit}
                            title="Leave stream room"
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400"
                          >
                            <PhoneOff className="h-5 w-5" />
                          </button>
                          {canPublish && (
                            <button
                              type="button"
                              onClick={toggleCamera}
                              title={camEnabled ? 'Turn off camera' : 'Turn on camera'}
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                camEnabled
                                  ? 'bg-white/10 text-white hover:bg-white/20'
                                  : 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                              }`}
                            >
                              {camEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                            </button>
                          )}
                          {canPublish && (
                            <button
                              type="button"
                              onClick={toggleScreen}
                              title="Share screen"
                              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                                screenEnabled
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/10 text-zinc-200 hover:bg-white/20'
                              }`}
                            >
                              <MonitorUp className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-zinc-400">
                          {stream.status === 'ended'
                            ? 'Broadcast ended'
                            : 'Preview your setup above, then enter the live studio'}
                        </span>
                      )}
                    </div>

                    {/* Right: Signal Indicator */}
                    <div className="hidden items-center gap-1.5 text-[11px] font-medium text-zinc-300 sm:flex">
                      {lkConnected ? (
                        <>
                          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                          <span>HD Live</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3.5 w-3.5 text-zinc-500" />
                          <span className="text-zinc-500">Standby</span>
                        </>
                      )}
                    </div>
                  </div>
                  </div>

                  {/* Bottom Studio Tools, Participants & Add Co-Host Bar (matches reference bottom bar) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141720] px-4 py-3">
                    {/* Left: Compact Studio Tool Icons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setLayoutMode((prev) => (prev === 'pip' ? 'grid' : 'pip'))}
                        title={layoutMode === 'pip' ? 'Switch to Grid layout' : 'Switch to PiP layout'}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-300 transition hover:bg-white/15 hover:text-white"
                      >
                        {layoutMode === 'pip' ? (
                          <PictureInPicture2 className="h-4 w-4 text-purple-400" />
                        ) : (
                          <LayoutGrid className="h-4 w-4" />
                        )}
                      </button>
                      {canPublish && (
                        <button
                          type="button"
                          onClick={() => setShowConsolePanel((p) => !p)}
                          title="Console / Capture Card"
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            consoleEnabled || showConsolePanel
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/[0.06] text-zinc-300 hover:bg-white/15 hover:text-white'
                          }`}
                        >
                          <Gamepad2 className="h-4 w-4" />
                        </button>
                      )}
                      {isStreamHost && (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveStudioDrawer((p) => (p === 'poll' ? null : 'poll'))}
                            title="Launch Live Poll"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              activeStudioDrawer === 'poll' || activePoll?.status === 'active'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/[0.06] text-zinc-300 hover:bg-white/15 hover:text-white'
                            }`}
                          >
                            <BarChart2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveStudioDrawer((p) => (p === 'backstage' ? null : 'backstage'))}
                            title="Backstage Stage Queue"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              activeStudioDrawer === 'backstage'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/[0.06] text-zinc-300 hover:bg-white/15 hover:text-white'
                            }`}
                          >
                            <Layers className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveStudioDrawer((p) => (p === 'infra' ? null : 'infra'))}
                            title="OBS RTMP & Multi-Stream"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              activeStudioDrawer === 'infra'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/[0.06] text-zinc-300 hover:bg-white/15 hover:text-white'
                            }`}
                          >
                            <Cast className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Center: Participants count + Avatar Stack */}
                    <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span className="font-semibold text-white">
                        Participants ({lkConnected ? participantCount : stream.viewersCurrent ?? 0})
                      </span>
                      {approvedCohosts.length > 0 && (
                        <div className="hidden items-center -space-x-2 sm:flex">
                          {approvedCohosts.slice(0, 4).map((c) => (
                            <span
                              key={`av-${c.userId}`}
                              title={c.displayName || c.username || 'Co-Host'}
                              className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-purple-600/40 text-[10px] font-bold text-white ring-2 ring-[#141720]"
                            >
                              {c.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                (c.displayName || c.username || 'C').slice(0, 2).toUpperCase()
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Add Co-Host (Host) or Request to Co-Host (Viewer) */}
                    <div className="flex items-center gap-2">
                      {isStreamHost ? (
                        <button
                          type="button"
                          onClick={() => setShowCohostPanel((v) => !v)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-purple-600/25 transition hover:bg-purple-500"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Add Co-Host
                        </button>
                      ) : !canPublish ? (
                        <button
                          type="button"
                          disabled={viewerRequestStatus === 'pending'}
                          onClick={() => void handleRequestToCohost()}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                            viewerRequestStatus === 'pending'
                              ? 'bg-purple-600/25 text-purple-200 ring-1 ring-purple-500/40'
                              : 'bg-purple-600 text-white shadow-sm shadow-purple-600/25 hover:bg-purple-500'
                          }`}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          {viewerRequestStatus === 'pending' ? 'Co-Host Request Pending…' : 'Request to Co-Host'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Host Broadcast Drawers: Overlays / Polls / Backstage / OBS & Multi-Stream */}
                  {isStreamHost && activeStudioDrawer && (
                    <div>
                      {activeStudioDrawer === 'infra' && streamId ? (
                        <BroadcastInfraDrawer
                          streamId={streamId}
                          onClose={() => setActiveStudioDrawer(null)}
                        />
                      ) : activeStudioDrawer !== 'infra' ? (
                        <StudioControlsDrawer
                          activePanel={activeStudioDrawer}
                          onClose={() => setActiveStudioDrawer(null)}
                          studioState={studioState}
                          cohosts={approvedCohosts}
                          onUpdateStudioState={handleUpdateStudioState}
                          onCreatePoll={handleCreatePoll}
                        />
                      ) : null}
                    </div>
                  )}
                </section>

                {/* Right Column: Pending Co-Host Admission Card + Live Chat + Share Link Pill */}
                <div className="flex flex-col gap-3 lg:col-span-4">
                  {isStreamHost && pendingCohostRequests.length > 0 && (
                    <PendingCohostCard
                      requests={pendingCohostRequests}
                      busyUserId={pendingActionUserId}
                      onAdmit={(uid) => void handleAdmitCohost(uid)}
                      onDeny={(uid) => void handleDenyCohost(uid)}
                    />
                  )}

                  <div className="flex-1">
                    <LiveChatPanel
                      messages={chatMessages}
                      activePoll={activePoll}
                      slowModeSeconds={studioState.slowModeSeconds}
                      isHost={isStreamHost}
                      chatDraft={chatDraft}
                      sendingChat={sendingChat}
                      onChatDraftChange={setChatDraft}
                      onSendChat={handleSendChat}
                      onSendReaction={(emoji) => void handleSendReaction(emoji)}
                      onSendSuperChat={handleSendSuperChat}
                      onVotePoll={(pollId, idx) => void handleVotePoll(pollId, idx)}
                      onClosePoll={(pollId) => void handleClosePoll(pollId)}
                      onPinMessage={(msg, sc) => {
                        const cleanText = sc
                          ? msg.message.replace(/^\[SUPERCHAT:\d+:\w+\]\s*/, '')
                          : msg.message;
                        void handleUpdateStudioState({
                          pinnedMessage: {
                            id: msg.id,
                            senderName: msg.senderName,
                            message: cleanText,
                            amountCredits: sc?.amount,
                            tier: sc?.tier,
                          },
                        });
                      }}
                      onDeleteMessage={(id) => void handleDeleteChatMessage(id)}
                      onMuteUser={(uid) => void handleMuteChatUser(uid)}
                      onToggleSlowMode={(secs) => void handleToggleSlowMode(secs)}
                      chatEndRef={chatEndRef}
                    />
                  </div>

                  {/* Bottom-Right Share Room Link Pill (matches reference) */}
                  <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#141720] px-3.5 py-2.5 text-xs text-zinc-300">
                    <div className="flex min-w-0 items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                      <span className="truncate font-mono text-[11px] text-zinc-300">
                        hyperbuds.cloud/streaming/room/{streamId?.slice(0, 10)}…
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window === 'undefined') return;
                        void navigator.clipboard
                          .writeText(`${window.location.origin}/streaming/room/${streamId}`)
                          .then(() => {
                            setCopiedLink(true);
                            window.setTimeout(() => setCopiedLink(false), 1800);
                          })
                          .catch(() => null);
                      }}
                      aria-label="Copy room link"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-purple-600"
                    >
                      {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
