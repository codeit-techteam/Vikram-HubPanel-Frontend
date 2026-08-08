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
import { useAuthStore } from "@/store/authStore";

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
  error: string | null;

  setSelectedHub: (hub: string) => void;
  setDateRange: (range: AnalyticsDateRangePreset) => void;
  setCustomDateRange: (from: Date | undefined, to: Date | undefined) => void;
  loadAnalytics: () => Promise<void>;
  exportExcel: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  getDashboardData: () => AnalyticsDashboardData | null;
}

function assignedHubOption(): AnalyticsHubOption[] {
  const manager = useAuthStore.getState().manager;
  if (!manager?.hubId) return [];
  return [
    {
      value: manager.hubId,
      label: manager.hubName || "Assigned Hub",
    },
  ];
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  overview: null,
  inventoryTrends: [],
  consumption: [],
  requisitionVolume: null,
  deliveryPerformance: null,
  movementLogs: [],
  hubOptions: [],
  selectedHub: "",
  dateRange: "last_30_days",
  customDateFrom: undefined,
  customDateTo: undefined,
  lastUpdated: "",
  loading: false,
  exporting: false,
  error: null,

  setSelectedHub: (selectedHub) => {
    // Hub managers are locked to their assigned hub — ignore other selections
    const locked = assignedHubOption()[0]?.value;
    set({ selectedHub: locked || selectedHub });
    void get().loadAnalytics();
  },

  setDateRange: (dateRange) => {
    set({ dateRange });
    if (dateRange !== "custom") {
      void get().loadAnalytics();
    }
  },

  setCustomDateRange: (from, to) => {
    set({ customDateFrom: from, customDateTo: to, dateRange: "custom" });
    if (from && to) {
      void get().loadAnalytics();
    }
  },

  loadAnalytics: async () => {
    const { dateRange, customDateFrom, customDateTo } = get();
    const hubs = assignedHubOption();
    set({
      loading: true,
      error: null,
      hubOptions: hubs,
      selectedHub: hubs[0]?.value || get().selectedHub,
    });
    try {
      const data = await analyticsService.getFullDashboard(
        hubs[0]?.value,
        dateRange,
        customDateFrom,
        customDateTo,
      );
      set({
        overview: data.overview,
        inventoryTrends: data.inventoryTrends,
        consumption: data.consumption,
        requisitionVolume: data.requisitionVolume,
        deliveryPerformance: data.deliveryPerformance,
        movementLogs: data.movementLogs,
        hubOptions: data.hubOptions.length ? data.hubOptions : hubs,
        selectedHub: data.hubOptions[0]?.value || hubs[0]?.value || "",
        lastUpdated: data.lastUpdated,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((err as any).response?.data?.message as string)
          : undefined;
      set({
        loading: false,
        error: message || "Unable to load hub analytics.",
        // Clear stale numbers so old period data is not shown as current
        overview: null,
        inventoryTrends: [],
        consumption: [],
        requisitionVolume: null,
        deliveryPerformance: null,
        movementLogs: [],
      });
      toast.error(message || "Unable to load hub analytics.");
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
