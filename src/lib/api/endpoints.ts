export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000/api/v1"
    : "https://api-hyperbuds-backend.onrender.com/api/v1");

export const API_ENDPOINTS = {
  analytics: "/analytics",
  collaborations: "/collaborations",
  marketplace: "/marketplace",
  streaming: "/streaming",
  messaging: "/messaging",
  matching: "/matching",
  profiles: "/profiles",
  users: "/users",
  payments: "/payments",
  notifications: "/notifications",
  update: "/update",
} as const;
