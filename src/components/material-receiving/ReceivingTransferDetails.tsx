"use client";

import { motion } from "framer-motion";
import { Calendar, Truck, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReceivingRecord } from "@/types";

interface ReceivingTransferDetailsProps {
  record: ReceivingRecord;
}

export function ReceivingTransferDetails({ record }: ReceivingTransferDetailsProps) {
  const fields = [
    {
      label: "Transfer Number",
      value: record.transferNumber,
      highlight: true,
    },
    {
      label: "Dispatch Date",
      value: `${record.dispatchDate} • ${record.dispatchTime}`,
      icon: Calendar,
    },
    {
      label: "Vehicle Number",
      value: record.vehicleNumber,
      icon: Truck,
    },
    {
      label: "Driver Name",
      value: record.driverName,
      icon: User,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#111827]">
            <span className="h-4 w-1 rounded-full bg-[#FF6B00]" />
            Transfer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((field, index) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="space-y-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {field.label}
                </p>
                <div className="flex items-center gap-2">
                  {field.icon && (
                    <field.icon className="h-4 w-4 shrink-0 text-[#FF6B00]" />
                  )}
                  <p
                    className={
                      field.highlight
                        ? "inline-flex rounded-lg bg-[#F8F9FB] px-3 py-1.5 text-sm font-bold text-[#111827]"
                        : "text-sm font-medium text-[#111827]"
                    }
                  >
                    {field.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
