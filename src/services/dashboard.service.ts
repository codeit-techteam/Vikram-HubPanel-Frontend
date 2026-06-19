import type {
  ActivityLog,
  ActiveRequisition,
  DashboardKpi,
  IncomingDelivery,
  OutboundEfficiency,
  QuickOperation,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

export interface DashboardReportData {
  lastSync: string;
  kpis: DashboardKpi[];
  incomingDeliveries: IncomingDelivery[];
  activeRequisitions: ActiveRequisition[];
  outboundEfficiency: OutboundEfficiency;
  recentLogs: ActivityLog[];
}

export const dashboardService = {
  async getDashboard() {
    await delay(300);
    const seed = erpDatabase.getDashboardSeed();
    return {
      lastSync: seed.lastSync,
      kpis: erpDatabase.getDashboardKpis(),
      incomingDeliveries: seed.incomingDeliveries as IncomingDelivery[],
      quickOperations: seed.quickOperations as QuickOperation[],
      activeRequisitions: seed.activeRequisitions as ActiveRequisition[],
      outboundEfficiency: seed.outboundEfficiency as OutboundEfficiency,
      recentLogs: seed.recentLogs as ActivityLog[],
    };
  },

  getLiveKpis(): DashboardKpi[] {
    return erpDatabase.getDashboardKpis();
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
    </div>`
      )
      .join("")}
  </div>

  <h3>Incoming Deliveries</h3>
  <table>
    <tr><th>ETA</th><th>Material</th><th>Quantity</th><th>Source</th><th>Status</th></tr>
    ${data.incomingDeliveries
      .map(
        (d) =>
          `<tr><td>${d.eta}</td><td>${d.material}</td><td>${d.quantity}</td><td>${d.source}</td><td class="status">${d.status}</td></tr>`
      )
      .join("")}
  </table>

  <h3>Active Requisitions</h3>
  <table>
    <tr><th>Code</th><th>Title</th><th>Progress</th><th>Status</th></tr>
    ${data.activeRequisitions
      .map(
        (req) =>
          `<tr><td>${req.code}</td><td>${req.title}</td><td>${req.progress}/${req.totalSteps}</td><td>${req.statusText}</td></tr>`
      )
      .join("")}
  </table>

  <h3>Outbound Efficiency</h3>
  <div class="summary">
    <div><span>Total:</span> <strong>${data.outboundEfficiency.total}</strong></div>
    <div><span>Dispatched:</span> <strong>${data.outboundEfficiency.dispatched}</strong></div>
    <div><span>Loading:</span> <strong>${data.outboundEfficiency.loading}</strong></div>
    <div><span>Pending:</span> <strong>${data.outboundEfficiency.pending}</strong></div>
  </div>

  <h3>Recent Activity</h3>
  <table>
    <tr><th>Time</th><th>Event</th><th>Details</th></tr>
    ${data.recentLogs
      .map(
        (log) =>
          `<tr><td>${log.timestamp}</td><td>${log.title}</td><td>${log.subtitle}</td></tr>`
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
