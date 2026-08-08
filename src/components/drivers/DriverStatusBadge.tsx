"use client";

import { cn } from "@/lib/utils";
import type { DispatchDriver } from "@/types";

const STATUS_STYLES: Record<DispatchDriver["status"], string> = {
  available: "bg-emerald-50 text-emerald-600 border-emerald-100",
  assigned: "bg-blue-50 text-blue-600 border-blue-100",
  on_trip: "bg-orange-50 text-[#FF6B00] border-orange-100",
  on_leave: "bg-purple-50 text-purple-600 border-purple-100",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<DispatchDriver["status"], string> = {
  available: "Available",
  assigned: "Assigned",
  on_trip: "On Trip",
  on_leave: "On Leave",
  inactive: "Inactive",
};

export function DriverStatusBadge({
  status,
}: {
  status: DispatchDriver["status"];
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        STATUS_STYLES[status] ?? STATUS_STYLES.available
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
