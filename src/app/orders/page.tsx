"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useOrdersStore } from "@/store";
import { ordersService } from "@/services/orders.service";
import { Button } from "@/components/ui/button";
import { OrderSummaryCards } from "@/components/orders/OrderSummaryCards";
import { OrderStatusTabs } from "@/components/orders/OrderStatusTabs";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { InvoicePreviewModal } from "@/components/orders/InvoicePreviewModal";

function OrdersTabSync() {
  const searchParams = useSearchParams();
  const filters = useOrdersStore((state) => state.filters);
  const setFilterTab = useOrdersStore((state) => state.setFilterTab);
  const setSearch = useOrdersStore((state) => state.setSearch);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab === "active" ||
      tab === "completed" ||
      tab === "all"
    ) {
      if (filters.tab !== tab) {
        setFilterTab(tab);
      }
    } else if (!tab && filters.tab !== "all") {
      setFilterTab("all");
    }

    const q = searchParams.get("search");
    if (q != null && q !== filters.search) {
      setSearch(q);
    }
  }, [searchParams, filters.tab, filters.search, setFilterTab, setSearch]);

  return null;
}

export default function OrdersPage() {
  const { loading, error, allOrders, loadOrders } = useOrdersStore();
  const isInitialLoad = loading && allOrders.length === 0;

  useEffect(() => {
    loadOrders();
    const timer = window.setInterval(() => {
      void loadOrders();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  const handleExport = async () => {
    try {
      await ordersService.exportOrdersCsv(allOrders);
      toast.success(`Exported ${allOrders.length} orders to CSV`);
    } catch {
      toast.error("Failed to export orders");
    }
  };

  if (isInitialLoad) {
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
              Manage and fulfill customer orders for your assigned hub.
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

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">
              Couldn&apos;t load orders: {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => loadOrders()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <OrdersTable />
        )}
      </motion.div>

      <OrderDetailsModal />
      <InvoicePreviewModal />
    </>
  );
}
