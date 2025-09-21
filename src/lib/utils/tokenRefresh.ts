/**
 * Token refresh utility for handling JWT token expiration
 */

import React from 'react';
import { isTokenExpiringSoon, isTokenValid } from './jwt';

export interface TokenRefreshOptions {
   refreshToken: string;
   onTokenRefresh: (newToken: string) => void;
   onTokenExpired: () => void;
   checkInterval?: number; // milliseconds
}

class TokenRefreshService {
   private intervalId: NodeJS.Timeout | null = null;
   private options: TokenRefreshOptions | null = null;

   start(options: TokenRefreshOptions) {
      this.stop(); // Stop any existing interval
      this.options = options;

      const checkInterval = options.checkInterval || 60000; // Default 1 minute

      this.intervalId = setInterval(() => {
         this.checkTokenStatus();
      }, checkInterval);

      // Check immediately
      this.checkTokenStatus();
   }

   stop() {
      if (this.intervalId) {
         clearInterval(this.intervalId);
         this.intervalId = null;
      }
      this.options = null;
   }

   private async checkTokenStatus() {
      if (!this.options) return;

      const { refreshToken, onTokenExpired } = this.options;

      try {
         // Check if current token is valid
         if (isTokenValid(refreshToken)) {
            // Check if token is expiring soon (within 5 minutes)
            if (isTokenExpiringSoon(refreshToken, 5)) {
               await this.refreshToken();
            }
         } else {
            // Token is invalid, try to refresh
            await this.refreshToken();
         }
      } catch (error) {
         console.error('Token refresh check failed:', error);
         onTokenExpired();
      }
   }

   private async refreshToken() {
      if (!this.options) return;

      try {
         const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               refreshToken: this.options.refreshToken,
            }),
         });

         if (!response.ok) {
            throw new Error('Token refresh failed');
         }

         const data = await response.json();

         if (data.accessToken) {
            this.options.onTokenRefresh(data.accessToken);
         } else {
            throw new Error('No new token received');
         }
      } catch (error) {
         console.error('Token refresh failed:', error);
         this.options.onTokenExpired();
      }
   }
}

// Singleton instance
export const tokenRefreshService = new TokenRefreshService();

/**
 * Hook for automatic token refresh
 */
export function useTokenRefresh(
   accessToken: string,
   refreshToken: string,
   onTokenRefresh: (newToken: string) => void,
   onTokenExpired: () => void
) {
   React.useEffect(() => {
      if (accessToken && refreshToken) {
         tokenRefreshService.start({
            refreshToken,
            onTokenRefresh,
            onTokenExpired,
            checkInterval: 60000, // Check every minute
         });
      }

      return () => {
         tokenRefreshService.stop();
      };
   }, [accessToken, refreshToken, onTokenRefresh, onTokenExpired]);
}
