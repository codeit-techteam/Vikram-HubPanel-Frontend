"use client";

import type { ActiveRequisition } from "@/types";
import { cn } from "@/lib/utils";

interface RequisitionCardProps {
  requisition: ActiveRequisition;
}

export function RequisitionCard({ requisition }: RequisitionCardProps) {
  const isExpedited = requisition.badgeVariant === "expedited";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-400">
            {requisition.code}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-gray-900">
            {requisition.title}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            isExpedited
              ? "bg-[#FF6B00] text-white"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {requisition.badge}
        </span>
      </div>

      <div className="mt-4 flex gap-1">
        {Array.from({ length: requisition.totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index < requisition.progress
                ? isExpedited
                  ? "bg-[#FF6B00]"
                  : "bg-gray-400"
                : "bg-gray-100"
            )}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-500">{requisition.statusText}</p>
    </div>
  );
}
