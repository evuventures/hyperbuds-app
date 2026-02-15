export interface User {
  _id: string;
  email: string;
  username?: string; // Matches 'username' in User schema
  fullName?: string; // Matches 'fullName' in User schema
  bio?: string;      // Matches 'bio' in User schema
  avatar?: string;
  role: 'creator' | 'admin'; // From backend enum
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
  metadata?: Record<string, unknown>; // Matches Mongoose Mixed type
  isDeleted?: boolean; // Matches your Mongoose schema
  deletedAt?: string; // Matches your Mongoose schema
  editedAt?: string;  // Matches your Mongoose schema
}

export interface Conversation {
  _id: string;
  participants: User[]; // Refers to User model
  type: 'direct' | 'group'; // Backend supports both
  title?: string; // For group chats
  lastMessage?: Message; // Populated Message object
  lastActivity: string; // Used for sorting
  unreadCounts: Array<{ // Matches backend schema
    userId: string;
    count: number;
  }>;
  isArchived: boolean; // Matches backend default
  metadata?: Record<string, unknown>; // For collaboration context
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

// Socket Events
export interface SocketEvents {
  'message:new': Message;
  'typing:start': { conversationId: string; userId: string };
  'typing:stop': { conversationId: string; userId: string };
  'user:status': { userId: string; status: 'online' | 'offline' };
  'message:read': { conversationId: string; messageIds: string[]; userId: string };
  'message:deleted': { messageId: string; conversationId: string };
 
}