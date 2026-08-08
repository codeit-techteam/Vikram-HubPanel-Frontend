"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLedgerStore } from "@/store";

export function InventoryMovementChart() {
  const { chartData, chartLoading } = useLedgerStore();

  if (chartLoading) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold text-[#111827]">
        Inventory In vs Out (30 Days)
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="inflow"
            fill="#FF6B00"
            name="Inflow"
            radius={[3, 3, 0, 0]}
            maxBarSize={12}
          />
          <Bar
            dataKey="outflow"
            fill="#F59E0B"
            name="Outflow"
            radius={[3, 3, 0, 0]}
            maxBarSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
