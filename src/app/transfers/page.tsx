"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTransferStore } from "@/store";
import { TransferCard } from "@/components/transfers/TransferCard";
import { TransferFilters } from "@/components/transfers/TransferFilters";
import { DailyTransferSummary } from "@/components/transfers/DailyTransferSummary";
import { TransferDetailsModal } from "@/components/transfers/TransferDetailsModal";
import { ReceiveMaterialModal } from "@/components/transfers/ReceiveMaterialModal";

export default function TransfersPage() {
  const { loading, loadTransfers, filteredTransfers } = useTransferStore();

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Incoming Transfers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor material shipments arriving from Central Warehouse.
          </p>
        </div>

        <TransferFilters />

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {filteredTransfers.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm text-gray-500">
                  No transfers match your filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredTransfers.map((transfer, index) => (
                  <TransferCard
                    key={transfer.id}
                    transfer={transfer}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <DailyTransferSummary />
          </div>
        </div>
      </motion.div>

      <TransferDetailsModal />
      <ReceiveMaterialModal />
    </>
  );
}
