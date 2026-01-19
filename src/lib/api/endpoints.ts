export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api-hyperbuds-backend.onrender.com/api/v1";

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
