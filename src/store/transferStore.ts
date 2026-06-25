import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  CreateTransferPayload,
  IncomingTransfer,
  ManifestMaterial,
  MaterialReceivingRecord,
  ReceiveTransferPayload,
  ShipmentTimelineItem,
  TransferDriver,
  TransferFilterStatus,
  TransferSortField,
  TransferSummary,
  VehicleDetails,
} from "@/types";
import { transferService } from "@/services/transfer.service";
import { useInventoryStore } from "./inventoryStore";
import { useDashboardStore } from "./dashboardStore";

interface TransferFilters {
  status: TransferFilterStatus;
  search: string;
}

interface TransferState {
  transfers: IncomingTransfer[];
  filteredTransfers: IncomingTransfer[];
  selectedTransfer: IncomingTransfer | null;
  manifest: ManifestMaterial[];
  timeline: ShipmentTimelineItem[];
  driverDetails: TransferDriver | null;
  vehicleDetails: VehicleDetails | null;
  summary: TransferSummary;
  filters: TransferFilters;
  sortBy: TransferSortField;
  loading: boolean;
  detailLoading: boolean;
  isDetailsOpen: boolean;
  isReceiveOpen: boolean;
  isPrintOpen: boolean;
  isShareOpen: boolean;
  isCreateOpen: boolean;
  shareUrl: string;
  receivingRecords: MaterialReceivingRecord[];
  setFilter: (status: TransferFilterStatus) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: TransferSortField) => void;
  selectTransfer: (transfer: IncomingTransfer | null) => void;
  openDetails: (transfer: IncomingTransfer) => void;
  closeDetails: () => void;
  openReceive: (transfer: IncomingTransfer) => void;
  closeReceive: () => void;
  openPrint: () => void;
  closePrint: () => void;
  openShare: () => void;
  closeShare: () => void;
  openCreate: () => void;
  closeCreate: () => void;
  loadTransfers: () => Promise<void>;
  loadTransferById: (id: string) => Promise<void>;
  receiveTransfer: (payload: ReceiveTransferPayload) => Promise<void>;
  updateTransferStatus: (
    transferId: string,
    status: IncomingTransfer["status"]
  ) => Promise<void>;
  shareTransfer: (transferId: string) => Promise<void>;
  createTransfer: (payload: CreateTransferPayload) => Promise<void>;
}

const defaultFilters: TransferFilters = {
  status: "all",
  search: "",
};

function filterTransfers(
  transfers: IncomingTransfer[],
  filters: TransferFilters
): IncomingTransfer[] {
  return transfers.filter((transfer) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      transfer.transferId.toLowerCase().includes(searchLower) ||
      transfer.materials.some(
        (m) =>
          m.name.toLowerCase().includes(searchLower) ||
          m.quantity.toLowerCase().includes(searchLower)
      );

    const matchesStatus =
      filters.status === "all" || transfer.status === filters.status;

    return matchesSearch && matchesStatus;
  });
}

function sortTransfers(
  transfers: IncomingTransfer[],
  sortBy: TransferSortField
): IncomingTransfer[] {
  const sorted = [...transfers];

  switch (sortBy) {
    case "eta_asc":
      return sorted.sort((a, b) => {
        const aEta = a.eta ?? "9999";
        const bEta = b.eta ?? "9999";
        return aEta.localeCompare(bEta);
      });
    case "eta_desc":
      return sorted.sort((a, b) => {
        const aEta = a.eta ?? "";
        const bEta = b.eta ?? "";
        return bEta.localeCompare(aEta);
      });
    case "status":
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    case "transfer_id":
      return sorted.sort((a, b) =>
        a.transferId.localeCompare(b.transferId)
      );
    default:
      return sorted;
  }
}

function applyFiltersAndSort(
  transfers: IncomingTransfer[],
  filters: TransferFilters,
  sortBy: TransferSortField
): IncomingTransfer[] {
  const filtered = filterTransfers(transfers, filters);
  return sortTransfers(filtered, sortBy);
}

function hydrateTransferDetail(transfer: IncomingTransfer) {
  return {
    selectedTransfer: transfer,
    manifest: transferService.getManifestForTransfer(transfer),
    timeline: transferService.getShipmentTimeline(transfer),
    driverDetails: transferService.getDriverDetails(transfer),
    vehicleDetails: transferService.getVehicleDetails(transfer),
  };
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: [],
  filteredTransfers: [],
  selectedTransfer: null,
  manifest: [],
  timeline: [],
  driverDetails: null,
  vehicleDetails: null,
  summary: { totalIncoming: 0, onTime: 0, delayed: 0 },
  filters: defaultFilters,
  sortBy: "eta_asc",
  loading: false,
  detailLoading: false,
  isDetailsOpen: false,
  isReceiveOpen: false,
  isPrintOpen: false,
  isShareOpen: false,
  isCreateOpen: false,
  shareUrl: "",
  receivingRecords: [],

  setFilter: (status) => {
    const state = get();
    const filters = { ...state.filters, status };
    const filteredTransfers = applyFiltersAndSort(
      state.transfers,
      filters,
      state.sortBy
    );
    set({ filters, filteredTransfers });
  },

  setSearch: (search) => {
    const state = get();
    const filters = { ...state.filters, search };
    const filteredTransfers = applyFiltersAndSort(
      state.transfers,
      filters,
      state.sortBy
    );
    set({ filters, filteredTransfers });
  },

  setSortBy: (sortBy) => {
    const state = get();
    const filteredTransfers = applyFiltersAndSort(
      state.transfers,
      state.filters,
      sortBy
    );
    set({ sortBy, filteredTransfers });
  },

  selectTransfer: (transfer) => {
    if (!transfer) {
      set({
        selectedTransfer: null,
        manifest: [],
        timeline: [],
        driverDetails: null,
        vehicleDetails: null,
      });
      return;
    }
    set(hydrateTransferDetail(transfer));
  },

  openDetails: (transfer) =>
    set({ ...hydrateTransferDetail(transfer), isDetailsOpen: true }),

  closeDetails: () => set({ isDetailsOpen: false }),

  openReceive: (transfer) =>
    set({ ...hydrateTransferDetail(transfer), isReceiveOpen: true }),

  closeReceive: () => set({ isReceiveOpen: false }),

  openPrint: () => set({ isPrintOpen: true }),
  closePrint: () => set({ isPrintOpen: false }),

  openShare: () => set({ isShareOpen: true }),
  closeShare: () => set({ isShareOpen: false, shareUrl: "" }),

  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),

  loadTransfers: async () => {
    set({ loading: true });
    const data = await transferService.getTransfers();
    const state = get();
    const filteredTransfers = applyFiltersAndSort(
      data.transfers,
      state.filters,
      state.sortBy
    );
    set({
      transfers: data.transfers,
      filteredTransfers,
      summary: data.summary,
      loading: false,
    });
  },

  loadTransferById: async (id) => {
    set({ detailLoading: true });
    const transfer = await transferService.getTransferById(id);
    if (!transfer) {
      set({ detailLoading: false, selectedTransfer: null });
      return;
    }
    set({
      ...hydrateTransferDetail(transfer),
      detailLoading: false,
    });
  },

  receiveTransfer: async (payload) => {
    const { currentUser } = (
      await import("./userStore")
    ).useUserStore.getState();

    const record = await transferService.receiveTransfer(
      payload,
      currentUser.name
    );

    await useInventoryStore.getState().loadInventory();

    useDashboardStore.getState().addActivityLog({
      title: `Material Received — ${payload.transferId}`,
      subtitle: `${payload.materials.length} material(s) verified and added to inventory`,
      type: "transfer",
    });

    useDashboardStore.getState().updateIncomingTransfersKpi();

    const state = get();
    const updatedTransfers = state.transfers.map((t) =>
      t.transferId === payload.transferId
        ? { ...t, status: "received" as const, etaDisplay: "Received" }
        : t
    );
    const filteredTransfers = applyFiltersAndSort(
      updatedTransfers,
      state.filters,
      state.sortBy
    );

    const receivedTransfer = state.transfers.find(
      (t) => t.transferId === payload.transferId
    );

    const updatedSelected =
      state.selectedTransfer?.transferId === payload.transferId
        ? {
            ...state.selectedTransfer,
            status: "received" as const,
            etaDisplay: "Received",
          }
        : state.selectedTransfer;

    set({
      transfers: updatedTransfers,
      filteredTransfers,
      receivingRecords: [record, ...state.receivingRecords],
      isReceiveOpen: false,
      selectedTransfer: updatedSelected,
      summary: {
        totalIncoming: Math.max(0, state.summary.totalIncoming - 1),
        onTime:
          receivedTransfer?.status !== "delayed"
            ? Math.max(0, state.summary.onTime - 1)
            : state.summary.onTime,
        delayed:
          receivedTransfer?.status === "delayed"
            ? Math.max(0, state.summary.delayed - 1)
            : state.summary.delayed,
      },
    });

    toast.success("Material received successfully. Inventory updated.");
  },

  updateTransferStatus: async (transferId, status) => {
    await transferService.updateStatus(transferId, status);
    const state = get();
    const updatedTransfers = state.transfers.map((t) =>
      t.transferId === transferId || t.id === transferId
        ? { ...t, status }
        : t
    );
    const filteredTransfers = applyFiltersAndSort(
      updatedTransfers,
      state.filters,
      state.sortBy
    );

    const updatedSelected =
      state.selectedTransfer &&
      (state.selectedTransfer.transferId === transferId ||
        state.selectedTransfer.id === transferId)
        ? { ...state.selectedTransfer, status }
        : state.selectedTransfer;

    set({
      transfers: updatedTransfers,
      filteredTransfers,
      selectedTransfer: updatedSelected,
    });
  },

  shareTransfer: async (transferId) => {
    const url = await transferService.shareTransfer(transferId);
    set({ shareUrl: url });
  },

  createTransfer: async (payload) => {
    const newTransfer = await transferService.createTransfer(payload);
    const state = get();
    const updatedTransfers = [newTransfer, ...state.transfers];
    const filteredTransfers = applyFiltersAndSort(
      updatedTransfers,
      state.filters,
      state.sortBy
    );

    useDashboardStore.getState().addActivityLog({
      title: `Transfer Created — ${newTransfer.transferId}`,
      subtitle: `${payload.materials} scheduled from ${payload.sourceWarehouse}`,
      type: "transfer",
    });

    set({
      transfers: updatedTransfers,
      filteredTransfers,
      isCreateOpen: false,
      summary: {
        ...state.summary,
        totalIncoming: state.summary.totalIncoming + 1,
      },
    });

    toast.success(`Transfer ${newTransfer.transferId} created successfully.`);
  },
}));
