"use client";

import { cn } from "@/lib/utils";
import type { DispatchVehicle } from "@/types";

const STATUS_STYLES: Record<DispatchVehicle["status"], string> = {
  available: "bg-emerald-50 text-emerald-600 border-emerald-100",
  assigned: "bg-blue-50 text-blue-600 border-blue-100",
  in_transit: "bg-orange-50 text-[#FF6B00] border-orange-100",
  maintenance: "bg-amber-50 text-amber-600 border-amber-100",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<DispatchVehicle["status"], string> = {
  available: "Available",
  assigned: "Assigned",
  in_transit: "In Transit",
  maintenance: "Maintenance",
  inactive: "Inactive",
};

export function VehicleStatusBadge({
  status,
}: {
  status: DispatchVehicle["status"];
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
