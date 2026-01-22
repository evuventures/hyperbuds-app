"use client";

import React, { useEffect, useState } from "react";
import notificationSocket from "@/lib/socket/notificationSocket";
import toast from "react-hot-toast";

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
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("accessToken"));

    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken") setToken(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <NotificationSocketProvider token={token}>{children}</NotificationSocketProvider>;
};
