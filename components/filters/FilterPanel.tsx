"use client";

import { Filters } from "@/lib/types";

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  countries: string[];
  paymentMethods: string[];
  statuses: string[];
  amountBounds: [number, number];
  dateBounds: [string, string];
  onReset: () => void;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val]
    );
  };

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              selected.includes(opt)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterPanel({
  filters,
  onChange,
  countries,
  paymentMethods,
  statuses,
  amountBounds,
  dateBounds,
  onReset,
}: FilterPanelProps) {
  const update = (partial: Partial<Filters>) =>
    onChange({ ...filters, ...partial });

  const activeCount =
    filters.countries.length +
    filters.paymentMethods.length +
    filters.statuses.length +
    (filters.amountRange[0] > amountBounds[0] || filters.amountRange[1] < amountBounds[1] ? 1 : 0) +
    (filters.dateRange[0] > dateBounds[0] || filters.dateRange[1] < dateBounds[1] ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.highRiskOnly ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Search
        </label>
        <input
          type="text"
          placeholder="Email, ID, card, merchant..."
          value={filters.searchQuery}
          onChange={(e) => update({ searchQuery: e.target.value })}
          className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* High Risk Toggle */}
      <div className="mb-4">
        <button
          onClick={() => update({ highRiskOnly: !filters.highRiskOnly })}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-semibold border transition-colors ${
            filters.highRiskOnly
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-red-600 border-red-300 hover:border-red-500"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          High Risk Only
        </button>
      </div>

      <MultiSelect
        label="Country"
        options={countries}
        selected={filters.countries}
        onChange={(countries) => update({ countries })}
      />

      <MultiSelect
        label="Payment Method"
        options={paymentMethods}
        selected={filters.paymentMethods}
        onChange={(paymentMethods) => update({ paymentMethods })}
      />

      <MultiSelect
        label="Status"
        options={statuses}
        selected={filters.statuses}
        onChange={(statuses) => update({ statuses })}
      />

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Amount Range (USD)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={amountBounds[0]}
            max={filters.amountRange[1]}
            value={filters.amountRange[0]}
            onChange={(e) =>
              update({ amountRange: [Number(e.target.value), filters.amountRange[1]] })
            }
            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <span className="text-gray-400 text-xs">to</span>
          <input
            type="number"
            min={filters.amountRange[0]}
            max={amountBounds[1]}
            value={filters.amountRange[1]}
            onChange={(e) =>
              update({ amountRange: [filters.amountRange[0], Number(e.target.value)] })
            }
            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Date Range
        </label>
        <div className="space-y-1.5">
          <input
            type="date"
            value={filters.dateRange[0]?.slice(0, 10) || ""}
            onChange={(e) =>
              update({ dateRange: [e.target.value ? e.target.value + "T00:00:00.000Z" : dateBounds[0], filters.dateRange[1]] })
            }
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <input
            type="date"
            value={filters.dateRange[1]?.slice(0, 10) || ""}
            onChange={(e) =>
              update({ dateRange: [filters.dateRange[0], e.target.value ? e.target.value + "T23:59:59.999Z" : dateBounds[1]] })
            }
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
