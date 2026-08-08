"use client";

import type { RequisitionStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  RequisitionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-gray-100 text-gray-600",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-100 text-blue-700",
  },
  allocated: {
    label: "Allocated",
    className: "bg-purple-100 text-purple-700",
  },
  in_transit: {
    label: "In Transit",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
  },
  received: {
    label: "Received",
    className: "bg-teal-100 text-teal-700",
  },
};

interface RequisitionStatusBadgeProps {
  status: RequisitionStatus;
  className?: string;
}

export function RequisitionStatusBadge({
  status,
  className,
}: RequisitionStatusBadgeProps) {
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
