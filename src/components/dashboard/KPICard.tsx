"use client";

import { motion } from "framer-motion";
import type { DashboardKpi } from "@/types";
import { cn } from "@/lib/utils";

interface KPICardProps {
  kpi: DashboardKpi;
  isClickable?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function KPICard({
  kpi,
  isClickable = false,
  isActive = false,
  onClick,
}: KPICardProps) {
  const isAlert = kpi.variant === "alert";
  const isPrimary = kpi.variant === "primary";

  const baseClass = cn(
    // Fixed height so every card in both rows is identical
    "flex h-[110px] w-full flex-col justify-between rounded-xl border p-4 transition-all",
    isClickable && "cursor-pointer select-none",
    isActive
      ? "border-[#FF6B00] bg-orange-50/50 shadow-md ring-2 ring-[#FF6B00]/25"
      : isAlert
        ? "border-red-100 bg-red-50"
        : "border-gray-200 bg-white",
    !isActive && isClickable && "hover:border-[#FF6B00]/40 hover:shadow-md"
  );

  const content = (
    <>
      {/* Top row: label */}
      <div className="flex items-start justify-between gap-1">
        <p
          className={cn(
            "text-[10px] font-semibold uppercase leading-tight tracking-wide",
            isActive
              ? "text-[#FF6B00]"
              : isAlert
                ? "text-red-500"
                : "text-gray-500"
          )}
        >
          {kpi.label}
        </p>
      </div>

      {/* Middle: value */}
      <p
        className={cn(
          "text-2xl font-bold leading-none",
          isActive
            ? "text-[#FF6B00]"
            : isAlert
              ? "text-red-600"
              : isPrimary
                ? "text-[#FF6B00]"
                : "text-gray-900"
        )}
      >
        {kpi.value}
      </p>

      {/* Bottom: sublabel or filter hint */}
      <p
        className={cn(
          "truncate text-[10px] leading-none",
          isActive ? "font-medium text-[#FF6B00]" : "text-gray-400"
        )}
      >
        {isActive ? "Click to clear filter" : (kpi.sublabel ?? "\u00a0")}
      </p>
    </>
  );

  if (isClickable && onClick) {
    return (
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(baseClass, "text-left")}
        onClick={onClick}
        aria-pressed={isActive}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={baseClass}
    >
      {content}
    </motion.div>
  );
}
