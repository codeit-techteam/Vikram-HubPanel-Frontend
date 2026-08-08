"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReceivingMaterialItem } from "@/types";

interface VerificationActionsProps {
  item: ReceivingMaterialItem;
  onAccept: () => void;
  onReject: () => void;
  onDiscrepancy: () => void;
}

export function VerificationActions({
  item,
  onAccept,
  onReject,
  onDiscrepancy,
}: VerificationActionsProps) {
  const isVerified = item.verificationStatus === "verified";
  const isRejected = item.verificationStatus === "rejected";
  const isDiscrepancy = item.verificationStatus === "discrepancy";

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAccept}
        title="Accept Item"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
          isVerified
            ? "border-[#22C55E] bg-[#22C55E] text-white"
            : "border-[#22C55E] bg-white text-[#22C55E] hover:bg-green-50"
        )}
      >
        <Check className="h-4 w-4" />
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReject}
        title="Reject Item"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors",
          isRejected
            ? "border-[#FF6B00] bg-[#FF6B00] text-white"
            : "border-[#FF6B00] bg-white text-[#FF6B00] hover:bg-orange-50"
        )}
      >
        <Minus className="h-4 w-4" />
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDiscrepancy}
        title="Flag Discrepancy"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white transition-colors",
          isDiscrepancy
            ? "border-[#EF4444] bg-red-50 text-[#EF4444]"
            : "border-[#EF4444] text-[#EF4444] hover:bg-red-50"
        )}
      >
        <AlertTriangle className="h-4 w-4" />
      </motion.button>
    </div>
  );
}
