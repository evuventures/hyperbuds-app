import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types/messaging.types';

const SOCKET_URL = 'https://api-hyperbuds-backend.onrender.com';

class MessagingSocketService {
  private socket: Socket | null = null;
  private maxReconnectAttempts = 5;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
      timeout: 20000,
      //transports: ['polling', 'websocket'],
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log(' Hyperbuds Messaging Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(' Socket Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error(' Socket Auth Error:', error.message);
    });

    //  onAny as a tool for safety
    this.socket.onAny((eventName: string, data: unknown) => {
      console.log(` Incoming Socket Event: "${eventName}"`, data);
    });
  }

 
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log(` Joining Conversation Room: ${conversationId}`);
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      console.log(` Leaving Conversation Room: ${conversationId}`);
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
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const messagingSocketService = new MessagingSocketService();