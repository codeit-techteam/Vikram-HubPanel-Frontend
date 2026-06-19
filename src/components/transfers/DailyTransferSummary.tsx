"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  PackageOpen,
} from "lucide-react";
import { useTransferStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DailyTransferSummary() {
  const summary = useTransferStore((state) => state.summary);

  const cards = [
    {
      id: "total",
      label: "Total Incoming",
      value: String(summary.totalIncoming).padStart(2, "0"),
      icon: PackageOpen,
      className: "bg-blue-50 border-blue-100",
      iconClassName: "bg-blue-100 text-blue-600",
      valueClassName: "text-blue-700",
    },
    {
      id: "on-time",
      label: "On Time",
      value: String(summary.onTime).padStart(2, "0"),
      icon: CheckCircle2,
      className: "bg-emerald-50 border-emerald-100",
      iconClassName: "bg-emerald-100 text-emerald-600",
      valueClassName: "text-emerald-700",
    },
    {
      id: "delayed",
      label: "Delayed",
      value: String(summary.delayed).padStart(2, "0"),
      icon: AlertTriangle,
      className: "bg-red-50 border-red-100",
      iconClassName: "bg-red-100 text-red-600",
      valueClassName: "text-red-700",
    },
  ];

  return (
    <Card className="rounded-2xl border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">
          Daily Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -2 }}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-shadow hover:shadow-md",
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
      </CardContent>
    </Card>
  );
}
