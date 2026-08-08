import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  CreateDispatchPayload,
  HubOrder,
  OrderFilterTab,
  OrderPagination,
  OrderSummaryData,
} from "@/types";
import {
  ordersService,
  filterOrdersByTab,
  type HubStatusAlias,
} from "@/services/orders.service";
import { useInventoryStore } from "./inventoryStore";
import { useDashboardStore } from "./dashboardStore";
import { useAnalyticsStore } from "./analyticsStore";

async function refreshReports() {
  try {
    await useAnalyticsStore.getState().loadAnalytics();
  } catch {
    // best-effort
  }
}

interface OrderFilters {
  tab: OrderFilterTab;
  search: string;
}

interface OrdersState {
  orders: HubOrder[];
  allOrders: HubOrder[];
  selectedOrder: HubOrder | null;
  summary: OrderSummaryData;
  filters: OrderFilters;
  pagination: OrderPagination;
  loading: boolean;
  error: string | null;
  isDetailsOpen: boolean;
  isDispatchOpen: boolean;
  isInvoiceOpen: boolean;
  dispatchOrderId: string | null;
  invoiceOrderId: string | null;
  setFilterTab: (tab: OrderFilterTab) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  selectOrder: (order: HubOrder | null) => void;
  openDetails: (order: HubOrder) => void;
  closeDetails: () => void;
  openDispatch: (order: HubOrder) => void;
  closeDispatch: () => void;
  openInvoice: (order: HubOrder) => void;
  closeInvoice: () => void;
  loadOrders: () => Promise<void>;
  applyFilters: () => void;
  createDispatch: (payload: CreateDispatchPayload) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: HubOrder["status"]
  ) => Promise<void>;
  updateStatus: (
    orderId: string,
    status: HubStatusAlias
  ) => Promise<void>;
  markPicking: (orderId: string) => Promise<void>;
  markPacked: (orderId: string) => Promise<void>;
  deliverOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string, remarks?: string) => Promise<void>;
  downloadInvoice: (orderId: string) => Promise<HubOrder | undefined>;
}

const defaultFilters: OrderFilters = {
  tab: "all",
  search: "",
};

const defaultPagination: OrderPagination = {
  page: 1,
  pageSize: 5,
  total: 0,
  totalPages: 1,
};

const defaultSummary: OrderSummaryData = {
  todaysOrders: 0,
  dailyTarget: 20,
  revenue: 0,
  revenueChangePercent: 0,
  pendingDeliveries: 0,
  etaAvgHours: 0,
  completedOrders: 0,
  totalOrders: 0,
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  allOrders: [],
  selectedOrder: null,
  summary: defaultSummary,
  filters: defaultFilters,
  pagination: defaultPagination,
  loading: false,
  error: null,
  isDetailsOpen: false,
  isDispatchOpen: false,
  isInvoiceOpen: false,
  dispatchOrderId: null,
  invoiceOrderId: null,

  setFilterTab: (tab) => {
    const { filters } = get();
    if (filters.tab === tab) return;

    set((state) => ({
      filters: { ...state.filters, tab },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().applyFilters();
  },

  setSearch: (search) => {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().applyFilters();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().applyFilters();
  },

  selectOrder: (order) => set({ selectedOrder: order }),

  openDetails: (order) =>
    set({ selectedOrder: order, isDetailsOpen: true }),

  closeDetails: () => set({ isDetailsOpen: false }),

  openDispatch: (order) =>
    set({
      selectedOrder: order,
      dispatchOrderId: order.id,
      isDispatchOpen: true,
    }),

  closeDispatch: () =>
    set({ isDispatchOpen: false, dispatchOrderId: null }),

  openInvoice: (order) =>
    set({
      selectedOrder: order,
      invoiceOrderId: order.id,
      isInvoiceOpen: true,
    }),

  closeInvoice: () =>
    set({ isInvoiceOpen: false, invoiceOrderId: null }),

  applyFilters: () => {
    const state = get();
    let filtered = filterOrdersByTab(state.allOrders, state.filters.tab);

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search) ||
          o.location.toLowerCase().includes(search)
      );
    }

    const pageSize = state.pagination.pageSize;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(state.pagination.page, totalPages);
    const start = (page - 1) * pageSize;

    set({
      orders: filtered.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  },

  loadOrders: async () => {
    set({ loading: true, error: null });

    try {
      const result = await ordersService.getOrders({
        tab: "all",
        page: 1,
        pageSize: 100,
      });

      set({
        allOrders: result.data,
        summary: result.summary,
        loading: false,
      });
      get().applyFilters();
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load orders",
        orders: [],
        allOrders: [],
      });
    }
  },

  createDispatch: async (payload) => {
    const { order, dispatch } = await ordersService.createDispatch(payload);

    try {
      await useInventoryStore.getState().loadInventory();
    } catch {
      /* inventory refresh is best-effort */
    }

    useDashboardStore.getState().addActivityLog({
      title: `Dispatch Created — ${dispatch.dispatchNo}`,
      subtitle: `Order ${order.orderNo} assigned to driver`,
      type: "dispatch",
    });

    set({
      isDispatchOpen: false,
      dispatchOrderId: null,
    });

    toast.success(
      `Dispatch ${dispatch.dispatchNo} created. Order status updated.`,
    );

    await get().loadOrders();
    await refreshReports();
  },

  acceptOrder: async (orderId) => {
    await ordersService.acceptOrder(orderId);
    toast.success("Order accepted");
    await get().loadOrders();
    await refreshReports();
  },

  rejectOrder: async (orderId, reason) => {
    await ordersService.rejectOrder(orderId, reason);
    toast.success("Order rejected");
    await get().loadOrders();
    await refreshReports();
  },

  updateOrderStatus: async (orderId, status) => {
    await ordersService.updateOrderStatus(orderId, status);
    await get().loadOrders();
    await refreshReports();
  },

  updateStatus: async (orderId, status) => {
    await ordersService.updateStatus(orderId, status);
    toast.success(`Order status updated to ${status}`);
    await get().loadOrders();
    await refreshReports();
  },

  markPicking: async (orderId) => {
    await ordersService.markPicking(orderId);
    toast.success("Order marked as picking");
    await get().loadOrders();
    await refreshReports();
  },

  markPacked: async (orderId) => {
    await ordersService.markPacked(orderId);
    toast.success("Order marked as packed");
    await get().loadOrders();
    await refreshReports();
  },

  deliverOrder: async (orderId) => {
    await ordersService.deliverOrder(orderId);
    toast.success("Order marked as delivered");
    await get().loadOrders();
    await refreshReports();
  },

  cancelOrder: async (orderId, remarks) => {
    await ordersService.cancelOrder(orderId, remarks);
    toast.success("Order cancelled");
    await get().loadOrders();
    await refreshReports();
  },

  downloadInvoice: async (orderId) => {
    const order = await ordersService.downloadInvoice(orderId);
    if (order) {
      set({ selectedOrder: order });
      toast.success(`Invoice ${order.invoiceNumber || order.orderNo} downloaded`);
    }
    return order;
  },
}));
