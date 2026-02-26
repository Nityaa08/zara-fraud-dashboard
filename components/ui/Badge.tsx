"use client";

const colorMap: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  chargeback: "bg-orange-100 text-orange-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export default function Badge({ value }: { value: string }) {
  const cls = colorMap[value] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
}
