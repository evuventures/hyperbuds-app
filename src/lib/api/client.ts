// src/lib/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./endpoints";
import { getAccessToken } from "@/store/authSelectors";
import { store } from "@/store/store";
import { clearAuth, setToken } from "@/store/slices/authSlice";

const baseURL = API_BASE_URL;

export const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor — attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

type ApiErrorResponse = {
  message?: string;
  [key: string]: unknown;
};

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Single-flight refresh promise so concurrent 401s share one refresh request
let inflightRefresh: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (inflightRefresh) return inflightRefresh;

  inflightRefresh = (async () => {
    try {
      const storedRefresh = window.localStorage.getItem("refreshToken") || undefined;
      const resp = await axios.post<{ accessToken?: string }>(
        `${baseURL}/auth/refresh`,
        storedRefresh ? { refreshToken: storedRefresh } : {},
        { withCredentials: true, timeout: 15000 },
      );
      const nextToken = resp.data?.accessToken;
      if (typeof nextToken === "string" && nextToken.trim()) {
        window.localStorage.setItem("accessToken", nextToken);
        store.dispatch(setToken(nextToken));
        return nextToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    const originalConfig = error.config as RetryableConfig | undefined;
    const reqUrl = String(originalConfig?.url || "");
    const isAuthRoute =
      reqUrl.includes("/auth/login") ||
      reqUrl.includes("/auth/register") ||
      reqUrl.includes("/auth/refresh") ||
      reqUrl.includes("/auth/logout");

    // Attempt seamless single-flight token refresh before signing the user out
    if (status === 401 && originalConfig && !originalConfig._retry && !isAuthRoute) {
      originalConfig._retry = true;
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${refreshed}`;
        return apiClient.request(originalConfig);
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("refreshToken");
      }
      store.dispatch(clearAuth());

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/" && !currentPath.startsWith("/auth/")) {
          window.location.href = "/auth/signin";
        }
      }
    }

    const normalizedError = {
      message: responseData?.message || error.message || "Unexpected error occurred",
      status,
      code: error.code,
      data: error.response?.data,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
