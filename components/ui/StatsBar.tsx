"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function StatsBar({ data }: { data: Transaction[] }) {
  const total = data.length;
  const chargebacks = data.filter((t) => t.status === "chargeback").length;
  const totalAmount = data.reduce((s, t) => s + t.amount, 0);
  const avgAmount = total > 0 ? totalAmount / total : 0;
  const ipMismatches = data.filter((t) => t.ipCountry !== t.country).length;
  const cbRate = total > 0 ? chargebacks / total : 0;

  const stats = [
    { label: "Transactions", value: total.toLocaleString(), color: "border-l-indigo-500" },
    { label: "Chargebacks", value: chargebacks.toLocaleString(), color: "border-l-red-500", warn: chargebacks > 0 },
    { label: "Chargeback Rate", value: (cbRate * 100).toFixed(1) + "%", color: "border-l-orange-500", warn: cbRate > 0.05 },
    { label: "Avg Amount", value: formatCurrency(avgAmount), color: "border-l-emerald-500" },
    { label: "Total Volume", value: formatCurrency(totalAmount), color: "border-l-blue-500" },
    { label: "IP Mismatches", value: ipMismatches.toLocaleString(), color: "border-l-rose-500", warn: ipMismatches > 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white rounded-lg border border-slate-200/80 border-l-[3px] ${s.color} p-3.5 shadow-sm`}
        >
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</p>
          <p className={`text-xl font-bold tracking-tight mt-0.5 ${s.warn ? "text-red-600" : "text-slate-900"}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
