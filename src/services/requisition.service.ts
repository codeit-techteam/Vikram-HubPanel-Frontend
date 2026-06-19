import type {
  CreateRequisitionPayload,
  DraftRequisition,
  DraftMaterialItem,
  RequisitionData,
  RequisitionRequest,
  PaginatedResponse,
  ApiFilters,
} from "@/types";
import { delay, formatCurrency } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

const DEFAULT_HUB_NAME = "Sub-Hub West";

function formatValue(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return formatCurrency(amount);
}

function mapPriorityToLegacy(
  priority: DraftRequisition["priority"]
): "low" | "medium" | "high" | "urgent" {
  const map = { normal: "medium" as const, high: "high" as const, urgent: "urgent" as const };
  return map[priority];
}

function buildItemsSummary(materials: DraftMaterialItem[]): {
  quantity: string;
  material: string;
} {
  const active = materials.filter((m) => m.requestedQty > 0);
  if (active.length === 0) {
    return { quantity: "—", material: "No items" };
  }
  if (active.length === 1) {
    const item = active[0];
    return {
      quantity: `${item.requestedQty} ${item.unit}`,
      material: item.productName,
    };
  }
  return {
    quantity: `${active.length} items`,
    material: active.map((m) => m.productName).join(", "),
  };
}

export const requisitionService = {
  async getData(): Promise<RequisitionData> {
    await delay(300);
    return erpDatabase.getRequisitionData();
  },

  async getRequests(
    filters?: ApiFilters
  ): Promise<PaginatedResponse<RequisitionRequest>> {
    await delay(300);
    const data = erpDatabase.getRequisitionData();
    let filtered = [...data.requests];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.requestId.toLowerCase().includes(search) ||
          r.hubLocation.toLowerCase().includes(search) ||
          r.items.material.toLowerCase().includes(search)
      );
    }

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? data.pagination.pageSize;
    const start = (page - 1) * pageSize;

    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize) || 1,
    };
  },

  async getRequestById(id: string): Promise<RequisitionRequest | undefined> {
    await delay(200);
    return erpDatabase.getRequisitionById(id);
  },

  async getDraft(): Promise<DraftRequisition | null> {
    await delay(100);
    return erpDatabase.getDraft();
  },

  async saveDraft(draft: DraftRequisition): Promise<void> {
    await delay(200);
    erpDatabase.setDraft({ ...draft, lastSavedAt: new Date().toISOString() });
  },

  getEstimatedValue(materials: DraftMaterialItem[]): number {
    return materials.reduce(
      (sum, item) => sum + item.unitPrice * item.requestedQty,
      0
    );
  },

  async createRequest(
    payload: CreateRequisitionPayload
  ): Promise<RequisitionRequest> {
    await delay(500);
    const requests = erpDatabase.getRequisitions();
    const nextNum = 8820 + requests.length + 1;
    const newRequest: RequisitionRequest = {
      id: `req-${String(requests.length + 1).padStart(3, "0")}`,
      requestId: `RQ-${nextNum}`,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      hubLocation: DEFAULT_HUB_NAME,
      items: {
        quantity: `${payload.quantity} ${payload.unit}`,
        material: payload.materialName,
      },
      value: "₹—",
      status: "pending",
      timeline: [
        {
          id: "tl-1",
          title: "Request Created",
          subtitle: payload.requestTitle,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "active",
        },
      ],
    };
    return erpDatabase.addRequisition(newRequest);
  },

  async createRequisition(draft: DraftRequisition): Promise<string> {
    await delay(500);
    const activeMaterials = draft.materials.filter((m) => m.requestedQty > 0);
    const totalValue = this.getEstimatedValue(activeMaterials);
    const requests = erpDatabase.getRequisitions();
    const nextNum = 8820 + requests.length + 1;

    const newRequest: RequisitionRequest = {
      id: `req-${String(requests.length + 1).padStart(3, "0")}`,
      requestId: draft.requisitionId.replace("REQ-", "RQ-"),
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      hubLocation: draft.hubName,
      items: buildItemsSummary(activeMaterials),
      value: formatValue(totalValue),
      status: "pending",
      timeline: [
        {
          id: "tl-1",
          title: "Request Created",
          subtitle: `${draft.requestReason} · ${mapPriorityToLegacy(draft.priority)} priority`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "active",
        },
        {
          id: "tl-2",
          title: "Pending Procurement Verification",
          subtitle: "Routed to Procurement Lead",
          timestamp: "",
          status: "pending",
        },
      ],
    };

    erpDatabase.addRequisition(newRequest);
    erpDatabase.setDraft(null);
    return newRequest.requestId;
  },

  async updateRequestStatus(
    id: string,
    status: RequisitionRequest["status"]
  ): Promise<RequisitionRequest | undefined> {
    await delay(300);
    return erpDatabase.updateRequisitionStatus(id, status);
  },
};
