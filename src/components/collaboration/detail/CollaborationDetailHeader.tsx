'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface CollaborationDetailHeaderProps {
  title: string;
  description?: string;
  isOwner: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  onToggleEdit: () => void;
  onDelete: () => void;
}

const CollaborationDetailHeader: React.FC<CollaborationDetailHeaderProps> = ({
  title,
  description,
  isOwner,
  isEditing,
  isSubmitting,
  onToggleEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          {title}
        </h1>
        <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
          {description}
        </p>
      </div>
      {isOwner && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleEdit}
            disabled={isSubmitting}
            className="text-xs text-gray-600 border-gray-300 sm:text-sm hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {isEditing ? 'Close' : 'Edit'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isSubmitting}
            className="text-xs text-red-600 border-red-200 sm:text-sm hover:bg-red-50 dark:border-red-500/40"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default CollaborationDetailHeader;
