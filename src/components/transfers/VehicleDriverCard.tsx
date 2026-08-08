"use client";

import { motion } from "framer-motion";
import { Phone, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TransferDriver, VehicleDetails } from "@/types";
import { cn } from "@/lib/utils";

interface VehicleDriverCardProps {
  driver: TransferDriver;
  vehicle: VehicleDetails;
}

export function VehicleDriverCard({ driver, vehicle }: VehicleDriverCardProps) {
  const handleCall = () => {
    window.open(`tel:${driver.phone.replace(/\s/g, "")}`, "_self");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#111827]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Truck className="h-4 w-4 text-[#FF6B00]" />
            </div>
            Vehicle & Driver Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 text-lg font-bold text-[#FF6B00]">
                  {driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
                    driver.name === "Unassigned" ? "bg-gray-300" : "bg-emerald-500"
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Driver Name
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#111827]">
                  {driver.name}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Contact Number
                </p>
                <p className="mt-0.5 text-sm text-gray-600">{driver.phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Vehicle Number
                </p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  {vehicle.number}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Vehicle Type
                </p>
                <p className="mt-1 text-sm font-semibold text-[#111827]">
                  {vehicle.type}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#E5E7EB] pt-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Capacity
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111827]">
                {vehicle.capacity}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Current Status
              </p>
              <p className="mt-1 text-sm font-semibold text-[#FF6B00]">
                {vehicle.status}
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={handleCall}
              disabled={driver.name === "Unassigned"}
              className="h-11 w-full rounded-xl bg-[#FF6B00] text-sm font-semibold hover:bg-[#E55F00] sm:w-auto sm:px-8"
            >
              <Phone className="h-4 w-4" />
              Call Driver
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
