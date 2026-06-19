import type {
  ApiFilters,
  CreateTransferPayload,
  IncomingTransfer,
  ManifestMaterial,
  MaterialReceivingRecord,
  ReceiveTransferPayload,
  ShipmentTimelineItem,
  TransferData,
  TransferDriver,
  TransferStatus,
  VehicleDetails,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

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
  transfer: IncomingTransfer
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

export const transferService = {
  async getTransfers(filters?: ApiFilters): Promise<TransferData> {
    await delay(300);
    const data = erpDatabase.getTransfers();
    let filtered = [...data.transfers];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transferId.toLowerCase().includes(search) ||
          t.materials.some(
            (m) =>
              m.name.toLowerCase().includes(search) ||
              m.quantity.toLowerCase().includes(search)
          )
      );
    }

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    return {
      summary: data.summary,
      transfers: filtered,
    };
  },

  async getTransferById(id: string): Promise<IncomingTransfer | undefined> {
    await delay(150);
    return erpDatabase.getTransferById(id);
  },

  async getManifest(transferId: string): Promise<ManifestMaterial[]> {
    await delay(100);
    const transfer = erpDatabase.getTransferById(transferId);
    if (!transfer) return [];
    return buildManifest(transfer);
  },

  async shareTransfer(transferId: string): Promise<string> {
    await delay(200);
    const transfer = erpDatabase.getTransferById(transferId);
    if (!transfer) throw new Error("Transfer not found");
    return `https://hubops.local/track/${transfer.transferId}`;
  },

  async createTransfer(
    payload: CreateTransferPayload
  ): Promise<IncomingTransfer> {
    await delay(400);
    const id = `trf-${Date.now().toString().slice(-4)}`;
    const transferId = `TR-${Date.now().toString().slice(-4)}-X`;

    const newTransfer: IncomingTransfer = {
      id,
      transferId,
      status: "ready",
      eta: null,
      scheduled: payload.expectedDispatchDate,
      etaDisplay: `Scheduled: ${payload.expectedDispatchDate}`,
      source: payload.sourceWarehouse,
      destination: payload.destinationHub,
      dispatchDate: payload.expectedDispatchDate,
      vehicle: payload.vehicle,
      vehicleDetails: {
        number: payload.vehicle,
        type: "Heavy Material Carrier",
        capacity: "15 Tons",
        status: "Standby",
      },
      driver: {
        name: payload.driver,
        phone: "+91 90000 00000",
      },
      materials: [
        {
          id: `mat-${Date.now()}`,
          name: payload.materials,
          quantity: `${payload.quantity} ${payload.materials}`,
        },
      ],
      manifest: [
        {
          id: `man-${Date.now()}`,
          name: payload.materials,
          quantity: parseFloat(payload.quantity) || 0,
          unit: "Units",
          status: "pending",
        },
      ],
      timeline: [
        {
          id: "tl-1",
          title: "Transfer Created",
          subtitle: `Priority: ${payload.priority}`,
          timestamp: new Date().toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "completed",
        },
        {
          id: "tl-2",
          title: "Awaiting Dispatch",
          subtitle: payload.remarks || "Pending vehicle assignment",
          timestamp: "Pending",
          status: "active",
        },
      ],
      shipmentTimeline: [
        {
          id: "st-1",
          title: "Created",
          timestamp: new Date().toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "completed",
        },
        {
          id: "st-2",
          title: "Approved",
          timestamp: "Pending",
          status: "pending",
        },
        {
          id: "st-3",
          title: "Dispatched",
          timestamp: "Pending",
          status: "pending",
        },
        {
          id: "st-4",
          title: "In Transit",
          timestamp: "Expected Arrival",
          status: "pending",
        },
        {
          id: "st-5",
          title: "Delivered",
          timestamp: "Pending",
          status: "pending",
        },
      ],
      documents: [],
      createdAt: new Date().toISOString(),
    };

    return erpDatabase.addTransfer(newTransfer);
  },

  async updateStatus(
    transferId: string,
    status: TransferStatus
  ): Promise<IncomingTransfer | undefined> {
    await delay(200);
    return erpDatabase.updateTransferStatus(transferId, status);
  },

  async receiveTransfer(
    payload: ReceiveTransferPayload,
    receivedBy: string
  ): Promise<MaterialReceivingRecord> {
    await delay(400);
    return erpDatabase.receiveTransfer(payload, receivedBy);
  },

  async getReceivingRecords(): Promise<MaterialReceivingRecord[]> {
    await delay(150);
    return erpDatabase.getLegacyReceivingRecords();
  },

  getSummary() {
    return erpDatabase.getTransfers().summary;
  },

  getDriverDetails(transfer: IncomingTransfer): TransferDriver {
    return transfer.driver;
  },

  getVehicleDetails(transfer: IncomingTransfer): VehicleDetails {
    return buildVehicleDetails(transfer);
  },

  getShipmentTimeline(transfer: IncomingTransfer): ShipmentTimelineItem[] {
    return buildShipmentTimeline(transfer);
  },

  getManifestForTransfer(transfer: IncomingTransfer): ManifestMaterial[] {
    return buildManifest(transfer);
  },
};
