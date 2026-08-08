import type {
  DispatchVehicle,
  VehicleEditPayload,
  VehicleFormPayload,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";

interface ApiVehicle {
  id: string;
  registration: string;
  capacity: number;
  vehicleType?: string;
  vehicleCategory?: string | null;
  fuelType?: string | null;
  status: string;
  insuranceNumber?: string | null;
  insuranceExpiry?: string | null;
  fitnessExpiry?: string | null;
  pucExpiry?: string | null;
  permitType?: string | null;
  permitExpiry?: string | null;
  remarks?: string | null;
  hub?: { name?: string } | null;
  driver?: { id: string; name: string } | null;
}

function mapStatus(
  status: string,
): DispatchVehicle["status"] {
  switch (status) {
    case "AVAILABLE":
      return "available";
    case "ASSIGNED":
    case "LOADING":
      return "assigned";
    case "OUT_FOR_DELIVERY":
    case "REACHED":
    case "RETURNING":
      return "in_transit";
    case "MAINTENANCE":
      return "maintenance";
    default:
      return "inactive";
  }
}

function mapUiStatusToApi(status: DispatchVehicle["status"]): string {
  switch (status) {
    case "available":
      return "AVAILABLE";
    case "assigned":
      return "ASSIGNED";
    case "in_transit":
      return "OUT_FOR_DELIVERY";
    case "maintenance":
      return "MAINTENANCE";
    case "inactive":
      return "INACTIVE";
    default:
      return "AVAILABLE";
  }
}

function mapVehicleType(type?: string): string {
  const t = (type ?? "").toLowerCase();
  if (t.includes("tempo")) return "TEMPO";
  if (t.includes("bike") || t.includes("light")) return "BIKE";
  return "TRUCK";
}

function parseCapacityTons(capacity: string): number {
  const m = capacity.match(/([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

function dateOnly(v?: string | null): string | undefined {
  if (!v) return undefined;
  return v.slice(0, 10);
}

function normalizeVehicle(v: ApiVehicle): DispatchVehicle {
  const capacity = Number(v.capacity ?? 0);
  return {
    id: v.id,
    registrationNo: v.registration,
    vehicleNumber: v.registration,
    capacity: capacity > 0 ? `${capacity}T` : "0T",
    status: mapStatus(v.status),
    type: v.vehicleCategory || v.vehicleType || "Truck",
    fuelType: v.fuelType ?? undefined,
    insuranceNumber: v.insuranceNumber ?? undefined,
    insuranceExpiry: dateOnly(v.insuranceExpiry),
    fitnessExpiry: dateOnly(v.fitnessExpiry),
    rcExpiry: dateOnly(v.fitnessExpiry),
    assignedHub: v.hub?.name,
    remarks: v.remarks ?? undefined,
    driverId: v.driver?.id,
    assignedDriver: v.driver?.name ?? "—",
    availability:
      v.status === "AVAILABLE"
        ? "Available"
        : v.status === "MAINTENANCE"
          ? "Maintenance"
          : "Busy",
    tripsToday: 0,
    currentTrip: null,
    maintenanceHistory: [],
  };
}

function unwrapList(payload: unknown): ApiVehicle[] {
  if (Array.isArray(payload)) return payload as ApiVehicle[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as ApiVehicle[];
    if (inner && typeof inner === "object" && "data" in (inner as object)) {
      const nested = (inner as { data: unknown }).data;
      if (Array.isArray(nested)) return nested as ApiVehicle[];
    }
  }
  return [];
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const msg = (err as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (msg) return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export const fleetService = {
  async getVehicles(): Promise<DispatchVehicle[]> {
    const { data } = await api.get<ApiResponse<unknown>>("/hub/vehicles", {
      params: { page: 1, limit: 100 },
    });
    return unwrapList(data.data).map(normalizeVehicle);
  },

  async getVehicleById(id: string): Promise<DispatchVehicle | undefined> {
    try {
      const { data } = await api.get<ApiResponse<ApiVehicle>>(
        `/hub/vehicles/${id}`,
      );
      return normalizeVehicle(data.data);
    } catch {
      return undefined;
    }
  },

  async addVehicle(payload: VehicleFormPayload): Promise<DispatchVehicle> {
    const registrationNo =
      payload.registrationNumber?.trim() || payload.vehicleNumber.trim();
    try {
      const { data } = await api.post<ApiResponse<ApiVehicle>>(
        "/hub/vehicles",
        {
          registration: registrationNo.toUpperCase(),
          capacity: parseCapacityTons(payload.capacity),
          vehicleType: mapVehicleType(payload.type),
          vehicleCategory: payload.type,
          fuelType: payload.fuelType,
          insuranceNumber: payload.insuranceNumber,
          insuranceExpiry: payload.insuranceExpiry || undefined,
          fitnessExpiry: payload.fitnessExpiry || undefined,
          pucExpiry: payload.pucExpiry || undefined,
          remarks: payload.remarks,
        },
      );
      return normalizeVehicle(data.data);
    } catch (err) {
      throw new Error(getErrorMessage(err, "Failed to add vehicle"));
    }
  },

  async updateVehicle(
    id: string,
    updates: VehicleEditPayload,
  ): Promise<DispatchVehicle | undefined> {
    try {
      const { data } = await api.patch<ApiResponse<ApiVehicle>>(
        `/hub/vehicles/${id}`,
        {
          ...(updates.capacity
            ? { capacity: parseCapacityTons(updates.capacity) }
            : {}),
          ...(updates.status
            ? { status: mapUiStatusToApi(updates.status) }
            : {}),
          ...(updates.assignedDriverId !== undefined
            ? { assignedDriverId: updates.assignedDriverId || null }
            : {}),
          ...(updates.remarks !== undefined
            ? { remarks: updates.remarks }
            : {}),
          ...(updates.insuranceExpiry
            ? { insuranceExpiry: updates.insuranceExpiry }
            : {}),
          ...(updates.fitnessExpiry
            ? { fitnessExpiry: updates.fitnessExpiry }
            : {}),
        },
      );
      return normalizeVehicle(data.data);
    } catch (err) {
      throw new Error(getErrorMessage(err, "Failed to update vehicle"));
    }
  },

  async deleteVehicle(id: string): Promise<boolean> {
    try {
      await api.delete(`/hub/vehicles/${id}`);
      return true;
    } catch (err) {
      throw new Error(getErrorMessage(err, "Failed to delete vehicle"));
    }
  },

  async assignDriver(
    vehicleId: string,
    driverId: string,
  ): Promise<DispatchVehicle | undefined> {
    return this.updateVehicle(vehicleId, { assignedDriverId: driverId });
  },

  async updateVehicleStatus(
    id: string,
    status: DispatchVehicle["status"],
  ): Promise<DispatchVehicle | undefined> {
    return this.updateVehicle(id, { status });
  },

  async exportFleet(): Promise<string> {
    const vehicles = await this.getVehicles();
    const headers = [
      "Vehicle Number",
      "Type",
      "Capacity",
      "Assigned Driver",
      "Status",
      "Availability",
      "RC Expiry",
      "Insurance Expiry",
    ];
    const rows = vehicles.map((v) => [
      v.registrationNo,
      v.type ?? "",
      v.capacity,
      v.assignedDriver ?? "",
      v.status,
      v.availability ?? "",
      v.rcExpiry ?? "",
      v.insuranceExpiry ?? "",
    ]);
    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  },
};
