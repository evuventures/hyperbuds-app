import { BASE_URL } from "@/config/baseUrl";
import { Collaboration } from "@/types/collaboration.types";

// --- Specialized Request Interfaces ---

/**
 * Request body for POST /collaborations 
 *
 */
export interface CreateCollaborationRequest {
  title: string;
  description: string;
  type: string;       // e.g., "social_media", "content_creation"
  details: Record<string, unknown>;    // Expanded details field
  content: {
    [key: string]: unknown; // Matches "additionalProp1": {} in documentation
  };
  tags: string[];     // Array of keywords
  isPublic: boolean;
}

/**
 * Parameters for GET /collaborations filtering 
 *
 */
export interface ListCollaborationsParams {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

// --- API Functions ---

/**
 * GET /collaborations
 * Fetch list with optional query parameters
 */
export async function listCollaborations(
  token: string, 
  params?: ListCollaborationsParams
): Promise<Collaboration[]> {
  const query = params 
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}` 
    : "";
    
  const response = await fetch(`${BASE_URL}/api/v1/collaborations${query}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch collaborations");
  return response.json();
}

/**
 * POST /collaborations
 * Create a collaboration only
 */
export async function createCollaboration(
  data: CreateCollaborationRequest, 
  token: string
): Promise<Collaboration> {
  const response = await fetch(`${BASE_URL}/api/v1/collaborations`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.status !== 201) { // Success code 201
    const error = await response.json();
    throw new Error(error.message || "Creation failed");
  }

  return response.json();
}

// src/lib/api/collaboration.api.ts

// ... existing createCollaboration function ...

export const updateCollaboration = async (id: string, data: Partial<CreateCollaborationRequest>, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/collaborations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update collaboration');
    }
    return response.json();
};


export const deleteCollaboration = async (id: string, token: string) => {
    const response = await fetch(`${BASE_URL}/api/v1/collaborations/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete collaboration');
    }
    return true;
};