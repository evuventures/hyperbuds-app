export interface User {
  id: string | undefined;
  _id: string;
  email: string;
  username?: string; 
  fullName?: string; 
  bio?: string;      
  avatar?: string;
  role: 'creator' | 'admin'; 
  status?: 'online' | 'offline' | 'away';
  
}

export interface MessageAttachment {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    email: string;
    username?: string;
    fullName?: string; 
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'collab_invite';
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>; 
  isDeleted?: boolean; 
  deletedAt?: string; 
  editedAt?: string;  
}

export interface Conversation {
  _id: string;
  participants: User[]; 
  type: 'direct' | 'group'; 
  title?: string; 
  lastMessage?: Message; 
  lastActivity: string; 
  unreadCounts: Array<{ 
    userId: string;
    count: number;
  }>;
  isArchived: boolean; 
  metadata?: Record<string, unknown>; 
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface SendMessageRequest {
  content: string;
  type?: Message['type'];
  attachments?: Partial<MessageAttachment>[];
  metadata?: Record<string, unknown>;
}

export interface CreateConversationRequest {
  participantId: string;
}

// Response Types
export interface ConversationsResponse {
  conversations: Conversation[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ConversationResponse {
  conversation: Conversation;
}

export interface MessagesResponse {
  messages: Message[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
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


export interface SocketEvents {
    'new-message': { 
        conversationId: string; 
        message: Message 
    };
    'typing': { 
        conversationId: string; 
        userId: string; 
        isTyping: boolean 
    };
    'message-read': { 
        conversationId: string; 
        readBy: string; 
        messageIds: string[] | 'all'; 
        readAt: Date 
    };
    'message-deleted': { 
        conversationId: string; 
        messageId: string; 
        deletedBy: string 
    };
}