"use client";

import {
  Clock,
  CreditCard,
  FileText,
  History,
  Percent,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateOrderStore } from "@/store/createOrderStore";
import { generateQuotePdf } from "@/lib/generateQuotePdf";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const ACTIONS = [
  { icon: History, label: "Customer History" },
  { icon: Clock, label: "Customer Outstanding Balance" },
  { icon: CreditCard, label: "Credit Limit" },
  { icon: ShoppingBag, label: "Recent Orders" },
  { icon: Percent, label: "Apply Discount" },
  { icon: FileText, label: "Generate Quotation PDF" },
];

export function QuickActionsPanel() {
  const {
    customer,
    setDiscount,
    lineItems,
    orderId,
    siteDetails,
    materialTotal,
    deliveryCharge,
    gstAmount,
    grandTotal,
    discount,
  } = useCreateOrderStore();

  const handleGenerateQuote = () => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one product before generating a quote.");
      return;
    }

    generateQuotePdf({
      orderId,
      customer: customer
        ? {
            name: customer.name,
            mobile: customer.mobile,
            email: customer.email,
            customerTypeLabel: customer.customerTypeLabel,
          }
        : null,
      siteDetails,
      lineItems,
      materialTotal: materialTotal(),
      deliveryCharge: deliveryCharge(),
      gstAmount: gstAmount(),
      discount,
      grandTotal: grandTotal(),
    });
    toast.success("Quotation PDF downloaded.");
  };

  const handleAction = (label: string) => {
    if (label === "Generate Quotation PDF") {
      handleGenerateQuote();
      return;
    }
    if (label === "Apply Discount") {
      setDiscount(3000);
      toast.success("Special discount of ₹3,000 applied.");
      return;
    }
    if (label === "Customer Outstanding Balance" && customer) {
      toast(
        `Outstanding balance: ${formatCurrency(customer.outstandingBalance)}`,
        { icon: "💳" }
      );
      return;
    }
    if (label === "Credit Limit" && customer) {
      toast(`Credit limit: ${formatCurrency(customer.creditLimit)}`, {
        icon: "🏦",
      });
      return;
    }
    toast(`${label} (mock).`);
  };

  return (
    <Card className="rounded-2xl border-[#E5E7EB] bg-slate-50/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleAction(label)}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-white hover:text-[#FF6B00]"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
