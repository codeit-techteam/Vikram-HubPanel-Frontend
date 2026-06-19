import type {
  AddMaterialPayload,
  ApiFilters,
  InventoryData,
  InventoryItem,
  InventoryProduct,
  MaterialReceivingItem,
  PaginatedResponse,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

function toLegacyItem(
  product: InventoryProduct,
  index: number
): InventoryItem {
  const stock = product.currentStock;
  const available = product.available;
  const qtyMatch = stock.match(/^([\d,.]+)/);
  const availMatch = available.match(/^([\d,.]+)/);

  return {
    id: product.id,
    materialId: `mat-${String(index + 1).padStart(3, "0")}`,
    materialName: product.name,
    sku: product.sku,
    hubId: "hub-001",
    hubName: "Vikram Central Hub",
    quantity: qtyMatch ? parseFloat(qtyMatch[1].replace(/,/g, "")) : 0,
    reserved: 0,
    available: availMatch ? parseFloat(availMatch[1].replace(/,/g, "")) : 0,
    unit: stock.split(" ").slice(1).join(" ") || "Units",
    status:
      product.status === "low_stock"
        ? "low_stock"
        : product.status === "out_of_stock"
          ? "critical"
          : "active",
    lastUpdated: new Date().toISOString(),
  };
}

export const inventoryService = {
  async getInventoryData(): Promise<InventoryData> {
    await delay(300);
    return erpDatabase.getInventory();
  },

  async getAll(
    filters?: ApiFilters
  ): Promise<PaginatedResponse<InventoryItem>> {
    await delay(300);
    const data = erpDatabase.getInventory();
    let items = data.products.map(toLegacyItem);

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.materialName.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.hubName.toLowerCase().includes(search)
      );
    }

    if (filters?.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    if (filters?.hubId) {
      items = items.filter((item) => item.hubId === filters.hubId);
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;
    const start = (page - 1) * pageSize;

    return {
      data: items.slice(start, start + pageSize),
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
    };
  },

  async getById(id: string): Promise<InventoryItem | undefined> {
    await delay(200);
    const data = erpDatabase.getInventory();
    const index = data.products.findIndex((product) => product.id === id);
    if (index === -1) return undefined;
    return toLegacyItem(data.products[index], index);
  },

  async getProducts(): Promise<InventoryProduct[]> {
    await delay(200);
    return erpDatabase.getInventoryProducts();
  },

  async updateStockFromReceiving(
    materials: MaterialReceivingItem[],
    receivedBy = "System"
  ): Promise<InventoryData> {
    await delay(200);
    erpDatabase.addStockFromReceiving(materials, receivedBy);
    return erpDatabase.getInventory();
  },

  async reduceStockFromDispatch(
    materials: { sku: string; quantity: number; unit: string }[],
    referenceId: string,
    performedBy = "System"
  ): Promise<InventoryData> {
    await delay(200);
    erpDatabase.reduceStockFromDispatch(materials, referenceId, performedBy);
    return erpDatabase.getInventory();
  },

  async addProduct(payload: AddMaterialPayload): Promise<InventoryProduct | null> {
    await delay(300);
    return erpDatabase.addProduct(payload);
  },
};
