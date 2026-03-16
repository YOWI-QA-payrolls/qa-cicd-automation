'use client';
import { create } from 'zustand';
import type { Notification } from '@/types';

interface UiState {
  sidebarOpen: boolean;
  notifications: Notification[];
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  notifications: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, notification] })),
  removeNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));
