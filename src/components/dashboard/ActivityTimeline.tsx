"use client";

import Link from "next/link";
import type { ActivityLog, ActivityLogType } from "@/types";
import {
  DashboardTimeFilter,
  isWithinDashboardPeriod,
  type DashboardTimePeriod,
} from "@/components/dashboard/DashboardTimeFilter";
import { cn } from "@/lib/utils";

const LOG_DOT_COLORS: Record<ActivityLogType, string> = {
  dispatch: "bg-blue-500",
  order: "bg-emerald-500",
  requisition: "bg-purple-500",
  transfer: "bg-amber-600",
  packing: "bg-indigo-500",
  accept: "bg-teal-500",
  alert: "bg-[#FF6B00]",
};

interface ActivityTimelineProps {
  logs: ActivityLog[];
  period: DashboardTimePeriod;
  selectedMonth: number;
  onPeriodChange: (period: DashboardTimePeriod) => void;
  onMonthChange: (month: number) => void;
}

export function ActivityTimeline({
  logs,
  period,
  selectedMonth,
  onPeriodChange,
  onMonthChange,
}: ActivityTimelineProps) {
  const filteredLogs = logs.filter((log) =>
    isWithinDashboardPeriod(log.scheduledDate, period, selectedMonth)
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Recent Activity
        </h3>
        <DashboardTimeFilter
          period={period}
          selectedMonth={selectedMonth}
          onPeriodChange={onPeriodChange}
          onMonthChange={onMonthChange}
          compact
        />
      </div>

      <div className="space-y-0">
        {filteredLogs.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            No activity for the selected period.
          </p>
        ) : (
          filteredLogs.map((log, index) => {
            const content = (
              <>
                <p className="text-sm font-medium text-gray-900">{log.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{log.subtitle}</p>
              </>
            );

            return (
              <div key={log.id} className="relative flex gap-3 pb-5 last:pb-0">
                {index < filteredLogs.length - 1 && (
                  <span className="absolute left-[5px] top-3 h-full w-px bg-gray-100" />
                )}
                <span
                  className={cn(
                    "relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                    LOG_DOT_COLORS[log.type]
                  )}
                />
                <div className="min-w-0 flex-1">
                  {log.href ? (
                    <Link
                      href={log.href}
                      className="block rounded-md transition-colors hover:text-[#FF6B00]"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
