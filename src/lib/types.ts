import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  activeWeddingId?: string | null;
}

export interface WeddingSession {
  id: string;
  weddingDate: Timestamp;
  ownerId: string;
  partnerIds: string[];
  shareCode?: string; // Optional, can be generated if needed for joining
  createdAt: Timestamp;
}

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface Task {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  assignedTo: string[]; // Array of user UIDs
  deadline: Timestamp;
  status: TaskStatus;
  createdBy: string; // UID of user who created the task
  createdAt: Timestamp;
  lastUpdatedAt: Timestamp;
}

export interface Vendor {
  name: string;
  description: string;
  contactInfo: string;
}
