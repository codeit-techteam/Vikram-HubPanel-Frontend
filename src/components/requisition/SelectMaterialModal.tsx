"use client";

import { useEffect, useMemo, useState } from "react";
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
import { requisitionService } from "@/services/requisition.service";
import type { RequisitionMaterialOption } from "@/types";

interface SelectMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductIds: string[];
  onSelect: (product: RequisitionMaterialOption) => void;
}

export function SelectMaterialModal({
  open,
  onOpenChange,
  selectedProductIds,
  onSelect,
}: SelectMaterialModalProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [materials, setMaterials] = useState<RequisitionMaterialOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    requisitionService
      .searchMaterials(debouncedSearch || undefined)
      .then((rows) => {
        if (!cancelled) setMaterials(rows);
      })
      .catch(() => {
        if (!cancelled) setMaterials([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(materials.map((item) => item.category).filter(Boolean)),
    ).sort();
    return [
      { value: "all", label: "All Categories" },
      ...unique.map((label) => ({ value: label, label })),
    ];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    if (category === "all") return materials;
    return materials.filter((item) => item.category === category);
  }, [materials, category]);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSearch("");
      setDebouncedSearch("");
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
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Searching materials...
            </p>
          ) : filteredMaterials.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No materials found
            </p>
          ) : (
            <div className="space-y-2">
              {filteredMaterials.map((product) => {
                const isSelected = selectedProductIds.includes(product.productId);

                return (
                  <button
                    key={product.productId}
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
                        SKU: {product.sku || "—"} · {product.category}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Warehouse: {product.warehouseStock} {product.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {product.currentStock} {product.unit}
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
