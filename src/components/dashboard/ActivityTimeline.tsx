"use client";

import type { ActivityLog } from "@/types";
import { cn } from "@/lib/utils";

const LOG_DOT_COLORS: Record<ActivityLog["type"], string> = {
  dispatch: "bg-blue-500",
  alert: "bg-[#FF6B00]",
  gate: "bg-amber-700",
};

interface ActivityTimelineProps {
  logs: ActivityLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Logs</h3>
        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Live
        </span>
      </div>

      <div className="space-y-0">
        {logs.map((log, index) => (
          <div key={log.id} className="relative flex gap-3 pb-5 last:pb-0">
            {index < logs.length - 1 && (
              <span className="absolute left-[5px] top-3 h-full w-px bg-gray-100" />
            )}
            <span
              className={cn(
                "relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                LOG_DOT_COLORS[log.type]
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{log.title}</p>
              <p className="mt-0.5 text-xs text-gray-400">{log.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
