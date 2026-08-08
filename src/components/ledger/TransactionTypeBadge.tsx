"use client";

import { motion } from "framer-motion";
import type { LedgerTransactionType } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_CONFIG: Record<
  LedgerTransactionType,
  { label: string; className: string }
> = {
  received: {
    label: "RECEIVED",
    className: "bg-emerald-100 text-emerald-700",
  },
  sold: {
    label: "SOLD",
    className: "bg-red-100 text-red-600",
  },
  returned: {
    label: "RETURNED",
    className: "bg-purple-100 text-purple-700",
  },
  adjusted: {
    label: "ADJUSTED",
    className: "bg-blue-100 text-blue-700",
  },
  damaged: {
    label: "DAMAGED",
    className: "bg-orange-100 text-orange-700",
  },
};

interface TransactionTypeBadgeProps {
  type: LedgerTransactionType;
  className?: string;
}

export function TransactionTypeBadge({ type, className }: TransactionTypeBadgeProps) {
  const config = TYPE_CONFIG[type];

  return (
    <motion.span
      key={type}
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

export function getChangeColor(type: LedgerTransactionType): string {
  const colors: Record<LedgerTransactionType, string> = {
    received: "text-emerald-600",
    sold: "text-red-600",
    returned: "text-purple-600",
    adjusted: "text-blue-600",
    damaged: "text-orange-600",
  };
  return colors[type];
}
