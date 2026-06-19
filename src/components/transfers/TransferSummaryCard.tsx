"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { IncomingTransfer } from "@/types";
import { TransferStatusBadge } from "./TransferStatusBadge";

interface TransferSummaryCardProps {
  transfer: IncomingTransfer;
}

export function TransferSummaryCard({ transfer }: TransferSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <TransferStatusBadge status={transfer.status} />
            <button
              type="button"
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              aria-label="Transfer information"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>

          <h2 className="mb-6 text-2xl font-bold text-[#111827]">
            {transfer.transferId}
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Source Warehouse
              </p>
              <p className="mt-1.5 text-sm font-semibold text-[#111827]">
                {transfer.source}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Destination Hub
              </p>
              <p className="mt-1.5 text-sm font-semibold text-[#111827]">
                {transfer.destination}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Dispatch Date
              </p>
              <p className="mt-1.5 text-sm font-semibold text-[#111827]">
                {transfer.dispatchDate ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
