"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "./Badge";

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
  allTransactions: Transaction[];
  onSelectRelated: (txn: Transaction) => void;
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className={`text-sm font-medium text-right max-w-[200px] truncate ${warn ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-red-100 text-red-800 border-red-200" :
    score >= 40 ? "bg-orange-100 text-orange-800 border-orange-200" :
    "bg-green-100 text-green-800 border-green-200";
  const label =
    score >= 70 ? "High Risk" :
    score >= 40 ? "Medium Risk" :
    "Low Risk";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {label} ({score})
    </span>
  );
}

export default function TransactionDetail({
  transaction: t,
  onClose,
  allTransactions,
  onSelectRelated,
}: Props) {
  if (!t) return null;

  const ipMismatch = t.ipCountry !== t.country;

  // Find related transactions (same email or same card last4)
  const related = allTransactions.filter(
    (r) =>
      r.id !== t.id &&
      (r.customerEmail === t.customerEmail || r.cardLast4 === t.cardLast4)
  );

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Transaction Detail</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close detail panel"
          >
            &times;
          </button>
        </div>
        <div className="p-5 space-y-0">
          <div className="flex items-center justify-between py-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(t.amount)}
            </span>
            <div className="flex items-center gap-2">
              <RiskBadge score={t.riskScore ?? 0} />
              <Badge value={t.status} />
            </div>
          </div>

          {ipMismatch && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-red-800">
                IP Country Mismatch Detected
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Billing: {t.country} / IP: {t.ipCountry}
              </p>
            </div>
          )}

          <Row label="Transaction ID" value={t.id} />
          <Row label="Date & Time" value={formatDate(t.timestamp)} />
          <Row label="Country" value={t.country} />
          <Row label="IP Country" value={t.ipCountry} warn={ipMismatch} />
          <Row label="Payment Method" value={t.paymentMethod.replace(/_/g, " ")} />
          <Row label="Card BIN" value={t.cardBIN} />
          <Row label="Card Last 4" value={t.cardLast4} />
          <Row label="Customer Email" value={t.customerEmail} />
          <Row label="Product Category" value={t.productCategory} />
          <Row label="Merchant ID" value={t.merchantId} />
          <Row label="Currency" value={t.currency} />

          {/* Related Transactions */}
          {related.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Related Transactions ({related.length})
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {related.slice(0, 10).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRelated(r)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded border border-gray-100 hover:bg-blue-50 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(r.amount)}
                      </span>
                      <span className="text-gray-400 ml-2">
                        {formatDate(r.timestamp)}
                      </span>
                    </div>
                    <Badge value={r.status} />
                  </button>
                ))}
                {related.length > 10 && (
                  <p className="text-xs text-gray-400 px-3">
                    +{related.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
