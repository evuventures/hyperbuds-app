import { apiClient } from "./client";
import type {
  Collaboration,
  CreateCollaborationRequest,
  UpdateCollaborationRequest,
  InviteCollaboratorsRequest,
  RespondToInviteRequest,
  AddDeliverableRequest,
  UpdateDeliverableRequest,
  ReviewCollaborationRequest,
  CollaborationFilters,
  CollaborationSearchFilters,
} from "@/types/collaboration.types";

export const collaborationApi = {
  createCollaboration: async (
    data: CreateCollaborationRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.post("/collaborations", data);
    return response.data;
  },

  getCollaborations: async (
    filters: CollaborationFilters = {}
  ): Promise<Collaboration[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("type", filters.type);
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.offset) params.set("offset", filters.offset.toString());

    const response = await apiClient.get(`/collaborations?${params.toString()}`);
    return response.data;
  },

  getCollaborationById: async (id: string): Promise<Collaboration> => {
    const response = await apiClient.get(`/collaborations/${id}`);
    return response.data;
  },

  updateCollaboration: async (
    id: string,
    data: UpdateCollaborationRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.put(`/collaborations/${id}`, data);
    return response.data;
  },

  deleteCollaboration: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/collaborations/${id}`);
    return response.data;
  },

  inviteCollaborators: async (
    id: string,
    data: InviteCollaboratorsRequest
  ): Promise<{ collaboration: Collaboration; newInvites: number }> => {
    const response = await apiClient.post(`/collaborations/${id}/invite`, data);
    return response.data;
  },

  respondToInvite: async (
    id: string,
    data: RespondToInviteRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.put(`/collaborations/${id}/respond`, data);
    return response.data;
  },

  updateStatus: async (
    id: string,
    status: Collaboration["status"]
  ): Promise<Collaboration> => {
    const response = await apiClient.put(`/collaborations/${id}/status`, { status });
    return response.data;
  },

  addDeliverable: async (
    id: string,
    data: AddDeliverableRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.post(`/collaborations/${id}/deliverables`, data);
    return response.data;
  },

  updateDeliverable: async (
    id: string,
    deliverableId: string,
    data: UpdateDeliverableRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.put(
      `/collaborations/${id}/deliverables/${deliverableId}`,
      data
    );
    return response.data;
  },

  reviewCollaboration: async (
    id: string,
    data: ReviewCollaborationRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.post(`/collaborations/${id}/review`, data);
    return response.data;
  },

  getPendingInvites: async (): Promise<Collaboration[]> => {
    const response = await apiClient.get("/collaborations/invites");
    return response.data;
  },

  getHistory: async (filters: CollaborationFilters = {}): Promise<Collaboration[]> => {
    const params = new URLSearchParams();
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.offset) params.set("offset", filters.offset.toString());

    const response = await apiClient.get(`/collaborations/history?${params.toString()}`);
    return response.data;
  },

  searchCollaborations: async (
    filters: CollaborationSearchFilters = {}
  ): Promise<Collaboration[]> => {
    const params = new URLSearchParams();
    if (filters.type) params.set("type", filters.type);
    if (filters.tags?.length) params.set("tags", filters.tags.join(","));
    if (filters.compensationType) params.set("compensationType", filters.compensationType);
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.offset) params.set("offset", filters.offset.toString());

    const response = await apiClient.get(`/collaborations/search?${params.toString()}`);
    return response.data;
  },
};

export default collaborationApi;