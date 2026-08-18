"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, BarChart3 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { TIME_RANGES, formatValue } from "@/lib/mock-data"
import type { AnalyticsView } from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const typeAccent: Record<string, string> = {
  currency: "text-emerald-600 bg-emerald-50",
  percentage: "text-indigo-600 bg-indigo-50",
  number: "text-blue-600 bg-blue-50",
}

interface AnalyticsViewPageProps {
  title: string
  subtitle: string
  fetcher: (range?: string) => Promise<AnalyticsView>
  defaultRange?: string
}

export function AnalyticsViewPage({
  title,
  subtitle,
  fetcher,
  defaultRange = "1 Month",
}: AnalyticsViewPageProps) {
  const [range, setRange] = useState(defaultRange)
  const [data, setData] = useState<AnalyticsView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher(range)
      setData(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load analytics.")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [fetcher, range])

  useEffect(() => { void load() }, [load])

  const metrics = data?.metrics ?? []

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Time range selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-end gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
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
        <div className="p-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading metrics…</span>
        </div>
      ) : metrics.length === 0 ? (
        <EmptyState icon={BarChart3} title="No metrics" description="No analytics metrics were returned for this time range." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{m.title}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${typeAccent[m.type] ?? "text-slate-600 bg-slate-100"}`}>
                  {m.type}
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">
                  {formatValue(m.type, m.value)}
                </span>
                {m.note ? <p className="text-xs text-slate-400 mt-2">{m.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {data ? (
        <p className="text-xs text-slate-400">Window: {data.range} · {metrics.length} metrics</p>
      ) : null}
    </div>
  )
}
