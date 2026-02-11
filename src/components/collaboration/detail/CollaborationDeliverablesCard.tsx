'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
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
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deliverables</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Track deliverables for this collaboration.
      </p>

      {canEdit && (
        <form onSubmit={onAddDeliverable} className="mt-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={deliverableForm.title}
              onChange={(event) => onChangeForm({ title: event.target.value })}
              required
              placeholder="Deliverable title"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={deliverableForm.assignedTo}
              onChange={(event) => onChangeForm({ assignedTo: event.target.value })}
              placeholder="Assigned user ID (optional)"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <textarea
            value={deliverableForm.description}
            onChange={(event) => onChangeForm({ description: event.target.value })}
            placeholder="Deliverable description"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            rows={3}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="date"
              value={deliverableForm.dueDate}
              onChange={(event) => onChangeForm({ dueDate: event.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
            <input
              value={deliverableForm.files}
              onChange={(event) => onChangeForm({ files: event.target.value })}
              placeholder="File URLs (comma separated)"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs sm:text-sm bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Add Deliverable
          </Button>
        </form>
      )}

      {deliverables.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Existing Deliverables</h3>
          {deliverables.map((deliverable) => (
            <div
              key={deliverable._id}
              className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{deliverable.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {deliverable.description || 'No description'}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={deliverableUpdates[deliverable._id || '']?.status || deliverable.status}
                      onChange={(event) =>
                        deliverable._id &&
                        onChangeUpdate(deliverable._id, { status: event.target.value })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deliverable._id && onUpdateDeliverable(deliverable._id)}
                      className="text-xs"
                    >
                      Update
                    </Button>
                  </div>
                )}
              </div>
              {canEdit && (
                <input
                  value={deliverableUpdates[deliverable._id || '']?.files || ''}
                  onChange={(event) =>
                    deliverable._id && onChangeUpdate(deliverable._id, { files: event.target.value })
                  }
                  placeholder="File URLs (comma separated)"
                  className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollaborationDeliverablesCard;
