"use client";

import {
  Clock,
  CreditCard,
  Package,
  Truck,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderFeatureBadges } from "./OrderFeatureBadges";
import type { OrderOperationalFlags } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { formatPaymentMethodLabel } from "@/lib/payment-method-labels";

interface OrderOperationalDetailsProps {
  customerName: string;
  operational?: OrderOperationalFlags;
  paymentMethod?: string;
  eta?: string;
  compact?: boolean;
}

export function OrderOperationalDetails({
  customerName,
  operational,
  paymentMethod,
  eta,
  compact = false,
}: OrderOperationalDetailsProps) {
  if (!operational && !paymentMethod && !eta) return null;

  const displayEta = eta ?? operational?.eta;

  const content = (
    <div className={compact ? "space-y-3" : "grid gap-4 sm:grid-cols-2"}>
      <DetailItem
        icon={<User className="h-4 w-4 text-[#FF6B00]" />}
        label="Customer Name"
        value={customerName}
      />
      <DetailItem
        icon={<Truck className="h-4 w-4 text-[#FF6B00]" />}
        label="Emergency Order"
        value={operational?.isEmergencyDelivery ? "Yes" : "No"}
        highlight={operational?.isEmergencyDelivery}
      />
      <DetailItem
        icon={<Package className="h-4 w-4 text-[#FF6B00]" />}
        label="Bulk Procurement"
        value={operational?.isBulkProcurement ? "Yes" : "No"}
        highlight={operational?.isBulkProcurement}
      />
      <DetailItem
        icon={<Truck className="h-4 w-4 text-[#FF6B00]" />}
        label="Loading/Unloading Required"
        value={operational?.loadingUnloadingRequired ? "Yes" : "No"}
      />
      {paymentMethod && (
        <DetailItem
          icon={<CreditCard className="h-4 w-4 text-[#FF6B00]" />}
          label="Payment Method"
          value={formatPaymentMethodLabel(paymentMethod)}
        />
      )}
      {displayEta && (
        <DetailItem
          icon={<Clock className="h-4 w-4 text-[#FF6B00]" />}
          label="ETA"
          value={displayEta}
          highlight={operational?.isEmergencyDelivery}
        />
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        <OrderFeatureBadges operational={operational} />
        {content}
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Delivery & Customer Features</CardTitle>
          <OrderFeatureBadges operational={operational} />
        </div>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

function DetailItem({
  icon,
  label,
  value,
  readOnly,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  readOnly?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-red-100 bg-red-50/50 p-3"
          : "rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] p-3"
      }
    >
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {label}
          {readOnly && (
            <span className="ml-1 font-normal normal-case text-gray-300">
              (Read Only)
            </span>
          )}
        </p>
      </div>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}
