import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  CreateDispatchPayload,
  HubOrder,
  OrderFilterTab,
  OrderPagination,
  OrderSummaryData,
} from "@/types";
import { ordersService } from "@/services/orders.service";
import { useInventoryStore } from "./inventoryStore";
import { useDashboardStore } from "./dashboardStore";

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
  createDispatch: (payload: CreateDispatchPayload) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: HubOrder["status"]
  ) => Promise<void>;
  downloadInvoice: (orderId: string) => Promise<HubOrder | undefined>;
}

const defaultFilters: OrderFilters = {
  tab: "all",
  search: "",
};

const defaultPagination: OrderPagination = {
  page: 1,
  pageSize: 5,
  total: 48,
  totalPages: 10,
};

const defaultSummary: OrderSummaryData = {
  todaysOrders: 48,
  dailyTarget: 60,
  revenue: 345500,
  revenueChangePercent: 14,
  pendingDeliveries: 14,
  etaAvgHours: 4.2,
  completedOrders: 32,
  totalOrders: 48,
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  allOrders: [],
  selectedOrder: null,
  summary: defaultSummary,
  filters: defaultFilters,
  pagination: defaultPagination,
  loading: false,
  isDetailsOpen: false,
  isDispatchOpen: false,
  isInvoiceOpen: false,
  dispatchOrderId: null,
  invoiceOrderId: null,

  setFilterTab: (tab) => {
    set((state) => ({
      filters: { ...state.filters, tab },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().loadOrders();
  },

  setSearch: (search) => {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().loadOrders();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().loadOrders();
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

  loadOrders: async () => {
    set({ loading: true });
    const state = get();
    const response = await ordersService.getOrders({
      tab: state.filters.tab,
      search: state.filters.search || undefined,
      page: state.pagination.page,
      pageSize: state.pagination.pageSize,
    });

    set({
      orders: response.data,
      allOrders: ordersService.getAllOrdersData().orders,
      summary: response.summary,
      pagination: {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      },
      loading: false,
    });
  },

  createDispatch: async (payload) => {
    const { order, dispatch } = await ordersService.createDispatch(payload);

    await useInventoryStore.getState().loadInventory();

    useDashboardStore.getState().addActivityLog({
      title: `Dispatch Created — ${dispatch.dispatchNo}`,
      subtitle: `Order ${order.orderNo} assigned to ${payload.vehicle}`,
      type: "dispatch",
    });

    const state = get();
    const updatedOrders = state.orders.map((o) =>
      o.id === order.id ? order : o
    );

    set({
      orders: updatedOrders,
      selectedOrder:
        state.selectedOrder?.id === order.id ? order : state.selectedOrder,
      isDispatchOpen: false,
      dispatchOrderId: null,
      summary: ordersService.getAllOrdersData().summary,
    });

    toast.success(
      `Dispatch ${dispatch.dispatchNo} created. Order status updated.`
    );

    await get().loadOrders();
  },

  updateOrderStatus: async (orderId, status) => {
    const updated = await ordersService.updateOrderStatus(orderId, status);
    if (!updated) return;

    const state = get();
    set({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
      selectedOrder:
        state.selectedOrder?.id === orderId ? updated : state.selectedOrder,
    });
  },

  downloadInvoice: async (orderId) => {
    const order = await ordersService.downloadInvoice(orderId);
    set({ selectedOrder: order, invoiceOrderId: orderId, isInvoiceOpen: true });
    return order;
  },
}));
