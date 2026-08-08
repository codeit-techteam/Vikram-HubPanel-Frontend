"use client";

import { motion } from "framer-motion";
import type { RequisitionRequest } from "@/types";
import { RequisitionStatusBadge } from "./RequisitionStatusBadge";

interface RequisitionDetailSummaryProps {
  request: RequisitionRequest;
  embedded?: boolean;
}

export function RequisitionDetailSummary({
  request,
  embedded = false,
}: RequisitionDetailSummaryProps) {
  const materials = request.materials ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={
        embedded
          ? undefined
          : "rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      }
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Request ID
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {request.requestId}
          </h2>
        </div>
        <RequisitionStatusBadge status={request.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Date
          </p>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">
            {request.date}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Hub Location
          </p>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">
            {request.hubLocation}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Items
          </p>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">
            {request.items.quantity}
          </p>
          <p className="text-xs text-gray-400">({request.items.material})</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Value
          </p>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">
            {request.value}
          </p>
        </div>
      </div>

      {materials.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Materials
          </p>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-3 py-2">Material</th>
                  <th className="px-3 py-2">Requested</th>
                  <th className="px-3 py-2">Approved</th>
                  <th className="px-3 py-2">Allocated</th>
                  <th className="px-3 py-2">Received</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((line) => (
                  <tr
                    key={line.id}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="px-3 py-2.5">
                      <p className="text-sm font-medium text-gray-900">
                        {line.productName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {line.sku || "—"} · {line.unit}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">
                      {line.requestedQty}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">
                      {line.approvedQty ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">
                      {line.allocatedQty ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">
                      {line.receivedQty ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(request.dispatch || request.receiving) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {request.dispatch && (
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Dispatch
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Driver: {request.dispatch.driverName || "—"}
              </p>
              <p className="text-sm text-gray-700">
                Vehicle: {request.dispatch.vehicleRegistration || "—"}
              </p>
              <p className="text-sm text-gray-700">
                LR: {request.dispatch.lrNumber || "—"}
              </p>
            </div>
          )}
          {request.receiving && (
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Receiving
              </p>
              <p className="mt-1 text-sm text-gray-700">
                By: {request.receiving.receivedBy || "—"}
              </p>
              <p className="text-sm text-gray-700">
                At:{" "}
                {request.receiving.receivedAt
                  ? new Date(request.receiving.receivedAt).toLocaleString("en-IN")
                  : "—"}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
