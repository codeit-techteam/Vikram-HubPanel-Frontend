import { jsPDF } from "jspdf";
import type { HubOrder } from "@/types";

function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function generateInvoicePdf(order: HubOrder): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  doc.setFillColor(255, 107, 0);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("HubOps Central — Noida (UP-04)", pageWidth - margin, 14, {
    align: "right",
  });
  doc.text(`Invoice #${order.orderNo}`, pageWidth - margin, 20, {
    align: "right",
  });
  doc.text(`Date: ${order.orderDate}`, pageWidth - margin, 26, {
    align: "right",
  });

  y = 38;
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(order.customer.name, margin, y);
  y += 5;
  doc.text(order.customer.type, margin, y);
  y += 5;
  if (order.customer.email) {
    doc.text(order.customer.email, margin, y);
    y += 5;
  }
  if (order.customer.phone) {
    doc.text(order.customer.phone, margin, y);
    y += 5;
  }

  const gst = order.gstDetails ?? {
    gstin: "27AABCU9603R1ZM",
    companyName: order.customer.name,
    state: "Maharashtra",
  };

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text("GST Details", pageWidth / 2, 38);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(`GSTIN: ${gst.gstin}`, pageWidth / 2, 44);
  doc.text(`State: ${gst.state}`, pageWidth / 2, 49);

  y += 8;
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Address", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const addressLines = doc.splitTextToSize(order.deliveryAddress, pageWidth - margin * 2);
  doc.text(addressLines, margin, y);
  y += addressLines.length * 5 + 4;
  doc.text(`Site: ${order.location}`, margin, y);
  y += 10;

  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const colItem = margin;
  const colSku = margin + 75;
  const colQty = margin + 115;
  const colTotal = pageWidth - margin;
  doc.text("ITEM", colItem, y);
  doc.text("SKU", colSku, y);
  doc.text("QTY", colQty, y);
  doc.text("AMOUNT", colTotal, y, { align: "right" });
  y += 4;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(17, 24, 39);

  for (const material of order.materials) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const nameLines = doc.splitTextToSize(material.name, 70);
    doc.text(nameLines, colItem, y);
    doc.text(material.sku, colSku, y);
    doc.text(`${material.quantity} ${material.unit}`, colQty, y);
    doc.text(formatInr(material.totalPrice), colTotal, y, { align: "right" });
    y += Math.max(nameLines.length * 5, 6) + 2;
  }

  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  const summaryX = pageWidth - margin - 70;
  const valueX = pageWidth - margin;
  const gstAmount = Math.round(order.value * 0.18);
  const subtotal = order.value - gstAmount;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Subtotal", summaryX, y);
  doc.text(formatInr(subtotal), valueX, y, { align: "right" });
  y += 6;
  doc.text("GST (18%)", summaryX, y);
  doc.text(formatInr(gstAmount), valueX, y, { align: "right" });
  y += 8;
  doc.setDrawColor(255, 107, 0);
  doc.setLineWidth(0.5);
  doc.line(summaryX, y, valueX, y);
  y += 8;
  doc.setTextColor(255, 107, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total", summaryX, y);
  doc.text(formatInr(order.value), valueX, y, { align: "right" });
  y += 10;
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Payment: ${order.payment.method} — ${order.payment.status}`,
    margin,
    y
  );

  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer-generated tax invoice from HubOps Central.",
    margin,
    y
  );

  doc.save(`Invoice-${order.orderNo}.pdf`);
}
