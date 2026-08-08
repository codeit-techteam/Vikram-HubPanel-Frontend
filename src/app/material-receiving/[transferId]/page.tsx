"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Info, Printer, Share2 } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { useMaterialReceivingStore, useSidebarStore } from "@/store";
import { ReceivingTransferDetails } from "@/components/material-receiving/ReceivingTransferDetails";
import { ReceivingSummaryCard } from "@/components/material-receiving/ReceivingSummaryCard";
import { MaterialVerificationTable } from "@/components/material-receiving/MaterialVerificationTable";
import { DeliveryPhotoUploader } from "@/components/material-receiving/DeliveryPhotoUploader";
import { ReceivingDocumentsUploader } from "@/components/material-receiving/ReceivingDocumentsUploader";
import { DiscrepancyModal } from "@/components/material-receiving/DiscrepancyModal";
import { GatePassPreviewModal } from "@/components/material-receiving/GatePassPreviewModal";
import { ShareReceivingLogModal } from "@/components/material-receiving/ShareReceivingLogModal";
import { cn } from "@/lib/utils";

export default function MaterialReceivingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.transferId as string;

  const {
    receivingRecord,
    photos,
    documents,
    loading,
    submitting,
    loadReceivingDetails,
    acceptDelivery,
    openDiscrepancy,
    openGatePass,
    openShare,
  } = useMaterialReceivingStore();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  useEffect(() => {
    if (transferId) {
      loadReceivingDetails(transferId);
    }
  }, [transferId, loadReceivingDetails]);

  const handleAcceptDelivery = async () => {
    const success = await acceptDelivery();
    if (success) {
      router.push("/inventory");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!receivingRecord) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">
          Receiving record not found for {transferId}.
        </p>
        <Button variant="outline" asChild>
          <Link href="/transfers">
            <ArrowLeft className="h-4 w-4" />
            Back to Transfers
          </Link>
        </Button>
      </div>
    );
  }

  const isDelivered =
    receivingRecord.status === "delivered" ||
    receivingRecord.status === "received";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6 pb-28"
      >
        <PageHeader
          title="Material Receiving"
          description={receivingRecord.subtitle}
          actions={
            <>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-[#E5E7EB] bg-white"
                  onClick={openGatePass}
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print Gate Pass</span>
                  <span className="sm:hidden">Print</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-[#E5E7EB] bg-white"
                  onClick={openShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Log</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </motion.div>
            </>
          }
        />

        <ReceivingSummaryCard record={receivingRecord} />
        <ReceivingTransferDetails record={receivingRecord} />
        <MaterialVerificationTable materials={receivingRecord.materials} />

        <div className="grid gap-6 md:grid-cols-2">
          <DeliveryPhotoUploader photos={photos} />
          <ReceivingDocumentsUploader documents={documents} />
        </div>
      </motion.div>

      <div
        className={cn(
          "fixed bottom-0 right-0 z-20 border-t border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur-sm",
          isCollapsed ? "left-0 md:left-[72px]" : "left-0 md:left-[280px]"
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[#22C55E]">
            <Info className="h-4 w-4 shrink-0" />
            <span className="text-gray-600">
              Inventory will be updated only after clicking{" "}
              <span className="font-medium text-[#111827]">
                &apos;Accept Delivery&apos;
              </span>
            </span>
          </div>

          <div className="flex gap-2 sm:shrink-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-[#E5E7EB] sm:flex-none"
                onClick={() => openDiscrepancy()}
                disabled={isDelivered || submitting}
              >
                Submit Discrepancy
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="flex-1 gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00] sm:flex-none"
                onClick={handleAcceptDelivery}
                disabled={isDelivered || submitting}
              >
                <AnimatePresence mode="wait">
                  {submitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Processing...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="accept"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Accept Delivery
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <DiscrepancyModal />
      <GatePassPreviewModal />
      <ShareReceivingLogModal />
    </>
  );
}
