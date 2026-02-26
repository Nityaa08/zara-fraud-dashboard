"use client";

const colorMap: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  chargeback: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function Badge({ value }: { value: string }) {
  const cls = colorMap[value] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${cls}`}>
      {value}
    </span>
  );
}
