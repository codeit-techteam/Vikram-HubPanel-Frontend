import type {
  AddMaterialPayload,
  ApiFilters,
  InventoryData,
  InventoryItem,
  InventoryProduct,
  PaginatedResponse,
} from "@/types";
import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";
import { categoryIconForSlug } from "@/lib/inventoryCategories";

interface CatalogCategoryRow {
  id: string;
  slug: string;
  name: string;
  displayOrder?: number;
}

interface BackendInventoryRow {
  id: string;
  hubId: string;
  productId: string;
  availableStock: number;
  reservedStock: number;
  currentStock: number;
  lowStock: boolean;
  lowStockThreshold: number;
  lastUpdated: string;
  imageUrl?: string | null;
  product: {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
    imageUrl?: string | null;
    images?: Array<{ url: string; isPrimary?: boolean }>;
    category?: {
      id: string;
      slug: string;
      name: string;
    } | null;
  };
}

function hubLabel() {
  return useAuthStore.getState().manager?.hubName || "Assigned Hub";
}

async function fetchCatalogCategories(): Promise<CatalogCategoryRow[]> {
  try {
    const { data } = await api.get<ApiResponse<CatalogCategoryRow[]>>(
      "/categories",
    );
    return (data.data ?? []).sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
  } catch {
    return [];
  }
}

function buildCategoryFilterOptions(
  catalog: CatalogCategoryRow[],
  products: InventoryProduct[],
) {
  const options = catalog.map((category) => ({
    value: category.slug,
    label: category.name,
  }));

  const knownSlugs = new Set(options.map((option) => option.value));
  for (const product of products) {
    if (
      product.categoryKey &&
      product.categoryKey !== "uncategorized" &&
      !knownSlugs.has(product.categoryKey)
    ) {
      options.push({
        value: product.categoryKey,
        label: product.category,
      });
      knownSlugs.add(product.categoryKey);
    }
  }

  return [{ value: "all", label: "All Categories" }, ...options];
}

function resolveProductImageUrl(row: BackendInventoryRow): string | null {
  const candidates = [
    row.imageUrl,
    row.product.imageUrl,
    row.product.images?.find((img) => img.isPrimary)?.url,
    row.product.images?.[0]?.url,
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
      return value;
    }
  }
  return null;
}

function toProduct(row: BackendInventoryRow): InventoryProduct {
  const categorySlug = row.product.category?.slug ?? "uncategorized";
  const categoryName = row.product.category?.name ?? "Uncategorized";
  const status =
    row.availableStock <= 0
      ? "out_of_stock"
      : row.lowStock
        ? "low_stock"
        : "in_stock";

  return {
    id: row.id,
    productId: row.productId,
    name: row.product.name,
    description: row.product.name,
    sku: row.product.sku || row.productId.slice(0, 8),
    category: categoryName,
    categoryKey: categorySlug,
    icon: categoryIconForSlug(categorySlug),
    imageUrl: resolveProductImageUrl(row),
    currentStock: `${row.currentStock} ${row.product.unit}`,
    available: `${row.availableStock} ${row.product.unit}`,
    reserved: `${row.reservedStock} ${row.product.unit}`,
    status,
  };
}

function toLegacyItem(row: BackendInventoryRow): InventoryItem {
  return {
    id: row.id,
    materialId: row.productId,
    materialName: row.product.name,
    sku: row.product.sku || row.productId.slice(0, 8),
    hubId: row.hubId,
    hubName: hubLabel(),
    quantity: row.currentStock,
    reserved: row.reservedStock,
    available: row.availableStock,
    unit: row.product.unit,
    status:
      row.availableStock <= 0
        ? "critical"
        : row.lowStock
          ? "low_stock"
          : "active",
    lastUpdated: row.lastUpdated,
  };
}

export const inventoryService = {
  async getInventoryData(): Promise<InventoryData> {
    const [inventoryResponse, catalogCategories] = await Promise.all([
      api.get<
        ApiResponse<{
          data: BackendInventoryRow[];
          meta: { total: number; pageSize?: number; totalPages?: number };
        }>
      >("/hub/inventory", { params: { page: 1, limit: 500 } }),
      fetchCatalogCategories(),
    ]);

    const rows = inventoryResponse.data.data.data;
    const products = rows.map(toProduct);
    const lowStockItems = rows.filter((r) => r.lowStock).length;
    const outOfStockItems = rows.filter((r) => r.availableStock <= 0).length;

    const categoryOptions = buildCategoryFilterOptions(catalogCategories, products);

    return {
      summary: {
        totalSkus: rows.length,
        lowStockItems,
        outOfStockItems,
      },
      warehouse: {
        label: hubLabel(),
        capacityUsed: Math.min(
          100,
          Math.round(
            (rows.filter((r) => r.availableStock > 0).length /
              Math.max(rows.length, 1)) *
              100,
          ),
        ),
        description: "Live hub inventory utilization",
        backgroundImage: "",
      },
      categories: categoryOptions,
      statuses: [
        { value: "all", label: "All Status" },
        { value: "in_stock", label: "In Stock" },
        { value: "low_stock", label: "Low Stock" },
        { value: "out_of_stock", label: "Out of Stock" },
      ],
      pagination: {
        totalProducts: rows.length,
        pageSize: 100,
        totalPages: 1,
      },
      products,
    };
  },

  async getAll(
    filters?: ApiFilters,
  ): Promise<PaginatedResponse<InventoryItem>> {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;

    const { data } = await api.get<
      ApiResponse<{
        data: BackendInventoryRow[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      }>
    >("/hub/inventory", {
      params: {
        page,
        limit: pageSize,
        search: filters?.search,
        categorySlug:
          filters?.category && filters.category !== "all"
            ? filters.category
            : undefined,
        lowStockOnly: filters?.status === "low_stock" ? true : undefined,
      },
    });

    let items = data.data.data.map(toLegacyItem);
    if (filters?.status && filters.status !== "low_stock") {
      items = items.filter((item) => item.status === filters.status);
    }

    return {
      data: items,
      total: data.data.meta.total,
      page: data.data.meta.page,
      pageSize: data.data.meta.limit,
      totalPages: data.data.meta.totalPages,
    };
  },

  async getById(id: string): Promise<InventoryItem | undefined> {
    const { data } = await api.get<ApiResponse<BackendInventoryRow>>(
      `/hub/inventory/${id}`,
    );
    return toLegacyItem(data.data);
  },

  async adjustStock(
    id: string,
    adjustment: number,
    remarks?: string,
  ): Promise<void> {
    const item = await this.getById(id);
    if (!item) throw new Error("Inventory item not found");
    await api.post(`/hub/inventory/adjust`, {
      productId: item.materialId,
      adjustment,
      reason: remarks || "Manual adjustment",
    });
  },

  async receiveStock(payload: AddMaterialPayload): Promise<void> {
    const product = await this.addProduct(payload);
    if (!product) {
      throw new Error(
        `No catalog product found for SKU ${payload.sku}. Products must exist in the central catalog before receiving stock.`,
      );
    }
  },

  /**
   * Resolves a catalog product by SKU/name, then posts stock via
   * POST /hub/inventory/receive. Hubs cannot create new catalog SKUs.
   */
  async addProduct(
    payload: AddMaterialPayload,
  ): Promise<InventoryProduct | null> {
    const qty = Math.round(payload.initialStock);
    if (qty < 1) {
      throw new Error("Enter at least 1 unit to receive stock at this hub.");
    }

    const { data: catalogRes } = await api.get<
      ApiResponse<{
        items: Array<{
          id: string;
          name: string;
          sku?: string | null;
          unit?: string;
          categorySlug?: string;
          categoryName?: string;
        }>;
      }>
    >("/products", {
      params: { search: payload.sku || payload.name, limit: 50 },
    });

    const items = catalogRes.data?.items ?? [];
    const skuLower = payload.sku.trim().toLowerCase();
    const nameLower = payload.name.trim().toLowerCase();
    const match =
      items.find((p) => (p.sku ?? "").toLowerCase() === skuLower) ??
      items.find((p) => p.name.toLowerCase() === nameLower) ??
      items.find((p) => p.name.toLowerCase().includes(nameLower));

    if (!match) return null;

    await api.post("/hub/inventory/receive", {
      productId: match.id,
      quantity: qty,
      remarks:
        payload.description?.trim() ||
        `Stock received via Hub Panel (${payload.sku})`,
    });

    const inventory = await this.getInventoryData();
    return (
      inventory.products.find((p) => p.productId === match.id) ?? {
        id: match.id,
        productId: match.id,
        name: match.name,
        description: payload.description || match.name,
        sku: match.sku || payload.sku,
        category: match.categoryName || payload.category,
        categoryKey: match.categorySlug || payload.categoryKey,
        icon: categoryIconForSlug(match.categorySlug || payload.categoryKey),
        currentStock: `${qty} ${match.unit || payload.unit}`,
        available: `${qty} ${match.unit || payload.unit}`,
        reserved: `0 ${match.unit || payload.unit}`,
        status: "in_stock" as const,
        unitPrice: payload.unitPrice,
      }
    );
  },

  async updateStockFromReceiving(materials: unknown): Promise<void> {
    void materials;
    await this.getInventoryData();
  },

  async reduceStockFromDispatch(
    materials: unknown,
    _source?: string,
    _actor?: string,
  ): Promise<void> {
    void materials;
    await this.getInventoryData();
  },
};
