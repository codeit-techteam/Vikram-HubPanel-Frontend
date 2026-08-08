import type {
  ApiFilters,
  CreateTransferPayload,
  IncomingTransfer,
  ManifestMaterial,
  ReceiveTransferPayload,
  ShipmentTimelineItem,
  TransferData,
  TransferDriver,
  VehicleDetails,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";

type BackendTransferPayload = {
  summary: TransferData["summary"];
  transfers: IncomingTransfer[];
};

function buildManifest(transfer: IncomingTransfer): ManifestMaterial[] {
  if (transfer.manifest?.length) return transfer.manifest;
  return transfer.materials.map((material) => ({
    id: material.id,
    name: material.name,
    quantity: parseFloat(material.quantity.replace(/[^0-9.]/g, "")) || 0,
    unit: material.quantity.replace(/[0-9.,\s]/g, "").trim() || "Units",
    status: "loaded" as const,
    sku: material.sku,
  }));
}

function buildShipmentTimeline(
  transfer: IncomingTransfer,
): ShipmentTimelineItem[] {
  if (transfer.shipmentTimeline?.length) return transfer.shipmentTimeline;
  return transfer.timeline.map((event) => ({
    id: event.id,
    title: event.title.replace("Transfer Created", "Created"),
    timestamp: event.timestamp,
    status: event.status,
    highlight:
      event.status === "active" && transfer.etaDisplay
        ? transfer.etaDisplay
        : undefined,
  }));
}

function buildVehicleDetails(transfer: IncomingTransfer): VehicleDetails {
  if (transfer.vehicleDetails) return transfer.vehicleDetails;
  return {
    number: transfer.vehicle,
    type: "Heavy Material Carrier",
    capacity: "15 Tons",
    status:
      transfer.status === "in_transit" || transfer.status === "dispatched"
        ? "On Route"
        : "Standby",
  };
}

function enrich(transfer: IncomingTransfer): IncomingTransfer {
  return {
    ...transfer,
    manifest: buildManifest(transfer),
    shipmentTimeline: buildShipmentTimeline(transfer),
    vehicleDetails: buildVehicleDetails(transfer),
  };
}

/** Sync helpers for Zustand hydration (no network). */
function getManifestForTransfer(transfer: IncomingTransfer): ManifestMaterial[] {
  return buildManifest(transfer);
}

function getShipmentTimelineSync(
  transfer: IncomingTransfer,
): ShipmentTimelineItem[] {
  return buildShipmentTimeline(transfer);
}

function getDriverDetailsSync(transfer: IncomingTransfer): TransferDriver {
  return transfer.driver;
}

function getVehicleDetailsSync(transfer: IncomingTransfer): VehicleDetails {
  return buildVehicleDetails(transfer);
}

export const transferService = {
  getManifestForTransfer,
  getShipmentTimeline: getShipmentTimelineSync,
  getDriverDetails: getDriverDetailsSync,
  getVehicleDetails: getVehicleDetailsSync,

  async getTransfers(filters?: ApiFilters): Promise<TransferData> {
    const { data } = await api.get<ApiResponse<BackendTransferPayload>>(
      "/hub/transfers",
      {
        params: {
          search: filters?.search || undefined,
          status:
            filters?.status && filters.status !== "all"
              ? filters.status
              : undefined,
        },
      },
    );

    const payload = data.data;
    return {
      summary: payload.summary,
      transfers: (payload.transfers ?? []).map(enrich),
    };
  },

  async getTransferById(id: string): Promise<IncomingTransfer | undefined> {
    try {
      const { data } = await api.get<ApiResponse<IncomingTransfer>>(
        `/hub/transfers/${encodeURIComponent(id)}`,
      );
      return enrich(data.data);
    } catch {
      return undefined;
    }
  },

  async getManifest(transferId: string): Promise<ManifestMaterial[]> {
    const transfer = await this.getTransferById(transferId);
    if (!transfer) return [];
    return buildManifest(transfer);
  },

  async shareTransfer(transferId: string): Promise<string> {
    const transfer = await this.getTransferById(transferId);
    if (!transfer) throw new Error("Transfer not found");
    return `${typeof window !== "undefined" ? window.location.origin : ""}/transfers/${transfer.transferId}`;
  },

  async createTransfer(
    _payload: CreateTransferPayload,
  ): Promise<IncomingTransfer> {
    throw new Error(
      "Transfers are created by Central Warehouse when a requisition is dispatched.",
    );
  },

  async receiveTransfer(
    payload: ReceiveTransferPayload,
    _receivedBy?: string,
  ): Promise<IncomingTransfer> {
    const transfer =
      (await this.getTransferById(payload.transferId)) ??
      (await this.getTransferById(
        (payload as { id?: string }).id ?? payload.transferId,
      ));
    if (!transfer) throw new Error("Transfer not found");

    const items = (payload.materials ?? []).map((m) => {
      const material = transfer.materials.find(
        (row) =>
          row.id === m.materialId ||
          row.id === (m as { id?: string }).id ||
          row.name === m.materialName,
      );
      return {
        itemId: material?.id ?? m.materialId,
        receivedQty: Math.max(0, Math.round(m.quantityReceived ?? 0)),
        damageQty: Math.max(0, Math.round(m.damageQuantity ?? 0)),
        shortageQty: 0,
      };
    });

    await api.patch(`/hub/transfers/${encodeURIComponent(transfer.id)}/receive`, {
      items,
      comment: payload.remarks,
    });

    const refreshed = await this.getTransferById(transfer.id);
    if (!refreshed)
      throw new Error("Transfer receive succeeded but reload failed");
    return refreshed;
  },

  async updateTransferStatus(
    _transferId: string,
    _status: IncomingTransfer["status"],
  ): Promise<IncomingTransfer | undefined> {
    return undefined;
  },

  async getDriverDetailsAsync(
    transferId: string,
  ): Promise<TransferDriver | undefined> {
    const transfer = await this.getTransferById(transferId);
    return transfer?.driver;
  },

  async getVehicleDetailsAsync(
    transferId: string,
  ): Promise<VehicleDetails | undefined> {
    const transfer = await this.getTransferById(transferId);
    return transfer ? buildVehicleDetails(transfer) : undefined;
  },

  async getShipmentTimelineAsync(
    transferId: string,
  ): Promise<ShipmentTimelineItem[]> {
    const transfer = await this.getTransferById(transferId);
    if (!transfer) return [];
    return buildShipmentTimeline(transfer);
  },
};
