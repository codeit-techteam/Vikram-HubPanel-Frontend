"use client";

import { motion } from "framer-motion";
import { Check, Circle, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DispatchTimelineEvent } from "@/types";
import { cn } from "@/lib/utils";

function TimelineIcon({ event }: { event: DispatchTimelineEvent }) {
  if (event.status === "pending") {
    return <Circle className="h-3 w-3 text-gray-300" />;
  }
  if (event.title === "Dispatched" || event.title === "In Transit") {
    return <Truck className="h-3 w-3 text-white" />;
  }
  return <Check className="h-3 w-3 text-white" />;
}

interface DispatchTimelineProps {
  events: DispatchTimelineEvent[];
  compact?: boolean;
}

export function DispatchTimeline({ events, compact }: DispatchTimelineProps) {
  return (
    <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
      {!compact && (
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Dispatch Timeline
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("pt-2", compact && "p-4")}>
        <div className="space-y-0">
          {events.map((event, index) => {
            const isCompleted = event.status === "completed";
            const isActive = event.status === "active";
            const isPending = event.status === "pending";
            const isLast = index === events.length - 1;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {!isLast && (
                  <span
                    className={cn(
                      "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                      isCompleted || isActive ? "bg-orange-200" : "bg-gray-200"
                    )}
                  />
                )}
                <motion.span
                  animate={
                    isActive
                      ? { scale: [1, 1.15, 1] }
                      : {}
                  }
                  transition={
                    isActive
                      ? { repeat: Infinity, duration: 2 }
                      : {}
                  }
                  className={cn(
                    "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    isCompleted
                      ? "bg-[#FF6B00]"
                      : isActive
                        ? "bg-[#FF6B00] ring-4 ring-orange-100"
                        : "border-2 border-gray-200 bg-gray-50"
                  )}
                >
                  <TimelineIcon event={event} />
                </motion.span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isCompleted || isActive
                        ? "text-[#111827]"
                        : "text-gray-400"
                    )}
                  >
                    {event.title}
                  </p>
                  {event.timestamp && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event.timestamp}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
