"use client";

import { motion } from "framer-motion";
import type { AnalyticsConsumptionItem } from "@/types";

interface ProductConsumptionCardProps {
  data: AnalyticsConsumptionItem[];
}

export function ProductConsumptionCard({ data }: ProductConsumptionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      whileHover={{ y: -2 }}
      className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="mb-5 text-sm font-semibold text-[#111827]">
        Product Consumption
      </h3>
      <div className="space-y-5">
        {data.map((item, index) => (
          <div key={item.name}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[#111827]">
                {item.name}
              </span>
              <span className="text-sm font-semibold text-[#111827]">
                {item.percentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{
                  duration: 1,
                  delay: 0.2 + index * 0.1,
                  ease: "easeOut",
                }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
