"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useLedgerStore } from "@/store";

export function StockAlertCard() {
  const { analytics, openAudit } = useLedgerStore();
  const lowStockSkus = analytics?.lowStockSkus ?? 12;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
          <AlertTriangle className="h-5 w-5 text-[#FF6B00]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold text-[#FF6B00]">
            {lowStockSkus} SKUs Low
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Mainly Cement (OPC 53) and TMT 12mm Rebars
          </p>
          <motion.button
            type="button"
            onClick={openAudit}
            whileHover={{ x: 2 }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B00] hover:text-[#E55F00]"
          >
            View Alerts
            <ArrowRight className="h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
