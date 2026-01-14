// Notification Types

export type NotificationType = 
  | 'match'
  | 'message'
  | 'collaboration'
  | 'collaboration_invite'
  | 'collaboration_accepted'
  | 'collaboration_rejected'
  | 'collaboration_scheduled'
  | 'marketplace_order'
  | 'marketplace_review'
  | 'streaming_invite'
  | 'payment_received'
  | 'payment_failed'
  | 'system'
  | 'new_follower'
  | 'achievement';

export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

export interface NotificationPreferences {
  email: {
    match: boolean;
    message: boolean;
    collaboration: boolean;
    marketplace: boolean;
    payment: boolean;
    system: boolean;
  };
  push: {
    match: boolean;
    message: boolean;
    collaboration: boolean;
    marketplace: boolean;
    payment: boolean;
    system: boolean;
  };
  inApp: {
    match: boolean;
    message: boolean;
    collaboration: boolean;
    marketplace: boolean;
    payment: boolean;
    system: boolean;
  };
}

export interface UpdateNotificationPreferencesRequest {
  email?: Partial<NotificationPreferences['email']>;
  push?: Partial<NotificationPreferences['push']>;
  inApp?: Partial<NotificationPreferences['inApp']>;
}

export interface MarkAsReadResponse {
  success: boolean;
  message: string;
  notification?: Notification;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
  count: number;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

// Query params for getting notifications
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  read?: boolean;
}





