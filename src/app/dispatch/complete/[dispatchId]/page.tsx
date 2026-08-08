"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { dispatchService } from "@/services/dispatch.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DispatchRecord } from "@/types";

/**
 * Legacy delivery confirmation page.
 * Direct "Mark Delivered" is disabled — OTP verification happens on Order Details.
 */
export default function DeliveryConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const dispatchId = params.dispatchId as string;

  const [dispatch, setDispatch] = useState<DispatchRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const d = await dispatchService.getById(dispatchId);
      setDispatch(d ?? null);
      setLoading(false);
    }
    if (dispatchId) load();
  }, [dispatchId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">Dispatch not found.</p>
        <Button variant="outline" asChild>
          <Link href="/dispatch">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
    );
  }

  const orderPath = dispatch.orderId
    ? `/orders/${dispatch.orderId}`
    : "/orders";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-2xl space-y-6 pb-8"
    >
      <div>
        <button
          type="button"
          onClick={() => router.push(`/dispatch/${dispatch.dispatchNo}`)}
          className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#FF6B00]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dispatch
        </button>
        <h1 className="text-2xl font-bold text-[#111827]">Delivery Confirmation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Delivery must be verified with customer OTP
        </p>
      </div>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-[#FF6B00]" />
            OTP Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Orders can no longer be marked delivered directly. Use the Delivery
            Completion flow on the order details page: mark driver reached,
            generate OTP, then verify with the customer.
          </p>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">Dispatch</p>
              <p className="font-semibold">{dispatch.dispatchNo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Order</p>
              <p className="font-semibold">{dispatch.orderNo}</p>
            </div>
          </div>
          <Button
            className="h-12 w-full gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
            onClick={() => router.push(orderPath)}
          >
            <ShieldCheck className="h-4 w-4" />
            Go to Delivery Completion
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
