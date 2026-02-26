"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function StatsBar({ data }: { data: Transaction[] }) {
  const total = data.length;
  const chargebacks = data.filter((t) => t.status === "chargeback").length;
  const totalAmount = data.reduce((s, t) => s + t.amount, 0);
  const avgAmount = total > 0 ? totalAmount / total : 0;
  const ipMismatches = data.filter((t) => t.ipCountry !== t.country).length;

  const stats = [
    { label: "Transactions", value: total.toLocaleString() },
    { label: "Chargebacks", value: chargebacks.toLocaleString(), warn: chargebacks > 0 },
    { label: "Chargeback Rate", value: total > 0 ? (chargebacks / total * 100).toFixed(1) + "%" : "0%", warn: chargebacks / total > 0.1 },
    { label: "Avg Amount", value: formatCurrency(avgAmount) },
    { label: "Total Volume", value: formatCurrency(totalAmount) },
    { label: "IP Mismatches", value: ipMismatches.toLocaleString(), warn: ipMismatches > 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          <p className={`text-lg font-bold ${s.warn ? "text-red-600" : "text-gray-900"}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
