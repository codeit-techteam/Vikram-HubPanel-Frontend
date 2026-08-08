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
import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/authStore";

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

export interface ReportsQueryParams {
  period?: AnalyticsDateRangePreset | string;
  fromDate?: string;
  toDate?: string;
}

interface HubReportsApiData extends AnalyticsDashboardData {
  hub?: { id: string; name: string; code: string };
  period?: { from: string; to: string; preset?: string; lastUpdated?: string };
  deliveryPerformance: AnalyticsDeliveryPerformance & {
    empty?: boolean;
    totalDelivered?: number;
  };
}

function toIsoDate(d: Date): string {
  return d.toISOString();
}

function resolveRange(
  period: AnalyticsDateRangePreset,
  customFrom?: Date,
  customTo?: Date,
): { period: string; fromDate?: string; toDate?: string } {
  if (period === "custom" && customFrom && customTo) {
    return {
      period: "custom",
      fromDate: toIsoDate(customFrom),
      toDate: toIsoDate(customTo),
    };
  }
  return { period };
}

function mapDashboard(data: HubReportsApiData): AnalyticsDashboardData {
  const manager = useAuthStore.getState().manager;
  const hubOptions =
    data.hubOptions?.length > 0
      ? data.hubOptions
      : data.hub
        ? [{ value: data.hub.id, label: data.hub.name }]
        : manager
          ? [
              {
                value: manager.hubId,
                label: manager.hubName || "Assigned Hub",
              },
            ]
          : [];

  return {
    overview: data.overview ?? {
      inventoryTurnover: "--",
      fulfillmentRate: "--",
      avgDeliveryTime: "--",
      stockAccuracy: "--",
      revenue: "₹0",
    },
    inventoryTrends: data.inventoryTrends ?? [],
    consumption: data.consumption ?? [],
    requisitionVolume: data.requisitionVolume ?? {
      totalRequests: 0,
      completed: 0,
      monthly: [],
    },
    deliveryPerformance: {
      onTime: data.deliveryPerformance?.onTime ?? 0,
      minorDelay: data.deliveryPerformance?.minorDelay ?? 0,
      criticalDelay: data.deliveryPerformance?.criticalDelay ?? 0,
      avgLagHours: data.deliveryPerformance?.avgLagHours ?? 0,
    },
    movementLogs: (data.movementLogs ?? []) as LogisticsMovementLog[],
    hubOptions,
    lastUpdated:
      data.lastUpdated ||
      data.period?.lastUpdated ||
      new Date().toLocaleString("en-IN"),
  };
}

export const analyticsService = {
  async getFullDashboard(
    _hub?: string,
    dateRange: AnalyticsDateRangePreset = "last_30_days",
    customFrom?: Date,
    customTo?: Date,
  ): Promise<AnalyticsDashboardData> {
    const params = resolveRange(dateRange, customFrom, customTo);
    const { data } = await api.get<ApiResponse<HubReportsApiData>>(
      "/hub/reports",
      { params },
    );
    return mapDashboard(data.data);
  },

  /** @deprecated Prefer getFullDashboard — kept for legacy /analytics page */
  async getDashboardAnalytics(): Promise<AnalyticsData> {
    const full = await this.getFullDashboard(undefined, "last_30_days");
    const fulfillment =
      Number(String(full.overview.fulfillmentRate).replace("%", "")) || 0;
    const stockAccuracy =
      Number(String(full.overview.stockAccuracy).replace("%", "")) || 0;
    const totalStockIn = full.inventoryTrends.reduce(
      (sum, t) => sum + (t.stockIn || 0),
      0,
    );

    return {
      inventoryTrend: full.inventoryTrends.map((t) => ({
        name: t.name,
        value: t.consumption,
        secondary: t.stockIn,
      })),
      requisitionTrend: full.requisitionVolume.monthly.map((m) => ({
        name: m.name,
        value: m.value,
      })),
      dispatchTrend: full.inventoryTrends.map((t) => ({
        name: t.name,
        value: t.consumption,
      })),
      monthlyPerformance: full.requisitionVolume.monthly.map((m) => ({
        name: m.name,
        value: m.value,
      })),
      hubEfficiency: [
        { name: "Fulfillment", value: fulfillment },
        { name: "Stock Accuracy", value: stockAccuracy },
        { name: "On-Time", value: full.deliveryPerformance.onTime },
        { name: "Minor Delay", value: full.deliveryPerformance.minorDelay },
      ],
      materialFlow: full.consumption.map((c) => ({
        name: c.name,
        value: c.percentage,
      })),
      kpis: {
        totalInventory: totalStockIn,
        activeRequisitions: full.requisitionVolume.totalRequests,
        pendingDispatches: full.movementLogs.filter(
          (l) => l.status === "pending" || l.status === "loading" || l.status === "dispatch",
        ).length,
        hubUtilization: fulfillment,
        inventoryChange: 0,
        requisitionChange: 0,
        dispatchChange: 0,
        utilizationChange: 0,
      },
    };
  },

  async getKpis(): Promise<KpiMetric[]> {
    const full = await this.getFullDashboard(undefined, "last_30_days");
    return [
      {
        label: "Fulfillment Rate",
        value: full.overview.fulfillmentRate,
        change: 0,
        trend: "up",
      },
      {
        label: "Avg Delivery Time",
        value: full.overview.avgDeliveryTime,
        change: 0,
        trend: "up",
      },
      {
        label: "Revenue",
        value: full.overview.revenue,
        change: 0,
        trend: "up",
      },
      {
        label: "Requisitions",
        value: full.requisitionVolume.totalRequests,
        change: 0,
        trend: "up",
      },
    ];
  },

  async getOverview(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset,
  ): Promise<AnalyticsOverview> {
    const data = await this.getFullDashboard(hub, dateRange ?? "last_30_days");
    return data.overview;
  },

  async getInventoryTrends(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset,
  ): Promise<AnalyticsInventoryTrend[]> {
    const data = await this.getFullDashboard(hub, dateRange ?? "last_30_days");
    return data.inventoryTrends;
  },

  async getConsumptionMetrics(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset,
  ) {
    const data = await this.getFullDashboard(hub, dateRange ?? "last_30_days");
    return data.consumption;
  },

  async getRequisitionVolume(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset,
  ): Promise<AnalyticsRequisitionVolume> {
    const data = await this.getFullDashboard(hub, dateRange ?? "last_30_days");
    return data.requisitionVolume;
  },

  async getDeliveryPerformance(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset,
  ): Promise<AnalyticsDeliveryPerformance> {
    const data = await this.getFullDashboard(hub, dateRange ?? "last_30_days");
    return data.deliveryPerformance;
  },

  async getMovementLogs(
    hub?: string,
    dateRange?: AnalyticsDateRangePreset,
  ): Promise<LogisticsMovementLog[]> {
    const data = await this.getFullDashboard(hub, dateRange ?? "last_30_days");
    return data.movementLogs;
  },

  async exportExcel(data: AnalyticsDashboardData): Promise<void> {
    const hubLabel = data.hubOptions[0]?.label || "Assigned Hub";
    const rows: string[][] = [
      ["Hub Performance Analytics Report"],
      ["Generated", new Date().toLocaleString("en-IN")],
      ["Hub", hubLabel],
      ["Last Updated", data.lastUpdated],
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
      ["Period", "Stock In", "Consumption"],
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
      ["Period", "Volume"],
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
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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
    const hubLabel = data.hubOptions[0]?.label || "Assigned Hub";
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${hubLabel} Performance Report</title>
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
  <h1>${hubLabel} Performance Analytics</h1>
  <h2>Hub Performance Intelligence Report</h2>
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
    <tr><th>Period</th><th>Stock In</th><th>Consumption</th></tr>
    ${
      data.inventoryTrends.length
        ? data.inventoryTrends
            .map(
              (t) =>
                `<tr><td>${t.name}</td><td>${t.stockIn}</td><td>${t.consumption}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="3">No data available for this period</td></tr>`
    }
  </table>

  <h3>Product Consumption</h3>
  <table>
    <tr><th>Product</th><th>Share</th></tr>
    ${
      data.consumption.length
        ? data.consumption
            .map((c) => `<tr><td>${c.name}</td><td>${c.percentage}%</td></tr>`)
            .join("")
        : `<tr><td colspan="2">No consumption data</td></tr>`
    }
  </table>

  <h3>Requisition Volume</h3>
  <p>Total Requests: <strong>${data.requisitionVolume.totalRequests}</strong> | Completed: <strong>${data.requisitionVolume.completed}</strong></p>

  <h3>Delivery Performance</h3>
  <p>On-Time: ${data.deliveryPerformance.onTime}% | Minor Delay: ${data.deliveryPerformance.minorDelay}% | Critical: ${data.deliveryPerformance.criticalDelay}% | Avg Lag: ${data.deliveryPerformance.avgLagHours}h</p>

  <h3>Logistics Stream</h3>
  <table>
    <tr><th>Shipment ID</th><th>Material</th><th>Destination</th><th>ETA</th><th>Status</th></tr>
    ${
      data.movementLogs.length
        ? data.movementLogs
            .map(
              (l) =>
                `<tr><td>${l.shipmentId}</td><td>${l.material}</td><td>${l.destination}</td><td>${l.eta}</td><td>${l.status}</td></tr>`,
            )
            .join("")
        : `<tr><td colspan="5">No logistics activity</td></tr>`
    }
  </table>

  <div class="footer">Vikram Hub Portal — ${hubLabel} — ${data.lastUpdated}</div>
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
