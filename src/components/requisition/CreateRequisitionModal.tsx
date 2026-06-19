"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useRequisitionStore } from "@/store";
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
  requestTitle: z.string().min(1, "Request title is required"),
  materialCategory: z.string().min(1, "Category is required"),
  materialName: z.string().min(1, "Material name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  remarks: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

const CATEGORIES = [
  "Cement & Concrete",
  "Steel & Metal",
  "Bricks & Blocks",
  "Electrical",
  "Plumbing",
  "Paint & Finishing",
];

const UNITS = ["Bags", "Tons", "Units", "Meters", "Liters", "Sheets", "Rolls"];

export function CreateRequisitionModal() {
  const { isCreateModalOpen, closeCreateModal, createRequest } =
    useRequisitionStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { priority: "medium", unit: "Bags" },
  });

  const onSubmit = async (data: CreateForm) => {
    try {
      await createRequest(data);
      toast.success("Requisition submitted successfully");
      reset();
    } catch {
      toast.error("Failed to submit requisition");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCreateModal();
      reset();
    }
  };

  return (
    <AnimatePresence>
      {isCreateModalOpen && (
        <Modal
          open={isCreateModalOpen}
          onOpenChange={handleOpenChange}
          title="Create Requisition"
          description="Submit a new material requisition request"
          className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        >
          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="requestTitle">Request Title</Label>
              <Input
                id="requestTitle"
                placeholder="e.g. Cement restock for West hub"
                {...register("requestTitle")}
              />
              {errors.requestTitle && (
                <p className="text-xs text-red-500">
                  {errors.requestTitle.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Material Category</Label>
                <Select
                  value={watch("materialCategory")}
                  onValueChange={(v) => setValue("materialCategory", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.materialCategory && (
                  <p className="text-xs text-red-500">
                    {errors.materialCategory.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialName">Material Name</Label>
                <Input
                  id="materialName"
                  placeholder="e.g. OPC Cement 53 Grade"
                  {...register("materialName")}
                />
                {errors.materialName && (
                  <p className="text-xs text-red-500">
                    {errors.materialName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={watch("unit")}
                  onValueChange={(v) => setValue("unit", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-xs text-red-500">{errors.unit.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(v) =>
                    setValue("priority", v as CreateForm["priority"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">
                  Expected Delivery Date
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  {...register("expectedDeliveryDate")}
                />
                {errors.expectedDeliveryDate && (
                  <p className="text-xs text-red-500">
                    {errors.expectedDeliveryDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                placeholder="Additional notes (optional)"
                {...register("remarks")}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </motion.form>
        </Modal>
      )}
    </AnimatePresence>
  );
}
