"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  MapPin,
  Phone,
  Play,
  Truck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { dispatchService } from "@/services/dispatch.service";
import { useDispatchStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DispatchStatusBadge } from "@/components/dispatch/DispatchStatusBadge";
import { DispatchTimeline } from "@/components/dispatch/DispatchTimeline";
import type { DispatchQueueStatus, DispatchRecord } from "@/types";

const CUSTOMER_STATUS_LABELS: Record<DispatchQueueStatus, string> = {
  pending: "Order confirmed — awaiting hub dispatch",
  preparing: "Materials being prepared at hub",
  assigned: "Vehicle & driver assigned — ready to dispatch",
  dispatched: "Dispatched from hub",
  in_transit: "Out for delivery to customer site",
  arrived: "Arrived at customer site",
  delivered: "Delivered to customer",
  delayed: "Delivery delayed — hub following up",
};

export default function DispatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatchId = params.dispatchId as string;
  const { updateStatus } = useDispatchStore();

  const [dispatch, setDispatch] = useState<DispatchRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const reload = useCallback(async () => {
    const data = await dispatchService.getById(dispatchId);
    setDispatch(data ?? null);
  }, [dispatchId]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await reload();
      setLoading(false);
    }
    if (dispatchId) load();
  }, [dispatchId, reload]);

  const handleStatusUpdate = async (status: DispatchQueueStatus, message: string) => {
    if (!dispatch) return;
    setUpdating(true);
    await updateStatus(dispatch.id, status);
    await reload();
    setUpdating(false);
    toast.success(message);
  };

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
            Back to Planning Center
          </Link>
        </Button>
      </div>
    );
  }

  const customerStatus = CUSTOMER_STATUS_LABELS[dispatch.status];
  const isDelivered = dispatch.status === "delivered";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/dispatch")}
            className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#FF6B00]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Planning Center
          </button>
          <h1 className="text-2xl font-bold text-[#111827]">Dispatch Details</h1>
          <p className="mt-1 text-sm text-gray-500">{dispatch.dispatchNo}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isDelivered &&
            (dispatch.status === "assigned" ||
              dispatch.status === "pending" ||
              dispatch.status === "preparing") && (
              <Button
                className="gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
                disabled={updating}
                onClick={() =>
                  handleStatusUpdate("in_transit", "Delivery started — customer notified")
                }
              >
                <Play className="h-4 w-4" />
                Start Delivery
              </Button>
            )}
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={() => toast.success(`Calling ${dispatch.driver}...`)}
          >
            <Phone className="h-4 w-4" />
            Contact Driver
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={() => toast.success("POD downloaded (mock)")}
          >
            <Download className="h-4 w-4" />
            Download POD
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DispatchStatusBadge status={dispatch.status} />
        <span className="text-sm text-gray-500">ETA: {dispatch.eta}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dispatch Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <SummaryBlock label="Order" value={dispatch.orderNo} href={`/orders/${dispatch.orderNo}`} />
            <SummaryBlock label="Schedule" value={dispatch.schedule} />
            <SummaryBlock label="Route" value={dispatch.route} />
            <SummaryBlock label="Priority" value={dispatch.priority.toUpperCase()} />
            <SummaryBlock label="Items" value={String(dispatch.items ?? "—")} />
            <SummaryBlock label="Dispatch Date" value={dispatch.dispatchDate ?? "Today"} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Delivery ETA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FF6B00]">{dispatch.eta}</p>
            <p className="mt-2 text-sm text-gray-500">{dispatch.schedule}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-[#FF6B00]" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-[#111827]">{dispatch.customerDetails.name}</p>
              {dispatch.customerDetails.phone && (
                <p className="text-gray-500">{dispatch.customerDetails.phone}</p>
              )}
              {dispatch.customerDetails.email && (
                <p className="text-gray-500">{dispatch.customerDetails.email}</p>
              )}
              {dispatch.customerDetails.address && (
                <p className="mt-1 text-gray-500">{dispatch.customerDetails.address}</p>
              )}
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Customer Delivery Status
              </p>
              <div className="mt-2 flex items-center gap-2">
                <DispatchStatusBadge status={dispatch.status} />
              </div>
              <p className="mt-2 text-sm font-medium text-[#111827]">{customerStatus}</p>
              <p className="mt-1 text-xs text-gray-500">
                Updated manually by hub — no live GPS tracking
              </p>
            </div>

            {!isDelivered && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Hub Manual Updates
                </p>
                {dispatch.status === "in_transit" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-[#E5E7EB]"
                    disabled={updating}
                    onClick={() =>
                      handleStatusUpdate("arrived", "Marked arrived — customer status updated")
                    }
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    Mark Arrived at Site
                  </Button>
                )}
                {(dispatch.status === "assigned" ||
                  dispatch.status === "dispatched") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl border-[#E5E7EB]"
                    disabled={updating}
                    onClick={() =>
                      handleStatusUpdate("in_transit", "Marked in transit — customer notified")
                    }
                  >
                    Mark Out for Delivery
                  </Button>
                )}
                {dispatch.status === "arrived" && (
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700"
                    onClick={() =>
                      router.push(`/dispatch/complete/${dispatch.dispatchNo}`)
                    }
                  >
                    Complete Delivery
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-[#FF6B00]" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{dispatch.vehicle}</p>
            <Link href="/fleet" className="text-xs text-[#FF6B00] hover:underline">
              View in Fleet Management
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-[#FF6B00]" />
              Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{dispatch.driver}</p>
            <Link href="/drivers" className="text-xs text-[#FF6B00] hover:underline">
              View in Driver Management
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-[#FF6B00]" />
            Route Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{dispatch.route}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Dispatch Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <DispatchTimeline events={dispatch.timeline} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SummaryBlock({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="rounded-xl bg-[#F8F9FB] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      {href ? (
        <Link href={href} className="mt-1 block font-semibold text-[#FF6B00] hover:underline">
          {value}
        </Link>
      ) : (
        <p className="mt-1 font-semibold text-[#111827]">{value}</p>
      )}
    </div>
  );
}
