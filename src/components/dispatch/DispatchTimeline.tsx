"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, Circle, Package, Truck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DispatchTimelineEvent, OrderOperationalFlags } from "@/types";
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
  operational?: OrderOperationalFlags;
}

function getTimelineAccent(operational?: OrderOperationalFlags) {
  if (operational?.isEmergencyDelivery) {
    return {
      border: "border-red-200",
      banner: "bg-red-50 border-red-200 text-red-700",
      icon: Zap,
      label: "Emergency Delivery",
    };
  }
  if (operational?.isBulkProcurement) {
    return {
      border: "border-blue-200",
      banner: "bg-blue-50 border-blue-200 text-blue-700",
      icon: Package,
      label: "Bulk Order",
    };
  }
  if (operational?.isPriorityDelivery) {
    return {
      border: "border-amber-200",
      banner: "bg-amber-50 border-amber-200 text-amber-700",
      icon: AlertTriangle,
      label: "Priority Delivery",
    };
  }
  return null;
}

export function DispatchTimeline({ events, compact, operational }: DispatchTimelineProps) {
  const accent = getTimelineAccent(operational);
  const AccentIcon = accent?.icon;

  return (
    <Card
      className={cn(
        "rounded-2xl bg-white shadow-sm",
        accent ? accent.border : "border-[#E5E7EB]"
      )}
    >
      {!compact && (
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Dispatch Timeline
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("pt-2", compact && "p-4")}>
        {accent && AccentIcon && (
          <div
            className={cn(
              "mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold",
              accent.banner
            )}
          >
            <AccentIcon className="h-3.5 w-3.5 shrink-0" />
            {accent.label}
          </div>
        )}

        <div className="mb-3 flex flex-wrap gap-1.5">
          {operational?.isEmergencyDelivery && (
            <Badge variant="destructive" className="text-[10px]">
              Emergency
            </Badge>
          )}
          {operational?.isBulkProcurement && (
            <Badge variant="info" className="text-[10px]">
              Bulk
            </Badge>
          )}
          {operational?.isPriorityDelivery && (
            <Badge variant="warning" className="text-[10px]">
              Priority
            </Badge>
          )}
        </div>

        <div className="space-y-0">
          {events.map((event, index) => {
            const isCompleted = event.status === "completed";
            const isActive = event.status === "active";
            const isLast = index === events.length - 1;
            const isHighlighted = Boolean(event.highlight);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className={cn(
                  "relative flex gap-3 pb-5 last:pb-0",
                  isHighlighted && "rounded-lg bg-orange-50/60 px-2 py-1 -mx-2"
                )}
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
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
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
