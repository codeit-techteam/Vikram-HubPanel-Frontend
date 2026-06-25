import type {
  DispatchRecord,
  HubOrder,
  IncomingTransfer,
  InventoryProduct,
  InventoryProductStatus,
  LedgerLinkedModule,
  LedgerTransaction,
  LedgerTransactionType,
  MaterialReceivingItem,
  ReceivingMaterialItem,
  ReceivingRecord,
} from "@/types";

export function parseStockString(stock: string): { qty: number; unit: string } {
  const match = stock.match(/^([\d,.]+)\s+(.+)$/);
  if (!match) return { qty: 0, unit: "Units" };
  return {
    qty: parseFloat(match[1].replace(/,/g, "")),
    unit: match[2],
  };
}

export function formatStockString(qty: number, unit: string): string {
  const formatted = Number.isInteger(qty)
    ? qty.toLocaleString("en-IN")
    : qty.toFixed(1);
  return `${formatted} ${unit}`;
}

export function deriveProductStatus(availableQty: number): InventoryProductStatus {
  if (availableQty <= 0) return "out_of_stock";
  if (availableQty < 50) return "low_stock";
  return "in_stock";
}

export function applyStockDelta(
  product: InventoryProduct,
  delta: number
): InventoryProduct {
  const current = parseStockString(product.currentStock);
  const available = parseStockString(product.available);
  const newQty = Math.max(0, current.qty + delta);
  const newAvailable = Math.max(0, available.qty + delta);
  const unit = current.unit || available.unit;

  return {
    ...product,
    currentStock: formatStockString(newQty, unit),
    available: formatStockString(newAvailable, unit),
    status: deriveProductStatus(newAvailable),
  };
}

export function createLedgerTransaction(params: {
  product: string;
  sku: string;
  type: LedgerTransactionType;
  change: number;
  unit: string;
  openingStock: number;
  linkedModule: LedgerLinkedModule;
  referenceId: string;
  warehouse: string;
  createdBy: string;
  supplier?: string;
  truckId?: string;
  remarks?: string;
}): LedgerTransaction {
  const closingStock = Math.max(0, params.openingStock + params.change);
  const now = new Date().toISOString();
  const txnNo = `TXN-${Date.now().toString().slice(-6)}`;

  return {
    id: `led-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    transactionNo: txnNo,
    date: now,
    type: params.type,
    product: params.product,
    sku: params.sku,
    openingStock: params.openingStock,
    openingStockUnit: params.unit,
    change: params.change,
    changeUnit: params.unit,
    closingStock,
    closingStockUnit: params.unit,
    linkedModule: params.linkedModule,
    referenceId: params.referenceId,
    supplier: params.supplier,
    warehouse: params.warehouse,
    createdBy: params.createdBy,
    remarks: params.remarks,
    truckId: params.truckId,
  };
}

export function materialsToReceivingItems(
  materials: {
    inventoryProductId: string;
    productName: string;
    dispatchedDisplay: string;
    receivedQty: number;
  }[]
): MaterialReceivingItem[] {
  return materials.map((m) => ({
    materialId: m.inventoryProductId,
    materialName: m.productName,
    expectedQuantity: m.dispatchedDisplay,
    quantityReceived: m.receivedQty,
    damageQuantity: 0,
  }));
}

const SKU_INVENTORY_MAP: Record<string, string> = {
  "STL-FE550-TMT": "prod-002",
  "STL-12-FE500": "prod-002",
  "ST-12-B00": "prod-002",
  "CMN-PRT-50": "prod-001",
  "CM-P50-Ultra": "prod-001",
  "CMN-43-GRD": "prod-001",
  "BRK-ENG-STD": "prod-004",
  "BK-RB-9X4": "prod-004",
  "BRK-RED-STD": "prod-004",
  "PVB-STD-800": "prod-004",
  "SND-BLK-20": "prod-003",
  "SND-RV-FT": "prod-003",
  "PVC-PP-4IN": "prod-005",
};

function resolveInventoryProductId(sku: string): string {
  if (SKU_INVENTORY_MAP[sku]) return SKU_INVENTORY_MAP[sku];
  if (sku.startsWith("STL") || sku.startsWith("ST-")) return "prod-002";
  if (sku.startsWith("CMN") || sku.startsWith("CM-")) return "prod-001";
  if (sku.startsWith("BRK") || sku.startsWith("BK-") || sku.startsWith("PVB"))
    return "prod-004";
  if (sku.startsWith("SND")) return "prod-003";
  return "prod-001";
}

function parseQuantityFromText(text: string): {
  qty: number;
  unit: string;
  display: string;
} {
  const match = text.match(/^([\d,.]+)\s+(.+)$/);
  if (!match) {
    const numMatch = text.match(/([\d,.]+)/);
    const qty = numMatch ? parseFloat(numMatch[1].replace(/,/g, "")) : 0;
    return { qty, unit: "Units", display: text };
  }
  const qty = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2].trim();
  const formatted = Number.isInteger(qty)
    ? qty.toLocaleString("en-IN")
    : String(qty);
  return { qty, unit, display: `${formatted} ${unit}` };
}

export function buildReceivingRecordFromTransfer(
  transfer: IncomingTransfer
): ReceivingRecord | undefined {
  const receivableStatuses = ["dispatched", "in_transit", "delayed"];
  if (!receivableStatuses.includes(transfer.status)) return undefined;

  const dispatchEvent = transfer.timeline.find((e) =>
    e.title.toLowerCase().includes("dispatch")
  );
  const dispatchParts = dispatchEvent?.timestamp?.split(",") ?? [];
  const dispatchDate =
    transfer.dispatchDate ?? dispatchParts[0]?.trim() ?? "—";
  const dispatchTime =
    dispatchParts.length > 1
      ? dispatchParts.slice(1).join(",").trim()
      : "—";

  let materials: ReceivingMaterialItem[] = [];

  if (transfer.manifest && transfer.manifest.length > 0) {
    materials = transfer.manifest.map((m, index) => ({
      id: `rcv-mat-${transfer.transferId}-${index}`,
      productId: m.id,
      productName: m.name,
      sku: m.sku ?? "—",
      dispatchedQty: m.quantity,
      dispatchedUnit: m.unit,
      dispatchedDisplay: `${m.quantity.toLocaleString("en-IN")} ${m.unit}`,
      receivedQty: m.quantity,
      verificationStatus: "pending" as const,
      inventoryProductId: resolveInventoryProductId(m.sku ?? ""),
    }));
  } else {
    materials = transfer.materials.map((m, index) => {
      const parsed = parseQuantityFromText(m.quantity);
      return {
        id: `rcv-mat-${transfer.transferId}-${index}`,
        productId: m.id,
        productName: m.name,
        sku: m.sku ?? "—",
        dispatchedQty: parsed.qty,
        dispatchedUnit: parsed.unit,
        dispatchedDisplay: parsed.display,
        receivedQty: parsed.qty,
        verificationStatus: "pending" as const,
        inventoryProductId: resolveInventoryProductId(m.sku ?? ""),
      };
    });
  }

  const transferSuffix = transfer.transferId.replace("TR-", "");

  return {
    id: `rcv-${transfer.id.replace("trf-", "")}`,
    transferId: transfer.transferId,
    requisitionId: transfer.requisitionId ?? "—",
    dispatchId: transfer.dispatchId ?? `DSP-${transferSuffix}`,
    inventoryId: transfer.inventoryId ?? "INV-CW-001",
    source: transfer.source,
    sourceHub: transfer.source,
    subtitle: `Incoming transfer from ${transfer.source}`,
    transferNumber: transfer.transferId,
    dispatchDate,
    dispatchTime,
    vehicleNumber: transfer.vehicle,
    driverName: transfer.driver.name,
    status: "pending_verification",
    materials,
    photos: [],
    documents: [],
  };
}

export function generateStubOrders(
  baseOrders: HubOrder[],
  targetTotal: number
): HubOrder[] {
  const customers = [
    { name: "Mahindra Lifespaces", type: "Corp Account" },
    { name: "Prestige Estates", type: "Premium Partner" },
    { name: "Oberoi Realty", type: "Contract ID: OR-18" },
    { name: "DLF Limited", type: "Priority Hub Client" },
    { name: "Brigade Group", type: "Corp Account" },
  ];
  const locations = [
    "Andheri East",
    "Powai",
    "Goregaon West",
    "Navi Mumbai",
    "Kalyan",
  ];
  const statuses: HubOrder["status"][] = [
    "pending",
    "loading",
    "dispatch",
    "delivered",
  ];

  const stubs: HubOrder[] = [];
  for (let i = baseOrders.length; i < targetTotal; i++) {
    const customer = customers[i % customers.length];
    const orderNo = `ORD-${9500 - i}`;
    stubs.push({
      id: `ord-stub-${i}`,
      orderNo,
      customer,
      location: locations[i % locations.length],
      value: 25000 + (i % 10) * 15000,
      status: statuses[i % statuses.length],
      materials: [
        {
          id: `mat-stub-${i}`,
          name: "Construction Material Mix",
          sku: `SKU-STUB-${i}`,
          quantity: 10 + (i % 5) * 5,
          unit: "Units",
          unitPrice: 2500,
          totalPrice: (10 + (i % 5) * 5) * 2500,
        },
      ],
      payment: {
        method: "Credit Account",
        status: "Pending",
        amount: 25000 + (i % 10) * 15000,
        paidAmount: 0,
      },
      deliveryAddress: `${customer.name} Site, ${locations[i % locations.length]}, Mumbai`,
      timeline: [
        { id: "tl-1", title: "Order Created", status: "completed" },
        { id: "tl-2", title: "Approved", status: "pending" },
        { id: "tl-3", title: "Loading", status: "pending" },
        { id: "tl-4", title: "Dispatch", status: "pending" },
        { id: "tl-5", title: "Delivered", status: "pending" },
      ],
      orderDate: "2025-06-16",
      createdAt: "2025-06-16T10:00:00",
    });
  }
  return stubs;
}

export function buildDefaultDispatchTimeline(): DispatchRecord["timeline"] {
  return [
    { id: "tl-1", title: "Order Ready", status: "completed" },
    { id: "tl-2", title: "Vehicle Assigned", status: "completed" },
    { id: "tl-3", title: "Loading Started", status: "pending" },
    { id: "tl-4", title: "Loading Complete", status: "pending" },
    { id: "tl-5", title: "Dispatched", status: "pending" },
    { id: "tl-6", title: "In Transit", status: "pending" },
    { id: "tl-7", title: "Delivered", status: "pending" },
  ];
}
