"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import { useDispatchStore } from "@/store";
import { InitiateDispatchCard } from "@/components/dispatch/InitiateDispatchCard";
import { DispatchLiveQueue } from "@/components/dispatch/DispatchLiveQueue";
import { FleetStatsCard } from "@/components/dispatch/FleetStatsCard";
import { DispatchDetailsModal } from "@/components/dispatch/DispatchDetailsModal";
import { CreateDispatchModal } from "@/components/dispatch/CreateDispatchModal";
import { DispatchFooterBar } from "@/components/dispatch/DispatchFooterBar";

export default function DispatchPage() {
  const { loading, loadDispatchData } = useDispatchStore();

  useEffect(() => {
    loadDispatchData();
  }, [loadDispatchData]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6 pb-16"
      >
        <PageHeader
          title="Dispatch Planning Center"
          description="Allocate pending customer orders — assign vehicle, driver, and delivery slot."
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <InitiateDispatchCard />
            <FleetStatsCard />
          </div>
          <div className="lg:col-span-3">
            <DispatchLiveQueue />
          </div>
        </div>
      </motion.div>

      <DispatchFooterBar />
      <DispatchDetailsModal />
      <CreateDispatchModal />
    </>
  );
}
