"use client";

import { motion } from "framer-motion";
import { FileText, Printer } from "lucide-react";
import { format } from "date-fns";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { useLedgerStore } from "@/store";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { formatNumber } from "@/lib/utils";

export function LedgerPrintPreviewModal() {
  const { isPrintOpen, closePrint, transactions, filters } = useLedgerStore();

  const handlePrint = () => {
    window.print();
  };

  const dateLabel = `${format(new Date(filters.dateFrom), "MMM dd, yyyy")} – ${format(new Date(filters.dateTo), "MMM dd, yyyy")}`;

  return (
    <Modal
      open={isPrintOpen}
      onOpenChange={(open) => !open && closePrint()}
      title="Print Ledger"
      description="Preview the inventory ledger before printing."
      className="max-h-[90vh] max-w-3xl overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div
          id="ledger-print-preview"
          className="rounded-xl border border-[#E5E7EB] bg-white p-5"
        >
          <div className="mb-4 flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
            <FileText className="h-5 w-5 text-[#FF6B00]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Inventory Ledger Report
              </p>
              <p className="text-xs text-gray-500">
                Noida Dark Store #422 · {dateLabel}
              </p>
            </div>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="pb-2 pr-2">Date</th>
                <th className="pb-2 pr-2">Type</th>
                <th className="pb-2 pr-2">Product</th>
                <th className="pb-2 pr-2">Opening</th>
                <th className="pb-2 pr-2">Change</th>
                <th className="pb-2">Closing</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50">
                  <td className="py-2 pr-2 text-gray-600">
                    {format(new Date(txn.date), "MMM dd, yyyy")}
                  </td>
                  <td className="py-2 pr-2">
                    <TransactionTypeBadge type={txn.type} />
                  </td>
                  <td className="py-2 pr-2">
                    <p className="font-medium text-[#111827]">{txn.product}</p>
                    <p className="text-gray-400">{txn.sku}</p>
                  </td>
                  <td className="py-2 pr-2 text-gray-600">
                    {formatNumber(txn.openingStock)} {txn.openingStockUnit}
                  </td>
                  <td className="py-2 pr-2 font-medium">
                    {txn.change > 0 ? "+" : ""}
                    {txn.change} {txn.changeUnit}
                  </td>
                  <td className="py-2 font-medium text-[#111827]">
                    {formatNumber(txn.closingStock)} {txn.closingStockUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-4 text-[10px] text-gray-400">
            Generated on {format(new Date(), "MMM dd, yyyy · hh:mm a")} · HubOps
            Central Material Logistics
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closePrint}>
            Cancel
          </Button>
          <Button
            className="gap-2 bg-[#FF6B00] hover:bg-[#E55F00]"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
