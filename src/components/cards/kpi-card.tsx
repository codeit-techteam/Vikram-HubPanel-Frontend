import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  className,
}: KpiCardProps) {
  const displayValue =
    typeof value === "number" ? formatNumber(value) : value;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <Card className={cn("bg-gray-50 border-gray-100", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{displayValue}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                <TrendIcon
                  className={cn(
                    "h-4 w-4",
                    trend === "up" && "text-emerald-500",
                    trend === "down" && "text-red-500",
                    trend === "neutral" && "text-gray-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-emerald-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-gray-500"
                  )}
                >
                  {change > 0 ? "+" : ""}
                  {change}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF4EC]">
            <Icon className="h-6 w-6 text-[#FF6B00]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
