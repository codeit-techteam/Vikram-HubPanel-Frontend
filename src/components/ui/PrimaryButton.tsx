"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon?: React.ReactNode;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, loading, disabled, icon, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <motion.div
        whileHover={{ scale: isDisabled ? 1 : 1.01 }}
        whileTap={{ scale: isDisabled ? 1 : 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full"
      >
        <button
          ref={ref}
          className={cn(
            "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#E55F00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
            className
          )}
          disabled={isDisabled}
          {...props}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authorizing...</span>
            </>
          ) : (
            <>
              {children}
              {icon}
            </>
          )}
        </button>
      </motion.div>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

export { PrimaryButton };
