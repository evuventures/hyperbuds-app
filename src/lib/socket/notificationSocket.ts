// src/lib/socket/notificationSocket.ts
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/store/authSelectors";

class NotificationSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();

  connect(token?: string): Socket {
    // Avoid duplicate connections
    if (this.socket?.connected) return this.socket;

    // Resolve token safely (client-only)
    const resolvedToken = token ?? getAccessToken() ?? undefined;
        

    if (!resolvedToken) {
      // No token => don't connect (backend will reject anyway)
      throw new Error("Missing access token: cannot connect to notification socket.");
    }

   const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";


    this.socket = io(SOCKET_URL, {
      auth: { token: resolvedToken }, // ✅ backend expects auth.token
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Notification socket connected:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Notification socket disconnected:", reason);
      if (reason === "io server disconnect") this.socket?.connect();
    });

    this.socket.on("connect_error", (error) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Notification socket connection error:", error.message);
      }
      this.reconnectAttempts++;
    });

    this.socket.on("notification:new", (notification) => {
      console.log("🔔 New notification received:", notification);
      this.emit("notification:new", notification);
    });

    this.socket.on("notification:updated", (notification) => {
      console.log("📝 Notification updated:", notification);
      this.emit("notification:updated", notification);
    });

    this.socket.on("notification:deleted", (notificationId) => {
      console.log("🗑️ Notification deleted:", notificationId);
      this.emit("notification:deleted", notificationId);
    });

    this.socket.on("notifications:read-all", () => {
      console.log("✅ All notifications marked as read");
      this.emit("notifications:read-all");
    });
  }

  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data?: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const notificationSocket = new NotificationSocketService();
export default notificationSocket;
