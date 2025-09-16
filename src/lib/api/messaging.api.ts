import {
   Message,
   Conversation,
   SendMessageRequest,
   CreateConversationRequest,
   UpdateConversationRequest,
   MessageFilters,
   ConversationFilters,
   MessageSearchResult,
   MessageNotification
} from '@/types/messaging.types';

const BASE_URL = 'https://api-hyperbuds-backend.onrender.com';

class MessagingAPI {
   private getAuthHeaders(token: string) {
      return {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
      };
   }

   private getFormDataHeaders(token: string) {
      return {
         'Authorization': `Bearer ${token}`,
      };
   }

   // Conversations
   async getConversations(
      token: string,
      filters?: ConversationFilters,
      page: number = 1,
      limit: number = 50
   ): Promise<{ conversations: Conversation[]; total: number; hasMore: boolean }> {
      const params = new URLSearchParams({
         page: page.toString(),
         limit: limit.toString(),
         ...(filters && Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value.toString();
            return acc;
         }, {} as Record<string, string>))
      });

      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }

      return response.json();
   }

   async getConversation(token: string, conversationId: string): Promise<Conversation> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch conversation: ${response.statusText}`);
      }

      return response.json();
   }

   async createConversation(token: string, data: CreateConversationRequest): Promise<Conversation> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      return response.json();
   }

   async updateConversation(
      token: string,
      conversationId: string,
      data: UpdateConversationRequest
   ): Promise<Conversation> {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.description) formData.append('description', data.description);
      if (data.avatar) formData.append('avatar', data.avatar);

      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}`, {
         method: 'PUT',
         headers: this.getFormDataHeaders(token),
         body: formData,
      });

      if (!response.ok) {
         throw new Error(`Failed to update conversation: ${response.statusText}`);
      }

      return response.json();
   }

   async deleteConversation(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}`, {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }
   }

   async archiveConversation(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/archive`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to archive conversation: ${response.statusText}`);
      }
   }

   async unarchiveConversation(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/unarchive`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to unarchive conversation: ${response.statusText}`);
      }
   }

   async muteConversation(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/mute`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to mute conversation: ${response.statusText}`);
      }
   }

   async unmuteConversation(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/unmute`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to unmute conversation: ${response.statusText}`);
      }
   }

   // Messages
   async getMessages(
      token: string,
      conversationId: string,
      filters?: MessageFilters,
      page: number = 1,
      limit: number = 50
   ): Promise<{ messages: Message[]; total: number; hasMore: boolean }> {
      const params = new URLSearchParams({
         page: page.toString(),
         limit: limit.toString(),
         ...(filters && Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value.toString();
            return acc;
         }, {} as Record<string, string>))
      });

      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/messages?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      return response.json();
   }

   async sendMessage(token: string, data: SendMessageRequest): Promise<Message> {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('type', data.type);
      if (data.replyTo) formData.append('replyTo', data.replyTo);

      if (data.attachments && data.attachments.length > 0) {
         data.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
         });
      }

      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${data.conversationId}/messages`, {
         method: 'POST',
         headers: this.getFormDataHeaders(token),
         body: formData,
      });

      if (!response.ok) {
         throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return response.json();
   }

   async editMessage(
      token: string,
      conversationId: string,
      messageId: string,
      content: string
   ): Promise<Message> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/messages/${messageId}`, {
         method: 'PUT',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify({ content }),
      });

      if (!response.ok) {
         throw new Error(`Failed to edit message: ${response.statusText}`);
      }

      return response.json();
   }

   async deleteMessage(token: string, conversationId: string, messageId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/messages/${messageId}`, {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to delete message: ${response.statusText}`);
      }
   }

   async markMessageAsRead(token: string, conversationId: string, messageId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/messages/${messageId}/read`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to mark message as read: ${response.statusText}`);
      }
   }

   async markConversationAsRead(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/read`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to mark conversation as read: ${response.statusText}`);
      }
   }

   // Message Reactions
   async addReaction(
      token: string,
      conversationId: string,
      messageId: string,
      emoji: string
   ): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/messages/${messageId}/reactions`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
         throw new Error(`Failed to add reaction: ${response.statusText}`);
      }
   }

   async removeReaction(
      token: string,
      conversationId: string,
      messageId: string,
      emoji: string
   ): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/conversations/${conversationId}/messages/${messageId}/reactions/${emoji}`, {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to remove reaction: ${response.statusText}`);
      }
   }

   // Search
   async searchMessages(
      token: string,
      query: string,
      filters?: MessageFilters,
      page: number = 1,
      limit: number = 20
   ): Promise<{ results: MessageSearchResult[]; total: number; hasMore: boolean }> {
      const params = new URLSearchParams({
         q: query,
         page: page.toString(),
         limit: limit.toString(),
         ...(filters && Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = value.toString();
            return acc;
         }, {} as Record<string, string>))
      });

      const response = await fetch(`${BASE_URL}/api/v1/messages/search?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to search messages: ${response.statusText}`);
      }

      return response.json();
   }

   // Notifications
   async getNotifications(
      token: string,
      page: number = 1,
      limit: number = 50
   ): Promise<{ notifications: MessageNotification[]; total: number; hasMore: boolean }> {
      const params = new URLSearchParams({
         page: page.toString(),
         limit: limit.toString(),
      });

      const response = await fetch(`${BASE_URL}/api/v1/messages/notifications?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      return response.json();
   }

   async markNotificationAsRead(token: string, notificationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/notifications/${notificationId}/read`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
   }

   async markAllNotificationsAsRead(token: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messages/notifications/read-all`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }
   }

   // File Upload
   async uploadFile(token: string, file: File): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BASE_URL}/api/v1/messages/upload`, {
         method: 'POST',
         headers: this.getFormDataHeaders(token),
         body: formData,
      });

      if (!response.ok) {
         throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      return response.json();
   }
}

export const messagingAPI = new MessagingAPI();
