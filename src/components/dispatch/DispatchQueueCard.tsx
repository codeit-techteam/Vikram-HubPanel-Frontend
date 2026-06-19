"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Truck } from "lucide-react";
import type { DispatchRecord } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { DispatchStatusBadge } from "./DispatchStatusBadge";

interface DispatchQueueCardProps {
  dispatch: DispatchRecord;
  index?: number;
  onClick: (dispatch: DispatchRecord) => void;
}

export function DispatchQueueCard({
  dispatch,
  index = 0,
  onClick,
}: DispatchQueueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Card
        className="cursor-pointer overflow-hidden rounded-2xl border-[#E5E7EB] shadow-sm transition-shadow hover:shadow-md"
        onClick={() => onClick(dispatch)}
      >
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#111827]">
                {dispatch.orderNo}
              </span>
              <DispatchStatusBadge status={dispatch.status} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Scheduled
              </p>
              <p className="text-xs font-semibold text-gray-700">
                {dispatch.schedule}
              </p>
            </div>
          </div>

          <h3 className="mb-4 text-base font-bold text-[#111827]">
            {dispatch.customer}
          </h3>

          <div className="mb-4 grid grid-cols-2 gap-4 rounded-xl bg-[#F8F9FB] p-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Vehicle
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-gray-900">
                <Truck className="h-3.5 w-3.5 text-gray-400" />
                {dispatch.vehicle}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Driver
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {dispatch.driver}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {dispatch.route}
            </span>
            <span className="flex items-center gap-1 font-semibold text-[#FF6B00]">
              <Clock className="h-3.5 w-3.5" />
              ETA: {dispatch.eta}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
