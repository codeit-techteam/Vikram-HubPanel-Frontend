import { create } from "zustand";
import type { Notification, User } from "@/types";
import { erpDatabase } from "@/services/erpDatabase";

const currentUser = erpDatabase.getCurrentUser() as {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
};

export const MOCK_CREDENTIALS = {
  employeeId: currentUser.employeeId ?? "hubmanager01",
  password: "123456",
} as const;

const ACCEPTED_EMPLOYEE_IDS = new Set([
  MOCK_CREDENTIALS.employeeId.toLowerCase(),
  "hubmanger01",
]);

function normalizeEmployeeId(employeeId: string) {
  return employeeId.trim().toLowerCase();
}

function normalizePassword(password: string) {
  return password.trim();
}

const hubManagerUser: User = {
  id: currentUser.id,
  name: currentUser.name,
  email: currentUser.email,
  role: currentUser.role,
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (employeeId: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (employeeId, password) => {
    const normalizedId = normalizeEmployeeId(employeeId);
    const normalizedPassword = normalizePassword(password);

    const isValid =
      ACCEPTED_EMPLOYEE_IDS.has(normalizedId) &&
      normalizedPassword === MOCK_CREDENTIALS.password;

    if (isValid) {
      set({ user: hubManagerUser, isAuthenticated: true });
      return true;
    }

    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));

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
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    title: "Low Stock Alert",
    message: "Safety Helmets at North Hub below minimum threshold",
    type: "warning",
    read: false,
    createdAt: "2025-06-17T08:00:00Z",
  },
  {
    id: "notif-002",
    title: "Dispatch Completed",
    message: "DSP-2025-00785 delivered to Vikram Sub Hub - Lucknow",
    type: "success",
    read: false,
    createdAt: "2025-06-17T07:30:00Z",
  },
  {
    id: "notif-003",
    title: "New Requisition",
    message: "REQ-2025-00142 pending approval",
    type: "info",
    read: true,
    createdAt: "2025-06-16T16:00:00Z",
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter((n) => !n.read).length,
  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
