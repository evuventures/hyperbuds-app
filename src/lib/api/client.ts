// src/lib/api/client.ts
import axios, { AxiosError } from "axios";

// You can set this from .env.local (Next.js) or .env (Node)
// Example: NEXT_PUBLIC_API_BASE_URL=https://api.example.com
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-hyperbuds-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // send cookies if needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (e.g. attach token)
apiClient.interceptors.request.use(
  (config) => {
    // Grab token from localStorage/Zustand/NextAuth/etc.
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (e.g. handle errors globally)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized globally
      console.warn("Unauthorized. Maybe redirect to login?");
      // e.g. clear token, redirect, or trigger logout store action
      localStorage.removeItem("accessToken");
    }

    // Optionally normalize error shape
    return Promise.reject(
      error.response?.data || {
        message: error.message || "Unexpected error occurred",
      }
    );
  }
);

export default apiClient;
