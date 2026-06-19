"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  PackageCheck,
  Truck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { QuickOperation } from "@/types";

const ICON_MAP: Record<string, LucideIcon> = {
  "user-plus": UserPlus,
  "package-check": PackageCheck,
  truck: Truck,
  "layout-grid": LayoutGrid,
};

interface QuickOperationsProps {
  operations: QuickOperation[];
}

export function QuickOperations({ operations }: QuickOperationsProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Quick Operations
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {operations.map((op, index) => {
          const Icon = ICON_MAP[op.icon] ?? LayoutGrid;
          return (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={op.href}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-colors hover:border-[#FF6B00]/30 hover:bg-[#FFF4EC]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {op.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
