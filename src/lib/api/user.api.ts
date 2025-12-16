// src/lib/api/user.api.ts
import { BASE_URL } from "@/config/baseUrl";

export async function getCurrentUser() {
  // Get token from localStorage only if running in browser
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  if (!token) throw new Error("No access token found");

  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let errorMessage = "Failed to fetch user profile";
      try {
        const errorData = await res.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        // ignore if no JSON response
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    return data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ getCurrentUser error:", message);
    throw new Error(message);
  }
}
