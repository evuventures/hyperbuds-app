// src/lib/api/client.ts
import axios, { AxiosError } from "axios";

// ✅ 1. Base URL (auto from .env or fallback)
const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api-hyperbuds-backend.onrender.com/api/v1";

// ✅ 2. Create Axios instance
export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // ❌ Remove withCredentials unless you’re using cookies for auth
  // (since you’re using Bearer tokens, not cookies)
  withCredentials: false,
});

// ✅ 3. Request Interceptor — attach token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 4. Response Interceptor — global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    // 🔒 Handle expired or invalid tokens
    if (status === 401) {
      console.warn("⚠️ Unauthorized. Clearing token and redirecting...");
      localStorage.removeItem("accessToken");

      // Optional: redirect to login page if you're using Next.js
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // 🧹 Normalize error output
    const normalizedError = {
      message:
        (error.response?.data as any)?.message ||
        error.message ||
        "Unexpected error occurred",
      status,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
