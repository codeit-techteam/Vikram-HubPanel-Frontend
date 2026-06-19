"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import type { AnalyticsRequisitionVolume } from "@/types";

interface RequisitionVolumeCardProps {
  data: AnalyticsRequisitionVolume;
}

export function RequisitionVolumeCard({ data }: RequisitionVolumeCardProps) {
  const chartData = data.monthly.map((item, index) => ({
    ...item,
    isLatest: index === data.monthly.length - 1,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ y: -2 }}
      className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-4 text-sm font-semibold text-[#111827]">
        Requisition Volume
      </h3>

      <div className="mb-5 flex flex-wrap items-baseline gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Total Requests
          </p>
          <p className="mt-1 text-2xl font-bold text-[#111827]">
            {formatNumber(data.totalRequests)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Completed
          </p>
          <p className="mt-1 text-2xl font-bold text-[#22C55E]">
            {formatNumber(data.completed)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barCategoryGap="25%">
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
            }}
            formatter={(value) => [value, "Requests"]}
          />
          <Bar
            dataKey="value"
            name="Request Volume"
            radius={[4, 4, 0, 0]}
            animationDuration={1200}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.isLatest ? "#FF6B00" : "#FFEDD5"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
