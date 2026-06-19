"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Package,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import { useInventoryStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WarehouseUtilizationCard } from "./WarehouseUtilizationCard";
import { cn } from "@/lib/utils";

export function InventorySummary() {
  const { summary, warehouse } = useInventoryStore();

  const cards = [
    {
      id: "total-skus",
      label: "Total SKUs",
      value: summary.totalSkus,
      icon: Package,
      className: "border-gray-200 bg-white",
      iconClassName: "bg-orange-100 text-[#FF6B00]",
      valueClassName: "text-gray-900",
    },
    {
      id: "low-stock",
      label: "Low Stock Items",
      value: String(summary.lowStockItems).padStart(2, "0"),
      icon: TriangleAlert,
      className: "border-orange-100 bg-orange-50",
      iconClassName: "bg-orange-100 text-[#FF6B00]",
      valueClassName: "text-[#FF6B00]",
    },
    {
      id: "out-of-stock",
      label: "Out of Stock",
      value: String(summary.outOfStockItems).padStart(2, "0"),
      icon: AlertCircle,
      className: "border-red-100 bg-red-50",
      iconClassName: "bg-red-100 text-red-500",
      valueClassName: "text-red-600",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Inventory Summary</h3>

      <div className="space-y-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -2 }}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md",
              card.className
            )}
          >
            <div>
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <p
                className={cn(
                  "mt-1 text-2xl font-bold",
                  card.valueClassName
                )}
              >
                {card.value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                card.iconClassName
              )}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </motion.div>
        ))}
      </div>

      <Separator />

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          asChild
          className="w-full gap-2 rounded-xl bg-[#FF6B00] py-5 text-sm font-semibold hover:bg-[#E55F00]"
        >
          <Link href="/requisitions">
            <ShoppingCart className="h-4 w-4" />
            Request Restock
          </Link>
        </Button>
      </motion.div>

      <WarehouseUtilizationCard warehouse={warehouse} />
    </div>
  );
}
