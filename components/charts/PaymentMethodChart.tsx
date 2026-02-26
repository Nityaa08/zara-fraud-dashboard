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
      raw: name,
      count: txns.length,
      chargebacks: txns.filter((t) => t.status === "chargeback").length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">By Payment Method</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          onClick={(e: Record<string, unknown>) => {
            const payload = e?.activePayload as Array<{ payload: { raw: string } }> | undefined;
            if (payload?.[0] && onClickMethod)
              onClickMethod(payload[0].payload.raw);
          }}
        >
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
          <Bar dataKey="count" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
