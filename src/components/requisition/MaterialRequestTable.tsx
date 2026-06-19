"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaterialRow } from "./MaterialRow";
import { SelectMaterialModal } from "./SelectMaterialModal";
import { useRequisitionStore } from "@/store/requisitionStore";
import { useInventoryStore } from "@/store/inventoryStore";
import type { InventoryProduct } from "@/types";

interface MaterialRequestTableProps {
  materialErrors?: Record<string, string>;
}

export function MaterialRequestTable({ materialErrors }: MaterialRequestTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    draftRequisition,
    addMaterial,
    removeMaterial,
    updateMaterial,
    replaceMaterialProduct,
  } = useRequisitionStore();
  const { allProducts, categories, loadInventory } = useInventoryStore();

  useEffect(() => {
    if (allProducts.length === 0) {
      loadInventory();
    }
  }, [allProducts.length, loadInventory]);

  const products = allProducts as InventoryProduct[];
  const selectedProductIds = draftRequisition.materials.map((m) => m.productId);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold text-[#111827]">
              Material Request List
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Material
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Available
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Requested Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {draftRequisition.materials.map((material) => (
                      <MaterialRow
                        key={material.id}
                        material={material}
                        products={products}
                        onUpdateQty={(rowId, qty) =>
                          updateMaterial(rowId, { requestedQty: qty })
                        }
                        onReplaceProduct={replaceMaterialProduct}
                        onRemove={removeMaterial}
                        error={materialErrors?.[material.id]}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#E5E7EB] p-4">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-dashed border-[#E5E7EB] text-[#FF6B00] hover:bg-orange-50"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Material
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <SelectMaterialModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        products={products}
        categories={categories}
        selectedProductIds={selectedProductIds}
        onSelect={(product) => {
          addMaterial(product);
          setModalOpen(false);
        }}
      />
    </>
  );
}
