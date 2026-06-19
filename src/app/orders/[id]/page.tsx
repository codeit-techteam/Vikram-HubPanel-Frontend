"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { ordersService } from "@/services/orders.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { DispatchStatusBadge } from "@/components/dispatch/DispatchStatusBadge";
import { formatCurrency, cn } from "@/lib/utils";
import type { DispatchRecord, HubOrder } from "@/types";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<HubOrder | null>(null);
  const [dispatchHistory, setDispatchHistory] = useState<DispatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await ordersService.getOrderById(orderId);
      if (data) {
        setOrder(data);
        const history = await ordersService.getDispatchHistory(data.orderNo);
        setDispatchHistory(history);
      }
      setLoading(false);
    }
    if (orderId) load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">Order not found.</p>
        <Button variant="outline" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const gst = order.gstDetails ?? {
    gstin: "27AABCU9603R1ZM",
    companyName: order.customer.name,
    state: "Maharashtra",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-[#FF6B00]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Orders
          </button>
          <h1 className="text-2xl font-bold text-[#111827]">{order.orderNo}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Customer order details, allocation, and dispatch history
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status !== "delivered" && (
            <Button
              className="gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={() => router.push("/dispatch")}
            >
              <Truck className="h-4 w-4" />
              Create Dispatch
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-[#E5E7EB]"
            onClick={() => toast.success("Invoice downloaded (mock)")}
          >
            <FileText className="h-4 w-4" />
            Download Invoice
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-[#E5E7EB]"
            onClick={() => {
              if (order.customer.phone) {
                window.open(`tel:${order.customer.phone.replace(/\s/g, "")}`);
              } else {
                toast.error("No phone number on file");
              }
            }}
          >
            <Phone className="h-4 w-4" />
            Contact Customer
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-gray-500">{order.orderDate}</span>
        <span className="text-lg font-bold text-[#111827]">
          {formatCurrency(order.value)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-[#FF6B00]" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Name" value={order.customer.name} />
            <InfoRow label="Type" value={order.customer.type} />
            <InfoRow label="Email" value={order.customer.email ?? "—"} />
            <InfoRow label="Phone" value={order.customer.phone ?? "—"} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">GST Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="GSTIN" value={gst.gstin} />
            <InfoRow label="Company" value={gst.companyName} />
            <InfoRow label="State" value={gst.state} />
            <InfoRow label="Payment" value={order.payment.status} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-[#FF6B00]" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {order.billingAddress ?? order.deliveryAddress}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-[#FF6B00]" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
            <p className="mt-2 text-xs text-gray-400">Site: {order.location}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5 text-[#FF6B00]" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <th className="pb-2">Material</th>
                <th className="pb-2">SKU</th>
                <th className="pb-2">Qty</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.materials.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 font-medium">{m.name}</td>
                  <td className="py-3 text-gray-500">{m.sku}</td>
                  <td className="py-3">
                    {m.quantity} {m.unit}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {formatCurrency(m.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-[#FF6B00]" />
              Order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.timeline.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                {event.status === "completed" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : event.status === "active" ? (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B00]" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                )}
                <div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      event.status === "pending"
                        ? "text-gray-400"
                        : "text-[#111827]"
                    )}
                  >
                    {event.title}
                  </p>
                  {event.timestamp && (
                    <p className="text-xs text-gray-400">{event.timestamp}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inventory Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(order.inventoryAllocation ??
              order.materials.map((m) => ({
                sku: m.sku,
                name: m.name,
                allocated: m.quantity,
                unit: m.unit,
              }))).map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-xl bg-[#F8F9FB] px-4 py-3 text-sm"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-[#FF6B00]">
                  {item.allocated} {item.unit} allocated
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-5 w-5 text-[#FF6B00]" />
            Dispatch History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dispatchHistory.length === 0 &&
          (!order.dispatchHistory || order.dispatchHistory.length === 0) ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No dispatches created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {dispatchHistory.map((d) => (
                <Link
                  key={d.id}
                  href={`/dispatch/${d.dispatchNo}`}
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-4 transition-colors hover:bg-[#F8F9FB]"
                >
                  <div>
                    <p className="font-semibold text-[#111827]">{d.dispatchNo}</p>
                    <p className="text-xs text-gray-500">
                      {d.vehicle} · {d.driver}
                    </p>
                  </div>
                  <DispatchStatusBadge status={d.status} />
                </Link>
              ))}
              {order.dispatchHistory?.map((d) => (
                <div
                  key={d.dispatchNo}
                  className="flex items-center justify-between rounded-xl border border-dashed border-[#E5E7EB] p-4"
                >
                  <div>
                    <p className="font-semibold">{d.dispatchNo}</p>
                    <p className="text-xs text-gray-500">
                      {d.vehicle} · {d.driver}
                    </p>
                  </div>
                  <span className="text-xs font-medium uppercase text-gray-400">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-[#111827]">{value}</p>
    </div>
  );
}
