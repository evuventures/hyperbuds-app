// src/lib/api/auth.api.ts

import { BASE_URL } from "@/config/baseUrl";

export interface GoogleAuthRequest {
  code: string;
}

export interface GoogleAuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Authenticate with Google OAuth authorization code
 */
export async function googleAuth(code: string): Promise<GoogleAuthResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData: AuthError = await response.json().catch(() => ({
      message: "Google authentication failed",
    }));
    throw new Error(errorData.message || "Google authentication failed");
  }

  return response.json();
}

