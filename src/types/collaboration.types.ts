export type CollaborationStatus =
  | "draft"
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type CollaborationType =
  | "video"
  | "livestream"
  | "podcast"
  | "photo_shoot"
  | "event"
  | "challenge"
  | "series"
  | "other";

export type CollaboratorRole = "co-creator" | "featured" | "guest";
export type CollaboratorStatus = "invited" | "accepted" | "declined" | "removed";

export interface UserReference {
  _id: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  email?: string;
  [key: string]: unknown;
}

export interface CollaborationCompensation {
  type: "none" | "revenue_share" | "fixed_fee" | "barter";
  amount?: number;
  currency?: string;
  description?: string;
}

export interface CollaborationDetails {
  scheduledDate?: string;
  duration?: number;
  location?: string;
  platform?: string[];
  requirements?: string[];
  compensation?: CollaborationCompensation;
}

export interface CollaborationContent {
  theme?: string;
  hashtags?: string[];
  targetAudience?: string;
  goals?: string[];
}

export interface CollaborationDeliverable {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  status?: "pending" | "in_progress" | "completed";
  assignedTo?: UserReference | string;
  files?: string[];
}

export interface CollaborationMeetingLink {
  platform?: string;
  url?: string;
  scheduledFor?: string;
}

export interface CollaborationCommunication {
  chatRoomId?: string;
  meetingLinks?: CollaborationMeetingLink[];
}

export interface CollaborationAnalytics {
  totalViews?: number;
  totalEngagement?: number;
  revenueGenerated?: number;
  platformBreakdown?: Record<string, number>;
}

export interface CollaborationReview {
  reviewer: UserReference | string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface CollaborationRating {
  overall?: number;
  reviews?: CollaborationReview[];
}

export interface CollaborationCollaborator {
  user: UserReference | string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invitedAt?: string;
  respondedAt?: string;
}

export interface Collaboration {
  _id: string;
  title: string;
  description: string;
  type: CollaborationType;
  status: CollaborationStatus;
  creator: UserReference | string;
  collaborators: CollaborationCollaborator[];
  details?: CollaborationDetails;
  content?: CollaborationContent;
  deliverables?: CollaborationDeliverable[];
  communication?: CollaborationCommunication;
  analytics?: CollaborationAnalytics;
  tags?: string[];
  isPublic?: boolean;
  rating?: CollaborationRating;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCollaborationRequest {
  title: string;
  description: string;
  type: CollaborationType;
  details?: CollaborationDetails;
  content?: CollaborationContent;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateCollaborationRequest {
  title?: string;
  description?: string;
  details?: CollaborationDetails;
  content?: CollaborationContent;
  tags?: string[];
  isPublic?: boolean;
}

export interface InviteCollaboratorsRequest {
  collaborators: Array<{
    userId: string;
    role?: CollaboratorRole;
    message?: string;
  }>;
}

export interface RespondToInviteRequest {
  action: "accept" | "decline";
  message?: string;
}

export interface AddDeliverableRequest {
  title: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
}

export interface UpdateDeliverableRequest {
  status?: "pending" | "in_progress" | "completed";
  files?: string[];
}

export interface ReviewCollaborationRequest {
  rating: number;
  comment?: string;
}

export interface CollaborationFilters {
  status?: CollaborationStatus;
  type?: CollaborationType;
  limit?: number;
  offset?: number;
}

export interface CollaborationSearchFilters {
  type?: CollaborationType;
  tags?: string[];
  compensationType?: CollaborationCompensation["type"];
  limit?: number;
  offset?: number;
}