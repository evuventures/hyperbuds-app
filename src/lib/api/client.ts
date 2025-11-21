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
// Note: Tokens now last 3 days - no refresh logic needed
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token and redirect to login
      // No refresh attempt since tokens now last 3 days
      localStorage.removeItem("accessToken");
      
      // Redirect to login if we're in the browser
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth/")) {
          window.location.href = "/auth/signin";
        }
      }
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
