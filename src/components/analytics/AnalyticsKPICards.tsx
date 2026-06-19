"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { KPICard } from "@/components/dashboard/KPICard";
import type { AnalyticsOverview, DashboardKpi } from "@/types";

interface AnalyticsKPICardsProps {
  overview: AnalyticsOverview;
}

function parseNumericValue(value: string): { num: number; suffix: string } {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: 0, suffix: value };
  return { num: parseFloat(match[1]), suffix: match[2] };
}

function AnimatedKPICard({
  kpi,
  index,
  animateValue,
}: {
  kpi: DashboardKpi;
  index: number;
  animateValue: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(kpi.value);
  const { num, suffix } = parseNumericValue(kpi.value);

  useEffect(() => {
    if (!isInView || !animateValue || isNaN(num)) return;

    let frame: number;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;
      const formatted =
        suffix === "x"
          ? `${current.toFixed(1)}${suffix}`
          : suffix === "%"
            ? `${current.toFixed(1)}${suffix}`
            : suffix === " hrs"
              ? `${current.toFixed(1)}${suffix}`
              : suffix.startsWith(" L") || suffix.startsWith("₹")
                ? kpi.value
                : `${current.toFixed(1)}${suffix}`;
      setDisplayValue(formatted);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, animateValue, num, suffix, kpi.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <KPICard kpi={{ ...kpi, value: displayValue }} />
    </motion.div>
  );
}

export function AnalyticsKPICards({ overview }: AnalyticsKPICardsProps) {
  const kpis: DashboardKpi[] = [
    {
      id: "inventory-turnover",
      label: "Inventory Turnover",
      value: overview.inventoryTurnover,
      variant: "primary",
    },
    {
      id: "fulfillment-rate",
      label: "Fulfillment Rate",
      value: overview.fulfillmentRate,
      variant: "primary",
    },
    {
      id: "avg-delivery-time",
      label: "Average Delivery Time",
      value: overview.avgDeliveryTime,
      variant: "primary",
    },
    {
      id: "stock-accuracy",
      label: "Stock Accuracy",
      value: overview.stockAccuracy,
      variant: "primary",
    },
    {
      id: "revenue",
      label: "Revenue",
      value: overview.revenue,
      variant: "primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi, index) => (
        <AnimatedKPICard
          key={kpi.id}
          kpi={kpi}
          index={index}
          animateValue={!kpi.value.startsWith("₹")}
        />
      ))}
    </div>
  );
}
