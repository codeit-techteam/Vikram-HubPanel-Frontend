"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DispatchQueueStatus } from "@/types";

const STATUS_STYLES: Record<
  DispatchQueueStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "PENDING",
    className: "bg-orange-50 text-[#FF6B00] border-orange-100",
  },
  preparing: {
    label: "PREPARING",
    className: "bg-blue-50 text-blue-600 border-blue-100",
  },
  assigned: {
    label: "ASSIGNED",
    className: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  dispatched: {
    label: "DISPATCHED",
    className: "bg-violet-50 text-violet-600 border-violet-100",
  },
  in_transit: {
    label: "IN TRANSIT",
    className: "bg-green-50 text-green-600 border-green-100",
  },
  arrived: {
    label: "ARRIVED",
    className: "bg-teal-50 text-teal-600 border-teal-100",
  },
  delivered: {
    label: "DELIVERED",
    className: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  delayed: {
    label: "DELAYED",
    className: "bg-red-50 text-red-600 border-red-100",
  },
};

interface DispatchStatusBadgeProps {
  status: DispatchQueueStatus;
  className?: string;
}

export function DispatchStatusBadge({
  status,
  className,
}: DispatchStatusBadgeProps) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider",
        config.className,
        className
      )}
    >
      {config.label}
    </motion.span>
  );
}
