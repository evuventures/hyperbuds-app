'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Collaboration } from '@/types/collaboration.types';

interface InviteDecisionModalProps {
  invite: Collaboration | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

const InviteDecisionModal: React.FC<InviteDecisionModalProps> = ({
  invite,
  isOpen,
  isSubmitting,
  onClose,
  onAccept,
  onDecline,
}) => {
  if (!isOpen || !invite) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Collaboration Invite</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {invite.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            aria-label="Close invite"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">About this collaboration</p>
            <p className="mt-2">{invite.description || 'No description provided.'}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/40 dark:bg-emerald-500/10">
              <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">Accept Invite</h3>
              <p className="mt-1 text-xs text-emerald-700/70 dark:text-emerald-200/70">
                Join the collaboration and start working with the creator.
              </p>
              <button
                type="button"
                onClick={onAccept}
                disabled={isSubmitting}
                className="mt-4 w-full rounded-xl bg-linear-to-r from-emerald-500 to-green-500 px-4 py-3 text-xs font-bold uppercase text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Processing...' : 'Accept Invite'}
              </button>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/40 dark:bg-red-500/10">
              <h3 className="text-base font-semibold text-red-700 dark:text-red-300">Decline Invite</h3>
              <p className="mt-1 text-xs text-red-700/70 dark:text-red-200/70">
                Pass on this invite. The creator will be notified.
              </p>
              <button
                type="button"
                onClick={onDecline}
                disabled={isSubmitting}
                className="mt-4 w-full rounded-xl border border-red-400 bg-white px-4 py-3 text-xs font-bold uppercase text-red-600 transition-all hover:bg-red-50 dark:border-red-500 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-500/10 disabled:opacity-60"
              >
                {isSubmitting ? 'Processing...' : 'Decline Invite'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteDecisionModal;
