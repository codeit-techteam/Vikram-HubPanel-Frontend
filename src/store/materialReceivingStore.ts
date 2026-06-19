import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  DiscrepancyRecord,
  ReceivingDocument,
  ReceivingMaterialItem,
  ReceivingPhoto,
  ReceivingRecord,
  SubmitDiscrepancyPayload,
} from "@/types";
import { materialReceivingService } from "@/services/materialReceiving.service";
import { useInventoryStore } from "./inventoryStore";
import { useDashboardStore } from "./dashboardStore";
import { useTransferStore } from "./transferStore";

interface MaterialReceivingState {
  receivingRecord: ReceivingRecord | null;
  verifiedItems: Record<string, ReceivingMaterialItem["verificationStatus"]>;
  photos: ReceivingPhoto[];
  documents: ReceivingDocument[];
  discrepancies: DiscrepancyRecord[];
  loading: boolean;
  submitting: boolean;
  isDiscrepancyOpen: boolean;
  isGatePassOpen: boolean;
  isShareOpen: boolean;
  shareUrl: string;
  selectedDiscrepancyItem: ReceivingMaterialItem | null;
  loadReceivingDetails: (transferId: string) => Promise<void>;
  updateReceivedQty: (productId: string, qty: number) => Promise<void>;
  verifyMaterial: (
    productId: string,
    action: "accept" | "reject" | "discrepancy"
  ) => Promise<void>;
  addPhoto: (file: File) => Promise<void>;
  removePhoto: (photoId: string) => Promise<void>;
  addDocument: (file: File) => Promise<void>;
  removeDocument: (documentId: string) => Promise<void>;
  acceptDelivery: () => Promise<boolean>;
  submitDiscrepancy: (payload: SubmitDiscrepancyPayload) => Promise<void>;
  openDiscrepancy: (item?: ReceivingMaterialItem) => void;
  closeDiscrepancy: () => void;
  openGatePass: () => void;
  closeGatePass: () => void;
  openShare: () => void;
  closeShare: () => void;
}

function syncFromRecord(record: ReceivingRecord) {
  const verifiedItems: Record<
    string,
    ReceivingMaterialItem["verificationStatus"]
  > = {};
  record.materials.forEach((m) => {
    verifiedItems[m.productId] = m.verificationStatus;
  });
  return {
    receivingRecord: record,
    verifiedItems,
    photos: record.photos,
    documents: record.documents,
  };
}

export const useMaterialReceivingStore = create<MaterialReceivingState>(
  (set, get) => ({
    receivingRecord: null,
    verifiedItems: {},
    photos: [],
    documents: [],
    discrepancies: [],
    loading: false,
    submitting: false,
    isDiscrepancyOpen: false,
    isGatePassOpen: false,
    isShareOpen: false,
    shareUrl: "",
    selectedDiscrepancyItem: null,

    loadReceivingDetails: async (transferId) => {
      set({ loading: true });
      const record =
        await materialReceivingService.getReceivingDetails(transferId);
      if (!record) {
        set({ loading: false, receivingRecord: null });
        return;
      }
      const discrepancies =
        materialReceivingService.getDiscrepancies(transferId);
      set({
        ...syncFromRecord(record),
        discrepancies,
        shareUrl: materialReceivingService.getShareUrl(transferId),
        loading: false,
      });
    },

    updateReceivedQty: async (productId, qty) => {
      const { receivingRecord } = get();
      if (!receivingRecord) return;

      const record = await materialReceivingService.updateReceivedQty(
        receivingRecord.transferId,
        productId,
        qty
      );
      if (record) set(syncFromRecord(record));
    },

    verifyMaterial: async (productId, action) => {
      const { receivingRecord } = get();
      if (!receivingRecord) return;

      const record = await materialReceivingService.verifyMaterial(
        receivingRecord.transferId,
        productId,
        action
      );
      if (record) {
        set(syncFromRecord(record));
        if (action === "accept") {
          toast.success("Item verified successfully");
        } else if (action === "reject") {
          toast.error("Item rejected");
        }
      }
    },

    addPhoto: async (file) => {
      const { receivingRecord } = get();
      if (!receivingRecord) return;

      const url = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const record = await materialReceivingService.uploadPhoto(
        receivingRecord.transferId,
        {
          name: file.name,
          url,
          size: `${sizeMb} MB`,
          uploadedAt: "Just now",
        }
      );
      if (record) {
        set(syncFromRecord(record));
        toast.success("Photo uploaded");
      }
    },

    removePhoto: async (photoId) => {
      const { receivingRecord } = get();
      if (!receivingRecord) return;

      const record = await materialReceivingService.removePhoto(
        receivingRecord.transferId,
        photoId
      );
      if (record) set(syncFromRecord(record));
    },

    addDocument: async (file) => {
      const { receivingRecord } = get();
      if (!receivingRecord) return;

      const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const record = await materialReceivingService.uploadDocument(
        receivingRecord.transferId,
        {
          name: file.name,
          type: ext,
          size: `${sizeMb} MB`,
          uploadedAt: "Just now",
        }
      );
      if (record) {
        set(syncFromRecord(record));
        toast.success("Document uploaded");
      }
    },

    removeDocument: async (documentId) => {
      const { receivingRecord } = get();
      if (!receivingRecord) return;

      const record = await materialReceivingService.removeDocument(
        receivingRecord.transferId,
        documentId
      );
      if (record) set(syncFromRecord(record));
    },

    acceptDelivery: async () => {
      const { receivingRecord } = get();
      if (!receivingRecord) return false;

      const blocked = receivingRecord.materials.filter(
        (m) =>
          m.verificationStatus === "rejected" ||
          m.verificationStatus === "discrepancy" ||
          m.verificationStatus === "pending" ||
          m.receivedQty <= 0
      );

      if (blocked.length > 0) {
        toast.error(
          "Please verify all materials with matching quantities before accepting delivery"
        );
        return false;
      }

      set({ submitting: true });
      try {
        const { currentUser } = (
          await import("./userStore")
        ).useUserStore.getState();

        const { record, grn } = await materialReceivingService.acceptDelivery(
          receivingRecord.transferId,
          currentUser.name
        );

        await useInventoryStore.getState().loadInventory();

        useDashboardStore.getState().addActivityLog({
          title: `Delivery Accepted — ${record.transferId}`,
          subtitle: `GRN ${grn.grnNumber} created · Inventory updated`,
          type: "gate",
        });

        useDashboardStore.getState().updateIncomingTransfersKpi();

        const transferState = useTransferStore.getState();
        const dbTransfer = (
          await import("@/services/erpDatabase")
        ).erpDatabase.getTransferById(record.transferId);
        const updatedTransfers = transferState.transfers.map((t) =>
          t.transferId === record.transferId
            ? {
                ...t,
                status: "received" as const,
                etaDisplay: "Delivered",
                timeline: dbTransfer?.timeline ?? t.timeline,
              }
            : t
        );
        useTransferStore.setState({
          transfers: updatedTransfers,
          filteredTransfers: updatedTransfers,
        });

        set({
          ...syncFromRecord(record),
          submitting: false,
        });

        toast.success("Delivery accepted. Inventory updated successfully.");
        return true;
      } catch {
        set({ submitting: false });
        toast.error("Failed to accept delivery");
        return false;
      }
    },

    submitDiscrepancy: async (payload) => {
      set({ submitting: true });
      try {
        const record =
          await materialReceivingService.submitDiscrepancy(payload);

        useDashboardStore.getState().addActivityLog({
          title: `Discrepancy Reported — ${payload.transferId}`,
          subtitle: `${payload.productName}: ${payload.discrepancyType} · Procurement notified`,
          type: "alert",
        });

        const { receivingRecord } = get();
        if (receivingRecord) {
          const updated =
            await materialReceivingService.getReceivingDetails(
              receivingRecord.transferId
            );
          if (updated) {
            set({
              ...syncFromRecord(updated),
              discrepancies: [
                record,
                ...get().discrepancies,
              ],
              isDiscrepancyOpen: false,
              selectedDiscrepancyItem: null,
              submitting: false,
            });
          }
        }

        toast.success("Discrepancy submitted. Procurement team notified.");
      } catch {
        set({ submitting: false });
        toast.error("Failed to submit discrepancy");
      }
    },

    openDiscrepancy: (item) =>
      set({ isDiscrepancyOpen: true, selectedDiscrepancyItem: item ?? null }),

    closeDiscrepancy: () =>
      set({ isDiscrepancyOpen: false, selectedDiscrepancyItem: null }),

    openGatePass: () => set({ isGatePassOpen: true }),
    closeGatePass: () => set({ isGatePassOpen: false }),

    openShare: () => {
      const { receivingRecord } = get();
      if (receivingRecord) {
        set({
          isShareOpen: true,
          shareUrl: materialReceivingService.getShareUrl(
            receivingRecord.transferId
          ),
        });
      }
    },
    closeShare: () => set({ isShareOpen: false }),
  })
);
