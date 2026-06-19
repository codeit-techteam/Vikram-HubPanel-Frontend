"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Pending", color: "bg-gray-400" },
  { label: "Approved", color: "bg-blue-500" },
  { label: "Allocated", color: "bg-purple-500" },
  { label: "In Transit", color: "bg-[#FF6B00]" },
  { label: "Delivered", color: "bg-emerald-500" },
  { label: "Received", color: "bg-teal-500" },
] as const;

export function WorkflowStatusLegend() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Workflow Stages:
        </span>
        {STAGES.map((stage, index) => (
          <div key={stage.label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", stage.color)} />
              <span className="text-xs font-medium text-gray-600">
                {stage.label}
              </span>
            </div>
            {index < STAGES.length - 1 && (
              <ChevronRight className="h-3 w-3 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
