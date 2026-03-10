import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types/messaging.types';

const SOCKET_URL = 'https://api-hyperbuds-backend.onrender.com';

class MessagingSocketService {
  private socket: Socket | null = null;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  private currentUserId: string | null = null;
  private activeConversationId: string | null = null;

  connect(token: string): Socket {
    if (this.socket) return this.socket;
    if (this.isConnecting) return this.socket!;

    this.isConnecting = true;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
      timeout: 60000,
      transports: ['polling', 'websocket'],
    });

    this.socket.on('connect', () => {
      this.isConnecting = false;
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Hyperbuds Messaging Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket Auth Error:', error.message);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts — rejoining rooms`);
      if (this.currentUserId) {
        this.socket?.emit('join-user-room', { userId: this.currentUserId });
      }
      if (this.activeConversationId) {
        this.socket?.emit('join-conversation', this.activeConversationId);
      }
    });

    this.socket.onAny((eventName: string, data: unknown) => {
      console.log(`📨 Incoming Socket Event: "${eventName}"`, data);
    });
  }

  joinUserRoom(userId: string) {
    this.currentUserId = userId;
    if (this.socket) {
      this.socket.emit('join-user-room', { userId });
      console.log(`Joined personal room: ${userId}`);
    }
  }

  joinConversation(conversationId: string) {
    this.activeConversationId = conversationId;
    if (this.socket?.connected) {
      console.log(`Joining Conversation Room: ${conversationId}`);
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    if (this.socket?.connected) {
      console.log(`Leaving Conversation Room: ${conversationId}`);
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  sendTypingStart(conversationId: string) {
    this.socket?.emit('typing-start', { conversationId });
  }

  sendTypingStop(conversationId: string) {
    this.socket?.emit('typing-stop', { conversationId });
  }

  on<T extends keyof SocketEvents>(
    event: T,
    callback: (data: SocketEvents[T]) => void
  ) {
    this.socket?.on(event as string, callback as (args: unknown) => void);
  }

  off<T extends keyof SocketEvents>(
    event: T,
    callback: (data: SocketEvents[T]) => void
  ) {
    this.socket?.off(event as string, callback as (args: unknown) => void);
  }

  disconnect(): void {
    if (this.socket) {
      this.currentUserId = null;
      this.activeConversationId = null;
      this.isConnecting = false;
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// ✅ KEY FIX: Attach singleton to globalThis to survive Next.js hot reloads.
// Without this, each hot reload creates a NEW instance with a NEW socket,
// causing duplicate event handlers and duplicate new-message events.
const globalForSocket = globalThis as unknown as {
  messagingSocketService: MessagingSocketService | undefined;
};

if (!globalForSocket.messagingSocketService) {
  globalForSocket.messagingSocketService = new MessagingSocketService();
}

export const messagingSocketService = globalForSocket.messagingSocketService;