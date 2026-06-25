"use client";

import { cn } from "@/lib/utils";

export type DashboardTimePeriod =
  | "today"
  | "yesterday"
  | "one_week"
  | "month"
  | "month_wise";

const PERIOD_OPTIONS: { value: DashboardTimePeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "one_week", label: "One Week" },
  { value: "month", label: "Month" },
  { value: "month_wise", label: "Month Wise" },
];

const MONTH_OPTIONS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

interface DashboardTimeFilterProps {
  period: DashboardTimePeriod;
  selectedMonth: number;
  onPeriodChange: (period: DashboardTimePeriod) => void;
  onMonthChange: (month: number) => void;
  className?: string;
  compact?: boolean;
}

export function DashboardTimeFilter({
  period,
  selectedMonth,
  onPeriodChange,
  onMonthChange,
  className,
  compact = false,
}: DashboardTimeFilterProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex flex-wrap gap-1">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onPeriodChange(option.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              period === option.value
                ? "bg-[#FF6B00] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {period === "month_wise" && (
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className={cn(
            "rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700",
            compact && "max-w-[120px]"
          )}
        >
          {MONTH_OPTIONS.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isWithinDashboardPeriod(
  dateStr: string,
  period: DashboardTimePeriod,
  selectedMonth: number,
  referenceDate = new Date()
): boolean {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return true;

  const today = startOfDay(referenceDate);

  switch (period) {
    case "today":
      return date >= today && date <= endOfDay(referenceDate);
    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return date >= yesterday && date <= endOfDay(yesterday);
    }
    case "one_week": {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      return date >= weekAgo && date <= endOfDay(referenceDate);
    }
    case "month": {
      const monthStart = new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        1
      );
      return date >= monthStart && date <= endOfDay(referenceDate);
    }
    case "month_wise": {
      const year = referenceDate.getFullYear();
      const monthStart = new Date(year, selectedMonth, 1);
      const monthEnd = endOfDay(new Date(year, selectedMonth + 1, 0));
      return date >= monthStart && date <= monthEnd;
    }
    default:
      return true;
  }
}
