"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { OutgoingDispatchesTable } from "@/components/dashboard/OutgoingDispatchesTable";
import { KPICard } from "@/components/dashboard/KPICard";
import { OutboundEfficiencyChart } from "@/components/dashboard/OutboundEfficiencyChart";
import { QuickOperations } from "@/components/dashboard/QuickOperations";
import { RequisitionCard } from "@/components/dashboard/RequisitionCard";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboard.service";
import { useDashboardStore } from "@/store";

export default function DashboardPage() {
  const {
    lastSync,
    kpis,
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

  useEffect(() => {
    loadDashboard();
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.id}
            className="h-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <KPICard kpi={kpi} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OutgoingDispatchesTable />
        </div>
        <QuickOperations operations={quickOperations} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Active Requisitions
          </h3>
          {activeRequisitions.map((req) => (
            <RequisitionCard key={req.id} requisition={req} />
          ))}
        </div>

        <OutboundEfficiencyChart data={outboundEfficiency} />

        <ActivityTimeline logs={recentLogs} />
      </div>
    </div>
  );
}
