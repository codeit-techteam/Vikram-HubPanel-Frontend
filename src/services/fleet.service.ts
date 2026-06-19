import type {
  DispatchVehicle,
  VehicleEditPayload,
  VehicleFormPayload,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

const STATUS_AVAILABILITY: Record<DispatchVehicle["status"], string> = {
  available: "Available",
  assigned: "Assigned",
  in_transit: "In Transit",
  maintenance: "Maintenance",
  inactive: "Inactive",
};

function normalizeVehicle(v: DispatchVehicle): DispatchVehicle {
  return {
    ...v,
    vehicleNumber: v.vehicleNumber ?? v.registrationNo,
    registrationNo: v.registrationNo ?? v.vehicleNumber ?? "",
  };
}

function generateVehicleId(): string {
  return `veh-${Date.now().toString().slice(-6)}`;
}

export const fleetService = {
  async getVehicles(): Promise<DispatchVehicle[]> {
    await delay(200);
    return erpDatabase.getVehicles().map(normalizeVehicle);
  },

  async getVehicleById(id: string): Promise<DispatchVehicle | undefined> {
    await delay(150);
    const vehicle = erpDatabase
      .getVehicles()
      .find((v) => v.id === id || v.registrationNo === id);
    return vehicle ? normalizeVehicle(vehicle) : undefined;
  },

  async addVehicle(payload: VehicleFormPayload): Promise<DispatchVehicle> {
    await delay(350);
    const registrationNo =
      payload.registrationNumber?.trim() || payload.vehicleNumber.trim();
    const existing = erpDatabase.getVehicleByRegistration(registrationNo);
    if (existing) throw new Error("Vehicle with this number already exists");

    const vehicle: DispatchVehicle = {
      id: generateVehicleId(),
      registrationNo,
      vehicleNumber: payload.vehicleNumber.trim(),
      type: payload.type,
      capacity: payload.capacity,
      fuelType: payload.fuelType,
      rcNumber: payload.rcNumber,
      insuranceNumber: payload.insuranceNumber,
      insuranceExpiry: payload.insuranceExpiry,
      rcExpiry: payload.fitnessExpiry,
      fitnessExpiry: payload.fitnessExpiry,
      assignedHub: payload.assignedHub,
      gpsEnabled: payload.gpsEnabled ?? false,
      remarks: payload.remarks,
      documents: payload.documents,
      status: "available",
      availability: "Available",
      maintenanceStatus: "Good",
      tripsToday: 0,
      assignedDriver: "—",
      currentTrip: null,
      maintenanceHistory: [],
    };

    return erpDatabase.addVehicle(vehicle)!;
  },

  async updateVehicle(
    id: string,
    updates: VehicleEditPayload
  ): Promise<DispatchVehicle | undefined> {
    await delay(300);
    const patch: Partial<DispatchVehicle> = { ...updates };
    if (updates.status) {
      patch.availability = STATUS_AVAILABILITY[updates.status];
    }
    return erpDatabase.updateVehicle(id, patch);
  },

  async deleteVehicle(id: string): Promise<boolean> {
    await delay(250);
    const vehicle = erpDatabase
      .getVehicles()
      .find((v) => v.id === id || v.registrationNo === id);
    if (!vehicle) throw new Error("Vehicle not found");
    if (vehicle.status === "in_transit" || vehicle.status === "assigned") {
      throw new Error("Cannot delete vehicle that is currently assigned");
    }
    return erpDatabase.deleteVehicle(id);
  },

  async assignDriver(
    vehicleId: string,
    driverId: string
  ): Promise<DispatchVehicle | undefined> {
    await delay(300);
    const driver = erpDatabase
      .getDrivers()
      .find((d) => d.id === driverId || d.name === driverId);
    if (!driver) throw new Error("Driver not found");

    const vehicle = erpDatabase.updateVehicle(vehicleId, {
      driverId: driver.id,
      assignedDriver: driver.name,
    });

    if (vehicle) {
      erpDatabase.updateDriver(driver.id, {
        assignedVehicle: vehicle.registrationNo,
      });
    }

    return vehicle;
  },

  async updateVehicleStatus(
    id: string,
    status: DispatchVehicle["status"]
  ): Promise<DispatchVehicle | undefined> {
    await delay(250);
    return erpDatabase.updateVehicle(id, {
      status,
      availability: STATUS_AVAILABILITY[status],
    });
  },

  async exportFleet(): Promise<string> {
    await delay(300);
    const vehicles = erpDatabase.getVehicles();
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
