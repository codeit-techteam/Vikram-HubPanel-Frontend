"use client";

import { useRouter } from "next/navigation";
import { useRequisitionStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequisitionDetailSummary } from "./RequisitionDetailSummary";
import { RequestTimeline } from "./RequestTimeline";
import { RequisitionStatusBadge } from "./RequisitionStatusBadge";

export function RequisitionDetailModal() {
  const router = useRouter();
  const {
    selectedRequest,
    isDetailModalOpen,
    closeDetailModal,
    setSelectedRequest,
  } = useRequisitionStore();

  const handleOpenChange = (open: boolean) => {
    if (open) return;
    closeDetailModal();
    setSelectedRequest(null);
    router.replace("/requisitions", { scroll: false });
  };

  if (!selectedRequest) return null;

  return (
    <Dialog open={isDetailModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-y-auto p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Requisition Details
            </DialogTitle>
            <RequisitionStatusBadge status={selectedRequest.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <RequisitionDetailSummary request={selectedRequest} embedded />
          <RequestTimeline embedded />
        </div>
      </DialogContent>
    </Dialog>
  );
}
