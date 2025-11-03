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
} from '@/types/notifications.types';

export const notificationsApi = {
  /**
   * Get all notifications for the current user
   * GET /api/v1/notifications
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
    if (params?.read !== undefined) {
      queryParams.append('read', params.read.toString());
    }

    const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<NotificationsResponse>(url);
    return response.data;
  },

  /**
   * Mark a notification as read
   * PUT /api/v1/notifications/:id/read
   */
  markAsRead: async (notificationId: string): Promise<MarkAsReadResponse> => {
    const response = await apiClient.put<MarkAsReadResponse>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await apiClient.put<MarkAllAsReadResponse>('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification: async (notificationId: string): Promise<DeleteNotificationResponse> => {
    const response = await apiClient.delete<DeleteNotificationResponse>(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  },

  /**
   * Update notification preferences
   * PUT /api/v1/notifications/preferences
   */
  updatePreferences: async (
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> => {
    const response = await apiClient.put<NotificationPreferences>(
      '/notifications/preferences',
      preferences
    );
    return response.data;
  },
};

export default notificationsApi;

