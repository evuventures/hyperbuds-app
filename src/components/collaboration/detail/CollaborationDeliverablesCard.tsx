'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, Plus, Paperclip } from 'lucide-react';
import type { CollaborationDeliverable } from '@/types/collaboration.types';
import type { DeliverableFormState, DeliverableUpdateState } from './types';

interface CollaborationDeliverablesCardProps {
  deliverables: CollaborationDeliverable[];
  deliverableForm: DeliverableFormState;
  deliverableUpdates: DeliverableUpdateState;
  isSubmitting: boolean;
  canEdit: boolean;
  onChangeForm: (patch: Partial<DeliverableFormState>) => void;
  onChangeUpdate: (id: string, patch: { status?: string; files?: string }) => void;
  onAddDeliverable: (event: React.FormEvent) => void;
  onUpdateDeliverable: (deliverableId: string) => void;
}

const StatusIcon = ({ status }: { status?: string }) => {
  if (status === 'completed' || status === 'approved') {
    return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />;
  }
  if (status === 'in_progress' || status === 'submitted') {
    return <Clock size={15} className="text-indigo-500 shrink-0" />;
  }
  return <Circle size={15} className="text-slate-400 shrink-0" />;
};

const CollaborationDeliverablesCard: React.FC<CollaborationDeliverablesCardProps> = ({
  deliverables,
  deliverableForm,
  deliverableUpdates,
  isSubmitting,
  canEdit,
  onChangeForm,
  onChangeUpdate,
  onAddDeliverable,
  onUpdateDeliverable,
}) => {
  const completedCount = deliverables.filter(
    (d) => String(d.status) === 'completed' || String(d.status) === 'approved'
  ).length;
  const progressPct =
    deliverables.length > 0 ? Math.round((completedCount / deliverables.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Linear Issue List Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Deliverables
          </h2>
          <span className="rounded-md bg-slate-200/80 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {deliverables.length}
          </span>
          <p className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
            Track deliverables for this collaboration.
          </p>
        </div>

        {deliverables.length > 0 && (
          <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {completedCount}/{deliverables.length} done ({progressPct}%)
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Existing Deliverables (Linear Issue Rows) */}
      {deliverables.length > 0 ? (
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          <div className="px-5 py-2 bg-slate-50/40 dark:bg-slate-950/30 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Existing Deliverables
            </h3>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Status &amp; artifacts
            </span>
          </div>
          {deliverables.map((deliverable, index) => {
            const currentStatus =
              deliverableUpdates[deliverable._id || '']?.status || deliverable.status;
            const issueKey = `DEL-${String(index + 1).padStart(2, '0')}`;
            return (
              <div
                key={deliverable._id || index}
                className="px-5 py-3.5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="mt-0.5">
                      <StatusIcon status={currentStatus} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-medium text-slate-400 dark:text-slate-500">
                          {issueKey}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">
                          {deliverable.title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {deliverable.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {canEdit ? (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <select
                        value={currentStatus}
                        onChange={(event) =>
                          deliverable._id &&
                          onChangeUpdate(deliverable._id, { status: event.target.value })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deliverable._id && onUpdateDeliverable(deliverable._id)}
                        className="h-7 px-2.5 text-xs"
                      >
                        Update
                      </Button>
                    </div>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {String(currentStatus || 'pending').replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                {canEdit && (
                  <div className="mt-2.5 pl-6 flex items-center gap-2">
                    <Paperclip size={13} className="text-slate-400 shrink-0" />
                    <input
                      value={deliverableUpdates[deliverable._id || '']?.files || ''}
                      onChange={(event) =>
                        deliverable._id &&
                        onChangeUpdate(deliverable._id, { files: event.target.value })
                      }
                      placeholder="File URLs (comma separated)"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          No deliverables created yet. Add the first deliverable below to track milestones.
        </div>
      )}

      {/* Linear Compact Issue Composer */}
      {canEdit && (
        <form
          onSubmit={onAddDeliverable}
          className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-3 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Plus size={14} className="text-indigo-500" />
            <span>New Deliverable</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={deliverableForm.title}
              onChange={(event) => onChangeForm({ title: event.target.value })}
              required
              placeholder="Deliverable title"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              value={deliverableForm.assignedTo}
              onChange={(event) => onChangeForm({ assignedTo: event.target.value })}
              placeholder="Assigned user ID (optional)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <textarea
            value={deliverableForm.description}
            onChange={(event) => onChangeForm({ description: event.target.value })}
            placeholder="Deliverable description"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            rows={2}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={deliverableForm.dueDate}
              onChange={(event) => onChangeForm({ dueDate: event.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              value={deliverableForm.files}
              onChange={(event) => onChangeForm({ files: event.target.value })}
              placeholder="File URLs (comma separated)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs sm:text-sm bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Add Deliverable
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CollaborationDeliverablesCard;
