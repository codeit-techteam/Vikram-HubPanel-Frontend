"use client";

import { motion } from "framer-motion";
import { FileText, Printer, Truck } from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useMaterialReceivingStore } from "@/store";

export function GatePassPreviewModal() {
  const { isGatePassOpen, closeGatePass, receivingRecord } =
    useMaterialReceivingStore();

  if (!receivingRecord) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={isGatePassOpen}
      onOpenChange={(open) => !open && closeGatePass()}
      title="Print Gate Pass"
      description="Preview the gate pass before printing."
      className="max-w-2xl"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] p-6">
          <div className="mb-6 flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">GATE PASS</p>
                <p className="text-xs text-gray-500">HubOps Central</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#FF6B00]">
                {receivingRecord.transferNumber}
              </p>
              <p className="text-xs text-gray-500">{receivingRecord.dispatchDate}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Vehicle Number</p>
              <p className="font-semibold text-[#111827]">
                {receivingRecord.vehicleNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Driver</p>
              <p className="font-semibold text-[#111827]">
                {receivingRecord.driverName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Source</p>
              <p className="font-semibold text-[#111827]">
                {receivingRecord.sourceHub}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Dispatch Time</p>
              <p className="font-semibold text-[#111827]">
                {receivingRecord.dispatchTime}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#FF6B00]" />
            <p className="text-sm font-semibold text-[#111827]">
              Material Manifest
            </p>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="pb-2">Product</th>
                <th className="pb-2">SKU</th>
                <th className="pb-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {receivingRecord.materials.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 font-medium text-[#111827]">
                    {item.productName}
                  </td>
                  <td className="py-2 text-gray-500">{item.sku}</td>
                  <td className="py-2">{item.dispatchedDisplay}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 grid grid-cols-2 gap-8 border-t border-[#E5E7EB] pt-6">
            <div>
              <p className="mb-8 text-xs text-gray-400">Security Signature</p>
              <div className="border-b border-gray-300" />
            </div>
            <div>
              <p className="mb-8 text-xs text-gray-400">Hub Manager Signature</p>
              <div className="border-b border-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeGatePass}>
            Close
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handlePrint} className="gap-2 bg-[#FF6B00] hover:bg-[#E55F00]">
              <Printer className="h-4 w-4" />
              Print Gate Pass
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
}
