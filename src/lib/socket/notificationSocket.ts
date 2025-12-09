// src/lib/socket/notificationSocket.ts

// TEMPORARILY COMMENTED OUT - Backend not ready yet
// import { io, Socket } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

class NotificationSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();

  connect(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: string
  ): Socket {
    // TEMPORARILY DISABLED - Backend not ready yet
    // TODO: Uncomment when backend is working
    if (this.socket?.connected) {
      return this.socket;
    }

    // Return a mock socket to prevent errors
    // TEMPORARILY COMMENTED OUT - Backend not ready yet
    // const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api-hyperbuds-backend.onrender.com';
    // 
    // this.socket = io(SOCKET_URL, {
    //   auth: { token },
    //   transports: ['websocket', 'polling'],
    //   timeout: 10000,
    //   reconnection: true,
    //   reconnectionAttempts: this.maxReconnectAttempts,
    //   reconnectionDelay: this.reconnectDelay,
    //   forceNew: true,
    // });
    // 
    // this.setupEventListeners();
    // return this.socket;
    
    // Return null socket (will be handled gracefully by components)
    return null as unknown as Socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.reconnectAttempts = 0;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Notification socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Notification socket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      // Only log in development to reduce console noise in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Notification socket connection error (backend may not be ready):', error.message);
      }
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Max notification socket reconnection attempts reached. This is expected if the backend is not ready.');
        }
      }
    });

    // Listen for new notifications
    this.socket.on('notification:new', (notification) => {
      console.log('🔔 New notification received:', notification);
      this.emit('notification:new', notification);
    });

    // Listen for notification updates
    this.socket.on('notification:updated', (notification) => {
      console.log('📝 Notification updated:', notification);
      this.emit('notification:updated', notification);
    });

    // Listen for notification deleted
    this.socket.on('notification:deleted', (notificationId) => {
      console.log('🗑️ Notification deleted:', notificationId);
      this.emit('notification:deleted', notificationId);
    });

    // Listen for all notifications marked as read
    this.socket.on('notifications:read-all', () => {
      console.log('✅ All notifications marked as read');
      this.emit('notifications:read-all', undefined);
    });
  }

  // Subscribe to notification events
  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Unsubscribe from notification events
  off(event: string, callback: (data?: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  // Emit event to all listeners
  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const notificationSocket = new NotificationSocketService();
export default notificationSocket;

