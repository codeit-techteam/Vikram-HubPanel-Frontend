"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { parseStockUnit, parseStockValue } from "@/store/requisitionStore";
import type { InventoryFilterOption, InventoryProduct } from "@/types";

interface SelectMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: InventoryProduct[];
  categories: InventoryFilterOption[];
  selectedProductIds: string[];
  onSelect: (product: InventoryProduct) => void;
}

export function SelectMaterialModal({
  open,
  onOpenChange,
  products,
  categories,
  selectedProductIds,
  onSelect,
}: SelectMaterialModalProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "all" || product.categoryKey === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch("");
      setCategory("all");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-[#111827]">
            Select Material
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl border-[#E5E7EB] pl-9"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500">Filter By Category</p>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 rounded-xl border-[#E5E7EB]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto px-6 py-2">
          {filteredProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No materials found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const stock = parseStockValue(product.currentStock);
                const unit = parseStockUnit(product.currentStock);

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isSelected}
                    onClick={() => onSelect(product)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3 text-left transition-colors hover:border-[#FF6B00] hover:bg-orange-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#111827]">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {product.sku} · {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {stock} {unit}
                      </p>
                      {isSelected && (
                        <p className="text-xs text-[#FF6B00]">Already added</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[#E5E7EB] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => handleClose(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
