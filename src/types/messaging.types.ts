export interface User {
   id: string;
   name: string;
   email: string;
   avatar?: string;
   status: 'online' | 'offline' | 'away';
   lastSeen?: string;
}

export interface Message {
   id: string;
   conversationId: string;
   senderId: string;
   content: string;
   type: 'text' | 'image' | 'file' | 'system';
   timestamp: string;
   editedAt?: string;
   replyTo?: string;
   attachments?: MessageAttachment[];
   reactions?: MessageReaction[];
   status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface MessageAttachment {
   id: string;
   type: 'image' | 'file' | 'video' | 'audio';
   url: string;
   filename: string;
   size: number;
   mimeType: string;
   thumbnailUrl?: string;
}

export interface MessageReaction {
   id: string;
   userId: string;
   emoji: string;
   timestamp: string;
}

export interface Conversation {
   id: string;
   type: 'direct' | 'group';
   name?: string;
   description?: string;
   avatar?: string;
   participants: User[];
   lastMessage?: Message;
   lastMessageAt?: string;
   unreadCount: number;
   isArchived: boolean;
   isMuted: boolean;
   createdAt: string;
   updatedAt: string;
   createdBy?: string;
   admins?: string[];
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
   conversationId: string;
   content: string;
   type: Message['type'];
   replyTo?: string;
   attachments?: File[];
}

export interface CreateConversationRequest {
   type: Conversation['type'];
   participantIds: string[];
   name?: string;
   description?: string;
}

export interface UpdateConversationRequest {
   name?: string;
   description?: string;
   avatar?: File;
}

export interface MessageSearchResult {
   message: Message;
   conversation: Conversation;
   highlightedContent: string;
}

// Socket event types
export interface SocketEvents {
   // Message events
   'message:sent': Message;
   'message:received': Message;
   'message:edited': { messageId: string; content: string; editedAt: string };
   'message:deleted': { messageId: string; conversationId: string };
   'message:reaction': { messageId: string; reaction: MessageReaction };
   'message:status': { messageId: string; status: Message['status'] };

   // Typing events
   'typing:start': { conversationId: string; userId: string };
   'typing:stop': { conversationId: string; userId: string };

   // Conversation events
   'conversation:created': Conversation;
   'conversation:updated': Conversation;
   'conversation:deleted': { conversationId: string };
   'conversation:participant_added': { conversationId: string; user: User };
   'conversation:participant_removed': { conversationId: string; userId: string };

   // User events
   'user:status': { userId: string; status: User['status'] };
   'user:typing': { conversationId: string; userId: string; isTyping: boolean };

   // Notification events
   'notification:new': MessageNotification;
   'notification:read': { notificationId: string };
}
