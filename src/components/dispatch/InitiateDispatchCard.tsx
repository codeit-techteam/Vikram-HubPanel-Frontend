"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarClock, ClipboardList, Truck } from "lucide-react";
import { useDispatchStore, useFleetStore, useDriverStore } from "@/store";
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
import { Input } from "@/components/ui/input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import toast from "react-hot-toast";

export function InitiateDispatchCard() {
  const router = useRouter();
  const { pendingOrders, initiateDispatch, isSubmitting } = useDispatchStore();
  const {
    getAvailableVehicles,
    loadFleet,
    vehicles: fleetVehicles,
  } = useFleetStore();
  const {
    getAvailableDrivers,
    loadDrivers,
    drivers: fleetDrivers,
  } = useDriverStore();

  const [orderId, setOrderId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [driver, setDriver] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("14:30");

  useEffect(() => {
    loadFleet();
    loadDrivers();
  }, [loadFleet, loadDrivers]);

  const availableVehicles = getAvailableVehicles();
  const availableDrivers = getAvailableDrivers();

  useEffect(() => {
    if (pendingOrders.length > 0 && !orderId) {
      setOrderId(pendingOrders[0].id);
    }
  }, [pendingOrders, orderId]);

  useEffect(() => {
    if (availableVehicles.length > 0 && !vehicle) {
      setVehicle(availableVehicles[0].registrationNo);
    }
  }, [availableVehicles, vehicle]);

  useEffect(() => {
    if (availableDrivers.length > 0 && !driver) {
      setDriver(availableDrivers[0].name);
    }
  }, [availableDrivers, driver]);

  const selectedOrder = pendingOrders.find((o) => o.id === orderId);

  const handleDispatch = async () => {
    if (!orderId || !vehicle || !driver) {
      toast.error("Please fill all required fields");
      return;
    }
    const slotDisplay = formatTimeDisplay(deliverySlot);
    const record = await initiateDispatch({
      orderId,
      vehicle,
      driver,
      deliverySlot: slotDisplay,
    });
    if (record) {
      await Promise.all([loadFleet(), loadDrivers()]);
      router.push(`/dispatch/${record.dispatchNo}`);
    }
  };

  const handleReschedule = () => {
    toast.success("Dispatch rescheduled for tomorrow at 02:30 PM");
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
                {pendingOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Assign Vehicle
              </Label>
              <Select value={vehicle} onValueChange={setVehicle}>
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
                      <SelectItem key={v.id} value={v.registrationNo}>
                        {v.registrationNo} ({v.capacity})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-gray-400">
                {fleetVehicles.filter((v) => v.status === "available").length}{" "}
                available
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Assign Driver
              </Label>
              <Select value={driver} onValueChange={setDriver}>
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
                      <SelectItem key={d.id} value={d.name}>
                        {d.name} ({d.rating} ★)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-gray-400">
                {fleetDrivers.filter((d) => d.status === "available").length}{" "}
                available
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Delivery Slot
            </Label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="time"
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
                className="h-11 rounded-xl border-[#E5E7EB] pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <PrimaryButton
              loading={isSubmitting}
              onClick={handleDispatch}
              icon={<Truck className="h-4 w-4" />}
              disabled={
                availableVehicles.length === 0 || availableDrivers.length === 0
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

function formatTimeDisplay(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
}
