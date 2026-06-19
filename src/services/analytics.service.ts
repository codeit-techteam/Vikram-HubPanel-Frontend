import type {
  AnalyticsDashboardData,
  AnalyticsDateRangePreset,
  AnalyticsDeliveryPerformance,
  AnalyticsInventoryTrend,
  AnalyticsOverview,
  AnalyticsRequisitionVolume,
  ChartDataPoint,
  KpiMetric,
  LogisticsMovementLog,
} from "@/types";
import { delay, formatNumber } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

export interface AnalyticsData {
  inventoryTrend: ChartDataPoint[];
  requisitionTrend: ChartDataPoint[];
  dispatchTrend: ChartDataPoint[];
  monthlyPerformance: ChartDataPoint[];
  hubEfficiency: ChartDataPoint[];
  materialFlow: ChartDataPoint[];
  kpis: {
    totalInventory: number;
    activeRequisitions: number;
    pendingDispatches: number;
    hubUtilization: number;
    inventoryChange: number;
    requisitionChange: number;
    dispatchChange: number;
    utilizationChange: number;
  };
}

export const analyticsService = {
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    await delay(400);
    const seed = erpDatabase.getDashboardAnalytics() as unknown as AnalyticsData;
    return {
      ...seed,
      kpis: erpDatabase.getLiveKpis(),
    };
  },

  async getKpis(): Promise<KpiMetric[]> {
    await delay(300);
    const kpis = erpDatabase.getLiveKpis();
    return [
      {
        label: "Total Inventory",
        value: kpis.totalInventory,
        change: kpis.inventoryChange,
        trend: "up",
      },
      {
        label: "Active Requisitions",
        value: kpis.activeRequisitions,
        change: kpis.requisitionChange,
        trend: "up",
      },
      {
        label: "Pending Dispatches",
        value: kpis.pendingDispatches,
        change: kpis.dispatchChange,
        trend: "up",
      },
      {
        label: "Hub Utilization",
        value: `${kpis.hubUtilization}%`,
        change: kpis.utilizationChange,
        trend: "up",
      },
    ];
  },

  async getOverview(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<AnalyticsOverview> {
    await delay(200);
    return erpDatabase.getAnalyticsOverview(hub, dateRange);
  },

  async getInventoryTrends(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<AnalyticsInventoryTrend[]> {
    await delay(200);
    return erpDatabase.getAnalyticsInventoryTrends();
  },

  async getConsumptionMetrics(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ) {
    await delay(200);
    return erpDatabase.getAnalyticsConsumption();
  },

  async getRequisitionVolume(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<AnalyticsRequisitionVolume> {
    await delay(200);
    return erpDatabase.getAnalyticsRequisitionVolume();
  },

  async getDeliveryPerformance(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<AnalyticsDeliveryPerformance> {
    await delay(200);
    return erpDatabase.getAnalyticsDeliveryPerformance();
  },

  async getMovementLogs(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<LogisticsMovementLog[]> {
    await delay(200);
    return erpDatabase.getAnalyticsMovementLogs();
  },

  async getFullDashboard(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<AnalyticsDashboardData> {
    await delay(350);
    return erpDatabase.getFullAnalytics(hub, dateRange);
  },

  async getRevenueAnalytics(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset
  ): Promise<{ revenue: string; deliveredCount: number; totalValue: number }> {
    await delay(200);
    const orders = erpDatabase.getOrders();
    const delivered = orders.filter((o) => o.status === "delivered");
    const totalValue = delivered.reduce((s, o) => s + o.value, 0);
    const overview = erpDatabase.getAnalyticsOverview(hub, dateRange);
    return {
      revenue: overview.revenue,
      deliveredCount: delivered.length,
      totalValue,
    };
  },

  async exportExcel(data: AnalyticsDashboardData): Promise<void> {
    await delay(500);
    const dashboardSeed = erpDatabase.getDashboardSeed();

    const rows: string[][] = [
      ["Hub Performance Analytics Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      ["Hub", data.hubOptions.find((h) => h.value)?.label || "Central Hub"],
      [],
      ["KPI Overview"],
      ["Metric", "Value"],
      ["Inventory Turnover", data.overview.inventoryTurnover],
      ["Fulfillment Rate", data.overview.fulfillmentRate],
      ["Average Delivery Time", data.overview.avgDeliveryTime],
      ["Stock Accuracy", data.overview.stockAccuracy],
      ["Revenue", data.overview.revenue],
      [],
      ["Inventory Trends"],
      ["Week", "Stock In", "Consumption"],
      ...data.inventoryTrends.map((t) => [
        t.name,
        String(t.stockIn),
        String(t.consumption),
      ]),
      [],
      ["Product Consumption"],
      ["Product", "Percentage"],
      ...data.consumption.map((c) => [c.name, `${c.percentage}%`]),
      [],
      ["Requisition Volume"],
      ["Total Requests", String(data.requisitionVolume.totalRequests)],
      ["Completed", String(data.requisitionVolume.completed)],
      ["Month", "Volume"],
      ...data.requisitionVolume.monthly.map((m) => [m.name, String(m.value)]),
      [],
      ["Delivery Performance"],
      ["On-Time", `${data.deliveryPerformance.onTime}%`],
      ["Minor Delay", `${data.deliveryPerformance.minorDelay}%`],
      ["Critical Delay", `${data.deliveryPerformance.criticalDelay}%`],
      ["Average Lag", `${data.deliveryPerformance.avgLagHours}h`],
      [],
      ["Logistics Stream"],
      ["Shipment ID", "Material", "Destination", "ETA", "Status"],
      ...data.movementLogs.map((l) => [
        l.shipmentId,
        l.material,
        l.destination,
        l.eta,
        l.status,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hub-analytics-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  },

  async downloadPDF(data: AnalyticsDashboardData): Promise<void> {
    await delay(600);
    const dashboardSeed = erpDatabase.getDashboardSeed();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Hub Performance Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #111827; }
    h1 { color: #FF6B00; font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 16px; color: #6B7280; font-weight: normal; margin-top: 0; }
    h3 { font-size: 14px; margin-top: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
    .kpi { border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; text-align: center; }
    .kpi-label { font-size: 10px; color: #6B7280; text-transform: uppercase; }
    .kpi-value { font-size: 22px; font-weight: bold; color: #FF6B00; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
    th { background: #F8F9FB; font-size: 10px; text-transform: uppercase; color: #6B7280; }
    .footer { margin-top: 40px; font-size: 11px; color: #9CA3AF; }
  </style>
</head>
<body>
  <h1>Hub Performance Analytics</h1>
  <h2>Construction ERP Performance Intelligence Dashboard</h2>
  <p style="font-size:12px;color:#6B7280;">Last Updated: ${data.lastUpdated}</p>

  <h3>KPI Overview</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">Inventory Turnover</div><div class="kpi-value">${data.overview.inventoryTurnover}</div></div>
    <div class="kpi"><div class="kpi-label">Fulfillment Rate</div><div class="kpi-value">${data.overview.fulfillmentRate}</div></div>
    <div class="kpi"><div class="kpi-label">Avg Delivery Time</div><div class="kpi-value">${data.overview.avgDeliveryTime}</div></div>
    <div class="kpi"><div class="kpi-label">Stock Accuracy</div><div class="kpi-value">${data.overview.stockAccuracy}</div></div>
    <div class="kpi"><div class="kpi-label">Revenue</div><div class="kpi-value">${data.overview.revenue}</div></div>
  </div>

  <h3>Inventory Trends</h3>
  <table>
    <tr><th>Week</th><th>Stock In</th><th>Consumption</th></tr>
    ${data.inventoryTrends.map((t) => `<tr><td>${t.name}</td><td>${t.stockIn}</td><td>${t.consumption}</td></tr>`).join("")}
  </table>

  <h3>Product Consumption</h3>
  <table>
    <tr><th>Product</th><th>Share</th></tr>
    ${data.consumption.map((c) => `<tr><td>${c.name}</td><td>${c.percentage}%</td></tr>`).join("")}
  </table>

  <h3>Requisition Volume</h3>
  <p>Total Requests: <strong>${formatNumber(data.requisitionVolume.totalRequests)}</strong> | Completed: <strong>${formatNumber(data.requisitionVolume.completed)}</strong></p>

  <h3>Delivery Performance</h3>
  <p>On-Time: ${data.deliveryPerformance.onTime}% | Minor Delay: ${data.deliveryPerformance.minorDelay}% | Critical: ${data.deliveryPerformance.criticalDelay}% | Avg Lag: ${data.deliveryPerformance.avgLagHours}h</p>

  <h3>Logistics Stream</h3>
  <table>
    <tr><th>Shipment ID</th><th>Material</th><th>Destination</th><th>ETA</th><th>Status</th></tr>
    ${data.movementLogs.map((l) => `<tr><td>${l.shipmentId}</td><td>${l.material}</td><td>${l.destination}</td><td>${l.eta}</td><td>${l.status}</td></tr>`).join("")}
  </table>

  <div class="footer">Vikram Hub Portal — Executive Analytics Report — ${dashboardSeed.lastSync || "Real-time"}</div>
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
