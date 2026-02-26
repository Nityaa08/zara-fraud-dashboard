"use client";

import { Transaction } from "@/lib/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { groupBy } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Props {
  data: Transaction[];
  onClickCountry?: (country: string) => void;
}

export default function CountryChart({ data, onClickCountry }: Props) {
  const byCountry = groupBy(data, (t) => t.country);
  const chartData = Object.entries(byCountry).map(([name, txns]) => ({
    name,
    value: txns.length,
    chargebacks: txns.filter((t) => t.status === "chargeback").length,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">By Country</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            dataKey="value"
            onClick={(entry) => onClickCountry?.(entry.name)}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              const cb = (props.payload as { chargebacks: number }).chargebacks;
              return [`${value} txns (${cb} chargebacks)`, name];
            }}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
