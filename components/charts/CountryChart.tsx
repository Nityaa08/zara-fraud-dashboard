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

const COLORS = ["#6366f1", "#10b981", "#f59e0b"];

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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Country Distribution</h3>
        <span className="text-[10px] text-slate-400 font-medium">Click to filter</span>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            dataKey="value"
            onClick={(entry) => onClickCountry?.(entry.name)}
            style={{ cursor: "pointer" }}
            strokeWidth={2}
            stroke="#fff"
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
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
          />
          <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: "#64748b" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
