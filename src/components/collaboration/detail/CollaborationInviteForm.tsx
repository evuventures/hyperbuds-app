'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { CreatorHandlePicker } from '@/components/collaboration/CreatorHandlePicker';
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        Invite Collaborator
      </h2>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        Search by <span className="font-medium text-slate-700 dark:text-slate-300">@username</span> or creator name and assign a role.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <CreatorHandlePicker
          value={inviteForm.username}
          disabled={isSubmitting}
          placeholder="Type @username or creator name…"
          onChange={(val) => onChange({ username: val })}
          onSelect={(creator) => onChange({ username: `@${creator.username}` })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={inviteForm.role}
            onChange={(event) => onChange({ role: event.target.value })}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400"
          >
            <option value="co-creator">Co-creator</option>
            <option value="featured">Featured</option>
            <option value="guest">Guest</option>
          </select>
          <input
            value={inviteForm.message}
            onChange={(event) => onChange({ message: event.target.value })}
            disabled={isSubmitting}
            placeholder="Optional invite note"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !inviteForm.username.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? 'Sending…' : 'Send Invite'}
        </button>
      </form>
    </div>
  );
};

export default CollaborationInviteForm;
