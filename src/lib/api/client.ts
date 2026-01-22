// src/lib/api/client.ts
import axios, { AxiosError } from "axios";

// ✅ 1. Base URL (auto from .env or fallback)
const baseURL = 'http://localhost:4000/api/v1';
  // process.env.NEXT_PUBLIC_API_BASE_URL ||
  // "https://api-hyperbuds-backend.onrender.com/api/v1";

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
// Note: Tokens now last 3 days - no refresh logic needed
type ApiErrorResponse = {
  message?: string;
  [key: string]: unknown;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as ApiErrorResponse | undefined;

    // 🔒 Handle expired or invalid tokens
    if (status === 401) {
      console.warn("⚠️ Unauthorized. Clearing token and redirecting...");
      localStorage.removeItem("accessToken");

      // Redirect to login if we're in the browser
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/auth/")) {
          window.location.href = "/auth/signin";
        }
      }
    }

    // 🧹 Normalize error output
    const normalizedError = {
      message: responseData?.message || error.message || "Unexpected error occurred",
      status,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;