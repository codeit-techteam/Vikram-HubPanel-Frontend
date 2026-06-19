import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  DispatchVehicle,
  VehicleEditPayload,
  VehicleFormPayload,
} from "@/types";
import { fleetService } from "@/services/fleet.service";

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

interface FleetState {
  vehicles: DispatchVehicle[];
  loading: boolean;
  submitting: boolean;
  search: string;
  statusFilter: string;
  isModalOpen: boolean;
  editingVehicle: DispatchVehicle | null;
  loadFleet: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  getFilteredVehicles: () => DispatchVehicle[];
  getAvailableVehicles: () => DispatchVehicle[];
  openAddModal: () => void;
  openEditModal: (vehicle: DispatchVehicle) => void;
  closeModal: () => void;
  addVehicle: (payload: VehicleFormPayload) => Promise<void>;
  updateVehicle: (id: string, payload: VehicleEditPayload) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  assignDriver: (vehicleId: string, driverId: string) => Promise<void>;
  exportFleet: () => Promise<void>;
  importVehicles: () => void;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [],
  loading: false,
  submitting: false,
  search: "",
  statusFilter: "all",
  isModalOpen: false,
  editingVehicle: null,

  loadFleet: async () => {
    set({ loading: true });
    const vehicles = await fleetService.getVehicles();
    set({ vehicles, loading: false });
  },

  setSearch: (search) => set({ search }),

  setStatusFilter: (statusFilter) => set({ statusFilter }),

  getFilteredVehicles: () => {
    const { vehicles, search, statusFilter } = get();
    return vehicles.filter((v) => {
      const vehicleNo = v.vehicleNumber ?? v.registrationNo;
      const matchesSearch =
        !search ||
        vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
        (v.assignedDriver ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (v.type ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  },

  getAvailableVehicles: () =>
    get().vehicles.filter((v) => v.status === "available"),

  openAddModal: () => set({ isModalOpen: true, editingVehicle: null }),

  openEditModal: (vehicle) =>
    set({ isModalOpen: true, editingVehicle: vehicle }),

  closeModal: () => set({ isModalOpen: false, editingVehicle: null }),

  addVehicle: async (payload) => {
    set({ submitting: true });
    try {
      const vehicle = await fleetService.addVehicle(payload);
      set((state) => ({
        vehicles: [...state.vehicles, vehicle],
        isModalOpen: false,
        editingVehicle: null,
        submitting: false,
      }));
      toast.success(`Vehicle ${vehicle.registrationNo} added successfully`);
    } catch (err) {
      set({ submitting: false });
      toast.error(err instanceof Error ? err.message : "Failed to add vehicle");
    }
  },

  updateVehicle: async (id, payload) => {
    set({ submitting: true });
    try {
      const updated = await fleetService.updateVehicle(id, payload);
      if (updated) {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === updated.id ? updated : v
          ),
          isModalOpen: false,
          editingVehicle: null,
          submitting: false,
        }));
        toast.success("Vehicle updated successfully");
      }
    } catch (err) {
      set({ submitting: false });
      toast.error(
        err instanceof Error ? err.message : "Failed to update vehicle"
      );
    }
  },

  deleteVehicle: async (id) => {
    try {
      await fleetService.deleteVehicle(id);
      set((state) => ({
        vehicles: state.vehicles.filter((v) => v.id !== id),
      }));
      toast.success("Vehicle deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete vehicle"
      );
    }
  },

  assignDriver: async (vehicleId, driverId) => {
    try {
      const updated = await fleetService.assignDriver(vehicleId, driverId);
      if (updated) {
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === updated.id ? updated : v
          ),
        }));
        toast.success("Driver assigned to vehicle");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign driver"
      );
    }
  },

  exportFleet: async () => {
    try {
      const csv = await fleetService.exportFleet();
      downloadCsv(csv, `fleet-export-${Date.now()}.csv`);
      toast.success("Fleet exported to CSV");
    } catch {
      toast.error("Failed to export fleet");
    }
  },

  importVehicles: () => {
    toast.success("Vehicle import queued (mock). 3 vehicles would be imported.");
  },
}));
