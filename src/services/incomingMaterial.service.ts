import type { IncomingMaterial, IncomingTransfer, Status, TransferStatus } from "@/types";
import { transferService } from "./transfer.service";
import { useAuthStore } from "@/store/authStore";

function mapStatus(status: TransferStatus): Status {
  const map: Record<TransferStatus, Status> = {
    ready: "pending",
    dispatched: "dispatched",
    in_transit: "in_transit",
    arriving_today: "in_transit",
    received: "received",
    delayed: "in_transit",
  };
  return map[status] ?? "pending";
}

function parseQty(quantity: string): number {
  return parseFloat(quantity.replace(/[^0-9.]/g, "")) || 0;
}

function toIncomingMaterial(transfer: IncomingTransfer): IncomingMaterial {
  const manager = useAuthStore.getState().manager;
  return {
    id: transfer.id,
    shipmentNo: transfer.transferId,
    supplier: transfer.source,
    hubId: manager?.hubId ?? "",
    hubName: transfer.destination || manager?.hubName || "Assigned Hub",
    materialCount: transfer.materials.length,
    totalQuantity: transfer.materials.reduce(
      (sum, material) => sum + parseQty(material.quantity),
      0,
    ),
    expectedDate:
      transfer.etaDisplay ||
      transfer.eta ||
      transfer.scheduled ||
      transfer.dispatchDate ||
      "",
    status: mapStatus(transfer.status),
    carrier: transfer.vehicle || "—",
  };
}

export const incomingMaterialService = {
  async getAll(): Promise<IncomingMaterial[]> {
    const data = await transferService.getTransfers();
    return data.transfers
      .filter((transfer) => transfer.status !== "received")
      .map(toIncomingMaterial);
  },
};
