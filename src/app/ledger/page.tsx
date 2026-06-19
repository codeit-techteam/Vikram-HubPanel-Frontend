"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer } from "lucide-react";
import { useLedgerStore } from "@/store";
import { Button } from "@/components/ui/button";
import { InventoryMovementChart } from "@/components/ledger/InventoryMovementChart";
import { StockAlertCard } from "@/components/ledger/StockAlertCard";
import { LedgerAccuracyCard } from "@/components/ledger/LedgerAccuracyCard";
import { LedgerFilters } from "@/components/ledger/LedgerFilters";
import { InventoryLedgerTable } from "@/components/ledger/InventoryLedgerTable";
import { LedgerTransactionModal } from "@/components/ledger/LedgerTransactionModal";
import { LedgerPrintPreviewModal } from "@/components/ledger/LedgerPrintPreviewModal";
import { AuditHistoryModal } from "@/components/ledger/AuditHistoryModal";

export default function LedgerPage() {
  const { loading, transactions, loadLedger, loadChartData, exportLedger, openPrint } =
    useLedgerStore();

  useEffect(() => {
    loadLedger();
    loadChartData();
  }, [loadLedger, loadChartData]);

  if (loading && transactions.length === 0) {
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Inventory Ledger
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Audit trail of all material stock movements and adjustments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-[#E5E7EB]"
                onClick={exportLedger}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-[#E5E7EB]"
                onClick={openPrint}
              >
                <Printer className="h-4 w-4" />
                Print Ledger
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-10">
          <div className="lg:col-span-7">
            <InventoryMovementChart />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-3">
            <StockAlertCard />
            <LedgerAccuracyCard />
          </div>
        </div>

        <LedgerFilters />

        <InventoryLedgerTable />
      </motion.div>

      <LedgerTransactionModal />
      <LedgerPrintPreviewModal />
      <AuditHistoryModal />
    </>
  );
}
