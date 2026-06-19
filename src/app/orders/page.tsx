"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Download, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useOrdersStore } from "@/store";
import { Button } from "@/components/ui/button";
import { OrderSummaryCards } from "@/components/orders/OrderSummaryCards";
import { OrderStatusTabs } from "@/components/orders/OrderStatusTabs";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { CreateDispatchModal } from "@/components/orders/CreateDispatchModal";
import { InvoicePreviewModal } from "@/components/orders/InvoicePreviewModal";

function OrdersTabSync() {
  const searchParams = useSearchParams();
  const setFilterTab = useOrdersStore((state) => state.setFilterTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "active" || tab === "completed" || tab === "all") {
      setFilterTab(tab);
    }
  }, [searchParams, setFilterTab]);

  return null;
}

export default function OrdersPage() {
  const { loading, loadOrders } = useOrdersStore();

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleExport = () => {
    toast.success("Orders exported to CSV (mock).");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <OrdersTabSync />
      </Suspense>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Hub Order Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and fulfill local customer orders from Sub-Hub West.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-gray-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                asChild
                className="gap-2 rounded-xl bg-[#FF6B00] hover:bg-[#E55F00]"
              >
                <Link href="/orders/create">
                  <Plus className="h-4 w-4" />
                  New Request
                </Link>
              </Button>
            </motion.div>
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-[#E5E7EB]"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <OrderSummaryCards />

        <OrderStatusTabs />

        <OrdersTable />
      </motion.div>

      <OrderDetailsModal />
      <CreateDispatchModal />
      <InvoicePreviewModal />
    </>
  );
}
