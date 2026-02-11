'use client';

import React from 'react';
import type { Collaboration } from '@/types/collaboration.types';

interface CollaborationSummaryCardsProps {
  collaboration: Collaboration;
}

const CollaborationSummaryCards: React.FC<CollaborationSummaryCardsProps> = ({ collaboration }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">Status</p>
        <p className="capitalize">{collaboration.status.replace(/_/g, ' ')}</p>
      </div>
      <div className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">Type</p>
        <p className="capitalize">{collaboration.type.replace(/_/g, ' ')}</p>
      </div>
      <div className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">Scheduled Date</p>
        <p>
          {collaboration.details?.scheduledDate
            ? new Date(collaboration.details.scheduledDate).toLocaleDateString()
            : 'TBD'}
        </p>
      </div>
      <div className="rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">Collaborators</p>
        <p>{collaboration.collaborators?.length || 0}</p>
      </div>
    </div>
  );
};

export default CollaborationSummaryCards;
