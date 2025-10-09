'use client';

import React from 'react';
import { RefreshCw, Check, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSocialSync } from '@/hooks/features/useSocialSync';
import type { PlatformType, UnifiedPlatformData } from '@/types/platform.types';

interface SyncPlatformButtonProps {
  platform: PlatformType;
  platformData: UnifiedPlatformData;
  variant?: 'default' | 'compact';
  onSyncComplete?: () => void;
}

export const SyncPlatformButton: React.FC<SyncPlatformButtonProps> = ({
  platform,
  platformData,
  variant = 'default',
  onSyncComplete,
}) => {
  const { syncPlatform, isSyncingPlatform } = useSocialSync();
  const [justSynced, setJustSynced] = React.useState(false);

  const isSyncing = isSyncingPlatform(platform);

  const handleSync = async () => {
    try {
      await syncPlatform(platform, platformData);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
      onSyncComplete?.();
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={handleSync}
        disabled={isSyncing || justSynced}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${justSynced
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Syncing...
          </>
        ) : justSynced ? (
          <>
            <Check className="w-4 h-4" />
            Synced!
          </>
        ) : (
          <>
            <Database className="w-4 h-4" />
            Sync
          </>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleSync}
      disabled={isSyncing || justSynced}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md
        ${justSynced
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
        }
        disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg
      `}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" />
          Syncing to Database...
        </>
      ) : justSynced ? (
        <>
          <Check className="w-5 h-5" />
          Successfully Synced!
        </>
      ) : (
        <>
          <Database className="w-5 h-5" />
          Sync to Database
        </>
      )}
    </motion.button>
  );
};

export default SyncPlatformButton;

