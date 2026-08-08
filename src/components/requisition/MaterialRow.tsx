"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DraftMaterialItem } from "@/types";

interface MaterialRowProps {
  material: DraftMaterialItem;
  onUpdateQty: (rowId: string, qty: number) => void;
  onRemove: (rowId: string) => void;
  error?: string;
}

export function MaterialRow({
  material,
  onUpdateQty,
  onRemove,
  error,
}: MaterialRowProps) {
  const warehouseCap =
    typeof material.warehouseStock === "number" ? material.warehouseStock : undefined;

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="border-b border-[#E5E7EB] last:border-0"
    >
      <td className="px-4 py-3">
        <div className="min-w-[200px]">
          <p className="text-sm font-medium text-[#111827]">{material.productName}</p>
          <p className="text-xs text-gray-500">SKU: {material.sku || "—"}</p>
          {warehouseCap != null && (
            <p className="text-xs text-gray-400">
              Warehouse: {warehouseCap} {material.unit}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {material.currentStock}
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min={0}
          max={warehouseCap != null && warehouseCap > 0 ? warehouseCap : undefined}
          step="1"
          value={material.requestedQty || ""}
          onChange={(e) => {
            const qty = parseFloat(e.target.value) || 0;
            if (warehouseCap != null && warehouseCap >= 0 && qty > warehouseCap) {
              onUpdateQty(material.id, warehouseCap);
              return;
            }
            onUpdateQty(material.id, qty);
          }}
          placeholder="0"
          className="h-10 w-24 rounded-lg border-[#E5E7EB]"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{material.unit}</td>
      <td className="px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(material.id)}
          className="h-9 w-9 text-[#EF4444] hover:bg-red-50 hover:text-[#EF4444]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </motion.tr>
  );
}
