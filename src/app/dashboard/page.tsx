"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { ActiveRequisitionsPanel } from "@/components/dashboard/ActiveRequisitionsPanel";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { IncomingDeliveriesTable } from "@/components/dashboard/IncomingDeliveriesTable";
import { OutgoingDispatchesTable } from "@/components/dashboard/OutgoingDispatchesTable";
import type { DashboardTimePeriod } from "@/components/dashboard/DashboardTimeFilter";
import { KPICard } from "@/components/dashboard/KPICard";
import { OutboundEfficiencyChart } from "@/components/dashboard/OutboundEfficiencyChart";
import { QuickOperations } from "@/components/dashboard/QuickOperations";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";
import { useDashboardStore } from "@/store";
import { isOperationalKpi } from "@/lib/dashboardFilters";
import type { DashboardOperationalFilter } from "@/types";

export default function DashboardPage() {
  const {
    lastSync,
    kpis,
    outgoingDispatches,
    incomingDeliveries,
    quickOperations,
    activeRequisitions,
    outboundEfficiency,
    recentLogs,
    isLoading,
    loadDashboard,
  } = useDashboardStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [period, setPeriod] = useState<DashboardTimePeriod>("today");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [operationalFilter, setOperationalFilter] =
    useState<DashboardOperationalFilter | null>(null);

  const handleKpiClick = (kpiId: string) => {
    if (!isOperationalKpi(kpiId)) return;

    setOperationalFilter((current) => (current === kpiId ? null : kpiId));

    requestAnimationFrame(() => {
      document
        .getElementById("outgoing-dispatches-table")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  useEffect(() => {
    void loadDashboard();
    const timer = window.setInterval(() => {
      void loadDashboard();
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [loadDashboard]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await loadDashboard();
      toast.success("Dashboard synced with latest hub data.");
    } catch {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await dashboardService.downloadPDF({
        lastSync,
        kpis,
        outgoingDispatches,
        incomingDeliveries,
        activeRequisitions,
        outboundEfficiency,
        recentLogs,
      });
      toast.success("PDF report ready — use Save as PDF in the print dialog.");
    } catch {
      toast.error("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && kpis.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6B00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hub Overview</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Real-time updates active · Last sync: {lastSync}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 border-gray-200 bg-white"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PDF
          </Button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="gap-2 bg-[#FF6B00] hover:bg-[#E55F00]"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Now
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Row 1 — core operational KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
      >
        {kpis.slice(0, 5).map((kpi, index) => (
          <motion.div
            key={kpi.id}
            className="h-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <KPICard
              kpi={kpi}
              isClickable={isOperationalKpi(kpi.id)}
              isActive={operationalFilter === kpi.id}
              onClick={
                isOperationalKpi(kpi.id)
                  ? () => handleKpiClick(kpi.id)
                  : undefined
              }
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Row 2 — customer feature KPIs (clickable) */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Customer Insights
        </p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {kpis.slice(5).map((kpi, index) => (
            <motion.div
              key={kpi.id}
              className="h-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
            >
              <KPICard
                kpi={kpi}
                isClickable={isOperationalKpi(kpi.id)}
                isActive={operationalFilter === kpi.id}
                onClick={
                  isOperationalKpi(kpi.id)
                    ? () => handleKpiClick(kpi.id)
                    : undefined
                }
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OutgoingDispatchesTable
            dispatches={outgoingDispatches}
            period={period}
            selectedMonth={selectedMonth}
            onPeriodChange={setPeriod}
            onMonthChange={setSelectedMonth}
            operationalFilter={operationalFilter}
            onClearFilter={() => setOperationalFilter(null)}
          />
        </div>
        <QuickOperations operations={quickOperations} />
      </div>

      <IncomingDeliveriesTable
        deliveries={incomingDeliveries}
        period={period}
        selectedMonth={selectedMonth}
        onPeriodChange={setPeriod}
        onMonthChange={setSelectedMonth}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <ActiveRequisitionsPanel requisitions={activeRequisitions} />

        <OutboundEfficiencyChart data={outboundEfficiency} />

        <ActivityTimeline
          logs={recentLogs}
          period={period}
          selectedMonth={selectedMonth}
          onPeriodChange={setPeriod}
          onMonthChange={setSelectedMonth}
        />
      </div>
    </div>
  );
}
