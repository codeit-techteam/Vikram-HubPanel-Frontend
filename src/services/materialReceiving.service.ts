import type {
  DiscrepancyRecord,
  GoodsReceiptNote,
  MaterialReceivingItem,
  ReceivingDocument,
  ReceivingMaterialItem,
  ReceivingPhoto,
  ReceivingRecord,
  SubmitDiscrepancyPayload,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

function cloneRecord(record: ReceivingRecord): ReceivingRecord {
  return {
    ...record,
    materials: record.materials.map((m) => ({ ...m })),
    photos: record.photos.map((p) => ({ ...p })),
    documents: record.documents.map((d) => ({ ...d })),
  };
}

function deriveVerificationStatus(
  receivedQty: number,
  dispatchedQty: number,
  current: ReceivingMaterialItem["verificationStatus"]
): ReceivingMaterialItem["verificationStatus"] {
  if (current === "rejected" || current === "discrepancy") return current;
  if (receivedQty === dispatchedQty) return "verified";
  return "pending";
}

function toMaterialReceivingItems(
  materials: ReceivingMaterialItem[]
): MaterialReceivingItem[] {
  return materials.map((m) => ({
    materialId: m.inventoryProductId,
    materialName: m.productName,
    expectedQuantity: m.dispatchedDisplay,
    quantityReceived: m.receivedQty,
    damageQuantity: 0,
  }));
}

export const materialReceivingService = {
  async getReceivingDetails(
    transferId: string
  ): Promise<ReceivingRecord | undefined> {
    await delay(250);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    return record ? cloneRecord(record) : undefined;
  },

  async getAllRecords(): Promise<ReceivingRecord[]> {
    await delay(150);
    return erpDatabase.getReceivingRecords();
  },

  async verifyMaterial(
    transferId: string,
    productId: string,
    action: "accept" | "reject" | "discrepancy"
  ): Promise<ReceivingRecord | undefined> {
    await delay(150);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    if (!record) return undefined;

    const materials = record.materials.map((m) => {
      if (m.productId !== productId) return m;
      const status: ReceivingMaterialItem["verificationStatus"] =
        action === "accept"
          ? "verified"
          : action === "reject"
            ? "rejected"
            : "discrepancy";
      return { ...m, verificationStatus: status };
    });

    const updated = { ...record, materials };
    erpDatabase.updateReceivingRecord(transferId, updated);
    return cloneRecord(updated);
  },

  async updateReceivedQty(
    transferId: string,
    productId: string,
    receivedQty: number
  ): Promise<ReceivingRecord | undefined> {
    await delay(100);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    if (!record) return undefined;

    const materials = record.materials.map((m) => {
      if (m.productId !== productId) return m;
      return {
        ...m,
        receivedQty,
        verificationStatus: deriveVerificationStatus(
          receivedQty,
          m.dispatchedQty,
          m.verificationStatus
        ),
      };
    });

    const updated = { ...record, materials };
    erpDatabase.updateReceivingRecord(transferId, updated);
    return cloneRecord(updated);
  },

  async uploadPhoto(
    transferId: string,
    photo: Omit<ReceivingPhoto, "id">
  ): Promise<ReceivingRecord | undefined> {
    await delay(200);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    if (!record) return undefined;

    const newPhoto: ReceivingPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
    };

    const updated = {
      ...record,
      photos: [...record.photos, newPhoto],
    };
    erpDatabase.updateReceivingRecord(transferId, updated);
    return cloneRecord(updated);
  },

  async removePhoto(
    transferId: string,
    photoId: string
  ): Promise<ReceivingRecord | undefined> {
    await delay(100);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    if (!record) return undefined;

    const updated = {
      ...record,
      photos: record.photos.filter((p) => p.id !== photoId),
    };
    erpDatabase.updateReceivingRecord(transferId, updated);
    return cloneRecord(updated);
  },

  async uploadDocument(
    transferId: string,
    document: Omit<ReceivingDocument, "id">
  ): Promise<ReceivingRecord | undefined> {
    await delay(200);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    if (!record) return undefined;

    const newDoc: ReceivingDocument = {
      ...document,
      id: `doc-${Date.now()}`,
    };

    const updated = {
      ...record,
      documents: [...record.documents, newDoc],
    };
    erpDatabase.updateReceivingRecord(transferId, updated);
    return cloneRecord(updated);
  },

  async removeDocument(
    transferId: string,
    documentId: string
  ): Promise<ReceivingRecord | undefined> {
    await delay(100);
    const record = erpDatabase.getReceivingByTransferId(transferId);
    if (!record) return undefined;

    const updated = {
      ...record,
      documents: record.documents.filter((d) => d.id !== documentId),
    };
    erpDatabase.updateReceivingRecord(transferId, updated);
    return cloneRecord(updated);
  },

  async submitDiscrepancy(
    payload: SubmitDiscrepancyPayload
  ): Promise<DiscrepancyRecord> {
    await delay(350);

    const record: DiscrepancyRecord = {
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

    erpDatabase.addDiscrepancy(record);

    const receivingRecord = erpDatabase.getReceivingByTransferId(
      payload.transferId
    );
    if (receivingRecord) {
      const updated = {
        ...receivingRecord,
        status: "verification_pending" as const,
        materials: receivingRecord.materials.map((m) =>
          m.productId === payload.productId
            ? { ...m, verificationStatus: "discrepancy" as const }
            : m
        ),
      };
      erpDatabase.updateReceivingRecord(payload.transferId, updated);
    }

    erpDatabase.updateTransferStatus(payload.transferId, "dispatched");

    return record;
  },

  async acceptDelivery(
    transferId: string,
    receivedBy: string
  ): Promise<{ record: ReceivingRecord; grn: GoodsReceiptNote }> {
    await delay(450);
    const result = erpDatabase.acceptReceivingDelivery(transferId, receivedBy);
    return {
      record: cloneRecord(result.record),
      grn: result.grn,
    };
  },

  getShareUrl(transferId: string): string {
    return `https://hubops.local/receiving/${transferId}`;
  },

  getDiscrepancies(transferId?: string): DiscrepancyRecord[] {
    return erpDatabase.getDiscrepancies(transferId);
  },

  getGrnRecords(): GoodsReceiptNote[] {
    return erpDatabase.getGrnRecords();
  },
};
