import api, { getApiErrorMessage } from "./axios";
import type { ApiResponse } from "@/types/api";

export type DeliveryScheduleBucket = "today" | "tomorrow" | "scheduled" | "all";

export interface DeliveryScheduleOrder {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  grandTotal: number;
  deliveryPreferenceType?: string | null;
  scheduledDate?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  scheduledStartMinutes?: number | null;
  scheduledEndMinutes?: number | null;
  scheduledSlotLabel?: string | null;
  expectedDeliveryAt?: string | null;
  deliveryVehicleType?: string | null;
  deliveryCustomerRemark?: string | null;
  deliveryCallOnArrival?: boolean | null;
  deliveryLeaveAtSecurity?: boolean | null;
  deliveryHeavyVehicleAccess?: boolean | null;
  openAreaConfirmed?: boolean | null;
  customer?: {
    id?: string;
    fullName?: string | null;
    phone?: string | null;
  } | null;
  address?: {
    siteName?: string | null;
    line1?: string | null;
    city?: string | null;
    pincode?: string | null;
  } | null;
  assignedDriver?: {
    id: string;
    name: string;
    phone?: string | null;
  } | null;
  assignedVehicle?: {
    id: string;
    registration: string;
    vehicleType?: string | null;
  } | null;
  proposedSlotId?: string | null;
  proposedStartAt?: string | null;
  proposedEndAt?: string | null;
  rescheduleReason?: string | null;
}

export interface DeliveryScheduleGroup {
  startMinutes: number | null;
  endMinutes: number | null;
  label: string;
  orders: DeliveryScheduleOrder[];
}

export interface DeliveryScheduleResponse {
  date: string;
  dateLabel: string;
  timezone: string;
  operatingWindow: {
    startMinutes: number;
    endMinutes: number;
    slotDurationMinutes: number;
  };
  bucket: DeliveryScheduleBucket;
  total: number;
  page?: number;
  limit?: number;
  groups: DeliveryScheduleGroup[];
  orders: DeliveryScheduleOrder[];
}

export interface DeliveryScheduleFilters {
  date?: string;
  bucket?: DeliveryScheduleBucket;
  status?: string;
  search?: string;
  vehicleType?: string;
}

export interface RescheduleRequestPayload {
  slotId: string;
  reason?: string;
}

export interface RescheduleRequestResult {
  id: string;
  orderNumber: string;
  orderStatus: string;
  scheduledDate?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  proposedSlotId?: string | null;
  proposedDate?: string | null;
  proposedStartAt?: string | null;
  proposedEndAt?: string | null;
  rescheduleReason?: string | null;
}

const VEHICLE_LABELS: Record<string, string> = {
  BIKE: "Bike",
  E_LOADER: "E-Loader",
  THREE_WHEELER_LOADER: "3 Wheeler Loader",
  PICK_UP_VAN: "Pick Up Van",
  FULL_TRUCK: "Full Truck",
  HEAVY_LOADER: "600 sqft Loader",
  RMC_TRANSIT_MIXER: "RMC Transit Mixer",
};

export function formatDeliveryVehicleLabel(type?: string | null): string {
  if (!type) return "—";
  return VEHICLE_LABELS[type] ?? String(type).replaceAll("_", " ");
}

export function formatScheduleAddress(
  address?: DeliveryScheduleOrder["address"],
): string {
  if (!address) return "—";
  const parts = [address.siteName, address.line1, address.city, address.pincode]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export const deliveryScheduleService = {
  async getDeliverySchedule(
    filters: DeliveryScheduleFilters = {},
  ): Promise<DeliveryScheduleResponse> {
    const { data } = await api.get<ApiResponse<DeliveryScheduleResponse>>(
      "/hub/delivery-schedule",
      {
        params: {
          date: filters.date || undefined,
          bucket: filters.bucket || undefined,
          status: filters.status || undefined,
          search: filters.search?.trim() || undefined,
          vehicleType: filters.vehicleType || undefined,
        },
      },
    );
    return data.data;
  },

  async requestReschedule(
    orderId: string,
    payload: RescheduleRequestPayload,
  ): Promise<RescheduleRequestResult> {
    const { data } = await api.post<ApiResponse<RescheduleRequestResult>>(
      `/hub/orders/${orderId}/reschedule-request`,
      {
        slotId: payload.slotId.trim(),
        reason: payload.reason?.trim() || undefined,
      },
    );
    return data.data;
  },

  getErrorMessage(error: unknown): string {
    return getApiErrorMessage(error);
  },
};
