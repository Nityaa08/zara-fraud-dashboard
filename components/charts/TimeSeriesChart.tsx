"use client";

import { Transaction } from "@/lib/types";
import { format, startOfHour } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { groupBy } from "@/lib/utils";

interface Props {
  data: Transaction[];
  onClickTime?: (hour: string) => void;
}

export default function TimeSeriesChart({ data, onClickTime }: Props) {
  // Group by hour
  const byHour = groupBy(data, (t) =>
    format(startOfHour(new Date(t.timestamp)), "MMM dd HH:00")
  );

  const chartData = Object.entries(byHour)
    .map(([hour, txns]) => ({
      hour,
      total: txns.length,
      chargebacks: txns.filter((t) => t.status === "chargeback").length,
      approved: txns.filter((t) => t.status === "approved").length,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Transactions Over Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={chartData}
          onClick={(e) => {
            if (e?.activeLabel && onClickTime) onClickTime(String(e.activeLabel));
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="approved"
            stackId="1"
            stroke="#22c55e"
            fill="#bbf7d0"
            name="Approved"
          />
          <Area
            type="monotone"
            dataKey="chargebacks"
            stackId="1"
            stroke="#f97316"
            fill="#fed7aa"
            name="Chargebacks"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
