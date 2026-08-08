"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { InventoryFilters } from "@/components/inventory/InventoryFilters";
import { InventorySummary } from "@/components/inventory/InventorySummary";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useInventoryStore } from "@/store";

function downloadInventoryCsv(
  products: Array<{
    name: string;
    sku: string;
    category: string;
    currentStock: string;
    reserved: string;
    available: string;
    status: string;
  }>,
) {
  const headers = [
    "Name",
    "SKU",
    "Category",
    "Current Stock",
    "Reserved",
    "Available",
    "Status",
  ];
  const rows = products.map((p) => [
    p.name,
    p.sku,
    p.category,
    p.currentStock,
    p.reserved,
    p.available,
    p.status,
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InventoryPage() {
  const searchParams = useSearchParams();
  const { loading, loadInventory, setSearch, allProducts } = useInventoryStore();

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
    loadInventory();
  }, [loadInventory, searchParams, setSearch]);

  const handleExport = () => {
    try {
      downloadInventoryCsv(allProducts);
      toast.success(`Exported ${allProducts.length} products to CSV`);
    } catch {
      toast.error("Failed to export inventory");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hub Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track real-time stock levels across all construction
            categories.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:hidden">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900"
            >
              Export CSV
            </button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <a
              href="/dispatch"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#FF6B00] px-4 text-sm font-medium text-white hover:bg-[#E55F00]"
            >
              Dispatch Truck
            </a>
          </motion.div>
        </div>
      </div>

      <InventoryFilters />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <InventoryTable />
        </div>
        <div className="lg:col-span-1">
          <InventorySummary />
        </div>
      </div>
    </motion.div>
  );
}
