import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  AnalyticsConsumptionItem,
  AnalyticsDashboardData,
  AnalyticsDateRangePreset,
  AnalyticsDeliveryPerformance,
  AnalyticsHubOption,
  AnalyticsInventoryTrend,
  AnalyticsOverview,
  AnalyticsRequisitionVolume,
  LogisticsMovementLog,
} from "@/types";
import { analyticsService } from "@/services/analytics.service";

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  inventoryTrends: AnalyticsInventoryTrend[];
  consumption: AnalyticsConsumptionItem[];
  requisitionVolume: AnalyticsRequisitionVolume | null;
  deliveryPerformance: AnalyticsDeliveryPerformance | null;
  movementLogs: LogisticsMovementLog[];
  hubOptions: AnalyticsHubOption[];
  selectedHub: string;
  dateRange: AnalyticsDateRangePreset;
  customDateFrom: Date | undefined;
  customDateTo: Date | undefined;
  lastUpdated: string;
  loading: boolean;
  exporting: boolean;

  setSelectedHub: (hub: string) => void;
  setDateRange: (range: AnalyticsDateRangePreset) => void;
  setCustomDateRange: (from: Date | undefined, to: Date | undefined) => void;
  loadAnalytics: () => Promise<void>;
  exportExcel: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  getDashboardData: () => AnalyticsDashboardData | null;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  overview: null,
  inventoryTrends: [],
  consumption: [],
  requisitionVolume: null,
  deliveryPerformance: null,
  movementLogs: [],
  hubOptions: [],
  selectedHub: "central",
  dateRange: "last_30_days",
  customDateFrom: undefined,
  customDateTo: undefined,
  lastUpdated: "",
  loading: false,
  exporting: false,

  setSelectedHub: (selectedHub) => {
    set({ selectedHub });
    get().loadAnalytics();
  },

  setDateRange: (dateRange) => {
    set({ dateRange });
    if (dateRange !== "custom") {
      get().loadAnalytics();
    }
  },

  setCustomDateRange: (from, to) => {
    set({ customDateFrom: from, customDateTo: to, dateRange: "custom" });
    if (from && to) {
      get().loadAnalytics();
    }
  },

  loadAnalytics: async () => {
    const { selectedHub, dateRange } = get();
    set({ loading: true });
    try {
      const data = await analyticsService.getFullDashboard(selectedHub, dateRange);
      set({
        overview: data.overview,
        inventoryTrends: data.inventoryTrends,
        consumption: data.consumption,
        requisitionVolume: data.requisitionVolume,
        deliveryPerformance: data.deliveryPerformance,
        movementLogs: data.movementLogs,
        hubOptions: data.hubOptions,
        lastUpdated: data.lastUpdated,
        loading: false,
      });
    } catch {
      set({ loading: false });
      toast.error("Failed to load analytics data.");
    }
  },

  getDashboardData: () => {
    const state = get();
    if (!state.overview || !state.requisitionVolume || !state.deliveryPerformance) {
      return null;
    }
    return {
      overview: state.overview,
      inventoryTrends: state.inventoryTrends,
      consumption: state.consumption,
      requisitionVolume: state.requisitionVolume,
      deliveryPerformance: state.deliveryPerformance,
      movementLogs: state.movementLogs,
      hubOptions: state.hubOptions,
      lastUpdated: state.lastUpdated,
    };
  },

  exportExcel: async () => {
    const data = get().getDashboardData();
    if (!data) return;
    set({ exporting: true });
    try {
      await analyticsService.exportExcel(data);
      toast.success("Analytics exported to Excel.");
    } catch {
      toast.error("Export failed.");
    } finally {
      set({ exporting: false });
    }
  },

  downloadPDF: async () => {
    const data = get().getDashboardData();
    if (!data) return;
    set({ exporting: true });
    try {
      await analyticsService.downloadPDF(data);
      toast.success("PDF report ready for download.");
    } catch {
      toast.error("PDF generation failed.");
    } finally {
      set({ exporting: false });
    }
  },
}));
