"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLedgerStore } from "@/store";

export function LedgerAccuracyCard() {
  const { analytics, lastAuditDaysAgo } = useLedgerStore();
  const accuracy = analytics?.auditAccuracy ?? 99.8;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500">Ledger Accuracy</p>
          <p className="mt-1 text-2xl font-bold text-[#111827]">{accuracy}%</p>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="h-full rounded-full bg-[#FF6B00]"
            />
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Last manual audit completed {lastAuditDaysAgo} days ago.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
