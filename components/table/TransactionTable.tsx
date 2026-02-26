"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { useState, useEffect } from "react";

interface Props {
  data: Transaction[];
  onSelect: (txn: Transaction) => void;
}

type SortKey = "timestamp" | "amount" | "country" | "status" | "riskScore";
type SortDir = "asc" | "desc";

function RiskDot({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-red-500" : score >= 40 ? "bg-orange-400" : "bg-green-400";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-gray-600">{score}</span>
    </div>
  );
}

export default function TransactionTable({ data, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Reset page when data changes (filter applied)
  useEffect(() => { setPage(0); }, [data]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const sorted = [...data].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "amount") return (a.amount - b.amount) * dir;
    if (sortKey === "riskScore") return ((a.riskScore ?? 0) - (b.riskScore ?? 0)) * dir;
    return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
  });

  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-900 select-none"
      onClick={() => toggleSort(field)}
    >
      {label}
      {sortKey === field && (
        <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
      )}
    </th>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          Transactions{" "}
          <span className="font-normal text-gray-500">({data.length} results)</span>
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(data, "transactions-export.csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-2 py-1 rounded border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 rounded border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-gray-500">No transactions match your current filters.</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting or clearing your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortHeader label="Risk" field="riskScore" />
                <SortHeader label="Date" field="timestamp" />
                <SortHeader label="Amount" field="amount" />
                <SortHeader label="Country" field="country" />
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Payment
                </th>
                <SortHeader label="Status" field="status" />
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  IP Country
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((txn) => {
                const ipMismatch = txn.ipCountry !== txn.country;
                return (
                  <tr
                    key={txn.id}
                    onClick={() => onSelect(txn)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50 ${
                      (txn.riskScore ?? 0) >= 70
                        ? "bg-red-50"
                        : (txn.riskScore ?? 0) >= 40
                        ? "bg-orange-50"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <RiskDot score={txn.riskScore ?? 0} />
                    </td>
                    <td className="px-3 py-2 text-gray-700 whitespace-nowrap">
                      {formatDate(txn.timestamp)}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{txn.country}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {txn.paymentMethod}
                    </td>
                    <td className="px-3 py-2">
                      <Badge value={txn.status} />
                    </td>
                    <td className="px-3 py-2 text-gray-700">{txn.productCategory}</td>
                    <td className="px-3 py-2">
                      <span className={ipMismatch ? "text-red-600 font-semibold" : "text-gray-700"}>
                        {txn.ipCountry}
                        {ipMismatch && " \u26A0"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
