"use client";

import { motion } from "framer-motion";
import { Clock, TrendingUp, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatchStore } from "@/store";

export function FleetStatsCard() {
  const fleet = useDispatchStore((state) => state.fleet);

  if (!fleet) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
      >
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
                <Truck className="h-4 w-4 text-[#FF6B00]" />
              </div>
              <p className="text-xs font-medium text-gray-500">Active Fleet</p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-[#111827]">
                {fleet.activeFleet.current}
                <span className="text-base font-normal text-gray-400">
                  /{fleet.activeFleet.total}
                </span>
              </p>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                <TrendingUp className="h-3 w-3" />+
                {fleet.activeFleet.changePercent}%
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-500">
                Avg. Hub Exit
              </p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-[#111827]">
                {fleet.avgHubExit.minutes}
                <span className="text-base font-normal text-gray-400">m</span>
              </p>
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                {fleet.avgHubExit.status}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
