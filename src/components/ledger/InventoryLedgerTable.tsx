"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Box,
  BrickWall,
  Droplets,
  Layers,
  Package,
} from "lucide-react";
import { useLedgerStore } from "@/store";
import type { LedgerTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import {
  TransactionTypeBadge,
  getChangeColor,
} from "./TransactionTypeBadge";
import { cn, formatNumber } from "@/lib/utils";

const COLUMNS = [
  "Date",
  "Transaction Type",
  "Product & SKU",
  "Opening Stock",
  "Change",
  "Closing Stock",
] as const;

function ProductIcon({ sku }: { sku: string }) {
  if (sku.includes("STL")) return <Layers className="h-4 w-4 text-gray-400" />;
  if (sku.includes("CMT")) return <Package className="h-4 w-4 text-gray-400" />;
  if (sku.includes("BRK")) return <BrickWall className="h-4 w-4 text-gray-400" />;
  if (sku.includes("PNT")) return <Droplets className="h-4 w-4 text-gray-400" />;
  return <Box className="h-4 w-4 text-gray-400" />;
}

function formatStock(value: number, unit: string): string {
  const formatted =
    value % 1 === 0 ? formatNumber(value) : value.toFixed(2);
  return `${formatted} ${unit}`;
}

function LedgerRow({
  transaction,
  index,
}: {
  transaction: LedgerTransaction;
  index: number;
}) {
  const { openTransaction } = useLedgerStore();
  const changeColor = getChangeColor(transaction.type);
  const changeSign = transaction.change > 0 ? "+" : "";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ backgroundColor: "#F8F9FB" }}
      onClick={() => openTransaction(transaction)}
      className="cursor-pointer border-b border-gray-50 transition-colors"
    >
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[#111827]">
          {format(new Date(transaction.date), "MMM dd, yyyy")}
        </p>
        <p className="text-xs text-gray-400">
          {format(new Date(transaction.date), "hh:mm a")}
        </p>
      </td>
      <td className="px-5 py-4">
        <TransactionTypeBadge type={transaction.type} />
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FB]">
            <ProductIcon sku={transaction.sku} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">
              {transaction.product}
            </p>
            <p className="text-xs text-gray-400">{transaction.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {formatStock(transaction.openingStock, transaction.openingStockUnit)}
      </td>
      <td className={cn("px-5 py-4 text-sm font-semibold", changeColor)}>
        {changeSign}
        {transaction.change % 1 === 0
          ? formatNumber(Math.abs(transaction.change))
          : Math.abs(transaction.change).toFixed(2)}{" "}
        {transaction.changeUnit}
      </td>
      <td className="px-5 py-4 text-sm font-medium text-[#111827]">
        {formatStock(transaction.closingStock, transaction.closingStockUnit)}
      </td>
    </motion.tr>
  );
}

function LedgerCard({
  transaction,
  index,
}: {
  transaction: LedgerTransaction;
  index: number;
}) {
  const { openTransaction } = useLedgerStore();
  const changeColor = getChangeColor(transaction.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -1 }}
      onClick={() => openTransaction(transaction)}
      className="cursor-pointer rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm md:hidden"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[#111827]">
            {transaction.product}
          </p>
          <p className="text-xs text-gray-400">{transaction.sku}</p>
        </div>
        <TransactionTypeBadge type={transaction.type} />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {format(new Date(transaction.date), "MMM dd, yyyy · hh:mm a")}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-400">Opening</p>
          <p className="font-medium text-gray-600">
            {formatStock(transaction.openingStock, transaction.openingStockUnit)}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Change</p>
          <p className={cn("font-semibold", changeColor)}>
            {transaction.change > 0 ? "+" : ""}
            {transaction.change} {transaction.changeUnit}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Closing</p>
          <p className="font-medium text-[#111827]">
            {formatStock(transaction.closingStock, transaction.closingStockUnit)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function InventoryLedgerTable() {
  const { transactions, pagination, setCurrentPage, loading } =
    useLedgerStore();

  const { page, pageSize, total, totalPages } = pagination;
  const startEntry = (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, total);

  const pageNumbers = Array.from(
    { length: Math.min(totalPages, 3) },
    (_, i) => i + 1
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {COLUMNS.map((col) => (
                <th key={col} className="px-5 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  No ledger entries match your filters.
                </td>
              </tr>
            ) : (
              transactions.map((txn, index) => (
                <LedgerRow key={txn.id} transaction={txn} index={index} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {transactions.map((txn, index) => (
          <LedgerCard key={txn.id} transaction={txn} index={index} />
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {startEntry} to {endEntry} of {total} entries
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="border-[#E5E7EB] text-gray-600"
            disabled={page <= 1}
            onClick={() => setCurrentPage(page - 1)}
          >
            Previous
          </Button>

          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              className={cn(
                "min-w-9 border-[#E5E7EB]",
                page === p &&
                  "border-[#FF6B00] bg-[#FF6B00] text-white hover:bg-[#E55F00] hover:text-white"
              )}
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="border-[#E5E7EB] text-gray-600"
            disabled={page >= totalPages}
            onClick={() => setCurrentPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
