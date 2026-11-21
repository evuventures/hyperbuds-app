import { io, Socket } from "socket.io-client";
import { BASE_URL } from "@/config/baseUrl";
import { getAccessToken } from "@/store/authSelectors";

export interface NotificationData {
  _id: string;
  id?: string;
  type:
    | "like"
    | "comment"
    | "follow"
    | "new_message"
    | "stream_live"
    | "invite"
    | "collaboration"
    | "collab_request"
    | "system_alert"
    | "system"
    | "debug"
    | string;
  title?: string;
  content?: string;
  message?: string;
  actionUrl?: string | null;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? BASE_URL;

class NotificationSocketService {
  private socket: Socket | null = null;
  private activeToken: string | null = null;
  private maxReconnectAttempts = 10;
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();

  connect(token?: string): Socket {
    const resolvedToken = token ?? getAccessToken();
    if (!resolvedToken) throw new Error("Missing access token.");

    if (this.socket && this.activeToken === resolvedToken) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.activeToken = resolvedToken;

    if (this.socket) {
      this.socket.auth = { token: resolvedToken };
      if (this.socket.connected) {
        this.socket.disconnect();
      }
      this.socket.connect();
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token: resolvedToken },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1500,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("notification:new", (data: NotificationData) => {
      if (data?.type === "debug") return;
      this.localEmit("notification:new", data);
    });

    this.socket.on("notification:updated", (data: NotificationData) => {
      this.localEmit("notification:updated", data);
    });

    this.socket.on("notification:deleted", (data: string) => {
      this.localEmit("notification:deleted", data);
    });

    this.socket.on("notifications:read-all", () => this.localEmit("notifications:read-all"));

    this.socket.on("new-message", (data: unknown) => {
      this.localEmit("new-message", data);
    });

    this.socket.on("profile:follow-updated", (data: unknown) => {
      this.localEmit("profile:follow-updated", data);
    });
  }

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
      this.activeToken = null;
    }
  }
}

export const notificationSocket = new NotificationSocketService();
export default notificationSocket;
