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
};

export default streamingApi;
