"use client";

import Link from "next/link";
import type { IncomingDelivery } from "@/types";
import {
  DashboardTimeFilter,
  isWithinDashboardPeriod,
  type DashboardTimePeriod,
} from "@/components/dashboard/DashboardTimeFilter";
import { HUB_OPERATION_STATUS_CONFIG } from "@/constants/operationStatus";
import { cn } from "@/lib/utils";

interface IncomingDeliveriesTableProps {
  deliveries: IncomingDelivery[];
  period: DashboardTimePeriod;
  selectedMonth: number;
  onPeriodChange: (period: DashboardTimePeriod) => void;
  onMonthChange: (month: number) => void;
}

export function IncomingDeliveriesTable({
  deliveries,
  period,
  selectedMonth,
  onPeriodChange,
  onMonthChange,
}: IncomingDeliveriesTableProps) {
  const filteredDeliveries = deliveries.filter((delivery) =>
    isWithinDashboardPeriod(delivery.scheduledDate, period, selectedMonth)
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Incoming Materials
          </h3>
          <Link
            href="/incoming-material"
            className="text-xs font-semibold text-[#FF6B00] hover:underline"
          >
            View All Materials
          </Link>
        </div>
        <div className="mt-3">
          <DashboardTimeFilter
            period={period}
            selectedMonth={selectedMonth}
            onPeriodChange={onPeriodChange}
            onMonthChange={onMonthChange}
            compact
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Transfer ID</th>
              <th className="px-5 py-3">Expected Arrival</th>
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Quantity</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  No incoming materials for the selected period.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((delivery) => {
                const status = HUB_OPERATION_STATUS_CONFIG[delivery.status];
                return (
                  <tr
                    key={delivery.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/transfers?search=${delivery.transferId}`}
                        className="text-sm font-medium text-[#FF6B00] hover:underline"
                      >
                        {delivery.transferId}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                      {delivery.expectedArrival}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {delivery.material}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {delivery.quantity}
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
