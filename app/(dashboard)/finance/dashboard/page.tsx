"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  LineChart,
  TrendingUp,
  Loader2,
  AlertTriangle,
  ListChecks,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TIME_RANGES } from "@/lib/mock-data"
import {
  getFinanceKpis,
  getFinanceSeries,
  getTransactionBreakdown,
  formatKpiValue,
  formatINR,
  type FinanceKPI,
  type FinanceSeries,
  type TransactionBreakdown,
} from "@/lib/api/finance"
import { ApiError } from "@/lib/api/types"

const DEFAULT_RANGE = "1 Month"

// Status → badge colour for the transaction breakdown.
function statusColor(status: string): string {
  const s = status.toLowerCase()
  if (["success", "completed", "paid", "captured"].includes(s))
    return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (["pending", "processing", "initiated"].includes(s))
    return "bg-amber-50 text-amber-700 border-amber-200"
  if (["failed", "refunded", "reversed", "cancelled", "canceled"].includes(s))
    return "bg-rose-50 text-rose-700 border-rose-200"
  return "bg-slate-100 text-slate-700 border-slate-200"
}

export default function FinancialDashboard() {
  const [range, setRange] = useState(DEFAULT_RANGE)
  const [kpis, setKpis] = useState<FinanceKPI[]>([])
  const [series, setSeries] = useState<FinanceSeries | null>(null)
  const [breakdown, setBreakdown] = useState<TransactionBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [k, s, b] = await Promise.all([
        getFinanceKpis(range),
        getFinanceSeries(range),
        getTransactionBreakdown(),
      ])
      setKpis(k)
      setSeries(s)
      setBreakdown(b)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load financial data from the server."
      )
      setKpis([])
      setSeries(null)
      setBreakdown(null)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const chartData = useMemo(
    () => series?.series.map((p) => ({ name: p.name, value: p.value })) ?? [],
    [series]
  )

  const isCurrencySeries = series?.type === "currency"

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LineChart className="h-6 w-6 text-indigo-600" />
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Executive overview of SimulaFly revenue, fees, and collections (INR).
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr}
              onClick={() => setRange(tr)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === tr
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : "bg-white text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl text-sm text-rose-600 bg-rose-50 border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading financial data…</span>
        </div>
      ) : (
        <>
          {/* ── Finance KPIs ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No KPIs available for this period.
              </div>
            ) : (
              kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    {kpi.title}
                    <TrendingUp className="h-4 w-4 text-indigo-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {formatKpiValue(kpi.type, kpi.value)}
                  </div>
                  <div className="text-xs font-medium text-slate-400 mt-2 capitalize">
                    {kpi.type} · {range.toLowerCase()}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Revenue Series Chart ── */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col p-6 h-[420px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {series?.title ?? "Revenue"} Timeline
                  </h3>
                  <p className="text-sm text-slate-500">
                    Aggregated over the last {range.toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
                  {series?.title ?? "Revenue"}
                </div>
              </div>
              <div className="flex-1 min-h-0 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No series data for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="financeMain" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                        dy={10}
                        minTickGap={20}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                        dx={-10}
                        width={70}
                        tickFormatter={(val: number) =>
                          isCurrencySeries
                            ? formatKpiValue("currency", val)
                            : formatKpiValue("number", val)
                        }
                      />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          boxShadow:
                            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{
                          fontWeight: "bold",
                          color: "#0f172a",
                          marginBottom: "8px",
                        }}
                        itemStyle={{ fontWeight: "600", color: "#4f46e5" }}
                        formatter={(val) => {
                          const num =
                            typeof val === "number" ? val : Number(val)
                          return [
                            isCurrencySeries
                              ? formatINR(num)
                              : num.toLocaleString("en-IN"),
                            series?.title ?? "Revenue",
                          ]
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#financeMain)"
                        animationDuration={600}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Transactions by Status ── */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[420px]">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Transactions by Status</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {(breakdown?.total ?? 0).toLocaleString("en-IN")} total
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!breakdown || breakdown.groups.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No transactions recorded.
                  </div>
                ) : (
                  breakdown.groups.map((g) => {
                    const pct =
                      breakdown.total > 0
                        ? Math.round((g.count / breakdown.total) * 100)
                        : 0
                    return (
                      <div key={g.status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${statusColor(
                              g.status
                            )}`}
                          >
                            {g.status}
                          </span>
                          <span className="font-bold text-slate-900">
                            {g.count.toLocaleString("en-IN")}
                            <span className="text-xs font-medium text-slate-400 ml-1">
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
