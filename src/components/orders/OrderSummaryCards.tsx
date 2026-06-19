"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  IndianRupee,
  ShoppingCart,
} from "lucide-react";
import { useOrdersStore } from "@/store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OrderSummaryCards() {
  const summary = useOrdersStore((state) => state.summary);

  const cards = [
    {
      id: "todays",
      label: "Today's Orders",
      value: formatNumber(summary.todaysOrders),
      icon: ShoppingCart,
      iconClassName: "bg-orange-100 text-[#FF6B00]",
    },
    {
      id: "revenue",
      label: "Revenue",
      value: formatCurrency(summary.revenue),
      icon: IndianRupee,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "pending",
      label: "Pending Deliveries",
      value: formatNumber(summary.pendingDeliveries),
      icon: Clock,
      iconClassName: "bg-amber-100 text-amber-600",
    },
    {
      id: "completed",
      label: "Completed Orders",
      value: formatNumber(summary.completedOrders),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                card.iconClassName
              )}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-[#111827]">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
