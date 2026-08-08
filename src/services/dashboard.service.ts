import type {
  ActivityLog,
  ActiveRequisition,
  DashboardKpi,
  IncomingDelivery,
  OutboundEfficiency,
  OutgoingDispatch,
  QuickOperation,
} from "@/types";
import { QUICK_OPERATIONS } from "@/constants/quickOperations";
import { delay } from "@/lib/utils";
import api from "./axios";
import type { ApiResponse } from "@/types/api";

interface HubDashboardApiData {
  todaysOrders: number;
  pendingOrders: number;
  ordersReady: number;
  ordersLoading: number;
  ordersDispatched: number;
  ordersDelivered: number;
  emergencyOrders: number;
  bulkOrders: number;
  inventoryAlertCount: number;
  vehiclesAvailable: number;
  driversAvailable: number;
  todaysRevenue: number;
  hubPerformance: {
    deliveryRate: number;
    dispatchRate: number;
    onTimeDelivery: number;
    orderFulfillment: number;
  };
}

function formatRevenue(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function mapOutboundEfficiency(data: HubDashboardApiData): OutboundEfficiency {
  const dispatched = Number(data.ordersDispatched) || 0;
  // Ready-for-dispatch is still in the outbound pipeline (packed / waiting to load)
  const loading =
    (Number(data.ordersLoading) || 0) + (Number(data.ordersReady) || 0);
  const pending = Number(data.pendingOrders) || 0;
  return {
    total: dispatched + loading + pending,
    dispatched,
    loading,
    pending,
  };
}

function mapDashboardKpis(data: HubDashboardApiData): DashboardKpi[] {
  return [
    {
      id: "todays-orders",
      label: "Today's Orders",
      value: String(data.todaysOrders),
      sublabel: "Created today",
      variant: "primary",
    },
    {
      id: "orders-pending",
      label: "Orders Pending",
      value: String(data.pendingOrders),
      sublabel: "Awaiting hub action",
      variant: data.pendingOrders > 0 ? "alert" : "default",
    },
    {
      id: "inventory-value",
      label: "Today's Revenue",
      value: formatRevenue(Number(data.todaysRevenue) || 0),
      variant: "default",
    },
    {
      id: "pending-requisitions",
      label: "Pending Requisitions",
      value: "0",
      variant: "default",
    },
    {
      id: "incoming-transfers",
      label: "Incoming Transfers",
      value: "0",
      variant: "default",
    },
    {
      id: "low-stock-alerts",
      label: "Low Stock Alerts",
      value: String(data.inventoryAlertCount).padStart(2, "0"),
      variant: data.inventoryAlertCount > 0 ? "alert" : "default",
    },
    {
      id: "emergency-orders",
      label: "Emergency Orders",
      value: String(data.emergencyOrders),
      sublabel: "Active today",
      variant: data.emergencyOrders > 0 ? "alert" : "default",
    },
    {
      id: "bulk-orders",
      label: "Bulk Orders",
      value: String(data.bulkOrders),
      sublabel: "In queue",
      variant: "default",
    },
    {
      id: "ready-to-dispatch",
      label: "Orders Ready to Dispatch",
      value: String(data.ordersReady),
      sublabel: "Packed & waiting",
      variant: "default",
    },
  ];
}

export interface DashboardReportData {
  lastSync: string;
  kpis: DashboardKpi[];
  outgoingDispatches: OutgoingDispatch[];
  incomingDeliveries: IncomingDelivery[];
  activeRequisitions: ActiveRequisition[];
  outboundEfficiency: OutboundEfficiency;
  recentLogs: ActivityLog[];
}

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get<ApiResponse<HubDashboardApiData>>(
      "/hub/dashboard",
    );
    const payload = data.data;
    const kpis = mapDashboardKpis(payload);
    const outboundEfficiency = mapOutboundEfficiency(payload);

    let outgoingDispatches: OutgoingDispatch[] = [];
    let recentLogs: ActivityLog[] = [];

    try {
      const ordersRes = await api.get<
        ApiResponse<{
          data: Array<{
            id: string;
            orderNumber: string;
            orderStatus: string;
            grandTotal: number | string;
            createdAt: string;
            deliveryAddress?: { city?: string; line1?: string } | null;
            customer?: { fullName?: string } | null;
            assignedDriver?: { name?: string } | null;
            assignedVehicle?: { registration?: string } | null;
          }>;
        }>
      >("/hub/orders", { params: { page: 1, limit: 8 } });

      const rows = ordersRes.data.data.data || [];
      outgoingDispatches = rows.map((order) => ({
        id: order.id,
        orderId: order.id,
        customerName: order.customer?.fullName || "Customer",
        orderReceiveTime: new Date(order.createdAt).toLocaleString("en-IN"),
        destination:
          order.deliveryAddress?.line1 ||
          order.deliveryAddress?.city ||
          "Customer site",
        status:
          order.orderStatus === "DELIVERED"
            ? "delivered"
            : order.orderStatus === "DISPATCHED"
              ? "dispatch"
              : "pending",
        scheduledDate: order.createdAt,
        dispatchNo: order.orderNumber,
      })) as OutgoingDispatch[];

      recentLogs = rows.slice(0, 5).map((order) => ({
        id: order.id,
        title: order.orderNumber,
        subtitle: `${order.orderStatus} · ${order.customer?.fullName || "Customer"}`,
        type: "order",
        timestamp: new Date(order.createdAt).toLocaleString("en-IN"),
        scheduledDate: order.createdAt,
        referenceId: order.id,
        href: `/orders/${order.id}`,
      })) as ActivityLog[];
    } catch {
      /* orders list is best-effort for dashboard widgets */
    }

    return {
      lastSync: "Just now",
      kpis,
      outgoingDispatches,
      incomingDeliveries: [] as IncomingDelivery[],
      quickOperations: QUICK_OPERATIONS as QuickOperation[],
      activeRequisitions: [] as ActiveRequisition[],
      outboundEfficiency,
      recentLogs,
    };
  },

  getLiveKpis(): DashboardKpi[] {
    return mapDashboardKpis({
      todaysOrders: 0,
      pendingOrders: 0,
      ordersReady: 0,
      ordersLoading: 0,
      ordersDispatched: 0,
      ordersDelivered: 0,
      emergencyOrders: 0,
      bulkOrders: 0,
      inventoryAlertCount: 0,
      vehiclesAvailable: 0,
      driversAvailable: 0,
      todaysRevenue: 0,
      hubPerformance: {
        deliveryRate: 0,
        dispatchRate: 0,
        onTimeDelivery: 0,
        orderFulfillment: 0,
      },
    });
  },

  async downloadPDF(data: DashboardReportData): Promise<void> {
    await delay(400);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Hub Overview Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #111827; }
    h1 { color: #FF6B00; font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 14px; color: #6B7280; font-weight: normal; margin-top: 0; }
    h3 { font-size: 14px; margin-top: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
    .kpi { border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; text-align: center; }
    .kpi-label { font-size: 10px; color: #6B7280; text-transform: uppercase; }
    .kpi-value { font-size: 20px; font-weight: bold; color: #FF6B00; margin-top: 4px; }
    .kpi-sublabel { font-size: 10px; color: #9CA3AF; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
    th { background: #F8F9FB; font-size: 10px; text-transform: uppercase; color: #6B7280; }
    .summary { display: flex; gap: 24px; margin-top: 8px; font-size: 13px; }
    .summary span { color: #6B7280; }
    .footer { margin-top: 40px; font-size: 11px; color: #9CA3AF; }
    .status { text-transform: uppercase; font-size: 10px; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Hub Overview</h1>
  <h2>HubOps Central — Daily Operations Snapshot</h2>
  <p style="font-size:12px;color:#6B7280;">Last sync: ${data.lastSync} · Generated: ${new Date().toLocaleString("en-IN")}</p>

  <h3>Key Metrics</h3>
  <div class="kpi-grid">
    ${data.kpis
      .map(
        (kpi) => `
    <div class="kpi">
      <div class="kpi-label">${kpi.label}</div>
      <div class="kpi-value">${kpi.value}</div>
      ${kpi.sublabel ? `<div class="kpi-sublabel">${kpi.sublabel}</div>` : ""}
    </div>`,
      )
      .join("")}
  </div>

  <h3>Incoming Materials</h3>
  <table>
    <tr><th>Transfer ID</th><th>Expected Arrival</th><th>Material</th><th>Quantity</th><th>Source</th><th>Status</th></tr>
    ${data.incomingDeliveries
      .map(
        (d) =>
          `<tr><td>${d.transferId}</td><td>${d.expectedArrival}</td><td>${d.material}</td><td>${d.quantity}</td><td>${d.source}</td><td class="status">${d.status}</td></tr>`,
      )
      .join("")}
  </table>

  <h3>Active Requisitions</h3>
  <table>
    <tr><th>Code</th><th>Title</th><th>Progress</th><th>Status</th></tr>
    ${data.activeRequisitions
      .map(
        (req) =>
          `<tr><td>${req.code}</td><td>${req.title}</td><td>${req.progress}/${req.totalSteps}</td><td>${req.statusText}</td></tr>`,
      )
      .join("")}
  </table>

  <h3>Outbound Efficiency</h3>
  <div class="summary">
    <div><span>Total:</span> <strong>${data.outboundEfficiency.total}</strong></div>
    <div><span>Dispatch:</span> <strong>${data.outboundEfficiency.dispatched}</strong></div>
    <div><span>Loading:</span> <strong>${data.outboundEfficiency.loading}</strong></div>
    <div><span>Pending:</span> <strong>${data.outboundEfficiency.pending}</strong></div>
  </div>

  <h3>Recent Activity</h3>
  <table>
    <tr><th>Time</th><th>Event</th><th>Details</th></tr>
    ${data.recentLogs
      .map(
        (log) =>
          `<tr><td>${log.timestamp}</td><td>${log.title}</td><td>${log.subtitle}</td></tr>`,
      )
      .join("")}
  </table>

  <div class="footer">Vikram Hub Portal — Hub Overview Report</div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);
    }
  },
};
