export interface EditFormState {
  title: string;
  description: string;
  type: string;
  scheduledDate: string;
  duration: string;
  location: string;
  platforms: string[];
  requirements: string;
  compensationType: 'none' | 'revenue_share' | 'fixed_fee' | 'barter';
  compensationAmount: string;
  compensationCurrency: string;
  compensationDescription: string;
  theme: string;
  hashtags: string;
  targetAudience: string;
  goals: string;
  tags: string;
  isPublic: boolean;
}

export interface InviteFormState {
  username: string;
  role: string;
  message: string;
}

export interface DeliverableFormState {
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  files: string;
}

export type DeliverableUpdateState = Record<string, { status?: string; files?: string }>;

export interface ReviewFormState {
  rating: string;
  comment: string;
}
