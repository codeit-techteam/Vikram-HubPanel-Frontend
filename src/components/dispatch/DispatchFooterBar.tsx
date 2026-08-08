"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useDispatchStore } from "@/store";
import { useSidebarStore } from "@/store";
import { cn } from "@/lib/utils";

export function DispatchFooterBar() {
  const fleet = useDispatchStore((state) => state.fleet);
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-sm",
        isCollapsed ? "md:left-[72px]" : "md:left-[280px]"
      )}
    >
      <div className="flex flex-col items-center justify-between gap-2 px-4 py-2.5 text-xs sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 font-medium text-gray-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Hub Systems Online
        </div>

        <p className="font-medium text-gray-600">
          Active Transits:{" "}
          <span className="text-[#111827]">
            {fleet?.activeTransits ?? 42}
          </span>
          <span className="mx-2 text-gray-300">|</span>
          Pending Load:{" "}
          <span className="text-[#111827]">
            {fleet?.pendingLoadTons ?? 128} Tons
          </span>
        </p>

        <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-gray-500">
          <RefreshCw className="h-3 w-3 animate-spin text-[#FF6B00]" />
          Syncing with Site-Logistics A.I.
        </div>
      </div>
    </motion.div>
  );
}
