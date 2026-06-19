import { create } from "zustand";
import type {
  ActivityLog,
  ActiveRequisition,
  DashboardKpi,
  IncomingDelivery,
  OutboundEfficiency,
  QuickOperation,
} from "@/types";
import { dashboardService } from "@/services/dashboard.service";

interface DashboardState {
  lastSync: string;
  kpis: DashboardKpi[];
  incomingDeliveries: IncomingDelivery[];
  quickOperations: QuickOperation[];
  activeRequisitions: ActiveRequisition[];
  outboundEfficiency: OutboundEfficiency;
  recentLogs: ActivityLog[];
  searchQuery: string;
  isLoading: boolean;
  dateRange: { from: Date | undefined; to: Date | undefined };
  selectedHub: string;
  setSearchQuery: (query: string) => void;
  setDateRange: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
  setSelectedHub: (hubId: string) => void;
  loadDashboard: () => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  updateIncomingTransfersKpi: () => void;
  updateDispatchKpis: (
    action: "created" | "delivered",
    revenue?: number
  ) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  lastSync: "",
  kpis: [],
  incomingDeliveries: [],
  quickOperations: [],
  activeRequisitions: [],
  outboundEfficiency: {
    total: 0,
    dispatched: 0,
    loading: 0,
    pending: 0,
  },
  recentLogs: [],
  searchQuery: "",
  isLoading: false,
  dateRange: { from: undefined, to: undefined },
  selectedHub: "all",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDateRange: (dateRange) => set({ dateRange }),
  setSelectedHub: (selectedHub) => set({ selectedHub }),
  loadDashboard: async () => {
    set({ isLoading: true });
    const data = await dashboardService.getDashboard();
    set({
      lastSync: data.lastSync,
      kpis: data.kpis,
      incomingDeliveries: data.incomingDeliveries,
      quickOperations: data.quickOperations,
      activeRequisitions: data.activeRequisitions,
      outboundEfficiency: data.outboundEfficiency,
      recentLogs: data.recentLogs,
      isLoading: false,
    });
  },

  addActivityLog: (log) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: "Just now",
    };
    set((state) => ({
      recentLogs: [newLog, ...state.recentLogs].slice(0, 20),
    }));
  },

  updateIncomingTransfersKpi: () => {
    set((state) => ({
      kpis: state.kpis.map((kpi) =>
        kpi.id === "incoming-transfers"
          ? {
              ...kpi,
              value: String(Math.max(0, parseInt(kpi.value, 10) - 1)),
            }
          : kpi
      ),
    }));
  },

  updateDispatchKpis: (action: "created" | "delivered", revenue?: number) => {
    set((state) => ({
      kpis: state.kpis.map((kpi) => {
        if (action === "created" && kpi.id === "pending-dispatches") {
          const current = parseInt(kpi.value, 10) || 0;
          return { ...kpi, value: String(current + 1) };
        }
        if (action === "delivered" && kpi.id === "completed-deliveries") {
          const current = parseInt(kpi.value, 10) || 0;
          return { ...kpi, value: String(current + 1) };
        }
        if (action === "delivered" && kpi.id === "revenue-today" && revenue) {
          const current = parseInt(String(kpi.value).replace(/[^\d]/g, ""), 10) || 0;
          return {
            ...kpi,
            value: `₹${(current + revenue).toLocaleString("en-IN")}`,
          };
        }
        return kpi;
      }),
      outboundEfficiency:
        action === "created"
          ? {
              ...state.outboundEfficiency,
              dispatched: state.outboundEfficiency.dispatched + 1,
              pending: Math.max(0, state.outboundEfficiency.pending - 1),
            }
          : action === "delivered"
            ? {
                ...state.outboundEfficiency,
                dispatched: Math.max(
                  0,
                  state.outboundEfficiency.dispatched - 1
                ),
              }
            : state.outboundEfficiency,
    }));
  },
}));
