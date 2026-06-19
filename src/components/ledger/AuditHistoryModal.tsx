"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ClipboardCheck } from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { useLedgerStore } from "@/store";
import { cn } from "@/lib/utils";

export function AuditHistoryModal() {
  const { isAuditOpen, closeAudit, auditHistory } = useLedgerStore();

  return (
    <Modal
      open={isAuditOpen}
      onOpenChange={(open) => !open && closeAudit()}
      title="Audit History"
      description="Manual audit records and stock variance reports."
      className="max-h-[90vh] max-w-lg overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        {auditHistory.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No audit records found.
          </p>
        ) : (
          auditHistory.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                  <ClipboardCheck className="h-4 w-4 text-[#FF6B00]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {format(new Date(record.auditDate), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-gray-400">
                        Auditor: {record.auditor}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold",
                        record.variance <= 0.5
                          ? "bg-emerald-100 text-emerald-700"
                          : record.variance <= 1
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-600"
                      )}
                    >
                      {record.variance}% variance
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{record.remarks}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </Modal>
  );
}
