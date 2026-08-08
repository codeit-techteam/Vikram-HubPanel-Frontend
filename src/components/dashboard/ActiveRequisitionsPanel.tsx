"use client";

import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import type { ActiveRequisition } from "@/types";
import { RequisitionCard } from "@/components/dashboard/RequisitionCard";
import { Button } from "@/components/ui/button";

interface ActiveRequisitionsPanelProps {
  requisitions: ActiveRequisition[];
}

export function ActiveRequisitionsPanel({
  requisitions,
}: ActiveRequisitionsPanelProps) {
  const isEmpty = requisitions.length === 0;

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">
          Active Requisitions
        </h3>
        <Link
          href="/requisitions"
          className="text-xs font-semibold text-[#FF6B00] hover:underline"
        >
          View All
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-[#F8F9FB] px-4 py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <ClipboardList className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            No active requisitions
          </p>
          <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-gray-500">
            Material requests you submit will appear here while they are being
            processed.
          </p>
          <Button
            asChild
            className="mt-5 gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            size="sm"
          >
            <Link href="/requisitions/create">
              <Plus className="h-4 w-4" />
              New Requisition
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requisitions.map((req) => (
            <RequisitionCard key={req.id} requisition={req} />
          ))}
        </div>
      )}
    </div>
  );
}
