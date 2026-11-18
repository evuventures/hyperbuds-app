'use client';

import React, { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/Dashboard/Dashboard';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/hooks/auth/useAuth';
import {
  AlertTriangle,
  CheckCircle2,
  Copyright,
  EyeOff,
  Flag,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface ModerationReport {
  _id: string;
  targetType: 'post' | 'stream' | 'podcast' | 'comment';
  targetId?: string;
  postId?: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
  details?: string;
  status: 'open' | 'reviewed' | 'actioned' | 'dismissed';
  resolutionAction?: string;
  reviewNotes?: string;
  appealStatus?: 'none' | 'submitted' | 'upheld' | 'overturned';
  appealReason?: string;
  copyrightClaim?: {
    workTitle?: string;
    rightsHolder?: string;
    referenceUrl?: string;
  };
  createdAt?: string;
}

export default function ModerationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [myReports, setMyReports] = useState<ModerationReport[]>([]);
  const [queueReports, setQueueReports] = useState<ModerationReport[]>([]);
  const [copyrightOnly, setCopyrightOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: 'info' | 'error'; text: string } | null>(null);

  // Submit report state
  const [targetType, setTargetType] = useState<'post' | 'stream' | 'podcast' | 'comment'>('post');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState<'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'>('copyright');
  const [details, setDetails] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [rightsHolder, setRightsHolder] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Appeal state
  const [appealingId, setAppealingId] = useState<string | null>(null);
  const [appealText, setAppealText] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const myRes = await apiClient.get('/moderation/reports/my');
      setMyReports(Array.isArray(myRes.data?.reports) ? myRes.data.reports : []);
      if (isAdmin) {
        const qRes = await apiClient.get(`/moderation/queue?status=all&copyrightOnly=${copyrightOnly}`);
        setQueueReports(Array.isArray(qRes.data?.reports) ? qRes.data.reports : []);
      }
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to load moderation records.',
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, copyrightOnly]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!targetId.trim()) {
      setBanner({ type: 'error', text: 'Target content ID is required.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/moderation/reports', {
        targetType,
        targetId: targetId.trim(),
        reason,
        details: details.trim(),
        ...(reason === 'copyright'
          ? {
              copyrightClaim: {
                workTitle: workTitle.trim(),
                rightsHolder: rightsHolder.trim(),
                referenceUrl: referenceUrl.trim(),
                takedownRequested: true,
              },
            }
          : {}),
      });
      setTargetId('');
      setDetails('');
      setWorkTitle('');
      setRightsHolder('');
      setReferenceUrl('');
      setBanner({ type: 'info', text: 'Report submitted to the Moderation & Copyright queue.' });
      await loadData();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to submit moderation report.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppeal = async (reportId: string) => {
    setBanner(null);
    try {
      await apiClient.post(`/moderation/reports/${reportId}/appeal`, {
        reason: appealText.trim(),
      });
      setAppealingId(null);
      setAppealText('');
      setBanner({ type: 'info', text: 'Appeal submitted for moderation review.' });
      await loadData();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to submit appeal.',
      });
    }
  };

  const handleAdminResolve = async (
    reportId: string,
    action: 'dismiss' | 'hide_content' | 'copyright_takedown' | 'restore_content'
  ) => {
    setBanner(null);
    try {
      await apiClient.post(`/moderation/queue/${reportId}/resolve`, {
        action,
        reviewNotes: `Resolved via moderation console (${action})`,
      });
      setBanner({ type: 'info', text: `Report updated with action: ${action.replace(/_/g, ' ')}.` });
      await loadData();
    } catch (err) {
      setBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to resolve moderation report.',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-[#fafafa] dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <ShieldAlert className="h-4 w-4" />
                Trust, Safety & Rights Management
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Moderation & Copyright Queue
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Submit abuse or DMCA/copyright claims, appeal moderation outcomes, and review flagged items.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Queue
            </button>
          </div>

          {banner && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm ${
                banner.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
              }`}
            >
              {banner.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  File Content or Copyright Report
                </h2>
              </div>
              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="mod-target-type" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Target Type
                    </label>
                    <select
                      id="mod-target-type"
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as typeof targetType)}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="post">Social Post / Reel</option>
                      <option value="stream">Live Stream</option>
                      <option value="podcast">Podcast Episode</option>
                      <option value="comment">Comment</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mod-reason" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      id="mod-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value as typeof reason)}
                      className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="copyright">Copyright / DMCA</option>
                      <option value="spam">Spam / Manipulation</option>
                      <option value="harassment">Harassment</option>
                      <option value="inappropriate">Inappropriate Content</option>
                      <option value="other">Other Violation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="mod-target-id" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Content ID
                  </label>
                  <input
                    id="mod-target-id"
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="24-char Mongo ObjectId of post, stream, or podcast"
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {reason === 'copyright' && (
                  <div className="space-y-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                      <Copyright className="h-3.5 w-3.5" />
                      Rights Holder Attribution
                    </div>
                    <input
                      type="text"
                      value={workTitle}
                      onChange={(e) => setWorkTitle(e.target.value)}
                      placeholder="Original work title"
                      className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={rightsHolder}
                      onChange={(e) => setRightsHolder(e.target.value)}
                      placeholder="Rights holder name or entity"
                      className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="url"
                      value={referenceUrl}
                      onChange={(e) => setReferenceUrl(e.target.value)}
                      placeholder="Reference URL (optional)"
                      className="w-full rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="mod-details" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Evidence & Details
                  </label>
                  <textarea
                    id="mod-details"
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide timestamps, infringement context, or policy details"
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </section>

            <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  My Reports & Appeals
                </h2>
                <span className="text-xs text-slate-500">{myReports.length} submitted</span>
              </div>

              {myReports.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  No moderation or copyright reports filed by this account.
                </div>
              ) : (
                <div className="space-y-3">
                  {myReports.map((rep) => (
                    <div
                      key={rep._id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold uppercase text-slate-900 dark:text-white">
                            {rep.reason} · {rep.targetType}
                          </span>
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {rep.status}
                          </span>
                          {rep.resolutionAction && rep.resolutionAction !== 'none' && (
                            <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] text-purple-700 dark:text-purple-300">
                              {rep.resolutionAction.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        {rep.status !== 'open' && rep.appealStatus === 'none' && (
                          <button
                            type="button"
                            onClick={() => setAppealingId(rep._id)}
                            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                          >
                            Appeal Decision
                          </button>
                        )}
                      </div>
                      {rep.copyrightClaim?.workTitle && (
                        <p className="text-slate-600 dark:text-slate-300">
                          Work: <strong>{rep.copyrightClaim.workTitle}</strong> —{' '}
                          {rep.copyrightClaim.rightsHolder}
                        </p>
                      )}
                      {rep.details && <p className="text-slate-500 dark:text-slate-400">{rep.details}</p>}

                      {appealingId === rep._id && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                          <input
                            type="text"
                            value={appealText}
                            onChange={(e) => setAppealText(e.target.value)}
                            placeholder="Explain why this resolution should be reconsidered (min 10 chars)"
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => void handleAppeal(rep._id)}
                            className="rounded-lg bg-slate-900 dark:bg-purple-600 px-3 py-1.5 text-xs font-medium text-white"
                          >
                            Send Appeal
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {isAdmin && (
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Admin Review Queue
                  </h2>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={copyrightOnly}
                    onChange={(e) => setCopyrightOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Copyright / DMCA claims only
                </label>
              </div>

              {queueReports.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">Queue is clear.</p>
              ) : (
                <div className="space-y-3">
                  {queueReports.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          [{item.reason.toUpperCase()}] {item.targetType} #{item.postId || item.targetId}
                        </div>
                        {item.copyrightClaim?.workTitle && (
                          <div className="text-slate-600 dark:text-slate-300">
                            Claim: {item.copyrightClaim.workTitle} ({item.copyrightClaim.rightsHolder})
                          </div>
                        )}
                        <div className="text-slate-500">
                          Status: {item.status} · Action: {item.resolutionAction || 'none'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleAdminResolve(item._id, 'hide_content')}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          Hide
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAdminResolve(item._id, 'copyright_takedown')}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-700"
                        >
                          <Copyright className="h-3.5 w-3.5" />
                          Takedown
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAdminResolve(item._id, 'restore_content')}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 font-medium"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleAdminResolve(item._id, 'dismiss')}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 font-medium"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
