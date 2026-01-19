import apiClient from "./client";
import { 
  Collaboration, 
  CollaborationHistoryItem, 
  InviteResponse, 
  SearchParams,
  PendingInvite // Ensure this is exported from your types
} from "@/types/collaboration.types";

// --- Types ---

export interface CreateCollaborationRequest {
  title: string;
  description: string;
  type: string;
  details: Record<string, unknown>;
  content: {
    [key: string]: unknown;
  };
  tags: string[];
  isPublic: boolean;
}

export interface ListCollaborationsParams {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

// --- API Functions ---

/**
 * GET /collaborations
 * No more manual URLSearchParams or token passing!
 */
export const listCollaborations = async (params?: ListCollaborationsParams): Promise<Collaboration[]> => {
  const response = await apiClient.get<Collaboration[]>("/collaborations", { params });
  return response.data;
};

/**
 * POST /collaborations
 */
export const createCollaboration = async (data: CreateCollaborationRequest): Promise<Collaboration> => {
  const response = await apiClient.post<Collaboration>("/collaborations", data);
  return response.data;
};

/**
 * PUT /collaborations/{id}
 */
export const updateCollaboration = async (id: string, data: Partial<CreateCollaborationRequest>): Promise<Collaboration> => {
  const response = await apiClient.put<Collaboration>(`/collaborations/${id}`, data);
  return response.data;
};

/**
 * DELETE /collaborations/{id}
 */
export const deleteCollaboration = async (id: string): Promise<boolean> => {
  await apiClient.delete(`/collaborations/${id}`);
  return true;
};

/**
 * GET /collaborations/search
 */
export const searchCollaborations = async (params: SearchParams): Promise<Collaboration[]> => {
  // Clean up 'Any' or 'All' values before sending to API
  const cleanParams = { ...params };
  if (cleanParams.type === 'Any') delete cleanParams.type;
  if (cleanParams.compensationType === 'All') delete cleanParams.compensationType;

  const response = await apiClient.get<Collaboration[]>("/collaborations/search", { 
    params: cleanParams 
  });
  return response.data;
};

/**
 * POST /collaborations/{id}/invite
 */
export const requestToJoin = async (collabId: string, myUserId: string, message: string): Promise<boolean> => {
  const response = await apiClient.post(`/collaborations/${collabId}/invite`, {
    collaborators: [{
      userId: myUserId,
      role: "collaborator",
      message: message
    }]
  });
  return response.status === 200 || response.status === 201;
};

/**
 * GET /collaborations/invites
 */
export const getPendingInvites = async (): Promise<PendingInvite[]> => {
  const response = await apiClient.get<PendingInvite[]>("/collaborations/invites");
  return response.data;
};

/**
 * PUT /collaborations/{id}/respond
 */
export const respondToInvite = async (id: string, data: InviteResponse): Promise<boolean> => {
  const response = await apiClient.put(`/collaborations/${id}/respond`, data);
  return response.status === 200;
};

/**
 * GET /collaborations/history
 */
export const getCollaborationHistory = async (token: string): Promise<CollaborationHistoryItem[]> => {
  const response = await apiClient.get<CollaborationHistoryItem[]>("/collaborations/history");
  return response.data;
};