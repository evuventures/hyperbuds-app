// src/lib/api/notifications.api.ts

import { apiClient } from './client';
import type {
  NotificationsResponse,
  NotificationPreferences,
  UpdateNotificationPreferencesRequest,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
  DeleteNotificationResponse,
  GetNotificationsParams,
  Notification,
  NotificationType,
  ApiNotificationsResponse,
  ApiNotification,
  ApiMarkAsReadResponse,
  ApiMarkAllAsReadResponse,
} from '@/types/notifications.types';

const notificationTypeMap: Record<string, NotificationType> = {
  collaboration: 'collaboration',
  payment: 'payment_received',
  match: 'match',
  system: 'system',
  social: 'new_follower',
  engagement: 'achievement',
  reminder: 'system',
  marketplace: 'marketplace_order',
  analytics: 'system',
};

function mapNotificationType(apiType: string): NotificationType {
  return notificationTypeMap[apiType] ?? 'system';
}

function getUserIdFromMetadata(metadata?: Record<string, unknown>): string | undefined {
  if (!metadata) {
    return undefined;
  }

  const requesterId = metadata['requesterId'];
  if (typeof requesterId === 'string') {
    return requesterId;
  }

  const senderId = metadata['senderId'];
  if (typeof senderId === 'string') {
    return senderId;
  }

  return undefined;
}

/**
 * Map API notification to frontend notification format
 */
function mapApiNotificationToNotification(apiNotif: ApiNotification): Notification {
  return {
    id: apiNotif.id,
    userId: getUserIdFromMetadata(apiNotif.metadata),
    type: mapNotificationType(apiNotif.type),
    title: apiNotif.title,
    message: apiNotif.message,
    read: apiNotif.isRead,
    actionUrl: apiNotif.actionUrl,
    metadata: apiNotif.metadata,
    createdAt: apiNotif.timestamp,
    updatedAt: undefined,
  };
}

/**
 * Map API notifications response to frontend notifications response format
 */
function mapApiResponseToNotificationsResponse(
  apiResponse: ApiNotificationsResponse
): NotificationsResponse {
  const mappedNotifications = apiResponse.notifications.map(mapApiNotificationToNotification);
  const pagination = apiResponse.pagination;

  return {
    success: true,
    notifications: mappedNotifications,
    total: apiResponse.summary.total,
    unreadCount: apiResponse.summary.unread,
    page: pagination.page,
    limit: pagination.limit,
    hasMore: pagination.page < pagination.pages,
  };
}

export const notificationsApi = {
  /**
   * Get all notifications for the current user
   * GET /dashboard/notifications
   */
  getNotifications: async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    // Map frontend 'read' param to API 'isRead' param
    if (params?.read !== undefined) {
      queryParams.append('isRead', params.read.toString());
    }

    const url = `/dashboard/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiNotificationsResponse>(url);
    return mapApiResponseToNotificationsResponse(response.data);
  },

  /**
   * Mark a notification as read
   * PUT /dashboard/notifications/{notificationId}/read
   */
  markAsRead: async (notificationId: string): Promise<MarkAsReadResponse> => {
    const response = await apiClient.put<ApiMarkAsReadResponse>(
      `/dashboard/notifications/${notificationId}/read`
    );

    return {
      success: true,
      message: response.data.message,
      notification: undefined,
    };
  },

  /**
   * Mark all notifications as read
   * PUT /dashboard/notifications/read-all
   */
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await apiClient.put<ApiMarkAllAsReadResponse>(
      '/dashboard/notifications/read-all'
    );

    return {
      success: true,
      message: response.data.message,
      count: 0,
    };
  },

  /**
   * Delete a notification
   * DELETE /dashboard/notifications/:id
   * 
   * NOTE: This endpoint requires backend implementation.
   * Currently returns an error as the backend does not support DELETE for notifications.
   */
  deleteNotification: async (
    notificationId: string
  ): Promise<DeleteNotificationResponse> => {
    const response = await apiClient.delete<DeleteNotificationResponse>(
      `/dashboard/notifications/${notificationId}`
    );
    const data = response.data;

    return {
      success: data?.success ?? true,
      message: data?.message ?? 'Notification deleted',
    };
  },

  /**
   * Get notification preferences
   * GET /dashboard/notifications/preferences
   * 
   * Note: The API documentation doesn't specify a preferences endpoint,
   * but keeping this function for compatibility.
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    return {
      email: {
        match: true,
        message: true,
        collaboration: true,
        marketplace: true,
        payment: true,
        system: true,
      },
      push: {
        match: true,
        message: true,
        collaboration: true,
        marketplace: true,
        payment: true,
        system: true,
      },
      inApp: {
        match: true,
        message: true,
        collaboration: true,
        marketplace: true,
        payment: true,
        system: true,
      },
    };
  },

  /**
   * Update notification preferences
   * PUT /dashboard/notifications/preferences
   * 
   * Note: The API documentation doesn't specify a preferences endpoint,
   * but keeping this function for compatibility.
   */
  updatePreferences: async (
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> => {
    const defaultPrefs: NotificationPreferences = {
      email: {
        match: true,
        message: true,
        collaboration: true,
        marketplace: true,
        payment: true,
        system: true,
      },
      push: {
        match: true,
        message: true,
        collaboration: true,
        marketplace: true,
        payment: true,
        system: true,
      },
      inApp: {
        match: true,
        message: true,
        collaboration: true,
        marketplace: true,
        payment: true,
        system: true,
      },
    };

    return {
      email: { ...defaultPrefs.email, ...preferences.email },
      push: { ...defaultPrefs.push, ...preferences.push },
      inApp: { ...defaultPrefs.inApp, ...preferences.inApp },
    };
  },
};

export default notificationsApi;
