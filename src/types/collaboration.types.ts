export interface Deliverable {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  status: 'pending' | 'completed';
}

export interface Collaboration {
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