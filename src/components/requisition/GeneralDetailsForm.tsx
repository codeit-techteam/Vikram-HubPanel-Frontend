"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PrioritySelector } from "./PrioritySelector";
import type { CreateRequisitionFormData } from "@/types";
import { useAuthStore } from "@/store/authStore";

/** Must match REASON_TO_API keys in requisition.service.ts */
const REQUEST_REASONS = [
  "Low Stock",
  "Upcoming Demand",
  "Emergency Order",
  "Festival Stock",
  "Project Requirement",
  "Other",
] as const;

interface GeneralDetailsFormProps {
  control: Control<CreateRequisitionFormData>;
  errors: FieldErrors<CreateRequisitionFormData>;
  setValue: (
    name: keyof CreateRequisitionFormData,
    value: CreateRequisitionFormData[keyof CreateRequisitionFormData]
  ) => void;
  watch: (name: keyof CreateRequisitionFormData) => CreateRequisitionFormData[keyof CreateRequisitionFormData];
}

export function GeneralDetailsForm({
  control,
  errors,
  setValue,
  watch,
}: GeneralDetailsFormProps) {
  const expectedDate = watch("expectedDate") as string;
  const manager = useAuthStore((state) => state.manager);
  const hubLabel = manager?.hubName || "Assigned Hub";
  const hubId = manager?.hubId || "";

  useEffect(() => {
    if (hubId) {
      setValue("hubId", hubId);
    }
  }, [hubId, setValue]);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Hub Name</Label>
        <Input
          value={hubLabel}
          disabled
          readOnly
          className="h-11 rounded-xl border-[#E5E7EB] bg-gray-50 text-gray-700"
        />
        <Controller
          control={control}
          name="hubId"
          render={({ field }) => (
            <input type="hidden" {...field} value={field.value || hubId} />
          )}
        />
        {errors.hubId && (
          <p className="text-xs text-red-500">{errors.hubId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Priority Level</Label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <PrioritySelector
              value={field.value}
              onChange={field.onChange}
              error={errors.priority?.message}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Expected Requirement Date</Label>
        <Controller
          control={control}
          name="expectedDate"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-11 w-full justify-start rounded-xl border-[#E5E7EB] text-left font-normal",
                    !expectedDate && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedDate
                    ? format(new Date(expectedDate), "dd/MM/yyyy")
                    : "dd/mm/yyyy"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expectedDate ? new Date(expectedDate) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.expectedDate && (
          <p className="text-xs text-red-500">{errors.expectedDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Request Reason</Label>
        <Controller
          control={control}
          name="requestReason"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB]">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.requestReason && (
          <p className="text-xs text-red-500">{errors.requestReason.message}</p>
        )}
      </div>
    </div>
  );
}
