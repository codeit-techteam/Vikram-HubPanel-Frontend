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
    </motion.div>
  );
}
