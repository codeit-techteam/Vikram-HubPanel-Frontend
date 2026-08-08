import { create } from "zustand";
import toast from "react-hot-toast";
import type {
  AddMaterialPayload,
  InventoryFilterOption,
  InventoryPaginationMeta,
  InventoryProduct,
  InventorySortField,
  InventorySummaryData,
  WarehouseUtilization,
  MaterialReceivingItem,
} from "@/types";
import { inventoryService } from "@/services/inventory.service";

interface InventoryFilters {
  search: string;
  category: string;
  status: string;
}

interface InventoryState {
  products: InventoryProduct[];
  allProducts: InventoryProduct[];
  filteredProducts: InventoryProduct[];
  summary: InventorySummaryData;
  warehouse: WarehouseUtilization;
  categories: InventoryFilterOption[];
  statuses: InventoryFilterOption[];
  pagination: InventoryPaginationMeta;
  filters: InventoryFilters;
  selectedCategory: string;
  selectedStatus: string;
  currentPage: number;
  sortField: InventorySortField;
  sortOrder: "asc" | "desc";
  loading: boolean;
  submitting: boolean;
  isAddModalOpen: boolean;
  setSearch: (search: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedStatus: (status: string) => void;
  setCurrentPage: (page: number) => void;
  setSort: (field: InventorySortField) => void;
  resetFilters: () => void;
  loadInventory: () => Promise<void>;
  openAddModal: () => void;
  closeAddModal: () => void;
  addMaterial: (payload: AddMaterialPayload) => Promise<boolean>;
  updateStockFromReceiving: (materials: MaterialReceivingItem[]) => Promise<void>;
  reduceStockFromDispatch: (
    materials: { sku: string; quantity: number; unit: string }[]
  ) => Promise<void>;
}

const defaultFilters: InventoryFilters = {
  search: "",
  category: "all",
  status: "all",
};

function filterProducts(
  products: InventoryProduct[],
  filters: InventoryFilters
): InventoryProduct[] {
  return products.filter((product) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower);

    const matchesCategory =
      filters.category === "all" || product.categoryKey === filters.category;

    const matchesStatus =
      filters.status === "all" || product.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

function sortProducts(
  products: InventoryProduct[],
  sortField: InventorySortField,
  sortOrder: "asc" | "desc"
): InventoryProduct[] {
  const sorted = [...products].sort((a, b) => {
    const getValue = (product: InventoryProduct) => {
      switch (sortField) {
        case "name":
          return product.name;
        case "sku":
          return product.sku;
        case "category":
          return product.category;
        case "currentStock":
          return product.currentStock;
        case "reserved":
          return product.reserved;
        case "available":
          return product.available;
        default:
          return product.name;
      }
    };

    const aVal = getValue(a);
    const bVal = getValue(b);
    return aVal.localeCompare(bVal, undefined, { numeric: true });
  });

  return sortOrder === "desc" ? sorted.reverse() : sorted;
}

function paginateProducts(
  products: InventoryProduct[],
  page: number,
  pageSize: number
): InventoryProduct[] {
  const start = (page - 1) * pageSize;
  return products.slice(start, start + pageSize);
}

function applyInventoryView(
  allProducts: InventoryProduct[],
  state: Pick<
    InventoryState,
    "filters" | "sortField" | "sortOrder" | "currentPage" | "pagination"
  >
) {
  const filtered = filterProducts(allProducts, state.filters);
  const sorted = sortProducts(filtered, state.sortField, state.sortOrder);
  const pageSize = state.pagination.pageSize;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(state.currentPage, totalPages);
  const paginated = paginateProducts(sorted, currentPage, pageSize);

  return {
    filteredProducts: filtered,
    products: paginated,
    currentPage,
    pagination: {
      ...state.pagination,
      totalProducts: filtered.length,
      totalPages,
    },
  };
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  allProducts: [],
  filteredProducts: [],
  summary: {
    totalSkus: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  } as InventorySummaryData,
  warehouse: {
    label: "HUB STATUS",
    capacityUsed: 0,
    description: "Warehouse Capacity Used",
    backgroundImage:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
  } as WarehouseUtilization,
  categories: [] as InventoryFilterOption[],
  statuses: [] as InventoryFilterOption[],
  pagination: {
    totalProducts: 0,
    pageSize: 5,
    totalPages: 1,
  } as InventoryPaginationMeta,
  filters: defaultFilters,
  selectedCategory: "all",
  selectedStatus: "all",
  currentPage: 1,
  sortField: "name",
  sortOrder: "asc",
  loading: true,
  submitting: false,
  isAddModalOpen: false,

  openAddModal: () => set({ isAddModalOpen: true }),

  closeAddModal: () => set({ isAddModalOpen: false }),

  setSearch: (search) => {
    const state = get();
    const filters = { ...state.filters, search };
    set({
      filters,
      ...applyInventoryView(state.allProducts, {
        ...state,
        filters,
        currentPage: 1,
      }),
    });
  },

  setSelectedCategory: (category) => {
    const state = get();
    const filters = { ...state.filters, category };
    set({
      filters,
      selectedCategory: category,
      ...applyInventoryView(state.allProducts, {
        ...state,
        filters,
        currentPage: 1,
      }),
    });
  },

  setSelectedStatus: (status) => {
    const state = get();
    const filters = { ...state.filters, status };
    set({
      filters,
      selectedStatus: status,
      ...applyInventoryView(state.allProducts, {
        ...state,
        filters,
        currentPage: 1,
      }),
    });
  },

  setCurrentPage: (page) => {
    const state = get();
    set(
      applyInventoryView(state.allProducts, {
        ...state,
        currentPage: page,
      })
    );
  },

  setSort: (field) => {
    const state = get();
    const sortOrder =
      state.sortField === field && state.sortOrder === "asc" ? "desc" : "asc";
    set({
      sortField: field,
      sortOrder,
      ...applyInventoryView(state.allProducts, {
        ...state,
        sortField: field,
        sortOrder,
      }),
    });
  },

  resetFilters: () => {
    const state = get();
    set({
      filters: defaultFilters,
      selectedCategory: "all",
      selectedStatus: "all",
      ...applyInventoryView(state.allProducts, {
        ...state,
        filters: defaultFilters,
        currentPage: 1,
      }),
    });
  },

  loadInventory: async () => {
    set({ loading: true });
    const data = await inventoryService.getInventoryData();
    const state = get();
    const pagination = {
      ...data.pagination,
      pageSize: data.pagination.pageSize,
    };

    set({
      allProducts: data.products,
      summary: data.summary,
      warehouse: data.warehouse,
      categories: data.categories,
      statuses: data.statuses,
      loading: false,
      ...applyInventoryView(data.products, {
        ...state,
        pagination,
        currentPage: 1,
      }),
    });
  },

  addMaterial: async (payload) => {
    set({ submitting: true });
    try {
      const product = await inventoryService.addProduct(payload);
      set({ submitting: false });

      if (!product) {
        toast.error(
          "No matching catalog product found. Use an existing SKU from the product catalog.",
        );
        return false;
      }

      await get().loadInventory();
      set({ isAddModalOpen: false });
      toast.success(`${product.name} stock received at hub`);
      return true;
    } catch (err) {
      set({ submitting: false });
      toast.error(
        err instanceof Error ? err.message : "Failed to receive stock",
      );
      return false;
    }
  },

  updateStockFromReceiving: async (materials) => {
    await inventoryService.updateStockFromReceiving(materials);
    await get().loadInventory();
  },

  reduceStockFromDispatch: async (materials) => {
    await inventoryService.reduceStockFromDispatch(
      materials,
      "dispatch",
      "Dispatch System"
    );
    await get().loadInventory();
  },
}));
