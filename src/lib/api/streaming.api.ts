import { apiClient } from "./client";
import type { CreateStreamRequest, Stream, StreamListResponse, StreamStatus } from "@/types/streaming.types";

export const streamingApi = {
  createStream: async (data: CreateStreamRequest): Promise<{ stream: Stream }> => {
    const response = await apiClient.post("/streaming/streams", data);
    return response.data;
  },

  listStreams: async (params?: {
    status?: StreamStatus;
    page?: number;
    limit?: number;
  }): Promise<StreamListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const response = await apiClient.get(`/streaming/streams?${searchParams.toString()}`);
    return response.data;
  },

  discoverStreams: async (): Promise<{ streams: Stream[]; total: number }> => {
    const response = await apiClient.get("/streaming/discover");
    return response.data;
  },

  updateStream: async (
    streamId: string,
    data: Partial<CreateStreamRequest>,
  ): Promise<{ stream: Stream }> => {
    const response = await apiClient.put(`/streaming/streams/${streamId}`, data);
    return response.data;
  },

  getStream: async (streamId: string): Promise<{ stream: Stream }> => {
    const response = await apiClient.get(`/streaming/streams/${streamId}`);
    return response.data;
  },

  startStream: async (streamId: string): Promise<{ stream: Stream }> => {
    const response = await apiClient.put(`/streaming/streams/${streamId}/start`);
    return response.data;
  },

  endStream: async (streamId: string): Promise<{ stream: Stream }> => {
    const response = await apiClient.put(`/streaming/streams/${streamId}/end`);
    return response.data;
  },

  cancelStream: async (streamId: string): Promise<{ stream: Stream }> => {
    const response = await apiClient.put(`/streaming/streams/${streamId}/cancel`);
    return response.data;
  },

  toggleLike: async (streamId: string): Promise<{ streamId: string; liked: boolean; likesCount: number }> => {
    const response = await apiClient.post(`/streaming/streams/${streamId}/like`);
    return response.data;
  },

  toggleSubscribe: async (
    streamId: string,
    subscribed?: boolean,
  ): Promise<{ streamId: string; subscribed: boolean; subscribersCount: number }> => {
    const response = await apiClient.post(`/streaming/streams/${streamId}/subscribe`, {
      ...(typeof subscribed === "boolean" ? { subscribed } : {}),
    });
    return response.data;
  },

  recordShare: async (streamId: string): Promise<{ streamId: string; sharesCount: number }> => {
    const response = await apiClient.post(`/streaming/streams/${streamId}/share`);
    return response.data;
  },

  recordView: async (streamId: string): Promise<{ streamId: string; viewsCount: number }> => {
    const response = await apiClient.post(`/streaming/streams/${streamId}/view`);
    return response.data;
  },
};

export default streamingApi;
