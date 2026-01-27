'use client';

import React from 'react';
import type { Collaboration } from '@/types/collaboration.types';
import { Calendar, Users } from 'lucide-react';

const formatDate = (value?: string) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString();
};

const getUserLabel = (creator: Collaboration['creator']) => {
  if (!creator) return 'Creator';
  if (typeof creator === 'string') return 'Creator';
  return creator.displayName || creator.username || creator.email || 'Creator';
};

interface InvitesTableProps {
  invites: Collaboration[];
  onSelect: (invite: Collaboration) => void;
}

const InvitesTable: React.FC<InvitesTableProps> = ({ invites, onSelect }) => {
  if (!invites.length) {
    return (
      <div className="py-16 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/40">
        <p className="text-sm text-gray-500 dark:text-gray-400">No pending invites right now.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/70">
        <div className="col-span-5">Collaboration</div>
        <div className="col-span-3">Creator</div>
        <div className="col-span-2">Scheduled</div>
        <div className="col-span-2 text-right">Status</div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {invites.map((invite) => (
          <button
            key={invite._id}
            type="button"
            onClick={() => onSelect(invite)}
            className="w-full text-left transition hover:bg-gray-50 dark:hover:bg-gray-800/60"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-5 md:px-6 py-4">
              <div className="md:col-span-5">
                <p className="font-semibold text-gray-900 dark:text-white">{invite.title}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {invite.description || 'No description'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {invite.type?.replace(/_/g, ' ') || 'Collaboration'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {invite.collaborators?.length || 0} collaborators
                  </span>
                </div>
              </div>
              <div className="md:col-span-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="block text-xs uppercase tracking-wide text-gray-400 md:hidden">Creator</span>
                {getUserLabel(invite.creator)}
              </div>
              <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 hidden md:inline-block" />
                <span className="block text-xs uppercase tracking-wide text-gray-400 md:hidden">Scheduled</span>
                {formatDate(invite.details?.scheduledDate)}
              </div>
              <div className="md:col-span-2 md:text-right">
                <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {invite.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvitesTable;
