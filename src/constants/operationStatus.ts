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
    label: "Out For Delivery",
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
  dispatch: "Out for delivery to customer",
  delivered: "Delivered to customer",
};

/** Maps legacy / backend status values to unified hub operation status */
export function normalizeHubOperationStatus(
  status: string
): HubOperationStatus {
  const key = status.toLowerCase().replace(/-/g, "_");
  const map: Record<string, HubOperationStatus> = {
    new: "pending",
    pending: "pending",
    confirmed: "pending",
    hub_assigned: "pending",
    awaiting_hub_allocation: "pending",
    awaiting: "pending",
    accepted_by_hub: "loading",
    processing: "loading",
    picking: "loading",
    packed: "loading",
    ready_for_dispatch: "loading",
    driver_assigned: "loading",
    preparing: "loading",
    assigned: "loading",
    loading: "loading",
    out_for_delivery: "dispatch",
    dispatched: "dispatch",
    in_transit: "dispatch",
    arrived: "dispatch",
    delayed: "dispatch",
    dispatch: "dispatch",
    delivered: "delivered",
    // Keep cancelled out of pending; bucket with completed for tabs
    cancelled: "delivered",
  };
  return map[key] ?? "pending";
}
