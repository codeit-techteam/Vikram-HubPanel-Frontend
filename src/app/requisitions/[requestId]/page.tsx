"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { requisitionService } from "@/services/requisition.service";
import { Button } from "@/components/ui/button";
import { RequisitionDetailSummary } from "@/components/requisition/RequisitionDetailSummary";
import { RequestTimeline } from "@/components/requisition/RequestTimeline";
import { useRequisitionStore } from "@/store";
import type { RequisitionRequest } from "@/types";

export default function RequisitionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = decodeURIComponent(params.requestId as string);
  const setSelectedRequest = useRequisitionStore((state) => state.setSelectedRequest);

  const [request, setRequest] = useState<RequisitionRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await requisitionService.getRequestById(requestId);
      if (data) {
        setRequest(data);
        setSelectedRequest(data);
      } else {
        setRequest(null);
      }
      setLoading(false);
    }

    if (requestId) {
      load();
    }
  }, [requestId, setSelectedRequest]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">Requisition not found.</p>
        <Button variant="outline" asChild>
          <Link href="/requisitions">
            <ArrowLeft className="h-4 w-4" />
            Back to Requisitions
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/requisitions?selected=${encodeURIComponent(request.requestId)}`)}
            className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-[#FF6B00]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Requisitions
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Requisition Details</h1>
          <p className="mt-1 text-sm text-gray-500">
            Full lifecycle view for {request.requestId}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
        <RequisitionDetailSummary request={request} />
        <RequestTimeline />
      </div>
    </motion.div>
  );
}
