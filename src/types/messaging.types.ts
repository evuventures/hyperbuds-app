export interface User {
   _id: string;
   email: string;
   name?: string;
   avatar?: string;
   status?: 'online' | 'offline' | 'away';
   lastSeen?: string;
}

export interface Message {
   _id: string;
   conversationId: string;
   sender: {
      _id: string;
      email: string;
   };
   content: string;
   type: 'text' | 'image' | 'file' | 'collab_invite';
   attachments: MessageAttachment[];
   isRead: boolean;
   readAt?: string;
   createdAt: string;
   updatedAt: string;
   metadata?: Record<string, unknown>;
}

export interface MessageAttachment {
   url: string;
   filename: string;
   mimeType: string;
   size: number;
}

export interface MessageReaction {
   id: string;
   userId: string;
   emoji: string;
   timestamp: string;
}

export interface Conversation {
   _id: string;
   participants: User[];
   type: 'direct';
   lastMessage?: {
      _id: string;
      content: string;
      createdAt: string;
   };
   lastActivity: string;
   unreadCount: number;
   createdAt: string;
}

export interface TypingUser {
   userId: string;
   name: string;
   timestamp: string;
}

export interface TypingIndicator {
   conversationId: string;
   users: TypingUser[];
   isTyping: boolean;
}

export interface MessageNotification {
   id: string;
   conversationId: string;
   messageId: string;
   recipientId: string;
   type: 'new_message' | 'reaction' | 'mention';
   content: string;
   isRead: boolean;
   createdAt: string;
}

export interface MessageFilters {
   conversationId?: string;
   senderId?: string;
   type?: Message['type'];
   dateFrom?: string;
   dateTo?: string;
   search?: string;
}

export interface ConversationFilters {
   type?: Conversation['type'];
   isArchived?: boolean;
   isMuted?: boolean;
   search?: string;
}

export interface SendMessageRequest {
   content: string;
   type?: Message['type'];
   attachments?: MessageAttachment[];
   metadata?: Record<string, unknown>;
}

export interface CreateConversationRequest {
   participantId: string;
}

export interface UpdateConversationRequest {
   name?: string;
   description?: string;
   avatar?: File;
}

export interface MessageSearchResult {
   _id: string;
   content: string;
   sender: {
      _id: string;
      email: string;
   };
   conversationId: {
      _id: string;
      participants: string[];
   };
   createdAt: string;
}

// API Response Types
export interface ConversationsResponse {
   conversations: Conversation[];
}

export interface ConversationResponse {
   conversation: Conversation;
}

export interface MessagesResponse {
   messages: Message[];
}

export interface MessageResponse {
   message: Message;
}

export interface SearchResponse {
   messages: Array<{
      _id: string;
      content: string;
      sender: {
         _id: string;
         email: string;
      };
      conversationId: {
         _id: string;
         participants: string[];
      };
      createdAt: string;
   }>;
}

// Socket event types
export interface SocketEvents {
   // Message events
   'new-message': { conversationId: string; message: Message };
   'message-read': { conversationId: string; readBy: string; messageIds: string[]; readAt: string };
   'message-deleted': { conversationId: string; messageId: string; deletedBy: string };

   // Typing events
   'typing': { conversationId: string; userId: string; isTyping: boolean };

   // Conversation events
   'conversation:created': Conversation;
   'conversation:updated': Conversation;
   'conversation:deleted': { conversationId: string };

   // User events
   'user:status': { userId: string; status: User['status'] };
}
