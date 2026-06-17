import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Notification, ModalConfig } from '../types';
import { mockUser, generateNotifications } from '../data/mockData';

interface AppState {
  user: User | null;
  notifications: Notification[];
  modals: ModalConfig[];
  loading: boolean;
  setUser: (user: User | null) => void;
  login: () => void;
  logout: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  openModal: (modal: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      notifications: [],
      modals: [],
      loading: false,

      setUser: (user) => set({ user }),

      login: () => {
        const persisted = get().notifications;
        set({ user: mockUser, notifications: persisted.length > 0 ? persisted : generateNotifications() });
      },

      logout: () => {
        set({ user: null, notifications: [], modals: [] });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `N${Date.now()}${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set({ notifications: [newNotification, ...get().notifications] });
      },

      markNotificationRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },

      markAllNotificationsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      openModal: (modal) => {
        const id = `M${Date.now()}${Math.floor(Math.random() * 1000)}`;
        set({ modals: [...get().modals, { ...modal, id }] });
        return id;
      },

      closeModal: (id) => {
        set({ modals: get().modals.filter((m) => m.id !== id) });
      },

      closeAllModals: () => {
        set({ modals: [] });
      },

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'qc_app',
      partialize: (state) => ({
        user: state.user,
        notifications: state.notifications,
      }),
    }
  )
);
