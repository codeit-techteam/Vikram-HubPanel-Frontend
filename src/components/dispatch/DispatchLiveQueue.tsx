"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Filter, Inbox, Search } from "lucide-react";
import { useDispatchStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DispatchQueueCard } from "./DispatchQueueCard";
import type { DispatchQueueTab, DispatchSortField } from "@/types";
import { cn } from "@/lib/utils";

const TABS: { id: DispatchQueueTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "preparing", label: "Preparing" },
  { id: "assigned", label: "Assigned" },
  { id: "in_transit", label: "In Transit" },
];

export function DispatchLiveQueue() {
  const router = useRouter();
  const {
    filteredQueue,
    filters,
    setTab,
    setQueueSearch,
    setSortBy,
  } = useDispatchStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-[#111827]">
            Live Queue
          </CardTitle>
          <div className="mt-3 flex gap-1 border-b border-[#E5E7EB]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  filters.tab === tab.id
                    ? "text-[#FF6B00]"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
                {filters.tab === tab.id && (
                  <motion.span
                    layoutId="queue-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00]"
                  />
                )}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={filters.queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                placeholder="Filter queue..."
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-[#FF6B00] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20"
              />
            </div>
            <Select
              value={filters.sortBy}
              onValueChange={(v) => setSortBy(v as DispatchSortField)}
            >
              <SelectTrigger className="h-10 w-[120px] rounded-xl border-[#E5E7EB]">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eta">ETA</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredQueue.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8F9FB] py-12"
              >
                <Inbox className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500">
                  No dispatches in this queue
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredQueue.map((dispatch, index) => (
                  <DispatchQueueCard
                    key={dispatch.id}
                    dispatch={dispatch}
                    index={index}
                    onClick={() => router.push(`/dispatch/${dispatch.dispatchNo}`)}
                  />
                ))}
                <div className="flex items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] py-6">
                  <p className="flex items-center gap-2 text-xs text-gray-400">
                    <Inbox className="h-4 w-4" />
                    End of immediate queue
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
