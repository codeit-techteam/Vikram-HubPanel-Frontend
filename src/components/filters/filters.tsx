"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FiltersProps {
  statusOptions?: FilterOption[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  hubOptions?: FilterOption[];
  hubValue?: string;
  onHubChange?: (value: string) => void;
  onReset?: () => void;
}

export function Filters({
  statusOptions,
  statusValue,
  onStatusChange,
  hubOptions,
  hubValue,
  onHubChange,
  onReset,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {statusOptions && onStatusChange && (
        <Select value={statusValue} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hubOptions && onHubChange && (
        <Select value={hubValue} onValueChange={onHubChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Hub" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hubs</SelectItem>
            {hubOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  );
}
