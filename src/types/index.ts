export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
}

export type RunStatus = 'idle' | 'queued' | 'in_progress' | 'success' | 'failure' | 'error';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  createdAt: Date;
}
