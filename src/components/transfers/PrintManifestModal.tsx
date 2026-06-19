"use client";

import { motion } from "framer-motion";
import { FileText, Printer } from "lucide-react";
import { useTransferStore } from "@/store";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export function PrintManifestModal() {
  const { isPrintOpen, closePrint, selectedTransfer, manifest } =
    useTransferStore();

  if (!selectedTransfer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={isPrintOpen}
      onOpenChange={(open) => !open && closePrint()}
      title="Print Manifest"
      description="Preview the transfer manifest before printing."
      className="max-w-2xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-[#E5E7EB] pb-4">
            <FileText className="h-5 w-5 text-[#FF6B00]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                Transfer Manifest — {selectedTransfer.transferId}
              </p>
              <p className="text-xs text-gray-500">
                {selectedTransfer.source} → {selectedTransfer.destination}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">Dispatch Date</span>
              <p className="font-medium text-[#111827]">
                {selectedTransfer.dispatchDate ?? "—"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Vehicle</span>
              <p className="font-medium text-[#111827]">
                {selectedTransfer.vehicle}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Driver</span>
              <p className="font-medium text-[#111827]">
                {selectedTransfer.driver.name}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Requisition</span>
              <p className="font-medium text-[#111827]">
                {selectedTransfer.requisitionId ?? "—"}
              </p>
            </div>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="pb-2">Product</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2">Unit</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {manifest.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 font-medium text-[#111827]">{item.name}</td>
                  <td className="py-2">{formatNumber(item.quantity)}</td>
                  <td className="py-2 text-gray-600">{item.unit}</td>
                  <td className="py-2 capitalize text-[#FF6B00]">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closePrint}>
            Close
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Manifest
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
}
