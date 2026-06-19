"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneralDetailsForm } from "@/components/requisition/GeneralDetailsForm";
import { MaterialRequestTable } from "@/components/requisition/MaterialRequestTable";
import { RequisitionSummaryCard } from "@/components/requisition/RequisitionSummaryCard";
import { FleetStatusCard } from "@/components/requisition/FleetStatusCard";
import { useRequisitionStore } from "@/store/requisitionStore";
import { requisitionService } from "@/services/requisition.service";
import { hubService } from "@/services/hub.service";
import type { CreateRequisitionFormData } from "@/types";
import { Check } from "lucide-react";

const requisitionSchema = z.object({
  hubId: z.string().min(1, "Hub is required"),
  priority: z.enum(["normal", "high", "urgent"]),
  expectedDate: z.string().min(1, "Expected date is required"),
  requestReason: z.string().min(1, "Request reason is required"),
  materials: z
    .array(
      z.object({
        id: z.string(),
        productId: z.string(),
        productName: z.string(),
        sku: z.string(),
        currentStock: z.number(),
        requestedQty: z.number(),
        unit: z.string(),
        unitPrice: z.number(),
      })
    )
    .min(1, "At least one material is required")
    .refine(
      (materials) => materials.some((m) => m.requestedQty > 0),
      "At least one material must have quantity greater than 0"
    )
    .refine(
      (materials) =>
        materials.every((m) => m.requestedQty === 0 || m.requestedQty > 0),
      "Requested quantity must be greater than 0"
    ),
});

export default function CreateRequisitionPage() {
  const router = useRouter();
  const {
    draftRequisition,
    draftSavedAt,
    isSavingDraft,
    initDraft,
    restoreDraft,
    setDraftField,
    setSelectedPriority,
    saveDraft,
    submitRequisition,
  } = useRequisitionStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      hubId: draftRequisition.hubId,
      priority: draftRequisition.priority,
      expectedDate: draftRequisition.expectedDate,
      requestReason: draftRequisition.requestReason,
      materials: draftRequisition.materials,
    },
  });

  useEffect(() => {
    const loadDraft = async () => {
      const saved = await requisitionService.getDraft();
      if (saved) {
        restoreDraft(saved);
      } else {
        initDraft();
      }
    };
    loadDraft();
  }, [initDraft, restoreDraft]);

  useEffect(() => {
    setValue("hubId", draftRequisition.hubId);
    setValue("priority", draftRequisition.priority);
    setValue("expectedDate", draftRequisition.expectedDate);
    setValue("requestReason", draftRequisition.requestReason);
    setValue("materials", draftRequisition.materials);
  }, [draftRequisition, setValue]);

  const hubId = watch("hubId");
  const priority = watch("priority");
  const expectedDate = watch("expectedDate");
  const requestReason = watch("requestReason");

  useEffect(() => {
    if (!hubId) return;
    hubService.getById(hubId).then((hub) => {
      if (hub) {
        setDraftField("hubId", hubId);
        setDraftField("hubName", hub.name);
      }
    });
  }, [hubId, setDraftField]);

  useEffect(() => {
    setSelectedPriority(priority);
    setDraftField("priority", priority);
  }, [priority, setSelectedPriority, setDraftField]);

  useEffect(() => {
    setDraftField("expectedDate", expectedDate);
  }, [expectedDate, setDraftField]);

  useEffect(() => {
    setDraftField("requestReason", requestReason);
  }, [requestReason, setDraftField]);

  useEffect(() => {
    setValue("materials", draftRequisition.materials);
  }, [draftRequisition.materials, setValue]);

  const handleAutoSave = useCallback(async () => {
    await saveDraft();
  }, [saveDraft]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [handleAutoSave]);

  const materialErrors: Record<string, string> = {};
  if (errors.materials?.message) {
    draftRequisition.materials.forEach((m) => {
      if (m.requestedQty <= 0) {
        materialErrors[m.id] = "Quantity must be greater than 0";
      }
    });
  }

  const onSubmit = async (data: CreateRequisitionFormData) => {
    const invalidMaterials = data.materials.filter(
      (m) => m.requestedQty <= 0
    );
    if (invalidMaterials.length > 0) {
      invalidMaterials.forEach((m) => {
        setError("materials", {
          message: `Quantity must be greater than 0 for ${m.productName}`,
        });
      });
      toast.error("Please enter valid quantities for all materials");
      return;
    }

    clearErrors();
    try {
      await submitRequisition();
      toast.success("Requisition submitted successfully");
      router.push("/requisitions");
    } catch {
      toast.error("Failed to submit requisition");
    }
  };

  const formatSavedTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Logistics" },
            { label: "Requisitions", href: "/requisitions" },
            { label: "New Requisition", active: true },
          ]}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Create Material Requisition
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Drafting request for high-priority logistics fulfillment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {draftSavedAt && (
              <span className="flex items-center gap-1.5 text-xs text-[#22C55E]">
                <Check className="h-3.5 w-3.5" />
                Draft Saved {formatSavedTime(draftSavedAt)}
              </span>
            )}
            {isSavingDraft && (
              <span className="text-xs text-gray-400">Saving draft...</span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold text-[#111827]">
                    General Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GeneralDetailsForm
                    control={control}
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <MaterialRequestTable materialErrors={materialErrors} />

            {errors.materials && (
              <p className="text-sm text-red-500">{errors.materials.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="hidden lg:block">
              <RequisitionSummaryCard
                onSubmit={handleSubmit(onSubmit)}
                isSubmitting={isSubmitting}
              />
            </div>
            <FleetStatusCard />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E5E7EB] bg-white p-4 lg:hidden">
          <RequisitionSummaryCard
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
          />
        </div>
        <div className="h-24 lg:hidden" />
      </form>
    </motion.div>
  );
}
