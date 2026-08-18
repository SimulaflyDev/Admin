"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Headset, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Search, Loader2, ArrowRight,
} from "lucide-react"
import {
  listConsumerTickets,
  type SupportTicketListItem,
  type SupportTicketStatus,
  type SupportTicketPriority,
} from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const priorityStyles: Record<string, string> = {
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
}
const statusStyles: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-purple-100 text-purple-800 border-purple-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

function timeAgo(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function ConsumerSupportCenter() {
  const [tickets, setTickets] = useState<SupportTicketListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [status, setStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listConsumerTickets({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        sort: "-created_at",
        status: status === "all" ? undefined : (status as SupportTicketStatus),
        priority: priority === "all" ? undefined : (priority as SupportTicketPriority),
      })
      setTickets(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load consumer tickets.")
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced, status, priority])

  useEffect(() => { void fetchTickets() }, [fetchTickets])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  const stats = useMemo(() => ({
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    slaBreached: tickets.filter((t) => t.sla_breached).length,
  }), [tickets])

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Consumer Support Center</h1>
          <p className="text-sm text-slate-500 mt-1">Consumer-originated tickets · {total.toLocaleString()} total</p>
        </div>
        <Link href="/support" className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
          <Headset className="h-4 w-4" /> All Support
        </Link>
      </div>

      {/* KPIs derived from the current page */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open (page)", val: stats.open.toString(), icon: AlertTriangle, color: "text-blue-700 bg-blue-50" },
          { label: "Pending (page)", val: stats.pending.toString(), icon: Clock, color: "text-purple-700 bg-purple-50" },
          { label: "Resolved (page)", val: stats.resolved.toString(), icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50" },
          { label: "SLA Breaches (page)", val: stats.slaBreached.toString(), icon: ShieldAlert, color: "text-red-700 bg-red-50" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${k.color} shrink-0`}><k.icon className="h-6 w-6" /></div>
            <div>
              <div className="text-sm font-semibold text-slate-600">{k.label}</div>
              <div className="text-2xl font-bold text-slate-900">{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/50">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search subject…" className="pl-9 bg-white border-slate-200 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1) } }}>
            <SelectTrigger className="w-[150px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => { if (v) { setPriority(v); setPage(1) } }}>
            <SelectTrigger className="w-[150px] text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading tickets…</span>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState icon={Headset} title="No consumer tickets" description="No consumer tickets match your current filters." actionLabel="Clear Search" onAction={() => { setSearch(""); setStatus("all"); setPriority("all") }} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900 text-sm">
                      {ticket.id.slice(0, 8)}
                      {ticket.sla_breached ? (
                        <Badge variant="outline" className="ml-2 text-[10px] font-bold uppercase bg-rose-100 text-rose-700 border-rose-200">SLA</Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-slate-800 max-w-[280px] truncate">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${priorityStyles[ticket.priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${statusStyles[ticket.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{ticket.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{timeAgo(ticket.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/support`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1">
                        Open <ArrowRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} tickets</span>
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
