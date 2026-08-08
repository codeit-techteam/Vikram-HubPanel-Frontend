import { create } from "zustand";
import toast from "react-hot-toast";
import { ledgerService } from "@/services/ledger.service";
import type {
  LedgerAnalytics,
  LedgerAuditRecord,
  LedgerChartDataPoint,
  LedgerFilters,
  LedgerPaginationMeta,
  LedgerTransaction,
  LedgerTransactionType,
} from "@/types";

interface LedgerState {
  transactions: LedgerTransaction[];
  allTransactions: LedgerTransaction[];
  chartData: LedgerChartDataPoint[];
  auditHistory: LedgerAuditRecord[];
  analytics: LedgerAnalytics | null;
  pagination: LedgerPaginationMeta;
  filters: LedgerFilters;
  products: { value: string; label: string }[];
  selectedTransaction: LedgerTransaction | null;
  loading: boolean;
  chartLoading: boolean;
  isDetailsOpen: boolean;
  isPrintOpen: boolean;
  isAuditOpen: boolean;
  lastAuditDaysAgo: number;
  loadLedger: () => Promise<void>;
  loadChartData: () => Promise<void>;
  loadAuditHistory: () => Promise<void>;
  applyFilters: () => Promise<void>;
  setSearch: (search: string) => void;
  setDateRange: (from: string, to: string) => void;
  setProduct: (product: string) => void;
  toggleTransactionType: (type: LedgerTransactionType) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  openTransaction: (transaction: LedgerTransaction) => void;
  closeTransaction: () => void;
  openPrint: () => void;
  closePrint: () => void;
  openAudit: () => void;
  closeAudit: () => void;
  exportLedger: () => Promise<void>;
  getTransactions: () => LedgerTransaction[];
}

const defaultFilters: LedgerFilters = {
  search: "",
  dateFrom: "2026-09-01",
  dateTo: "2026-09-30",
  product: "all",
  transactionTypes: [],
};

export const useLedgerStore = create<LedgerState>((set, get) => ({
  transactions: [],
  allTransactions: [],
  chartData: [],
  auditHistory: [],
  analytics: null,
  pagination: { page: 1, pageSize: 5, total: 0, totalPages: 1 },
  filters: defaultFilters,
  products: ledgerService.getProducts(),
  selectedTransaction: null,
  loading: false,
  chartLoading: false,
  isDetailsOpen: false,
  isPrintOpen: false,
  isAuditOpen: false,
  lastAuditDaysAgo: ledgerService.getMeta().lastAuditDaysAgo,

  loadLedger: async () => {
    set({ loading: true });
    const { filters, pagination } = get();
    const result = await ledgerService.getLedgerEntries(
      filters,
      pagination.page,
      pagination.pageSize
    );
    set({
      transactions: result.data,
      allTransactions: result.data,
      pagination: result.pagination,
      analytics: result.analytics,
      loading: false,
    });
  },

  loadChartData: async () => {
    set({ chartLoading: true });
    const chartData = await ledgerService.getChartData();
    set({ chartData, chartLoading: false });
  },

  loadAuditHistory: async () => {
    const auditHistory = await ledgerService.getAuditHistory();
    set({ auditHistory });
  },

  applyFilters: async () => {
    set((state) => ({
      pagination: { ...state.pagination, page: 1 },
      loading: true,
    }));
    const { filters, pagination } = get();
    const result = await ledgerService.getLedgerEntries(
      filters,
      1,
      pagination.pageSize
    );
    set({
      transactions: result.data,
      pagination: result.pagination,
      analytics: result.analytics,
      loading: false,
    });
  },

  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
    get().applyFilters();
  },

  setDateRange: (from, to) => {
    set((state) => ({
      filters: { ...state.filters, dateFrom: from, dateTo: to },
    }));
    get().applyFilters();
  },

  setProduct: (product) => {
    set((state) => ({ filters: { ...state.filters, product } }));
    get().applyFilters();
  },

  toggleTransactionType: (type) => {
    set((state) => {
      const types = state.filters.transactionTypes;
      const updated = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type];
      return { filters: { ...state.filters, transactionTypes: updated } };
    });
    get().applyFilters();
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters, transactionTypes: [] } });
    get().applyFilters();
  },

  setCurrentPage: async (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
      loading: true,
    }));
    const { filters, pagination } = get();
    const result = await ledgerService.getLedgerEntries(
      filters,
      page,
      pagination.pageSize
    );
    set({
      transactions: result.data,
      pagination: result.pagination,
      loading: false,
    });
  },

  openTransaction: (transaction) => {
    set({ selectedTransaction: transaction, isDetailsOpen: true });
  },

  closeTransaction: () => {
    set({ isDetailsOpen: false, selectedTransaction: null });
  },

  openPrint: () => set({ isPrintOpen: true }),

  closePrint: () => set({ isPrintOpen: false }),

  openAudit: () => {
    get().loadAuditHistory();
    set({ isAuditOpen: true });
  },

  closeAudit: () => set({ isAuditOpen: false }),

  exportLedger: async () => {
    const csv = await ledgerService.exportCSV(get().filters);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Ledger exported to CSV.");
  },

  getTransactions: () => get().transactions,
}));
