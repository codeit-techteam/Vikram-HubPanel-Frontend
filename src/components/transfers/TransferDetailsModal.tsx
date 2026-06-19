"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  FileText,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { useTransferStore } from "@/store";
import { Modal } from "@/components/modals/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransferStatusBadge } from "./TransferStatusBadge";
import { TransferTimeline } from "./TransferTimeline";

export function TransferDetailsModal() {
  const {
    selectedTransfer,
    isDetailsOpen,
    closeDetails,
    openReceive,
  } = useTransferStore();

  if (!selectedTransfer) return null;

  const transfer = selectedTransfer;

  return (
    <Modal
      open={isDetailsOpen}
      onOpenChange={(open) => !open && closeDetails()}
      title={transfer.transferId}
      description="Transfer details and shipment tracking"
      className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={transfer.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between">
            <TransferStatusBadge status={transfer.status} />
            <span className="text-sm text-gray-500">{transfer.etaDisplay}</span>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Transfer Information
            </h4>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-sm">
              <div>
                <p className="text-gray-500">Source</p>
                <p className="font-medium text-gray-900">{transfer.source}</p>
              </div>
              <div>
                <p className="text-gray-500">Destination</p>
                <p className="font-medium text-gray-900">
                  {transfer.destination}
                </p>
              </div>
              {transfer.requisitionId && (
                <div className="col-span-2">
                  <p className="text-gray-500">Linked Requisition</p>
                  <p className="font-medium text-[#FF6B00]">
                    {transfer.requisitionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Vehicle Information
            </h4>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                <Truck className="h-5 w-5 text-[#FF6B00]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{transfer.vehicle}</p>
                <p className="text-xs text-gray-500">Assigned Vehicle</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Driver Details
            </h4>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transfer.driver.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transfer.driver.phone}
                  </p>
                </div>
              </div>
              {transfer.driver.phone !== "—" && (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </Button>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Material Manifest
            </h4>
            <div className="space-y-2">
              {transfer.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {material.name}
                    </p>
                    {material.sku && (
                      <p className="text-xs text-gray-400">SKU: {material.sku}</p>
                    )}
                  </div>
                  <Badge variant="secondary">{material.quantity}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Timeline
            </h4>
            <TransferTimeline events={transfer.timeline} />
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Documents
            </h4>
            <div className="space-y-2">
              {transfer.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {doc.type} · {doc.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {transfer.status !== "received" && transfer.status !== "ready" && (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                className="w-full rounded-xl bg-[#FF6B00] py-5 hover:bg-[#E55F00]"
                onClick={() => {
                  closeDetails();
                  openReceive(transfer);
                }}
              >
                Receive Material
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}
