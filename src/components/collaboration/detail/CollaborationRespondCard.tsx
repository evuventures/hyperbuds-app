'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CollaborationRespondCardProps {
  isSubmitting: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const CollaborationRespondCard: React.FC<CollaborationRespondCardProps> = ({
  isSubmitting,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Respond to Invite</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Accept or decline the collaboration invite.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onAccept}
          className="text-xs sm:text-sm bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          Accept
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onDecline}
          variant="outline"
          className="text-xs text-red-600 border-red-300 sm:text-sm hover:bg-red-50 dark:border-red-500/40"
        >
          Decline
        </Button>
      </div>
    </div>
  );
};

export default CollaborationRespondCard;
