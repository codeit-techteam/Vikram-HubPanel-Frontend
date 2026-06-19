"use client";

import { CheckCircle2, Lock, Truck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateOrderStore, type DispatchChecklist } from "@/store/createOrderStore";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CHECKLIST_ITEMS: {
  key: keyof DispatchChecklist;
  label: string;
}[] = [
  { key: "customerVerified", label: "Customer Verified" },
  { key: "paymentReceived", label: "Payment Received" },
  { key: "inventoryAvailable", label: "Inventory Available" },
  { key: "deliverySiteVerified", label: "Delivery Site Verified" },
  { key: "materialsAllocated", label: "All Materials Allocated" },
];

export function DispatchReadinessCard() {
  const {
    dispatchChecklist,
    setDispatchCheck,
    isDispatchLocked,
    paymentStatus,
    grandTotal,
  } = useCreateOrderStore();

  const locked = isDispatchLocked();
  const total = grandTotal();
  const advanceRequired = Math.round(total * 0.5);

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
              <Truck className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <CardTitle className="text-base font-semibold text-[#111827]">
              Dispatch Readiness
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {CHECKLIST_ITEMS.map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E5E7EB] p-3 hover:bg-gray-50"
            >
              <Checkbox
                checked={dispatchChecklist[key]}
                onCheckedChange={(v) => setDispatchCheck(key, v === true)}
              />
              <span className="text-sm font-medium text-[#111827]">{label}</span>
              {dispatchChecklist[key] ? (
                <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="ml-auto h-4 w-4 text-gray-300" />
              )}
            </label>
          ))}
        </CardContent>
      </Card>

      {locked ? (
        <Card className="overflow-hidden rounded-2xl border-l-4 border-l-[#FF6B00] shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <Lock className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#FF6B00]">Dispatch Locked</h3>
              <p className="mt-1 text-sm text-gray-600">
                Dispatch cannot begin until payment is received. Immediate dispatch
                is restricted until at least 50% advance payment is received or
                credit is approved.
              </p>
              <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                Confirm Advance: {formatCurrency(advanceRequired)}
              </div>
            </div>
            <Button
              type="button"
              disabled
              className="shrink-0 rounded-xl"
            >
              <Truck className="mr-2 h-4 w-4" />
              Create Dispatch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-700">Ready For Dispatch</h3>
              <p className="mt-1 text-sm text-gray-600">
                Payment has been approved. You can now create a dispatch for this
                order.
              </p>
              <span
                className={cn(
                  "mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  paymentStatus === "ready_for_dispatch"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                {paymentStatus === "dispatched" ? "Dispatched" : "Ready For Dispatch"}
              </span>
            </div>
            <Button
              type="button"
              className="shrink-0 rounded-xl bg-green-600 hover:bg-green-700"
              onClick={() => toast.success("Dispatch created (mock).")}
            >
              <Truck className="mr-2 h-4 w-4" />
              Create Dispatch
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
