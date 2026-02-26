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
  // Create histogram buckets
  const buckets = [
    { label: "$0-50", min: 0, max: 50 },
    { label: "$50-100", min: 50, max: 100 },
    { label: "$100-200", min: 100, max: 200 },
    { label: "$200-300", min: 200, max: 300 },
    { label: "$300-500", min: 300, max: 500 },
    { label: "$500-700", min: 500, max: 700 },
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Amount Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value, _name, props) => {
              const cb = (props.payload as { chargebacks: number }).chargebacks;
              return [`${value} txns (${cb} chargebacks)`];
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.chargebacks > entry.count * 0.3 ? "#ef4444" : "#8b5cf6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
