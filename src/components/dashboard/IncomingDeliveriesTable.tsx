"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { IncomingDelivery } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<
  IncomingDelivery["status"],
  { label: string; className: string }
> = {
  in_transit: {
    label: "IN-TRANSIT",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  loading: {
    label: "LOADING",
    className: "bg-sky-100 text-sky-700",
  },
  delivered: {
    label: "DELIVERED",
    className: "bg-emerald-100 text-emerald-700",
  },
};

interface IncomingDeliveriesTableProps {
  deliveries: IncomingDelivery[];
}

export function IncomingDeliveriesTable({
  deliveries,
}: IncomingDeliveriesTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Incoming Deliveries
        </h3>
        <Link
          href="/incoming-material"
          className="text-xs font-semibold text-[#FF6B00] hover:underline"
        >
          View Schedule
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">ETA</th>
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => {
              const status = STATUS_STYLES[delivery.status];
              return (
                <tr
                  key={delivery.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                    {delivery.eta}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {delivery.material}
                    </p>
                    <p className="text-xs text-gray-400">{delivery.quantity}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {delivery.source}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-1 text-[10px] font-bold tracking-wide",
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
