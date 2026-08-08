"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRequisitionStore } from "@/store";
import { Button } from "@/components/ui/button";
import { RequisitionStats } from "@/components/requisition/RequisitionStats";
import { WorkflowStatusLegend } from "@/components/requisition/WorkflowStatusLegend";
import { RequisitionTable } from "@/components/requisition/RequisitionTable";
import { RequisitionDetailModal } from "@/components/requisition/RequisitionDetailModal";
import { CreateRequisitionModal } from "@/components/requisition/CreateRequisitionModal";
import {
  RequisitionFilters,
  RequisitionFilterButton,
  RequisitionExportButton,
} from "@/components/requisition/RequisitionFilters";

function RequisitionSelectionSync() {
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("selected");
  const loading = useRequisitionStore((state) => state.loading);
  const selectRequestByKey = useRequisitionStore(
    (state) => state.selectRequestByKey
  );
  const openDetailModal = useRequisitionStore((state) => state.openDetailModal);

  useEffect(() => {
    if (!loading && selectedParam) {
      const match = selectRequestByKey(selectedParam);
      if (match) {
        openDetailModal();
      }
    }
  }, [selectedParam, loading, selectRequestByKey, openDetailModal]);

  return null;
}

export default function RequisitionsPage() {
  const { loading, loadRequests } = useRequisitionStore();

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <RequisitionSelectionSync />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Requisition Tracking
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor the lifecycle of your material requests in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <RequisitionFilterButton />
            <RequisitionExportButton />
          </div>
        </div>

        <RequisitionFilters />

        <RequisitionStats />

        <WorkflowStatusLegend />

        <RequisitionTable />

        <RequisitionDetailModal />
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
        className="fixed bottom-6 right-6 z-30 md:bottom-8 md:right-8"
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-[#FF6B00] shadow-lg hover:bg-[#E55F00]"
          asChild
          aria-label="Create Requisition"
        >
          <Link href="/requisitions/create">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </motion.div>

      <CreateRequisitionModal />
    </>
  );
}
