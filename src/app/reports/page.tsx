"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AnalyticsExportActions } from "@/components/analytics/AnalyticsExportActions";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { AnalyticsKPICards } from "@/components/analytics/AnalyticsKPICards";
import { DeliveryPerformanceCard } from "@/components/analytics/DeliveryPerformanceCard";
import { InventoryTrendsChart } from "@/components/analytics/InventoryTrendsChart";
import { LogisticsMovementTable } from "@/components/analytics/LogisticsMovementTable";
import { ProductConsumptionCard } from "@/components/analytics/ProductConsumptionCard";
import { RequisitionVolumeCard } from "@/components/analytics/RequisitionVolumeCard";
import { Button } from "@/components/ui/button";
import { useAnalyticsStore } from "@/store/analyticsStore";

export default function ReportsPage() {
  const {
    overview,
    inventoryTrends,
    consumption,
    requisitionVolume,
    deliveryPerformance,
    movementLogs,
    hubOptions,
    selectedHub,
    dateRange,
    customDateFrom,
    customDateTo,
    lastUpdated,
    loading,
    exporting,
    error,
    setSelectedHub,
    setDateRange,
    setCustomDateRange,
    loadAnalytics,
    exportExcel,
    downloadPDF,
  } = useAnalyticsStore();

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-16 animate-pulse rounded-2xl bg-gray-100" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-10">
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100 lg:col-span-7" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-100 lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-[#111827]">
          Unable to load hub analytics.
        </p>
        <p className="max-w-md text-xs text-gray-500">{error}</p>
        <Button
          className="bg-[#FF6B00] hover:bg-[#E55F00]"
          onClick={() => void loadAnalytics()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!overview || !requisitionVolume || !deliveryPerformance) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`space-y-6 ${loading ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Hub Performance Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Construction ERP Performance Intelligence Dashboard
          </p>
        </div>
        <AnalyticsExportActions
          onExportExcel={exportExcel}
          onDownloadPDF={downloadPDF}
          exporting={exporting}
        />
      </div>

      <AnalyticsFilters
        hubOptions={hubOptions}
        selectedHub={selectedHub}
        dateRange={dateRange}
        customDateFrom={customDateFrom}
        customDateTo={customDateTo}
        lastUpdated={lastUpdated}
        hubLocked
        onHubChange={setSelectedHub}
        onDateRangeChange={setDateRange}
        onCustomDateChange={(range) =>
          setCustomDateRange(range?.from, range?.to)
        }
      />

      <AnalyticsKPICards overview={overview} />

      <div className="grid gap-4 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <InventoryTrendsChart data={inventoryTrends} />
        </div>
        <div className="lg:col-span-3">
          <ProductConsumptionCard data={consumption} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RequisitionVolumeCard data={requisitionVolume} />
        <DeliveryPerformanceCard data={deliveryPerformance} />
      </div>

      <LogisticsMovementTable logs={movementLogs} />
    </motion.div>
  );
}
