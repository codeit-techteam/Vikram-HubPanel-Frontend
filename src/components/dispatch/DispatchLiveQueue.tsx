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
import { HUB_OPERATION_STATUS_CONFIG } from "@/constants/operationStatus";
import { cn } from "@/lib/utils";

const TABS: { id: DispatchQueueTab; label: string }[] = (
  Object.keys(HUB_OPERATION_STATUS_CONFIG) as DispatchQueueTab[]
).map((id) => ({
  id,
  label: HUB_OPERATION_STATUS_CONFIG[id].label,
}));

export function DispatchLiveQueue() {
  const router = useRouter();
  const {
    filteredQueue,
    filters,
    setTab,
    setQueueSearch,
    setSortBy,
    openDetails,
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
                placeholder="Search queue..."
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#FF6B00]/50 focus:ring-2 focus:ring-[#FF6B00]/20"
              />
            </div>
            <Select
              value={filters.sortBy}
              onValueChange={(v) => setSortBy(v as DispatchSortField)}
            >
              <SelectTrigger className="h-10 w-[130px] rounded-xl border-[#E5E7EB]">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eta">By ETA</SelectItem>
                <SelectItem value="priority">By Priority</SelectItem>
                <SelectItem value="driver">By Driver</SelectItem>
                <SelectItem value="vehicle">By Vehicle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredQueue.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Inbox className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  No dispatches in this queue
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-xl"
                  onClick={() => router.push("/dispatch")}
                >
                  View Planning Center
                </Button>
              </motion.div>
            ) : (
              filteredQueue.map((item, index) => (
                <DispatchQueueCard
                  key={item.id}
                  dispatch={item}
                  index={index}
                  onClick={openDetails}
                />
              ))
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
