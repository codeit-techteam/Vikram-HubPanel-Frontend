"use client";

import { motion } from "framer-motion";
import {
  Box,
  Layers,
  Mountain,
  Package,
  Pipette,
  type LucideIcon,
} from "lucide-react";
import type { InventoryProduct } from "@/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  package: Package,
  layers: Layers,
  mountain: Mountain,
  box: Box,
  pipette: Pipette,
};

interface InventoryRowProps {
  product: InventoryProduct;
  index: number;
}

export function InventoryRow({ product, index }: InventoryRowProps) {
  const Icon = ICON_MAP[product.icon] ?? Package;
  const isLowStock = product.status === "low_stock";
  const isOutOfStock = product.status === "out_of_stock";

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ backgroundColor: isOutOfStock ? "#FEF2F2" : "#F9FAFB" }}
      className={cn(
        "border-b border-gray-50 transition-colors last:border-0",
        isOutOfStock && "bg-red-50/60"
      )}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              isOutOfStock
                ? "bg-red-100 text-red-500"
                : isLowStock
                  ? "bg-orange-100 text-[#FF6B00]"
                  : "bg-gray-100 text-gray-500"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-400">{product.description}</p>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4 font-mono text-sm text-gray-600">
        {product.sku}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
        {product.category}
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-5 py-4 text-sm font-semibold",
          isLowStock && "text-[#FF6B00]",
          isOutOfStock && "text-red-600",
          !isLowStock && !isOutOfStock && "text-gray-900"
        )}
      >
        {product.currentStock}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
        {product.reserved}
      </td>
    </motion.tr>
  );
}
