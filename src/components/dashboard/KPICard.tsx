"use client";

import { motion } from "framer-motion";
import type { DashboardKpi } from "@/types";
import { cn } from "@/lib/utils";

interface KPICardProps {
  kpi: DashboardKpi;
}

export function KPICard({ kpi }: KPICardProps) {
  const isAlert = kpi.variant === "alert";
  const isPrimary = kpi.variant === "primary";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-xl border p-5 transition-shadow hover:shadow-md",
        isAlert
          ? "border-red-100 bg-red-50"
          : "border-gray-200 bg-white"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          isAlert ? "text-red-500" : "text-gray-500"
        )}
      >
        {kpi.label}
      </p>
      <p
        className={cn(
          "mt-2 text-3xl font-bold",
          isAlert && "text-red-600",
          isPrimary && "text-[#FF6B00]",
          !isAlert && !isPrimary && "text-gray-900"
        )}
      >
        {kpi.value}
      </p>
      {kpi.sublabel && (
        <p className="mt-1 text-xs text-gray-400">{kpi.sublabel}</p>
      )}
    </motion.div>
  );
}
