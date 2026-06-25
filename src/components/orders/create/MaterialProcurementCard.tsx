"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Package, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrderStore } from "@/store/createOrderStore";
import { searchProducts, type MockProduct } from "@/mock/createOrderData";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function ProductIcon({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
      {name.split(" ")[0].slice(0, 3).toUpperCase()}
    </div>
  );
}

function StockBadge({ status, label }: { status: MockProduct["stockStatus"]; label: string }) {
  return (
    <span
      className={cn(
        "text-xs font-medium",
        status === "in_stock" && "text-green-600",
        status === "low_stock" && "text-[#FF6B00]",
        status === "out_of_stock" && "text-red-500"
      )}
    >
      {label}
    </span>
  );
}

export function MaterialProcurementCard() {
  const { lineItems, addProduct, updateQuantity, removeProduct } =
    useCreateOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = searchProducts(searchQuery);

  const handleAdd = (product: MockProduct) => {
    if (product.stockStatus === "out_of_stock") return;
    addProduct({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image,
      stockAvailable: product.stockAvailable,
      stockLabel: product.stockLabel,
      unitPrice: product.unitPrice,
      quantity: 1,
      unit: product.unit,
    });
    setSearchQuery("");
    setShowResults(false);
  };

  const handleAddProductClick = () => {
    setShowResults(true);
    containerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <ClipboardList className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#111827]">
            Material Procurement
          </CardTitle>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg border-orange-200 bg-orange-50 text-[#FF6B00] hover:bg-orange-100"
          onClick={handleAddProductClick}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative" ref={containerRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products by SKU, category or name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="rounded-xl pl-10"
          />
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
              >
                {results.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">No products found.</p>
                ) : (
                  results.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      disabled={product.stockStatus === "out_of_stock"}
                      onClick={() => handleAdd(product)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left last:border-0",
                        product.stockStatus === "out_of_stock"
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-orange-50/50"
                      )}
                    >
                      <ProductIcon name={product.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#111827]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.sku} • {formatCurrency(product.unitPrice)}/
                          {product.unit}
                        </p>
                      </div>
                      <StockBadge
                        status={product.stockStatus}
                        label={product.stockLabel}
                      />
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {lineItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
            <Package className="mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No products added</p>
            <p className="mt-1 text-xs text-gray-400">
              Search and add materials to this order
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                  {[
                    "Product",
                    "SKU",
                    "Stock",
                    "Unit Price",
                    "Qty",
                    "Unit",
                    "Total",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr
                    key={item.productId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductIcon name={item.name} />
                        <span className="font-medium text-[#111827]">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.sku}</td>
                    <td className="px-4 py-3">
                      <StockBadge
                        status={
                          item.stockAvailable < 100 ? "low_stock" : "in_stock"
                        }
                        label={item.stockLabel}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="h-8 w-20 rounded-lg text-center"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                    <td className="px-4 py-3 font-semibold text-[#111827]">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600"
                        onClick={() => removeProduct(item.productId)}
                        aria-label="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
