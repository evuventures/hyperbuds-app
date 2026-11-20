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

function normalizeCollaborationItem(raw: unknown): Collaboration {
  const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const id = String(item._id || item.id || "");
  return {
    ...(item as unknown as Collaboration),
    _id: id,
    status: (typeof item.status === "string" && item.status ? item.status : "draft") as Collaboration["status"],
    type: (typeof item.type === "string" && item.type ? item.type : "video") as Collaboration["type"],
    collaborators: Array.isArray(item.collaborators) ? (item.collaborators as Collaboration["collaborators"]) : [],
    deliverables: Array.isArray(item.deliverables) ? (item.deliverables as Collaboration["deliverables"]) : [],
    details:
      item.details && typeof item.details === "object"
        ? (item.details as Collaboration["details"])
        : item.scheduledDate
          ? { scheduledDate: String(item.scheduledDate) }
          : undefined,
  };
}

function unwrapCollaborationList(payload: unknown): Collaboration[] {
  if (Array.isArray(payload)) return payload.map(normalizeCollaborationItem);
  if (payload && typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    if (Array.isArray(rec.collaborations)) return rec.collaborations.map(normalizeCollaborationItem);
    if (Array.isArray(rec.invites)) return rec.invites.map(normalizeCollaborationItem);
    if (Array.isArray(rec.items)) return rec.items.map(normalizeCollaborationItem);
    if (Array.isArray(rec.data)) return rec.data.map(normalizeCollaborationItem);
  }
  return [];
}

function unwrapCollaborationOne(payload: unknown): Collaboration {
  if (payload && typeof payload === "object") {
    const rec = payload as Record<string, unknown>;
    if (rec.collaboration && typeof rec.collaboration === "object") {
      return normalizeCollaborationItem(rec.collaboration);
    }
  }
  return normalizeCollaborationItem(payload);
}

export const collaborationApi = {
  createCollaboration: async (
    data: CreateCollaborationRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.post("/collaborations", data);
    return unwrapCollaborationOne(response.data);
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
    return unwrapCollaborationList(response.data);
  },

  getCollaborationById: async (id: string): Promise<Collaboration> => {
    const response = await apiClient.get(`/collaborations/${id}`);
    return unwrapCollaborationOne(response.data);
  },

  updateCollaboration: async (
    id: string,
    data: UpdateCollaborationRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.put(`/collaborations/${id}`, data);
    return unwrapCollaborationOne(response.data);
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
    return {
      collaboration: unwrapCollaborationOne(response.data),
      newInvites: Number((response.data as { newInvites?: number })?.newInvites ?? 0),
    };
  },

  respondToInvite: async (
    id: string,
    data: RespondToInviteRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.put(`/collaborations/${id}/respond`, data);
    return unwrapCollaborationOne(response.data);
  },

  updateStatus: async (
    id: string,
    status: Collaboration["status"]
  ): Promise<Collaboration> => {
    const response = await apiClient.put(`/collaborations/${id}/status`, { status });
    return unwrapCollaborationOne(response.data);
  },

  addDeliverable: async (
    id: string,
    data: AddDeliverableRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.post(`/collaborations/${id}/deliverables`, data);
    return unwrapCollaborationOne(response.data);
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
    return unwrapCollaborationOne(response.data);
  },

  reviewCollaboration: async (
    id: string,
    data: ReviewCollaborationRequest
  ): Promise<Collaboration> => {
    const response = await apiClient.post(`/collaborations/${id}/review`, data);
    return unwrapCollaborationOne(response.data);
  },

  getPendingInvites: async (filters: CollaborationFilters = {}): Promise<Collaboration[]> => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("type", filters.type);
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.offset) params.set("offset", filters.offset.toString());

    const response = await apiClient.get(`/collaborations/invites?${params.toString()}`);
    return unwrapCollaborationList(response.data);
  },

  getHistory: async (filters: CollaborationFilters = {}): Promise<Collaboration[]> => {
    const params = new URLSearchParams();
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.offset) params.set("offset", filters.offset.toString());

    const response = await apiClient.get(`/collaborations/history?${params.toString()}`);
    return unwrapCollaborationList(response.data);
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
    return unwrapCollaborationList(response.data);
  },
};

export default collaborationApi;