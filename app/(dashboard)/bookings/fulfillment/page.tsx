"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { Truck, Package, Clock, CheckCircle2, Loader2 } from "lucide-react"
import {
  listFulfillment,
  updateFulfillment,
  type BookingListItem,
  type FulfillmentStatus,
} from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 50

const FULFILLMENT_OPTIONS: FulfillmentStatus[] = ["pending", "in_progress", "fulfilled", "cancelled"]

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
  return `₹${(Number(value) || 0).toLocaleString()}`
}

export default function FulfillmentDashboard() {
  const [items, setItems] = useState<BookingListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listFulfillment({ page: 1, page_size: PAGE_SIZE, sort: "-created_at" })
      setItems(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load fulfillment queue.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchQueue() }, [fetchQueue])

  async function changeStatus(booking: BookingListItem, next: FulfillmentStatus) {
    if (next === booking.fulfillment_status) return
    setBusyId(booking.id)
    try {
      await updateFulfillment(booking.id, { fulfillment_status: next })
      await fetchQueue()
    } catch {
      // surfaced on refetch
    } finally {
      setBusyId(null)
    }
  }

  const stats = useMemo(() => ({
    pending: items.filter((i) => i.fulfillment_status === "pending").length,
    inProgress: items.filter((i) => i.fulfillment_status === "in_progress").length,
    fulfilled: items.filter((i) => i.fulfillment_status === "fulfilled").length,
  }), [items])

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Booking Fulfillment</h1>
          <p className="text-sm text-slate-500 mt-1">Fulfillment queue and status transitions · {total.toLocaleString()} total</p>
        </div>
        <Link href="/bookings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">← Back to Bookings</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "In Queue", val: total.toLocaleString(), icon: Truck, color: "text-blue-700 bg-blue-50" },
          { label: "Pending (page)", val: stats.pending.toString(), icon: Clock, color: "text-slate-700 bg-slate-100" },
          { label: "In Progress (page)", val: stats.inProgress.toString(), icon: Package, color: "text-indigo-700 bg-indigo-50" },
          { label: "Fulfilled (page)", val: stats.fulfilled.toString(), icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50" },
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {error ? <div className="p-4 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div> : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm font-medium">Loading queue…</span>
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Truck} title="Queue is empty" description="There are no bookings pending fulfillment." />
        ) : (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900 text-sm">
                    <Link href={`/bookings/${b.id}`} className="hover:text-indigo-600">{b.id.slice(0, 8)}</Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{b.customer_name ?? "—"}</TableCell>
                  <TableCell className="text-sm text-slate-600">{b.merchant_name ?? "—"}</TableCell>
                  <TableCell className="text-sm font-bold text-indigo-700">{inr(Number(b.amount))}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[11px] font-bold capitalize ${fulfillmentStyles[b.fulfillment_status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{label(b.fulfillment_status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {busyId === b.id ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
                      <Select value={b.fulfillment_status} onValueChange={(v) => changeStatus(b, v as FulfillmentStatus)}>
                        <SelectTrigger className="w-[160px] h-9 text-sm" disabled={busyId === b.id}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FULFILLMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt} className="capitalize">{label(opt)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
