export interface Deliverable {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'completed';
}

export interface Collaboration {
  ownerId: string;
  id: string;
  title: string;
  description: string;
  type: string;        // Added
  tags: string[];      // Added
  isPublic: boolean;   // Added
  details: Record<string, unknown>;        // Added (Backend object)
  content: Record<string, unknown>;        // Added (Backend object)
  brand?: string;
  budget?: number;
  startDate?: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  deliverables?: Deliverable[];
}

export interface SearchParams {
    type?: string;
    tags?: string;
    compensationType?: string;
    limit?: number;
    offset?: number;
}

export interface InviteCollaborator {
    userId: string;
    role: string;
    message: string;
}

export interface InviteResponse {
    action: 'accept' | 'decline';
    message?: string;
}
export interface PendingInvite {
    id: string;
    title: string;
    senderName: string; // From the user object linked to the invite
    amount?: string;
    expiresIn?: string;
}

export type CollaborationHistoryStatus = 'Completed' | 'Updated' | 'Invite Received' | 'Cancelled';

export interface CollaborationHistoryItem {
    id: string;
    title: string;
    clientName: string; // e.g., "Apple", "Nike"
    description: string; // e.g., "All deliverables submitted"
    status: CollaborationHistoryStatus;
    timestamp: string;
    initials: string;
}