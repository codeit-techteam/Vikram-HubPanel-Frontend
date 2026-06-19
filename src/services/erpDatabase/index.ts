import type {
  AddMaterialPayload,
  AnalyticsConsumptionItem,
  AnalyticsDashboardData,
  AnalyticsDateRangePreset,
  AnalyticsDeliveryPerformance,
  AnalyticsInventoryTrend,
  AnalyticsOverview,
  AnalyticsRequisitionVolume,
  DashboardKpi,
  DiscrepancyRecord,
  Dispatch,
  DispatchDriver,
  DispatchRecord,
  DispatchRoute,
  DispatchVehicle,
  DeliveryRecord,
  DeliveryTracking,
  DraftRequisition,
  FleetStats,
  GoodsReceiptNote,
  HubOrder,
  IncomingTransfer,
  InventoryData,
  InventoryProduct,
  LedgerAuditRecord,
  LedgerChartDataPoint,
  LedgerTransaction,
  LogisticsMovementLog,
  MaterialReceivingItem,
  MaterialReceivingRecord,
  OrdersData,
  OrderSummaryData,
  PendingDispatchOrder,
  ReceiveTransferPayload,
  ReceivingRecord,
  RequisitionData,
  RequisitionRequest,
  TransferData,
  TransferStatus,
  IncomingMaterial,
} from "@/types";
import {
  applyStockDelta,
  buildDefaultDispatchTimeline,
  buildReceivingRecordFromTransfer,
  createLedgerTransaction,
  deriveProductStatus,
  formatStockString,
  generateStubOrders,
  materialsToReceivingItems,
  parseStockString,
} from "./helpers";
import { seeds } from "./seed";

// ─── In-memory state (seeded from JSON) ─────────────────────────────────────

let inventoryStore: InventoryData = structuredClone(seeds.inventory);
let requisitionsStore: RequisitionRequest[] = [...seeds.requisitions.requests];
let requisitionMeta = {
  stats: seeds.requisitions.stats,
  statusOptions: seeds.requisitions.statusOptions,
  pagination: seeds.requisitions.pagination,
  defaultSelectedId: seeds.requisitions.defaultSelectedId,
};
let draftStore: DraftRequisition | null = null;

let transfersStore: IncomingTransfer[] = [...seeds.transfers.transfers];
let transferSummarySeed = { ...seeds.transfers.summary };

let receivingRecordsStore: ReceivingRecord[] = seeds.receiving.records.map(
  (r) => ({
    ...r,
    materials: r.materials.map((m) => ({ ...m })),
    photos: r.photos.map((p) => ({ ...p })),
    documents: r.documents.map((d) => ({ ...d })),
  })
);
let legacyReceivingStore: MaterialReceivingRecord[] = [];
let discrepanciesStore: DiscrepancyRecord[] = [];
let grnStore: GoodsReceiptNote[] = [];

let ordersStore: HubOrder[] = [...seeds.orders.orders];
let summaryStore: OrderSummaryData = { ...seeds.orders.summary };

let dispatchesStore: Dispatch[] = [...seeds.dispatches.dispatches];
let queueStore: DispatchRecord[] = [...seeds.dispatches.queue];
let pendingOrdersStore: PendingDispatchOrder[] = [
  ...seeds.dispatches.pendingOrders,
];
let fleetStore: FleetStats = { ...seeds.dispatches.fleet };
let vehiclesStore: DispatchVehicle[] = [...seeds.vehicles];
let driversStore: DispatchDriver[] = [...seeds.drivers];
let routesStore: DispatchRoute[] = [...seeds.routes];
let deliveriesStore: DeliveryRecord[] = [...seeds.deliveries.deliveries];
let trackingStore: DeliveryTracking[] = [...seeds.tracking.tracks];

let ledgerTransactionsStore: LedgerTransaction[] = [
  ...seeds.ledger.transactions,
];
let ledgerMeta = { ...seeds.ledger.meta };
let ledgerChartData = [...seeds.ledger.chartData];
let ledgerAuditHistory = [...seeds.ledger.auditHistory];
let ledgerProducts = [...seeds.ledger.products];

let usersStore = { ...seeds.users };
let dashboardKpis: DashboardKpi[] = [...seeds.dashboard.kpis];

if (ordersStore.length < summaryStore.totalOrders) {
  ordersStore = [
    ...ordersStore,
    ...generateStubOrders(ordersStore, summaryStore.totalOrders),
  ];
}

// ─── Inventory ──────────────────────────────────────────────────────────────

function findProductByIdOrSku(
  idOrSku: string
): InventoryProduct | undefined {
  return (
    inventoryStore.products.find(
      (p) => p.id === idOrSku || p.sku === idOrSku
    ) ??
    inventoryStore.products.find((p) =>
      p.name.toLowerCase().includes(idOrSku.toLowerCase())
    )
  );
}

function recomputeInventorySummary() {
  const products = inventoryStore.products;
  const lowStock = products.filter((p) => p.status === "low_stock").length;
  const outOfStock = products.filter((p) => p.status === "out_of_stock").length;
  inventoryStore.summary = {
    ...inventoryStore.summary,
    totalSkus: products.length,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
  };
  inventoryStore.pagination = {
    ...inventoryStore.pagination,
    totalProducts: products.length,
    totalPages: Math.max(
      1,
      Math.ceil(products.length / inventoryStore.pagination.pageSize)
    ),
  };
  ledgerMeta.lowStockSkus = lowStock + outOfStock;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  raw_materials: "package",
  structural_steel: "layers",
  masonry: "box",
  plumbing: "pipette",
  electrical: "layers",
};

function addProduct(payload: AddMaterialPayload): InventoryProduct | null {
  const normalizedSku = payload.sku.trim().toUpperCase();
  if (!normalizedSku) return null;

  const skuExists = inventoryStore.products.some(
    (product) => product.sku.toUpperCase() === normalizedSku
  );
  if (skuExists) return null;

  const stockQty = Math.max(0, payload.initialStock);
  const stockStr = formatStockString(stockQty, payload.unit);
  const zeroStockStr = formatStockString(0, payload.unit);

  const product: InventoryProduct = {
    id: `prod-${Date.now()}`,
    name: payload.name.trim(),
    description: payload.description.trim(),
    sku: normalizedSku,
    category: payload.category,
    categoryKey: payload.categoryKey,
    icon: CATEGORY_ICON_MAP[payload.categoryKey] ?? "package",
    currentStock: stockStr,
    reserved: zeroStockStr,
    available: stockStr,
    status: deriveProductStatus(stockQty),
    unitPrice: payload.unitPrice,
  };

  inventoryStore.products = [...inventoryStore.products, product];
  recomputeInventorySummary();
  return product;
}

function addStockFromReceiving(materials: MaterialReceivingItem[], receivedBy: string) {
  inventoryStore.products = inventoryStore.products.map((product) => {
    const material = materials.find(
      (m) =>
        m.materialId === product.id ||
        m.materialName.toLowerCase() === product.name.toLowerCase()
    );
    if (!material || material.quantityReceived <= 0) return product;

    const netQty = material.quantityReceived - material.damageQuantity;
    const updated = applyStockDelta(product, netQty);
    const opening = parseStockString(product.currentStock);

    ledgerTransactionsStore = [
      createLedgerTransaction({
        product: product.name,
        sku: product.sku,
        type: "received",
        change: netQty,
        unit: opening.unit,
        openingStock: opening.qty,
        linkedModule: "receiving",
        referenceId: material.materialId,
        warehouse: "Vikram Central Hub",
        createdBy: receivedBy,
      }),
      ...ledgerTransactionsStore,
    ];
    ledgerMeta.totalEntries += 1;

    return updated;
  });
  recomputeInventorySummary();
}

function reduceStockFromDispatch(
  materials: { sku: string; quantity: number; unit: string }[],
  referenceId: string,
  performedBy: string
) {
  inventoryStore.products = inventoryStore.products.map((product) => {
    const material = materials.find((m) => m.sku === product.sku);
    if (!material) return product;

    const opening = parseStockString(product.currentStock);
    const updated = applyStockDelta(product, -material.quantity);

    ledgerTransactionsStore = [
      createLedgerTransaction({
        product: product.name,
        sku: product.sku,
        type: "sold",
        change: -material.quantity,
        unit: material.unit || opening.unit,
        openingStock: opening.qty,
        linkedModule: "dispatch",
        referenceId,
        warehouse: "Vikram Central Hub",
        createdBy: performedBy,
      }),
      ...ledgerTransactionsStore,
    ];
    ledgerMeta.totalEntries += 1;

    return updated;
  });
  recomputeInventorySummary();
}

function computeTransferSummary() {
  const received = transfersStore.filter((t) => t.status === "received").length;
  return {
    totalIncoming: Math.max(0, transferSummarySeed.totalIncoming - received),
    onTime: Math.max(
      0,
      transferSummarySeed.onTime - Math.min(received, transferSummarySeed.onTime)
    ),
    delayed: Math.max(
      0,
      transferSummarySeed.delayed - Math.max(0, received - transferSummarySeed.onTime)
    ),
  };
}

// ─── Analytics (derived from live state) ────────────────────────────────────

function computeAnalyticsOverview(): AnalyticsOverview {
  const delivered = ordersStore.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((s, o) => s + o.value, 0);
  const revenue =
    totalRevenue >= 100000
      ? `₹${(totalRevenue / 100000).toFixed(1)} L`
      : `₹${totalRevenue.toLocaleString("en-IN")}`;

  const pendingReqs = requisitionsStore.filter(
    (r) => r.status === "pending" || r.status === "approved"
  ).length;

  return {
    ...seeds.analytics.overview,
    revenue,
    fulfillmentRate: `${Math.round((delivered.length / Math.max(ordersStore.length, 1)) * 100 * 10) / 10}%`,
    avgDeliveryTime: `${summaryStore.etaAvgHours} hrs`,
    stockAccuracy: seeds.analytics.overview.stockAccuracy,
    inventoryTurnover: seeds.analytics.overview.inventoryTurnover,
  };
}

function computeRequisitionVolume(): AnalyticsRequisitionVolume {
  const completed = requisitionsStore.filter(
    (r) => r.status === "delivered" || r.status === "received"
  ).length;
  return {
    totalRequests: requisitionsStore.length,
    completed,
    monthly: seeds.analytics.requisitionVolume?.monthly ?? [],
  };
}

function computeDeliveryPerformance(): AnalyticsDeliveryPerformance {
  const onTime = transfersStore.filter(
    (t) => t.status === "received" && !t.isDelayed
  ).length;
  const total = transfersStore.filter((t) => t.status === "received").length;
  const onTimePct = total > 0 ? (onTime / total) * 100 : 88.4;

  return {
    onTime: Math.round(onTimePct * 10) / 10,
    minorDelay: seeds.analytics.deliveryPerformance?.minorDelay ?? 8.2,
    criticalDelay: seeds.analytics.deliveryPerformance?.criticalDelay ?? 3.4,
    avgLagHours: summaryStore.etaAvgHours,
  };
}

function computeLiveKpis() {
  const pendingDispatches = queueStore.filter(
    (q) => q.status !== "delivered"
  ).length;
  const activeReqs = requisitionsStore.filter(
    (r) => !["delivered", "received"].includes(r.status)
  ).length;

  return {
    totalInventory: inventoryStore.summary.totalSkus,
    activeRequisitions: activeReqs,
    pendingDispatches,
    hubUtilization: seeds.analytics.kpis?.hubUtilization ?? 87,
    inventoryChange: seeds.analytics.kpis?.inventoryChange ?? 4.2,
    requisitionChange: seeds.analytics.kpis?.requisitionChange ?? 2.1,
    dispatchChange: seeds.analytics.kpis?.dispatchChange ?? -1.5,
    utilizationChange: seeds.analytics.kpis?.utilizationChange ?? 3.8,
  };
}

function computeDashboardKpis(): DashboardKpi[] {
  const pendingReqs = requisitionsStore.filter(
    (r) => r.status === "pending"
  ).length;
  const incoming = computeTransferSummary().totalIncoming;
  const pendingOrders = ordersStore.filter(
    (o) => !["delivered"].includes(o.status)
  ).length;
  const lowStock = inventoryStore.summary.lowStockItems;

  return dashboardKpis.map((kpi) => {
    switch (kpi.id) {
      case "pending-requisitions":
        return { ...kpi, value: String(pendingReqs) };
      case "incoming-transfers":
        return { ...kpi, value: String(incoming) };
      case "orders-pending":
        return { ...kpi, value: String(pendingOrders) };
      case "low-stock-alerts":
        return { ...kpi, value: String(lowStock).padStart(2, "0") };
      default:
        return kpi;
    }
  });
}

function mapTransferToIncomingStatus(status: TransferStatus): IncomingMaterial["status"] {
  const map: Record<TransferStatus, IncomingMaterial["status"]> = {
    ready: "pending",
    dispatched: "dispatched",
    in_transit: "in_transit",
    arriving_today: "in_transit",
    received: "received",
    delayed: "in_transit",
  };
  return map[status] ?? "pending";
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const erpDatabase = {
  // Inventory
  getInventory: (): InventoryData => structuredClone(inventoryStore),
  getInventoryProducts: (): InventoryProduct[] =>
    inventoryStore.products.map((p) => ({ ...p })),
  getProductById: (id: string) =>
    inventoryStore.products.find((p) => p.id === id),
  getProductBySku: (sku: string) =>
    inventoryStore.products.find((p) => p.sku === sku),
  updateProduct: (id: string, updates: Partial<InventoryProduct>) => {
    const index = inventoryStore.products.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    inventoryStore.products[index] = {
      ...inventoryStore.products[index],
      ...updates,
    };
    recomputeInventorySummary();
    return inventoryStore.products[index];
  },
  addProduct,
  addStockFromReceiving,
  reduceStockFromDispatch,

  // Requisitions
  getRequisitionData: (): RequisitionData => ({
    stats: requisitionMeta.stats,
    statusOptions: requisitionMeta.statusOptions,
    pagination: requisitionMeta.pagination,
    defaultSelectedId: requisitionMeta.defaultSelectedId,
    requests: [...requisitionsStore],
  }),
  getRequisitions: () => [...requisitionsStore],
  getRequisitionById: (id: string) =>
    requisitionsStore.find(
      (r) =>
        r.id === id ||
        r.requestId === id ||
        r.requestId === id.replace(/^REQ-/, "RQ-") ||
        id.replace(/^REQ-/, "RQ-") === r.requestId
    ),
  addRequisition: (request: RequisitionRequest) => {
    requisitionsStore = [request, ...requisitionsStore];
    return request;
  },
  updateRequisitionStatus: (
    id: string,
    status: RequisitionRequest["status"]
  ) => {
    const index = requisitionsStore.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    requisitionsStore[index] = { ...requisitionsStore[index], status };
    return requisitionsStore[index];
  },
  getDraft: () => draftStore,
  setDraft: (draft: DraftRequisition | null) => {
    draftStore = draft;
  },

  // Transfers
  getTransfers: (): TransferData => ({
    summary: computeTransferSummary(),
    transfers: [...transfersStore],
  }),
  getTransferById: (id: string) =>
    transfersStore.find((t) => t.id === id || t.transferId === id),
  addTransfer: (transfer: IncomingTransfer) => {
    transfersStore = [transfer, ...transfersStore];
    return transfer;
  },
  updateTransferStatus: (transferId: string, status: TransferStatus) => {
    const index = transfersStore.findIndex(
      (t) => t.id === transferId || t.transferId === transferId
    );
    if (index === -1) return undefined;
    transfersStore[index] = { ...transfersStore[index], status };
    return transfersStore[index];
  },
  receiveTransfer: (
    payload: ReceiveTransferPayload,
    receivedBy: string
  ): MaterialReceivingRecord => {
    const transfer = transfersStore.find(
      (t) => t.transferId === payload.transferId
    );
    if (!transfer) throw new Error("Transfer not found");

    addStockFromReceiving(payload.materials, receivedBy);

    const record: MaterialReceivingRecord = {
      id: `rcv-${Date.now()}`,
      transferId: payload.transferId,
      vehicleNumber: payload.vehicleNumber,
      materials: payload.materials,
      remarks: payload.remarks,
      receivedAt: new Date().toISOString(),
      receivedBy,
    };
    legacyReceivingStore = [record, ...legacyReceivingStore];

    const index = transfersStore.findIndex(
      (t) => t.transferId === payload.transferId
    );
    transfersStore[index] = {
      ...transfersStore[index],
      status: "received",
      etaDisplay: "Received",
    };

    const linkedReq = requisitionsStore.find(
      (r) =>
        transfer.transferId.includes(r.requestId.replace("RQ-", "")) ||
        r.status === "in_transit"
    );
    if (linkedReq) {
      const reqIndex = requisitionsStore.findIndex(
        (r) => r.id === linkedReq.id
      );
      requisitionsStore[reqIndex] = {
        ...requisitionsStore[reqIndex],
        status: "received",
      };
    }

    return record;
  },
  getLegacyReceivingRecords: () => [...legacyReceivingStore],

  // Receiving
  getReceivingRecords: () =>
    receivingRecordsStore.map((r) => ({
      ...r,
      materials: r.materials.map((m) => ({ ...m })),
      photos: r.photos.map((p) => ({ ...p })),
      documents: r.documents.map((d) => ({ ...d })),
    })),
  getReceivingByTransferId: (transferId: string) => {
    const record = receivingRecordsStore.find(
      (r) => r.transferId === transferId || r.id === transferId
    );
    if (record) {
      return {
        ...record,
        materials: record.materials.map((m) => ({ ...m })),
        photos: record.photos.map((p) => ({ ...p })),
        documents: record.documents.map((d) => ({ ...d })),
      };
    }

    const transfer = transfersStore.find(
      (t) => t.transferId === transferId || t.id === transferId
    );
    if (!transfer) return undefined;

    const generated = buildReceivingRecordFromTransfer(transfer);
    if (!generated) return undefined;

    receivingRecordsStore = [...receivingRecordsStore, generated];
    return {
      ...generated,
      materials: generated.materials.map((m) => ({ ...m })),
      photos: generated.photos.map((p) => ({ ...p })),
      documents: generated.documents.map((d) => ({ ...d })),
    };
  },
  updateReceivingRecord: (transferId: string, record: ReceivingRecord) => {
    const index = receivingRecordsStore.findIndex(
      (r) => r.transferId === transferId
    );
    if (index === -1) return undefined;
    receivingRecordsStore[index] = record;
    return record;
  },
  addDiscrepancy: (record: DiscrepancyRecord) => {
    discrepanciesStore = [record, ...discrepanciesStore];
    return record;
  },
  getDiscrepancies: (transferId?: string) =>
    transferId
      ? discrepanciesStore.filter((d) => d.transferId === transferId)
      : [...discrepanciesStore],
  addGrn: (grn: GoodsReceiptNote) => {
    grnStore = [grn, ...grnStore];
    return grn;
  },
  getGrnRecords: () => [...grnStore],
  acceptReceivingDelivery: (
    transferId: string,
    receivedBy: string
  ): { record: ReceivingRecord; grn: GoodsReceiptNote } => {
    const index = receivingRecordsStore.findIndex(
      (r) => r.transferId === transferId
    );
    if (index === -1) throw new Error("Receiving record not found");

    const receivingRecord = receivingRecordsStore[index];
    const grnNumber = `GRN-${transferId.replace("TR-", "").replace("-X", "")}`;

    const materials = receivingRecord.materials.map((m) => ({
      ...m,
      verificationStatus:
        m.receivedQty === m.dispatchedQty
          ? ("verified" as const)
          : m.verificationStatus,
    }));

    const updatedRecord: ReceivingRecord = {
      ...receivingRecord,
      materials,
      status: "delivered",
      grnNumber,
    };
    receivingRecordsStore[index] = updatedRecord;

    const grn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber,
      transferId,
      requisitionId: receivingRecord.requisitionId,
      receivedAt: new Date().toISOString(),
      receivedBy,
      materials,
    };
    grnStore = [grn, ...grnStore];

    addStockFromReceiving(
      materialsToReceivingItems(materials),
      receivedBy
    );

    const transferIndex = transfersStore.findIndex(
      (t) => t.transferId === transferId
    );
    if (transferIndex !== -1) {
      const transfer = transfersStore[transferIndex];
      const updatedTimeline = transfer.timeline?.map((step) => {
        if (step.title === "In Transit") {
          return { ...step, status: "completed" as const, timestamp: "Oct 24, 02:30 PM" };
        }
        if (step.title === "Delivered") {
          return {
            ...step,
            status: "completed" as const,
            subtitle: `GRN ${grnNumber} created · Inventory updated`,
            timestamp: new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
        return step;
      });

      transfersStore[transferIndex] = {
        ...transfer,
        status: "received",
        etaDisplay: "Delivered",
        timeline: updatedTimeline,
      };
    }

    if (receivingRecord.requisitionId) {
      const reqIndex = requisitionsStore.findIndex(
        (r) =>
          r.requestId === receivingRecord.requisitionId ||
          receivingRecord.requisitionId?.includes(r.requestId)
      );
      if (reqIndex !== -1) {
        requisitionsStore[reqIndex] = {
          ...requisitionsStore[reqIndex],
          status: "received",
        };
      }
    }

    return { record: updatedRecord, grn };
  },

  // Orders
  getOrders: () => ordersStore,
  setOrders: (orders: HubOrder[]) => {
    ordersStore = orders;
  },
  getOrderById: (id: string) =>
    ordersStore.find((o) => o.id === id || o.orderNo === id),
  updateOrder: (id: string, updates: Partial<HubOrder>) => {
    ordersStore = ordersStore.map((o) =>
      o.id === id || o.orderNo === id ? { ...o, ...updates } : o
    );
    return ordersStore.find((o) => o.id === id || o.orderNo === id);
  },
  getSummary: () => summaryStore,
  updateSummary: (updates: Partial<OrderSummaryData>) => {
    summaryStore = { ...summaryStore, ...updates };
    return summaryStore;
  },
  getOrdersData: (): OrdersData => ({
    summary: summaryStore,
    orders: [...ordersStore],
  }),

  // Dispatch
  getDispatches: () => dispatchesStore,
  addDispatch: (dispatch: Dispatch) => {
    dispatchesStore = [dispatch, ...dispatchesStore];
    return dispatch;
  },
  getDispatchByOrderNo: (orderNo: string) =>
    dispatchesStore.find((d) => d.orderNo === orderNo),
  getQueue: () => queueStore,
  addToQueue: (record: DispatchRecord) => {
    queueStore = [record, ...queueStore];
    return record;
  },
  updateQueueItem: (id: string, updates: Partial<DispatchRecord>) => {
    queueStore = queueStore.map((q) =>
      q.id === id ? { ...q, ...updates } : q
    );
    return queueStore.find((q) => q.id === id);
  },
  getQueueItemById: (id: string) =>
    queueStore.find((q) => q.id === id || q.dispatchNo === id),
  removePendingOrder: (orderId: string) => {
    pendingOrdersStore = pendingOrdersStore.filter((o) => o.id !== orderId);
  },
  getPendingOrders: () => pendingOrdersStore,
  getFleet: () => fleetStore,
  updateFleet: (updates: Partial<FleetStats>) => {
    fleetStore = { ...fleetStore, ...updates };
    return fleetStore;
  },
  getVehicles: () => vehiclesStore,
  addVehicle: (vehicle: DispatchVehicle) => {
    vehiclesStore = [...vehiclesStore, vehicle];
    return vehicle;
  },
  deleteVehicle: (id: string) => {
    const before = vehiclesStore.length;
    vehiclesStore = vehiclesStore.filter(
      (v) => v.id !== id && v.registrationNo !== id
    );
    return vehiclesStore.length < before;
  },
  updateVehicle: (id: string, updates: Partial<DispatchVehicle>) => {
    vehiclesStore = vehiclesStore.map((v) =>
      v.id === id || v.registrationNo === id ? { ...v, ...updates } : v
    );
    return vehiclesStore.find(
      (v) => v.id === id || v.registrationNo === id
    );
  },
  getVehicleByRegistration: (registrationNo: string) =>
    vehiclesStore.find((v) => v.registrationNo === registrationNo),
  getDrivers: () => driversStore,
  addDriver: (driver: DispatchDriver) => {
    driversStore = [...driversStore, driver];
    return driver;
  },
  deleteDriver: (id: string) => {
    const before = driversStore.length;
    driversStore = driversStore.filter(
      (d) => d.id !== id && d.name !== id
    );
    return driversStore.length < before;
  },
  updateDriver: (id: string, updates: Partial<DispatchDriver>) => {
    driversStore = driversStore.map((d) =>
      d.id === id || d.name === id ? { ...d, ...updates } : d
    );
    return driversStore.find((d) => d.id === id || d.name === id);
  },
  getDriverByName: (name: string) => driversStore.find((d) => d.name === name),
  getRoutes: () => routesStore,
  buildDefaultTimeline: buildDefaultDispatchTimeline,

  // Deliveries & Tracking
  getDeliveries: () => deliveriesStore,
  getDeliveryByDispatchId: (dispatchId: string) =>
    deliveriesStore.find(
      (d) => d.dispatchId === dispatchId || d.dispatchNo === dispatchId
    ),
  addDelivery: (delivery: DeliveryRecord) => {
    deliveriesStore = [delivery, ...deliveriesStore];
    return delivery;
  },
  updateDelivery: (id: string, updates: Partial<DeliveryRecord>) => {
    deliveriesStore = deliveriesStore.map((d) =>
      d.id === id || d.dispatchId === id || d.dispatchNo === id
        ? { ...d, ...updates }
        : d
    );
    return deliveriesStore.find(
      (d) => d.id === id || d.dispatchId === id || d.dispatchNo === id
    );
  },
  getTrackingByDispatchId: (dispatchId: string) =>
    trackingStore.find(
      (t) => t.dispatchId === dispatchId || t.dispatchNo === dispatchId
    ),
  upsertTracking: (tracking: DeliveryTracking) => {
    const idx = trackingStore.findIndex(
      (t) =>
        t.dispatchId === tracking.dispatchId ||
        t.dispatchNo === tracking.dispatchNo
    );
    if (idx >= 0) {
      trackingStore[idx] = tracking;
    } else {
      trackingStore = [tracking, ...trackingStore];
    }
    return tracking;
  },
  getDispatchesByOrderNo: (orderNo: string) =>
    queueStore.filter((d) => d.orderNo === orderNo),

  // Ledger
  getLedgerTransactions: () => [...ledgerTransactionsStore],
  addLedgerTransaction: (txn: LedgerTransaction) => {
    ledgerTransactionsStore = [txn, ...ledgerTransactionsStore];
    ledgerMeta.totalEntries += 1;
    return txn;
  },
  getLedgerMeta: () => ({ ...ledgerMeta }),
  getLedgerChartData: (): LedgerChartDataPoint[] => [...ledgerChartData],
  getLedgerAuditHistory: (): LedgerAuditRecord[] => [...ledgerAuditHistory],
  getLedgerProducts: () => [...ledgerProducts],
  /** @deprecated Use addLedgerTransaction */
  getLedger: () => ledgerTransactionsStore,
  /** @deprecated Use addLedgerTransaction */
  addLedgerEntry: (entry: {
    id: string;
    transactionNo: string;
    materialName: string;
    sku: string;
    hubName: string;
    type: string;
    quantity: number;
    balance: number;
    reference: string;
    performedBy: string;
    timestamp: string;
  }) => {
    const txn = createLedgerTransaction({
      product: entry.materialName,
      sku: entry.sku,
      type: entry.type === "outbound" ? "sold" : "received",
      change: entry.quantity,
      unit: "Units",
      openingStock: entry.balance - entry.quantity,
      linkedModule: "dispatch",
      referenceId: entry.reference,
      warehouse: entry.hubName,
      createdBy: entry.performedBy,
    });
    return erpDatabase.addLedgerTransaction(txn);
  },

  // Analytics
  getAnalyticsOverview: (
    _hub?: string,
    _dateRange?: AnalyticsDateRangePreset
  ): AnalyticsOverview => computeAnalyticsOverview(),
  getAnalyticsInventoryTrends: (): AnalyticsInventoryTrend[] =>
    seeds.analytics.inventoryTrends as AnalyticsInventoryTrend[],
  getAnalyticsConsumption: (): AnalyticsConsumptionItem[] =>
    seeds.analytics.consumption as AnalyticsConsumptionItem[],
  getAnalyticsRequisitionVolume: (): AnalyticsRequisitionVolume =>
    computeRequisitionVolume(),
  getAnalyticsDeliveryPerformance: (): AnalyticsDeliveryPerformance =>
    computeDeliveryPerformance(),
  getAnalyticsMovementLogs: (): LogisticsMovementLog[] => {
    const queue = queueStore.slice(0, 3);
    const statusMap: Record<string, LogisticsMovementLog["status"]> = {
      pending: "pending",
      preparing: "pending",
      in_transit: "in_transit",
      dispatched: "in_transit",
      delivered: "delivered",
    };
    if (queue.length >= 1) {
      return queue.map((d, i) => ({
        id: d.id,
        shipmentId: `TRK-${98421 - i}`,
        material: d.orderNo,
        destination: d.customer,
        eta: d.schedule,
        status: statusMap[d.status] ?? "pending",
        actionType: (d.status === "delivered" ? "eye" : "map") as
          | "eye"
          | "map",
      }));
    }
    return (seeds.analytics.movementLogs ?? []) as LogisticsMovementLog[];
  },
  getAnalyticsHubOptions: () => seeds.analytics.hubOptions ?? [],
  getLiveKpis: () => computeLiveKpis(),
  getFullAnalytics: (
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): AnalyticsDashboardData => ({
    overview: erpDatabase.getAnalyticsOverview(hub, dateRange),
    inventoryTrends: erpDatabase.getAnalyticsInventoryTrends(),
    consumption: erpDatabase.getAnalyticsConsumption(),
    requisitionVolume: erpDatabase.getAnalyticsRequisitionVolume(),
    deliveryPerformance: erpDatabase.getAnalyticsDeliveryPerformance(),
    movementLogs: erpDatabase.getAnalyticsMovementLogs(),
    hubOptions: erpDatabase.getAnalyticsHubOptions(),
    lastUpdated: new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }),
  getDashboardAnalytics: () => seeds.analytics,

  // Dashboard
  getDashboardKpis: () => computeDashboardKpis(),
  getDashboardSeed: () => seeds.dashboard,
  updateDashboardKpi: (kpiId: string, value: string) => {
    dashboardKpis = dashboardKpis.map((k) =>
      k.id === kpiId ? { ...k, value } : k
    );
  },

  // Users
  getCurrentUser: () => ({ ...usersStore.currentUser }),
  getUsers: () => ({ ...usersStore }),

  // Incoming materials (derived from active transfers)
  getIncomingMaterials: (): IncomingMaterial[] => {
    return transfersStore
      .filter((t) => t.status !== "received")
      .map((t) => ({
        id: t.id,
        shipmentNo: t.transferId,
        supplier: t.source,
        hubId: "hub-001",
        hubName: t.destination,
        materialCount: t.materials.length,
        totalQuantity: t.materials.reduce((sum, m) => {
          const qty = parseFloat(m.quantity.replace(/[^0-9.]/g, "")) || 0;
          return sum + qty;
        }, 0),
        expectedDate: t.dispatchDate ?? t.scheduled ?? "",
        status: mapTransferToIncomingStatus(t.status),
        carrier: t.vehicle,
      }));
  },

  // Helpers exposed for services
  findProduct: findProductByIdOrSku,
};
