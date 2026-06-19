"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dispatchService } from "@/services/dispatch.service";
import type { DispatchVehicle } from "@/types";

export function FleetStatusCard() {
  const [vehicle, setVehicle] = useState<DispatchVehicle | null>(null);

  useEffect(() => {
    dispatchService.getVehicles().then((vehicles) => {
      setVehicle(vehicles[0] ?? null);
    });
  }, []);

  if (!vehicle) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardContent className="space-y-4 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Active Fleet Status
          </p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                <Truck className="h-4 w-4 text-[#FF6B00]" />
              </div>
              <span className="text-sm font-semibold text-[#111827]">
                {vehicle.registrationNo}
              </span>
            </div>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium capitalize text-[#FF6B00]">
              {vehicle.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Capacity: {vehicle.capacity}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
