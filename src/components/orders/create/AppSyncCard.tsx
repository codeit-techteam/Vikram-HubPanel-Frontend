"use client";

import { Bell, MessageCircle, RefreshCw, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useCreateOrderStore } from "@/store/createOrderStore";
import { formatCurrency } from "@/lib/utils";

const SYNC_OPTIONS = [
  {
    key: "createInApp" as const,
    label: "Create Order in Customer App",
    icon: Smartphone,
  },
  {
    key: "pushNotification" as const,
    label: "Send Push Notification",
    icon: Bell,
  },
  {
    key: "sms" as const,
    label: "Send SMS",
    icon: MessageCircle,
  },
  {
    key: "whatsapp" as const,
    label: "Send WhatsApp Confirmation",
    icon: MessageCircle,
  },
];

export function AppSyncCard() {
  const { appSync, setAppSync, customer, lineItems, grandTotal, paymentLink } =
    useCreateOrderStore();

  const total = grandTotal();
  const customerName = customer?.name ?? "Customer";

  return (
    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <RefreshCw className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#111827]">
            Customer App Sync
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            {SYNC_OPTIONS.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-[#E5E7EB] p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#FF6B00]" />
                  <span className="text-sm font-medium text-[#111827]">
                    {label}
                  </span>
                </div>
                <Switch
                  checked={appSync[key]}
                  onCheckedChange={(v) => setAppSync(key, v)}
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Customer App Notification Preview
            </p>
            <div className="mx-auto max-w-[280px] rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B00] text-xs font-bold text-white">
                  BQ
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#111827]">
                    BuildQuick
                  </p>
                  <p className="text-[10px] text-gray-400">Just now</p>
                </div>
              </div>
              <p className="text-sm text-[#111827]">
                Hi {customerName.split(" ")[0]}, your order of{" "}
                <strong>{lineItems.length || 0} items</strong> totalling{" "}
                <strong>{formatCurrency(total)}</strong> has been created.
              </p>
              {lineItems.slice(0, 2).map((item) => (
                <p key={item.productId} className="mt-1 text-xs text-gray-500">
                  • {item.name} × {item.quantity}
                </p>
              ))}
              {lineItems.length > 2 && (
                <p className="text-xs text-gray-400">
                  +{lineItems.length - 2} more items
                </p>
              )}
              <div className="mt-3 rounded-lg bg-blue-50 p-2">
                <p className="text-[10px] text-gray-500">Payment Link</p>
                <p className="truncate text-xs font-medium text-blue-600">
                  {paymentLink.replace("https://", "")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
