'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { ReviewFormState } from './types';

interface CollaborationReviewCardProps {
  reviewForm: ReviewFormState;
  isSubmitting: boolean;
  onChange: (patch: Partial<ReviewFormState>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

const CollaborationReviewCard: React.FC<CollaborationReviewCardProps> = ({
  reviewForm,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Leave a Review</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Share feedback about this collaboration.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={reviewForm.rating}
            onChange={(event) => onChange({ rating: event.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={String(value)}>
                {value} Stars
              </option>
            ))}
          </select>
          <input
            value={reviewForm.comment}
            onChange={(event) => onChange({ comment: event.target.value })}
            placeholder="Optional comment"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-xs sm:text-sm bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Submit Review
        </Button>
      </form>
    </div>
  );
};

export default CollaborationReviewCard;
