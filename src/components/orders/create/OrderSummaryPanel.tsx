"use client";

import { motion } from "framer-motion";
import { List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateOrderStore } from "@/store/createOrderStore";
import {
  DELIVERY_CHARGE,
  GST_RATE,
} from "@/mock/createOrderData";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderPaymentStatus } from "@/mock/createOrderData";

const STATUS_CONFIG: Record<
  OrderPaymentStatus,
  { label: string; className: string }
> = {
  payment_pending: {
    label: "Payment Pending",
    className: "bg-orange-100 text-[#FF6B00]",
  },
  ready_for_dispatch: {
    label: "Ready For Dispatch",
    className: "bg-green-100 text-green-700",
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-blue-100 text-blue-700",
  },
};

export function OrderSummaryPanel() {
  const {
    customer,
    siteDetails,
    lineItems,
    materialTotal,
    gstAmount,
    grandTotal,
    discount,
    paymentStatus,
  } = useCreateOrderStore();

  const material = materialTotal();
  const gst = gstAmount();
  const total = grandTotal();
  const status = STATUS_CONFIG[paymentStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="lg:sticky lg:top-6"
    >
      <Card className="overflow-hidden rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader className="bg-[#1E293B] pb-4 text-white">
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-[#FF6B00]" />
            <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <SummaryRow
            label="Customer"
            value={customer?.name ?? "—"}
            sub={customer?.mobile}
          />
          <SummaryRow
            label="Delivery To"
            value={siteDetails.siteName || "—"}
            sub={
              siteDetails.deliveryAddress
                ? siteDetails.deliveryAddress.slice(0, 40) +
                  (siteDetails.deliveryAddress.length > 40 ? "…" : "")
                : undefined
            }
          />
          <SummaryRow
            label="Products"
            value={`${lineItems.length} item${lineItems.length !== 1 ? "s" : ""}`}
          />

          <div className="space-y-2 border-t border-[#E5E7EB] pt-4">
            <LineItem label="Material Total" value={formatCurrency(material)} />
            <LineItem label="Delivery Charges" value={formatCurrency(DELIVERY_CHARGE)} />
            <LineItem label={`GST (${GST_RATE * 100}%)`} value={formatCurrency(gst)} />
            {discount > 0 && (
              <LineItem
                label="Discount"
                value={`-${formatCurrency(discount)}`}
                valueClass="text-green-600"
              />
            )}
          </div>

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Grand Total
            </p>
            <p className="text-3xl font-bold text-[#FF6B00]">
              {formatCurrency(total)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Status
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                status.className
              )}
            >
              {status.label}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SummaryRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[#111827]">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function LineItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={cn("font-medium text-[#111827]", valueClass)}>{value}</span>
    </div>
  );
}
