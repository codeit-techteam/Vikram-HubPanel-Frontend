import type {
  DispatchDriver,
  DriverEditPayload,
  DriverFormPayload,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

interface BackendDriver {
  id: string;
  name: string;
  phone: string;
  employeeId?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  availability?: string;
  operationalStatus?: string;
  isActive: boolean;
  rating?: number | null;
  tripsToday?: number;
  tripsCompleted?: number;
  vehicle?: { id: string; registration: string } | null;
  currentTrip?: {
    orderId: string;
    orderNumber: string;
    status: string;
  } | null;
  hub?: { id: string; name: string } | null;
  createdAt?: string;
}

function mapOperationalStatus(
  status?: string,
): DispatchDriver["status"] {
  switch (status) {
    case "ON_TRIP":
    case "ON_DELIVERY":
      return "on_trip";
    case "ASSIGNED":
      return "assigned";
    case "ON_LEAVE":
    case "OFF_DUTY":
      return "on_leave";
    case "INACTIVE":
    case "SUSPENDED":
    case "BLOCKED":
      return "inactive";
    default:
      return "available";
  }
}

function statusLabel(status: DispatchDriver["status"]): string {
  switch (status) {
    case "on_trip":
      return "On Trip";
    case "assigned":
      return "Assigned";
    case "on_leave":
      return "On Leave";
    case "inactive":
      return "Inactive";
    default:
      return "Available";
  }
}

function mapDriver(d: BackendDriver): DispatchDriver {
  const status = mapOperationalStatus(d.operationalStatus ?? d.availability);
  const hubName =
    d.hub?.name ||
    useAuthStore.getState().manager?.hubName ||
    "Assigned Hub";

  return {
    id: d.id,
    name: d.name,
    mobile: d.phone,
    phone: d.phone,
    licenseNumber: d.licenseNumber || "—",
    licenseNo: d.licenseNumber || "—",
    licenseExpiry: d.licenseExpiry?.slice(0, 10),
    status,
    availability: statusLabel(status),
    assignedVehicle: d.vehicle?.registration || "—",
    assignedHub: hubName,
    currentTrip: d.currentTrip?.orderNumber ?? null,
    completedTrips: d.tripsCompleted ?? 0,
    totalDistance: 0,
    deliverySuccessRate: 100,
    performanceScore: 80,
    // Only show rating when backend has a real value — never invent 4.5
    rating: d.rating != null ? Number(d.rating) : undefined,
    employeeId: d.employeeId ?? undefined,
  };
}

function unwrapList(
  data: ApiResponse<{ data: BackendDriver[] } | BackendDriver[]>,
): BackendDriver[] {
  const payload = data.data;
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? [];
}

export const driverService = {
  async getDrivers(): Promise<DispatchDriver[]> {
    const { data } = await api.get<
      ApiResponse<{ data: BackendDriver[] } | BackendDriver[]>
    >("/hub/drivers", { params: { page: 1, limit: 100 } });
    return unwrapList(data).map(mapDriver);
  },

  async getDriverById(id: string): Promise<DispatchDriver | undefined> {
    try {
      const { data } = await api.get<ApiResponse<BackendDriver>>(
        `/hub/drivers/${id}`,
      );
      return mapDriver(data.data);
    } catch {
      return undefined;
    }
  },

  async addDriver(payload: DriverFormPayload): Promise<DispatchDriver> {
    const { data } = await api.post<ApiResponse<BackendDriver>>("/hub/drivers", {
      name: payload.name.trim(),
      phone: payload.mobile.trim(),
      licenseNumber: payload.licenseNumber?.trim() || undefined,
      licenseExpiry: payload.licenseExpiry || undefined,
      alternatePhone: payload.alternateMobile?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      bloodGroup: payload.bloodGroup || undefined,
      joiningDate: payload.joiningDate || undefined,
      address: payload.address?.trim() || undefined,
      emergencyContactName: payload.emergencyContactName?.trim() || undefined,
      emergencyContactNumber: payload.emergencyContactNumber?.trim() || undefined,
    });
    return mapDriver(data.data);
  },

  async updateDriver(
    id: string,
    payload: DriverEditPayload,
  ): Promise<DispatchDriver> {
    const { data } = await api.patch<ApiResponse<BackendDriver>>(
      `/hub/drivers/${id}`,
      {
        name: payload.name?.trim(),
        phone: payload.mobile?.trim(),
        licenseNumber: payload.licenseNumber?.trim() || undefined,
        licenseExpiry: payload.licenseExpiry || undefined,
        availability:
          payload.status === "on_leave"
            ? "ON_LEAVE"
            : payload.status === "inactive"
              ? "INACTIVE"
              : undefined,
        isActive: payload.status === "inactive" ? false : undefined,
      },
    );
    return mapDriver(data.data);
  },

  async deactivateDriver(id: string): Promise<void> {
    await api.delete(`/hub/drivers/${id}`);
  },

  async deleteDriver(id: string): Promise<boolean> {
    await this.deactivateDriver(id);
    return true;
  },

  async assignVehicle(
    driverId: string,
    vehicleId: string,
  ): Promise<DispatchDriver | undefined> {
    const { data } = await api.patch<ApiResponse<BackendDriver>>(
      `/hub/drivers/${driverId}`,
      { vehicleId },
    );
    return mapDriver(data.data);
  },

  async exportDrivers(): Promise<string> {
    const drivers = await this.getDrivers();
    const header = "id,name,phone,status,vehicle,license\n";
    const rows = drivers
      .map(
        (d) =>
          `${d.id},${d.name},${d.phone ?? d.mobile},${d.status},${d.assignedVehicle},${d.licenseNumber}`,
      )
      .join("\n");
    return header + rows;
  },
};
