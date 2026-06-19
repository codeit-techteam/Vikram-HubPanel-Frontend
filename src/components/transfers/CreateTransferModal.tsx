"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useTransferStore } from "@/store";
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

const createSchema = z.object({
  sourceWarehouse: z.string().min(1, "Source warehouse is required"),
  destinationHub: z.string().min(1, "Destination hub is required"),
  vehicle: z.string().min(1, "Vehicle is required"),
  driver: z.string().min(1, "Driver is required"),
  expectedDispatchDate: z.string().min(1, "Dispatch date is required"),
  materials: z.string().min(1, "Materials are required"),
  quantity: z.string().min(1, "Quantity is required"),
  priority: z.enum(["normal", "high", "urgent"]),
  remarks: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

const WAREHOUSES = ["Central Warehouse", "North Depot", "East Distribution Hub"];
const HUBS = [
  "Sector 63, Noida (UP-04)",
  "Mumbai Hub 04",
  "Pune Sub-Hub 02",
];
const VEHICLES = ["MH-01-AX-4029", "MH-43-BE-1102", "MH-04-ZZ-3345"];
const DRIVERS = ["Suresh Kumar", "Rajesh Patil", "Amit Shinde"];

export function CreateTransferModal() {
  const { isCreateOpen, closeCreate, createTransfer } = useTransferStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      sourceWarehouse: "Central Warehouse",
      destinationHub: "Sector 63, Noida (UP-04)",
      priority: "normal",
    },
  });

  const onSubmit = async (data: CreateForm) => {
    await createTransfer(data);
    reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCreate();
      reset();
    }
  };

  return (
    <Modal
      open={isCreateOpen}
      onOpenChange={handleOpenChange}
      title="Create Transfer"
      description="Schedule a new material transfer between warehouse and hub."
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Source Warehouse</Label>
            <Select
              value={watch("sourceWarehouse")}
              onValueChange={(v) => setValue("sourceWarehouse", v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSES.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sourceWarehouse && (
              <p className="text-xs text-red-500">{errors.sourceWarehouse.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Destination Hub</Label>
            <Select
              value={watch("destinationHub")}
              onValueChange={(v) => setValue("destinationHub", v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select hub" />
              </SelectTrigger>
              <SelectContent>
                {HUBS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destinationHub && (
              <p className="text-xs text-red-500">{errors.destinationHub.message}</p>
            )}
          </div>
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
                {VEHICLES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
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
                {DRIVERS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.driver && (
              <p className="text-xs text-red-500">{errors.driver.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDispatchDate">Expected Dispatch Date</Label>
          <Input
            id="expectedDispatchDate"
            type="date"
            className="rounded-xl"
            {...register("expectedDispatchDate")}
          />
          {errors.expectedDispatchDate && (
            <p className="text-xs text-red-500">
              {errors.expectedDispatchDate.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="materials">Materials</Label>
            <Input
              id="materials"
              placeholder="e.g. TMT Steel"
              className="rounded-xl"
              {...register("materials")}
            />
            {errors.materials && (
              <p className="text-xs text-red-500">{errors.materials.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              placeholder="e.g. 500"
              className="rounded-xl"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={watch("priority")}
            onValueChange={(v) =>
              setValue("priority", v as CreateForm["priority"])
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
          <Label htmlFor="remarks">Remarks</Label>
          <textarea
            id="remarks"
            placeholder="Optional notes for dispatch team..."
            className="flex min-h-[80px] w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            rows={3}
            {...register("remarks")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Transfer"}
            </Button>
          </motion.div>
        </div>
      </motion.form>
    </Modal>
  );
}
