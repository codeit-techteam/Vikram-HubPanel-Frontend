"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requisitionService } from "@/services/requisition.service";
import type { RequisitionMaterialLine, RequisitionRequest } from "@/types";

interface ReceiveRequisitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequisitionRequest;
  onReceived: (updated: RequisitionRequest) => void;
}

function defaultQty(line: RequisitionMaterialLine): number {
  return Math.max(
    0,
    Math.round(
      line.allocatedQty ??
        line.approvedQty ??
        line.requestedQty ??
        0,
    ),
  );
}

export function ReceiveRequisitionDialog({
  open,
  onOpenChange,
  request,
  onReceived,
}: ReceiveRequisitionDialogProps) {
  const materials = request.materials ?? [];
  const [qtyByItem, setQtyByItem] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const defaults: Record<string, number> = {};
    for (const line of request.materials ?? []) {
      defaults[line.id] = defaultQty(line);
    }
    setQtyByItem(defaults);
  }, [open, request.id, request.materials]);

  const handleSubmit = async () => {
    if (materials.length === 0) {
      toast.error("No materials available to receive");
      return;
    }

    setSubmitting(true);
    try {
      await requisitionService.receiveRequisition(
        request.id,
        materials.map((line) => ({
          itemId: line.id,
          receivedQty: Math.max(0, Math.round(qtyByItem[line.id] ?? 0)),
        })),
      );
      const fresh =
        (await requisitionService.getRequestById(request.id)) ??
        (await requisitionService.getRequestById(request.requestId));
      if (fresh) onReceived(fresh);
      toast.success("Requisition received successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to receive requisition");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            Receive Shipment
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-80 space-y-3 overflow-y-auto px-6 py-4">
          <p className="text-sm text-gray-500">
            Confirm received quantities for {request.requestId}. Defaults use
            allocated / approved qty.
          </p>
          {materials.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No line items found.
            </p>
          ) : (
            materials.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#111827]">
                    {line.productName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Allocated:{" "}
                    {line.allocatedQty ?? line.approvedQty ?? line.requestedQty}{" "}
                    {line.unit}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={qtyByItem[line.id] ?? 0}
                  onChange={(e) =>
                    setQtyByItem((prev) => ({
                      ...prev,
                      [line.id]: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="h-10 w-24 rounded-lg border-[#E5E7EB]"
                />
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 border-t border-[#E5E7EB] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            onClick={handleSubmit}
            disabled={submitting || materials.length === 0}
          >
            {submitting ? "Receiving..." : "Confirm Receive"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
