"use client";

import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  ClipboardList,
  Package,
  Truck,
  Warehouse,
} from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { useLedgerStore } from "@/store";
import type { LedgerLinkedModule } from "@/types";
import { TransactionTypeBadge } from "./TransactionTypeBadge";
import { format } from "date-fns";
import { cn, formatNumber } from "@/lib/utils";

const MODULE_CONFIG: Record<
  LedgerLinkedModule,
  { label: string; icon: typeof Package; color: string }
> = {
  inventory: { label: "Inventory", icon: Warehouse, color: "text-blue-600 bg-blue-50" },
  transfer: { label: "Transfer", icon: ArrowRightLeft, color: "text-indigo-600 bg-indigo-50" },
  receiving: { label: "Receiving", icon: Package, color: "text-emerald-600 bg-emerald-50" },
  dispatch: { label: "Dispatch", icon: Truck, color: "text-orange-600 bg-orange-50" },
  order: { label: "Order", icon: ClipboardList, color: "text-purple-600 bg-purple-50" },
};

export function LedgerTransactionModal() {
  const { isDetailsOpen, closeTransaction, selectedTransaction } =
    useLedgerStore();

  if (!selectedTransaction) return null;

  const txn = selectedTransaction;
  const moduleConfig = MODULE_CONFIG[txn.linkedModule];

  return (
    <Modal
      open={isDetailsOpen}
      onOpenChange={(open) => !open && closeTransaction()}
      title="Transaction Details"
      description={`${txn.transactionNo} — ${txn.product}`}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-[#111827]">{txn.transactionNo}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(txn.date), "MMM dd, yyyy · hh:mm a")}
            </p>
          </div>
          <TransactionTypeBadge type={txn.type} />
        </div>

        <section className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">
            Material Details
          </h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Product</p>
              <p className="font-medium text-[#111827]">{txn.product}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">SKU</p>
              <p className="font-medium text-[#111827]">{txn.sku}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Opening Stock</p>
              <p className="font-medium text-[#111827]">
                {formatNumber(txn.openingStock)} {txn.openingStockUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Closing Stock</p>
              <p className="font-medium text-[#111827]">
                {formatNumber(txn.closingStock)} {txn.closingStockUnit}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Reference Number</p>
              <p className="font-medium text-[#111827]">{txn.referenceId}</p>
            </div>
            {txn.supplier && (
              <div>
                <p className="text-xs text-gray-400">Supplier</p>
                <p className="font-medium text-[#111827]">{txn.supplier}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Warehouse</p>
              <p className="font-medium text-[#111827]">{txn.warehouse}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Created By</p>
              <p className="font-medium text-[#111827]">{txn.createdBy}</p>
            </div>
          </div>
        </section>

        {txn.remarks && (
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs text-gray-400">Remarks</p>
            <p className="mt-1 text-sm text-gray-600">{txn.remarks}</p>
          </section>
        )}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">
            Linked Modules
          </h3>
          <div className="flex flex-wrap gap-2">
            {(
              Object.entries(MODULE_CONFIG) as [
                LedgerLinkedModule,
                (typeof MODULE_CONFIG)[LedgerLinkedModule],
              ][]
            ).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = key === txn.linkedModule;
              return (
                <span
                  key={key}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                    isActive
                      ? config.color
                      : "bg-gray-50 text-gray-400"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </span>
              );
            })}
          </div>
        </section>
      </motion.div>
    </Modal>
  );
}
