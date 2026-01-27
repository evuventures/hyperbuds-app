'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Collaboration } from '@/types/collaboration.types';
import type { EditFormState } from './types';

interface CollaborationEditFormProps {
  editForm: EditFormState;
  typeOptions: Collaboration['type'][];
  platformOptions: string[];
  isSubmitting: boolean;
  onChange: (patch: Partial<EditFormState>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

const CollaborationEditForm: React.FC<CollaborationEditFormProps> = ({
  editForm,
  typeOptions,
  platformOptions,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Title</label>
          <input
            value={editForm.title}
            onChange={(event) => onChange({ title: event.target.value })}
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Type</label>
          <select
            value={editForm.type}
            onChange={(event) => onChange({ type: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
        <textarea
          value={editForm.description}
          onChange={(event) => onChange({ description: event.target.value })}
          required
          rows={4}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Scheduled Date</label>
          <input
            type="date"
            value={editForm.scheduledDate}
            onChange={(event) => onChange({ scheduledDate: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Duration (minutes)</label>
          <input
            type="number"
            min="1"
            value={editForm.duration}
            onChange={(event) => onChange({ duration: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</label>
          <input
            value={editForm.location}
            onChange={(event) => onChange({ location: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Platforms</label>
        <div className="flex flex-wrap gap-2">
          {platformOptions.map((platform) => (
            <button
              type="button"
              key={platform}
              onClick={() =>
                onChange({
                  platforms: editForm.platforms.includes(platform)
                    ? editForm.platforms.filter((item) => item !== platform)
                    : [...editForm.platforms, platform],
                })
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                editForm.platforms.includes(platform)
                  ? 'border-purple-500 bg-purple-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Requirements</label>
          <input
            value={editForm.requirements}
            onChange={(event) => onChange({ requirements: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Tags</label>
          <input
            value={editForm.tags}
            onChange={(event) => onChange({ tags: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Compensation Type</label>
          <select
            value={editForm.compensationType}
            onChange={(event) =>
              onChange({ compensationType: event.target.value as EditFormState['compensationType'] })
            }
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            {['none', 'revenue_share', 'fixed_fee', 'barter'].map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
          <input
            type="number"
            min="0"
            value={editForm.compensationAmount}
            onChange={(event) => onChange({ compensationAmount: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Currency</label>
          <input
            value={editForm.compensationCurrency}
            onChange={(event) => onChange({ compensationCurrency: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Theme</label>
          <input
            value={editForm.theme}
            onChange={(event) => onChange({ theme: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Target Audience</label>
          <input
            value={editForm.targetAudience}
            onChange={(event) => onChange({ targetAudience: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Hashtags</label>
          <input
            value={editForm.hashtags}
            onChange={(event) => onChange({ hashtags: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Goals</label>
          <input
            value={editForm.goals}
            onChange={(event) => onChange({ goals: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editForm.isPublic}
          onChange={(event) => onChange({ isPublic: event.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <span className="text-sm text-gray-600 dark:text-gray-300">Show in marketplace</span>
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="text-xs sm:text-sm bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
      >
        Save Changes
      </Button>
    </form>
  );
};

export default CollaborationEditForm;
