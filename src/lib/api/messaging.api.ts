import {
   Message,
   Conversation,
   SendMessageRequest,
   CreateConversationRequest,
   ConversationsResponse,
   ConversationResponse,
   MessagesResponse,
   MessageResponse,
   SearchResponse
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
      page: number = 1,
      limit: number = 20
   ): Promise<ConversationsResponse> {
      const params = new URLSearchParams({
         page: page.toString(),
         limit: limit.toString(),
      });

      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }

      return response.json();
   }

   async getConversation(token: string, conversationId: string): Promise<Conversation> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch conversation: ${response.statusText}`);
      }

      const data: ConversationResponse = await response.json();
      return data.conversation;
   }

   async createConversation(token: string, data: CreateConversationRequest): Promise<Conversation> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      const result: ConversationResponse = await response.json();
      return result.conversation;
   }

   async archiveConversation(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}/archive`, {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to archive conversation: ${response.statusText}`);
      }
   }

   // Messages
   async getMessages(
      token: string,
      conversationId: string,
      page: number = 1,
      limit: number = 50
   ): Promise<MessagesResponse> {
      const params = new URLSearchParams({
         page: page.toString(),
         limit: limit.toString(),
      });

      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}/messages?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      return response.json();
   }

   async sendMessage(token: string, conversationId: string, data: SendMessageRequest): Promise<Message> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}/messages`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const result: MessageResponse = await response.json();
      return result.message;
   }

   async deleteMessage(token: string, messageId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/messages/${messageId}`, {
         method: 'DELETE',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to delete message: ${response.statusText}`);
      }
   }

   async markMessagesAsRead(token: string, conversationId: string, messageIds?: string[]): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}/read`, {
         method: 'PUT',
         headers: this.getAuthHeaders(token),
         body: JSON.stringify({ messageIds: messageIds || [] }),
      });

      if (!response.ok) {
         throw new Error(`Failed to mark messages as read: ${response.statusText}`);
      }
   }

   // Search
   async searchMessages(
      token: string,
      query: string,
      page: number = 1,
      limit: number = 20
   ): Promise<SearchResponse> {
      const params = new URLSearchParams({
         q: query,
         page: page.toString(),
         limit: limit.toString(),
      });

      const response = await fetch(`${BASE_URL}/api/v1/messaging/search?${params}`, {
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to search messages: ${response.statusText}`);
      }

      return response.json();
   }

   // Typing indicators
   async startTyping(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}/typing/start`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to start typing: ${response.statusText}`);
      }
   }

   async stopTyping(token: string, conversationId: string): Promise<void> {
      const response = await fetch(`${BASE_URL}/api/v1/messaging/conversations/${conversationId}/typing/stop`, {
         method: 'POST',
         headers: this.getAuthHeaders(token),
      });

      if (!response.ok) {
         throw new Error(`Failed to stop typing: ${response.statusText}`);
      }
   }
}

export const messagingAPI = new MessagingAPI();