"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useDispatchStore } from "@/store";
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

const createDispatchSchema = z.object({
  orderId: z.string().min(1, "Order is required"),
  customer: z.string().min(1, "Customer is required"),
  vehicle: z.string().min(1, "Vehicle is required"),
  driver: z.string().min(1, "Driver is required"),
  priority: z.enum(["normal", "high", "urgent"]),
  route: z.string().min(1, "Route is required"),
  dispatchTime: z.string().min(1, "Dispatch time is required"),
  remarks: z.string().optional(),
});

type CreateDispatchForm = z.infer<typeof createDispatchSchema>;

export function CreateDispatchModal() {
  const {
    isCreateOpen,
    closeCreateModal,
    createDispatch,
    pendingOrders,
    vehicles,
    drivers,
    routes,
    isSubmitting,
  } = useDispatchStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateDispatchForm>({
    resolver: zodResolver(createDispatchSchema),
    defaultValues: {
      priority: "normal",
      dispatchTime: "14:30",
    },
  });

  useEffect(() => {
    if (isCreateOpen && pendingOrders.length > 0) {
      const first = pendingOrders[0];
      reset({
        orderId: first.id,
        customer: first.customer,
        vehicle: "",
        driver: "",
        priority: "normal",
        route: routes[0]?.via ?? "",
        dispatchTime: "14:30",
        remarks: "",
      });
    }
  }, [isCreateOpen, pendingOrders, routes, reset]);

  const selectedOrderId = watch("orderId");

  useEffect(() => {
    const order = pendingOrders.find((o) => o.id === selectedOrderId);
    if (order) {
      setValue("customer", order.customer);
    }
  }, [selectedOrderId, pendingOrders, setValue]);

  const onSubmit = async (data: CreateDispatchForm) => {
    const order = pendingOrders.find((o) => o.id === data.orderId);
    if (!order) return;

    const [hours, minutes] = data.dispatchTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const timeDisplay = `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;

    await createDispatch({
      orderId: data.orderId,
      orderNo: order.orderNo,
      customer: data.customer,
      vehicle: data.vehicle,
      driver: data.driver,
      priority: data.priority,
      route: data.route,
      dispatchTime: timeDisplay,
      remarks: data.remarks,
    });
    reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCreateModal();
      reset();
    }
  };

  const availableVehicles = vehicles.filter((v) => v.status === "available");
  const availableDrivers = drivers.filter((d) => d.status === "available");

  return (
    <Modal
      open={isCreateOpen}
      onOpenChange={handleOpenChange}
      title="Create Dispatch"
      description="Assign vehicle, driver and route for customer delivery"
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
          <Label>Order</Label>
          <Select
            value={watch("orderId")}
            onValueChange={(v) => setValue("orderId", v)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select order" />
            </SelectTrigger>
            <SelectContent>
              {pendingOrders.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.orderId && (
            <p className="text-xs text-red-500">{errors.orderId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Customer</Label>
          <Input
            className="rounded-xl bg-gray-50"
            {...register("customer")}
            readOnly
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select
              value={watch("vehicle")}
              onValueChange={(v) => setValue("vehicle", v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.registrationNo}>
                    {v.registrationNo}
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
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
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
            <Label>Priority</Label>
            <Select
              value={watch("priority")}
              onValueChange={(v) =>
                setValue("priority", v as CreateDispatchForm["priority"])
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dispatch Time</Label>
            <Input type="time" className="rounded-xl" {...register("dispatchTime")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Route</Label>
          <Select
            value={watch("route")}
            onValueChange={(v) => setValue("route", v)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              {routes.map((r) => (
                <SelectItem key={r.id} value={r.via}>
                  {r.via}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.route && (
            <p className="text-xs text-red-500">{errors.route.message}</p>
          )}
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
            disabled={isSubmitting}
            className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
          >
            {isSubmitting ? "Creating..." : "Create Dispatch"}
          </Button>
        </div>
      </motion.form>
    </Modal>
  );
}
