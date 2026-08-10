import type {
  DiscrepancyRecord,
  GoodsReceiptNote,
  ReceivingDocument,
  ReceivingMaterialItem,
  ReceivingPhoto,
  ReceivingRecord,
  SubmitDiscrepancyPayload,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { transferService } from "./transfer.service";
import type { IncomingTransfer } from "@/types";
import { mediaService } from "./media.service";

function deriveVerificationStatus(
  receivedQty: number,
  dispatchedQty: number,
  current: ReceivingMaterialItem["verificationStatus"],
): ReceivingMaterialItem["verificationStatus"] {
  if (current === "rejected" || current === "discrepancy") return current;
  if (receivedQty === dispatchedQty) return "verified";
  if (receivedQty < dispatchedQty) return "discrepancy";
  return "pending";
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function transferToReceivingRecord(transfer: IncomingTransfer): ReceivingRecord {
  const isReceived = transfer.status === "received";
  const photos = ((transfer as IncomingTransfer & {
    photos?: ReceivingPhoto[];
  }).photos ?? []).map((p) => ({
    id: p.id,
    name: p.name ?? "Delivery photo",
    url: p.url,
    size: p.size ?? "—",
    uploadedAt: p.uploadedAt ?? formatDate(transfer.createdAt),
  }));

  return {
    id: `rcv-${transfer.id}`,
    transferId: transfer.transferId,
    requisitionId: transfer.requisitionId ?? transfer.id,
    dispatchId: transfer.dispatchId ?? transfer.id,
    inventoryId: transfer.inventoryId ?? "",
    source: transfer.source,
    sourceHub: transfer.source,
    subtitle: `${transfer.source} → ${transfer.destination}`,
    transferNumber: transfer.transferId,
    dispatchDate: formatDate(transfer.dispatchDate ?? transfer.createdAt),
    dispatchTime: formatTime(transfer.dispatchDate ?? transfer.createdAt),
    vehicleNumber: transfer.vehicle,
    driverName: transfer.driver.name,
    status: isReceived ? "received" : "pending_verification",
    materials: transfer.materials.map((m) => {
      const qty =
        parseFloat(String(m.quantity).replace(/[^0-9.]/g, "")) || 0;
      const unit =
        String(m.quantity).replace(/[0-9.,\s]/g, "").trim() || "Units";
      const receivedFromApi =
        typeof (m as { receivedQty?: number }).receivedQty === "number"
          ? (m as { receivedQty?: number }).receivedQty
          : undefined;
      return {
        id: m.id,
        productId: (m as { productId?: string }).productId ?? m.id,
        productName: m.name,
        sku: m.sku ?? "",
        dispatchedQty: qty,
        dispatchedUnit: unit,
        dispatchedDisplay: m.quantity,
        receivedQty: isReceived ? (receivedFromApi ?? qty) : qty,
        verificationStatus: isReceived
          ? ("verified" as const)
          : ("pending" as const),
        inventoryProductId: (m as { productId?: string }).productId ?? m.id,
      };
    }),
    photos,
    documents: (transfer.documents ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      size: d.size,
      uploadedAt: transfer.createdAt,
      url: d.url,
    })),
    grnNumber: isReceived ? `GRN-${transfer.transferId}` : undefined,
  };
}

/** In-memory session cache for photo/doc edits before accept */
const sessionOverrides = new Map<string, ReceivingRecord>();
const sessionDiscrepancies = new Map<string, DiscrepancyRecord[]>();

function getSessionRecord(transferId: string): ReceivingRecord | undefined {
  return sessionOverrides.get(transferId);
}

function setSessionRecord(transferId: string, record: ReceivingRecord) {
  sessionOverrides.set(transferId, record);
}

export const materialReceivingService = {
  async getReceivingDetails(
    transferId: string,
  ): Promise<ReceivingRecord | undefined> {
    const cached = getSessionRecord(transferId);
    if (cached)
      return { ...cached, materials: cached.materials.map((m) => ({ ...m })) };

    const transfer = await transferService.getTransferById(transferId);
    if (!transfer) return undefined;
    const record = transferToReceivingRecord(transfer);
    setSessionRecord(transferId, record);
    return { ...record, materials: record.materials.map((m) => ({ ...m })) };
  },

  async getAllRecords(): Promise<ReceivingRecord[]> {
    const { transfers } = await transferService.getTransfers();
    return transfers.map(transferToReceivingRecord);
  },

  async verifyMaterial(
    transferId: string,
    productId: string,
    action: "accept" | "reject" | "discrepancy",
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;

    const materials = record.materials.map((m) => {
      if (m.productId !== productId && m.id !== productId) return m;
      const status: ReceivingMaterialItem["verificationStatus"] =
        action === "accept"
          ? "verified"
          : action === "reject"
            ? "rejected"
            : "discrepancy";
      return { ...m, verificationStatus: status };
    });

    const updated = { ...record, materials };
    setSessionRecord(transferId, updated);
    return { ...updated, materials: materials.map((m) => ({ ...m })) };
  },

  async updateReceivedQty(
    transferId: string,
    productId: string,
    receivedQty: number,
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;

    const materials = record.materials.map((m) => {
      if (m.productId !== productId && m.id !== productId) return m;
      return {
        ...m,
        receivedQty,
        verificationStatus: deriveVerificationStatus(
          receivedQty,
          m.dispatchedQty,
          m.verificationStatus,
        ),
      };
    });

    const updated = { ...record, materials };
    setSessionRecord(transferId, updated);
    return { ...updated, materials: materials.map((m) => ({ ...m })) };
  },

  async updateDamageQty(
    transferId: string,
    productId: string,
    damageQty: number,
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;

    const materials = record.materials.map((m) => {
      if (m.productId !== productId && m.id !== productId) return m;
      const capped = Math.max(0, Math.min(damageQty, m.receivedQty));
      return { ...m, damageQty: capped };
    });

    const updated = { ...record, materials };
    setSessionRecord(transferId, updated);
    return { ...updated, materials: materials.map((m) => ({ ...m })) };
  },

  async uploadPhoto(
    transferId: string,
    file: File,
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;

    const uploaded = await mediaService.uploadPhoto(file);
    const sizeMb = (uploaded.size / (1024 * 1024)).toFixed(1);
    const photo: ReceivingPhoto = {
      id: `photo-${Date.now()}`,
      name: file.name,
      url: uploaded.publicUrl || uploaded.url,
      size: `${sizeMb} MB`,
      uploadedAt: "Just now",
    };

    const updated = {
      ...record,
      photos: [...record.photos, photo],
    };
    setSessionRecord(transferId, updated);
    return updated;
  },

  async removePhoto(
    transferId: string,
    photoId: string,
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;
    const updated = {
      ...record,
      photos: record.photos.filter((p) => p.id !== photoId),
    };
    setSessionRecord(transferId, updated);
    return updated;
  },

  async uploadDocument(
    transferId: string,
    file: File,
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;

    const uploaded = await mediaService.uploadDocument(file);
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
    const sizeMb = (uploaded.size / (1024 * 1024)).toFixed(1);
    const document: ReceivingDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: ext === "PDF" ? "GRN" : ext,
      size: `${sizeMb} MB`,
      uploadedAt: "Just now",
      url: uploaded.publicUrl || uploaded.url,
    };

    const updated = {
      ...record,
      documents: [...record.documents, document],
    };
    setSessionRecord(transferId, updated);
    return updated;
  },

  async removeDocument(
    transferId: string,
    documentId: string,
  ): Promise<ReceivingRecord | undefined> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) return undefined;
    const updated = {
      ...record,
      documents: record.documents.filter((d) => d.id !== documentId),
    };
    setSessionRecord(transferId, updated);
    return updated;
  },

  async submitDiscrepancy(
    payload: SubmitDiscrepancyPayload,
  ): Promise<DiscrepancyRecord> {
    await this.verifyMaterial(
      payload.transferId,
      payload.productId,
      "discrepancy",
    );
    await this.updateReceivedQty(
      payload.transferId,
      payload.productId,
      payload.receivedQty,
    );

    const record = await this.getReceivingDetails(payload.transferId);
    if (record) {
      const shortage = Math.max(
        0,
        payload.dispatchedQty - payload.receivedQty,
      );
      const materials = record.materials.map((m) => {
        if (m.productId !== payload.productId && m.id !== payload.productId) {
          return m;
        }
        return {
          ...m,
          receivedQty: payload.receivedQty,
          verificationStatus: "discrepancy" as const,
          remarks: payload.remarks,
          discrepancyType: payload.discrepancyType,
          damageQty:
            payload.discrepancyType === "damage" ? shortage : m.damageQty ?? 0,
          missingQty:
            payload.discrepancyType === "shortage" ||
            payload.discrepancyType === "quality_issue"
              ? shortage
              : m.missingQty ?? 0,
        };
      });
      setSessionRecord(payload.transferId, { ...record, materials });
    }

    const disc: DiscrepancyRecord = {
      id: `disc-${Date.now()}`,
      transferId: payload.transferId,
      productId: payload.productId,
      productName: payload.productName,
      dispatchedQty: payload.dispatchedQty,
      receivedQty: payload.receivedQty,
      discrepancyType: payload.discrepancyType,
      remarks: payload.remarks,
      evidenceUrls: payload.evidenceUrls ?? [],
      createdAt: new Date().toISOString(),
    };

    const existing = sessionDiscrepancies.get(payload.transferId) ?? [];
    sessionDiscrepancies.set(payload.transferId, [disc, ...existing]);

    return disc;
  },

  async acceptDelivery(
    transferId: string,
    receivedBy: string,
  ): Promise<{ record: ReceivingRecord; grn: GoodsReceiptNote }> {
    const record = await this.getReceivingDetails(transferId);
    if (!record) throw new Error("Receiving record not found");

    if (record.photos.filter((p) => p.url).length < 1) {
      throw new Error("Upload at least one receiving proof photo before accepting");
    }

    for (const m of record.materials) {
      if (m.receivedQty > m.dispatchedQty) {
        throw new Error(
          `Received qty cannot exceed dispatched qty for ${m.productName}`,
        );
      }
      if (
        m.receivedQty < m.dispatchedQty &&
        !m.remarks?.trim()
      ) {
        throw new Error(
          `Shortage reason required for ${m.productName} before accepting`,
        );
      }
      if (m.verificationStatus === "rejected") {
        throw new Error(
          `Cannot accept delivery with rejected item ${m.productName}`,
        );
      }
      if (
        m.verificationStatus === "pending" &&
        m.receivedQty === m.dispatchedQty
      ) {
        // treat exact match as ok even if not explicitly verified
        continue;
      }
      if (
        m.verificationStatus === "pending" &&
        m.receivedQty !== m.dispatchedQty
      ) {
        throw new Error(
          `Please verify all materials before accepting delivery`,
        );
      }
    }

    const transfer = await transferService.getTransferById(transferId);
    if (!transfer) throw new Error("Transfer not found");

    await api.patch<ApiResponse<unknown>>(
      `/hub/transfers/${encodeURIComponent(transfer.id)}/receive`,
      {
        items: record.materials.map((m) => {
          const shortage = Math.max(0, m.dispatchedQty - m.receivedQty);
          const damageQty = m.damageQty ?? 0;
          const missingQty =
            m.missingQty ??
            (m.discrepancyType === "shortage" ? shortage : 0);
          return {
            itemId: m.id,
            receivedQty: m.receivedQty,
            shortageQty: shortage,
            damageQty,
            missingQty,
            remarks:
              m.remarks?.trim() ||
              (shortage > 0
                ? undefined
                : `Received by ${receivedBy}`),
          };
        }),
        comment: `Accepted delivery by ${receivedBy}`,
        photoUrls: record.photos.map((p) => p.url).filter(Boolean),
        documents: record.documents
          .filter((d) => !!d.url)
          .map((d) => ({
            url: d.url as string,
            name: d.name,
            type: d.type,
            size: d.size,
          })),
      },
    );

    const grn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-${transfer.transferId}`,
      transferId: transfer.transferId,
      requisitionId: transfer.requisitionId ?? transfer.id,
      receivedAt: new Date().toISOString(),
      receivedBy,
      materials: record.materials.map((m) => ({
        ...m,
        verificationStatus: "verified" as const,
      })),
    };

    const completed: ReceivingRecord = {
      ...record,
      status: "received",
      grnNumber: grn.grnNumber,
      materials: record.materials.map((m) => ({
        ...m,
        verificationStatus: "verified",
      })),
    };
    sessionOverrides.delete(transferId);
    sessionDiscrepancies.delete(transferId);

    return { record: completed, grn };
  },

  getShareUrl(transferId: string): string {
    return `/material-receiving/${transferId}`;
  },

  getDiscrepancies(transferId?: string): DiscrepancyRecord[] {
    if (!transferId) return [];
    return sessionDiscrepancies.get(transferId) ?? [];
  },

  getGrnRecords(): GoodsReceiptNote[] {
    return [];
  },
};
