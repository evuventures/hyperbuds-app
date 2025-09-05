// utils/api.ts
const BASE_URL = 'https://api-hyperbuds-backend.onrender.com';

async function getAccessToken() {
  let token = localStorage.getItem("accessToken");

  if (!token) {
    // Try refreshing if no token
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      token = data.accessToken;
    }
  }

  return token;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token = await getAccessToken();

  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  // If token expired → refresh & retry once
  if (res.status === 401) {
    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.accessToken);

      res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    }
  }

  return res.json();
}
