"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { WarehouseUtilization } from "@/types";

interface WarehouseUtilizationCardProps {
  warehouse: WarehouseUtilization;
}

export function WarehouseUtilizationCard({
  warehouse,
}: WarehouseUtilizationCardProps) {
  const backgroundImage = warehouse.backgroundImage?.trim();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative overflow-hidden rounded-xl"
    >
      <div className="relative h-40 w-full">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt="Warehouse"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            {warehouse.label}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {warehouse.capacityUsed}%
            </span>
          </div>
          <p className="mt-0.5 text-xs text-white/80">
            {warehouse.description}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${warehouse.capacityUsed}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full bg-[#FF6B00]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
