import type {
  ApiFilters,
  DraftMaterialItem,
  DraftRequisition,
  PaginatedResponse,
  RequisitionData,
  RequisitionMaterialOption,
  RequisitionRequest,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";

const PRIORITY_TO_API = {
  normal: "NORMAL",
  high: "HIGH",
  urgent: "URGENT",
} as const;

/** Labels must match GeneralDetailsForm REQUEST_REASONS */
const REASON_TO_API: Record<string, string> = {
  "Low Stock": "LOW_STOCK",
  "Upcoming Demand": "UPCOMING_DEMAND",
  "Emergency Order": "EMERGENCY_ORDER",
  "Festival Stock": "FESTIVAL_STOCK",
  "Project Requirement": "PROJECT_REQUIREMENT",
  Other: "OTHER",
};

const STATUS_UI_TO_API: Record<string, string> = {
  draft: "DRAFT",
  pending: "PENDING_APPROVAL",
  approved: "APPROVED",
  rejected: "REJECTED",
  allocated: "ALLOCATED",
  in_transit: "IN_TRANSIT",
  delivered: "DISPATCHED",
  received: "COMPLETED",
};

const API_TO_REASON: Record<string, string> = {
  LOW_STOCK: "Low Stock",
  UPCOMING_DEMAND: "Upcoming Demand",
  EMERGENCY_ORDER: "Emergency Order",
  FESTIVAL_STOCK: "Festival Stock",
  PROJECT_REQUIREMENT: "Project Requirement",
  OTHER: "Other",
};

const API_TO_PRIORITY: Record<string, DraftRequisition["priority"]> = {
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

interface BackendRequisitionRow {
  id: string;
  requestId: string;
  requestNo: string;
  date: string;
  hubLocation: string;
  hubId: string;
  hubName: string;
  priority: string;
  items: { quantity: string; material: string };
  itemSummary?: string;
  totalQty: number;
  totalItems: number;
  value: string;
  totalValue: number;
  status: RequisitionRequest["status"];
  rawStatus?: string;
  expectedDate?: string;
  reason?: string;
  rejectionReason?: string;
  warehouseName?: string;
  timeline: RequisitionRequest["timeline"];
  materials?: RequisitionRequest["materials"];
  dispatch?: RequisitionRequest["dispatch"];
  receiving?: RequisitionRequest["receiving"];
}

function formatDisplayDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapRequest(row: BackendRequisitionRow): RequisitionRequest {
  return {
    id: row.id,
    requestId: row.requestNo ?? row.requestId,
    date: formatDisplayDate(row.date),
    hubLocation: row.hubLocation ?? row.hubName,
    items: row.items,
    value: row.value,
    status: row.status,
    timeline: row.timeline ?? [],
    rawStatus: row.rawStatus,
    priority: row.priority,
    expectedDate: row.expectedDate
      ? formatDisplayDate(row.expectedDate)
      : undefined,
    reason: row.reason,
    rejectionReason: row.rejectionReason,
    warehouseName: row.warehouseName,
    materials: row.materials,
    dispatch: row.dispatch,
    receiving: row.receiving,
  };
}

function mapStats(statsPayload: Record<string, unknown>): RequisitionData["stats"] {
  const asStat = (value: unknown, fallbackBadge = "") => {
    if (
      value &&
      typeof value === "object" &&
      "value" in value &&
      typeof (value as { value: unknown }).value === "number"
    ) {
      const badge =
        "badge" in value && typeof (value as { badge: unknown }).badge === "string"
          ? (value as { badge: string }).badge
          : fallbackBadge;
      return { value: (value as { value: number }).value, badge };
    }
    if (typeof value === "number") {
      return { value, badge: fallbackBadge };
    }
    return { value: 0, badge: fallbackBadge };
  };

  return {
    openRequests: asStat(statsPayload.openRequests),
    approvedRequests: asStat(statsPayload.approvedRequests, "Stable"),
    delayedRequests: asStat(statsPayload.delayedRequests),
    pendingApproval:
      typeof statsPayload.pendingApproval === "number"
        ? statsPayload.pendingApproval
        : undefined,
    pendingRequests:
      typeof statsPayload.pendingRequests === "number"
        ? statsPayload.pendingRequests
        : undefined,
    criticalRequests:
      typeof statsPayload.criticalRequests === "number"
        ? statsPayload.criticalRequests
        : undefined,
    awaitingAllocation:
      typeof statsPayload.awaitingAllocation === "number"
        ? statsPayload.awaitingAllocation
        : undefined,
    inTransit:
      typeof statsPayload.inTransit === "number"
        ? statsPayload.inTransit
        : undefined,
    completed:
      typeof statsPayload.completed === "number"
        ? statsPayload.completed
        : undefined,
    rejected:
      typeof statsPayload.rejected === "number"
        ? statsPayload.rejected
        : undefined,
  };
}

async function fetchRequisitionRow(
  idOrRequestNo: string,
): Promise<BackendRequisitionRow | null> {
  try {
    const { data } = await api.get<ApiResponse<BackendRequisitionRow>>(
      `/hub/requisitions/${idOrRequestNo}`,
    );
    return data.data;
  } catch {
    const { data } = await api.get<
      ApiResponse<{
        data: BackendRequisitionRow[];
      }>
    >("/hub/requisitions", { params: { search: idOrRequestNo, limit: 20 } });

    const row = data.data.data.find(
      (item) =>
        item.id === idOrRequestNo ||
        item.requestNo === idOrRequestNo ||
        item.requestId === idOrRequestNo,
    );
    if (!row) return null;

    // List rows omit materials/dispatch — fetch full detail by UUID
    if (!row.materials) {
      try {
        const detail = await api.get<ApiResponse<BackendRequisitionRow>>(
          `/hub/requisitions/${row.id}`,
        );
        return detail.data.data;
      } catch {
        return row;
      }
    }
    return row;
  }
}

function draftPayload(draft: DraftRequisition, submit: boolean) {
  const activeMaterials = draft.materials.filter((m) => m.requestedQty > 0);
  return {
    priority:
      PRIORITY_TO_API[draft.priority as keyof typeof PRIORITY_TO_API] ?? "NORMAL",
    reason: REASON_TO_API[draft.requestReason] ?? "OTHER",
    expectedDate: draft.expectedDate || undefined,
    remarks: draft.requestReason,
    submit,
    items: activeMaterials.map((material) => ({
      productId: material.productId,
      requestedQty: Math.max(1, Math.round(material.requestedQty)),
    })),
  };
}

function mapDraftFromRow(row: BackendRequisitionRow): DraftRequisition {
  const expected = row.expectedDate
    ? new Date(row.expectedDate).toISOString().slice(0, 10)
    : "";
  return {
    id: row.id,
    requisitionId: row.requestNo ?? row.requestId,
    hubId: row.hubId,
    hubName: row.hubName ?? row.hubLocation,
    priority:
      API_TO_PRIORITY[String(row.priority).toUpperCase()] ??
      ((row.priority as DraftRequisition["priority"]) || "normal"),
    expectedDate: Number.isNaN(new Date(expected).getTime()) ? "" : expected,
    requestReason:
      API_TO_REASON[String(row.reason ?? "")] ??
      row.reason ??
      "Upcoming Demand",
    sourceWarehouse: row.warehouseName ?? "Central Warehouse",
    lastSavedAt: new Date().toISOString(),
    materials: (row.materials ?? []).map((material) => ({
      id: `row-${material.productId}`,
      productId: material.productId,
      productName: material.productName,
      sku: material.sku ?? "",
      currentStock: material.availableStock,
      requestedQty: material.requestedQty,
      unit: material.unit,
      unitPrice: material.unitPrice ?? 0,
      minimumStock: material.minimumStock ?? 0,
      warehouseStock: material.warehouseStock ?? 0,
    })),
  };
}

export const requisitionService = {
  async getData(): Promise<RequisitionData> {
    const [listResponse, statsResponse] = await Promise.all([
      api.get<
        ApiResponse<{
          data: BackendRequisitionRow[];
          meta: { total: number; page: number; limit: number; totalPages: number };
        }>
      >("/hub/requisitions", { params: { page: 1, limit: 500 } }),
      api.get<ApiResponse<Record<string, unknown>>>("/hub/requisitions/stats"),
    ]);

    const rows = listResponse.data.data.data;
    const statsPayload = statsResponse.data.data;
    const requests = rows.map(mapRequest);

    return {
      stats: mapStats(statsPayload),
      statusOptions: [
        { value: "all", label: "All Statuses" },
        { value: "draft", label: "Draft" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "allocated", label: "Allocated" },
        { value: "in_transit", label: "In Transit" },
        { value: "delivered", label: "Dispatched" },
        { value: "received", label: "Received" },
      ],
      pagination: {
        totalOpen: listResponse.data.data.meta.total,
        pageSize: 4,
        totalPages: Math.ceil(listResponse.data.data.meta.total / 4) || 1,
      },
      defaultSelectedId: requests[0]?.requestId,
      requests,
    };
  },

  async getRequests(
    filters?: ApiFilters,
  ): Promise<PaginatedResponse<RequisitionRequest>> {
    const { data } = await api.get<
      ApiResponse<{
        data: BackendRequisitionRow[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>
    >("/hub/requisitions", {
      params: {
        page: filters?.page ?? 1,
        limit: filters?.pageSize ?? 10,
        search: filters?.search,
        status:
          filters?.status && filters.status !== "all"
            ? STATUS_UI_TO_API[filters.status]
            : undefined,
      },
    });

    return {
      data: data.data.data.map(mapRequest),
      total: data.data.meta.total,
      page: data.data.meta.page,
      pageSize: data.data.meta.limit,
      totalPages: data.data.meta.totalPages,
    };
  },

  async getRequestById(id: string): Promise<RequisitionRequest | undefined> {
    const detail = await this.getRequestDetail(id);
    return detail ? mapRequest(detail) : undefined;
  },

  async getRequestDetail(id: string): Promise<BackendRequisitionRow | null> {
    return fetchRequisitionRow(id);
  },

  async searchMaterials(search?: string): Promise<RequisitionMaterialOption[]> {
    const { data } = await api.get<
      ApiResponse<
        Array<{
          productId: string;
          inventoryId: string;
          sku?: string | null;
          name: string;
          category: string;
          currentStock: number;
          minimumStock: number;
          warehouseStock: number;
          warehouseName?: string;
          unit: string;
          unitPrice: number;
          lowStock: boolean;
        }>
      >
    >("/hub/requisitions/materials/search", { params: { search } });

    return data.data.map((item) => ({
      productId: item.productId,
      inventoryId: item.inventoryId,
      sku: item.sku ?? "",
      name: item.name,
      category: item.category,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      warehouseStock: item.warehouseStock,
      warehouseName: item.warehouseName,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lowStock: item.lowStock,
    }));
  },

  async getDraft(): Promise<DraftRequisition | null> {
    const { data } = await api.get<ApiResponse<BackendRequisitionRow | null>>(
      "/hub/requisitions/draft",
    );
    const row = data.data;
    if (!row) return null;
    return mapDraftFromRow(row);
  },

  async saveDraft(draft: DraftRequisition): Promise<DraftRequisition> {
    const payload = draftPayload(draft, false);
    if (draft.id) {
      const { data } = await api.patch<ApiResponse<BackendRequisitionRow>>(
        `/hub/requisitions/${draft.id}`,
        payload,
      );
      return mapDraftFromRow(data.data);
    }
    const { data } = await api.post<ApiResponse<BackendRequisitionRow>>(
      "/hub/requisitions",
      payload,
    );
    return mapDraftFromRow(data.data);
  },

  getEstimatedValue(materials: DraftMaterialItem[]): number {
    return materials.reduce(
      (sum, item) => sum + item.unitPrice * item.requestedQty,
      0,
    );
  },

  async createRequisition(draft: DraftRequisition): Promise<string> {
    if (draft.id) {
      await api.patch(`/hub/requisitions/${draft.id}`, draftPayload(draft, false));
      const { data } = await api.patch<ApiResponse<BackendRequisitionRow>>(
        `/hub/requisitions/${draft.id}/submit`,
      );
      return data.data.requestNo ?? data.data.requestId;
    }

    const { data } = await api.post<ApiResponse<BackendRequisitionRow>>(
      "/hub/requisitions",
      draftPayload(draft, true),
    );

    return data.data.requestNo ?? data.data.requestId;
  },

  async receiveRequisition(
    id: string,
    items: Array<{
      itemId: string;
      receivedQty: number;
      shortageQty?: number;
      damageQty?: number;
      missingQty?: number;
      remarks?: string;
    }>,
    comment?: string,
  ) {
    const row = await fetchRequisitionRow(id);
    const resolvedId = row?.id ?? id;
    const { data } = await api.patch<ApiResponse<BackendRequisitionRow>>(
      `/hub/requisitions/${resolvedId}/receive`,
      {
        items: items.map((item) => ({
          ...item,
          receivedQty: Math.max(0, Math.round(item.receivedQty)),
        })),
        comment,
      },
    );
    return mapRequest(data.data);
  },

  async updateRequestStatus(): Promise<RequisitionRequest | undefined> {
    return undefined;
  },
};

export { mapRequest, REASON_TO_API };
