"use client";

import React, { useEffect } from "react";
import notificationSocket from "@/lib/socket/notificationSocket";
import { useAppSelector } from "@/store/hooks";
import { getAccessToken } from "@/store/authSelectors";

function NotificationSocketProvider({
  token,
  children,
}: {
  token: string | null;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const resolvedToken =
      token ||
      getAccessToken() ||
      (typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null);

    if (!resolvedToken) {
      notificationSocket.disconnect();
      return;
    }

    try {
      notificationSocket.connect(resolvedToken);
    } catch {
      // Non-fatal: will connect once auth token is available
    }
  }, [token]);

  return <>{children}</>;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const token = useAppSelector((state: any) => state.auth.token);

  return <NotificationSocketProvider token={token}>{children}</NotificationSocketProvider>;
};
