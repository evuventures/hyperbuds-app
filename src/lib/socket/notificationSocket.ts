import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/store/authSelectors";

export interface NotificationData {
  _id: string;
  // Added 'debug' to the type union to handle the system logs
  type: 'new_message' | 'collab_request' | 'system_alert' | 'debug';
  content: string;
  message?: string; // Added to support the "Socket is working" structure
  isRead: boolean;
  createdAt: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api-hyperbuds-backend.onrender.com";

class NotificationSocketService {
  private socket: Socket | null = null;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();

  connect(token?: string): Socket {
    if (this.socket?.connected) return this.socket;
    const resolvedToken = token ?? getAccessToken();
    if (!resolvedToken) throw new Error("Missing access token.");

    this.socket = io(SOCKET_URL, {
      auth: { token: resolvedToken },
      transports: ["websocket"],
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Filter out debug notifications before they reach the rest of the app
    this.socket.on("notification:new", (data: NotificationData) => {
      if (data.type === 'debug') return; // Silence the "Socket is working" logs
      this.localEmit("notification:new", data);
    });

    this.socket.on("notifications:read-all", () => this.localEmit("notifications:read-all"));
  }
  
  // Restoring the missing function!
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data?: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private localEmit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }
}

export const notificationSocket = new NotificationSocketService();
export default notificationSocket;