// api/matching.ts

import { BASE_URL } from '@/config/baseUrl';

// A single function to get a token and create headers
const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    if (!token) {
        throw new Error("No access token found. You must be logged in.");
    }
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

// Get AI-generated match suggestions
export const getSuggestions = async (): Promise<any> => {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/matching/suggestions`, { method: "GET", headers });
    if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.message || "Failed to fetch suggestions");
    }
    return res.json();
};

// Set matching preferences
export const setPreferences = async (preferences: any): Promise<any> => {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/matching/preferences`, {
        method: "POST",
        headers,
        body: JSON.stringify(preferences),
    });
    if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.message || "Failed to set preferences");
    }
    return res.json();
};

// Get compatibility with a specific user
export const getCompatibility = async (userId: string | number): Promise<any> => {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/matching/compatibility/${userId}`, { method: "GET", headers });
    if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.message || "Failed to get compatibility");
    }
    return res.json();
};

// Take action on a match (like, dislike)
export const takeAction = async (matchId: string | number, action: string): Promise<any> => {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/matching/matches/${matchId}/action`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ action }),
    });
    if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.message || "Failed to take action");
    }
    return res.json();
};

// Get match history
export const getHistory = async (): Promise<any> => {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/matching/history`, { method: "GET", headers });
    if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.message || "Failed to fetch history");
    }
    return res.json();
};

// Block a user
export const blockUser = async (userId: string | number): Promise<any> => {
    const headers = getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/matching/block`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.message || "Failed to block user");
    }
    return res.json();
};
