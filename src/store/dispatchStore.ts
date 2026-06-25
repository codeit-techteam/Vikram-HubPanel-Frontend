import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  CreateDispatchFormPayload,
  DispatchDriver,
  DispatchQueueTab,
  DispatchRecord,
  DispatchRoute,
  DispatchSortField,
  DispatchVehicle,
  FleetStats,
  InitiateDispatchPayload,
  PendingDispatchOrder,
} from "@/types";
import { dispatchService } from "@/services/dispatch.service";
import { useInventoryStore } from "./inventoryStore";
import { useDashboardStore } from "./dashboardStore";
import { useFleetStore } from "./fleetStore";
import { useDriverStore } from "./driverStore";

interface DispatchFilters {
  search: string;
  queueSearch: string;
  tab: DispatchQueueTab;
  sortBy: DispatchSortField;
}

interface DispatchState {
  dispatches: DispatchRecord[];
  activeDispatches: DispatchRecord[];
  queue: DispatchRecord[];
  filteredQueue: DispatchRecord[];
  selectedDispatch: DispatchRecord | null;
  fleet: FleetStats | null;
  pendingOrders: PendingDispatchOrder[];
  vehicles: DispatchVehicle[];
  drivers: DispatchDriver[];
  routes: DispatchRoute[];
  filters: DispatchFilters;
  loading: boolean;
  isDetailsOpen: boolean;
  isCreateOpen: boolean;
  isSubmitting: boolean;
  globalSearch: string;

  setGlobalSearch: (search: string) => void;
  setQueueSearch: (search: string) => void;
  setTab: (tab: DispatchQueueTab) => void;
  setSortBy: (sortBy: DispatchSortField) => void;
  openDetails: (dispatch: DispatchRecord) => void;
  closeDetails: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  loadDispatchData: () => Promise<void>;
  refreshQueue: () => Promise<void>;
  createDispatch: (payload: CreateDispatchFormPayload) => Promise<void>;
  initiateDispatch: (payload: InitiateDispatchPayload) => Promise<DispatchRecord | undefined>;
  assignDriver: (dispatchId: string, driver: string) => Promise<void>;
  assignVehicle: (dispatchId: string, vehicle: string) => Promise<void>;
  updateStatus: (
    dispatchId: string,
    status: DispatchRecord["status"]
  ) => Promise<void>;
  completeDispatch: (dispatchId: string) => Promise<void>;
}

const defaultFilters: DispatchFilters = {
  search: "",
  queueSearch: "",
  tab: "pending",
  sortBy: "eta",
};

function filterByGlobalSearch(
  items: DispatchRecord[],
  search: string,
  pendingOrders: PendingDispatchOrder[],
  vehicles: DispatchVehicle[],
  drivers: DispatchDriver[]
): DispatchRecord[] {
  if (!search) return items;
  const q = search.toLowerCase();
  const matchingOrders = pendingOrders
    .filter(
      (o) =>
        o.orderNo.toLowerCase().includes(q) ||
        o.label.toLowerCase().includes(q)
    )
    .map((o) => o.orderNo);
  const matchingVehicles = vehicles
    .filter((v) => v.registrationNo.toLowerCase().includes(q))
    .map((v) => v.registrationNo);
  const matchingDrivers = drivers
    .filter((d) => d.name.toLowerCase().includes(q))
    .map((d) => d.name);

  return items.filter(
    (d) =>
      d.orderNo.toLowerCase().includes(q) ||
      d.customer.toLowerCase().includes(q) ||
      d.vehicle.toLowerCase().includes(q) ||
      d.driver.toLowerCase().includes(q) ||
      matchingOrders.includes(d.orderNo) ||
      matchingVehicles.includes(d.vehicle) ||
      matchingDrivers.includes(d.driver)
  );
}

export const useDispatchStore = create<DispatchState>((set, get) => ({
  dispatches: [],
  activeDispatches: [],
  queue: [],
  filteredQueue: [],
  selectedDispatch: null,
  fleet: null,
  pendingOrders: [],
  vehicles: [],
  drivers: [],
  routes: [],
  filters: defaultFilters,
  loading: false,
  isDetailsOpen: false,
  isCreateOpen: false,
  isSubmitting: false,
  globalSearch: "",

  setGlobalSearch: (globalSearch) => {
    set({ globalSearch });
    get().refreshQueue();
  },

  setQueueSearch: (queueSearch) => {
    set((state) => ({
      filters: { ...state.filters, queueSearch },
    }));
    get().refreshQueue();
  },

  setTab: (tab) => {
    set((state) => ({
      filters: { ...state.filters, tab },
    }));
    get().refreshQueue();
  },

  setSortBy: (sortBy) => {
    set((state) => ({
      filters: { ...state.filters, sortBy },
    }));
    get().refreshQueue();
  },

  openDetails: (dispatch) =>
    set({ selectedDispatch: dispatch, isDetailsOpen: true }),

  closeDetails: () => set({ isDetailsOpen: false }),

  openCreateModal: () => set({ isCreateOpen: true }),

  closeCreateModal: () => set({ isCreateOpen: false }),

  loadDispatchData: async () => {
    set({ loading: true });
    const [queue, pendingOrders, vehicles, drivers, routes, fleet] =
      await Promise.all([
        dispatchService.getQueue(),
        dispatchService.getPendingOrders(),
        dispatchService.getVehicles(),
        dispatchService.getDrivers(),
        dispatchService.getRoutes(),
        dispatchService.getFleetStats(),
      ]);

    const activeDispatches = queue.filter(
      (d) => d.status !== "delivered"
    );

    set({
      queue,
      dispatches: queue,
      activeDispatches,
      filteredQueue: queue,
      pendingOrders,
      vehicles,
      drivers,
      routes,
      fleet,
      loading: false,
    });

    await get().refreshQueue();
  },

  refreshQueue: async () => {
    const state = get();
    let queue = await dispatchService.getQueue(
      state.filters.tab,
      state.filters.queueSearch,
      state.filters.sortBy
    );

    if (state.globalSearch) {
      queue = filterByGlobalSearch(
        queue,
        state.globalSearch,
        state.pendingOrders,
        state.vehicles,
        state.drivers
      );
    }

    set({ filteredQueue: queue });
  },

  createDispatch: async (payload) => {
    set({ isSubmitting: true });
    try {
      const record = await dispatchService.createDispatch(payload);

      await useInventoryStore.getState().loadInventory();

      useDashboardStore.getState().addActivityLog({
        title: `Dispatch Created — ${record.dispatchNo}`,
        subtitle: `Order ${payload.orderNo} assigned to ${payload.vehicle}`,
        type: "dispatch",
      });

      useDashboardStore.getState().updateDispatchKpis("created");

      const pendingOrders = await dispatchService.getPendingOrders();
      const fleet = await dispatchService.getFleetStats();
      const vehicles = await dispatchService.getVehicles();
      const drivers = await dispatchService.getDrivers();

      set({
        pendingOrders,
        fleet,
        vehicles,
        drivers,
        isCreateOpen: false,
        isSubmitting: false,
      });

      await get().loadDispatchData();
      useFleetStore.getState().loadFleet();
      useDriverStore.getState().loadDrivers();
      toast.success(
        `Dispatch ${record.dispatchNo} created. Order moved to live queue.`
      );
    } catch (err) {
      set({ isSubmitting: false });
      toast.error(
        err instanceof Error ? err.message : "Failed to create dispatch"
      );
    }
  },

  initiateDispatch: async (payload) => {
    set({ isSubmitting: true });
    try {
      const record = await dispatchService.initiateDispatch(payload);

      await useInventoryStore.getState().loadInventory();

      useDashboardStore.getState().addActivityLog({
        title: `Dispatch Initiated — ${record.dispatchNo}`,
        subtitle: `${record.orderNo} dispatched via ${payload.vehicle}`,
        type: "dispatch",
      });

      useDashboardStore.getState().updateDispatchKpis("created");

      const pendingOrders = await dispatchService.getPendingOrders();
      const fleet = await dispatchService.getFleetStats();
      const vehicles = await dispatchService.getVehicles();
      const drivers = await dispatchService.getDrivers();

      set({
        pendingOrders,
        fleet,
        vehicles,
        drivers,
        isSubmitting: false,
      });

      await get().loadDispatchData();
      useFleetStore.getState().loadFleet();
      useDriverStore.getState().loadDrivers();
      toast.success(`Dispatch ${record.dispatchNo} created successfully!`);
      return record;
    } catch (err) {
      set({ isSubmitting: false });
      toast.error(
        err instanceof Error ? err.message : "Failed to initiate dispatch"
      );
      return undefined;
    }
  },

  assignDriver: async (dispatchId, driver) => {
    try {
      await dispatchService.assignDriver(dispatchId, driver);
      await get().loadDispatchData();
      toast.success(`Driver ${driver} assigned`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign driver"
      );
    }
  },

  assignVehicle: async (dispatchId, vehicle) => {
    try {
      await dispatchService.assignVehicle(dispatchId, vehicle);
      await get().loadDispatchData();
      toast.success(`Vehicle ${vehicle} assigned`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign vehicle"
      );
    }
  },

  updateStatus: async (dispatchId, status) => {
    try {
      await dispatchService.updateDispatchStatus(dispatchId, status);
      await get().loadDispatchData();
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  },

  completeDispatch: async (dispatchId) => {
    try {
      const { record, orderValue } =
        await dispatchService.completeDelivery(dispatchId);

      useDashboardStore.getState().addActivityLog({
        title: `Delivery Completed — ${record.orderNo}`,
        subtitle: `Delivered to ${record.customer}`,
        type: "dispatch",
      });

      useDashboardStore.getState().updateDispatchKpis("delivered", orderValue);

      const fleet = await dispatchService.getFleetStats();
      const vehicles = await dispatchService.getVehicles();
      const drivers = await dispatchService.getDrivers();

      set({ fleet, vehicles, drivers });
      await get().loadDispatchData();
      useFleetStore.getState().loadFleet();
      useDriverStore.getState().loadDrivers();
      toast.success(`Delivery completed for ${record.orderNo}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to complete delivery"
      );
    }
  },
}));
