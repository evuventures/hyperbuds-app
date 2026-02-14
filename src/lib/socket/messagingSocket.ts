import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types/messaging.types';

// Use the Render URL from your apiClient
const SOCKET_URL = 'https://api-hyperbuds-backend.onrender.com';

class MessagingSocketService {
  private socket: Socket | null = null;
  private maxReconnectAttempts = 5;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Fixed URL and refined options
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'], // Prefer websocket for speed
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    this.setupDefaultListeners();
    return this.socket;
  }

  private setupDefaultListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => console.log('✅ Connected to Hyperbuds Socket'));
    this.socket.on('disconnect', (reason) => console.log('❌ Socket Disconnected:', reason));
    this.socket.on('connect_error', (error) => console.error('⚠️ Socket Auth Error:', error.message));
  }

  // --- Real-time Actions ---
  joinConversation(conversationId: string) {
    this.socket?.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('leave-conversation', conversationId);
  }

  sendTypingStart(conversationId: string) {
    this.socket?.emit('typing-start', { conversationId });
  }

  sendTypingStop(conversationId: string) {
    this.socket?.emit('typing-stop', { conversationId });
  }

  // --- Flexible Listener Management ---
  // Instead of creating 10+ identical methods, use a generic "on" and "off"
  on<T extends keyof SocketEvents>(event: T, callback: (data: SocketEvents[T]) => void) {
    this.socket?.on(event as string, callback);
  }

  off<T extends keyof SocketEvents>(event: T, callback: (data: SocketEvents[T]) => void) {
    this.socket?.off(event as string, callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const messagingSocketService = new MessagingSocketService();