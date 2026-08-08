"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useInventoryStore } from "@/store";
import type { InventorySortField } from "@/types";
import { Button } from "@/components/ui/button";
import { InventoryRow } from "./InventoryRow";
import { cn } from "@/lib/utils";

const COLUMNS: { key: InventorySortField; label: string }[] = [
  { key: "name", label: "Product" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Category" },
  { key: "currentStock", label: "Current Stock" },
  { key: "reserved", label: "Reserved" },
];

export function InventoryTable() {
  const {
    products,
    pagination,
    currentPage,
    sortField,
    sortOrder,
    setSort,
    setCurrentPage,
  } = useInventoryStore();

  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, i) => i + 1
  );

  const showingCount = products.length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {COLUMNS.map((column) => (
                <th key={column.key} className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setSort(column.key)}
                    className="inline-flex items-center gap-1 transition-colors hover:text-gray-600"
                  >
                    {column.label}
                    {sortField === column.key &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  No products match your filters.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <InventoryRow
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing {showingCount} of {pagination.totalProducts} products
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>

          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={cn(
                "min-w-9 border-gray-200",
                currentPage === page &&
                  "border-[#FF6B00] bg-[#FF6B00] text-white hover:bg-[#E55F00] hover:text-white"
              )}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600"
            disabled={currentPage >= pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
