"use client";

import { motion } from "framer-motion";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className: "bg-blue-100 text-blue-700",
  },
  processing: {
    label: "Processing",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  packed: {
    label: "Packed",
    className: "bg-purple-100 text-purple-700",
  },
  out_for_delivery: {
    label: "Out For Delivery",
    className: "bg-indigo-100 text-indigo-700",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </motion.span>
  );
}
