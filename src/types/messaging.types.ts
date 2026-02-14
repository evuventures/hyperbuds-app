export interface User {
  _id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  lastSeen?: string;
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
    username?: string; // Add if the backend populates sender username
  };
  content: string;
  type: 'text' | 'image' | 'file' | 'collab_invite';
  attachments: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>; // Matches Mongoose Mixed type
  isDeleted?: boolean; // Matches your Mongoose schema
  deletedAt?: string; // Matches your Mongoose schema
  editedAt?: string;  // Matches your Mongoose schema
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

// Socket Events
export interface SocketEvents {
  'message:new': Message;
  'typing:start': { conversationId: string; userId: string };
  'typing:stop': { conversationId: string; userId: string };
  'user:status': { userId: string; status: 'online' | 'offline' };
 
}