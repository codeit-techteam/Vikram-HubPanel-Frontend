"use client";

import { Cell, Pie, PieChart } from "recharts";
import type { OutboundEfficiency } from "@/types";

interface OutboundEfficiencyChartProps {
  data: OutboundEfficiency;
}

export function OutboundEfficiencyChart({ data }: OutboundEfficiencyChartProps) {
  const chartData = [
    { name: "Dispatched", value: data.dispatched, color: "#FF6B00" },
    { name: "Loading", value: data.loading, color: "#FFB366" },
    { name: "Pending", value: data.pending, color: "#E5E7EB" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Outbound Efficiency
      </h3>

      <div className="relative mx-auto h-44 w-44 min-h-[176px] min-w-[176px]">
        <PieChart width={176} height={176}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={72}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{data.total}</span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
            Total Orders
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
