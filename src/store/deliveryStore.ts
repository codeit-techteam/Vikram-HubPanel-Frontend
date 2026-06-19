import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  DeliveryConfirmation,
  DeliveryRecord,
  DeliveryTracking,
} from "@/types";
import { deliveryService } from "@/services/delivery.service";
import { dispatchService } from "@/services/dispatch.service";
import { ordersService } from "@/services/orders.service";
import { useDashboardStore } from "./dashboardStore";
import { useAnalyticsStore } from "./analyticsStore";
import { useLedgerStore } from "./ledgerStore";

interface DeliveryState {
  deliveries: DeliveryRecord[];
  tracking: DeliveryTracking | null;
  loading: boolean;
  isSubmitting: boolean;
  loadDeliveries: () => Promise<void>;
  loadTracking: (dispatchId: string) => Promise<void>;
  loadDelivery: (dispatchId: string) => Promise<DeliveryRecord | undefined>;
  markDelivered: (
    dispatchId: string,
    payload: {
      otp: string;
      signature?: string;
      photoProof?: string;
      notes?: string;
    }
  ) => Promise<DeliveryConfirmation | undefined>;
  reportIssue: (dispatchId: string, issue: string) => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: [],
  tracking: null,
  loading: false,
  isSubmitting: false,

  loadDeliveries: async () => {
    set({ loading: true });
    const deliveries = await deliveryService.getDeliveries();
    set({ deliveries, loading: false });
  },

  loadTracking: async (dispatchId) => {
    set({ loading: true });
    const tracking = await deliveryService.getTracking(dispatchId);
    set({ tracking: tracking ?? null, loading: false });
  },

  loadDelivery: async (dispatchId) => {
    const delivery = await deliveryService.getDeliveryByDispatchId(dispatchId);
    if (!delivery) {
      const dispatch = await dispatchService.getById(dispatchId);
      if (dispatch) {
        return deliveryService.createDeliveryFromDispatch(dispatch);
      }
    }
    return delivery;
  },

  markDelivered: async (dispatchId, payload) => {
    set({ isSubmitting: true });
    try {
      const confirmation = await deliveryService.confirmDelivery(
        dispatchId,
        payload
      );

      const { record, orderValue } =
        await dispatchService.completeDelivery(dispatchId);

      const order = await ordersService.getOrderById(record.orderNo);
      if (order) {
        await ordersService.updateOrderStatus(order.id, "delivered");
      }

      useDashboardStore.getState().addActivityLog({
        title: `Delivery Completed — ${record.orderNo}`,
        subtitle: `POD generated for ${record.customer}. Revenue updated.`,
        type: "dispatch",
      });

      useDashboardStore.getState().updateDispatchKpis("delivered", orderValue);

      try {
        await useAnalyticsStore.getState().loadAnalytics();
      } catch {
        // analytics refresh is best-effort
      }

      try {
        await useLedgerStore.getState().loadLedger();
      } catch {
        // ledger refresh is best-effort
      }

      set({ isSubmitting: false });
      toast.success(`Delivery confirmed. POD generated for ${record.dispatchNo}`);
      return confirmation;
    } catch (err) {
      set({ isSubmitting: false });
      toast.error(
        err instanceof Error ? err.message : "Failed to confirm delivery"
      );
      return undefined;
    }
  },

  reportIssue: (dispatchId, issue) => {
    toast.success(`Issue reported for ${dispatchId}: ${issue}`);
  },
}));
