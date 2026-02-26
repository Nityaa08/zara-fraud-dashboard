"use client";

import { useState, useEffect, useMemo } from "react";
import { Transaction, Filters } from "@/lib/types";
import { loadTransactions, getUniqueValues, getAmountRange, getDateRange } from "@/lib/data";
import { applyFilters, computeRiskScore } from "@/lib/utils";
import FilterPanel from "@/components/filters/FilterPanel";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import CountryChart from "@/components/charts/CountryChart";
import PaymentMethodChart from "@/components/charts/PaymentMethodChart";
import AmountChart from "@/components/charts/AmountChart";
import TransactionTable from "@/components/table/TransactionTable";
import TransactionDetail from "@/components/ui/TransactionDetail";
import StatsBar from "@/components/ui/StatsBar";
import InsightsPanel from "@/components/ui/InsightsPanel";

const defaultFilters: Filters = {
  countries: [],
  paymentMethods: [],
  statuses: [],
  amountRange: [0, 1000],
  dateRange: ["", ""],
  searchQuery: "",
  highRiskOnly: false,
};

export default function Dashboard() {
  const [allData, setAllData] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amountBounds, setAmountBounds] = useState<[number, number]>([0, 1000]);
  const [dateBounds, setDateBounds] = useState<[string, string]>(["", ""]);
  const [countries, setCountries] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    loadTransactions()
      .then((data) => {
        // Compute risk scores
        const enriched = data.map((t) => ({ ...t, riskScore: computeRiskScore(t) }));
        setAllData(enriched);
        const ab = getAmountRange(enriched);
        const db = getDateRange(enriched);
        setAmountBounds(ab);
        setDateBounds(db);
        setCountries(getUniqueValues(enriched, "country"));
        setPaymentMethods(getUniqueValues(enriched, "paymentMethod"));
        setStatuses(getUniqueValues(enriched, "status"));
        setFilters({
          ...defaultFilters,
          amountRange: ab,
          dateRange: db,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load transactions. Please refresh.");
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => applyFilters(allData, filters), [allData, filters]);

  const resetFilters = () =>
    setFilters({
      ...defaultFilters,
      amountRange: amountBounds,
      dateRange: dateBounds,
    });

  const handleCountryClick = (country: string) => {
    setFilters((f) => ({
      ...f,
      countries: f.countries.includes(country)
        ? f.countries.filter((c) => c !== country)
        : [...f.countries, country],
    }));
  };

  const handleMethodClick = (method: string) => {
    setFilters((f) => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(method)
        ? f.paymentMethods.filter((m) => m !== method)
        : [...f.paymentMethods, method],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-sm text-center">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Transaction Pattern Explorer
            </h1>
            <p className="text-xs text-gray-500">
              Zara eShop &mdash; Fraud Risk Analytics Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">
              {filtered.length} of {allData.length} transactions
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-5 space-y-5">
        <StatsBar data={filtered} />

        <div className="flex gap-5">
          <div className="w-64 shrink-0">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              countries={countries}
              paymentMethods={paymentMethods}
              statuses={statuses}
              amountBounds={amountBounds}
              dateBounds={dateBounds}
              onReset={resetFilters}
            />
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TimeSeriesChart data={filtered} />
            <CountryChart data={filtered} onClickCountry={handleCountryClick} />
            <PaymentMethodChart data={filtered} onClickMethod={handleMethodClick} />
            <AmountChart data={filtered} />
          </div>
        </div>

        <InsightsPanel data={filtered} />

        <TransactionTable data={filtered} onSelect={setSelected} />
      </main>

      <TransactionDetail
        transaction={selected}
        onClose={() => setSelected(null)}
        allTransactions={allData}
        onSelectRelated={setSelected}
      />
    </div>
  );
}
