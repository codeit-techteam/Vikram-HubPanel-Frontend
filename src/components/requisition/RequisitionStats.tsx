"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { useRequisitionStore } from "@/store";
import { cn } from "@/lib/utils";

export function RequisitionStats() {
  const stats = useRequisitionStore((state) => state.stats);

  const cards = [
    {
      id: "open",
      label: "Open Requests",
      value: String(stats.openRequests.value).padStart(2, "0"),
      badge: stats.openRequests.badge,
      badgeClassName: "bg-emerald-50 text-emerald-600",
      icon: ClipboardList,
      iconClassName: "bg-blue-100 text-blue-600",
      className: "border-gray-200 bg-white",
    },
    {
      id: "approved",
      label: "Approved Requests",
      value: String(stats.approvedRequests.value).padStart(2, "0"),
      badge: stats.approvedRequests.badge,
      badgeClassName: "bg-gray-100 text-gray-500",
      icon: CheckCircle2,
      iconClassName: "bg-emerald-100 text-emerald-600",
      className: "border-gray-200 bg-white",
    },
    {
      id: "delayed",
      label: "Delayed Requests",
      value: String(stats.delayedRequests.value).padStart(2, "0"),
      badge: stats.delayedRequests.badge,
      badgeClassName: "bg-red-100 text-red-600",
      icon: AlertTriangle,
      iconClassName: "bg-red-100 text-red-500",
      className: "border-red-200 bg-red-50/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -2 }}
          className={cn(
            "rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
            card.className
          )}
        >
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                card.iconClassName
              )}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                card.badgeClassName
              )}
            >
              {card.badge}
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-gray-500">{card.label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
