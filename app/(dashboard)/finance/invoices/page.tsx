"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  FileText,
  Search,
  Loader2,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import {
  listInvoices,
  markInvoicePaid,
  formatINR,
  type InvoiceListItem,
} from "@/lib/api/finance"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const STATUS_FILTERS: { label: string; value: string | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" },
]

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function statusBadge(status: string): string {
  const s = status.toLowerCase()
  if (s === "paid") return "bg-emerald-50 border-emerald-200 text-emerald-700"
  if (s === "unpaid") return "bg-amber-50 border-amber-200 text-amber-700"
  return "bg-slate-100 border-slate-200 text-slate-700"
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listInvoices({
        page,
        page_size: PAGE_SIZE,
        status: statusFilter,
        search: debounced || undefined,
      })
      setInvoices(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load invoices from the server."
      )
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, debounced])

  useEffect(() => {
    void fetchInvoices()
  }, [fetchInvoices])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  )

  async function handleMarkPaid(inv: InvoiceListItem) {
    setBusyId(inv.id)
    setError(null)
    try {
      await markInvoicePaid(inv.id)
      await fetchInvoices()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to mark the invoice as paid."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Merchant invoices (INR) · {total.toLocaleString("en-IN")} total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search invoice or merchant…"
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.value
              return (
                <button
                  key={f.label}
                  onClick={() => {
                    setStatusFilter(f.value)
                    setPage(1)
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading invoices…</span>
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices found"
            description="No invoices match your current filters."
            actionLabel={statusFilter || search ? "Clear filters" : undefined}
            onAction={
              statusFilter || search
                ? () => {
                    setStatusFilter(undefined)
                    setSearch("")
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Issued</th>
                  <th className="px-6 py-4">Due</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                      {inv.number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">
                          {inv.merchant_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(inv.issue_date)}
                    </td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        inv.overdue ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      {inv.overdue && (
                        <AlertTriangle className="inline-block h-3 w-3 mr-1" />
                      )}
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {formatINR(inv.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${statusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status === "paid" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                          {inv.status}
                        </span>
                        {inv.overdue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border border-rose-200 bg-rose-50 text-rose-700 uppercase tracking-wider">
                            Overdue
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === "paid" ? (
                        <span className="text-xs font-medium text-slate-400">
                          Settled
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkPaid(inv)}
                          disabled={busyId === inv.id}
                          className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          {busyId === inv.id ? "…" : "Mark Paid"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>
              Page {page} of {totalPages} · {total.toLocaleString("en-IN")} invoices
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                &lt;
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
