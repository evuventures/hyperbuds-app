// src/components/features/notifications/NotificationCenter.tsx

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/hooks/features/useNotifications';
import { NotificationItem } from './NotificationItem';
import { useNotificationSocket } from '@/hooks/features/useNotificationSocket';
import { groupNotifications } from '@/utils/notificationGrouping';
import type { Notification, NotificationType } from '@/types/notifications.types';

export const NotificationCenter: React.FC = () => {
   const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
   const [page, setPage] = useState(1);
   const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
   const [groupedView, setGroupedView] = useState(true);
   const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
   const limit = 20;
   const observerRef = useRef<HTMLDivElement>(null);

   const { data, isLoading, error, refetch } = useNotifications({
      page,
      limit,
      read: filter === 'unread' ? false : undefined,
      type: filter !== 'all' && filter !== 'unread' ? filter : undefined,
   });

   const markAllAsReadMutation = useMarkAllNotificationsAsRead();

   // Connect to WebSocket for real-time updates
   useNotificationSocket({
      enabled: true,
   });

   // Accumulate notifications for infinite scroll
   useEffect(() => {
      if (data?.notifications) {
         if (page === 1) {
            setAllNotifications(data.notifications);
         } else {
            setAllNotifications((prev) => [...prev, ...data.notifications]);
         }
      }
   }, [data, page]);

   // Reset when filter changes
   useEffect(() => {
      setPage(1);
      setAllNotifications([]);
      setExpandedGroups(new Set());
   }, [filter]);

   const notifications = allNotifications;
   const unreadCount = data?.unreadCount || 0;
   const hasMore = data?.hasMore || false;

   // Group notifications if enabled
   const groupedNotifications = groupedView
      ? groupNotifications(notifications, 5)
      : notifications.map((n) => ({
         id: n.id,
         type: 'single' as const,
         notifications: [n],
         title: n.title,
         message: n.message,
         unreadCount: n.read ? 0 : 1,
         createdAt: n.createdAt,
         latestNotification: n,
      }));

   const handleMarkAllAsRead = () => {
      markAllAsReadMutation.mutate();
   };

   // Infinite scroll observer
   const handleObserver = useCallback(
      (entries: IntersectionObserverEntry[]) => {
         const [target] = entries;
         if (target.isIntersecting && hasMore && !isLoading) {
            setPage((prev) => prev + 1);
         }
      },
      [hasMore, isLoading]
   );

   useEffect(() => {
      const element = observerRef.current;
      const option = { threshold: 0.1 };

      const observer = new IntersectionObserver(handleObserver, option);
      if (element) observer.observe(element);

      return () => {
         if (element) observer.unobserve(element);
      };
   }, [handleObserver]);

   const toggleGroupExpansion = (groupId: string) => {
      setExpandedGroups((prev) => {
         const next = new Set(prev);
         if (next.has(groupId)) {
            next.delete(groupId);
         } else {
            next.add(groupId);
         }
         return next;
      });
   };

   const filterOptions: Array<{ value: 'all' | 'unread' | NotificationType; label: string }> = [
      { value: 'all', label: 'All' },
      { value: 'unread', label: 'Unread' },
      { value: 'match', label: 'Matches' },
      { value: 'message', label: 'Messages' },
      { value: 'collaboration', label: 'Collaborations' },
      { value: 'marketplace_order', label: 'Marketplace' },
      { value: 'payment_received', label: 'Payments' },
      { value: 'system', label: 'System' },
   ];

   return (
      <div className="flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-gray-900">
         {/* Header */}
         <div className="sticky top-0 z-10 px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                     Notifications
                     {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 text-sm font-bold text-white bg-purple-500 rounded-full">
                           {unreadCount}
                        </span>
                     )}
                  </h1>
               </div>

               <div className="flex items-center gap-2">
                  {/* Group toggle */}
                  <button
                     onClick={() => setGroupedView(!groupedView)}
                     className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${groupedView
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                  >
                     {groupedView ? 'Grouped' : 'List'}
                  </button>

                  {unreadCount > 0 && (
                     <button
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {markAllAsReadMutation.isPending ? (
                           <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                           <CheckCheck className="w-4 h-4" />
                        )}
                        Mark all as read
                     </button>
                  )}
               </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
               {filterOptions.map((option) => (
                  <button
                     key={option.value}
                     onClick={() => {
                        setFilter(option.value);
                        setPage(1);
                     }}
                     className={`
                px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                ${filter === option.value
                           ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }
              `}
                  >
                     {option.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Content */}
         <div className="flex-1 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading notifications...</p>
               </div>
            ) : error ? (
               <div className="flex flex-col items-center justify-center py-16">
                  <Bell className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                     Unable to load notifications
                  </p>
                  <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                     The notification service may not be available yet. Please check back later or contact support if the issue persists.
                  </p>
                  <button
                     onClick={() => refetch()}
                     className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
                  >
                     Try Again
                  </button>
                  {process.env.NODE_ENV === 'development' && (
                     <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 break-all max-w-md text-center">
                        {error instanceof Error ? error.message : 'Unknown error'}
                     </p>
                  )}
               </div>
            ) : notifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-16">
                  <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                     No notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                     {filter === 'unread'
                        ? "You're all caught up! No unread notifications."
                        : 'You have no notifications yet.'}
                  </p>
               </div>
            ) : (
               <div className="p-6 space-y-3">
                  {groupedNotifications.map((group) => {
                     if (group.type === 'single') {
                        return (
                           <NotificationItem
                              key={group.id}
                              notification={group.latestNotification}
                           />
                        );
                     }

                     // Grouped notification
                     const isExpanded = expandedGroups.has(group.id);
                     const displayNotifications = isExpanded
                        ? group.notifications
                        : [group.latestNotification];

                     return (
                        <div key={group.id} className="border border-purple-200 dark:border-purple-800 rounded-xl overflow-hidden bg-purple-50/50 dark:bg-purple-900/10">
                           {/* Group header */}
                           <button
                              onClick={() => toggleGroupExpansion(group.id)}
                              className="flex items-center justify-between w-full px-4 py-3 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="flex justify-center items-center w-8 h-8 text-purple-600 bg-purple-200 rounded-lg dark:text-purple-400 dark:bg-purple-900/50">
                                    <Bell className="w-4 h-4" />
                                 </div>
                                 <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                       {group.title}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                       {group.notifications.length} notifications
                                       {group.unreadCount > 0 && ` • ${group.unreadCount} unread`}
                                    </p>
                                 </div>
                              </div>
                              {isExpanded ? (
                                 <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              ) : (
                                 <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              )}
                           </button>

                           {/* Group content */}
                           {displayNotifications.map((notification, index) => (
                              <div
                                 key={notification.id}
                                 className={index !== displayNotifications.length - 1 ? 'border-b border-purple-200 dark:border-purple-800' : ''}
                              >
                                 <NotificationItem notification={notification} compact />
                              </div>
                           ))}
                        </div>
                     );
                  })}

                  {/* Infinite scroll trigger */}
                  {hasMore && (
                     <div ref={observerRef} className="flex justify-center py-4">
                        {isLoading && (
                           <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        )}
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
};

export default NotificationCenter;

