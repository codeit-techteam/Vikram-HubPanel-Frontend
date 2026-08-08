import type {
  CreateDispatchFormPayload,
  DispatchDriver,
  DispatchQueueStatus,
  DispatchRecord,
  DispatchRoute,
  DispatchSortField,
  DispatchVehicle,
  FleetStats,
  InitiateDispatchPayload,
  PendingDispatchOrder,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";

function unwrap<T>(payload: T | { data: T } | undefined | null): T {
  if (payload == null) return [] as unknown as T;
  if (Array.isArray(payload)) return payload as T;
  if (typeof payload === "object" && "data" in (payload as object)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

interface BackendPendingOrder {
  id: string;
  orderNo: string;
  orderNumber?: string;
  label: string;
  customer: string;
  location?: string;
  address?: string;
  priority?: "normal" | "high" | "urgent";
  weight?: string;
  weightValue?: number;
  eta?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderValue?: number;
  materials?: string;
  items?: Array<{ id: string; name: string; quantity: number; unit: string }>;
  itemCount?: number;
  totalQuantity?: number;
}

interface BackendFleetVehicle {
  id: string;
  registrationNo: string;
  vehicleNumber?: string;
  capacity: string;
  capacityValue?: number;
  remainingCapacity?: number;
  vehicleType?: string;
  type?: string;
  status: string;
  availability?: string;
  currentDriver?: string | null;
  currentDriverId?: string | null;
  currentHub?: string | null;
}

interface BackendDriver {
  id: string;
  name: string;
  phone?: string;
  mobile?: string;
  rating?: number;
  currentDeliveries?: number;
  experience?: string;
  assignedVehicle?: string | null;
  status: string;
  availability?: string;
}

interface BackendFleetStats {
  activeFleet: { current: number; total: number; changePercent: number };
  avgHubExit: { minutes: number; status: string };
  activeTransits: number;
  pendingLoadTons: number;
  availableVehicles?: number;
  busyVehicles?: number;
  maintenance?: number;
  idle?: number;
  averageDeliveryTimeMinutes?: number;
  capacityUtilization?: number;
}

interface BackendLiveDispatch {
  id: string;
  dispatchNo: string;
  trackingNo?: string | null;
  orderNo: string;
  orderId?: string;
  status: DispatchQueueStatus | string;
  customer: string;
  customerDetails?: {
    name: string;
    phone?: string;
    address?: string;
  };
  schedule: string;
  scheduledTime: string;
  vehicle: string;
  driver: string;
  route: string;
  eta: string;
  priority: "normal" | "high" | "urgent";
  remarks?: string;
  items?: number;
  timeline?: DispatchRecord["timeline"];
  documents?: DispatchRecord["documents"];
  dispatchDate?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  address?: string;
}

interface BackendSlot {
  id: string;
  label: string;
  value: string;
  startAt: string;
  estimatedEtaAt: string;
  travelMinutes: number;
  available: boolean;
}

function mapPending(order: BackendPendingOrder): PendingDispatchOrder {
  return {
    id: order.id,
    orderNo: order.orderNo || order.orderNumber || order.id,
    label: order.label,
    customer: order.customer,
    materials: order.materials || "",
    location: order.location || order.address,
    priority: order.priority,
    weight: order.weight,
    eta: order.eta,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderValue: order.orderValue,
    items: order.items,
    totalQuantity: order.totalQuantity,
  };
}

function mapVehicle(v: BackendFleetVehicle): DispatchVehicle {
  return {
    id: v.id,
    registrationNo: v.registrationNo || v.vehicleNumber || "",
    vehicleNumber: v.vehicleNumber || v.registrationNo,
    capacity: v.capacity,
    status:
      v.status === "available" || v.status === "AVAILABLE"
        ? "available"
        : v.status === "IN_USE" || v.status === "in_transit"
          ? "in_transit"
          : v.status === "MAINTENANCE" || v.status === "maintenance"
            ? "maintenance"
            : "inactive",
    type: v.vehicleType || v.type,
    assignedDriver: v.currentDriver ?? undefined,
    availability: v.availability || "Available",
  };
}

function mapDriver(d: BackendDriver): DispatchDriver {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone || d.mobile || "",
    status:
      d.status === "available" || d.availability === "AVAILABLE"
        ? "available"
        : "on_trip",
    rating: d.rating != null ? Number(d.rating) : undefined,
    assignedVehicle: d.assignedVehicle ?? undefined,
    availability: d.availability || "Available",
  };
}

function mapQueueRecord(d: BackendLiveDispatch): DispatchRecord {
  return {
    id: d.id,
    dispatchNo: d.dispatchNo,
    orderNo: d.orderNo,
    orderId: d.orderId,
    status: (d.status as DispatchQueueStatus) || "pending",
    customer: d.customer,
    customerDetails: d.customerDetails ?? {
      name: d.customer,
      address: d.address || d.route || "",
    },
    schedule: d.schedule,
    scheduledTime: d.scheduledTime,
    vehicle: d.vehicle,
    driver: d.driver,
    route: d.route || d.address || "",
    eta: d.eta,
    priority: d.priority || "normal",
    remarks: d.remarks,
    items: d.items,
    timeline: d.timeline ?? [],
    documents: d.documents ?? [],
    dispatchDate: d.dispatchDate,
    paymentMethod: d.paymentMethod,
  };
}

export const dispatchService = {
  async getPendingOrders(): Promise<PendingDispatchOrder[]> {
    const res = await api.get<ApiResponse<BackendPendingOrder[]>>(
      "/hub/orders/pending-dispatch",
    );
    return unwrap(res.data.data).map(mapPending);
  },

  async getVehicles(): Promise<DispatchVehicle[]> {
    const res = await api.get<ApiResponse<BackendFleetVehicle[]>>(
      "/hub/fleet/available",
    );
    return unwrap(res.data.data).map(mapVehicle);
  },

  async getDrivers(): Promise<DispatchDriver[]> {
    const res = await api.get<ApiResponse<BackendDriver[]>>(
      "/hub/drivers/available",
    );
    return unwrap(res.data.data).map(mapDriver);
  },

  async getDeliverySlots(): Promise<BackendSlot[]> {
    const res = await api.get<ApiResponse<BackendSlot[]>>("/hub/dispatch/slots");
    return unwrap(res.data.data);
  },

  async getFleetStats(): Promise<FleetStats> {
    const res = await api.get<ApiResponse<BackendFleetStats>>(
      "/hub/dispatch/fleet-stats",
    );
    const raw = res.data.data;
    return {
      activeFleet: raw.activeFleet,
      avgHubExit: raw.avgHubExit,
      activeTransits: raw.activeTransits,
      pendingLoadTons: raw.pendingLoadTons,
    };
  },

  /** Build route options from live pending-order destinations. */
  async getRoutes(): Promise<DispatchRoute[]> {
    const pending = await this.getPendingOrders();
    const routes = new Map<string, DispatchRoute>();

    for (const order of pending) {
      const dest = (order.location || "Local Delivery").trim() || "Local Delivery";
      const key = dest.toLowerCase();
      if (!routes.has(key)) {
        routes.set(key, {
          id: `route-${routes.size + 1}`,
          name: dest,
          via: dest,
          estimatedMinutes: 45,
        });
      }
    }

    if (routes.size === 0) {
      return [
        {
          id: "route-local",
          name: "Local Delivery",
          via: "Local Delivery",
          estimatedMinutes: 30,
        },
      ];
    }

    return Array.from(routes.values());
  },

  async getQueue(
    tab?: string,
    search?: string,
    sortBy: DispatchSortField = "eta",
  ): Promise<DispatchRecord[]> {
    const res = await api.get<ApiResponse<BackendLiveDispatch[]>>(
      "/hub/dispatch/live",
      {
        params: {
          tab: tab && tab !== "all" ? tab : undefined,
          search: search || undefined,
          sortBy,
        },
      },
    );
    return unwrap(res.data.data).map(mapQueueRecord);
  },

  async getById(id: string): Promise<DispatchRecord | undefined> {
    try {
      const res = await api.get<ApiResponse<BackendLiveDispatch>>(
        `/hub/dispatch/${id}`,
      );
      return mapQueueRecord(res.data.data);
    } catch {
      return undefined;
    }
  },

  async initiateDispatch(
    payload: InitiateDispatchPayload,
  ): Promise<DispatchRecord> {
    const res = await api.post<ApiResponse<BackendLiveDispatch>>(
      "/hub/dispatch",
      {
        orderId: payload.orderId,
        vehicleId: payload.vehicle,
        driverId: payload.driver,
        deliverySlot: payload.deliverySlot,
        estimatedEta: payload.estimatedEta,
        remarks: payload.remarks,
      },
    );
    return mapQueueRecord(res.data.data);
  },

  async createDispatch(
    payload: CreateDispatchFormPayload,
  ): Promise<DispatchRecord> {
    // Resolve vehicle/driver registration/name → use IDs if already IDs
    const [vehicles, drivers] = await Promise.all([
      this.getVehicles(),
      this.getDrivers(),
    ]);
    const vehicle =
      vehicles.find(
        (v) =>
          v.id === payload.vehicle || v.registrationNo === payload.vehicle,
      ) ?? null;
    const driver =
      drivers.find(
        (d) => d.id === payload.driver || d.name === payload.driver,
      ) ?? null;

    if (!vehicle) throw new Error("Selected vehicle is not available");
    if (!driver) throw new Error("Selected driver is not available");

    return this.initiateDispatch({
      orderId: payload.orderId,
      vehicle: vehicle.id,
      driver: driver.id,
      deliverySlot: payload.dispatchTime,
      remarks: payload.remarks,
    });
  },

  async assignVehicle(dispatchId: string, vehicleId: string) {
    await api.patch(`/hub/dispatch/${dispatchId}`, { vehicleId });
    return this.getById(dispatchId);
  },

  async assignDriver(dispatchId: string, driverId: string) {
    await api.patch(`/hub/dispatch/${dispatchId}`, { driverId });
    return this.getById(dispatchId);
  },

  async updateDispatchStatus(
    dispatchId: string,
    status: DispatchQueueStatus,
  ): Promise<DispatchRecord | undefined> {
    if (status === "dispatch") {
      await api.patch(`/hub/dispatch/${dispatchId}/start`, {});
    } else if (status === "delivered") {
      await api.patch(`/hub/dispatch/${dispatchId}/completed`, {});
    } else if (status === "loading") {
      await api.patch(`/hub/dispatch/${dispatchId}/start`, {
        remarks: "Loading",
      });
    }
    return this.getById(dispatchId);
  },

  async completeDelivery(
    dispatchId: string,
  ): Promise<{ record: DispatchRecord; orderValue: number }> {
    await api.patch(`/hub/dispatch/${dispatchId}/completed`, {});
    const record = await this.getById(dispatchId);
    if (!record) throw new Error("Dispatch not found");

    let orderValue = 0;
    if (record.orderId) {
      try {
        const { data } = await api.get<
          ApiResponse<{ grandTotal?: number | string; orderValue?: number }>
        >(`/hub/orders/${record.orderId}`);
        const raw = data.data?.grandTotal ?? data.data?.orderValue ?? 0;
        orderValue = typeof raw === "string" ? Number(raw) || 0 : Number(raw) || 0;
      } catch {
        orderValue = 0;
      }
    }

    return { record, orderValue };
  },
};
