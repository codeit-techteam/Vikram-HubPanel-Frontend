import type {
  DashboardKpi,
  DeliveryRecord,
  DeliveryTracking,
  DiscrepancyRecord,
  Dispatch,
  DispatchDriver,
  DispatchRecord,
  DispatchRoute,
  DispatchVehicle,
  DraftRequisition,
  FleetStats,
  GoodsReceiptNote,
  HubOrder,
  IncomingTransfer,
  InventoryData,
  LedgerAuditRecord,
  LedgerChartDataPoint,
  LedgerTransaction,
  MaterialReceivingRecord,
  OrdersData,
  PendingDispatchOrder,
  ReceivingRecord,
  RequisitionData,
  RequisitionRequest,
  TransferData,
} from "@/types";
import analyticsData from "@/mock/analytics.json";
import dashboardData from "@/mock/dashboard.json";
import deliveriesData from "@/mock/deliveries.json";
import dispatchesData from "@/mock/dispatches.json";
import driversData from "@/mock/drivers.json";
import inventoryData from "@/mock/inventory.json";
import ledgerData from "@/mock/ledger.json";
import ordersData from "@/mock/orders.json";
import receivingData from "@/mock/receiving.json";
import requisitionsData from "@/mock/requisitions.json";
import routesData from "@/mock/routes.json";
import trackingData from "@/mock/tracking.json";
import transfersData from "@/mock/transfers.json";
import usersData from "@/mock/users.json";
import vehiclesData from "@/mock/vehicles.json";

interface DispatchesMockData {
  fleet: FleetStats;
  pendingOrders: PendingDispatchOrder[];
  queue: DispatchRecord[];
  dispatches: Dispatch[];
}

interface LedgerMockData {
  meta: {
    totalEntries: number;
    lowStockSkus: number;
    auditAccuracy: number;
    lastAuditDaysAgo: number;
  };
  chartData: LedgerChartDataPoint[];
  transactions: LedgerTransaction[];
  auditHistory: LedgerAuditRecord[];
  products: { value: string; label: string }[];
}

interface DeliveriesMockData {
  deliveries: DeliveryRecord[];
}

interface TrackingMockData {
  tracks: DeliveryTracking[];
}

export const seeds = {
  inventory: structuredClone(inventoryData) as InventoryData,
  requisitions: structuredClone(requisitionsData) as RequisitionData,
  transfers: structuredClone(transfersData) as TransferData,
  receiving: structuredClone(receivingData) as { records: ReceivingRecord[] },
  orders: structuredClone(ordersData) as OrdersData,
  dispatches: structuredClone(dispatchesData) as DispatchesMockData,
  vehicles: structuredClone(vehiclesData) as DispatchVehicle[],
  drivers: structuredClone(driversData) as DispatchDriver[],
  routes: structuredClone(routesData) as DispatchRoute[],
  deliveries: structuredClone(deliveriesData) as DeliveriesMockData,
  tracking: structuredClone(trackingData) as TrackingMockData,
  ledger: structuredClone(ledgerData) as LedgerMockData,
  analytics: structuredClone(analyticsData),
  dashboard: structuredClone(dashboardData) as {
    lastSync: string;
    kpis: DashboardKpi[];
    incomingDeliveries: unknown[];
    quickOperations: unknown[];
    activeRequisitions: unknown[];
    outboundEfficiency: unknown;
    recentLogs: unknown[];
  },
  users: structuredClone(usersData),
};

export type LedgerMeta = LedgerMockData["meta"];
