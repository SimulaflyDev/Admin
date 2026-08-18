"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Search, Clock, CheckCircle2, AlertCircle, Truck, Banknote, XCircle, FileText, Loader2,
} from "lucide-react"
import { listBookings, type BookingListItem } from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const statusStyles: Record<string, string> = {
  pending_merchant_contact: "bg-amber-100 text-amber-800 border-amber-200",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}
const disputeStyles: Record<string, string> = {
  none: "bg-slate-100 text-slate-500 border-slate-200",
  open: "bg-rose-100 text-rose-800 border-rose-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
}
const fulfillmentStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  fulfilled: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

function label(value: string): string {
  return value.replace(/_/g, " ")
}

function inr(value: number): string {
  const n = Number(value) || 0
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n.toLocaleString()}`
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function BookingDashboard() {
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [status, setStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listBookings({
        page,
        page_size: PAGE_SIZE,
        sort: "-created_at",
        status: status === "all" ? undefined : status,
        // The merchant filter is a UUID match; surface it through the search box
        // only when it looks like a UUID, otherwise leave merchant unfiltered.
        merchant_id: /^[0-9a-fA-F-]{36}$/.test(debounced) ? debounced : undefined,
      })
      setBookings(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bookings.")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced, status])

  useEffect(() => { void fetchBookings() }, [fetchBookings])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  // Honest counts derived from the loaded page.
  const stats = useMemo(() => ({
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    pending: bookings.filter((b) => b.status === "pending_merchant_contact").length,
    disputes: bookings.filter((b) => b.dispute_status === "open").length,
    value: bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
  }), [bookings])

  const openDisputes = stats.disputes

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Booking Operations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage bookings across the network · {total.toLocaleString()} total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/bookings/disputes" className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100">
            <AlertCircle className="h-4 w-4" /> Disputes
            {openDisputes > 0 ? <span className="ml-1 bg-amber-200 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{openDisputes}</span> : null}
          </Link>
          <Link href="/bookings/fulfillment" className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium bg-white shadow-sm hover:bg-slate-50">
            <Truck className="h-4 w-4" /> Fulfillment
          </Link>
        </div>
      </div>

      {/* KPI strip — derived from current page (total is real platform total) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: "Total Bookings", val: total.toLocaleString(), icon: FileText, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Completed (page)", val: stats.completed.toString(), icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Cancelled (page)", val: stats.cancelled.toString(), icon: XCircle, color: "text-red-700", bg: "bg-red-50" },
          { label: "Pending (page)", val: stats.pending.toString(), icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Open Disputes (page)", val: stats.disputes.toString(), icon: AlertCircle, color: "text-rose-700", bg: "bg-rose-50" },
          { label: "Value (page)", val: inr(stats.value), icon: Banknote, color: "text-indigo-700", bg: "bg-indigo-50" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${k.bg}`}><k.icon className={`h-4 w-4 ${k.color}`} /></div>
              <div className="text-xs font-bold text-slate-500 uppercase">{k.label}</div>
            </div>
            <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Filter by merchant ID (UUID)…" className="pl-9 bg-slate-50 border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1) } }}>
            <SelectTrigger className="w-[200px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending_merchant_contact">Pending Merchant Contact</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading bookings…</span>
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState icon={FileText} title="No bookings found" description="No bookings match your current filters." actionLabel="Clear Filters" onAction={() => { setSearch(""); setStatus("all") }} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dispute</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-slate-900">{b.id.slice(0, 8)}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatDate(b.created_at)}</div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-700">{b.customer_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-slate-700">{b.merchant_name ?? "—"}</TableCell>
                    <TableCell className="text-sm font-bold text-indigo-700">{inr(Number(b.amount))}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] font-bold capitalize ${statusStyles[b.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{label(b.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] font-bold capitalize ${disputeStyles[b.dispute_status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{label(b.dispute_status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] font-bold capitalize ${fulfillmentStyles[b.fulfillment_status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{label(b.fulfillment_status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/bookings/${b.id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">View</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} bookings</span>
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
