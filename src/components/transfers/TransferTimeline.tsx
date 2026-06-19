"use client";

import { Check, Circle, Truck } from "lucide-react";
import type { TransferTimelineEvent } from "@/types";
import { cn } from "@/lib/utils";

function TimelineIcon({
  event,
}: {
  event: TransferTimelineEvent;
}) {
  if (event.status === "pending") {
    return <Circle className="h-3 w-3 text-gray-300" />;
  }
  if (event.status === "active") {
    return <Truck className="h-3 w-3 text-[#FF6B00]" />;
  }
  return <Check className="h-3 w-3 text-emerald-500" />;
}

interface TransferTimelineProps {
  events: TransferTimelineEvent[];
}

export function TransferTimeline({ events }: TransferTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const isActive = event.status === "active";
        const isPending = event.status === "pending";
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[9px] top-5 h-full w-px",
                  isActive ? "bg-orange-200" : "bg-gray-100"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                isActive
                  ? "border-orange-200 bg-orange-50"
                  : isPending
                    ? "border-gray-200 bg-gray-50"
                    : "border-emerald-100 bg-emerald-50"
              )}
            >
              <TimelineIcon event={event} />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-[#FF6B00]" : "text-gray-900"
                )}
              >
                {event.title}
              </p>
              {event.subtitle && (
                <p className="mt-0.5 text-xs text-gray-400">{event.subtitle}</p>
              )}
              {event.timestamp && (
                <p className="mt-0.5 text-xs text-gray-400">
                  {event.timestamp}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
