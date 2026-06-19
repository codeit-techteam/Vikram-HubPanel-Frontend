"use client";

import { motion } from "framer-motion";
import { Check, Circle, Clock, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShipmentTimelineItem } from "@/types";
import { cn } from "@/lib/utils";

function TimelineIcon({ item }: { item: ShipmentTimelineItem }) {
  if (item.status === "pending") {
    return <Circle className="h-3 w-3 text-gray-300" />;
  }
  if (item.title === "Dispatched" && item.status === "completed") {
    return <Truck className="h-3 w-3 text-white" />;
  }
  return <Check className="h-3 w-3 text-white" />;
}

interface ShipmentTimelineProps {
  items: ShipmentTimelineItem[];
}

export function ShipmentTimeline({ items }: ShipmentTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Shipment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="space-y-0">
            {items.map((item, index) => {
              const isCompleted = item.status === "completed";
              const isPending = item.status === "pending";
              const isLast = index === items.length - 1;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.3 }}
                  className="relative flex gap-3 pb-6 last:pb-0"
                >
                  {!isLast && (
                    <span
                      className={cn(
                        "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                        isCompleted ? "bg-orange-200" : "bg-gray-200"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      isCompleted
                        ? "bg-[#FF6B00]"
                        : isPending
                          ? "border-2 border-gray-200 bg-gray-50"
                          : "bg-orange-100"
                    )}
                  >
                    <TimelineIcon item={item} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isCompleted ? "text-[#111827]" : "text-gray-400"
                      )}
                    >
                      {item.title}
                    </p>
                    {item.timestamp && (
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          isPending ? "text-gray-400" : "text-gray-500"
                        )}
                      >
                        {item.timestamp}
                      </p>
                    )}
                    {item.highlight && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#FF6B00]">
                        <Clock className="h-3 w-3" />
                        {item.highlight}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
