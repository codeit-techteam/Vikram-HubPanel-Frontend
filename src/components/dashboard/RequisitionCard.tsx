"use client";

import Link from "next/link";
import type { ActiveRequisition } from "@/types";
import { cn } from "@/lib/utils";

interface RequisitionCardProps {
  requisition: ActiveRequisition;
}

export function RequisitionCard({ requisition }: RequisitionCardProps) {
  const isExpedited = requisition.badgeVariant === "expedited";

  return (
    <Link
      href={`/requisitions/${requisition.code}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#FF6B00]/40 hover:bg-[#FFF9F5]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Req ID
          </p>
          <p className="text-sm font-bold text-[#FF6B00]">{requisition.code}</p>
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

      <p className="mt-3 text-sm font-semibold text-gray-900">
        {requisition.title}
      </p>

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

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Status
        </p>
        <p className="mt-0.5 text-xs text-gray-600">{requisition.statusText}</p>
      </div>
    </Link>
  );
}
