'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { Collaboration } from '@/types/collaboration.types';

interface CollaborationStatusCardProps {
  status: Collaboration['status'];
  statusOptions: Collaboration['status'][];
  isSubmitting: boolean;
  onChange: (value: Collaboration['status']) => void;
  onUpdate: () => void;
}

const CollaborationStatusCard: React.FC<CollaborationStatusCardProps> = ({
  status,
  statusOptions,
  isSubmitting,
  onChange,
  onUpdate,
}) => {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Update Status</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Keep your collaboration state up to date.
      </p>
      <div className="mt-4 space-y-3">
        <select
          value={status}
          onChange={(event) => onChange(event.target.value as Collaboration['status'])}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onUpdate}
          className="text-xs sm:text-sm bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Update Status
        </Button>
      </div>
    </div>
  );
};

export default CollaborationStatusCard;
