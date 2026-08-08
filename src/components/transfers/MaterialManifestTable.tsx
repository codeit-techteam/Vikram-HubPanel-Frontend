"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ManifestMaterial, ManifestMaterialStatus } from "@/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  ManifestMaterialStatus,
  "default" | "info" | "success" | "secondary"
> = {
  loaded: "default",
  in_transit: "info",
  delivered: "success",
  pending: "secondary",
};

const STATUS_LABEL: Record<ManifestMaterialStatus, string> = {
  loaded: "Loaded",
  in_transit: "In Transit",
  delivered: "Delivered",
  pending: "Pending",
};

interface MaterialManifestTableProps {
  materials: ManifestMaterial[];
}

export function MaterialManifestTable({ materials }: MaterialManifestTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.16 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#111827]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Package className="h-4 w-4 text-[#FF6B00]" />
            </div>
            Material Manifest
          </CardTitle>
          <span className="text-xs font-medium text-gray-500">
            {materials.length} Items Total
          </span>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-y border-[#E5E7EB] text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Unit</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material, index) => (
                  <motion.tr
                    key={material.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-[#111827]">
                          {material.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">
                      {formatNumber(material.quantity)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={STATUS_VARIANT[material.status]}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wide",
                          material.status === "loaded" &&
                            "border-transparent bg-orange-100 text-[#FF6B00]"
                        )}
                      >
                        {STATUS_LABEL[material.status]}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
