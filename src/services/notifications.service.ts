import api from "./axios";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "@/types";

interface HubNotificationApi {
  id: string;
  title: string;
  body: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  actionRoute?: string | null;
}

interface HubNotificationsListData {
  data: HubNotificationApi[];
  unreadCount: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function mapType(
  type?: string,
): Notification["type"] {
  const key = (type ?? "").toUpperCase();
  if (key.includes("ALERT") || key.includes("WARN") || key.includes("LOW")) {
    return "warning";
  }
  if (key.includes("ERROR") || key.includes("FAIL")) return "error";
  if (
    key.includes("SUCCESS") ||
    key.includes("COMPLETE") ||
    key.includes("RECEIPT") ||
    key.includes("REQUISITION")
  ) {
    return "success";
  }
  return "info";
}

function mapNotification(row: HubNotificationApi): Notification {
  return {
    id: row.id,
    title: row.title,
    message: row.body,
    type: mapType(row.type),
    read: row.isRead,
    createdAt: row.createdAt,
    actionRoute: row.actionRoute,
  };
}

export const notificationsService = {
  async list(params?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const { data } = await api.get<ApiResponse<HubNotificationsListData>>(
      "/hub/notifications",
      {
        params: {
          unreadOnly: params?.unreadOnly ? true : undefined,
          limit: params?.limit ?? 30,
        },
      },
    );
    const payload = data.data;
    return {
      notifications: (payload.data ?? []).map(mapNotification),
      unreadCount: payload.unreadCount ?? 0,
    };
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/hub/notifications/${encodeURIComponent(id)}/read`);
  },
};
