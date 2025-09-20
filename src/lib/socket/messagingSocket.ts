import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types/messaging.types';

class MessagingSocketService {
   private socket: Socket | null = null;
   private reconnectAttempts = 0;
   private maxReconnectAttempts = 5;
   private reconnectDelay = 1000;

   connect(token: string): Socket {
      if (this.socket?.connected) {
         return this.socket;
      }

      this.socket = io('https://api-hyperbuds-backend.onrender.com', {
         auth: { token },
         transports: ['websocket', 'polling'],
         timeout: 10000, // Reduced timeout
         reconnection: true,
         reconnectionAttempts: this.maxReconnectAttempts,
         reconnectionDelay: this.reconnectDelay,
         forceNew: true, // Force new connection
      });

      this.setupEventListeners();
      return this.socket;
   }

   disconnect(): void {
      if (this.socket) {
         this.socket.disconnect();
         this.socket = null;
      }
   }

   private setupEventListeners(): void {
      if (!this.socket) return;

      this.socket.on('connect', () => {
         console.log('Connected to messaging socket');
         this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
         console.log('Disconnected from messaging socket:', reason);
      });

      this.socket.on('connect_error', (error) => {
         console.error('Socket connection error:', error);
         this.reconnectAttempts++;
      });

      this.socket.on('reconnect', (attemptNumber) => {
         console.log('Reconnected to messaging socket after', attemptNumber, 'attempts');
         this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error) => {
         console.error('Socket reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
         console.error('Failed to reconnect to messaging socket after', this.maxReconnectAttempts, 'attempts');
      });
   }

   // Join conversation room
   joinConversation(conversationId: string): void {
      if (this.socket?.connected) {
         this.socket.emit('join-conversation', conversationId);
      }
   }

   // Leave conversation room
   leaveConversation(conversationId: string): void {
      if (this.socket?.connected) {
         this.socket.emit('leave-conversation', conversationId);
      }
   }

   // Check if socket is connected
   isConnected(): boolean {
      return this.socket?.connected || false;
   }

   // Start typing indicator
   startTyping(conversationId: string): void {
      if (this.socket?.connected) {
         this.socket.emit('typing-start', { conversationId });
      }
   }

   // Stop typing indicator
   stopTyping(conversationId: string): void {
      if (this.socket?.connected) {
         this.socket.emit('typing-stop', { conversationId });
      }
   }

   // Event listeners
   onNewMessage(callback: (data: SocketEvents['new-message']) => void): void {
      if (this.socket) {
         this.socket.on('new-message', callback);
      }
   }

   onMessageRead(callback: (data: SocketEvents['message-read']) => void): void {
      if (this.socket) {
         this.socket.on('message-read', callback);
      }
   }

   onMessageDeleted(callback: (data: SocketEvents['message-deleted']) => void): void {
      if (this.socket) {
         this.socket.on('message-deleted', callback);
      }
   }

   onTyping(callback: (data: SocketEvents['typing']) => void): void {
      if (this.socket) {
         this.socket.on('typing', callback);
      }
   }

   onConversationCreated(callback: (conversation: SocketEvents['conversation:created']) => void): void {
      if (this.socket) {
         this.socket.on('conversation:created', callback);
      }
   }

   onConversationUpdated(callback: (conversation: SocketEvents['conversation:updated']) => void): void {
      if (this.socket) {
         this.socket.on('conversation:updated', callback);
      }
   }

   onConversationDeleted(callback: (data: SocketEvents['conversation:deleted']) => void): void {
      if (this.socket) {
         this.socket.on('conversation:deleted', callback);
      }
   }

   onUserStatus(callback: (data: SocketEvents['user:status']) => void): void {
      if (this.socket) {
         this.socket.on('user:status', callback);
      }
   }

   // Remove event listeners
   offNewMessage(callback: (data: SocketEvents['new-message']) => void): void {
      if (this.socket) {
         this.socket.off('new-message', callback);
      }
   }

   offMessageRead(callback: (data: SocketEvents['message-read']) => void): void {
      if (this.socket) {
         this.socket.off('message-read', callback);
      }
   }

   offMessageDeleted(callback: (data: SocketEvents['message-deleted']) => void): void {
      if (this.socket) {
         this.socket.off('message-deleted', callback);
      }
   }

   offTyping(callback: (data: SocketEvents['typing']) => void): void {
      if (this.socket) {
         this.socket.off('typing', callback);
      }
   }

   offConversationCreated(callback: (conversation: SocketEvents['conversation:created']) => void): void {
      if (this.socket) {
         this.socket.off('conversation:created', callback);
      }
   }

   offConversationUpdated(callback: (conversation: SocketEvents['conversation:updated']) => void): void {
      if (this.socket) {
         this.socket.off('conversation:updated', callback);
      }
   }

   offConversationDeleted(callback: (data: SocketEvents['conversation:deleted']) => void): void {
      if (this.socket) {
         this.socket.off('conversation:deleted', callback);
      }
   }

   offUserStatus(callback: (data: SocketEvents['user:status']) => void): void {
      if (this.socket) {
         this.socket.off('user:status', callback);
      }
   }

   // Get socket instance
   getSocket(): Socket | null {
      return this.socket;
   }
}

export const messagingSocketService = new MessagingSocketService();
