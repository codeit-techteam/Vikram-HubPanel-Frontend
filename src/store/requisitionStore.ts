import { create } from "zustand";
import type {
  ApiFilters,
  CreateRequisitionPayload,
  DraftMaterialItem,
  DraftRequisition,
  InventoryProduct,
  RequisitionFilterOption,
  RequisitionFormPriority,
  RequisitionPaginationMeta,
  RequisitionRequest,
  RequisitionStatsData,
} from "@/types";
import { requisitionService } from "@/services/requisition.service";

const SOURCE_WAREHOUSE = "Central Materials Hub";
const DEFAULT_HUB_ID = "hub-sh-40291";
const DEFAULT_HUB_NAME = "Sub-Hub West";

function parseStockValue(stock: string): number {
  const match = stock.match(/^([\d,.]+)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ""));
}

function parseStockUnit(stock: string): string {
  const match = stock.match(/^[\d,.]+\s+(.+)$/);
  return match ? match[1] : "Units";
}

function productToMaterial(product: InventoryProduct): DraftMaterialItem {
  return {
    id: `row-${product.id}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    currentStock: parseStockValue(product.currentStock),
    requestedQty: 0,
    unit: parseStockUnit(product.currentStock),
    unitPrice: product.unitPrice ?? 0,
  };
}

function generateRequisitionId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `REQ-${year}-${seq}`;
}

function getDefaultMaterials(): DraftMaterialItem[] {
  return [];
}

function createDefaultDraft(): DraftRequisition {
  return {
    requisitionId: generateRequisitionId(),
    hubId: DEFAULT_HUB_ID,
    hubName: DEFAULT_HUB_NAME,
    priority: "high",
    expectedDate: "",
    requestReason: "Upcoming Demand",
    materials: getDefaultMaterials(),
    sourceWarehouse: SOURCE_WAREHOUSE,
  };
}

function calculateEstimatedValue(materials: DraftMaterialItem[]): number {
  return materials.reduce(
    (sum, item) => sum + item.unitPrice * item.requestedQty,
    0
  );
}

interface RequisitionFilters {
  search: string;
  status: string;
}

function filterRequests(
  requests: RequisitionRequest[],
  filters: RequisitionFilters
): RequisitionRequest[] {
  return requests.filter((request) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      request.requestId.toLowerCase().includes(searchLower) ||
      request.hubLocation.toLowerCase().includes(searchLower) ||
      request.items.material.toLowerCase().includes(searchLower);

    const matchesStatus =
      filters.status === "all" || request.status === filters.status;

    return matchesSearch && matchesStatus;
  });
}

function paginateRequests(
  requests: RequisitionRequest[],
  page: number,
  pageSize: number
): RequisitionRequest[] {
  const start = (page - 1) * pageSize;
  return requests.slice(start, start + pageSize);
}

function findRequestByKey(
  requests: RequisitionRequest[],
  key: string
): RequisitionRequest | undefined {
  const normalized = key.replace(/^REQ-/, "RQ-");
  return requests.find(
    (r) =>
      r.id === key ||
      r.requestId === key ||
      r.requestId === normalized
  );
}

function resolveSelectedRequest(
  filtered: RequisitionRequest[],
  paginated: RequisitionRequest[],
  current: RequisitionRequest | null,
  preferredKey?: string
): RequisitionRequest | null {
  if (preferredKey) {
    const preferred =
      findRequestByKey(filtered, preferredKey) ??
      findRequestByKey(paginated, preferredKey);
    if (preferred) return preferred;
  }

  if (current && filtered.some((r) => r.id === current.id)) {
    return filtered.find((r) => r.id === current.id) ?? current;
  }

  return paginated[0] ?? filtered[0] ?? null;
}

const defaultTrackingFilters: RequisitionFilters = {
  search: "",
  status: "all",
};

const defaultApiFilters: ApiFilters = {
  search: "",
  status: "",
  page: 1,
  pageSize: 10,
};

interface RequisitionState {
  // Tracking dashboard
  requests: RequisitionRequest[];
  allRequests: RequisitionRequest[];
  filteredRequests: RequisitionRequest[];
  stats: RequisitionStatsData;
  statusOptions: RequisitionFilterOption[];
  pagination: RequisitionPaginationMeta;
  trackingFilters: RequisitionFilters;
  selectedRequest: RequisitionRequest | null;
  currentPage: number;
  loading: boolean;
  isCreateModalOpen: boolean;
  isDetailModalOpen: boolean;
  isFilterOpen: boolean;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setCurrentPage: (page: number) => void;
  setSelectedRequest: (request: RequisitionRequest | null) => void;
  selectRequestByKey: (key: string) => RequisitionRequest | null;
  resetTrackingFilters: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailModal: () => void;
  closeDetailModal: () => void;
  setFilterOpen: (open: boolean) => void;
  loadRequests: () => Promise<void>;
  createRequest: (payload: CreateRequisitionPayload) => Promise<void>;
  updateStatus: (
    id: string,
    status: RequisitionRequest["status"]
  ) => Promise<void>;
  // Draft / create flow
  filters: ApiFilters;
  draftRequisition: DraftRequisition;
  requisitions: DraftRequisition[];
  selectedPriority: RequisitionFormPriority;
  estimatedValue: number;
  draftSavedAt: string | null;
  isSavingDraft: boolean;
  setFilters: (filters: Partial<ApiFilters>) => void;
  resetFilters: () => void;
  setDraftField: <K extends keyof DraftRequisition>(
    key: K,
    value: DraftRequisition[K]
  ) => void;
  setSelectedPriority: (priority: RequisitionFormPriority) => void;
  addMaterial: (product: InventoryProduct) => void;
  removeMaterial: (rowId: string) => void;
  updateMaterial: (
    rowId: string,
    updates: Partial<DraftMaterialItem>
  ) => void;
  replaceMaterialProduct: (rowId: string, product: InventoryProduct) => void;
  saveDraft: () => Promise<void>;
  submitRequisition: () => Promise<string>;
  resetDraft: () => void;
  initDraft: () => Promise<void>;
  restoreDraft: (draft: DraftRequisition) => void;
}

export const useRequisitionStore = create<RequisitionState>((set, get) => ({
  // Tracking dashboard state
  requests: [],
  allRequests: [],
  filteredRequests: [],
  stats: {
    openRequests: { value: 0, badge: "" },
    approvedRequests: { value: 0, badge: "" },
    delayedRequests: { value: 0, badge: "" },
  } as RequisitionStatsData,
  statusOptions: [] as RequisitionFilterOption[],
  pagination: {
    totalOpen: 0,
    pageSize: 4,
    totalPages: 1,
  } as RequisitionPaginationMeta,
  trackingFilters: defaultTrackingFilters,
  selectedRequest: null,
  currentPage: 1,
  loading: false,
  isCreateModalOpen: false,
  isDetailModalOpen: false,
  isFilterOpen: false,

  setSearch: (search) => {
    const { allRequests, trackingFilters, pagination, selectedRequest } = get();
    const newFilters = { ...trackingFilters, search };
    const filtered = filterRequests(allRequests, newFilters);
    const paginated = paginateRequests(filtered, 1, pagination.pageSize);
    set({
      trackingFilters: newFilters,
      filteredRequests: filtered,
      requests: paginated,
      currentPage: 1,
      selectedRequest: resolveSelectedRequest(
        filtered,
        paginated,
        selectedRequest
      ),
      pagination: {
        ...pagination,
        totalPages: Math.ceil(filtered.length / pagination.pageSize) || 1,
      },
    });
  },

  setStatusFilter: (status) => {
    const { allRequests, trackingFilters, pagination, selectedRequest } = get();
    const newFilters = { ...trackingFilters, status };
    const filtered = filterRequests(allRequests, newFilters);
    const paginated = paginateRequests(filtered, 1, pagination.pageSize);
    set({
      trackingFilters: newFilters,
      filteredRequests: filtered,
      requests: paginated,
      currentPage: 1,
      selectedRequest: resolveSelectedRequest(
        filtered,
        paginated,
        selectedRequest
      ),
      pagination: {
        ...pagination,
        totalPages: Math.ceil(filtered.length / pagination.pageSize) || 1,
      },
    });
  },

  setCurrentPage: (page) => {
    const { filteredRequests, pagination, selectedRequest } = get();
    const paginated = paginateRequests(
      filteredRequests,
      page,
      pagination.pageSize
    );
    set({
      currentPage: page,
      requests: paginated,
      selectedRequest: resolveSelectedRequest(
        filteredRequests,
        paginated,
        selectedRequest
      ),
    });
  },

  setSelectedRequest: (request) => set({ selectedRequest: request }),

  selectRequestByKey: (key) => {
    const { allRequests, filteredRequests, requests, selectedRequest } = get();
    const match =
      findRequestByKey(allRequests, key) ??
      findRequestByKey(filteredRequests, key) ??
      findRequestByKey(requests, key);

    if (match) {
      set({ selectedRequest: match });
      return match;
    }

    return selectedRequest;
  },

  resetTrackingFilters: () => {
    const { allRequests, pagination, selectedRequest } = get();
    const filtered = filterRequests(allRequests, defaultTrackingFilters);
    const paginated = paginateRequests(filtered, 1, pagination.pageSize);
    set({
      trackingFilters: defaultTrackingFilters,
      filteredRequests: filtered,
      requests: paginated,
      currentPage: 1,
      selectedRequest: resolveSelectedRequest(
        filtered,
        paginated,
        selectedRequest
      ),
      pagination: {
        ...pagination,
        totalPages: Math.ceil(filtered.length / pagination.pageSize) || 1,
      },
    });
  },

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDetailModal: () => set({ isDetailModalOpen: true }),
  closeDetailModal: () => set({ isDetailModalOpen: false }),
  setFilterOpen: (open) => set({ isFilterOpen: open }),

  loadRequests: async () => {
    set({ loading: true });
    const data = await requisitionService.getData();
    const filtered = filterRequests(data.requests, get().trackingFilters);
    const paginated = paginateRequests(
      filtered,
      1,
      data.pagination.pageSize
    );
    const defaultSelected = resolveSelectedRequest(
      filtered,
      paginated,
      null,
      data.defaultSelectedId ?? data.requests[0]?.requestId
    );

    set({
      allRequests: data.requests,
      filteredRequests: filtered,
      requests: paginated,
      stats: data.stats,
      statusOptions: data.statusOptions,
      pagination: {
        ...data.pagination,
        totalPages: Math.ceil(filtered.length / data.pagination.pageSize) || 1,
      },
      selectedRequest: defaultSelected,
      currentPage: 1,
      loading: false,
    });
  },

  createRequest: async (payload) => {
    const newRequest = await requisitionService.createRequest(payload);
    const { allRequests, trackingFilters, pagination, currentPage } = get();
    const updatedAll = [newRequest, ...allRequests];
    const filtered = filterRequests(updatedAll, trackingFilters);
    const paginated = paginateRequests(
      filtered,
      currentPage,
      pagination.pageSize
    );
    set({
      allRequests: updatedAll,
      filteredRequests: filtered,
      requests: paginated,
      selectedRequest: newRequest,
      isCreateModalOpen: false,
      pagination: {
        ...pagination,
        totalOpen: pagination.totalOpen + 1,
        totalPages: Math.ceil(filtered.length / pagination.pageSize) || 1,
      },
    });
  },

  updateStatus: async (id, status) => {
    const updated = await requisitionService.updateRequestStatus(id, status);
    if (!updated) return;

    const { allRequests, filteredRequests, selectedRequest } = get();
    const mapUpdate = (list: RequisitionRequest[]) =>
      list.map((r) => (r.id === id ? updated : r));

    set({
      allRequests: mapUpdate(allRequests),
      filteredRequests: mapUpdate(filteredRequests),
      requests: mapUpdate(get().requests),
      selectedRequest:
        selectedRequest?.id === id ? updated : selectedRequest,
    });
  },

  // Draft / create flow state
  filters: defaultApiFilters,
  draftRequisition: createDefaultDraft(),
  requisitions: [],
  selectedPriority: "high",
  estimatedValue: 0,
  draftSavedAt: null,
  isSavingDraft: false,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultApiFilters }),

  setDraftField: (key, value) =>
    set((state) => {
      const draftRequisition = { ...state.draftRequisition, [key]: value };
      const estimatedValue = calculateEstimatedValue(draftRequisition.materials);
      return {
        draftRequisition,
        estimatedValue,
        ...(key === "priority"
          ? { selectedPriority: value as RequisitionFormPriority }
          : {}),
      };
    }),

  setSelectedPriority: (priority) =>
    set((state) => ({
      selectedPriority: priority,
      draftRequisition: { ...state.draftRequisition, priority },
    })),

  addMaterial: (product) =>
    set((state) => {
      const exists = state.draftRequisition.materials.some(
        (m) => m.productId === product.id
      );
      if (exists) return state;

      const materials = [
        ...state.draftRequisition.materials,
        productToMaterial(product),
      ];
      return {
        draftRequisition: { ...state.draftRequisition, materials },
        estimatedValue: calculateEstimatedValue(materials),
      };
    }),

  removeMaterial: (rowId) =>
    set((state) => {
      const materials = state.draftRequisition.materials.filter(
        (m) => m.id !== rowId
      );
      return {
        draftRequisition: { ...state.draftRequisition, materials },
        estimatedValue: calculateEstimatedValue(materials),
      };
    }),

  updateMaterial: (rowId, updates) =>
    set((state) => {
      const materials = state.draftRequisition.materials.map((m) =>
        m.id === rowId ? { ...m, ...updates } : m
      );
      return {
        draftRequisition: { ...state.draftRequisition, materials },
        estimatedValue: calculateEstimatedValue(materials),
      };
    }),

  replaceMaterialProduct: (rowId, product) =>
    set((state) => {
      const materials = state.draftRequisition.materials.map((m) =>
        m.id === rowId ? { ...productToMaterial(product), id: rowId } : m
      );
      return {
        draftRequisition: { ...state.draftRequisition, materials },
        estimatedValue: calculateEstimatedValue(materials),
      };
    }),

  saveDraft: async () => {
    const { draftRequisition } = get();
    set({ isSavingDraft: true });
    await requisitionService.saveDraft(draftRequisition);
    const savedAt = new Date().toISOString();
    set({
      isSavingDraft: false,
      draftSavedAt: savedAt,
      draftRequisition: { ...draftRequisition, lastSavedAt: savedAt },
    });
  },

  submitRequisition: async () => {
    const { draftRequisition, trackingFilters, pagination } = get();
    const requestId =
      await requisitionService.createRequisition(draftRequisition);

    const data = await requisitionService.getData();
    const filtered = filterRequests(data.requests, trackingFilters);
    const paginated = paginateRequests(filtered, 1, pagination.pageSize);
    const newRequest = data.requests[0];

    set((state) => ({
      requisitions: [...state.requisitions, draftRequisition],
      draftRequisition: createDefaultDraft(),
      estimatedValue: 0,
      selectedPriority: "high",
      draftSavedAt: null,
      allRequests: data.requests,
      filteredRequests: filtered,
      requests: paginated,
      selectedRequest: newRequest ?? state.selectedRequest,
      currentPage: 1,
      pagination: {
        ...pagination,
        totalOpen: pagination.totalOpen + 1,
        totalPages: Math.ceil(filtered.length / pagination.pageSize) || 1,
      },
    }));
    return requestId;
  },

  restoreDraft: (draft: DraftRequisition) =>
    set({
      draftRequisition: draft,
      selectedPriority: draft.priority,
      estimatedValue: calculateEstimatedValue(draft.materials),
      draftSavedAt: draft.lastSavedAt ?? null,
    }),

  resetDraft: () =>
    set({
      draftRequisition: createDefaultDraft(),
      estimatedValue: 0,
      selectedPriority: "high",
      draftSavedAt: null,
    }),

  initDraft: async () => {
    const draft = createDefaultDraft();
    set({
      draftRequisition: draft,
      selectedPriority: draft.priority,
      estimatedValue: 0,
      draftSavedAt: null,
    });
  },
}));

export {
  calculateEstimatedValue,
  parseStockValue,
  parseStockUnit,
  productToMaterial,
};
