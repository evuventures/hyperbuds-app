'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { ArrowLeft, Download, ShieldAlert, Undo2 } from 'lucide-react';

interface DeletionRequestRecord {
  status: string;
  reason?: string;
  requestedAt?: string;
  scheduledFor?: string;
}

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequestRecord | null>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [res, delRes] = await Promise.all([
          apiClient.get('/users/me'),
          apiClient.get('/users/me/deletion-request').catch(() => null),
        ]);
        const user = res.data?.user ?? res.data ?? {};
        const profile = user.profile ?? res.data?.profile ?? {};
        if (!active) return;
        setEmail(user.email ?? '');
        setFullName(user.fullName ?? profile.displayName ?? '');
        setUsername(user.username ?? profile.username ?? '');
        setBio(profile.bio ?? '');
        if (delRes?.data?.deletionRequest) {
          setDeletionRequest(delRes.data.deletionRequest);
        }
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

  const handleExportData = async () => {
    setExporting(true);
    setBanner(null);
    try {
      const res = await apiClient.get('/users/me/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hyperbuds-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBanner({
        type: 'success',
        text: 'Your personal data export (JSON) has been downloaded.',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to export account data.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setBanner({ type: 'error', text: 'Type DELETE to confirm scheduling account deletion.' });
      return;
    }
    setDeleting(true);
    setBanner(null);
    try {
      const res = await apiClient.post('/users/me/deletion-request', {
        confirmText: 'DELETE',
        reason: deleteReason.trim(),
      });
      setDeletionRequest(res.data?.deletionRequest ?? null);
      setConfirmDelete(false);
      setConfirmText('');
      setDeleteReason('');
      setBanner({
        type: 'success',
        text:
          res.data?.retentionNotice ||
          'Account deletion scheduled for 30 days from now. Your profile has been hidden.',
      });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to schedule account deletion.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setDeleting(true);
    setBanner(null);
    try {
      const res = await apiClient.delete('/users/me/deletion-request');
      setDeletionRequest(res.data?.deletionRequest ?? null);
      setBanner({ type: 'success', text: 'Scheduled account deletion has been cancelled.' });
    } catch (err) {
      setBanner({
        type: 'error',
        text: (err as { message?: string })?.message || 'Unable to cancel deletion request.',
      });
    } finally {
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
              Account &amp; Identity
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Update your account details, download a portable copy of your data, or manage retention.
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

          {/* Portable Data Export */}
          <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Download Your Data
              </h2>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Export your profile, posts, notifications, wallet ledger, orders, pitches, and agreements as a portable JSON archive.
              </p>
            </div>
            <button
              type="button"
              disabled={exporting}
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? 'Preparing...' : 'Download JSON'}
            </button>
          </section>

          {/* Retention-Aware 30-Day Account Deletion */}
          <section className="mt-6 rounded-xl border border-rose-200 bg-white p-5 dark:border-rose-900/60 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                Account Deletion &amp; 30-Day Retention Window
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Scheduling deletion immediately hides your public profile and revokes active refresh sessions, with a 30-day grace period to cancel. Immutable financial ledger and legal audit records remain preserved per policy.
            </p>

            {deletionRequest?.status === 'pending' ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                <span>
                  Deletion scheduled for{' '}
                  <strong>
                    {deletionRequest.scheduledFor
                      ? new Date(deletionRequest.scheduledFor).toLocaleDateString()
                      : '30 days from request'}
                  </strong>
                  .
                </span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleCancelDeletion}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Cancel Deletion
                </button>
              </div>
            ) : confirmDelete ? (
              <div className="mt-4 space-y-2.5">
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Optional reason for leaving..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs dark:border-rose-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      setConfirmText('');
                    }}
                    disabled={deleting}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestDeletion}
                    disabled={deleting || confirmText.trim().toUpperCase() !== 'DELETE'}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-40"
                  >
                    {deleting ? 'Scheduling...' : 'Schedule 30-Day Deletion'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-4 rounded-lg border border-rose-300 px-3.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/50"
              >
                Request account deletion
              </button>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
