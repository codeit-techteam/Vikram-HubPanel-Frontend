"use client";

import { motion } from "framer-motion";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useLedgerStore } from "@/store";
import type { LedgerTransactionType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TRANSACTION_TYPES: { value: LedgerTransactionType; label: string }[] = [
  { value: "received", label: "Received" },
  { value: "sold", label: "Sold" },
  { value: "returned", label: "Returned" },
  { value: "adjusted", label: "Adjusted" },
  { value: "damaged", label: "Damaged" },
];

const EXTRA_TYPES: { value: LedgerTransactionType; label: string }[] = [];

export function LedgerFilters() {
  const {
    filters,
    products,
    setProduct,
    toggleTransactionType,
    resetFilters,
  } = useLedgerStore();

  const dateLabel = `${format(new Date(filters.dateFrom), "MMM dd, yyyy")} – ${format(new Date(filters.dateTo), "MMM dd, yyyy")}`;

  const visibleTypes = TRANSACTION_TYPES.slice(0, 3);
  const moreTypes = [...TRANSACTION_TYPES.slice(3), ...EXTRA_TYPES];
  const hasMoreActive = moreTypes.some((t) =>
    filters.transactionTypes.includes(t.value)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="sticky top-16 z-10 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm lg:static"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-4 text-sm text-[#111827]"
        >
          <CalendarIcon className="h-4 w-4 text-gray-400" />
          {dateLabel}
        </button>

        <Select value={filters.product} onValueChange={setProduct}>
          <SelectTrigger className="h-10 w-full rounded-xl border-[#E5E7EB] bg-white lg:w-[180px]">
            <SelectValue placeholder="All Materials" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.value} value={product.value}>
                {product.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {visibleTypes.map((type) => {
            const isActive = filters.transactionTypes.includes(type.value);
            return (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => toggleTransactionType(type.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-[#FF6B00] bg-[#FFF4EC] text-[#FF6B00]"
                    : "border-[#E5E7EB] bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {type.label}
                {isActive && <X className="h-3 w-3" />}
              </motion.button>
            );
          })}

          {moreTypes.map((type) => {
            const isActive = filters.transactionTypes.includes(type.value);
            return (
              <motion.button
                key={type.value}
                type="button"
                onClick={() => toggleTransactionType(type.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-[#FF6B00] bg-[#FFF4EC] text-[#FF6B00]"
                    : "border-[#E5E7EB] bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {type.label}
                {isActive && <X className="h-3 w-3" />}
              </motion.button>
            );
          })}

          {!hasMoreActive && moreTypes.length === 0 && (
            <span className="rounded-full border border-dashed border-[#E5E7EB] px-3 py-1.5 text-xs text-gray-400">
              + More
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="shrink-0 text-xs font-medium text-gray-400 hover:text-[#FF6B00] lg:ml-auto"
        >
          Reset Filters
        </button>
      </div>
    </motion.div>
  );
}
