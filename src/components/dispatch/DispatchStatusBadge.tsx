"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DispatchQueueStatus } from "@/types";
import { HUB_OPERATION_STATUS_CONFIG } from "@/constants/operationStatus";

interface DispatchStatusBadgeProps {
  status: DispatchQueueStatus;
  className?: string;
}

export function DispatchStatusBadge({
  status,
  className,
}: DispatchStatusBadgeProps) {
  const config = HUB_OPERATION_STATUS_CONFIG[status];

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center rounded-md border border-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        config.className,
        className
      )}
    >
      {config.label}
    </motion.span>
  );
}
