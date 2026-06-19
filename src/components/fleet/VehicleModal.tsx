"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFleetStore, useDriverStore } from "@/store";
import type { DispatchVehicle } from "@/types";

const addVehicleSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  type: z.string().min(1, "Vehicle type is required"),
  capacity: z.string().min(1, "Capacity is required"),
  fuelType: z.string().optional(),
  registrationNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  insuranceNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  fitnessExpiry: z.string().optional(),
  assignedHub: z.string().optional(),
  gpsEnabled: z.boolean().optional(),
  remarks: z.string().optional(),
});

const editVehicleSchema = z.object({
  capacity: z.string().min(1, "Capacity is required"),
  status: z.enum([
    "available",
    "assigned",
    "in_transit",
    "maintenance",
    "inactive",
  ]),
  assignedDriverId: z.string().optional(),
  remarks: z.string().optional(),
});

type AddVehicleForm = z.infer<typeof addVehicleSchema>;
type EditVehicleForm = z.infer<typeof editVehicleSchema>;

export function VehicleModal() {
  const {
    isModalOpen,
    editingVehicle,
    closeModal,
    addVehicle,
    updateVehicle,
    submitting,
  } = useFleetStore();
  const { drivers, loadDrivers } = useDriverStore();
  const isEdit = !!editingVehicle;

  const addForm = useForm<AddVehicleForm>({
    resolver: zodResolver(addVehicleSchema),
    defaultValues: {
      gpsEnabled: true,
      fuelType: "Diesel",
      assignedHub: "Noida Dark Store #422",
    },
  });

  const editForm = useForm<EditVehicleForm>({
    resolver: zodResolver(editVehicleSchema),
    defaultValues: {
      status: "available",
    },
  });

  useEffect(() => {
    if (isModalOpen) loadDrivers();
  }, [isModalOpen, loadDrivers]);

  useEffect(() => {
    if (isEdit && editingVehicle) {
      editForm.reset({
        capacity: editingVehicle.capacity,
        status: editingVehicle.status,
        assignedDriverId: editingVehicle.driverId ?? "",
        remarks: editingVehicle.remarks ?? "",
      });
    } else if (isModalOpen && !isEdit) {
      addForm.reset({
        vehicleNumber: "",
        type: "Heavy Truck",
        capacity: "",
        fuelType: "Diesel",
        registrationNumber: "",
        rcNumber: "",
        insuranceNumber: "",
        insuranceExpiry: "",
        fitnessExpiry: "",
        assignedHub: "Noida Dark Store #422",
        gpsEnabled: true,
        remarks: "",
      });
    }
  }, [isEdit, editingVehicle, isModalOpen, addForm, editForm]);

  const handleAddSubmit = async (data: AddVehicleForm) => {
    await addVehicle(data);
    addForm.reset();
  };

  const handleEditSubmit = async (data: EditVehicleForm) => {
    if (!editingVehicle) return;
    const driver = drivers.find((d) => d.id === data.assignedDriverId);
    await updateVehicle(editingVehicle.id, {
      capacity: data.capacity,
      status: data.status,
      assignedDriver: driver?.name ?? editingVehicle.assignedDriver,
      driverId: driver?.id,
      remarks: data.remarks,
    });
    editForm.reset();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
      addForm.reset();
      editForm.reset();
    }
  };

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={handleOpenChange}
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      description={
        isEdit
          ? "Update capacity, status, assigned driver, and documents"
          : "Register a new vehicle in the fleet"
      }
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      {isEdit ? (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={editForm.handleSubmit(handleEditSubmit)}
          className="space-y-4"
        >
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-400">Vehicle: </span>
            <span className="font-semibold">
              {editingVehicle?.vehicleNumber ?? editingVehicle?.registrationNo}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                {...editForm.register("capacity")}
                className="h-11 rounded-xl"
              />
              {editForm.formState.errors.capacity && (
                <p className="text-xs text-red-500">
                  {editForm.formState.errors.capacity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.watch("status")}
                onValueChange={(v) =>
                  editForm.setValue(
                    "status",
                    v as DispatchVehicle["status"]
                  )
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned Driver</Label>
            <Select
              value={editForm.watch("assignedDriverId") ?? ""}
              onValueChange={(v) => editForm.setValue("assignedDriverId", v)}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              {...editForm.register("remarks")}
              className="rounded-xl"
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DocumentUpload label="Upload RC Document" />
            <DocumentUpload label="Upload Insurance Document" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              {submitting ? "Saving..." : "Save Vehicle"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.form>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addForm.handleSubmit(handleAddSubmit)}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Vehicle Number" error={addForm.formState.errors.vehicleNumber?.message}>
              <Input {...addForm.register("vehicleNumber")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Vehicle Type" error={addForm.formState.errors.type?.message}>
              <Select
                value={addForm.watch("type")}
                onValueChange={(v) => addForm.setValue("type", v)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Heavy Truck">Heavy Truck</SelectItem>
                  <SelectItem value="Medium Truck">Medium Truck</SelectItem>
                  <SelectItem value="Light Truck">Light Truck</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Capacity" error={addForm.formState.errors.capacity?.message}>
              <Input {...addForm.register("capacity")} placeholder="12/15T" className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Fuel Type">
              <Select
                value={addForm.watch("fuelType")}
                onValueChange={(v) => addForm.setValue("fuelType", v)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Registration Number">
              <Input {...addForm.register("registrationNumber")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="RC Number">
              <Input {...addForm.register("rcNumber")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Insurance Number">
              <Input {...addForm.register("insuranceNumber")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Insurance Expiry">
              <Input type="date" {...addForm.register("insuranceExpiry")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Fitness Expiry">
              <Input type="date" {...addForm.register("fitnessExpiry")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Assigned Hub">
              <Input {...addForm.register("assignedHub")} className="h-11 rounded-xl" />
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
            <Label>GPS Enabled</Label>
            <Switch
              checked={addForm.watch("gpsEnabled") ?? false}
              onCheckedChange={(v) => addForm.setValue("gpsEnabled", v)}
            />
          </div>

          <FormField label="Remarks">
            <Textarea {...addForm.register("remarks")} className="rounded-xl" rows={2} />
          </FormField>

          <div className="grid gap-3 sm:grid-cols-2">
            <DocumentUpload label="Upload RC Document" />
            <DocumentUpload label="Upload Insurance Document" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              {submitting ? "Saving..." : "Save Vehicle"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.form>
      )}
    </Modal>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function DocumentUpload({ label }: { label: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] px-4 py-6 text-center hover:border-[#FF6B00]/50 hover:bg-orange-50/30">
      <Upload className="mb-2 h-5 w-5 text-gray-400" />
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
    </label>
  );
}
