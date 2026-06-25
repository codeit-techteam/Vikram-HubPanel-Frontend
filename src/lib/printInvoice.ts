import { formatCurrency } from "@/lib/utils";
import type { HubOrder } from "@/types";

function buildInvoiceHtml(order: HubOrder): string {
  const gst = order.gstDetails ?? {
    gstin: "27AABCU9603R1ZM",
    companyName: order.customer.name,
    state: "Maharashtra",
  };
  const gstAmount = Math.round(order.value * 0.18);
  const subtotal = order.value - gstAmount;

  const itemRows = order.materials
    .map(
      (m) => `
    <tr>
      <td>
        <strong>${m.name}</strong><br/>
        <span style="color:#9CA3AF;font-size:11px;">${m.sku}</span>
      </td>
      <td>${m.quantity} ${m.unit}</td>
      <td style="text-align:right;">${formatCurrency(m.totalPrice)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${order.orderNo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #111827; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #FF6B00; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: bold; color: #FF6B00; }
    .brand-sub { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .invoice-meta { text-align: right; }
    .invoice-no { font-size: 16px; font-weight: bold; color: #FF6B00; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 11px; text-transform: uppercase; color: #9CA3AF; margin-bottom: 6px; letter-spacing: 0.05em; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th, td { border-bottom: 1px solid #E5E7EB; padding: 10px 8px; text-align: left; }
    th { font-size: 10px; text-transform: uppercase; color: #6B7280; background: #F8F9FB; }
    .totals { margin-left: auto; width: 260px; font-size: 13px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; color: #6B7280; }
    .totals-row.grand { border-top: 2px solid #FF6B00; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: bold; color: #111827; }
    .footer { margin-top: 40px; font-size: 11px; color: #9CA3AF; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">TAX INVOICE</div>
      <div class="brand-sub">HubOps Central — Noida (UP-04)</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-no">${order.orderNo}</div>
      <div style="font-size:12px;color:#6B7280;margin-top:4px;">Date: ${order.orderDate}</div>
    </div>
  </div>

  <div class="grid">
    <div class="section">
      <div class="section-title">Bill To</div>
      <strong>${order.customer.name}</strong><br/>
      <span style="color:#6B7280;font-size:13px;">${order.customer.type}</span><br/>
      ${order.customer.email ? `<span style="font-size:13px;">${order.customer.email}</span><br/>` : ""}
      ${order.customer.phone ? `<span style="font-size:13px;">${order.customer.phone}</span>` : ""}
    </div>
    <div class="section">
      <div class="section-title">GST Details</div>
      <span style="font-size:13px;">GSTIN: ${gst.gstin}</span><br/>
      <span style="font-size:13px;">State: ${gst.state}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Delivery Address</div>
    <span style="font-size:13px;">${order.deliveryAddress}</span><br/>
    <span style="font-size:12px;color:#6B7280;">Site: ${order.location}</span>
  </div>

  <table>
    <thead>
      <tr><th>Item</th><th>Quantity</th><th style="text-align:right;">Amount</th></tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
    <div class="totals-row"><span>GST (18%)</span><span>${formatCurrency(gstAmount)}</span></div>
    <div class="totals-row grand"><span>Total</span><span>${formatCurrency(order.value)}</span></div>
    <div class="totals-row" style="margin-top:8px;font-size:12px;">
      <span>Payment</span><span>${order.payment.method} — ${order.payment.status}</span>
    </div>
  </div>

  <div class="footer">Computer-generated tax invoice — HubOps Central</div>
</body>
</html>`;
}

export function printInvoice(order: HubOrder): void {
  const html = buildInvoiceHtml(order);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  }
}
