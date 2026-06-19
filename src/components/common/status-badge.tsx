import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "@/constants/theme";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const variantMap: Record<string, "success" | "warning" | "destructive" | "info" | "secondary"> = {
  active: "success",
  delivered: "success",
  received: "success",
  approved: "info",
  dispatched: "info",
  in_transit: "info",
  pending: "warning",
  low_stock: "warning",
  rejected: "destructive",
  cancelled: "destructive",
  critical: "destructive",
  inactive: "secondary",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.replace(/_/g, " ");
  const variant = variantMap[status] ?? "secondary";

  return (
    <Badge
      variant={variant}
      className={cn(
        "capitalize",
        STATUS_COLORS[status],
        className
      )}
    >
      {label}
    </Badge>
  );
}
