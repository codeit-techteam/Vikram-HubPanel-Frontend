"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useOrdersStore } from "@/store";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { driverService } from "@/services/driver.service";
import api from "@/services/axios";
import type { ApiResponse } from "@/types/api";
import type { DispatchDriver } from "@/types";

const dispatchSchema = z.object({
  vehicle: z.string().min(1, "Vehicle is required"),
  driver: z.string().min(1, "Driver is required"),
  dispatchDate: z.string().min(1, "Dispatch date is required"),
  expectedDeliveryTime: z.string().min(1, "Expected delivery time is required"),
  priority: z.enum(["normal", "high", "urgent"]),
  remarks: z.string().optional(),
});

type DispatchForm = z.infer<typeof dispatchSchema>;

interface HubVehicleOption {
  id: string;
  registration: string;
  vehicleType?: string;
  status?: string;
}

export function CreateDispatchModal() {
  const {
    isDispatchOpen,
    closeDispatch,
    dispatchOrderId,
    selectedOrder,
    createDispatch,
  } = useOrdersStore();

  const [drivers, setDrivers] = useState<DispatchDriver[]>([]);
  const [vehicles, setVehicles] = useState<HubVehicleOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DispatchForm>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: {
      dispatchDate: new Date().toISOString().split("T")[0],
      priority: "normal",
    },
  });

  useEffect(() => {
    if (!isDispatchOpen) return;

    reset({
      vehicle: "",
      driver: "",
      dispatchDate: new Date().toISOString().split("T")[0],
      expectedDeliveryTime: "",
      priority: "normal",
      remarks: "",
    });

    let cancelled = false;
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [driverRows, vehicleRes] = await Promise.all([
          driverService.getDrivers(),
          api.get<ApiResponse<{ data: HubVehicleOption[] } | HubVehicleOption[]>>(
            "/hub/vehicles",
            { params: { page: 1, limit: 100 } },
          ),
        ]);
        if (cancelled) return;
        setDrivers(driverRows.filter((d) => d.status === "available" || d.status === "on_trip"));
        const vehiclePayload = vehicleRes.data.data;
        const vehicleRows = Array.isArray(vehiclePayload)
          ? vehiclePayload
          : vehiclePayload?.data ?? [];
        setVehicles(vehicleRows);
      } catch {
        if (!cancelled) {
          setDrivers([]);
          setVehicles([]);
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    void loadOptions();
    return () => {
      cancelled = true;
    };
  }, [isDispatchOpen, reset]);

  const onSubmit = async (data: DispatchForm) => {
    if (!dispatchOrderId) return;
    await createDispatch({
      orderId: dispatchOrderId,
      ...data,
    });
    reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDispatch();
      reset();
    }
  };

  return (
    <Modal
      open={isDispatchOpen}
      onOpenChange={handleOpenChange}
      title="Assign Driver & Dispatch"
      description={
        selectedOrder
          ? `Dispatch order ${selectedOrder.orderNo} to ${selectedOrder.location}`
          : "Assign vehicle and driver for delivery"
      }
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Order ID</Label>
          <Input
            value={selectedOrder?.orderNo ?? ""}
            disabled
            className="rounded-xl bg-gray-50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select
              value={watch("vehicle")}
              onValueChange={(v) => setValue("vehicle", v)}
              disabled={loadingOptions}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={loadingOptions ? "Loading…" : "Select vehicle"} />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.registration}
                    {v.vehicleType ? ` (${v.vehicleType})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicle && (
              <p className="text-xs text-red-500">{errors.vehicle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Driver</Label>
            <Select
              value={watch("driver")}
              onValueChange={(v) => setValue("driver", v)}
              disabled={loadingOptions}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={loadingOptions ? "Loading…" : "Select driver"} />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.availability}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.driver && (
              <p className="text-xs text-red-500">{errors.driver.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Dispatch Date</Label>
            <Input
              type="date"
              className="rounded-xl"
              {...register("dispatchDate")}
            />
            {errors.dispatchDate && (
              <p className="text-xs text-red-500">
                {errors.dispatchDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Expected Delivery Time</Label>
            <Input
              type="datetime-local"
              className="rounded-xl"
              {...register("expectedDeliveryTime")}
            />
            {errors.expectedDeliveryTime && (
              <p className="text-xs text-red-500">
                {errors.expectedDeliveryTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={watch("priority")}
            onValueChange={(v) =>
              setValue("priority", v as DispatchForm["priority"])
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Remarks</Label>
          <textarea
            placeholder="Optional delivery instructions..."
            className="flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            {...register("remarks")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loadingOptions || drivers.length === 0}
            className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
          >
            {isSubmitting ? "Dispatching..." : "Assign & Dispatch"}
          </Button>
        </div>
      </motion.form>
    </Modal>
  );
}
