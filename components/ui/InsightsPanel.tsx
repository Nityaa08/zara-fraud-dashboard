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
  if (data.length === 0) return insights;

  const chargebacks = data.filter((t) => t.status === "chargeback");

  // 1. Chargeback clustering by country + time
  if (chargebacks.length > 0) {
    const byCountry = groupBy(chargebacks, (t) => t.country);
    for (const [country, txns] of Object.entries(byCountry)) {
      if (txns.length >= 5) {
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
            detail: `Within ${hourSpan.toFixed(1)}h window, avg ${formatCurrency(avgAmt)}, via ${methods.join("/")}`,
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
      detail: `${cbMismatches.length} are chargebacks — possible cross-border fraud`,
    });
  }

  // 3. Email velocity
  const byEmail = groupBy(data, (t) => t.customerEmail);
  const velocityEmails = Object.entries(byEmail).filter(([, txns]) => txns.length >= 5);
  if (velocityEmails.length > 0) {
    const top = velocityEmails.sort((a, b) => b[1].length - a[1].length)[0];
    insights.push({
      severity: top[1].length >= 10 ? "high" : "medium",
      title: `${velocityEmails.length} emails with 5+ transactions`,
      detail: `Top: ${top[0]} (${top[1].length} txns)`,
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
        detail: `Over ${formatCurrency(avg * 3)} (3x avg of ${formatCurrency(avg)})`,
      });
    }
  }

  // 5. Overall chargeback rate
  const cbRate = chargebacks.length / data.length;
  if (cbRate > 0.05) {
    insights.push({
      severity: cbRate > 0.15 ? "high" : "medium",
      title: `Chargeback rate: ${(cbRate * 100).toFixed(1)}%`,
      detail: `${chargebacks.length} of ${data.length} — above 5% threshold`,
    });
  }

  return insights.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}

const severityConfig = {
  high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", dot: "bg-red-500", icon: "text-red-500" },
  medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", dot: "bg-amber-400", icon: "text-amber-500" },
  low: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", dot: "bg-blue-400", icon: "text-blue-500" },
};

export default function InsightsPanel({ data }: Props) {
  const insights = detectInsights(data);

  if (insights.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Suspicious Patterns</h3>
          <p className="text-[11px] text-slate-400">{insights.length} anomalies detected in current view</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {insights.map((insight, i) => {
          const cfg = severityConfig[insight.severity];
          return (
            <div
              key={i}
              className={`rounded-lg border p-3.5 ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 inline-block w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${cfg.text}`}>{insight.title}</p>
                  <p className={`text-[11px] ${cfg.text} opacity-70 mt-0.5 leading-relaxed`}>{insight.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
