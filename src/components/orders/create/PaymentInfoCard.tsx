"use client";

import {
  Banknote,
  Copy,
  CreditCard,
  Link2,
  Send,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateOrderStore } from "@/store/createOrderStore";
import type { PaymentMethod } from "@/mock/createOrderData";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "credit", label: "Credit", icon: CreditCard },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "bank_transfer", label: "Bank Transfer", icon: Banknote },
  { id: "cash", label: "Cash", icon: Wallet },
];

export function PaymentInfoCard() {
  const {
    paymentMethod,
    setPaymentMethod,
    advanceAmount,
    setAdvanceAmount,
    paymentLink,
    generatePaymentLink,
    sendPaymentLink,
    mockApprovePayment,
    paymentStatus,
    grandTotal,
    balanceDue,
  } = useCreateOrderStore();

  const total = grandTotal();
  const balance = balanceDue();

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentLink);
    toast.success("Payment link copied to clipboard.");
  };

  return (
    <Card className="rounded-2xl border-[#E5E7EB] shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
            <Wallet className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <CardTitle className="text-base font-semibold text-[#111827]">
            Payment Information
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPaymentMethod(id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors",
                paymentMethod === id
                  ? "border-[#FF6B00] bg-orange-50"
                  : "border-[#E5E7EB] hover:border-orange-200"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  paymentMethod === id ? "text-[#FF6B00]" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  paymentMethod === id ? "text-[#FF6B00]" : "text-gray-600"
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Advance Amount</Label>
            <Input
              type="number"
              min={0}
              value={advanceAmount || ""}
              onChange={(e) =>
                setAdvanceAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="₹0"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Balance Due</Label>
            <div
              className={cn(
                "flex h-10 items-center rounded-xl border px-3 text-sm font-bold",
                balance > 0
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-green-200 bg-green-50 text-green-600"
              )}
            >
              {formatCurrency(balance)}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-4">
          <Label className="text-xs text-gray-500">Payment Link Preview</Label>
          <p className="mt-1 break-all font-mono text-sm text-[#111827]">
            {paymentLink}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={generatePaymentLink}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Generate Payment Link
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={copyLink}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Link
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-lg bg-[#1E293B] hover:bg-[#0F172A]"
              onClick={sendPaymentLink}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Send Payment Link
            </Button>
          </div>
        </div>

        {paymentStatus === "payment_pending" && (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-dashed border-green-300 text-green-700 hover:bg-green-50"
            onClick={mockApprovePayment}
          >
            Mock: Mark Payment as Received ({formatCurrency(total)})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
