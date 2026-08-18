"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { FileCheck, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { listAudit, type AuditEntry } from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const outcomeStyles: Record<string, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  failure: "bg-rose-50 border-rose-200 text-rose-700",
  denied: "bg-amber-50 border-amber-200 text-amber-700",
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function PlatformAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState("")
  const [targetType, setTargetType] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [debounced, setDebounced] = useState({ action: "", targetType: "", dateFrom: "", dateTo: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced({ action, targetType, dateFrom, dateTo })
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [action, targetType, dateFrom, dateTo])

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listAudit({
        page,
        page_size: PAGE_SIZE,
        action: debounced.action || undefined,
        target_type: debounced.targetType || undefined,
        date_from: debounced.dateFrom ? new Date(debounced.dateFrom).toISOString() : undefined,
        date_to: debounced.dateTo ? new Date(debounced.dateTo).toISOString() : undefined,
      })
      setEntries(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load the audit log.")
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced])

  useEffect(() => { void fetchEntries() }, [fetchEntries])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  function clearFilters() {
    setAction(""); setTargetType(""); setDateFrom(""); setDateTo("")
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-indigo-600" />
            Platform Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">Immutable record of admin actions · {total.toLocaleString()} entries</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-3 bg-slate-50/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action (e.g. merchants.suspend)" className="pl-9 w-64 bg-white text-sm" />
          </div>
          <Input value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="Target type" className="w-44 bg-white text-sm" />
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40 bg-white text-sm" />
            <label className="text-xs font-semibold text-slate-500">To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40 bg-white text-sm" />
          </div>
          <button onClick={clearFilters} className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2">Clear</button>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading audit entries…</span>
            </div>
          ) : entries.length === 0 ? (
            <EmptyState icon={FileCheck} title="No audit entries" description="No audit entries match your current filters." actionLabel="Clear Filters" onAction={clearFilters} />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-500">{formatTime(entry.created_at)}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{entry.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">{entry.action}</td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="font-medium">{entry.target_type}</div>
                      {entry.target_id ? <div className="text-xs text-slate-400 font-mono">{entry.target_id.slice(0, 12)}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {entry.actor_admin_id ? entry.actor_admin_id.slice(0, 8) : "system"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${outcomeStyles[entry.outcome] ?? "bg-slate-50 border-slate-200 text-slate-600"}`}>
                        {entry.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && entries.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50 shrink-0">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} entries</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt;</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
