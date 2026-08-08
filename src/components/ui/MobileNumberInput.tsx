"use client";

import * as React from "react";
import { normalizeMobile } from "@/mock/createOrderData";
import { cn } from "@/lib/utils";

function formatLocalDigits(digits: string): string {
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

interface MobileNumberInputProps {
  value: string;
  onChange: (digits: string) => void;
  className?: string;
  leadingIcon?: React.ReactNode;
  size?: "default" | "lg";
  id?: string;
}

export function MobileNumberInput({
  value,
  onChange,
  className,
  leadingIcon,
  size = "default",
  id,
}: MobileNumberInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const display = formatLocalDigits(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const cursor = input.selectionStart ?? 0;
    const prevDisplay = display;
    const nextDigits = normalizeMobile(input.value).slice(0, 10);
    const nextDisplay = formatLocalDigits(nextDigits);

    onChange(nextDigits);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;

      let nextCursor = cursor;
      const addedSpace =
        prevDisplay.length <= 5 &&
        nextDisplay.length > 5 &&
        nextDigits.length > 5;
      const removedSpace =
        prevDisplay.length > 5 &&
        nextDisplay.length <= 5 &&
        nextDigits.length <= 5;

      if (addedSpace && cursor >= 5) nextCursor += 1;
      if (removedSpace && cursor > 5) nextCursor -= 1;

      nextCursor = Math.max(0, Math.min(nextCursor, nextDisplay.length));
      inputRef.current.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden border border-gray-200 bg-white ring-offset-white focus-within:ring-2 focus-within:ring-[#FF6B00] focus-within:ring-offset-2",
        size === "lg" ? "h-12 rounded-xl" : "h-10 rounded-md",
        className
      )}
    >
      {leadingIcon && (
        <div className="flex shrink-0 items-center pl-3 text-gray-400">
          {leadingIcon}
        </div>
      )}
      <span
        className={cn(
          "flex shrink-0 items-center text-sm text-gray-500",
          leadingIcon ? "pl-2" : "pl-3"
        )}
      >
        +91
      </span>
      <input
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="98765 43210"
        value={display}
        onChange={handleChange}
        className="min-w-0 flex-1 border-0 bg-transparent py-2 pr-3 text-sm outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
