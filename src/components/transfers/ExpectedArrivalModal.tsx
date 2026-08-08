"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import type { IncomingTransfer } from "@/types";

interface ExpectedArrivalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: IncomingTransfer | null;
}

export function ExpectedArrivalModal({
  open,
  onOpenChange,
  transfer,
}: ExpectedArrivalModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Expected Arrival"
      description="Estimated time of arrival at the destination hub."
      className="max-w-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex flex-col items-center gap-3 rounded-xl bg-orange-50 px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B00]">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#111827]">
              {transfer?.etaDisplay ?? "—"}
            </p>
            {transfer?.destination && (
              <p className="mt-1 text-sm text-gray-500">
                Arriving at {transfer.destination}
              </p>
            )}
          </div>
        </div>

        {transfer?.transferId && (
          <p className="text-center text-xs text-gray-400">
            Transfer {transfer.transferId}
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
