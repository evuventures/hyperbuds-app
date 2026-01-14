// src/components/layout/Header/NotificationDropdown.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, useMarkAllNotificationsAsRead, useUnreadNotificationCount } from '@/hooks/features/useNotifications';
import { NotificationItem } from '@/components/features/notifications/NotificationItem';
import { Loader2 } from 'lucide-react';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  anchorRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error, refetch } = useNotifications({ limit: 10 });
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const { unreadCount } = useUnreadNotificationCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const notifications = data?.notifications || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 z-50 py-2 mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-purple-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 rounded-lg hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Mark all as read
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-96 notification-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-3 w-12 h-12 text-gray-300 dark:text-gray-600" />
                <p className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Unable to load notifications
                </p>
                <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                  The notification service may not be available yet.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 break-all">
                    {error instanceof Error ? error.message : 'Unknown error'}
                  </p>
                )}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto mb-2 w-12 h-12 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
              <a
                href="/notifications"
                className="block w-full py-2 text-sm font-medium text-center text-purple-600 rounded-lg hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 transition-colors"
              >
                View all notifications
              </a>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;

