const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash on Delhivery",
  cod: "Cash on Delhivery",
  cash_on_delhivery: "Cash on Delhivery",
  upi: "Pay with UPI",
  cards: "Pay with Cards",
  credit: "Credit",
  bank_transfer: "Bank Transfer",
  "Credit Account": "Credit Account",
  "Net 30": "Net 30",
};

export function formatPaymentMethodLabel(method: string): string {
  if (!method) return "—";

  const direct = PAYMENT_METHOD_LABELS[method];
  if (direct) return direct;

  const lower = PAYMENT_METHOD_LABELS[method.toLowerCase()];
  if (lower) return lower;

  return method.replace(/_/g, " ");
}
