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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDriverStore } from "@/store";
import type { DispatchDriver } from "@/types";

const addDriverSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  alternateMobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  bloodGroup: z.string().optional(),
  joiningDate: z.string().optional(),
  assignedHub: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

const editDriverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().optional(),
  status: z.enum(["available", "assigned", "on_trip", "on_leave", "inactive"]),
  rating: z.number().min(1).max(5),
});

type AddDriverForm = z.infer<typeof addDriverSchema>;
type EditDriverForm = z.infer<typeof editDriverSchema>;

export function DriverModal() {
  const {
    isModalOpen,
    editingDriver,
    closeModal,
    addDriver,
    updateDriver,
    submitting,
  } = useDriverStore();
  const isEdit = !!editingDriver;

  const addForm = useForm<AddDriverForm>({
    resolver: zodResolver(addDriverSchema),
    defaultValues: {
      assignedHub: "Noida Dark Store #422",
      bloodGroup: "O+",
      rating: 4.0,
    },
  });

  const editForm = useForm<EditDriverForm>({
    resolver: zodResolver(editDriverSchema),
    defaultValues: {
      status: "available",
      rating: 4.0,
    },
  });

  useEffect(() => {
    if (isEdit && editingDriver) {
      editForm.reset({
        name: editingDriver.name,
        mobile: editingDriver.mobile ?? editingDriver.phone ?? "",
        licenseNumber:
          editingDriver.licenseNumber ?? editingDriver.licenseNo ?? "",
        licenseExpiry: editingDriver.licenseExpiry ?? "",
        status: editingDriver.status,
        rating: editingDriver.rating,
      });
    } else if (isModalOpen && !isEdit) {
      addForm.reset({
        name: "",
        mobile: "",
        alternateMobile: "",
        email: "",
        licenseNumber: "",
        licenseExpiry: "",
        address: "",
        emergencyContactName: "",
        emergencyContactNumber: "",
        bloodGroup: "O+",
        joiningDate: "",
        assignedHub: "Noida Dark Store #422",
        rating: 4.0,
      });
    }
  }, [isEdit, editingDriver, isModalOpen, addForm, editForm]);

  const handleAddSubmit = async (data: AddDriverForm) => {
    await addDriver(data);
    addForm.reset();
  };

  const handleEditSubmit = async (data: EditDriverForm) => {
    if (!editingDriver) return;
    await updateDriver(editingDriver.id, data);
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
      title={isEdit ? "Edit Driver" : "Add Driver"}
      description={
        isEdit
          ? "Update driver details, status, and documents"
          : "Register a new driver in the fleet"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" error={editForm.formState.errors.name?.message}>
              <Input {...editForm.register("name")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Mobile Number" error={editForm.formState.errors.mobile?.message}>
              <Input {...editForm.register("mobile")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="License Number" error={editForm.formState.errors.licenseNumber?.message}>
              <Input {...editForm.register("licenseNumber")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="License Expiry">
              <Input type="date" {...editForm.register("licenseExpiry")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Status">
              <Select
                value={editForm.watch("status")}
                onValueChange={(v) =>
                  editForm.setValue("status", v as DispatchDriver["status"])
                }
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="on_trip">On Trip</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Driver Rating">
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...editForm.register("rating", { valueAsNumber: true })}
                className="h-11 rounded-xl"
              />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DocumentUpload label="Upload License" />
            <DocumentUpload label="Upload Aadhaar" />
            <DocumentUpload label="Upload Driver Photo" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              {submitting ? "Saving..." : "Save Driver"}
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
            <FormField label="Full Name" error={addForm.formState.errors.name?.message}>
              <Input {...addForm.register("name")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Mobile Number" error={addForm.formState.errors.mobile?.message}>
              <Input {...addForm.register("mobile")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Alternate Number">
              <Input {...addForm.register("alternateMobile")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Email">
              <Input type="email" {...addForm.register("email")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="License Number" error={addForm.formState.errors.licenseNumber?.message}>
              <Input {...addForm.register("licenseNumber")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="License Expiry">
              <Input type="date" {...addForm.register("licenseExpiry")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Blood Group">
              <Select
                value={addForm.watch("bloodGroup")}
                onValueChange={(v) => addForm.setValue("bloodGroup", v)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Joining Date">
              <Input type="date" {...addForm.register("joiningDate")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Assigned Hub">
              <Input {...addForm.register("assignedHub")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Driver Rating">
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                {...addForm.register("rating", { valueAsNumber: true })}
                className="h-11 rounded-xl"
              />
            </FormField>
          </div>

          <FormField label="Address">
            <Textarea {...addForm.register("address")} className="rounded-xl" rows={2} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Emergency Contact Name">
              <Input {...addForm.register("emergencyContactName")} className="h-11 rounded-xl" />
            </FormField>
            <FormField label="Emergency Contact Number">
              <Input {...addForm.register("emergencyContactNumber")} className="h-11 rounded-xl" />
            </FormField>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <DocumentUpload label="Upload License" />
            <DocumentUpload label="Upload Aadhaar" />
            <DocumentUpload label="Upload Driver Photo" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            >
              {submitting ? "Saving..." : "Save Driver"}
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
