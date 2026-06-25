"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LogisticsMovementLog, LogisticsMovementStatus } from "@/types";
import { HUB_OPERATION_STATUS_CONFIG } from "@/constants/operationStatus";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  LogisticsMovementStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  pending: "warning",
  loading: "info",
  dispatch: "info",
  delivered: "success",
};

interface LogisticsMovementTableProps {
  logs: LogisticsMovementLog[];
}

export function LogisticsMovementTable({ logs }: LogisticsMovementTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#111827]">
          Logistics Stream
        </h3>
        <Link
          href="/dispatch"
          className="text-xs font-semibold text-[#FF6B00] transition-colors hover:underline"
        >
          View All Movement →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Shipment ID</th>
              <th className="px-5 py-3">Material</th>
              <th className="px-5 py-3">Destination Site</th>
              <th className="px-5 py-3">ETA</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
              const status = HUB_OPERATION_STATUS_CONFIG[log.status];
              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-[#F8F9FB]"
                >
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#111827]">
                    {log.shipmentId}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {log.material}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {log.destination}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#111827]">
                    {log.eta}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={STATUS_VARIANT[log.status]} className="text-[10px]">
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#FF6B00]"
                      )}
                      aria-label={
                        log.actionType === "eye"
                          ? "View details"
                          : "Open tracking"
                      }
                    >
                      {log.actionType === "eye" ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
