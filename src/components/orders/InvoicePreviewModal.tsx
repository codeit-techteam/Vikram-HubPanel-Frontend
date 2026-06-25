"use client";

import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { useOrdersStore } from "@/store";
import { generateInvoicePdf } from "@/lib/generateInvoicePdf";
import { printInvoice } from "@/lib/printInvoice";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { Printer } from "lucide-react";

export function InvoicePreviewModal() {
  const { isInvoiceOpen, closeInvoice, selectedOrder } = useOrdersStore();

  if (!selectedOrder) return null;

  const order = selectedOrder;

  const handleDownload = () => {
    generateInvoicePdf(order);
    toast.success(`Invoice ${order.orderNo} downloaded as PDF.`);
  };

  const handlePrint = () => {
    printInvoice(order);
    toast.success(`Print dialog opened for ${order.orderNo}.`);
  };

  return (
    <Modal
      open={isInvoiceOpen}
      onOpenChange={(open) => !open && closeInvoice()}
      title="Invoice Preview"
      description={`Tax invoice for order ${order.orderNo}`}
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
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#111827]">TAX INVOICE</p>
                <p className="text-xs text-gray-500">Sub-Hub West</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#FF6B00]">{order.orderNo}</p>
              <p className="text-xs text-gray-500">{order.orderDate}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Bill To</p>
              <p className="font-semibold text-[#111827]">
                {order.customer.name}
              </p>
              <p className="text-xs text-gray-500">{order.customer.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Delivery Address</p>
              <p className="font-medium text-[#111827]">
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          <table className="mb-4 w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-xs text-gray-400">
                <th className="pb-2">Item</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.materials.map((material) => (
                <tr key={material.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <p className="font-medium text-[#111827]">{material.name}</p>
                    <p className="text-xs text-gray-400">{material.sku}</p>
                  </td>
                  <td className="py-2 text-gray-600">
                    {material.quantity} {material.unit}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(material.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t border-[#E5E7EB] pt-4">
            <div className="text-right">
              <p className="text-xs text-gray-400">Total Amount</p>
              <p className="text-xl font-bold text-[#111827]">
                {formatCurrency(order.value)}
              </p>
              <p className="text-xs text-gray-500">
                Payment: {order.payment.method} — {order.payment.status}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => closeInvoice()}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
          <Button
            onClick={handleDownload}
            className="gap-2 bg-[#FF6B00] hover:bg-[#E55F00]"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
