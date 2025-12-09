"use client";

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api-hyperbuds-backend.onrender.com';

export function useSocket(accessToken?: string): { socket: Socket | null; isConnected: boolean } {
   const [isConnected, setIsConnected] = useState(false);
   const socketRef = useRef<Socket | null>(null);

   useEffect(() => {
      if (!accessToken) return;

      // Initialize socket connection
      const socket = io(SOCKET_URL, {
         auth: {
            token: accessToken,
         },
         transports: ['websocket', 'polling'],
         timeout: 20000,
         forceNew: true,
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
         console.log('Socket connected:', socket.id);
         setIsConnected(true);
      });

      socket.on('disconnect', (reason) => {
         console.log('Socket disconnected:', reason);
         setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
         console.error('Socket connection error:', error);
         setIsConnected(false);
      });

      socket.on('error', (error) => {
         console.error('Socket error:', error);
      });

      // Cleanup on unmount or token change
      return () => {
         socket.disconnect();
         socketRef.current = null;
         setIsConnected(false);
      };
   }, [accessToken]);

   return {
      socket: socketRef.current,
      isConnected,
   };
}
