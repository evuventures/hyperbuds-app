'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Radio, Video, VideoOff } from 'lucide-react';

interface GreenRoomPreviewProps {
  streamTitle: string;
  roleLabel: string;
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  selectedCamId: string;
  selectedMicId: string;
  onSelectCam: (id: string) => void;
  onSelectMic: (id: string) => void;
  onEnterStudio: () => void;
  connecting: boolean;
}

/**
 * Pre-Live Green Room: lets hosts and co-hosts verify camera framing,
 * mic audio levels (live Web Audio API meter), and devices before entering the stage.
 */
export function GreenRoomPreview({
  streamTitle,
  roleLabel,
  videoDevices,
  audioDevices,
  selectedCamId,
  selectedMicId,
  onSelectCam,
  onSelectMic,
  onEnterStudio,
  connecting,
}: GreenRoomPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [previewCamOn, setPreviewCamOn] = useState(true);
  const [previewMicOn, setPreviewMicOn] = useState(true);
  const [micLevel, setMicLevel] = useState(0);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let audioCtx: AudioContext | null = null;

    const startPreview = async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: previewCamOn
            ? selectedCamId
              ? { deviceId: { exact: selectedCamId }, width: { ideal: 1280 }, height: { ideal: 720 } }
              : { width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
          audio: previewMicOn
            ? selectedMicId
              ? { deviceId: { exact: selectedMicId } }
              : true
            : false,
        });
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = media;
        setPermissionNote(null);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }

        if (previewMicOn && media.getAudioTracks().length > 0) {
          const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextCtor) {
            audioCtx = new AudioContextCtor();
            const source = audioCtx.createMediaStreamSource(media);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
              analyser.getByteFrequencyData(data);
              const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
              setMicLevel(Math.min(100, Math.round((avg / 90) * 100)));
              rafId = requestAnimationFrame(tick);
            };
            rafId = requestAnimationFrame(tick);
          }
        } else {
          setMicLevel(0);
        }
      } catch {
        if (!cancelled) {
          setPermissionNote('Allow camera & microphone permissions in your browser to preview.');
        }
      }
    };

    void startPreview();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (audioCtx) void audioCtx.close().catch(() => null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [previewCamOn, previewMicOn, selectedCamId, selectedMicId]);

  const handleEnter = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onEnterStudio();
  };

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 rounded-2xl border border-white/10 bg-[#12141a] p-5 text-white shadow-2xl lg:grid-cols-12 lg:p-7">
      {/* Camera Preview */}
      <div className="lg:col-span-7">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
          {previewCamOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-zinc-500">
              <VideoOff className="h-8 w-8" />
              <p className="mt-2 text-xs">Camera preview off</p>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur-xs">
              Green Room · {roleLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMicOn((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  previewMicOn ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-rose-600 text-white'
                }`}
                aria-label="Toggle microphone preview"
              >
                {previewMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setPreviewCamOn((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  previewCamOn ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-rose-600 text-white'
                }`}
                aria-label="Toggle camera preview"
              >
                {previewCamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live Audio Level Meter */}
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 py-2.5 ring-1 ring-white/10">
          <Mic className="h-4 w-4 shrink-0 text-zinc-400" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Mic check</span>
              <span>{previewMicOn ? `${micLevel}%` : 'Muted'}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                style={{ width: `${previewMicOn ? micLevel : 0}%` }}
                className={`h-full rounded-full transition-all duration-75 ${
                  micLevel > 82 ? 'bg-rose-500' : micLevel > 55 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Device Pickers + Enter CTA */}
      <div className="flex flex-col justify-between gap-4 lg:col-span-5">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Pre-Broadcast Check
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">{streamTitle}</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Check your framing and mic levels before entering the studio. Viewers won&apos;t see you until you go live.
            </p>
          </div>

          {permissionNote && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {permissionNote}
            </p>
          )}

          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-zinc-300">Camera</span>
              <select
                value={selectedCamId}
                onChange={(e) => onSelectCam(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {videoDevices.length === 0 && <option value="">Default camera</option>}
                {videoDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-zinc-300">Microphone</span>
              <select
                value={selectedMicId}
                onChange={(e) => onSelectMic(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {audioDevices.length === 0 && <option value="">Default microphone</option>}
                {audioDevices.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          disabled={connecting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          <Radio className="h-4 w-4" />
          {connecting ? 'Connecting to Studio…' : 'Enter Live Studio'}
        </button>
      </div>
    </div>
  );
}
