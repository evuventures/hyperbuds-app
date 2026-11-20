'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, BellOff, BellRing, Loader2, Send } from 'lucide-react';
import {
  getBrowserPushState,
  sendTestWebPush,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  type BrowserPushState,
} from '@/lib/pwa/pushSubscription';

interface PushNotificationControlProps {
  compact?: boolean;
}

export default function PushNotificationControl({ compact = false }: PushNotificationControlProps) {
  const [state, setState] = useState<BrowserPushState>('unsubscribed');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  const refreshState = useCallback(async () => {
    const next = await getBrowserPushState();
    setState(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const handleEnable = async () => {
    setBusy(true);
    try {
      await subscribeToWebPush();
      setState('subscribed');
      toast.success('Push notifications enabled for this device.');
    } catch (err) {
      const msg = (err as { message?: string })?.message || 'Unable to enable push notifications.';
      toast.error(msg);
      await refreshState();
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      await unsubscribeFromWebPush();
      setState('unsubscribed');
      toast.success('Push notifications turned off for this device.');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to disable push notifications.');
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await sendTestWebPush();
      toast.success('Test push sent! Check your notifications.');
    } catch (err) {
      toast.error((err as { message?: string })?.message || 'Unable to send test notification.');
    } finally {
      setTesting(false);
    }
  };

  if (loading || state === 'unsupported') return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70 ${
        compact ? 'px-4 py-3' : 'p-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            state === 'subscribed'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {state === 'subscribed' ? (
            <BellRing className="h-4 w-4" />
          ) : state === 'denied' ? (
            <BellOff className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {state === 'subscribed'
              ? 'Device push alerts are active'
              : state === 'denied'
                ? 'Browser notifications blocked'
                : 'Get alerts even when HyperBuds is closed'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {state === 'subscribed'
              ? 'Likes, comments, follows, messages, and live streams wake this device via Web Push.'
              : state === 'denied'
                ? 'Re-enable notifications in your browser site settings for app.hyperbuds.cloud.'
                : 'Enable Web Push on this device for instant closed-browser and PWA notifications.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {state === 'subscribed' ? (
          <>
            <button
              type="button"
              disabled={testing}
              onClick={handleTest}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Send test
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDisable}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
              Disable
            </button>
          </>
        ) : state === 'unsubscribed' ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleEnable}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
            Enable Push Alerts
          </button>
        ) : null}
      </div>
    </div>
  );
}
