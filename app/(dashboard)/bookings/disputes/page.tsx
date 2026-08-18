"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertTriangle, CheckCircle2, Clock, Users, Store, Wallet, ShoppingCart, Loader2 } from "lucide-react"
import { listDisputes, resolveDispute, type BookingListItem } from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 50

const disputeStatusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  none: "bg-slate-100 text-slate-600 border-slate-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

function inr(value: number): string {
  return `₹${(Number(value) || 0).toLocaleString()}`
}
function ago(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) } catch { return iso }
}

export default function DisputeCenter() {
  const [disputes, setDisputes] = useState<BookingListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<BookingListItem | null>(null)
  const [resolution, setResolution] = useState("")
  const [busy, setBusy] = useState(false)

  const fetchDisputes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listDisputes({ page: 1, page_size: PAGE_SIZE, sort: "-created_at" })
      setDisputes(res.items)
      setTotal(res.total)
      setSelected((prev) => prev ? res.items.find((d) => d.id === prev.id) ?? res.items[0] ?? null : res.items[0] ?? null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load disputes.")
      setDisputes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchDisputes() }, [fetchDisputes])

  async function resolve() {
    if (!selected || !resolution.trim()) return
    setBusy(true)
    try {
      await resolveDispute(selected.id, { resolution: resolution.trim(), status: "resolved" })
      setResolution("")
      await fetchDisputes()
    } catch {
      // surfaced on refetch
    } finally {
      setBusy(false)
    }
  }

  const openCount = disputes.filter((d) => d.dispute_status === "open").length
  const valueAtRisk = disputes.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Booking Disputes</h1>
          <p className="text-sm text-slate-500 mt-1">Resolve booking disputes · {total.toLocaleString()} total</p>
        </div>
        <Link href="/bookings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">← Back to Bookings</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Open Disputes", val: openCount.toString(), icon: AlertTriangle, color: "text-red-700 bg-red-50" },
          { label: "Total Listed", val: total.toLocaleString(), icon: Clock, color: "text-purple-700 bg-purple-50" },
          { label: "Value at Risk (page)", val: inr(valueAtRisk), icon: Wallet, color: "text-amber-700 bg-amber-50" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${k.color} shrink-0`}><k.icon className="h-5 w-5" /></div>
            <div>
              <div className="text-xs text-slate-500">{k.label}</div>
              <div className="text-xl font-bold text-slate-900">{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      {error ? <div className="p-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">{error}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm font-medium">Loading disputes…</span>
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No disputes" description="There are no bookings with an open dispute right now." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* List */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100 text-sm font-semibold text-slate-700">All Disputes ({disputes.length})</div>
            <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {disputes.map((d) => (
                <button key={d.id} onClick={() => setSelected(d)} className={`w-full text-left p-3 hover:bg-slate-50 transition-colors ${selected?.id === d.id ? "bg-slate-50 border-l-2 border-l-slate-900" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{d.id.slice(0, 8)}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${disputeStatusStyles[d.dispute_status] ?? "bg-slate-100 text-slate-600"}`}>{d.dispute_status}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{d.customer_name ?? "—"} · {d.merchant_name ?? "—"}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs font-semibold text-indigo-700">{inr(Number(d.amount))}</span>
                    <span className="text-[10px] text-slate-400">{ago(d.created_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="md:col-span-3 space-y-4">
            {selected ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selected.id.slice(0, 8)}</h2>
                    <p className="text-sm text-slate-500">Filed {ago(selected.created_at)}</p>
                  </div>
                  <Badge variant="outline" className={`capitalize ${disputeStatusStyles[selected.dispute_status] ?? "bg-slate-100 text-slate-600"}`}>{selected.dispute_status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { icon: Users, label: "Customer", val: selected.customer_name ?? "—" },
                    { icon: Store, label: "Merchant", val: selected.merchant_name ?? "—" },
                    { icon: ShoppingCart, label: "Booking", val: selected.id.slice(0, 8) },
                    { icon: Wallet, label: "Amount", val: inr(Number(selected.amount)) },
                  ].map((i) => (
                    <div key={i.label} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <i.icon className="h-4 w-4 text-slate-500 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">{i.label}</div>
                        <div className="text-sm font-semibold text-slate-900">{i.val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {selected.dispute_status !== "resolved" ? (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Resolution</div>
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                      rows={3}
                      placeholder="Describe the resolution (required)…"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={resolve}
                        disabled={busy || !resolution.trim()}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 px-4 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Resolve Dispute
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> Dispute resolved.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
