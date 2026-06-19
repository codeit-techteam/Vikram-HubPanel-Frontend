"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTransferStore } from "@/store";
import type { MaterialReceivingItem } from "@/types";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function parseExpectedQty(quantity: string): number {
  const match = quantity.match(/^([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

export function ReceiveMaterialModal() {
  const {
    selectedTransfer,
    isReceiveOpen,
    closeReceive,
    receiveTransfer,
  } = useTransferStore();

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [materials, setMaterials] = useState<MaterialReceivingItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTransfer && isReceiveOpen) {
      setVehicleNumber(selectedTransfer.vehicle);
      setRemarks("");
      const items: MaterialReceivingItem[] = selectedTransfer.materials.map(
        (m) => ({
          materialId: m.id,
          materialName: m.name,
          expectedQuantity: m.quantity,
          quantityReceived: parseExpectedQty(m.quantity),
          damageQuantity: 0,
        })
      );
      setMaterials(items);
      const checked: Record<string, boolean> = {};
      items.forEach((item) => {
        checked[item.materialId] = true;
      });
      setCheckedItems(checked);
    }
  }, [selectedTransfer, isReceiveOpen]);

  if (!selectedTransfer) return null;

  const handleMaterialChange = (
    materialId: string,
    field: "quantityReceived" | "damageQuantity",
    value: number
  ) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.materialId === materialId ? { ...m, [field]: value } : m
      )
    );
  };

  const handleConfirm = async () => {
    const receivedMaterials = materials.filter(
      (m) => checkedItems[m.materialId]
    );
    if (receivedMaterials.length === 0) return;

    setSubmitting(true);
    try {
      await receiveTransfer({
        transferId: selectedTransfer.transferId,
        vehicleNumber,
        materials: receivedMaterials,
        remarks: remarks || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isReceiveOpen}
      onOpenChange={(open) => !open && closeReceive()}
      title="Receive Material"
      description={`Confirm receipt for ${selectedTransfer.transferId}`}
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTransfer.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="transferId">Transfer ID</Label>
            <Input
              id="transferId"
              value={selectedTransfer.transferId}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="Enter vehicle number"
            />
          </div>

          <div className="space-y-3">
            <Label>Material Checklist</Label>
            {materials.map((material) => (
              <div
                key={material.materialId}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Checkbox
                    id={`check-${material.materialId}`}
                    checked={checkedItems[material.materialId] ?? false}
                    onCheckedChange={(checked) =>
                      setCheckedItems((prev) => ({
                        ...prev,
                        [material.materialId]: checked === true,
                      }))
                    }
                  />
                  <label
                    htmlFor={`check-${material.materialId}`}
                    className="text-sm font-medium text-gray-900"
                  >
                    {material.materialName}
                  </label>
                  <span className="ml-auto text-xs text-gray-400">
                    Expected: {material.expectedQuantity}
                  </span>
                </div>

                {checkedItems[material.materialId] && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity Received</Label>
                      <Input
                        type="number"
                        min={0}
                        value={material.quantityReceived}
                        onChange={(e) =>
                          handleMaterialChange(
                            material.materialId,
                            "quantityReceived",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Damage Quantity</Label>
                      <Input
                        type="number"
                        min={0}
                        value={material.damageQuantity}
                        onChange={(e) =>
                          handleMaterialChange(
                            material.materialId,
                            "damageQuantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any discrepancies or notes..."
              rows={3}
              className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={closeReceive}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Confirm Receipt"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
