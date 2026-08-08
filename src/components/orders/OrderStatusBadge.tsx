"use client";

import { motion } from "framer-motion";
import type { OrderStatus } from "@/types";
import { HUB_OPERATION_STATUS_CONFIG } from "@/constants/operationStatus";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  /** Optional API statusLabel override (no redesign — same badge classes). */
  label?: string;
  className?: string;
}

export function OrderStatusBadge({
  status,
  label,
  className,
}: OrderStatusBadgeProps) {
  const config = HUB_OPERATION_STATUS_CONFIG[status];

  return (
    <motion.span
      key={label || status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {label || config.label}
    </motion.span>
  );
}
