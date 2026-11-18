'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';

export default function PrivacySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [allowDirectInvites, setAllowDirectInvites] = useState(true);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get('/profiles/me');
        const profile = res.data?.profile ?? res.data ?? {};
        if (!active) return;
        setIsPublic(profile.isPublic !== false);
        setAllowDirectInvites(profile.allowDirectInvites !== false);
      } catch {
        // Keep defaults if profile has not been initialized yet
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setBanner(null);
    try {
      await apiClient.put('/profiles/me', {
        isPublic,
        allowDirectInvites,
      });
      setBanner({ type: 'success', text: 'Privacy preferences saved.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to update privacy settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Settings
          </Link>

          <div className="mt-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Privacy & Safety
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Control profile discoverability and collaboration invitation permissions.
            </p>
          </div>

          {banner && (
            <div
              role="status"
              className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
              }`}
            >
              {banner.text}
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            {loading ? (
              <div className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : (
              <>
                <label className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">
                      Public Creator Profile
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      Allow creators and founders to view your public profile and appear in discovery search.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                </label>

                <label className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">
                      Direct Collaboration Invitations
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      Allow non-blocked creators and founders to send collaboration or startup role offers.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowDirectInvites}
                    onChange={(e) => setAllowDirectInvites(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                </label>

                <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                  >
                    {saving ? 'Saving...' : 'Save privacy settings'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
