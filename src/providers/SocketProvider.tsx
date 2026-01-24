"use client";

import React, { useEffect } from "react";
import notificationSocket from "@/lib/socket/notificationSocket";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store/hooks";

function NotificationSocketProvider({
  token,
  children,
}: {
  token: string | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!token) {
      notificationSocket.disconnect();
      return;
    }

    // always reconnect when token changes
    notificationSocket.disconnect();

    notificationSocket.connect(token);

    const handler = (n: any) => {
      console.log("🔔 Notification received:", n);
      toast.success("A new notification has arrived!");
    };

    notificationSocket.on("notification:new", handler);
    return () => notificationSocket.off("notification:new", handler);
  }, [token]);

  return <>{children}</>;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useAppSelector((state: any) => state.auth.token);

  return <NotificationSocketProvider token={token}>{children}</NotificationSocketProvider>;
};
