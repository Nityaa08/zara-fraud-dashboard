"use client";

import { Transaction } from "@/lib/types";
import { formatCurrency, groupBy } from "@/lib/utils";

interface Props {
  data: Transaction[];
}

interface Insight {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

function detectInsights(data: Transaction[]): Insight[] {
  const insights: Insight[] = [];

  // 1. Chargeback clustering by country + time
  const chargebacks = data.filter((t) => t.status === "chargeback");
  if (chargebacks.length > 0) {
    const byCountry = groupBy(chargebacks, (t) => t.country);
    for (const [country, txns] of Object.entries(byCountry)) {
      if (txns.length >= 5) {
        // Check for time clustering
        const sorted = [...txns].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const firstTime = new Date(sorted[0].timestamp);
        const lastTime = new Date(sorted[sorted.length - 1].timestamp);
        const hourSpan = (lastTime.getTime() - firstTime.getTime()) / (1000 * 60 * 60);

        if (hourSpan <= 4 && txns.length >= 10) {
          const avgAmt = txns.reduce((s, t) => s + t.amount, 0) / txns.length;
          const methods = Array.from(new Set(txns.map((t) => t.paymentMethod)));
          insights.push({
            severity: "high",
            title: `${txns.length} chargebacks clustered in ${country}`,
            detail: `${txns.length} chargebacks within ${hourSpan.toFixed(1)}h window, avg ${formatCurrency(avgAmt)}, via ${methods.join("/")}`,
          });
        } else if (txns.length >= 5) {
          insights.push({
            severity: "medium",
            title: `${txns.length} chargebacks from ${country}`,
            detail: `Elevated chargeback volume detected`,
          });
        }
      }
    }
  }

  // 2. IP mismatch concentration
  const ipMismatches = data.filter((t) => t.ipCountry !== t.country);
  if (ipMismatches.length >= 5) {
    const cbMismatches = ipMismatches.filter((t) => t.status === "chargeback");
    insights.push({
      severity: cbMismatches.length >= 10 ? "high" : "medium",
      title: `${ipMismatches.length} IP/country mismatches`,
      detail: `${cbMismatches.length} of these are chargebacks — possible cross-border fraud`,
    });
  }

  // 3. Email velocity (same email, many txns)
  const byEmail = groupBy(data, (t) => t.customerEmail);
  const velocityEmails = Object.entries(byEmail).filter(([, txns]) => txns.length >= 5);
  if (velocityEmails.length > 0) {
    const top = velocityEmails.sort((a, b) => b[1].length - a[1].length)[0];
    insights.push({
      severity: top[1].length >= 10 ? "high" : "medium",
      title: `${velocityEmails.length} emails with 5+ transactions`,
      detail: `Top: ${top[0]} (${top[1].length} txns) — possible velocity abuse`,
    });
  }

  // 4. High amount outliers
  const amounts = data.map((t) => t.amount);
  const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
  const highAmountTxns = data.filter((t) => t.amount > avg * 3);
  if (highAmountTxns.length > 0) {
    const cbHigh = highAmountTxns.filter((t) => t.status === "chargeback");
    if (cbHigh.length >= 3) {
      insights.push({
        severity: "high",
        title: `${cbHigh.length} high-amount chargebacks`,
        detail: `Chargebacks over ${formatCurrency(avg * 3)} (3x avg of ${formatCurrency(avg)})`,
      });
    }
  }

  // 5. Overall chargeback rate
  const cbRate = data.length > 0 ? chargebacks.length / data.length : 0;
  if (cbRate > 0.05) {
    insights.push({
      severity: cbRate > 0.15 ? "high" : "medium",
      title: `Chargeback rate: ${(cbRate * 100).toFixed(1)}%`,
      detail: `${chargebacks.length} of ${data.length} transactions — ${cbRate > 0.15 ? "critically" : "significantly"} above 5% threshold`,
    });
  }

  return insights.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

const severityStyles = {
  high: "bg-red-50 border-red-200 text-red-900",
  medium: "bg-orange-50 border-orange-200 text-orange-900",
  low: "bg-blue-50 border-blue-200 text-blue-900",
};

const severityDot = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-blue-400",
};

export default function InsightsPanel({ data }: Props) {
  const insights = detectInsights(data);

  if (insights.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Suspicious Patterns Detected ({insights.length})
      </h3>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${severityStyles[insight.severity]}`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-1 inline-block w-2 h-2 rounded-full shrink-0 ${severityDot[insight.severity]}`} />
              <div>
                <p className="text-xs font-semibold">{insight.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{insight.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
