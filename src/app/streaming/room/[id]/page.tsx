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
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
  type LocalTrackPublication,
} from 'livekit-client';
import {
  ArrowLeft,
  Check,
  Copy,
  Mic,
  MicOff,
  MonitorUp,
  Play,
  Radio,
  Send,
  Square,
  Users,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
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
  track: Track;
}

interface StreamChatItem {
  id: string;
  senderName: string;
  message: string;
  createdAt?: string;
}

function VideoTrackView({ tile }: { tile: VideoTile }) {
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
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 ring-1 ring-white/10">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={tile.isLocal}
        className={`h-full w-full ${tile.isScreen ? 'object-contain bg-black' : 'object-cover'}`}
      />
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
        <span>{tile.name}{tile.isLocal ? ' (You)' : ''}</span>
        {tile.isScreen && (
          <span className="rounded bg-purple-600/80 px-1.5 py-0.5 text-[10px] font-semibold">
            Screen
          </span>
        )}
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
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [lkRole, setLkRole] = useState<'host' | 'viewer' | null>(null);
  const [lkConnected, setLkConnected] = useState(false);
  const [lkConnecting, setLkConnecting] = useState(false);
  const [camEnabled, setCamEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [screenEnabled, setScreenEnabled] = useState(false);
  const [videoTiles, setVideoTiles] = useState<VideoTile[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live chat state
  const [chatMessages, setChatMessages] = useState<StreamChatItem[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const rebuildTiles = useCallback((room: Room) => {
    const tiles: VideoTile[] = [];
    const local = room.localParticipant;
    local.videoTrackPublications.forEach((pub: LocalTrackPublication) => {
      if (pub.track && !pub.isMuted) {
        tiles.push({
          id: `local-${pub.trackSid || pub.source}`,
          identity: local.identity,
          name: local.name || 'Host',
          isLocal: true,
          isScreen: pub.source === Track.Source.ScreenShare,
          track: pub.track,
        });
      }
    });
    room.remoteParticipants.forEach((p: RemoteParticipant) => {
      p.videoTrackPublications.forEach((pub: RemoteTrackPublication) => {
        if (pub.track && pub.isSubscribed) {
          tiles.push({
            id: `${p.identity}-${pub.trackSid}`,
            identity: p.identity,
            name: p.name || p.identity,
            isLocal: false,
            isScreen: pub.source === Track.Source.ScreenShare,
            track: pub.track,
          });
        }
      });
    });
    setVideoTiles(tiles);
    setParticipantCount(room.remoteParticipants.size + 1);
  }, []);

  const disconnectLiveKit = useCallback(() => {
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
        sync();
      }
    } catch (err) {
      disconnectLiveKit();
      setError((err as { message?: string })?.message || 'Unable to connect to LiveKit media room.');
    } finally {
      setLkConnecting(false);
    }
  }, [streamId, lkConnecting, rebuildTiles, disconnectLiveKit]);

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
            chatRes.data.messages.map((m: { _id?: string; id?: string; senderName?: string; message?: string; createdAt?: string }) => ({
              id: m._id || m.id || String(Math.random()),
              senderName: m.senderName || 'Viewer',
              message: m.message || '',
              createdAt: m.createdAt,
            })),
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

  const toggleScreen = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !screenEnabled;
    try {
      await room.localParticipant.setScreenShareEnabled(next);
      setScreenEnabled(next);
      rebuildTiles(room);
    } catch (err) {
      setError((err as { message?: string })?.message || 'Screen share cancelled or unavailable.');
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
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div ref={audioContainerRef} className="hidden" />
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/streaming"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Live Studio
            </Link>

            <button
              type="button"
              onClick={copyShareUrl}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedLink ? 'Room link copied' : 'Copy invite link'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-5 h-96 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ) : stream ? (
            <div className="mt-5 space-y-5">
              {/* Top Bar */}
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        stream.status === 'live'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {stream.status === 'live' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />}
                      {stream.status}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      {lkConnected ? (
                        <>
                          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                          LiveKit connected ({lkRole})
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3.5 w-3.5" />
                          Standby
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5" />
                      {lkConnected ? participantCount : stream.viewersCurrent ?? 0} in room
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {stream.title}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!lkConnected && stream.status !== 'ended' && stream.status !== 'cancelled' && (
                    <button
                      type="button"
                      disabled={lkConnecting}
                      onClick={connectLiveKit}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      {lkConnecting ? 'Connecting...' : 'Join LiveKit Studio'}
                    </button>
                  )}
                  {stream.status === 'scheduled' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction('start')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Go live
                    </button>
                  )}
                  {stream.status === 'live' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction('end')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                    >
                      <Square className="h-3.5 w-3.5" />
                      End stream
                    </button>
                  )}
                </div>
              </div>

              {/* Studio Stage + Live Chat Grid */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                  <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3 dark:border-slate-800">
                    {videoTiles.length > 0 ? (
                      <div
                        className={`grid gap-3 ${
                          videoTiles.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                        }`}
                      >
                        {videoTiles.map((tile) => (
                          <VideoTrackView key={tile.id} tile={tile} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-linear-to-br from-slate-900 via-purple-950/50 to-slate-900 px-6 text-center text-white">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/20 ring-1 ring-purple-400/40">
                          <Radio className="h-7 w-7 text-purple-300" />
                        </div>
                        <p className="mt-4 text-base font-semibold">
                          {lkConnected
                            ? lkRole === 'host'
                              ? 'Camera is off — turn on camera or share screen below'
                              : 'Connected — waiting for the host to start video'
                            : 'Ready to enter the LiveKit WebRTC room'}
                        </p>
                        <p className="mt-1 max-w-md text-xs text-slate-300">
                          {stream.description || 'Real-time WebRTC live streaming powered by LiveKit.'}
                        </p>
                        {!lkConnected && stream.status !== 'ended' && stream.status !== 'cancelled' && (
                          <button
                            type="button"
                            disabled={lkConnecting}
                            onClick={connectLiveKit}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-700/30 hover:bg-purple-500 disabled:opacity-50"
                          >
                            <Radio className="h-4 w-4" />
                            {lkConnecting ? 'Connecting to LiveKit...' : 'Enter Live Room'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Studio Media Control Bar */}
                    {lkConnected && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/90 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {lkRole === 'host' && (
                            <>
                              <button
                                type="button"
                                onClick={toggleMic}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  micEnabled
                                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                                    : 'bg-rose-600 text-white hover:bg-rose-500'
                                }`}
                              >
                                {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                                {micEnabled ? 'Mic On' : 'Mic Off'}
                              </button>
                              <button
                                type="button"
                                onClick={toggleCamera}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  camEnabled
                                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                                    : 'bg-rose-600 text-white hover:bg-rose-500'
                                }`}
                              >
                                {camEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                                {camEnabled ? 'Camera On' : 'Camera Off'}
                              </button>
                              <button
                                type="button"
                                onClick={toggleScreen}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  screenEnabled
                                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                              >
                                <MonitorUp className="h-3.5 w-3.5" />
                                {screenEnabled ? 'Stop Share' : 'Share Screen'}
                              </button>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={disconnectLiveKit}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-slate-700"
                        >
                          Leave Room
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Chat Panel */}
                <aside className="flex h-[460px] flex-col rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-4 lg:h-auto lg:min-h-[460px]">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Stream Chat</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Synced over LiveKit real-time data channel
                    </p>
                  </div>
                  <div className="flex-1 space-y-2.5 overflow-y-auto p-4 text-xs">
                    {chatMessages.length === 0 ? (
                      <p className="py-8 text-center text-slate-400">
                        No chat messages yet. Say hello!
                      </p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {msg.senderName}
                          </span>
                          <p className="mt-0.5 text-slate-800 dark:text-slate-200">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  {stream.chatEnabled !== false && (
                    <form
                      onSubmit={handleSendChat}
                      className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
                    >
                      <input
                        type="text"
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        placeholder="Send a live message..."
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!chatDraft.trim() || sendingChat}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
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
