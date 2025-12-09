// src/lib/api/notifications.api.ts

// TEMPORARILY COMMENTED OUT - Backend not ready yet
// import { apiClient } from './client';
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
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  getNotifications: async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const queryParams = new URLSearchParams();
    // 
    // if (params?.page) {
    //   queryParams.append('page', params.page.toString());
    // }
    // if (params?.limit) {
    //   queryParams.append('limit', params.limit.toString());
    // }
    // if (params?.type) {
    //   queryParams.append('type', params.type);
    // }
    // if (params?.read !== undefined) {
    //   queryParams.append('read', params.read.toString());
    // }
    // 
    // const url = `/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    // const response = await apiClient.get<NotificationsResponse>(url);
    // return response.data;
    
    // Return empty response until backend is ready
    return {
      success: true,
      notifications: [],
      total: 0,
      unreadCount: 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
      hasMore: false,
    };
  },

  /**
   * Mark a notification as read
   * PUT /api/v1/notifications/:id/read
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  markAsRead: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _notificationId: string
  ): Promise<MarkAsReadResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.put<MarkAsReadResponse>(
    //   `/notifications/${notificationId}/read`
    // );
    // return response.data;
    
    return {
      success: true,
      message: 'Notification marked as read (disabled - backend not ready)',
    };
  },

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.put<MarkAllAsReadResponse>('/notifications/read-all');
    // return response.data;
    
    return {
      success: true,
      message: 'All notifications marked as read (disabled - backend not ready)',
      count: 0,
    };
  },

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:id
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  deleteNotification: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _notificationId: string
  ): Promise<DeleteNotificationResponse> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.delete<DeleteNotificationResponse>(
    //   `/notifications/${notificationId}`
    // );
    // return response.data;
    
    return {
      success: true,
      message: 'Notification deleted (disabled - backend not ready)',
    };
  },

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    // return response.data;
    
    // Return default preferences until backend is ready
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
   * PUT /api/v1/notifications/preferences
   * 
   * TEMPORARILY COMMENTED OUT - Backend not ready yet
   * TODO: Uncomment when backend is working
   */
  updatePreferences: async (
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferences> => {
    // TEMPORARILY DISABLED - Backend not ready
    // const response = await apiClient.put<NotificationPreferences>(
    //   '/notifications/preferences',
    //   preferences
    // );
    // return response.data;
    
    // Return the same preferences until backend is ready (merge with defaults)
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

