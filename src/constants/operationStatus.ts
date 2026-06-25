import type { HubOperationStatus } from "@/types";

export type { HubOperationStatus };

export const HUB_OPERATION_STATUS_CONFIG: Record<
  HubOperationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-600",
  },
  loading: {
    label: "Loading",
    className: "bg-sky-100 text-sky-700",
  },
  dispatch: {
    label: "Dispatch",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
  },
};

export const HUB_OPERATION_ACTIVE_STATUSES: HubOperationStatus[] = [
  "pending",
  "loading",
  "dispatch",
];

export const HUB_OPERATION_STATUS_DESCRIPTIONS: Record<
  HubOperationStatus,
  string
> = {
  pending: "Order incoming — awaiting processing",
  loading: "Materials being loaded at hub",
  dispatch: "Dispatched — out for delivery to customer",
  delivered: "Delivered to customer",
};

/** Maps legacy status values to unified hub operation status */
export function normalizeHubOperationStatus(
  status: string
): HubOperationStatus {
  const map: Record<string, HubOperationStatus> = {
    new: "pending",
    processing: "loading",
    packed: "loading",
    out_for_delivery: "dispatch",
    preparing: "loading",
    assigned: "loading",
    dispatched: "dispatch",
    in_transit: "dispatch",
    arrived: "dispatch",
    delayed: "dispatch",
    pending: "pending",
    loading: "loading",
    dispatch: "dispatch",
    delivered: "delivered",
  };
  return map[status] ?? "pending";
}
