import type {
  DispatchDriver,
  DriverEditPayload,
  DriverFormPayload,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

const STATUS_AVAILABILITY: Record<DispatchDriver["status"], string> = {
  available: "Available",
  assigned: "Assigned",
  on_trip: "On Trip",
  on_leave: "On Leave",
  inactive: "Inactive",
};

function normalizeDriver(d: DispatchDriver): DispatchDriver {
  return {
    ...d,
    mobile: d.mobile ?? d.phone,
    phone: d.phone ?? d.mobile,
    licenseNumber: d.licenseNumber ?? d.licenseNo,
    licenseNo: d.licenseNo ?? d.licenseNumber,
  };
}

function generateDriverId(): string {
  return `drv-${Date.now().toString().slice(-6)}`;
}

export const driverService = {
  async getDrivers(): Promise<DispatchDriver[]> {
    await delay(200);
    return erpDatabase.getDrivers().map(normalizeDriver);
  },

  async getDriverById(id: string): Promise<DispatchDriver | undefined> {
    await delay(150);
    const driver = erpDatabase
      .getDrivers()
      .find((d) => d.id === id || d.name === id);
    return driver ? normalizeDriver(driver) : undefined;
  },

  async addDriver(payload: DriverFormPayload): Promise<DispatchDriver> {
    await delay(350);
    const existing = erpDatabase
      .getDrivers()
      .find((d) => d.licenseNumber === payload.licenseNumber || d.licenseNo === payload.licenseNumber);
    if (existing) throw new Error("Driver with this license already exists");

    const driver: DispatchDriver = {
      id: generateDriverId(),
      name: payload.name.trim(),
      mobile: payload.mobile.trim(),
      phone: payload.mobile.trim(),
      alternateMobile: payload.alternateMobile,
      email: payload.email,
      licenseNumber: payload.licenseNumber.trim(),
      licenseNo: payload.licenseNumber.trim(),
      licenseExpiry: payload.licenseExpiry,
      address: payload.address,
      emergencyContactName: payload.emergencyContactName,
      emergencyContactNumber: payload.emergencyContactNumber,
      bloodGroup: payload.bloodGroup,
      joiningDate: payload.joiningDate,
      assignedHub: payload.assignedHub,
      rating: payload.rating ?? 4.0,
      status: "available",
      availability: "Available",
      assignedVehicle: "—",
      currentTrip: null,
      completedTrips: 0,
      totalDistance: 0,
      deliverySuccessRate: 100,
      performanceScore: 80,
      documents: payload.documents,
    };

    return erpDatabase.addDriver(driver)!;
  },

  async updateDriver(
    id: string,
    updates: DriverEditPayload
  ): Promise<DispatchDriver | undefined> {
    await delay(300);
    const patch: Partial<DispatchDriver> = { ...updates };
    if (updates.mobile) {
      patch.phone = updates.mobile;
    }
    if (updates.licenseNumber) {
      patch.licenseNo = updates.licenseNumber;
    }
    if (updates.status) {
      patch.availability = STATUS_AVAILABILITY[updates.status];
    }
    return erpDatabase.updateDriver(id, patch);
  },

  async deleteDriver(id: string): Promise<boolean> {
    await delay(250);
    const driver = erpDatabase
      .getDrivers()
      .find((d) => d.id === id || d.name === id);
    if (!driver) throw new Error("Driver not found");
    if (driver.status === "on_trip" || driver.status === "assigned") {
      throw new Error("Cannot delete driver that is currently on a trip");
    }
    return erpDatabase.deleteDriver(id);
  },

  async assignVehicle(
    driverId: string,
    vehicleRegistration: string
  ): Promise<DispatchDriver | undefined> {
    await delay(300);
    const vehicle = erpDatabase.getVehicleByRegistration(vehicleRegistration);
    if (!vehicle) throw new Error("Vehicle not found");

    const driver = erpDatabase.updateDriver(driverId, {
      assignedVehicle: vehicle.registrationNo,
    });

    if (driver) {
      erpDatabase.updateVehicle(vehicle.id, {
        driverId: driver.id,
        assignedDriver: driver.name,
      });
    }

    return driver;
  },

  async updateDriverStatus(
    id: string,
    status: DispatchDriver["status"]
  ): Promise<DispatchDriver | undefined> {
    await delay(250);
    return erpDatabase.updateDriver(id, {
      status,
      availability: STATUS_AVAILABILITY[status],
    });
  },

  async exportDrivers(): Promise<string> {
    await delay(300);
    const drivers = erpDatabase.getDrivers();
    const headers = [
      "Driver Name",
      "Mobile",
      "License Number",
      "Vehicle Assigned",
      "Status",
      "Current Trip",
      "Rating",
    ];
    const rows = drivers.map((d) => [
      d.name,
      d.mobile ?? d.phone ?? "",
      d.licenseNumber ?? d.licenseNo ?? "",
      d.assignedVehicle ?? "",
      d.status,
      d.currentTrip ?? "",
      String(d.rating),
    ]);
    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  },
};
