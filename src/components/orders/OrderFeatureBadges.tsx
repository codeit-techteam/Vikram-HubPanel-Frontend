"use client";

import { AlertTriangle, Package, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OrderOperationalFlags } from "@/types";
import { cn } from "@/lib/utils";

interface OrderFeatureBadgesProps {
  operational?: OrderOperationalFlags;
  className?: string;
}

export function OrderFeatureBadges({
  operational,
  className,
}: OrderFeatureBadgesProps) {
  if (!operational) return null;

  const {
    isEmergencyDelivery,
    isBulkProcurement,
    isPriorityDelivery,
  } = operational;

  const hasBadges =
    isEmergencyDelivery ||
    isBulkProcurement ||
    isPriorityDelivery;

  if (!hasBadges) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {isEmergencyDelivery && (
        <Badge
          variant="destructive"
          className="gap-1 text-[10px] font-semibold uppercase tracking-wide"
        >
          <Zap className="h-3 w-3" />
          Emergency
        </Badge>
      )}
      {isBulkProcurement && (
        <Badge
          variant="secondary"
          className="gap-1 text-[10px] font-semibold uppercase tracking-wide"
        >
          <Package className="h-3 w-3" />
          Bulk
        </Badge>
      )}
      {isPriorityDelivery && (
        <Badge
          variant="warning"
          className="gap-1 text-[10px] font-semibold uppercase tracking-wide"
        >
          <AlertTriangle className="h-3 w-3" />
          Priority
        </Badge>
      )}
    </div>
  );
}
