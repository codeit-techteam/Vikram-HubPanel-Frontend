import { jsPDF } from "jspdf";
import type { OrderLineItem } from "@/mock/createOrderData";
import type { SiteDetails } from "@/store/createOrderStore";

export interface QuotePdfData {
  orderId: string;
  customer: {
    name: string;
    mobile: string;
    email: string;
    customerTypeLabel?: string;
  } | null;
  siteDetails: SiteDetails;
  lineItems: OrderLineItem[];
  materialTotal: number;
  deliveryCharge: number;
  gstAmount: number;
  discount: number;
  grandTotal: number;
}

function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateQuotePdf(data: QuotePdfData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("HubOps Central — Sub-Hub West", pageWidth - margin, 14, {
    align: "right",
  });
  doc.text(`Quote #Q-${data.orderId}`, pageWidth - margin, 20, {
    align: "right",
  });
  doc.text(
    `Date: ${new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
    pageWidth - margin,
    26,
    { align: "right" }
  );

  y = 38;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Details", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  if (data.customer) {
    doc.text(`Name: ${data.customer.name}`, margin, y);
    y += 5;
    doc.text(`Mobile: ${data.customer.mobile}`, margin, y);
    y += 5;
    if (data.customer.email && data.customer.email !== "—") {
      doc.text(`Email: ${data.customer.email}`, margin, y);
      y += 5;
    }
    if (data.customer.customerTypeLabel) {
      doc.text(`Type: ${data.customer.customerTypeLabel}`, margin, y);
      y += 5;
    }
  } else {
    doc.text("Customer not selected", margin, y);
    y += 5;
  }

  y += 4;
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Site", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const siteName = data.siteDetails.siteName || "—";
  const address = data.siteDetails.deliveryAddress || "—";
  const cityLine = [data.siteDetails.city, data.siteDetails.state, data.siteDetails.pinCode]
    .filter(Boolean)
    .join(", ");
  doc.text(`Site: ${siteName}`, margin, y);
  y += 5;
  const addressLines = doc.splitTextToSize(`Address: ${address}`, pageWidth - margin * 2);
  doc.text(addressLines, margin, y);
  y += addressLines.length * 5;
  if (cityLine) {
    doc.text(cityLine, margin, y);
    y += 5;
  }

  y += 8;
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const colProduct = margin;
  const colSku = margin + 70;
  const colQty = margin + 110;
  const colUnit = margin + 130;
  const colTotal = pageWidth - margin;
  doc.text("PRODUCT", colProduct, y);
  doc.text("SKU", colSku, y);
  doc.text("QTY", colQty, y);
  doc.text("UNIT", colUnit, y);
  doc.text("TOTAL", colTotal, y, { align: "right" });
  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(9);

  for (const item of data.lineItems) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const lineTotal = item.unitPrice * item.quantity;
    const nameLines = doc.splitTextToSize(item.name, 65);
    doc.text(nameLines, colProduct, y);
    doc.text(item.sku, colSku, y);
    doc.text(String(item.quantity), colQty, y);
    doc.text(item.unit, colUnit, y);
    doc.text(formatInr(lineTotal), colTotal, y, { align: "right" });
    y += Math.max(nameLines.length * 5, 6) + 2;
  }

  if (data.lineItems.length === 0) {
    doc.setTextColor(156, 163, 175);
    doc.text("No materials added", colProduct, y);
    y += 8;
  }

  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const summaryX = pageWidth - margin - 70;
  const valueX = pageWidth - margin;

  const addSummaryLine = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(bold ? 17 : 107, bold ? 24 : 114, bold ? 39 : 128);
    doc.text(label, summaryX, y);
    doc.text(value, valueX, y, { align: "right" });
    y += 6;
  };

  addSummaryLine("Material Total", formatInr(data.materialTotal));
  if (data.deliveryCharge > 0) {
    addSummaryLine("Delivery Charges", formatInr(data.deliveryCharge));
  }
  if (data.discount > 0) {
    addSummaryLine("Discount", `-${formatInr(data.discount)}`);
  }
  addSummaryLine("GST (18%)", formatInr(data.gstAmount));
  y += 2;
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(0.5);
  doc.line(summaryX, y, valueX, y);
  y += 8;
  doc.setTextColor(255, 107, 0);
  doc.setFontSize(12);
  addSummaryLine("Grand Total", formatInr(data.grandTotal), true);

  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer-generated quotation and is valid for 7 days from the date of issue.",
    margin,
    y
  );

  doc.save(`Quotation-Q-${data.orderId}.pdf`);
}
