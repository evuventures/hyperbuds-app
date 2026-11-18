'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { ArrowLeft, Play, Square } from 'lucide-react';

interface StreamDetail {
  _id: string;
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

export default function StreamingRoomPage() {
  const params = useParams<{ id: string }>();
  const streamId = params?.id;
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streamId) return;
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get(`/streaming/streams/${streamId}`);
        if (active) setStream(res.data?.stream ?? null);
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
    };
  }, [streamId]);

  const handleAction = async (action: 'start' | 'end') => {
    if (!streamId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiClient.put(`/streaming/streams/${streamId}/${action}`);
      if (res.data?.stream) setStream(res.data.stream);
    } catch (err) {
      setError((err as { message?: string })?.message || `Unable to ${action} stream.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <Link
            href="/streaming"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Live Studio
          </Link>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-5 h-64 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          ) : stream ? (
            <div className="mt-5 space-y-5">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stream Room · {stream.status}
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {stream.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  {stream.status === 'scheduled' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction('start')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
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
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
                    >
                      <Square className="h-3.5 w-3.5" />
                      End stream
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {stream.description || 'No session notes provided.'}
                </p>
                <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-4 text-xs dark:border-slate-800 sm:grid-cols-3">
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Current Viewers</dt>
                    <dd className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-white">
                      {stream.viewersCurrent ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Peak Viewers</dt>
                    <dd className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-white">
                      {stream.viewersPeak ?? 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Playback Endpoint</dt>
                    <dd className="mt-1 truncate font-mono text-slate-700 dark:text-slate-300">
                      {stream.playbackUrl || 'Pending'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
