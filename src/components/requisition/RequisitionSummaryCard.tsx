"use client";

import { motion } from "framer-motion";
import { Info, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useRequisitionStore } from "@/store/requisitionStore";
import type { RequisitionFormPriority } from "@/types";

const STOCK_COVERAGE: Record<RequisitionFormPriority, string> = {
  normal: "Standard Coverage",
  high: "In Transit Priority",
  urgent: "Emergency Dispatch",
};

interface RequisitionSummaryCardProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function RequisitionSummaryCard({
  onSubmit,
  isSubmitting,
}: RequisitionSummaryCardProps) {
  const { draftRequisition, estimatedValue } = useRequisitionStore();

  const activeItems = draftRequisition.materials.filter((m) => m.requestedQty > 0);
  const totalSkuLabel =
    activeItems.length === 1
      ? "1 SKU Item"
      : `${activeItems.length || draftRequisition.materials.length} SKU Items`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-[#111827]">
            Requisition Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-gray-500">Source Warehouse</span>
              <span className="text-right text-sm font-semibold text-[#111827]">
                {draftRequisition.sourceWarehouse}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-gray-500">Total Requested Items</span>
              <span className="text-right text-sm font-semibold text-[#111827]">
                {totalSkuLabel}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-gray-500">Stock Coverage</span>
              <span className="text-right text-sm font-semibold text-[#FF6B00]">
                {STOCK_COVERAGE[draftRequisition.priority]}
              </span>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-5">
            <p className="text-sm text-gray-500">Estimated Value</p>
            <p className="mt-1 text-3xl font-bold text-[#FF6B00]">
              ₹{formatNumber(estimatedValue)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">Excl. GST & Freight</p>
          </div>

          <div className="flex gap-3 rounded-xl bg-blue-50 p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed text-blue-700">
              This requisition will be routed to the Procurement Lead for technical
              verification before dispatch.
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Requisition"}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
