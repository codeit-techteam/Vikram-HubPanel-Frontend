import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authService, clearStoredTokens, setStoredTokens } from "@/services/auth.service";
import { notificationsService } from "@/services/notifications.service";
import type { Notification, User } from "@/types";
import type { HubManager } from "@/types/auth";
import { clearAuthCookies, setAuthCookies } from "@/utils/auth-cookies";
import { syncUserFromManager } from "@/store/userStore";

function mapManagerToUser(manager: HubManager): User {
  return {
    id: manager.id,
    name: manager.name,
    email: manager.email ?? "",
    role: manager.role,
  };
}

interface AuthState {
  user: User | null;
  manager: HubManager | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateSession: () => Promise<void>;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      manager: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setLoading: (isLoading) => set({ isLoading }),

      login: async (employeeId, password) => {
        const data = await authService.login(employeeId, password);
        const manager = data.manager;
        const user = mapManagerToUser(manager);

        setStoredTokens(data.accessToken, data.refreshToken);
        setAuthCookies(data.accessToken, data.refreshToken, manager.role);
        syncUserFromManager(manager);

        set({
          user,
          manager,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        const token = get().refreshToken;

        if (token) {
          try {
            await authService.logout(token);
          } catch {
            // Clear local session even if API logout fails
          }
        }

        clearStoredTokens();
        clearAuthCookies();
        set({
          user: null,
          manager: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      hydrateSession: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken || !refreshToken) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        // Keep axios token storage in sync with persisted session
        setStoredTokens(accessToken, refreshToken);

        try {
          const manager = await authService.getMe();
          const user = mapManagerToUser(manager);
          syncUserFromManager(manager);
          setAuthCookies(accessToken, refreshToken, manager.role);
          set({
            user,
            manager,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          clearStoredTokens();
          clearAuthCookies();
          set({
            user: null,
            manager: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "hub-auth-storage",
      partialize: (state) => ({
        user: state.user,
        manager: state.manager,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Only clear loading if there is no session to hydrate.
        // AuthProvider calls hydrateSession after persist finishes.
        if (!state?.accessToken || !state?.refreshToken) {
          useAuthStore.setState({ isLoading: false, isAuthenticated: false });
        }
      },
    },
  ),
);

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  loadNotifications: async () => {
    set({ loading: true });
    try {
      const { notifications, unreadCount } =
        await notificationsService.list({ limit: 40 });
      set({ notifications, unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    const current = get().notifications.find((n) => n.id === id);
    if (!current || current.read) return;

    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    });

    try {
      await notificationsService.markRead(id);
    } catch {
      await get().loadNotifications();
    }
  },

  markAllAsRead: async () => {
    const unread = get().notifications.filter((n) => !n.read);
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    try {
      await Promise.all(unread.map((n) => notificationsService.markRead(n.id)));
    } catch {
      await get().loadNotifications();
    }
  },
}));
