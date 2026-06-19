"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  MapPin,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTransferStore } from "@/store";
import { Button } from "@/components/ui/button";
import { TransferSummaryCard } from "@/components/transfers/TransferSummaryCard";
import { VehicleDriverCard } from "@/components/transfers/VehicleDriverCard";
import { ShipmentTimeline } from "@/components/transfers/ShipmentTimeline";
import { MaterialManifestTable } from "@/components/transfers/MaterialManifestTable";
import { SupportCard } from "@/components/transfers/SupportCard";
import { PrintManifestModal } from "@/components/transfers/PrintManifestModal";
import { ShareTrackingModal } from "@/components/transfers/ShareTrackingModal";

export default function TransferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const transferId = params.transferId as string;

  const {
    detailLoading,
    selectedTransfer,
    manifest,
    timeline,
    driverDetails,
    vehicleDetails,
    loadTransferById,
    openPrint,
    openShare,
  } = useTransferStore();

  useEffect(() => {
    if (transferId) {
      loadTransferById(transferId);
    }
  }, [transferId, loadTransferById]);

  if (detailLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!selectedTransfer || !driverDetails || !vehicleDetails) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">Transfer not found.</p>
        <Button variant="outline" asChild>
          <Link href="/transfers">
            <ArrowLeft className="h-4 w-4" />
            Back to Transfers
          </Link>
        </Button>
      </div>
    );
  }

  const handleContactDriver = () => {
    if (driverDetails.phone && driverDetails.phone !== "—") {
      window.open(`tel:${driverDetails.phone.replace(/\s/g, "")}`);
    } else {
      toast.error("Driver contact not available");
    }
  };

  const handleReportDelay = () => {
    toast.success("Delay reported to warehouse logistics team");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="sticky top-16 z-10 -mx-4 border-b border-[#E5E7EB] bg-[#F8F9FB]/95 px-4 py-4 backdrop-blur-sm lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/transfers")}
                className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#FF6B00] lg:hidden"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-[#111827]">
                Transfer Details
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Read-only view of incoming warehouse shipment. Transfer creation
                is managed from the Warehouse Portal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-[#E5E7EB] bg-white"
                  onClick={openShare}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Track Shipment</span>
                  <span className="sm:hidden">Track</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-[#E5E7EB] bg-white"
                  onClick={handleContactDriver}
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Contact Driver</span>
                  <span className="sm:hidden">Call</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-[#E5E7EB] bg-white"
                  onClick={openPrint}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download Manifest</span>
                  <span className="sm:hidden">Manifest</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl border-red-200 bg-white text-red-600 hover:bg-red-50"
                  onClick={handleReportDelay}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span className="hidden sm:inline">Report Delay</span>
                  <span className="sm:hidden">Delay</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
          <div className="space-y-6">
            <TransferSummaryCard transfer={selectedTransfer} />
            <VehicleDriverCard driver={driverDetails} vehicle={vehicleDetails} />
            <MaterialManifestTable materials={manifest} />
          </div>

          <div className="space-y-6">
            <ShipmentTimeline items={timeline} />
            <SupportCard siteId={selectedTransfer.siteId} />
          </div>
        </div>

        {selectedTransfer.requisitionId && (
          <div className="flex flex-wrap gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-xs text-gray-500">
            <span>
              Requisition:{" "}
              <Link
                href={`/requisitions?selected=${encodeURIComponent(selectedTransfer.requisitionId)}`}
                className="font-medium text-[#FF6B00] hover:underline"
              >
                {selectedTransfer.requisitionId}
              </Link>
            </span>
            {selectedTransfer.inventoryId && (
              <span>
                Inventory:{" "}
                <Link
                  href="/inventory"
                  className="font-medium text-[#FF6B00] hover:underline"
                >
                  {selectedTransfer.inventoryId}
                </Link>
              </span>
            )}
            <span>
              Receiving:{" "}
              <Link
                href={`/material-receiving/${selectedTransfer.transferId}`}
                className="font-medium text-[#FF6B00] hover:underline"
              >
                Material Receiving
              </Link>
            </span>
          </div>
        )}
      </motion.div>

      <PrintManifestModal />
      <ShareTrackingModal />
    </>
  );
}
