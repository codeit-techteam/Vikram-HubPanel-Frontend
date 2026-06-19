import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  DispatchDriver,
  DriverEditPayload,
  DriverFormPayload,
} from "@/types";
import { driverService } from "@/services/driver.service";

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface DriverState {
  drivers: DispatchDriver[];
  loading: boolean;
  submitting: boolean;
  search: string;
  statusFilter: string;
  isModalOpen: boolean;
  editingDriver: DispatchDriver | null;
  loadDrivers: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  getFilteredDrivers: () => DispatchDriver[];
  getAvailableDrivers: () => DispatchDriver[];
  openAddModal: () => void;
  openEditModal: (driver: DispatchDriver) => void;
  closeModal: () => void;
  addDriver: (payload: DriverFormPayload) => Promise<void>;
  updateDriver: (id: string, payload: DriverEditPayload) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
  assignVehicle: (driverId: string, vehicleRegistration: string) => Promise<void>;
  exportDrivers: () => Promise<void>;
  importDrivers: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  drivers: [],
  loading: false,
  submitting: false,
  search: "",
  statusFilter: "all",
  isModalOpen: false,
  editingDriver: null,

  loadDrivers: async () => {
    set({ loading: true });
    const drivers = await driverService.getDrivers();
    set({ drivers, loading: false });
  },

  setSearch: (search) => set({ search }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  getFilteredDrivers: () => {
    const { drivers, search, statusFilter } = get();
    return drivers.filter((d) => {
      const mobile = d.mobile ?? d.phone ?? "";
      const license = d.licenseNumber ?? d.licenseNo ?? "";
      const matchesSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        license.toLowerCase().includes(search.toLowerCase()) ||
        mobile.includes(search) ||
        (d.assignedVehicle ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  },

  getAvailableDrivers: () =>
    get().drivers.filter((d) => d.status === "available"),

  openAddModal: () => set({ isModalOpen: true, editingDriver: null }),

  openEditModal: (driver) =>
    set({ isModalOpen: true, editingDriver: driver }),

  closeModal: () => set({ isModalOpen: false, editingDriver: null }),

  addDriver: async (payload) => {
    set({ submitting: true });
    try {
      const driver = await driverService.addDriver(payload);
      set((state) => ({
        drivers: [...state.drivers, driver],
        isModalOpen: false,
        editingDriver: null,
        submitting: false,
      }));
      toast.success(`Driver ${driver.name} added successfully`);
    } catch (err) {
      set({ submitting: false });
      toast.error(err instanceof Error ? err.message : "Failed to add driver");
    }
  },

  updateDriver: async (id, payload) => {
    set({ submitting: true });
    try {
      const updated = await driverService.updateDriver(id, payload);
      if (updated) {
        set((state) => ({
          drivers: state.drivers.map((d) =>
            d.id === updated.id ? updated : d
          ),
          isModalOpen: false,
          editingDriver: null,
          submitting: false,
        }));
        toast.success("Driver updated successfully");
      }
    } catch (err) {
      set({ submitting: false });
      toast.error(
        err instanceof Error ? err.message : "Failed to update driver"
      );
    }
  },

  deleteDriver: async (id) => {
    try {
      await driverService.deleteDriver(id);
      set((state) => ({
        drivers: state.drivers.filter((d) => d.id !== id),
      }));
      toast.success("Driver deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete driver"
      );
    }
  },

  assignVehicle: async (driverId, vehicleRegistration) => {
    try {
      const updated = await driverService.assignVehicle(
        driverId,
        vehicleRegistration
      );
      if (updated) {
        set((state) => ({
          drivers: state.drivers.map((d) =>
            d.id === updated.id ? updated : d
          ),
        }));
        toast.success("Vehicle assigned to driver");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign vehicle"
      );
    }
  },

  exportDrivers: async () => {
    try {
      const csv = await driverService.exportDrivers();
      downloadCsv(csv, `drivers-export-${Date.now()}.csv`);
      toast.success("Drivers exported to CSV");
    } catch {
      toast.error("Failed to export drivers");
    }
  },

  importDrivers: () => {
    toast.success("Driver import queued (mock). 5 drivers would be imported.");
  },
}));
