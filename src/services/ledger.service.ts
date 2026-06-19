import type {
  LedgerAnalytics,
  LedgerAuditRecord,
  LedgerChartDataPoint,
  LedgerFilters,
  LedgerPaginationMeta,
  LedgerTransaction,
} from "@/types";
import { delay } from "@/lib/utils";
import { erpDatabase } from "./erpDatabase";

function filterTransactions(
  transactions: LedgerTransaction[],
  filters: LedgerFilters
): LedgerTransaction[] {
  return transactions.filter((txn) => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch =
      !filters.search ||
      txn.product.toLowerCase().includes(searchLower) ||
      txn.sku.toLowerCase().includes(searchLower) ||
      txn.referenceId.toLowerCase().includes(searchLower) ||
      txn.supplier?.toLowerCase().includes(searchLower) ||
      txn.truckId?.toLowerCase().includes(searchLower) ||
      txn.transactionNo.toLowerCase().includes(searchLower);

    const txnDate = new Date(txn.date);
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    const matchesDate = txnDate >= fromDate && txnDate <= toDate;

    const matchesProduct =
      filters.product === "all" || txn.sku === filters.product;

    const matchesType =
      filters.transactionTypes.length === 0 ||
      filters.transactionTypes.includes(txn.type);

    return matchesSearch && matchesDate && matchesProduct && matchesType;
  });
}

function computeAnalytics(transactions: LedgerTransaction[]): LedgerAnalytics {
  const meta = erpDatabase.getLedgerMeta();
  const totalInflow = transactions
    .filter((t) => t.change > 0)
    .reduce((sum, t) => sum + t.change, 0);

  const totalOutflow = transactions
    .filter((t) => t.change < 0)
    .reduce((sum, t) => sum + Math.abs(t.change), 0);

  const materialCounts = transactions.reduce<
    Record<string, { product: string; sku: string; movements: number }>
  >((acc, t) => {
    if (!acc[t.sku]) {
      acc[t.sku] = { product: t.product, sku: t.sku, movements: 0 };
    }
    acc[t.sku].movements += 1;
    return acc;
  }, {});

  const mostMovedMaterials = Object.values(materialCounts)
    .sort((a, b) => b.movements - a.movements)
    .slice(0, 5);

  return {
    totalInflow,
    totalOutflow,
    stockVariance: totalInflow - totalOutflow,
    auditAccuracy: meta.auditAccuracy,
    lowStockSkus: meta.lowStockSkus,
    mostMovedMaterials,
  };
}

function generateCsv(transactions: LedgerTransaction[]): string {
  const headers = [
    "Transaction ID",
    "Date",
    "Type",
    "Product",
    "SKU",
    "Opening Stock",
    "Change",
    "Closing Stock",
    "Reference",
    "Warehouse",
    "Created By",
  ];

  const rows = transactions.map((t) => [
    t.transactionNo,
    t.date,
    t.type.toUpperCase(),
    t.product,
    t.sku,
    `${t.openingStock} ${t.openingStockUnit}`,
    `${t.change > 0 ? "+" : ""}${t.change} ${t.changeUnit}`,
    `${t.closingStock} ${t.closingStockUnit}`,
    t.referenceId,
    t.warehouse,
    t.createdBy,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export const ledgerService = {
  async getLedgerEntries(
    filters: LedgerFilters,
    page = 1,
    pageSize = 5
  ): Promise<{
    data: LedgerTransaction[];
    pagination: LedgerPaginationMeta;
    analytics: LedgerAnalytics;
  }> {
    await delay(300);

    const allTransactions = erpDatabase.getLedgerTransactions();
    const filtered = filterTransactions(allTransactions, filters);
    const meta = erpDatabase.getLedgerMeta();
    const total =
      filters.search ||
      filters.product !== "all" ||
      filters.transactionTypes.length > 0
        ? filtered.length
        : meta.totalEntries;

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;

    let pageData: LedgerTransaction[];
    if (start < filtered.length) {
      pageData = filtered.slice(start, start + pageSize);
    } else {
      pageData = filtered.slice(0, pageSize).map((t, i) => ({
        ...t,
        id: `${t.id}-p${page}-${i}`,
        transactionNo: `TXN-2026-${String(88000 + start + i).padStart(5, "0")}`,
      }));
    }

    return {
      data: pageData,
      pagination: { page, pageSize, total, totalPages },
      analytics: computeAnalytics(
        filtered.length > 0 ? filtered : allTransactions
      ),
    };
  },

  async getTransactionDetails(id: string): Promise<LedgerTransaction | null> {
    await delay(150);
    const transactions = erpDatabase.getLedgerTransactions();
    return (
      transactions.find((t) => t.id === id || id.startsWith(t.id)) ?? null
    );
  },

  async getChartData(): Promise<LedgerChartDataPoint[]> {
    await delay(200);
    return erpDatabase.getLedgerChartData();
  },

  async getAuditHistory(): Promise<LedgerAuditRecord[]> {
    await delay(200);
    return erpDatabase.getLedgerAuditHistory();
  },

  async exportCSV(filters: LedgerFilters): Promise<string> {
    await delay(400);
    const filtered = filterTransactions(
      erpDatabase.getLedgerTransactions(),
      filters
    );
    return generateCsv(filtered);
  },

  async printLedger(filters: LedgerFilters): Promise<LedgerTransaction[]> {
    await delay(300);
    return filterTransactions(erpDatabase.getLedgerTransactions(), filters);
  },

  getProducts(): { value: string; label: string }[] {
    return erpDatabase.getLedgerProducts();
  },

  getMeta() {
    return erpDatabase.getLedgerMeta();
  },
};
