"use client";

import { Transaction } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: Transaction[];
}

export default function AmountChart({ data }: Props) {
  const buckets = [
    { label: "$0–50", min: 0, max: 50 },
    { label: "$50–100", min: 50, max: 100 },
    { label: "$100–200", min: 100, max: 200 },
    { label: "$200–300", min: 200, max: 300 },
    { label: "$300–500", min: 300, max: 500 },
    { label: "$500–700", min: 500, max: 700 },
    { label: "$700+", min: 700, max: Infinity },
  ];

  const chartData = buckets.map((b) => {
    const txns = data.filter((t) => t.amount >= b.min && t.amount < b.max);
    return {
      name: b.label,
      count: txns.length,
      chargebacks: txns.filter((t) => t.status === "chargeback").length,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Amount Distribution</h3>
        <span className="text-[10px] text-slate-400 font-medium">
          Red = &gt;30% chargebacks
        </span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value, _name, props) => {
              const cb = (props.payload as { chargebacks: number }).chargebacks;
              return [`${value} txns (${cb} chargebacks)`];
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.chargebacks > entry.count * 0.3 ? "#ef4444" : "#8b5cf6"}
                fillOpacity={entry.chargebacks > entry.count * 0.3 ? 0.9 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
