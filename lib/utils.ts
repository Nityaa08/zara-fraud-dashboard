import { Transaction, Filters } from "./types";

/** Compute a 0–100 risk score for a transaction based on fraud indicators */
export function computeRiskScore(t: Transaction): number {
  let score = 0;
  if (t.ipCountry !== t.country) score += 40;
  if (t.status === "chargeback") score += 25;
  if (t.amount > 400) score += 15;
  if (t.paymentMethod === "Visa" || t.paymentMethod === "Mastercard") score += 5;
  if (t.productCategory === "Electronics") score += 5;
  if (t.customerEmail.includes("proton.me")) score += 10;
  return Math.min(score, 100);
}

export function applyFilters(
  transactions: Transaction[],
  filters: Filters
): Transaction[] {
  return transactions.filter((t) => {
    if (filters.countries.length > 0 && !filters.countries.includes(t.country))
      return false;
    if (
      filters.paymentMethods.length > 0 &&
      !filters.paymentMethods.includes(t.paymentMethod)
    )
      return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(t.status))
      return false;
    if (t.amount < filters.amountRange[0] || t.amount > filters.amountRange[1])
      return false;
    if (filters.dateRange[0] && t.timestamp < filters.dateRange[0])
      return false;
    if (filters.dateRange[1] && t.timestamp > filters.dateRange[1])
      return false;
    if (filters.highRiskOnly && (t.riskScore ?? 0) < 50)
      return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = [
        t.id,
        t.customerEmail,
        t.cardLast4,
        t.cardBIN,
        t.merchantId,
        t.productCategory,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/** Export filtered transactions as CSV and trigger download */
export function exportToCSV(transactions: Transaction[], filename: string) {
  const headers = [
    "ID", "Timestamp", "Amount", "Currency", "Country", "Payment Method",
    "Status", "Customer Email", "Card Last 4", "Card BIN",
    "Product Category", "IP Country", "Merchant ID", "Risk Score",
  ];
  const rows = transactions.map((t) => [
    t.id, t.timestamp, t.amount, t.currency, t.country,
    t.paymentMethod, t.status, t.customerEmail, t.cardLast4,
    t.cardBIN, t.productCategory, t.ipCountry, t.merchantId,
    t.riskScore ?? "",
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
