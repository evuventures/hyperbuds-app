'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { InviteFormState } from './types';

interface CollaborationInviteFormProps {
  inviteForm: InviteFormState;
  isSubmitting: boolean;
  onChange: (patch: Partial<InviteFormState>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

const CollaborationInviteForm: React.FC<CollaborationInviteFormProps> = ({
  inviteForm,
  isSubmitting,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Collaborator</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Invite a creator by user ID and assign a role.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          value={inviteForm.username}
          onChange={(event) => onChange({ username: event.target.value })}
          required
          placeholder="User ID"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={inviteForm.role}
            onChange={(event) => onChange({ role: event.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          >
            <option value="co-creator">Co-creator</option>
            <option value="featured">Featured</option>
            <option value="guest">Guest</option>
          </select>
          <input
            value={inviteForm.message}
            onChange={(event) => onChange({ message: event.target.value })}
            placeholder="Optional message"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="text-xs sm:text-sm bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          Send Invite
        </Button>
      </form>
    </div>
  );
};

export default CollaborationInviteForm;
