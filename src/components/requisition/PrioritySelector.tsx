"use client";

import { cn } from "@/lib/utils";
import type { RequisitionFormPriority } from "@/types";

const PRIORITY_OPTIONS: {
  value: RequisitionFormPriority;
  label: string;
  activeClass: string;
}[] = [
  { value: "normal", label: "Normal", activeClass: "bg-gray-700 text-white" },
  { value: "high", label: "High", activeClass: "bg-[#FF6B00] text-white" },
  { value: "urgent", label: "Urgent", activeClass: "bg-[#EF4444] text-white" },
];

interface PrioritySelectorProps {
  value: RequisitionFormPriority;
  onChange: (value: RequisitionFormPriority) => void;
  error?: string;
}

export function PrioritySelector({ value, onChange, error }: PrioritySelectorProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex rounded-xl border border-[#E5E7EB] bg-gray-50 p-1">
        {PRIORITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              value === option.value
                ? option.activeClass
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
