"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Barcode,
  Boxes,
  IndianRupee,
  Layers,
  Package,
  Sparkles,
  Tag,
  Type,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useInventoryStore } from "@/store";
import { cn } from "@/lib/utils";

const UNITS = ["Bags", "Tons", "Cum", "Units", "Pieces", "Kg", "Liters"];

const addMaterialSchema = z.object({
  name: z.string().min(2, "Material name is required"),
  description: z.string().optional(),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  categoryKey: z.string().min(1, "Select a category"),
  unit: z.string().min(1, "Select a unit"),
  initialStock: z.number().min(0, "Stock cannot be negative"),
  unitPrice: z.number().min(0).optional(),
});

type AddMaterialForm = z.infer<typeof addMaterialSchema>;

function generateSku(name: string, categoryKey: string) {
  const prefix = categoryKey
    .split("_")
    .map((part) => part.slice(0, 3).toUpperCase())
    .join("-");
  const suffix = name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.slice(0, 3).toUpperCase())
    .join("-");
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return [prefix || "MAT", suffix || "NEW", random].filter(Boolean).join("-");
}

function FormField({
  label,
  error,
  children,
  className,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function InputWithIcon({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        className={cn(
          "h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 transition-all hover:border-orange-200 hover:bg-white focus-visible:bg-white",
          className
        )}
        {...props}
      />
    </div>
  );
}

function SectionCard({
  step,
  title,
  description,
  icon: Icon,
  children,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.05 }}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3.5 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF6B00]/10 text-[#FF6B00]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">
              {step}
            </span>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </motion.section>
  );
}

export function AddMaterialModal() {
  const {
    isAddModalOpen,
    closeAddModal,
    addMaterial,
    submitting,
    categories,
  } = useInventoryStore();

  const materialCategories = categories.filter(
    (category) => category.value !== "all"
  );

  const form = useForm<AddMaterialForm>({
    resolver: zodResolver(addMaterialSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      categoryKey: "",
      unit: "Units",
      initialStock: 0,
      unitPrice: undefined,
    },
  });

  const initialStock = form.watch("initialStock");
  const unitPrice = form.watch("unitPrice");
  const unit = form.watch("unit");
  const stockValue =
    initialStock > 0 && unitPrice && unitPrice > 0
      ? initialStock * unitPrice
      : null;

  useEffect(() => {
    if (isAddModalOpen) {
      form.reset({
        name: "",
        description: "",
        sku: "",
        categoryKey: "",
        unit: "Units",
        initialStock: 0,
        unitPrice: undefined,
      });
    }
  }, [isAddModalOpen, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeAddModal();
      form.reset();
    }
  };

  const handleGenerateSku = () => {
    const name = form.getValues("name");
    const categoryKey = form.getValues("categoryKey");

    if (!name.trim()) {
      form.setError("name", { message: "Enter material name first" });
      return;
    }

    form.setValue("sku", generateSku(name, categoryKey || "material"), {
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: AddMaterialForm) => {
    const category = materialCategories.find(
      (item) => item.value === data.categoryKey
    );

    await addMaterial({
      name: data.name,
      description: data.description ?? "",
      sku: data.sku,
      categoryKey: data.categoryKey,
      category: category?.label ?? data.categoryKey,
      unit: data.unit,
      initialStock: data.initialStock,
      unitPrice: data.unitPrice,
    });
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:bg-white/20 [&>button]:text-white [&>button]:opacity-100 [&>button]:backdrop-blur-sm [&>button]:transition-colors [&>button]:hover:bg-white/30 [&>button]:focus:ring-white/50">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B00] via-[#FF7A1A] to-[#E55F00] px-6 pb-8 pt-6 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/5"
          />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
              <Package className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 pr-8">
              <DialogTitle className="text-xl font-bold tracking-tight text-white">
                Add New Material
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-orange-100">
                Register a new SKU and stock entry in hub inventory
              </DialogDescription>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-h-[calc(92vh-7.5rem)] flex-col"
        >
          <div className="-mt-4 flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-0 sm:px-6">
            <SectionCard
              step={1}
              title="Material Details"
              description="Name, specification, category and measurement unit"
              icon={Tag}
            >
              <FormField
                label="Material Name"
                error={form.formState.errors.name?.message}
              >
                <InputWithIcon
                  icon={Type}
                  placeholder="e.g. Cement Bags (Grade 43)"
                  {...form.register("name")}
                />
              </FormField>

              <FormField label="Description" hint="Optional">
                <Textarea
                  placeholder="Brief specification or grade details"
                  {...form.register("description")}
                  className="min-h-[88px] resize-none rounded-xl border-gray-200 bg-gray-50/50 transition-all hover:border-orange-200 hover:bg-white focus-visible:bg-white"
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Category"
                  error={form.formState.errors.categoryKey?.message}
                >
                  <Select
                    value={form.watch("categoryKey")}
                    onValueChange={(value) =>
                      form.setValue("categoryKey", value)
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50/50 transition-all hover:border-orange-200 hover:bg-white">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Select category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {materialCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Unit"
                  error={form.formState.errors.unit?.message}
                >
                  <Select
                    value={form.watch("unit")}
                    onValueChange={(value) => form.setValue("unit", value)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50/50 transition-all hover:border-orange-200 hover:bg-white">
                      <div className="flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-gray-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </SectionCard>

            <SectionCard
              step={2}
              title="SKU & Stock"
              description="Unique identifier and opening inventory quantity"
              icon={Barcode}
            >
              <FormField
                label="SKU Code"
                error={form.formState.errors.sku?.message}
                hint="Auto-generate or enter manually"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="e.g. CMN-43-GRD"
                      {...form.register("sku")}
                      className="h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-10 font-mono uppercase tracking-wide transition-all hover:border-orange-200 hover:bg-white focus-visible:bg-white"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSku}
                    className="h-11 shrink-0 gap-2 rounded-xl border-[#FF6B00]/30 bg-gradient-to-r from-orange-50 to-white px-4 font-medium text-[#FF6B00] shadow-sm transition-all hover:border-[#FF6B00]/50 hover:from-orange-100 hover:to-orange-50 hover:shadow"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Initial Stock"
                  error={form.formState.errors.initialStock?.message}
                >
                  <InputWithIcon
                    icon={Boxes}
                    type="number"
                    min="0"
                    placeholder="0"
                    {...form.register("initialStock", { valueAsNumber: true })}
                  />
                </FormField>

                <FormField label="Unit Price (₹)" hint="Optional">
                  <InputWithIcon
                    icon={IndianRupee}
                    type="number"
                    min="0"
                    placeholder="0.00"
                    {...form.register("unitPrice", { valueAsNumber: true })}
                  />
                </FormField>
              </div>

              {stockValue !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center justify-between rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3"
                >
                  <span className="text-xs font-medium text-emerald-700">
                    Estimated stock value
                  </span>
                  <span className="text-sm font-bold text-emerald-800">
                    ₹{stockValue.toLocaleString("en-IN")}{" "}
                    <span className="font-normal text-emerald-600">
                      ({initialStock} {unit})
                    </span>
                  </span>
                </motion.div>
              )}
            </SectionCard>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-gray-50/90 px-5 py-4 backdrop-blur-sm sm:px-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl border-gray-200 bg-white font-medium hover:bg-gray-50"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 flex-[1.2] rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8534] font-semibold shadow-lg shadow-orange-200/50 transition-all hover:from-[#E55F00] hover:to-[#FF6B00] hover:shadow-orange-300/50 disabled:opacity-70"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Adding Material...
                </span>
              ) : (
                "Add Material"
              )}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
