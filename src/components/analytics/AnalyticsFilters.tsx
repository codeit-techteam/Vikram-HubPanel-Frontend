"use client";

import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/filters/date-range-picker";
import type { AnalyticsDateRangePreset, AnalyticsHubOption } from "@/types";
import { DateRange } from "react-day-picker";

const DATE_RANGE_OPTIONS: { value: AnalyticsDateRangePreset; label: string }[] =
  [
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "last_90_days", label: "Last 90 Days" },
    { value: "custom", label: "Custom Range" },
  ];

interface AnalyticsFiltersProps {
  hubOptions: AnalyticsHubOption[];
  selectedHub: string;
  dateRange: AnalyticsDateRangePreset;
  customDateFrom?: Date;
  customDateTo?: Date;
  lastUpdated: string;
  onHubChange: (hub: string) => void;
  onDateRangeChange: (range: AnalyticsDateRangePreset) => void;
  onCustomDateChange: (range: DateRange | undefined) => void;
}

export function AnalyticsFilters({
  hubOptions,
  selectedHub,
  dateRange,
  customDateFrom,
  customDateTo,
  lastUpdated,
  onHubChange,
  onDateRangeChange,
  onCustomDateChange,
}: AnalyticsFiltersProps) {
  const customRange: DateRange | undefined =
    customDateFrom || customDateTo
      ? { from: customDateFrom, to: customDateTo }
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedHub} onValueChange={onHubChange}>
          <SelectTrigger className="w-[180px] border-[#E5E7EB] bg-[#F8F9FB]">
            <SelectValue placeholder="Select Hub" />
          </SelectTrigger>
          <SelectContent>
            {hubOptions.map((hub) => (
              <SelectItem key={hub.value} value={hub.value}>
                {hub.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={dateRange}
          onValueChange={(v) => onDateRangeChange(v as AnalyticsDateRangePreset)}
        >
          <SelectTrigger className="w-[180px] border-[#E5E7EB] bg-[#F8F9FB]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {dateRange === "custom" && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ duration: 0.25 }}
          >
            <DateRangePicker
              dateRange={customRange}
              onDateRangeChange={onCustomDateChange}
              className="border-[#E5E7EB] bg-[#F8F9FB]"
            />
          </motion.div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Last Updated:{" "}
        <span className="font-medium text-[#111827]">{lastUpdated}</span>
      </p>
    </motion.div>
  );
}
