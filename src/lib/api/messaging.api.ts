import { apiClient } from "./client";
import {
  Message,
  Conversation,
  SendMessageRequest,
  CreateConversationRequest,
  ConversationsResponse,
  MessagesResponse,
  SearchResponse,
  ConversationResponse,
  MessageResponse
} from '@/types/messaging.types';

class MessagingAPI {
  // --- Conversations ---
  async getConversations(page = 1, limit = 20): Promise<ConversationsResponse> {
    const response = await apiClient.get('/messaging/conversations', {
      params: { page, limit },
    });
    return response.data;
  }
 

  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await apiClient.post<ConversationResponse>(
      '/messaging/conversations',
      data
    );
    return response.data.conversation;
  }
async startConversation(participantId: string): Promise<Conversation> {
  // This maps the participantId to the format your createConversation expects
  return this.createConversation({ participantId });
}
  
  

  async getConversation(id: string): Promise<Conversation> {
    const response = await apiClient.get<ConversationResponse>(
      `/messaging/conversations/${id}`
    );
    return response.data.conversation;
  }

  async toggleArchive(id: string): Promise<void> {
    // Hits DELETE /messaging/conversations/:id/archive
    await apiClient.delete(`/messaging/conversations/${id}/archive`);
  }

  // --- Messages ---
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    const response = await apiClient.get(`/messaging/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  }

  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<MessageResponse>(
      `/messaging/conversations/${conversationId}/messages`,
      data
    );
    return response.data.message;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/messaging/messages/${messageId}`);
  }

  async markAsRead(conversationId: string, messageIds: string[]): Promise<void> {
    await apiClient.put(`/messaging/conversations/${conversationId}/read`, { 
      messageIds 
    });
  }

  // --- Search ---
  async searchMessages(query: string, page = 1, limit = 20): Promise<SearchResponse> {
    const response = await apiClient.get('/messaging/search', {
      params: { q: query, page, limit },
    });
    return response.data;
  }

  // --- Typing Indicators ---
  async startTyping(conversationId: string): Promise<void> {
    await apiClient.post(`/messaging/conversations/${conversationId}/typing/start`);
  }

  async stopTyping(conversationId: string): Promise<void> {
    await apiClient.post(`/messaging/conversations/${conversationId}/typing/stop`);
  }
}

export const messagingAPI = new MessagingAPI();