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
    setSelectedHub,
    setDateRange,
    setCustomDateRange,
    loadAnalytics,
    exportExcel,
    downloadPDF,
  } = useAnalyticsStore();

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading && !overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
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
      className="space-y-6"
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
