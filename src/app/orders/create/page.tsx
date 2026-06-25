"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { CustomerLookupCard } from "@/components/orders/create/CustomerLookupCard";
import { SiteDetailsCard } from "@/components/orders/create/SiteDetailsCard";
import { MaterialProcurementCard } from "@/components/orders/create/MaterialProcurementCard";
import { PaymentInfoCard } from "@/components/orders/create/PaymentInfoCard";
import { DispatchReadinessCard } from "@/components/orders/create/DispatchReadinessCard";
import { OrderSummaryPanel } from "@/components/orders/create/OrderSummaryPanel";
import { QuickActionsPanel } from "@/components/orders/create/QuickActionsPanel";
import { useCreateOrderStore } from "@/store/createOrderStore";
import { generateQuotePdf } from "@/lib/generateQuotePdf";
import { FileText, Save } from "lucide-react";

export default function CreateCustomerOrderPage() {
  const router = useRouter();
  const {
    saveDraft,
    isSavingDraft,
    canCreateOrder,
    customer,
    siteDetails,
    lineItems,
    orderId,
    materialTotal,
    deliveryCharge,
    gstAmount,
    grandTotal,
    discount,
    reset,
  } = useCreateOrderStore();

  const handleSaveDraft = async () => {
    await saveDraft();
  };

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

  const handleCreateOrder = () => {
    if (!customer) {
      toast.error("Please search and select a customer first.");
      return;
    }
    if (!siteDetails.siteName.trim() || !siteDetails.deliveryAddress.trim()) {
      toast.error("Please complete delivery site details.");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }

    toast.success("Order created successfully. Payment link sent to customer.");
    reset();
    router.push("/orders");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 pb-24 lg:pb-6"
    >
      <Breadcrumbs
        items={[
          { label: "Orders", href: "/orders" },
          { label: "New Request", href: "/orders/create", active: true },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Create Customer Order
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create orders manually on behalf of customers from Hub Operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-[#E5E7EB]"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-[#E5E7EB]"
            onClick={handleGenerateQuote}
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Quote
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              className="rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={handleCreateOrder}
              disabled={!canCreateOrder()}
            >
              Create Order
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <CustomerLookupCard />
          <SiteDetailsCard />
          <MaterialProcurementCard />
          <PaymentInfoCard />
          <DispatchReadinessCard />
        </div>

        <div className="space-y-4">
          <OrderSummaryPanel />
          <QuickActionsPanel />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E5E7EB] bg-white p-4 lg:hidden">
        <Button
          type="button"
          className="h-12 w-full rounded-xl text-base font-semibold"
          onClick={handleCreateOrder}
          disabled={!canCreateOrder()}
        >
          Create Order
        </Button>
      </div>
    </motion.div>
  );
}
