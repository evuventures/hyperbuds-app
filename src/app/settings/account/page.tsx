'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { ArrowLeft } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get('/users/me');
        const user = res.data?.user ?? res.data ?? {};
        const profile = user.profile ?? res.data?.profile ?? {};
        if (!active) return;
        setEmail(user.email ?? '');
        setFullName(user.fullName ?? profile.displayName ?? '');
        setUsername(user.username ?? profile.username ?? '');
        setBio(profile.bio ?? '');
      } catch (err) {
        if (active) {
          setBanner({
            type: 'error',
            text: (err as { message?: string })?.message || 'Unable to load account details.',
          });
        }
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
      await apiClient.put('/users/me', {
        email: email.trim(),
        fullName: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
      });
      setBanner({ type: 'success', text: 'Account details updated.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to update account.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setBanner(null);
    try {
      await apiClient.delete('/users/me');
      localStorage.removeItem('accessToken');
      router.push('/auth/signin');
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to delete account.',
      });
      setDeleting(false);
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
              Account & Identity
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Update your account email, display name, username, and bio.
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
            className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="account-fullname"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Display Name
                    </label>
                    <input
                      id="account-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="account-username"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      Username
                    </label>
                    <input
                      id="account-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="account-email"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="account-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="account-bio"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    Bio
                  </label>
                  <textarea
                    id="account-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </>
            )}
          </form>

          <section className="mt-6 rounded-xl border border-rose-200 bg-white p-5 dark:border-rose-900/60 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              Delete Account
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Deactivates your account and revokes active sessions. Financial and collaboration audit records remain preserved per policy.
            </p>
            {confirmDelete ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm account deletion'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-4 rounded-lg border border-rose-300 px-3.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                Delete account
              </button>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
