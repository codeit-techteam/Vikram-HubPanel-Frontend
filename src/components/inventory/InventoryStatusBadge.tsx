"use client";

import type { InventoryProductStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  InventoryProductStatus,
  { label: string; className: string }
> = {
  in_stock: {
    label: "In Stock",
    className: "bg-emerald-100 text-emerald-700",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-100 text-red-600",
  },
};

interface InventoryStatusBadgeProps {
  status: InventoryProductStatus;
  className?: string;
}

export function InventoryStatusBadge({
  status,
  className,
}: InventoryStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
