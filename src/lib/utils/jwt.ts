/**
 * JWT utility functions for token handling and validation
 */

// Define the core properties of the JWT payload
export interface BaseJWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Extend the core interface to allow for other properties, but with a type-safe approach
export interface JWTPayload extends BaseJWTPayload {
  [key: string]: unknown; // Using 'unknown' is safer than 'any'
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

  const id = payload.userId ||
             payload.sub ||
             payload.id ||
             payload.user_id;

  return typeof id === 'string' ? id : null;
}

/**
 * Extract user email from JWT token
 */
export function getUserEmailFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  if (!payload) return null;

  const email = payload.email || payload.email_address;

  return typeof email === 'string' ? email : null;
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