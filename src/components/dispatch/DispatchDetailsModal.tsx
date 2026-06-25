"use client";

import { motion } from "framer-motion";
import {
  FileText,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react";
import { useDispatchStore } from "@/store";
import { Modal } from "@/components/modals/modal";
import { Button } from "@/components/ui/button";
import { DispatchStatusBadge } from "./DispatchStatusBadge";
import { DispatchTimeline } from "./DispatchTimeline";

export function DispatchDetailsModal() {
  const {
    isDetailsOpen,
    selectedDispatch,
    closeDetails,
    completeDispatch,
    updateStatus,
  } = useDispatchStore();

  if (!selectedDispatch) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDetails();
  };

  return (
    <Modal
      open={isDetailsOpen}
      onOpenChange={handleOpenChange}
      title="Dispatch Details"
      description={`${selectedDispatch.dispatchNo} — ${selectedDispatch.orderNo}`}
      className="max-h-[90vh] max-w-2xl overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Dispatch ID
            </p>
            <p className="text-lg font-bold text-[#111827]">
              {selectedDispatch.dispatchNo}
            </p>
          </div>
          <DispatchStatusBadge status={selectedDispatch.status} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailBlock
            icon={<Package className="h-4 w-4 text-[#FF6B00]" />}
            label="Order Details"
            value={selectedDispatch.orderNo}
            sub={
              selectedDispatch.items
                ? `${selectedDispatch.items} items`
                : undefined
            }
          />
          <DetailBlock
            icon={<User className="h-4 w-4 text-[#FF6B00]" />}
            label="Customer"
            value={selectedDispatch.customerDetails.name}
            sub={selectedDispatch.customerDetails.phone}
          />
          <DetailBlock
            icon={<Truck className="h-4 w-4 text-[#FF6B00]" />}
            label="Vehicle"
            value={selectedDispatch.vehicle}
          />
          <DetailBlock
            icon={<User className="h-4 w-4 text-[#FF6B00]" />}
            label="Driver"
            value={selectedDispatch.driver}
          />
        </div>

        <DetailBlock
          icon={<MapPin className="h-4 w-4 text-[#FF6B00]" />}
          label="Route"
          value={selectedDispatch.route}
          sub={`ETA: ${selectedDispatch.eta} · Scheduled ${selectedDispatch.schedule}`}
        />

        <DispatchTimeline events={selectedDispatch.timeline} compact />

        {selectedDispatch.documents.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Documents
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDispatch.documents.map((doc) => (
                <span
                  key={doc.id}
                  className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-1.5 text-xs font-medium text-gray-700"
                >
                  <FileText className="h-3.5 w-3.5 text-gray-400" />
                  {doc.name}
                  <span className="text-gray-400">({doc.type})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-4">
          {selectedDispatch.status === "pending" && (
            <Button
              className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={() => updateStatus(selectedDispatch.id, "loading")}
            >
              Start Loading
            </Button>
          )}
          {selectedDispatch.status === "loading" && (
            <Button
              className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={() => updateStatus(selectedDispatch.id, "dispatch")}
            >
              Start Dispatch
            </Button>
          )}
          {selectedDispatch.status === "dispatch" && (
            <Button
              className="rounded-xl bg-green-600 hover:bg-green-700"
              onClick={() => completeDispatch(selectedDispatch.id)}
            >
              Mark Delivered
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => closeDetails()}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}

function DetailBlock({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] p-3">
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
