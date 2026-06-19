"use client";

import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { AnalyticsDeliveryPerformance } from "@/types";

interface DeliveryPerformanceCardProps {
  data: AnalyticsDeliveryPerformance;
}

const SEGMENTS = [
  { key: "onTime" as const, label: "On-Time Deliveries", color: "#22C55E" },
  { key: "minorDelay" as const, label: "Minor Delay (<2h)", color: "#F59E0B" },
  { key: "criticalDelay" as const, label: "Critical Delay (>4h)", color: "#EF4444" },
];

export function DeliveryPerformanceCard({ data }: DeliveryPerformanceCardProps) {
  const chartData = SEGMENTS.map((seg) => ({
    name: seg.label,
    value: data[seg.key],
    color: seg.color,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      whileHover={{ y: -2 }}
      className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-4 text-sm font-semibold text-[#111827]">
        Delivery Performance
      </h3>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative mx-auto h-44 w-44 min-h-[176px] min-w-[176px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#111827]">
              {data.avgLagHours}h
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Avg Lag
            </span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-3 pt-2">
          {SEGMENTS.map((seg, index) => (
            <motion.div
              key={seg.key}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-gray-600">{seg.label}</span>
              </div>
              <span className="font-semibold text-[#111827]">
                {data[seg.key]}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
