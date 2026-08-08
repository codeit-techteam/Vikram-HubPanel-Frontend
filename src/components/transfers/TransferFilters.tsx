"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTransferStore } from "@/store";
import type { TransferFilterStatus, TransferSortField } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: { value: TransferFilterStatus; label: string }[] = [
  { value: "all", label: "All Transfers" },
  { value: "ready", label: "Ready" },
  { value: "in_transit", label: "In Transit" },
  { value: "arriving_today", label: "Arriving Today" },
  { value: "delayed", label: "Delayed" },
];

const SORT_OPTIONS: { value: TransferSortField; label: string }[] = [
  { value: "eta_asc", label: "ETA (Soonest)" },
  { value: "eta_desc", label: "ETA (Latest)" },
  { value: "status", label: "Status" },
  { value: "transfer_id", label: "Transfer ID" },
];

export function TransferFilters() {
  const { filters, sortBy, setFilter, setSortBy } = useTransferStore();

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-10 -mx-1 overflow-x-auto px-1 pb-1 md:static md:overflow-visible">
        <div className="flex min-w-max gap-2 md:min-w-0 md:flex-wrap">
          {FILTER_OPTIONS.map((option) => {
            const isActive = filters.status === option.value;
            return (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {option.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Sort by:</span>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as TransferSortField)}>
          <SelectTrigger className="h-8 w-auto gap-1 border-0 bg-transparent p-0 text-sm font-semibold text-[#FF6B00] shadow-none focus:ring-0">
            <SelectValue />
            <ChevronDown className="h-4 w-4 text-[#FF6B00]" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
