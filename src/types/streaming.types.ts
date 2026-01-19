import type { Pagination } from "./common.types";

export type StreamStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface Stream {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: StreamStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  streamKey: string;
  ingestUrl?: string;
  playbackUrl?: string;
  recordingUrl?: string;
  chatEnabled?: boolean;
  viewersCurrent?: number;
  viewersPeak?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStreamRequest {
  title: string;
  description?: string;
  scheduledAt?: string;
  tags?: string[];
}

export interface StreamListResponse {
  streams: Stream[];
  pagination: Pagination;
}
