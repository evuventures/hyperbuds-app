/**
 * JWT utility functions for token handling and validation
 */

export interface JWTPayload {
   userId: string;
   email: string;
   iat: number;
   exp: number;
   [key: string]: any;
}

/**
 * Decode JWT token and extract payload
 */
export function decodeJWT(token: string): JWTPayload | null {
   try {
      // Remove Bearer prefix if present
      const cleanToken = token.replace(/^Bearer\s+/i, '');

      // Split token into parts
      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
         throw new Error('Invalid JWT format');
      }

      // Decode payload (middle part)
      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
         console.warn('JWT token is expired');
         return null;
      }

      return payload;
   } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
   }
}

/**
 * Extract user ID from JWT token
 */
export function getUserIdFromToken(token: string): string | null {
   const payload = decodeJWT(token);
   if (!payload) return null;

   // Try different possible user ID fields
   return payload.userId || payload.sub || payload.id || payload.user_id || null;
}

/**
 * Extract user email from JWT token
 */
export function getUserEmailFromToken(token: string): string | null {
   const payload = decodeJWT(token);
   if (!payload) return null;

   return payload.email || payload.email_address || null;
}

/**
 * Check if JWT token is valid and not expired
 */
export function isTokenValid(token: string): boolean {
   const payload = decodeJWT(token);
   return payload !== null;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
   const payload = decodeJWT(token);
   if (!payload || !payload.exp) return null;

   return new Date(payload.exp * 1000);
}

/**
 * Check if token expires within specified minutes
 */
export function isTokenExpiringSoon(token: string, minutes: number = 5): boolean {
   const expiration = getTokenExpiration(token);
   if (!expiration) return true;

   const now = new Date();
   const diffMinutes = (expiration.getTime() - now.getTime()) / (1000 * 60);

   return diffMinutes <= minutes;
}
