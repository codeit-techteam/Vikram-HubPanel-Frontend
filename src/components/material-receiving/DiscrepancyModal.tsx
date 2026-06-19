"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DiscrepancyType, ReceivingMaterialItem } from "@/types";
import { useMaterialReceivingStore } from "@/store";
import { formatNumber } from "@/lib/utils";

const DISCREPANCY_OPTIONS: { value: DiscrepancyType; label: string }[] = [
  { value: "damage", label: "Damage" },
  { value: "shortage", label: "Shortage" },
  { value: "excess", label: "Excess" },
  { value: "quality_issue", label: "Quality Issue" },
];

export function DiscrepancyModal() {
  const {
    isDiscrepancyOpen,
    closeDiscrepancy,
    selectedDiscrepancyItem,
    receivingRecord,
    submitDiscrepancy,
    submitting,
  } = useMaterialReceivingStore();

  const [selectedItem, setSelectedItem] = useState<ReceivingMaterialItem | null>(
    null
  );
  const [discrepancyType, setDiscrepancyType] =
    useState<DiscrepancyType>("shortage");
  const [remarks, setRemarks] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  useEffect(() => {
    if (isDiscrepancyOpen) {
      setSelectedItem(selectedDiscrepancyItem);
      setDiscrepancyType("shortage");
      setRemarks("");
      setEvidenceFile(null);
    }
  }, [isDiscrepancyOpen, selectedDiscrepancyItem]);

  const materials = receivingRecord?.materials ?? [];
  const activeItem = selectedItem ?? materials[0];

  const handleSubmit = async () => {
    if (!receivingRecord || !activeItem) return;

    await submitDiscrepancy({
      transferId: receivingRecord.transferId,
      productId: activeItem.productId,
      productName: activeItem.productName,
      dispatchedQty: activeItem.dispatchedQty,
      receivedQty: activeItem.receivedQty,
      discrepancyType,
      remarks,
      evidenceUrls: evidenceFile ? [evidenceFile.name] : [],
    });
  };

  return (
    <Modal
      open={isDiscrepancyOpen}
      onOpenChange={(open) => !open && closeDiscrepancy()}
      title="Submit Discrepancy"
      description="Report material discrepancies for procurement review."
      className="max-w-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Product</Label>
          <select
            value={activeItem?.productId ?? ""}
            onChange={(e) => {
              const item = materials.find((m) => m.productId === e.target.value);
              setSelectedItem(item ?? null);
            }}
            className="flex h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm"
          >
            {materials.map((m) => (
              <option key={m.productId} value={m.productId}>
                {m.productName}
              </option>
            ))}
          </select>
        </div>

        {activeItem && (
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F8F9FB] p-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Dispatched Qty</p>
              <p className="font-medium text-[#111827]">
                {activeItem.dispatchedDisplay}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Received Qty</p>
              <p className="font-medium text-[#111827]">
                {formatNumber(activeItem.receivedQty)} {activeItem.dispatchedUnit}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Discrepancy Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {DISCREPANCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDiscrepancyType(opt.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  discrepancyType === opt.value
                    ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00]"
                    : "border-[#E5E7EB] text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="Describe the discrepancy..."
            className="flex w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          />
        </div>

        <div className="space-y-2">
          <Label>Upload Evidence</Label>
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
            className="rounded-xl"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={closeDiscrepancy} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !remarks.trim()}
            className="bg-[#FF6B00] hover:bg-[#E55F00]"
          >
            {submitting ? "Submitting..." : "Submit Discrepancy"}
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
