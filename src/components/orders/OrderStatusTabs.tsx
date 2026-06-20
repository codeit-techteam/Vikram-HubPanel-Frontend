"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { OrderFilterTab } from "@/types";
import { useOrdersStore } from "@/store";
import { cn } from "@/lib/utils";

const TABS: { id: OrderFilterTab; label: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

export function OrderStatusTabs() {
  const router = useRouter();
  const { filters, setFilterTab } = useOrdersStore();

  const handleTabClick = (tabId: OrderFilterTab) => {
    setFilterTab(tabId);
    const href = tabId === "all" ? "/orders" : `/orders?tab=${tabId}`;
    router.push(href, { scroll: false });
  };

  return (
    <div className="flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
      {TABS.map((tab) => {
        const isActive = filters.tab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              isActive ? "text-white" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="order-tab-indicator"
                className="absolute inset-0 rounded-lg bg-[#FF6B00]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
