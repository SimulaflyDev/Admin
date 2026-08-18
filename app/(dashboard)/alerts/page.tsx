"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, Bot, CheckCircle2, FileText, Loader2, ShieldAlert, Wallet } from "lucide-react"
import {
  getAlertCounters,
  listAlertItems,
  resolveAlertItem,
} from "@/lib/api/admin"
import type { AlertCategory, AlertCounters, AlertItem } from "@/lib/api/types"

type CategoryDef = {
  id: AlertCategory
  label: string
  counterKey: keyof AlertCounters
  icon: React.ElementType
  accent: string
}

const CATEGORIES: CategoryDef[] = [
  { id: "fraud", label: "Fraud Alerts", counterKey: "fraudAlerts", icon: ShieldAlert, accent: "text-red-600" },
  { id: "overdue_invoices", label: "Overdue Invoices", counterKey: "overdueInvoices", icon: FileText, accent: "text-amber-600" },
  { id: "sla_breaches", label: "SLA Breaches", counterKey: "slaBreaches", icon: AlertTriangle, accent: "text-rose-600" },
  { id: "failed_generations", label: "Failed Generations", counterKey: "failedGenerations", icon: Bot, accent: "text-purple-600" },
  { id: "low_balance_wallets", label: "Low-Balance Wallets", counterKey: "walletsBelow100", icon: Wallet, accent: "text-blue-600" },
]

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function AlertCenter() {
  const [counters, setCounters] = useState<AlertCounters | null>(null)
  const [selected, setSelected] = useState<AlertCategory>("fraud")
  const [items, setItems] = useState<AlertItem[]>([])
  const [loadingCounters, setLoadingCounters] = useState(true)
  const [loadingItems, setLoadingItems] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refreshCounters = useCallback(async () => {
    setLoadingCounters(true)
    try {
      setCounters(await getAlertCounters())
    } catch {
      setError("Failed to load alert counters.")
    } finally {
      setLoadingCounters(false)
    }
  }, [])

  const refreshItems = useCallback(async (category: AlertCategory) => {
    setLoadingItems(true)
    setError(null)
    try {
      const res = await listAlertItems(category, 1, 50)
      setItems(res.items)
    } catch {
      setError("Failed to load alert items.")
      setItems([])
    } finally {
      setLoadingItems(false)
    }
  }, [])

  useEffect(() => {
    void refreshCounters()
  }, [refreshCounters])

  useEffect(() => {
    void refreshItems(selected)
  }, [selected, refreshItems])

  async function handleResolve(item: AlertItem) {
    setBusyId(item.id)
    try {
      await resolveAlertItem(selected, item.id)
      await Promise.all([refreshCounters(), refreshItems(selected)])
    } catch {
      setError("Could not resolve this item. It may already be resolved.")
    } finally {
      setBusyId(null)
    }
  }

  const activeDef = CATEGORIES.find((c) => c.id === selected)!

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alert &amp; Incident Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Live operational alerts across fraud, billing, support, AI, and wallet risk
          </p>
        </div>
        <button
          onClick={() => { void refreshCounters(); void refreshItems(selected) }}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Loader2 className={`h-4 w-4 ${loadingCounters ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3">{error}</div>
      )}

      {/* Counter cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const count = counters ? counters[c.counterKey] : 0
          const active = selected === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3 text-left transition-colors ${
                active ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
              }`}
            >
              <Icon className={`h-5 w-5 ${c.accent}`} />
              <div>
                <div className="text-3xl font-black text-slate-900">
                  {loadingCounters ? "…" : count}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{c.label}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Items for selected category */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <activeDef.icon className={`h-4 w-4 ${activeDef.accent}`} />
          <h3 className="font-bold text-slate-900">{activeDef.label}</h3>
        </div>

        {loadingItems ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            No active items in this category.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900">{item.title}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                    <span className="font-mono">{item.id.slice(0, 8)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{formatTime(item.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleResolve(item)}
                  disabled={busyId === item.id}
                  className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {busyId === item.id ? "Resolving…" : "Resolve"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
