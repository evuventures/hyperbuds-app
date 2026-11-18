'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';

export default function MatchingPreferencesPage() {
  const [nichesInput, setNichesInput] = useState('Design, Tech');
  const [minRizzScore, setMinRizzScore] = useState('65');
  const [locationPreference, setLocationPreference] = useState('Remote');
  const [minEngagement, setMinEngagement] = useState('2');
  const [maxEngagement, setMaxEngagement] = useState('25');
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const minRizz = Number(minRizzScore);
    const minEng = Number(minEngagement);
    const maxEng = Number(maxEngagement);

    if (Number.isNaN(minRizz) || minRizz < 0 || minRizz > 100) {
      setBanner({ type: 'error', text: 'Minimum Rizz Score must be between 0 and 100.' });
      return;
    }
    if (Number.isNaN(minEng) || Number.isNaN(maxEng) || minEng > maxEng) {
      setBanner({ type: 'error', text: 'Engagement range minimum must not exceed maximum.' });
      return;
    }

    setSaving(true);
    try {
      const niches = nichesInput
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      await apiClient.post('/matching/preferences', {
        niches,
        minRizzScore: minRizz,
        locationPreference: locationPreference.trim() || undefined,
        engagementRange: { min: minEng, max: maxEng },
      });
      setBanner({ type: 'success', text: 'Matching preferences updated.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to save matching preferences.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-6 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/matching/discover"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Discover
            </Link>
          </div>

          <div className="mt-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Matching Preferences
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Configure target niches, minimum Rizz Score, and engagement thresholds for match suggestions.
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
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <label
                htmlFor="pref-niches"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Preferred Niches (comma-separated)
              </label>
              <input
                id="pref-niches"
                type="text"
                value={nichesInput}
                onChange={(e) => setNichesInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pref-rizz"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Minimum Rizz Score (0–100)
                </label>
                <input
                  id="pref-rizz"
                  type="number"
                  min={0}
                  max={100}
                  value={minRizzScore}
                  onChange={(e) => setMinRizzScore(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="pref-location"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Location Preference
                </label>
                <input
                  id="pref-location"
                  type="text"
                  value={locationPreference}
                  onChange={(e) => setLocationPreference(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="pref-eng-min"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Min Engagement (%)
                </label>
                <input
                  id="pref-eng-min"
                  type="number"
                  step="0.1"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="pref-eng-max"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Max Engagement (%)
                </label>
                <input
                  id="pref-eng-max"
                  type="number"
                  step="0.1"
                  value={maxEngagement}
                  onChange={(e) => setMaxEngagement(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
              >
                {saving ? 'Saving...' : 'Save preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
