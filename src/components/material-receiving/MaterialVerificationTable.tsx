"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Layers,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ReceivingMaterialItem } from "@/types";
import { VerificationActions } from "./VerificationActions";
import { useMaterialReceivingStore } from "@/store";

function getProductIcon(productName: string) {
  const name = productName.toLowerCase();
  if (name.includes("steel") || name.includes("rebar")) return Layers;
  if (name.includes("cement") || name.includes("bag")) return Package;
  return Box;
}

interface MaterialVerificationTableProps {
  materials: ReceivingMaterialItem[];
}

function getQtyWarning(
  received: number,
  dispatched: number
): { type: "shortage" | "excess" | null; message: string } {
  if (received < dispatched) {
    return {
      type: "shortage",
      message: `Shortage: ${formatNumber(dispatched - received)} units below dispatched`,
    };
  }
  if (received > dispatched) {
    return {
      type: "excess",
      message: `Over received: ${formatNumber(received - dispatched)} units above dispatched`,
    };
  }
  return { type: null, message: "" };
}

export function MaterialVerificationTable({
  materials,
}: MaterialVerificationTableProps) {
  const { updateReceivedQty, verifyMaterial, openDiscrepancy } =
    useMaterialReceivingStore();

  const itemsToVerify = materials.filter(
    (m) => m.verificationStatus !== "verified"
  ).length;

  const handleQtyChange = useCallback(
    (productId: string, value: string) => {
      const qty = parseFloat(value) || 0;
      updateReceivedQty(productId, qty);
    },
    [updateReceivedQty]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.08 }}
    >
      <Card className="rounded-2xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold text-[#111827]">
            Material Verification
          </CardTitle>
          <Badge variant="info" className="rounded-full px-3 py-1 text-xs font-semibold">
            {itemsToVerify} Items to Verify
          </Badge>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-y border-[#E5E7EB] text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Dispatched Qty</th>
                  <th className="px-6 py-3">Received Qty</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((item, index) => {
                  const warning = getQtyWarning(
                    item.receivedQty,
                    item.dispatchedQty
                  );
                  const isAutoVerified =
                    item.receivedQty === item.dispatchedQty &&
                    item.verificationStatus === "verified";

                  return (
                    <MaterialRow
                      key={item.id}
                      item={item}
                      index={index}
                      warning={warning}
                      isAutoVerified={isAutoVerified}
                      onQtyChange={handleQtyChange}
                      onAccept={() => verifyMaterial(item.productId, "accept")}
                      onReject={() => verifyMaterial(item.productId, "reject")}
                      onDiscrepancy={() => openDiscrepancy(item)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MaterialRowProps {
  item: ReceivingMaterialItem;
  index: number;
  warning: { type: "shortage" | "excess" | null; message: string };
  isAutoVerified: boolean;
  onQtyChange: (productId: string, value: string) => void;
  onAccept: () => void;
  onReject: () => void;
  onDiscrepancy: () => void;
}

function MaterialRow({
  item,
  index,
  warning,
  isAutoVerified,
  onQtyChange,
  onAccept,
  onReject,
  onDiscrepancy,
}: MaterialRowProps) {
  const [localQty, setLocalQty] = useState(String(item.receivedQty));

  useEffect(() => {
    setLocalQty(String(item.receivedQty));
  }, [item.receivedQty]);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ backgroundColor: "#F9FAFB" }}
      className="border-b border-gray-50 transition-colors last:border-0"
    >
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F9FB]">
            {(() => {
              const Icon = getProductIcon(item.productName);
              return <Icon className="h-4 w-4 text-[#FF6B00]" />;
            })()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {item.productName}
            </p>
            <p className="text-xs text-gray-400">SKU: {item.sku}</p>
          </div>
        </div>
        {isAutoVerified && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#22C55E]">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        )}
        {warning.type && (
          <span
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              warning.type === "shortage"
                ? "text-[#F59E0B]"
                : "text-[#EF4444]"
            )}
          >
            <AlertTriangle className="h-3 w-3" />
            {warning.message}
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-[#111827]">
        {item.dispatchedDisplay}
      </td>
      <td className="px-6 py-4">
        <div className="relative max-w-[140px]">
          <Input
            type="number"
            min={0}
            value={localQty}
            onChange={(e) => {
              setLocalQty(e.target.value);
              onQtyChange(item.productId, e.target.value);
            }}
            className="h-9 rounded-lg border-[#E5E7EB] pr-12 text-sm"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase text-gray-400">
            {item.dispatchedUnit === "Units" ? "UNIT" : item.dispatchedUnit}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end">
          <VerificationActions
            item={item}
            onAccept={onAccept}
            onReject={onReject}
            onDiscrepancy={onDiscrepancy}
          />
        </div>
      </td>
    </motion.tr>
  );
}
