"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Tag,
  Plus,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react"
import {
  listRedeemCodes,
  generateRedeemCodes,
  deactivateRedeemCode,
  formatINR,
  type RedeemCodeItem,
} from "@/lib/api/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const STATUS_FILTERS: { label: string; value: string | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Redeemed", value: "redeemed" },
  { label: "Inactive", value: "inactive" },
  { label: "Expired", value: "expired" },
]

function formatDate(iso: string | null): string {
  if (!iso) return "—"
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
  if (s === "active") return "bg-emerald-50 border-emerald-200 text-emerald-700"
  if (s === "redeemed") return "bg-blue-50 border-blue-200 text-blue-700"
  if (s === "expired") return "bg-amber-50 border-amber-200 text-amber-700"
  return "bg-slate-100 border-slate-200 text-slate-600"
}

export default function RedeemCodesPage() {
  const [codes, setCodes] = useState<RedeemCodeItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Generate modal state.
  const [genOpen, setGenOpen] = useState(false)
  const [value, setValue] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [expiry, setExpiry] = useState("")
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listRedeemCodes({
        page,
        page_size: PAGE_SIZE,
        status: statusFilter,
      })
      setCodes(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load redeem codes from the server."
      )
      setCodes([])
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    void fetchCodes()
  }, [fetchCodes])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  )

  function openGenerate() {
    setValue("")
    setQuantity("1")
    setExpiry("")
    setGenError(null)
    setGenOpen(true)
  }

  async function submitGenerate() {
    const v = Number(value)
    const q = Number(quantity)
    if (!Number.isFinite(v) || v <= 0) {
      setGenError("Value must be a positive amount.")
      return
    }
    if (!Number.isInteger(q) || q < 1) {
      setGenError("Quantity must be at least 1.")
      return
    }
    setGenerating(true)
    setGenError(null)
    try {
      await generateRedeemCodes({
        value: v,
        quantity: q,
        // Send an ISO timestamp when an expiry date is chosen.
        expiry: expiry ? new Date(expiry).toISOString() : undefined,
      })
      setGenOpen(false)
      setPage(1)
      await fetchCodes()
    } catch (err) {
      if (err instanceof ApiError) {
        setGenError(
          err.status === 422
            ? err.message || "Invalid generation parameters."
            : err.message
        )
      } else {
        setGenError("Failed to generate codes. Please try again.")
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleDeactivate(code: RedeemCodeItem) {
    setBusyId(code.id)
    setError(null)
    try {
      await deactivateRedeemCode(code.id)
      await fetchCodes()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to deactivate the code."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-indigo-600" />
            Redeem Codes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and manage promotional wallet credits (INR) ·{" "}
            {total.toLocaleString("en-IN")} total
          </p>
        </div>
        <button
          onClick={openGenerate}
          className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 border border-transparent text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Generate Codes
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 overflow-x-auto">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.value
              return (
                <button
                  key={f.label}
                  onClick={() => {
                    setStatusFilter(f.value)
                    setPage(1)
                  }}
                  className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
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
            <span className="text-sm font-medium">Loading redeem codes…</span>
          </div>
        ) : codes.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No redeem codes found"
            description="Generate a batch of promotional codes to get started."
            actionLabel="Generate Codes"
            onAction={openGenerate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Expiry</th>
                  <th className="px-6 py-4">Redeemed</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 tracking-wider bg-slate-100 px-2 py-1 rounded">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {formatINR(code.value)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {formatDate(code.expires_at)}
                    </td>
                    <td className="px-6 py-4">
                      {code.redeemed_at ? (
                        <span className="text-slate-600 text-xs">
                          {formatDate(code.redeemed_at)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          Unclaimed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${statusBadge(
                          code.status
                        )}`}
                      >
                        {code.status === "active" && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {code.status === "redeemed" && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {code.status === "expired" && (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {(code.status === "inactive" ||
                          code.status === "disabled") && (
                          <Ban className="h-3.5 w-3.5" />
                        )}
                        {code.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {code.status === "active" ? (
                        <button
                          onClick={() => handleDeactivate(code)}
                          disabled={busyId === code.id}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          {busyId === code.id ? (
                            "…"
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5" /> Deactivate
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && codes.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>
              Page {page} of {totalPages} · {total.toLocaleString("en-IN")} codes
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

      {/* ── Generate Modal ── */}
      {genOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Generate Redeem Codes</h3>
              <button
                onClick={() => setGenOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                    Value (₹)
                  </label>
                  <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <div className="bg-slate-50 px-3 py-2 border-r border-slate-300 text-slate-500 text-sm font-bold">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="500"
                      className="w-full px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="10"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                  Expiry (optional)
                </label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Leave empty for codes that never expire.
                </p>
              </div>

              {genError ? (
                <div className="p-3 rounded-lg text-sm text-rose-700 bg-rose-50 border border-rose-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{genError}</span>
                </div>
              ) : null}
            </div>
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setGenOpen(false)}
                disabled={generating}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitGenerate}
                disabled={generating}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-70 inline-flex items-center gap-2"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {generating ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
