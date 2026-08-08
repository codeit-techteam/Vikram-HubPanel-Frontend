"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarClock, ClipboardList, Truck } from "lucide-react";
import { useDispatchStore } from "@/store";
import { dispatchService } from "@/services/dispatch.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import toast from "react-hot-toast";
import { formatCurrency } from "@/lib/utils";
import { formatPaymentMethodLabel } from "@/lib/payment-method-labels";

interface DeliverySlot {
  id: string;
  label: string;
  value: string;
  estimatedEtaAt: string;
  available: boolean;
}

export function InitiateDispatchCard() {
  const router = useRouter();
  const {
    pendingOrders,
    vehicles,
    drivers,
    initiateDispatch,
    isSubmitting,
    loadDispatchData,
  } = useDispatchStore();

  const [orderId, setOrderId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [slots, setSlots] = useState<DeliverySlot[]>([]);

  const availableVehicles = vehicles.filter((v) => v.status === "available");
  const availableDrivers = drivers.filter((d) => d.status === "available");

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      try {
        const data = await dispatchService.getDeliverySlots();
        if (!cancelled) {
          setSlots(data.filter((s) => s.available));
          if (data.length > 0) {
            setDeliverySlot((prev) => prev || data[0].value);
          }
        }
      } catch {
        if (!cancelled) setSlots([]);
      }
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (pendingOrders.length > 0 && !orderId) {
      setOrderId(pendingOrders[0].id);
    }
  }, [pendingOrders, orderId]);

  useEffect(() => {
    if (availableVehicles.length > 0 && !vehicleId) {
      setVehicleId(availableVehicles[0].id);
    }
  }, [availableVehicles, vehicleId]);

  useEffect(() => {
    if (availableDrivers.length > 0 && !driverId) {
      setDriverId(availableDrivers[0].id);
    }
  }, [availableDrivers, driverId]);

  const selectedOrder = pendingOrders.find((o) => o.id === orderId);
  const selectedVehicle = availableVehicles.find((v) => v.id === vehicleId);
  const selectedDriver = availableDrivers.find((d) => d.id === driverId);
  const selectedSlot = slots.find((s) => s.value === deliverySlot);

  const summary = useMemo(() => {
    if (!selectedOrder) return null;
    return {
      customer: selectedOrder.customer,
      address: selectedOrder.location || "—",
      orderValue: selectedOrder.orderValue,
      payment: selectedOrder.paymentMethod
        ? formatPaymentMethodLabel(selectedOrder.paymentMethod)
        : selectedOrder.paymentStatus || "—",
      weight: selectedOrder.weight || "—",
      quantity: selectedOrder.totalQuantity ?? selectedOrder.items?.length ?? 0,
      vehicleCapacity: selectedVehicle?.capacity ?? "—",
      eta: selectedSlot
        ? new Date(selectedSlot.estimatedEtaAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : selectedOrder.eta || "—",
      driver: selectedDriver?.name,
      vehicle: selectedVehicle?.registrationNo,
    };
  }, [selectedOrder, selectedVehicle, selectedDriver, selectedSlot]);

  const handleDispatch = async () => {
    if (!orderId || !vehicleId || !driverId || !deliverySlot) {
      toast.error("Please fill all required fields");
      return;
    }
    const record = await initiateDispatch({
      orderId,
      vehicle: vehicleId,
      driver: driverId,
      deliverySlot,
      estimatedEta: selectedSlot?.estimatedEtaAt,
    });
    if (record) {
      setOrderId("");
      setVehicleId("");
      setDriverId("");
      await loadDispatchData();
      router.push(`/dispatch/${record.dispatchNo}`);
    }
  };

  const handleReschedule = () => {
    if (slots.length > 1) {
      const next = slots[Math.min(1, slots.length - 1)];
      setDeliverySlot(next.value);
      toast.success(`Rescheduled to ${next.label}`);
    } else {
      toast.error("No later slots available");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-[#111827]">
            <ClipboardList className="h-5 w-5 text-[#FF6B00]" />
            Dispatch Planning
          </CardTitle>
          <p className="text-xs text-gray-400">
            Allocate pending orders — select order, assign fleet, and dispatch.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Select Pending Order
            </Label>
            <Select value={orderId} onValueChange={setOrderId}>
              <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB]">
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                {pendingOrders.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No pending orders
                  </SelectItem>
                ) : (
                  pendingOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Assign Vehicle
              </Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB]">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available vehicles
                    </SelectItem>
                  ) : (
                    availableVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.registrationNo} ({v.capacity})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-gray-400">
                {availableVehicles.length} available
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Assign Driver
              </Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB]">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {availableDrivers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available drivers
                    </SelectItem>
                  ) : (
                    availableDrivers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.rating} ★)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-gray-400">
                {availableDrivers.length} available
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Delivery Slot
            </Label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Select value={deliverySlot} onValueChange={setDeliverySlot}>
                <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB] pl-10">
                  <SelectValue placeholder="Select slot" />
                </SelectTrigger>
                <SelectContent>
                  {slots.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No slots available
                    </SelectItem>
                  ) : (
                    slots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {summary && (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-xs text-gray-600 space-y-1.5">
              <p className="font-semibold text-[#111827]">Planning Summary</p>
              <p>
                {summary.customer} · {summary.address}
              </p>
              <p>
                {summary.orderValue != null
                  ? formatCurrency(summary.orderValue)
                  : "—"}{" "}
                · {summary.payment}
              </p>
              <p>
                Weight {summary.weight} · Qty {summary.quantity} · Capacity{" "}
                {summary.vehicleCapacity}
              </p>
              <p>
                {summary.vehicle} · {summary.driver} · ETA {summary.eta}
              </p>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <PrimaryButton
              loading={isSubmitting}
              onClick={handleDispatch}
              icon={<Truck className="h-4 w-4" />}
              disabled={
                availableVehicles.length === 0 ||
                availableDrivers.length === 0 ||
                pendingOrders.length === 0 ||
                !deliverySlot
              }
            >
              Dispatch Now
            </PrimaryButton>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-[#E5E7EB] text-sm font-semibold"
              onClick={handleReschedule}
            >
              Reschedule for Tomorrow
            </Button>
          </div>

          {selectedOrder && (
            <p className="text-center text-xs text-gray-400">
              Dispatching to {selectedOrder.customer}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
