// src/lib/api/auth.api.ts

import apiClient from "./client";


export interface User {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  profile?: {
    username?: string;
    bio?: string;
    niche?: string[] | string;
  };
  // ✅ This index signature(authSlice)
  [key: string]: unknown; 
}

export interface GoogleAuthResponse {
  accessToken: string;
  user: User;
}

export interface UserResponse {
  email: string;
  user: User;
  profile: NonNullable<User['profile']>;
}

/**
 * Authenticate with Google OAuth authorization code
 */
export async function googleAuth(code: string): Promise<GoogleAuthResponse> {
  const response = await apiClient.post<GoogleAuthResponse>("/auth/google", { code });
  return response.data;
}

/**
 * Fetch current user and profile data
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/users/me");
  
  // Normalize the user ID here to fix the Chat Window alignment issue
  if (response.data.user) {
    response.data.user.id = response.data.user.id || response.data.user._id;
  }
  
  return response.data;
}