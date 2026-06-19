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
    const filtered = filterProducts(state.allProducts, filters);
    const sorted = sortProducts(filtered, state.sortField, state.sortOrder);
    const paginated = paginateProducts(
      sorted,
      1,
      state.pagination.pageSize
    );
    set({
      filters,
      currentPage: 1,
      filteredProducts: filtered,
      products: paginated,
    });
  },

  setSelectedCategory: (category) => {
    const state = get();
    const filters = { ...state.filters, category };
    const filtered = filterProducts(state.allProducts, filters);
    const sorted = sortProducts(filtered, state.sortField, state.sortOrder);
    const paginated = paginateProducts(
      sorted,
      1,
      state.pagination.pageSize
    );
    set({
      filters,
      selectedCategory: category,
      currentPage: 1,
      filteredProducts: filtered,
      products: paginated,
    });
  },

  setSelectedStatus: (status) => {
    const state = get();
    const filters = { ...state.filters, status };
    const filtered = filterProducts(state.allProducts, filters);
    const sorted = sortProducts(filtered, state.sortField, state.sortOrder);
    const paginated = paginateProducts(
      sorted,
      1,
      state.pagination.pageSize
    );
    set({
      filters,
      selectedStatus: status,
      currentPage: 1,
      filteredProducts: filtered,
      products: paginated,
    });
  },

  setCurrentPage: (page) => {
    const state = get();
    const filtered = filterProducts(state.allProducts, state.filters);
    const sorted = sortProducts(filtered, state.sortField, state.sortOrder);
    const paginated = paginateProducts(
      sorted,
      page,
      state.pagination.pageSize
    );
    set({ currentPage: page, filteredProducts: filtered, products: paginated });
  },

  setSort: (field) => {
    const state = get();
    const sortOrder =
      state.sortField === field && state.sortOrder === "asc" ? "desc" : "asc";
    const filtered = filterProducts(state.allProducts, state.filters);
    const sorted = sortProducts(filtered, field, sortOrder);
    const paginated = paginateProducts(
      sorted,
      state.currentPage,
      state.pagination.pageSize
    );
    set({
      sortField: field,
      sortOrder,
      filteredProducts: filtered,
      products: paginated,
    });
  },

  resetFilters: () => {
    const state = get();
    const sorted = sortProducts(
      state.allProducts,
      state.sortField,
      state.sortOrder
    );
    const paginated = paginateProducts(
      sorted,
      1,
      state.pagination.pageSize
    );
    set({
      filters: defaultFilters,
      selectedCategory: "all",
      selectedStatus: "all",
      currentPage: 1,
      filteredProducts: state.allProducts,
      products: paginated,
    });
  },

  loadInventory: async () => {
    set({ loading: true });
    const data = await inventoryService.getInventoryData();
    const allProducts = data.products;
    const state = get();
    const sorted = sortProducts(
      allProducts,
      state.sortField,
      state.sortOrder
    );
    const paginated = paginateProducts(
      sorted,
      1,
      data.pagination.pageSize
    );

    set({
      allProducts,
      filteredProducts: allProducts,
      products: paginated,
      summary: data.summary,
      warehouse: data.warehouse,
      categories: data.categories,
      statuses: data.statuses,
      pagination: data.pagination,
      loading: false,
    });
  },

  addMaterial: async (payload) => {
    set({ submitting: true });
    const product = await inventoryService.addProduct(payload);
    set({ submitting: false });

    if (!product) {
      toast.error("SKU already exists or invalid. Please use a unique SKU.");
      return false;
    }

    await get().loadInventory();
    set({ isAddModalOpen: false });
    toast.success(`${product.name} added to inventory`);
    return true;
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
