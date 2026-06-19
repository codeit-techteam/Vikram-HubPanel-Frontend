"use client";

import { motion } from "framer-motion";
import {
  Check,
  Home,
  Phone,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRequisitionStore } from "@/store";
import type { TimelineEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function TimelineIcon({ event }: { event: TimelineEvent }) {
  if (event.status === "pending") {
    return <Home className="h-3.5 w-3.5 text-gray-400" />;
  }
  if (event.status === "active" && event.type === "tracking") {
    return <Truck className="h-3.5 w-3.5 text-[#FF6B00]" />;
  }
  return <Check className="h-3.5 w-3.5 text-blue-500" />;
}

interface RequestTimelineProps {
  embedded?: boolean;
}

export function RequestTimeline({ embedded = false }: RequestTimelineProps) {
  const selectedRequest = useRequisitionStore((state) => state.selectedRequest);

  if (!selectedRequest) {
    if (embedded) return null;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Select a requisition to view its timeline.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedRequest.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className={
        embedded
          ? undefined
          : "rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      }
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Request Timeline</h3>
        {!embedded && (
          <Badge
            variant="info"
            className="rounded-md px-2 py-0.5 text-[10px] font-bold"
          >
            {selectedRequest.requestId}
          </Badge>
        )}
      </div>

      <div className="space-y-0">
        {selectedRequest.timeline.map((event, index) => {
          const isActive = event.status === "active";
          const isPending = event.status === "pending";
          const isLast = index === selectedRequest.timeline.length - 1;

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
                      : "border-blue-100 bg-blue-50"
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
                  <p className="mt-0.5 text-xs text-gray-400">
                    {event.subtitle}
                  </p>
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

      <div className="mt-5 space-y-2">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button className="w-full gap-2 rounded-xl bg-[#FF6B00] py-5 text-sm font-semibold hover:bg-[#E55F00]">
            <Phone className="h-4 w-4" />
            Contact Driver
          </Button>
        </motion.div>
        <Button
          variant="outline"
          className="w-full rounded-xl border-gray-200 py-5 text-sm font-semibold"
          asChild
        >
          <Link href={`/requisitions/${selectedRequest.requestId}`}>
            View Full Details
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
