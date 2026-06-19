"use client";

import { motion } from "framer-motion";
import type { TransferStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  TransferStatus,
  { label: string; className: string }
> = {
  ready: {
    label: "Ready",
    className: "bg-gray-100 text-gray-600",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-blue-100 text-blue-700",
  },
  arriving_today: {
    label: "Arriving Today",
    className: "bg-emerald-100 text-emerald-700",
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  delayed: {
    label: "Delayed",
    className: "bg-red-100 text-red-700",
  },
  received: {
    label: "Received",
    className: "bg-teal-100 text-teal-700",
  },
};

interface TransferStatusBadgeProps {
  status: TransferStatus;
  className?: string;
}

export function TransferStatusBadge({
  status,
  className,
}: TransferStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <motion.span
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </motion.span>
  );
}
