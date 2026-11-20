import type { Pagination } from "./common.types";

export type StreamStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface Stream {
  _id: string;
  id?: string;
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
  thumbnailUrl?: string | null;
  category?: string;
  likesCount?: number;
  subscribersCount?: number;
  sharesCount?: number;
  viewsCount?: number;
  isLiked?: boolean;
  isSubscribed?: boolean;
  host?: {
    _id?: string;
    id?: string;
    displayName?: string;
    username?: string;
    avatar?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStreamRequest {
  title: string;
  description?: string;
  scheduledAt?: string;
  tags?: string[];
  thumbnailUrl?: string;
  category?: string;
  chatEnabled?: boolean;
  recordingEnabled?: boolean;
  recordingConsent?: boolean;
}

export interface StreamListResponse {
  streams: Stream[];
  pagination: Pagination;
}
