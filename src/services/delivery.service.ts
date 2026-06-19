import type {
  DeliveryConfirmation,
  DeliveryRecord,
  DeliveryTracking,
  DispatchRecord,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

export const deliveryService = {
  async getDeliveries(): Promise<DeliveryRecord[]> {
    await delay(200);
    return erpDatabase.getDeliveries();
  },

  async getDeliveryByDispatchId(
    dispatchId: string
  ): Promise<DeliveryRecord | undefined> {
    await delay(150);
    return erpDatabase.getDeliveryByDispatchId(dispatchId);
  },

  async getTracking(dispatchId: string): Promise<DeliveryTracking | undefined> {
    await delay(200);
    const existing = erpDatabase.getTrackingByDispatchId(dispatchId);
    if (existing) return existing;

    const dispatch = erpDatabase.getQueueItemById(dispatchId);
    if (!dispatch) return undefined;

    return {
      dispatchId: dispatch.id,
      dispatchNo: dispatch.dispatchNo,
      currentLocation: "En route from hub",
      origin: "Noida (UP-04) Dark Store #422",
      destination: dispatch.customerDetails.address ?? dispatch.customer,
      eta: dispatch.eta,
      driver: dispatch.driver,
      vehicle: dispatch.vehicle,
      distanceRemaining: "—",
      routeProgress: 25,
      timeline: dispatch.timeline.map((t) => ({
        id: t.id,
        title: t.title,
        timestamp: t.timestamp,
        status: t.status,
      })),
    };
  },

  async createDeliveryFromDispatch(
    dispatch: DispatchRecord
  ): Promise<DeliveryRecord> {
    await delay(150);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const delivery: DeliveryRecord = {
      id: `del-${Date.now()}`,
      dispatchId: dispatch.id,
      dispatchNo: dispatch.dispatchNo,
      orderNo: dispatch.orderNo,
      customerName: dispatch.customer,
      status: dispatch.status,
      otp,
      podGenerated: false,
    };
    return erpDatabase.addDelivery(delivery);
  },

  async confirmDelivery(
    dispatchId: string,
    payload: {
      otp: string;
      signature?: string;
      photoProof?: string;
      notes?: string;
    }
  ): Promise<DeliveryConfirmation> {
    await delay(400);
    const delivery = erpDatabase.getDeliveryByDispatchId(dispatchId);
    const dispatch = erpDatabase.getQueueItemById(dispatchId);
    if (!dispatch) throw new Error("Dispatch not found");

    if (delivery?.otp && payload.otp !== delivery.otp) {
      throw new Error("Invalid OTP. Please verify with customer.");
    }

    const timestamp = new Date().toISOString();
    erpDatabase.updateDelivery(dispatchId, {
      status: "delivered",
      deliveryTimestamp: timestamp,
      podGenerated: true,
      deliveryNotes: payload.notes,
      signature: payload.signature,
      photoProof: payload.photoProof,
    });

    return {
      dispatchId: dispatch.id,
      dispatchNo: dispatch.dispatchNo,
      orderNo: dispatch.orderNo,
      customerName: dispatch.customer,
      deliveryTimestamp: timestamp,
      otp: payload.otp,
    };
  },
};
