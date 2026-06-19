"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { DraftMaterialItem, InventoryProduct } from "@/types";

interface MaterialRowProps {
  material: DraftMaterialItem;
  products: InventoryProduct[];
  onUpdateQty: (rowId: string, qty: number) => void;
  onReplaceProduct: (rowId: string, product: InventoryProduct) => void;
  onRemove: (rowId: string) => void;
  error?: string;
}

export function MaterialRow({
  material,
  products,
  onUpdateQty,
  onReplaceProduct,
  onRemove,
  error,
}: MaterialRowProps) {
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
        <Select
          value={material.productId}
          onValueChange={(productId) => {
            const product = products.find((p) => p.id === productId);
            if (product) onReplaceProduct(material.id, product);
          }}
        >
          <SelectTrigger className="h-10 min-w-[200px] rounded-lg border-[#E5E7EB]">
            <SelectValue>{material.productName}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">
        {material.currentStock}
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          min={0}
          step="0.01"
          value={material.requestedQty || ""}
          onChange={(e) =>
            onUpdateQty(material.id, parseFloat(e.target.value) || 0)
          }
          placeholder="0.00"
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
