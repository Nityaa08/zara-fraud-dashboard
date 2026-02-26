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
import { groupBy } from "@/lib/utils";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#06b6d4"];

interface Props {
  data: Transaction[];
  onClickMethod?: (method: string) => void;
}

export default function PaymentMethodChart({ data, onClickMethod }: Props) {
  const byMethod = groupBy(data, (t) => t.paymentMethod);
  const chartData = Object.entries(byMethod)
    .map(([name, txns]) => ({
      name,
      count: txns.length,
      chargebacks: txns.filter((t) => t.status === "chargeback").length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Payment Methods</h3>
        <span className="text-[10px] text-slate-400 font-medium">Click to filter</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={chartData}
          onClick={(e: Record<string, unknown>) => {
            const payload = e?.activePayload as Array<{ payload: { name: string } }> | undefined;
            if (payload?.[0] && onClickMethod)
              onClickMethod(payload[0].payload.name);
          }}
        >
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
          <Bar dataKey="count" radius={[6, 6, 0, 0]} style={{ cursor: "pointer" }}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
