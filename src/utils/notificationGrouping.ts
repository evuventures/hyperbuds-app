// src/utils/notificationGrouping.ts

import type { Notification } from '@/types/notifications.types';

export interface GroupedNotification {
  id: string;
  type: 'single' | 'grouped';
  notifications: Notification[];
  title: string;
  message: string;
  unreadCount: number;
  createdAt: string;
  latestNotification: Notification;
}

/**
 * Group notifications by type and time window
 */
export function groupNotifications(
  notifications: Notification[],
  groupWindowMinutes: number = 5
): GroupedNotification[] {
  if (notifications.length === 0) return [];

  // Sort by creation time (newest first)
  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups: Map<string, Notification[]> = new Map();

  sorted.forEach((notification) => {
    const key = `${notification.type}-${notification.userId || 'system'}`;
    const existingGroup = groups.get(key);

    if (existingGroup && existingGroup.length > 0) {
      const latestInGroup = existingGroup[0];
      const timeDiff =
        (new Date(latestInGroup.createdAt).getTime() - new Date(notification.createdAt).getTime()) /
        (1000 * 60); // minutes

      // Group if within time window and same type
      if (timeDiff <= groupWindowMinutes) {
        existingGroup.push(notification);
      } else {
        // Create new group
        groups.set(key, [notification]);
      }
    } else {
      // Create new group
      groups.set(key, [notification]);
    }
  });

  // Convert groups to GroupedNotification format
  const result: GroupedNotification[] = [];

  groups.forEach((groupNotifications, key) => {
    if (groupNotifications.length === 1) {
      // Single notification
      const notif = groupNotifications[0];
      result.push({
        id: notif.id,
        type: 'single',
        notifications: [notif],
        title: notif.title,
        message: notif.message,
        unreadCount: notif.read ? 0 : 1,
        createdAt: notif.createdAt,
        latestNotification: notif,
      });
    } else {
      // Grouped notifications
      const unreadCount = groupNotifications.filter((n) => !n.read).length;
      const latest = groupNotifications[0];
      const type = latest.type;
      
      // Create group title and message
      const typeLabels: Record<string, string> = {
        match: 'New Matches',
        message: 'New Messages',
        collaboration: 'Collaboration Updates',
        collaboration_invite: 'Collaboration Invites',
        collaboration_accepted: 'Accepted Collaborations',
        collaboration_rejected: 'Rejected Collaborations',
        collaboration_scheduled: 'Scheduled Collaborations',
        marketplace_order: 'Marketplace Orders',
        marketplace_review: 'Marketplace Reviews',
        streaming_invite: 'Streaming Invites',
        payment_received: 'Payments Received',
        payment_failed: 'Payment Issues',
        system: 'System Notifications',
        new_follower: 'New Followers',
        achievement: 'Achievements',
      };

      result.push({
        id: `group-${key}-${latest.id}`,
        type: 'grouped',
        notifications: groupNotifications,
        title: typeLabels[type] || 'Notifications',
        message: `${groupNotifications.length} ${typeLabels[type] || 'notifications'}`,
        unreadCount,
        createdAt: latest.createdAt,
        latestNotification: latest,
      });
    }
  });

  // Sort by latest notification time
  return result.sort(
    (a, b) =>
      new Date(b.latestNotification.createdAt).getTime() -
      new Date(a.latestNotification.createdAt).getTime()
  );
}

/**
 * Expand grouped notification
 */
export function expandGroupedNotification(
  grouped: GroupedNotification
): Notification[] {
  return grouped.notifications;
}

